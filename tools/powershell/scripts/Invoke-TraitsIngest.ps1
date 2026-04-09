Import-Module "$PSScriptRoot/../AstralLedger.PowerShell/AstralLedger.PowerShell.psd1" -Force

$page = Get-StellarisWikiPage -Url 'https://stellaris.paradoxwikis.com/Traits' -OutFile '.cache/traits.html'
$candidate = Get-StellarisEntityIndex -EntityType Trait -Html $page.Html
$result = ConvertFrom-StellarisWikiHtml -EntityType Trait -Html $page.Html -SourceUrl $candidate.PageUrl

$result | ConvertTo-Json -Depth 8 | Set-Content -Path '.cache/traits.normalized.json' -Encoding UTF8
Write-AstralLog -Stage publish -Message 'Wrote .cache/traits.normalized.json'
