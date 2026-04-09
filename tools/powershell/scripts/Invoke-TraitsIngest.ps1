param(
    [int]$Limit = 25
)

Import-Module "$PSScriptRoot/../AstralLedger.PowerShell/AstralLedger.PowerShell.psd1" -Force

$page = Get-StellarisWikiPage -Url 'https://stellaris.paradoxwikis.com/Traits' -OutFile '.cache/traits.html'
$snapshot = Save-StellarisSourceSnapshot -Url $page.Url -Html $page.Html -ContentHash $page.ContentHash

$candidates = @(Get-StellarisEntityIndex -EntityType Trait -Html $page.Html)

if ($Limit -gt 0) {
    $candidates = $candidates | Select-Object -First $Limit
}

$records = foreach ($candidate in $candidates) {
    ConvertFrom-StellarisWikiHtml `
        -EntityType Trait `
        -Html $page.Html `
        -SourceUrl $candidate.PageUrl `
        -Slug $candidate.Slug `
        -Name $candidate.Name
}

$normalized = [pscustomobject]@{
    sourceSnapshot = $snapshot
    entityType     = 'trait'
    generatedAt    = (Get-Date).ToUniversalTime().ToString('o')
    count          = @($records).Count
    items          = @($records)
}

if (-not (Test-Path '.cache')) {
    $null = New-Item -ItemType Directory -Path '.cache' -Force
}

$normalized | ConvertTo-Json -Depth 10 | Set-Content -Path '.cache/traits.normalized.json' -Encoding UTF8
Write-AstralLog -Stage publish -Message "Wrote .cache/traits.normalized.json with $($normalized.count) parsed traits"
