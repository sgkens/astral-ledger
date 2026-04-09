Describe 'ConvertFrom-StellarisWikiHtml' {
    It 'returns a normalized starter object for traits' {
        Import-Module "$PSScriptRoot/../AstralLedger.PowerShell.psd1" -Force
        $result = ConvertFrom-StellarisWikiHtml -EntityType Trait -Html '<html></html>' -SourceUrl 'https://stellaris.paradoxwikis.com/Traits'
        $result.EntityType | Should -Be 'trait'
        $result.Slug | Should -Be 'intelligent'
        $result.Effects.Count | Should -BeGreaterThan 0
    }
}
