@{
    RootModule = 'AstralLedger.PowerShell.psm1'
    ModuleVersion = '0.1.0'
    GUID = '5c1ff0bf-fd80-4f59-a0b4-3a4207df1eab'
    Author = 'OpenAI'
    CompanyName = 'Astral Ledger'
    Copyright = '(c) Astral Ledger'
    Description = 'PowerShell ingest scaffolding for Astral Ledger.'
    PowerShellVersion = '7.3'
    FunctionsToExport = @(
        'Get-StellarisWikiPage',
        'Get-StellarisEntityIndex',
        'ConvertFrom-StellarisWikiHtml'
    )
}
