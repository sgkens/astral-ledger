function Get-SourceHash {
    [CmdletBinding(DefaultParameterSetName='String')]
    param(
        [Parameter(Mandatory, ParameterSetName='String')]
        [string]$InputString
    )

    $bytes = [System.Text.Encoding]::UTF8.GetBytes($InputString)
    $sha = [System.Security.Cryptography.SHA256]::Create()
    try {
        $hash = $sha.ComputeHash($bytes)
    }
    finally {
        $sha.Dispose()
    }

    $hex = [System.BitConverter]::ToString($hash).Replace('-', '').ToLowerInvariant()
    return "sha256:$hex"
}
