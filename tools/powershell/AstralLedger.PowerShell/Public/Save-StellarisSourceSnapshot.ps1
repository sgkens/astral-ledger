function Save-StellarisSourceSnapshot {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)]
        [string]$Url,

        [Parameter(Mandatory)]
        [string]$Html,

        [Parameter(Mandatory)]
        [string]$ContentHash,

        [string]$SnapshotRoot = '.cache/snapshots',

        [string]$Kind = 'wiki'
    )

    $dateSegment = (Get-Date).ToUniversalTime().ToString('yyyy-MM-dd')
    $hashSafe = ($ContentHash -replace '^sha256:', '').ToLowerInvariant()
    $dir = Join-Path -Path $SnapshotRoot -ChildPath $dateSegment

    if (-not (Test-Path -Path $dir)) {
        $null = New-Item -ItemType Directory -Path $dir -Force
    }

    $htmlPath = Join-Path -Path $dir -ChildPath "$hashSafe.html"
    $metaPath = Join-Path -Path $dir -ChildPath "$hashSafe.json"

    Set-Content -Path $htmlPath -Value $Html -Encoding UTF8

    $meta = [pscustomobject]@{
        kind         = $Kind
        url          = $Url
        fetchedAt    = (Get-Date).ToUniversalTime().ToString('o')
        contentHash  = $ContentHash
        storageKey   = $htmlPath -replace '\\', '/'
        metadataPath = $metaPath -replace '\\', '/'
        byteLength   = ([System.Text.Encoding]::UTF8.GetByteCount($Html))
        parseStatus  = 'captured'
    }

    $meta | ConvertTo-Json -Depth 6 | Set-Content -Path $metaPath -Encoding UTF8
    Write-AstralLog -Stage snapshot -Message "Persisted snapshot $($meta.storageKey)"

    return $meta
}
