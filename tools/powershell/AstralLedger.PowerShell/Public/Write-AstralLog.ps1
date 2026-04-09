function Write-AstralLog {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string]$Stage,
        [Parameter(Mandatory)][string]$Message
    )
    $timestamp = (Get-Date).ToUniversalTime().ToString('u')
    Write-Host ("[{0}] [{1}] {2}" -f $timestamp, $Stage, $Message)
}
