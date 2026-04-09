function Get-SourceHash {
    [CmdletBinding()]
    param([Parameter(Mandatory)][string]$InputString)

    $bytes = [System.Text.Encoding]::UTF8.GetBytes($InputString)
    $sha = [System.Security.Cryptography.SHA256]::Create()
    try {
        $hash = $sha.ComputeHash($bytes)
    }
    finally {
        $sha.Dispose()
    }

    $hex = [System.BitConverter]::ToString($hash).Replace('-', '').ToLowerInvariant()
    "sha256:$hex"
}
