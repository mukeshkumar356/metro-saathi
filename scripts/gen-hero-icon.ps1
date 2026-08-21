Add-Type -AssemblyName System.Drawing

$outDir = "C:\Users\Greenmounts\OneDrive\Desktop\Metro Saathi (Final)"
$S = 1024

$bmp = New-Object System.Drawing.Bitmap($S, $S)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

$blueLight = [System.Drawing.Color]::FromArgb(255, 25, 100, 220)
$blueDark  = [System.Drawing.Color]::FromArgb(255, 8, 30, 80)
$red       = [System.Drawing.Color]::FromArgb(255, 198, 40, 40)
$white     = [System.Drawing.Color]::White
$navy      = [System.Drawing.Color]::FromArgb(255, 15, 45, 110)

# ── Background gradient ──
$rect = New-Object System.Drawing.Rectangle(0, 0, $S, $S)
$bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, $blueLight, $blueDark, 45)
$g.FillRectangle($bgBrush, $rect)

# ── Decorative metro-line pattern in background corners ──
$lines = @(
  @{ color = [System.Drawing.Color]::FromArgb(140, 235, 210, 52);  x1=0;    y1=280; x2=230; y2=90  }   # yellow, top-left
  @{ color = [System.Drawing.Color]::FromArgb(140, 220, 60, 60);   x1=800;  y1=90;  x2=1024; y2=280 }  # red, top-right
  @{ color = [System.Drawing.Color]::FromArgb(140, 60, 190, 100);  x1=800;  y1=940; x2=1024; y2=760 }  # green, bottom-right
  @{ color = [System.Drawing.Color]::FromArgb(140, 150, 70, 200);  x1=0;    y1=760; x2=230; y2=940 }   # violet, bottom-left
)
foreach ($ln in $lines) {
  $pen = New-Object System.Drawing.Pen($ln.color, 7)
  $g.DrawLine($pen, $ln.x1, $ln.y1, $ln.x2, $ln.y2)
  $dotBrush = New-Object System.Drawing.SolidBrush($ln.color)
  $g.FillEllipse($dotBrush, ($ln.x2 - 10), ($ln.y2 - 10), 20, 20)
  $g.FillEllipse($dotBrush, ($ln.x1 - 8), ($ln.y1 - 8), 16, 16)
  $pen.Dispose(); $dotBrush.Dispose()
}

# ── Central circular badge ──
$cx = $S / 2
$cy = 360
$outerR = 260
$ringWidth = 34

$redBrush = New-Object System.Drawing.SolidBrush($red)
$g.FillEllipse($redBrush, ($cx - $outerR), ($cy - $outerR), ($outerR*2), ($outerR*2))

$innerR = $outerR - $ringWidth
$whiteBrush = New-Object System.Drawing.SolidBrush($white)
$g.FillEllipse($whiteBrush, ($cx - $innerR), ($cy - $innerR), ($innerR*2), ($innerR*2))

# thin separator ring inside red band
$sepPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(120,255,255,255), 3)
$sepR = $outerR - ($ringWidth/2)
$g.DrawEllipse($sepPen, ($cx-$sepR), ($cy-$sepR), ($sepR*2), ($sepR*2))

# Bold M in the center
$mFont = New-Object System.Drawing.Font("Arial", 190, [System.Drawing.FontStyle]::Bold)
$mBrush = New-Object System.Drawing.SolidBrush($navy)
$mFormat = New-Object System.Drawing.StringFormat
$mFormat.Alignment = [System.Drawing.StringAlignment]::Center
$mFormat.LineAlignment = [System.Drawing.StringAlignment]::Center
$mRect = New-Object System.Drawing.RectangleF(($cx-$innerR), ($cy-$innerR-14), ($innerR*2), ($innerR*2))
$g.DrawString("M", $mFont, $mBrush, $mRect, $mFormat)

