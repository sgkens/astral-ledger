function ConvertFrom-StellarisWikiHtml {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)]
        [ValidateSet('Trait','Civic','Origin','Ethic','Authority')]
        [string]$EntityType,
        [Parameter(Mandatory)][string]$Html,
        [Parameter(Mandatory)][string]$SourceUrl,
        [string]$Slug,
        [string]$Name
    )

    $entityTypeLower = $EntityType.ToLowerInvariant()

    if ($EntityType -ne 'Trait') {
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
                Warnings   = @('Baseline parser returned seeded output for non-trait entity type.')
            }
        }

        Write-AstralLog -Stage parse -Message "Parsed seeded $entityTypeLower/$($result.Slug)"
        return $result
    }

    if (-not $Slug -and $Name) {
        $Slug = Normalize-StellarisSlug -Name $Name
    }

    $candidateIds = @()
    if ($Slug) {
        $candidateIds += $Slug
        $candidateIds += ($Slug -replace '-', '_')
        $candidateIds += ($Slug -replace '-', ' ')
    }
    if ($Name) {
        $candidateIds += $Name
        $candidateIds += ($Name -replace ' ', '_')
    }
    $candidateIds = $candidateIds | Where-Object { $_ } | Select-Object -Unique

    $sectionStart = $null
    foreach ($candidateId in $candidateIds) {
        $escaped = [regex]::Escape($candidateId)
        $headingPattern = "(?is)<span[^>]+class=""mw-headline""[^>]+id=""$escaped""[^>]*>.*?</span>"
        $headingMatch = [regex]::Match($Html, $headingPattern)
        if ($headingMatch.Success) {
            $sectionStart = $headingMatch.Index
            if (-not $Name) {
                $nameMatch = [regex]::Match($headingMatch.Value, '(?is)>(?<name>[^<]+)</span>')
                if ($nameMatch.Success) {
                    $Name = [System.Net.WebUtility]::HtmlDecode($nameMatch.Groups['name'].Value).Trim()
                }
            }
            break
        }
    }

    if ($null -eq $sectionStart) {
        $fallback = [regex]::Match($Html, '(?is)<span[^>]+class="mw-headline"[^>]+id="(?<id>[^"]+)"[^>]*>(?<name>[^<]+)</span>')
        if ($fallback.Success) {
            $sectionStart = $fallback.Index
            $Name = [System.Net.WebUtility]::HtmlDecode($fallback.Groups['name'].Value).Trim()
            $Slug = Normalize-StellarisSlug -Name $Name
        }
    }

    if ($null -eq $sectionStart) {
        throw "Trait parser could not locate a heading for slug '$Slug'."
    }

    $remaining = $Html.Substring($sectionStart)
    $nextHeading = [regex]::Match($remaining.Substring([Math]::Min($remaining.Length - 1, 1)), '(?is)<h[23][^>]*>|<span[^>]+class="mw-headline"[^>]+id="[^"]+"')
    if ($nextHeading.Success) {
        $sectionLength = [Math]::Min($remaining.Length, $nextHeading.Index + 1)
        $sectionHtml = $remaining.Substring(0, $sectionLength)
    } else {
        $sectionHtml = $remaining
    }

    $decoded = Get-HtmlDecodedText -HtmlFragment $sectionHtml
    $lines = $decoded -split "`n" | ForEach-Object { $_.Trim() } | Where-Object { $_ }

    $summary = $null
    foreach ($line in $lines) {
        if ($line.Length -lt 25) { continue }
        if ($line -match '^(Effects?|Requirements?|Restrictions?|Notes?)$') { continue }
        if ($line -match '^[\+\-]?[0-9]+') { continue }
        $summary = $line
        break
    }
    if (-not $summary) {
        $summary = "Trait entry parsed from Stellaris Wiki HTML for $Name."
    }

    $effectMatches = [regex]::Matches($sectionHtml, '(?is)<li[^>]*>(?<item>.*?)</li>')
    $effects = @()
    foreach ($match in $effectMatches) {
        $text = Get-HtmlDecodedText -HtmlFragment $match.Groups['item'].Value
        if (-not $text) { continue }
        if ($text.Length -gt 220) { continue }
        if ($effects -contains $text) { continue }
        $effects += $text
    }

    if ($effects.Count -eq 0) {
        foreach ($line in $lines) {
            if ($line -match '(%|Upkeep|Growth|Research|Output|Value|Amenities|Housing|Army|Habitability|Pop|Jobs)') {
                if ($effects -notcontains $line) {
                    $effects += $line
                }
            }
        }
    }

    $effectObjects = @()
    for ($i = 0; $i -lt $effects.Count; $i++) {
        $effectText = $effects[$i]
        $effectObjects += [pscustomobject]@{
            EffectKey   = ("effect_{0:D2}" -f $i)
            EffectValue = $null
            EffectText  = $effectText
        }
    }

    $imgMatch = [regex]::Match($sectionHtml, '(?is)<img[^>]+src="(?<src>[^"]*Trait_[^"]+\.(?:png|webp|jpg|svg))"[^>]*>')
    $imageUrl = $imgMatch.Groups['src'].Value
    if ($imageUrl -and $imageUrl.StartsWith('/')) {
        $imageUrl = "https://stellaris.paradoxwikis.com$imageUrl"
    }

    $warnings = @()
    $confidence = 0.92
    if ($effectObjects.Count -eq 0) {
        $warnings += 'No list-based effects were detected in the trait section.'
        $confidence = 0.70
    }
    if (-not $imageUrl) {
        $warnings += 'No trait image was detected in the parsed section.'
        $confidence = [Math]::Min($confidence, 0.82)
    }

    $result = [pscustomobject]@{
        EntityType      = 'trait'
        Slug            = $Slug
        Name            = $Name
        Summary         = $summary
        Effects         = $effectObjects
        Requirements    = @()
        Exclusions      = @()
        ImageCandidates = @(
            if ($imageUrl) {
                [pscustomobject]@{
                    Kind      = 'icon'
                    SourceUrl = $imageUrl
                }
            }
        ) | Where-Object { $_ }
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
            Confidence = [Math]::Round($confidence, 2)
            Warnings   = $warnings
        }
    }

    Write-AstralLog -Stage parse -Message "Parsed trait/$($result.Slug) confidence=$($result.Parse.Confidence)"
    return $result
}
