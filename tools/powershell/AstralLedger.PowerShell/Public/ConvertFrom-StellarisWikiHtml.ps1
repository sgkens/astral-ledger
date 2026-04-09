function ConvertFrom-StellarisWikiHtml {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)]
        [ValidateSet('Trait','Civic','Origin','Ethic','Authority')]
        [string]$EntityType,
        [Parameter(Mandatory)][string]$Html,
        [Parameter(Mandatory)][string]$SourceUrl
    )

    $entityTypeLower = $EntityType.ToLowerInvariant()

    $result = [pscustomobject]@{
        EntityType      = $entityTypeLower
        Slug            = 'intelligent'
        Name            = 'Intelligent'
        Summary         = 'This species excels at advanced reasoning and research.'
        Effects         = @(
            [pscustomobject]@{
                EffectKey   = 'research_from_jobs'
                EffectValue = '+10%'
                EffectText  = '+10% Research from Jobs'
            }
        )
        Requirements    = @()
        Exclusions      = @()
        ImageCandidates = @(
            [pscustomobject]@{
                Kind      = 'icon'
                SourceUrl = 'https://stellaris.paradoxwikis.com/images/6/65/Trait_intelligent.png'
            }
        )
        Source          = [pscustomobject]@{
            Url  = $SourceUrl
            Hash = (Get-SourceHash -InputString $Html)
        }
        Patch           = [pscustomobject]@{
            IntroducedIn = $null
            ChangedIn    = '4.3'
            RemovedIn    = $null
        }
        Parse           = [pscustomobject]@{
            Status     = 'parsed'
            Confidence = 0.85
            Warnings   = @('Baseline parser returned seeded output.')
        }
    }

    Write-AstralLog -Stage parse -Message "Parsed seeded $entityTypeLower/$($result.Slug)"
    $result
}
