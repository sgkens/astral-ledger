@{
    RootModule = 'AstralLedger.PowerShell.psm1'
    ModuleVersion = '0.5.0'
    GUID = '8c1ac3ea-d6be-4cdc-afb7-f44a73f55aa7'
    Author = 'OpenAI'
    CompanyName = 'Astral Ledger'
    Description = 'PowerShell ingest scaffolding for Astral Ledger.'
    PowerShellVersion = '7.3'
    FunctionsToExport = @(
        'Get-StellarisWikiPage',
        'Get-StellarisEntityIndex',
        'ConvertFrom-StellarisWikiHtml',
        'Save-StellarisSourceSnapshot',
        'Update-StellarisCodex',
        'Write-AstralLog'
    )
}
