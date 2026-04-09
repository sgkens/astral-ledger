function Update-StellarisCodex {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory, ParameterSetName='Path')]
        [string]$NormalizedJsonPath,

        [Parameter(Mandatory, ParameterSetName='Object')]
        [pscustomobject]$InputObject,

        [string]$SqlOutputPath = '.cache/traits.upsert.sql',

        [string]$DatabaseName = 'astral-ledger',

        [switch]$ExecuteWithWrangler
    )

    if ($PSCmdlet.ParameterSetName -eq 'Path') {
        $payload = Get-Content -Path $NormalizedJsonPath -Raw -Encoding UTF8 | ConvertFrom-Json -Depth 20
    } else {
        $payload = $InputObject
    }

    $sql = New-StellarisD1UpsertSql -NormalizedPayload $payload

    $dir = Split-Path -Path $SqlOutputPath -Parent
    if ($dir -and -not (Test-Path -Path $dir)) {
        $null = New-Item -ItemType Directory -Path $dir -Force
    }

    Set-Content -Path $SqlOutputPath -Value $sql -Encoding UTF8
    Write-AstralLog -Stage db -Message "Wrote D1 upsert SQL -> $SqlOutputPath"

    if ($ExecuteWithWrangler) {
        $wrangler = Get-Command wrangler -ErrorAction SilentlyContinue
        if (-not $wrangler) {
            throw 'Wrangler CLI was not found on PATH.'
        }

        $arguments = @('d1', 'execute', $DatabaseName, '--file', $SqlOutputPath)
        Write-AstralLog -Stage db -Message ("Executing wrangler {0}" -f ($arguments -join ' '))
        & $wrangler.Source @arguments
        if ($LASTEXITCODE -ne 0) {
            throw "Wrangler D1 execute failed with exit code $LASTEXITCODE."
        }
    }

    return [pscustomobject]@{
        SqlOutputPath = $SqlOutputPath
        DatabaseName  = $DatabaseName
        Executed      = [bool]$ExecuteWithWrangler
    }
}
