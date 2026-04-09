@{
    RootModule = 'AstralLedger.PowerShell.psm1'
    ModuleVersion = '0.2.0'
    GUID = 'a418d02f-69d1-4495-b7e1-f059a0f32bd2'
    Author = 'OpenAI'
    CompanyName = 'Astral Ledger'
    Copyright = '(c) Astral Ledger'
    Description = 'PowerShell ingest scaffolding for Astral Ledger.'
    PowerShellVersion = '7.3'
    FunctionsToExport = @(
        'Get-StellarisWikiPage',
        'Get-StellarisEntityIndex',
        'ConvertFrom-StellarisWikiHtml',
        'Write-AstralLog'
    )
}
