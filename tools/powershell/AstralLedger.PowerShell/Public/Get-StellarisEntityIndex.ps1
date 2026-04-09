function Get-StellarisEntityIndex {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)]
        [ValidateSet('Trait','Civic','Origin','Ethic','Authority')]
        [string]$EntityType,
        [string]$Html
    )

    if (-not $Html) { throw 'Html is required.' }

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