# ── Curved ring text ──
function Draw-ArcText($g, $text, $cx, $cy, $radius, $font, $brush, [bool]$bottom, $halfSpanDeg) {
  $n = $text.Length
  if ($n -eq 0) { return }
  for ($i = 0; $i -lt $n; $i++) {
    $ch = [string]$text[$i]
    if ($bottom) {
      $angleDeg = (180 + $halfSpanDeg) - ($i / [Math]::Max(1,($n-1))) * (2*$halfSpanDeg)
      $rotDeg = $angleDeg - 180
    } else {
      $angleDeg = (-$halfSpanDeg) + ($i / [Math]::Max(1,($n-1))) * (2*$halfSpanDeg)
      $rotDeg = $angleDeg
    }
    $angleRad = $angleDeg * [Math]::PI / 180
    $x = $cx + $radius * [Math]::Sin($angleRad)
    $y = $cy - $radius * [Math]::Cos($angleRad)
    $state = $g.Save()
    $g.TranslateTransform([float]$x, [float]$y)
    $g.RotateTransform([float]$rotDeg)
    $sz = $g.MeasureString($ch, $font)
    $g.DrawString($ch, $font, $brush, [float](-$sz.Width/2), [float](-$sz.Height/2))
    $g.Restore($state)
  }
}

$arcFont = New-Object System.Drawing.Font("Arial", 46, [System.Drawing.FontStyle]::Bold)
$arcBrush = New-Object System.Drawing.SolidBrush($white)
$textR = $outerR - ($ringWidth/2)
Draw-ArcText $g "METRO"  $cx $cy $textR $arcFont $arcBrush $false 42
Draw-ArcText $g "SAATHI" $cx $cy $textR $arcFont $arcBrush $true  48

# ── Simplified stylized train silhouette at the bottom ──
$trainY = 800
$trainW = 620
$trainH = 130
$tx = $cx - $trainW/2
function New-RoundedRectPath($x, $y, $w, $h, $r) {
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $path.AddArc($x, $y, $r, $r, 180, 90)
  $path.AddArc($x + $w - $r, $y, $r, $r, 270, 90)
  $path.AddArc($x + $w - $r, $y + $h - $r, $r, $r, 0, 90)
  $path.AddArc($x, $y + $h - $r, $r, $r, 90, 90)
  $path.CloseFigure()
  return $path
}
$bodyPath = New-RoundedRectPath $tx $trainY $trainW $trainH 46
$g.FillPath($whiteBrush, $bodyPath)

# Blue stripe
$stripeBrush = New-Object System.Drawing.SolidBrush($blueLight)
$g.FillRectangle($stripeBrush, $tx, ($trainY + $trainH*0.62), $trainW, 16)

# Windows
$winBrush = New-Object System.Drawing.SolidBrush($navy)
$winCount = 8
$winW = 46; $winH = 46; $winGap = 20
$startX = $tx + 60
for ($i = 0; $i -lt $winCount; $i++) {
  $wx = $startX + $i * ($winW + $winGap)
  $winPath = New-RoundedRectPath $wx ($trainY + 24) $winW $winH 10
  $g.FillPath($winBrush, $winPath)
  $winPath.Dispose()
}

# Headlights
$lightBrush = New-Object System.Drawing.SolidBrush($red)
$g.FillEllipse($lightBrush, ($tx + $trainW - 50), ($trainY + $trainH - 40), 26, 26)
$g.FillEllipse($lightBrush, ($tx + 24), ($trainY + $trainH - 40), 26, 26)

$bodyPath.Dispose()

$g.Dispose()

# Save 1024 master + 512 Play Store icon
$bmp.Save((Join-Path $outDir "playstore_icon_1024_master.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$icon512 = New-Object System.Drawing.Bitmap($bmp, 512, 512)
$icon512.Save((Join-Path $outDir "playstore_icon_512.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$icon512.Dispose()
$bmp.Dispose()

Write-Output "Saved hero icon (1024 master + 512 Play Store version)."
