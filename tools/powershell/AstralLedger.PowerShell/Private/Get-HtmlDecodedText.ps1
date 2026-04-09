function Get-HtmlDecodedText {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)]
        [string]$HtmlFragment
    )

    $text = $HtmlFragment
    $text = $text -replace '(?is)<script\b[^>]*>.*?</script>', ' '
    $text = $text -replace '(?is)<style\b[^>]*>.*?</style>', ' '
    $text = $text -replace '(?is)<br\s*/?>', "`n"
    $text = $text -replace '(?is)</li\s*>', "`n"
    $text = $text -replace '(?is)</p\s*>', "`n"
    $text = $text -replace '(?is)<[^>]+>', ' '
    $text = [System.Net.WebUtility]::HtmlDecode($text)
    $text = $text -replace '[\u00A0\t]+', ' '
    $text = $text -replace '\r', ''
    $text = $text -replace '\n{3,}', "`n`n"
    $text = $text -replace ' {2,}', ' '
    return $text.Trim()
}
