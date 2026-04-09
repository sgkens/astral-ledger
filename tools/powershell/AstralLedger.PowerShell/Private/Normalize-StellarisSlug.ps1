function Normalize-StellarisSlug {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)]
        [string]$Name
    )

    $value = $Name.Trim().ToLowerInvariant()
    $value = $value -replace '[^a-z0-9]+', '-'
    $value = $value.Trim('-')
    return $value
}
