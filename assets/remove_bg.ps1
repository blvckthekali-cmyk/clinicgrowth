Add-Type -AssemblyName System.Drawing
$imgPath = "c:\Users\INVICTUS\Downloads\clincaigrowth\clinicgrowth\public\assets\nuevo-logo.png.png"
$img = [System.Drawing.Image]::FromFile($imgPath)
$bmp = new-object System.Drawing.Bitmap($img)
$img.Dispose()

for ($y = 0; $y -lt $bmp.Height; $y++) {
    for ($x = 0; $x -lt $bmp.Width; $x++) {
        $pixel = $bmp.GetPixel($x, $y)
        $lum = [math]::Max([math]::Max($pixel.R, $pixel.G), $pixel.B)
        
        if ($lum -lt 15) {
            $bmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
        } else {
            $alpha = $lum
            $newR = [math]::Min(255, [int]((($pixel.R * 255) / $lum)))
            $newG = [math]::Min(255, [int]((($pixel.G * 255) / $lum)))
            $newB = [math]::Min(255, [int]((($pixel.B * 255) / $lum)))
            $bmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, $newR, $newG, $newB))
        }
    }
}

$bmp.Save("c:\Users\INVICTUS\Downloads\clincaigrowth\clinicgrowth\public\assets\nuevo-logo-alpha.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Host "Success"
