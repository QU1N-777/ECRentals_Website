param(
    [string]$Root = (Get-Location).Path
)

Add-Type -AssemblyName System.Drawing

function New-ContactSheet {
    param(
        [Parameter(Mandatory)] [System.IO.FileInfo[]]$Files,
        [Parameter(Mandatory)] [string]$OutputPath,
        [int]$Columns = 4,
        [int]$ThumbWidth = 360,
        [int]$ThumbHeight = 230,
        [int]$LabelHeight = 56
    )

    if ($Files.Count -eq 0) { return }
    $rows = [Math]::Ceiling($Files.Count / $Columns)
    $sheet = [System.Drawing.Bitmap]::new($Columns * $ThumbWidth, $rows * ($ThumbHeight + $LabelHeight))
    $graphics = [System.Drawing.Graphics]::FromImage($sheet)
    $graphics.Clear([System.Drawing.Color]::FromArgb(22, 24, 26))
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $font = [System.Drawing.Font]::new('Segoe UI', 10)
    $brush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::White)

    try {
        for ($i = 0; $i -lt $Files.Count; $i++) {
            $row = [Math]::Floor($i / $Columns)
            $column = $i % $Columns
            $x = $column * $ThumbWidth
            $y = $row * ($ThumbHeight + $LabelHeight)
            $image = [System.Drawing.Image]::FromFile($Files[$i].FullName)
            try {
                $scale = [Math]::Min($ThumbWidth / $image.Width, $ThumbHeight / $image.Height)
                $width = [int]($image.Width * $scale)
                $height = [int]($image.Height * $scale)
                $left = $x + [int](($ThumbWidth - $width) / 2)
                $top = $y + [int](($ThumbHeight - $height) / 2)
                $graphics.DrawImage($image, $left, $top, $width, $height)
                $label = $Files[$i].BaseName
                $labelRect = [System.Drawing.RectangleF]::new($x + 8, $y + $ThumbHeight + 5, $ThumbWidth - 16, $LabelHeight - 8)
                $graphics.DrawString($label, $font, $brush, $labelRect)
            }
            finally {
                $image.Dispose()
            }
        }
        $sheet.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Jpeg)
    }
    finally {
        $brush.Dispose()
        $font.Dispose()
        $graphics.Dispose()
        $sheet.Dispose()
    }
}

$imageExtensions = @('.jpg', '.jpeg', '.png', '.webp')
$equipment = Get-ChildItem -LiteralPath $Root -File | Where-Object { $_.BaseName -like 'ECR*' -and $imageExtensions -contains $_.Extension.ToLowerInvariant() }
$cinematicPath = Join-Path $Root 'Cinematic Images'
$cinematic = Get-ChildItem -LiteralPath $cinematicPath -File | Where-Object { $imageExtensions -contains $_.Extension.ToLowerInvariant() }
$generatedPath = Join-Path $Root 'Generated Cinematic Website Images'
$generated = if (Test-Path -LiteralPath $generatedPath) {
    Get-ChildItem -LiteralPath $generatedPath -File | Where-Object { $imageExtensions -contains $_.Extension.ToLowerInvariant() }
} else {
    @()
}

New-ContactSheet -Files $equipment -OutputPath (Join-Path $Root '_ECR-equipment-contact-sheet.jpg') -Columns 4
New-ContactSheet -Files $cinematic -OutputPath (Join-Path $Root '_cinematic-reference-contact-sheet.jpg') -Columns 4
New-ContactSheet -Files $generated -OutputPath (Join-Path $Root '_generated-campaign-contact-sheet.jpg') -Columns 4
