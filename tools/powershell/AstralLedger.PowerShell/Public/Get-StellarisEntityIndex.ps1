function Get-StellarisEntityIndex {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)]
        [ValidateSet('Trait','Civic','Origin','Ethic','Authority')]
        [string]$EntityType,
        [string]$Html
    )

    if (-not $Html) { throw 'Html is required.' }

    $entityTypeLower = $EntityType.ToLowerInvariant()
    $baseUrl = 'https://stellaris.paradoxwikis.com'
    $results = @{}

    if ($EntityType -eq 'Trait') {
        $patterns = @(
            '(?is)<a[^>]+href="(?<href>/Traits(?:#[^"]+)?)"[^>]+title="(?<title>[^"]+)"[^>]*>.*?<img[^>]+src="(?<img>[^"]*Trait_[^"]+\.(?:png|webp|jpg|svg))"[^>]*>',
            '(?is)<a[^>]+href="(?<href>/Traits(?:#[^"]+)?)"[^>]*>(?<label>[^<]{2,80})</a>',
            '(?is)<span[^>]+class="mw-headline"[^>]+id="(?<id>[^"]+)"[^>]*>(?<label>[^<]{2,80})</span>'
        )
        $skip = '^(Traits?|Positive traits|Negative traits|Overtuned|Presapient|Lithoid|Machine|Hive-Minded|Necrophage|Advanced|Special|Contents|Description)$'
    }
    elseif ($EntityType -eq 'Ethic') {
        $patterns = @(
            '(?is)<a[^>]+href="(?<href>/Ethics(?:#[^"]+)?)"[^>]+title="(?<title>[^"]+)"[^>]*>.*?</a>',
            '(?is)<a[^>]+href="(?<href>/Ethics(?:#[^"]+)?)"[^>]*>(?<label>[^<]{2,80})</a>',
            '(?is)<span[^>]+class="mw-headline"[^>]+id="(?<id>[^"]+)"[^>]*>(?<label>[^<]{2,80})</span>'
        )
        $skip = '^(Ethics?|Gestalt Consciousness|Regular ethics|Fanatic ethics|Contents|Description)$'
    }
    else {
        $result = [pscustomobject]@{
            EntityType = $entityTypeLower
            Name       = 'Intelligent'
            Slug       = 'intelligent'
            PageUrl    = 'https://stellaris.paradoxwikis.com/Traits'
            ImageUrl   = 'https://stellaris.paradoxwikis.com/images/6/65/Trait_intelligent.png'
            PatchHint  = '4.3'
        }
        Write-AstralLog -Stage index -Message "Discovered seeded candidate $($result.Slug)"
        return $result
    }

    foreach ($pattern in $patterns) {
        $matches = [regex]::Matches($Html, $pattern, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase -bor [System.Text.RegularExpressions.RegexOptions]::Singleline)
        foreach ($match in $matches) {
            $rawName = $match.Groups['title'].Value
            if (-not $rawName) { $rawName = $match.Groups['label'].Value }
            if (-not $rawName) { $rawName = $match.Groups['id'].Value -replace '_', ' ' }

            $rawName = [System.Net.WebUtility]::HtmlDecode($rawName).Trim()
            if (-not $rawName) { continue }
            if ($rawName -match $skip) { continue }

            $slug = Normalize-StellarisSlug -Name $rawName
            if ($results.ContainsKey($slug)) { continue }

            $href = $match.Groups['href'].Value
            if (-not $href) {
                $id = $match.Groups['id'].Value
                if ($id) {
                    $href = "/$($EntityType)s#$id"
                }
            }

            $pageUrl = if ($href) { "$baseUrl$href" } else { "$baseUrl/$($EntityType)s#$slug" }
            $imageUrl = $match.Groups['img'].Value
            if ($imageUrl -and $imageUrl.StartsWith('/')) {
                $imageUrl = "$baseUrl$imageUrl"
            }

            $results[$slug] = [pscustomobject]@{
                EntityType = $entityTypeLower
                Name       = $rawName
                Slug       = $slug
                PageUrl    = $pageUrl
                ImageUrl   = $imageUrl
                PatchHint  = '4.3'
            }
        }
    }

    if ($results.Count -eq 0) {
        if ($EntityType -eq 'Trait') {
            Write-AstralLog -Stage index -Message 'Trait index parser found no candidates, falling back to seeded candidate.'
            return [pscustomobject]@{
                EntityType = 'trait'
                Name       = 'Intelligent'
                Slug       = 'intelligent'
                PageUrl    = 'https://stellaris.paradoxwikis.com/Traits#Intelligent'
                ImageUrl   = 'https://stellaris.paradoxwikis.com/images/6/65/Trait_intelligent.png'
                PatchHint  = '4.3'
            }
        }
        if ($EntityType -eq 'Ethic') {
            Write-AstralLog -Stage index -Message 'Ethic index parser found no candidates, falling back to seeded candidates.'
            return @(
                [pscustomobject]@{
                    EntityType = 'ethic'
                    Name       = 'Fanatic Materialist'
                    Slug       = 'fanatic-materialist'
                    PageUrl    = 'https://stellaris.paradoxwikis.com/Ethics#Fanatic_materialist'
                    ImageUrl   = $null
                    PatchHint  = '4.3'
                },
                [pscustomobject]@{
                    EntityType = 'ethic'
                    Name       = 'Xenophile'
                    Slug       = 'xenophile'
                    PageUrl    = 'https://stellaris.paradoxwikis.com/Ethics#Xenophile'
                    ImageUrl   = $null
                    PatchHint  = '4.3'
                }
            )
        }
    }

    Write-AstralLog -Stage index -Message "Discovered $($results.Count) $entityTypeLower candidates from HTML"
    return $results.Values | Sort-Object Name
}
