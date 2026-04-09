function ConvertTo-SqlLiteral {
    [CmdletBinding()]
    param(
        [AllowNull()]
        [Parameter(ValueFromPipeline)]
        [object]$Value
    )

    process {
        if ($null -eq $Value) { return 'NULL' }

        if ($Value -is [bool]) {
            return ($(if ($Value) { '1' } else { '0' }))
        }

        if ($Value -is [int] -or $Value -is [long] -or $Value -is [double] -or $Value -is [decimal]) {
            return [string]$Value
        }

        $text = [string]$Value
        $text = $text -replace "'", "''"
        return "'$text'"
    }
}
