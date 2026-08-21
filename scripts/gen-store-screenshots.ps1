Add-Type -AssemblyName System.Drawing

$srcDir = "C:\Users\Greenmounts\OneDrive\Desktop\Metro Saathi (Final)"
$outDir = "C:\Users\Greenmounts\OneDrive\Desktop\Metro Saathi (Final)"

$primaryDark = [System.Drawing.Color]::FromArgb(255, 8, 44, 107)   # #082c6b
$primary     = [System.Drawing.Color]::FromArgb(255, 13, 71, 161)  # #0D47A1
$accent      = [System.Drawing.Color]::FromArgb(255, 198, 40, 40)  # #C62828
$white       = [System.Drawing.Color]::White
$lightBlue   = [System.Drawing.Color]::FromArgb(255, 191, 219, 254)

function New-RoundedRectPath($x, $y, $w, $h, $r) {
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $path.AddArc($x, $y, $r, $r, 180, 90)
  $path.AddArc($x + $w - $r, $y, $r, $r, 270, 90)
  $path.AddArc($x + $w - $r, $y + $h - $r, $r, $r, 0, 90)
  $path.AddArc($x, $y + $h - $r, $r, $r, 90, 90)
  $path.CloseFigure()
  return $path
}

$shots = @(
  @{ file = "screenshot_1_home.png";     out = "store_1_home.png";     title = "Your Offline Metro Companion";  sub = "Live status, quick routes & instant access to everything" },
  @{ file = "screenshot_2_map.png";      out = "store_2_map.png";      title = "Explore the Full Metro Network"; sub = "All 9 lines + Aqua Line, pinch to zoom, tap for details" },
  @{ file = "screenshot_3_fare.png";     out = "store_3_fare.png";     title = "Instant Fare & Ticket Info";     sub = "Token, Smart Card, Airport Express & Tourist Card prices" },
  @{ file = "screenshot_4_stations.png"; out = "store_4_stations.png"; title = "Search 268+ Stations";           sub = "Find any station across the entire Delhi NCR network" }
)

$W = 1080
$H = 2400
$capH = 300

foreach ($shot in $shots) {
  $srcPath = Join-Path $srcDir $shot.file
  if (-not (Test-Path $srcPath)) { Write-Warning "Missing: $srcPath"; continue }
  $src = [System.Drawing.Image]::FromFile($srcPath)

  $bmp = New-Object System.Drawing.Bitmap($W, $H)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

  # Full background gradient
  $bgRect = New-Object System.Drawing.Rectangle(0, 0, $W, $H)
  $bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($bgRect, $primaryDark, $primary, 90)
  $g.FillRectangle($bgBrush, $bgRect)

  # Caption title
  $titleFont = New-Object System.Drawing.Font("Arial", 46, [System.Drawing.FontStyle]::Bold)
  $titleBrush = New-Object System.Drawing.SolidBrush($white)
  $titleFormat = New-Object System.Drawing.StringFormat
  $titleFormat.Alignment = [System.Drawing.StringAlignment]::Center
  $titleRect = New-Object System.Drawing.RectangleF(50, 70, ($W - 100), 150)
  $g.DrawString($shot.title, $titleFont, $titleBrush, $titleRect, $titleFormat)

  # Caption subtitle
  $subFont = New-Object System.Drawing.Font("Arial", 24, [System.Drawing.FontStyle]::Regular)
  $subBrush = New-Object System.Drawing.SolidBrush($lightBlue)
  $subRect = New-Object System.Drawing.RectangleF(70, 190, ($W - 140), 90)
  $g.DrawString($shot.sub, $subFont, $subBrush, $subRect, $titleFormat)

  # Screenshot frame area
  $padSide = 50
  $padBottom = 60
  $frameX = $padSide
  $frameY = $capH
  $frameW = $W - ($padSide * 2)
  $frameH = $H - $capH - $padBottom

  # Scale screenshot to CONTAIN within frame (full screen always visible, no cropping)
  $innerPad = 14
  $fitW = $frameW - ($innerPad * 2)
  $fitH = $frameH - ($innerPad * 2)
  $srcRatio = $src.Width / $src.Height
  $fitRatio = $fitW / $fitH
  if ($srcRatio -gt $fitRatio) {
    $drawW = $fitW
    $drawH = $fitW / $srcRatio
  } else {
    $drawH = $fitH
    $drawW = $fitH * $srcRatio
  }

  # Shadow behind card
  $shadowPath = New-RoundedRectPath ($frameX + 8) ($frameY + 12) $frameW $frameH 40
  $shadowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(70, 0, 0, 0))
  $g.FillPath($shadowBrush, $shadowPath)
  $shadowPath.Dispose()

  # White rounded card background
  $cardPath = New-RoundedRectPath $frameX $frameY $frameW $frameH 40
  $cardBrush = New-Object System.Drawing.SolidBrush($white)
  $g.FillPath($cardBrush, $cardPath)

  # Clip to rounded card and draw screenshot centered/cropped
  $g.SetClip($cardPath)
  $offsetX = $frameX - (($drawW - $frameW) / 2)
  $offsetY = $frameY - (($drawH - $frameH) / 2)
  $g.DrawImage($src, [float]$offsetX, [float]$offsetY, [float]$drawW, [float]$drawH)
  $g.ResetClip()

  # Border around card
  $borderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 226, 232, 240), 4)
  $g.DrawPath($borderPen, $cardPath)

  $cardPath.Dispose()
  $src.Dispose()
  $g.Dispose()

  $outPath = Join-Path $outDir $shot.out
  $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
  Write-Output "Saved: $outPath"
}

Write-Output "`nAll store screenshots generated."
