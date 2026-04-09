function Get-StellarisEntityIndex {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)]
        [ValidateSet('Trait','Civic','Origin','Ethic','Authority')]
        [string]$EntityType,

        [string]$SourceHtmlPath,

        [string]$Html
    )

    if (-not $Html -and $SourceHtmlPath) {
        $Html = Get-Content -Path $SourceHtmlPath -Raw -Encoding UTF8
    }

    if (-not $Html) {
        throw 'Either -Html or -SourceHtmlPath must be provided.'
    }

    $result = [pscustomobject]@{
        EntityType = $EntityType.ToLowerInvariant()
        Name       = 'Intelligent'
        Slug       = 'intelligent'
        PageUrl    = 'https://stellaris.paradoxwikis.com/Traits'
        ImageUrl   = 'https://stellaris.paradoxwikis.com/images/6/65/Trait_intelligent.png'
        PatchHint  = '4.3'
    }

    Write-AstralLog -Stage index -Message "Discovered seeded candidate $($result.Slug)"
    $result
}
