param(
    [int]$Limit = 25,
    [switch]$GenerateSql,
    [switch]$ExecuteWithWrangler,
    [string]$DatabaseName = 'astral-ledger'
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

$normalizedJsonPath = '.cache/traits.normalized.json'
$normalized | ConvertTo-Json -Depth 10 | Set-Content -Path $normalizedJsonPath -Encoding UTF8
Write-AstralLog -Stage publish -Message "Wrote $normalizedJsonPath with $($normalized.count) parsed traits"

if ($GenerateSql -or $ExecuteWithWrangler) {
    Update-StellarisCodex -InputObject $normalized -SqlOutputPath '.cache/traits.upsert.sql' -DatabaseName $DatabaseName -ExecuteWithWrangler:$ExecuteWithWrangler
}
