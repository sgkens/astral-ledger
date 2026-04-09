param(
    [int]$Limit = 16,
    [switch]$GenerateSql,
    [switch]$ExecuteWithWrangler,
    [string]$DatabaseName = 'astral-ledger'
)

Import-Module "$PSScriptRoot/../AstralLedger.PowerShell/AstralLedger.PowerShell.psd1" -Force

Invoke-StellarisIngest -EntityType Ethic -Limit $Limit -GenerateSql:$GenerateSql -ExecuteWithWrangler:$ExecuteWithWrangler -DatabaseName $DatabaseName
