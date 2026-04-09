function Invoke-StellarisIngest {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)]
        [ValidateSet('Trait','Ethic','Authority')]
        [string]$EntityType,

        [int]$Limit = 25,

        [switch]$GenerateSql,

        [switch]$ExecuteWithWrangler,

        [string]$DatabaseName = 'astral-ledger'
    )

    $pageMap = @{
        Trait     = 'https://stellaris.paradoxwikis.com/Traits'
        Ethic     = 'https://stellaris.paradoxwikis.com/Ethics'
        Authority = 'https://stellaris.paradoxwikis.com/Government'
    }

    $entityTypeLower = $EntityType.ToLowerInvariant()
    $cacheName = switch ($EntityType) {
        'Trait' { 'traits' }
        'Ethic' { 'ethics' }
        'Authority' { 'authorities' }
    }

    $pageUrl = $pageMap[$EntityType]
    $page = Get-StellarisWikiPage -Url $pageUrl -OutFile ".cache/$cacheName.html"
    $snapshot = Save-StellarisSourceSnapshot -Url $page.Url -Html $page.Html -ContentHash $page.ContentHash

    $candidates = @(Get-StellarisEntityIndex -EntityType $EntityType -Html $page.Html)
    if ($Limit -gt 0) {
        $candidates = $candidates | Select-Object -First $Limit
    }

    $records = foreach ($candidate in $candidates) {
        ConvertFrom-StellarisWikiHtml `
            -EntityType $EntityType `
            -Html $page.Html `
            -SourceUrl $candidate.PageUrl `
            -Slug $candidate.Slug `
            -Name $candidate.Name
    }

    $normalized = [pscustomobject]@{
        sourceSnapshot = $snapshot
        entityType     = $entityTypeLower
        generatedAt    = (Get-Date).ToUniversalTime().ToString('o')
        count          = @($records).Count
        items          = @($records)
    }

    if (-not (Test-Path '.cache')) {
        $null = New-Item -ItemType Directory -Path '.cache' -Force
    }

    $normalizedJsonPath = ".cache/$cacheName.normalized.json"
    $normalized | ConvertTo-Json -Depth 12 | Set-Content -Path $normalizedJsonPath -Encoding UTF8
    Write-AstralLog -Stage publish -Message "Wrote $normalizedJsonPath with $($normalized.count) parsed $cacheName"

    if ($GenerateSql -or $ExecuteWithWrangler) {
        Update-StellarisCodex -InputObject $normalized -SqlOutputPath ".cache/$cacheName.upsert.sql" -DatabaseName $DatabaseName -ExecuteWithWrangler:$ExecuteWithWrangler
    }

    return $normalized
}
