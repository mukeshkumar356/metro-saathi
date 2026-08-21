Add-Type -AssemblyName System.Drawing

$outPath = "C:\Users\Greenmounts\OneDrive\Desktop\Metro Saathi (Final)\feature_graphic.png"

$W = 1024
$H = 500

$bmp = New-Object System.Drawing.Bitmap($W, $H)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

$primaryDark = [System.Drawing.Color]::FromArgb(255, 8, 44, 107)   # #082c6b
$primary     = [System.Drawing.Color]::FromArgb(255, 13, 71, 161)  # #0D47A1
$accent      = [System.Drawing.Color]::FromArgb(255, 198, 40, 40)  # #C62828
$white       = [System.Drawing.Color]::White
$gold        = [System.Drawing.Color]::FromArgb(255, 245, 158, 11) # #F59E0B

# Background gradient (dark blue -> blue)
$rect = New-Object System.Drawing.Rectangle(0, 0, $W, $H)
$gradBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, $primaryDark, $primary, 45)
$g.FillRectangle($gradBrush, $rect)

# Decorative faint metro line stripes across background
$lineColors = @(
  [System.Drawing.Color]::FromArgb(60, 255, 215, 0),
  [System.Drawing.Color]::FromArgb(60, 0, 128, 0),
  [System.Drawing.Color]::FromArgb(60, 255, 105, 180),
  [System.Drawing.Color]::FromArgb(60, 123, 0, 212)
)
$y = -40
foreach ($c in $lineColors) {
  $pen = New-Object System.Drawing.Pen($c, 14)
  $g.DrawLine($pen, -50, $y, $W + 50, $y + 220)
  $y += 90
  $pen.Dispose()
}

# Logo circle (red, white M) on the left
$logoSize = 260
$logoX = 60
$logoY = ($H - $logoSize) / 2
$accentBrush = New-Object System.Drawing.SolidBrush($accent)
$g.FillEllipse($accentBrush, $logoX, $logoY, $logoSize, $logoSize)

$ringPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(140, 255,255,255), 5)
$ringInset = $logoSize * 0.10
$g.DrawEllipse($ringPen, $logoX + $ringInset, $logoY + $ringInset, $logoSize - 2*$ringInset, $logoSize - 2*$ringInset)

$innerD = $logoSize * 0.68
$innerX = $logoX + ($logoSize - $innerD) / 2
$innerY = $logoY + ($logoSize - $innerD) / 2
$whiteBrush = New-Object System.Drawing.SolidBrush($white)
$g.FillEllipse($whiteBrush, $innerX, $innerY, $innerD, $innerD)

$mFont = New-Object System.Drawing.Font("Arial", ($innerD * 0.46), [System.Drawing.FontStyle]::Bold)
$mBrush = New-Object System.Drawing.SolidBrush($accent)
$mFormat = New-Object System.Drawing.StringFormat
$mFormat.Alignment = [System.Drawing.StringAlignment]::Center
$mFormat.LineAlignment = [System.Drawing.StringAlignment]::Center
$mRectY = $innerY - ($innerD * 0.03)
$mRect = New-Object System.Drawing.RectangleF($innerX, $mRectY, $innerD, $innerD)
$g.DrawString("M", $mFont, $mBrush, $mRect, $mFormat)

# Title text
$titleX = $logoX + $logoSize + 50
$titleFont = New-Object System.Drawing.Font("Arial", 62, [System.Drawing.FontStyle]::Bold)
$titleBrush = New-Object System.Drawing.SolidBrush($white)
$g.DrawString("Metro Saathi", $titleFont, $titleBrush, $titleX, ($H/2) - 95)

$subFont = New-Object System.Drawing.Font("Arial", 24, [System.Drawing.FontStyle]::Regular)
$subBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 191, 219, 254))
$g.DrawString("Your offline Delhi Metro companion", $subFont, $subBrush, $titleX, ($H/2) + 5)

# Feature chips
$chips = @("Route Finder", "Live Map", "Fares", "268+ Stations")
$chipFont = New-Object System.Drawing.Font("Arial", 13, [System.Drawing.FontStyle]::Bold)
$chipX = $titleX
$chipY = ($H/2) + 55
foreach ($chip in $chips) {
  $textSize = $g.MeasureString($chip, $chipFont)
  $chipW = $textSize.Width + 22
  $chipH = 34
  $chipRect = New-Object System.Drawing.Rectangle($chipX, $chipY, [int]$chipW, $chipH)
  $chipBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(40, 255,255,255))
  $chipPath = New-Object System.Drawing.Drawing2D.GraphicsPath
  $r = $chipH
  $chipPath.AddArc($chipRect.X, $chipRect.Y, $r, $r, 180, 90)
  $chipPath.AddArc($chipRect.X + $chipRect.Width - $r, $chipRect.Y, $r, $r, 270, 90)
  $chipPath.AddArc($chipRect.X + $chipRect.Width - $r, $chipRect.Y + $chipRect.Height - $r, $r, $r, 0, 90)
  $chipPath.AddArc($chipRect.X, $chipRect.Y + $chipRect.Height - $r, $r, $r, 90, 90)
  $chipPath.CloseFigure()
  $g.FillPath($chipBrush, $chipPath)
  $chipTextBrush = New-Object System.Drawing.SolidBrush($white)
  $g.DrawString($chip, $chipFont, $chipTextBrush, $chipX + 11, $chipY + 7)
  $chipX += [int]$chipW + 10
  $chipPath.Dispose()
}

$g.Dispose()
$bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
Write-Output "Feature graphic saved: $outPath"
