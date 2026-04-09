param(
    [int]$Limit = 12,
    [switch]$GenerateSql,
    [switch]$ExecuteWithWrangler,
    [string]$DatabaseName = 'astral-ledger'
)

Import-Module "$PSScriptRoot/../AstralLedger.PowerShell/AstralLedger.PowerShell.psd1" -Force

Invoke-StellarisIngest -EntityType Authority -Limit $Limit -GenerateSql:$GenerateSql -ExecuteWithWrangler:$ExecuteWithWrangler -DatabaseName $DatabaseName
