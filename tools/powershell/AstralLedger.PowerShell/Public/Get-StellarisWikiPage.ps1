function Get-StellarisWikiPage {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)][string]$Url,
        [string]$OutFile,
        [int]$ThrottleMilliseconds = 250
    )

    Start-Sleep -Milliseconds $ThrottleMilliseconds
    $response = Invoke-WebRequest -Uri $Url
    $html = [string]$response.Content
    $hash = Get-SourceHash -InputString $html

    if ($OutFile) {
        $dir = Split-Path -Path $OutFile -Parent
        if ($dir -and -not (Test-Path -Path $dir)) {
            $null = New-Item -ItemType Directory -Path $dir -Force
        }
        Set-Content -Path $OutFile -Value $html -Encoding UTF8
    }

    Write-AstralLog -Stage fetch -Message "Fetched $Url hash=$hash"

    [pscustomobject]@{
        Url         = $Url
        StatusCode  = [int]$response.StatusCode
        ContentType = $response.Headers['Content-Type']
        FetchedAt   = (Get-Date).ToUniversalTime().ToString('o')
        ContentHash = $hash
        Html        = $html
        OutFile     = $OutFile
    }
}
