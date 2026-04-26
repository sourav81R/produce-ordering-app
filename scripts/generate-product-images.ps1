$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$backendDir = Join-Path $projectRoot 'backend\public\product-images'
$webDir = Join-Path $projectRoot 'web\public\product-images'

New-Item -ItemType Directory -Force -Path $backendDir | Out-Null
New-Item -ItemType Directory -Force -Path $webDir | Out-Null

$images = @(
  @{
    slug = 'roma-tomatoes'
    fileName = 'roma-tomatoes.jpg'
    source = 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Fresh%20tomatoes.jpg'
  },
  @{
    slug = 'broccoli-crowns'
    fileName = 'broccoli-crowns.jpg'
    source = 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Fresh%20Broccoli.jpg'
  },
  @{
    slug = 'english-cucumbers'
    fileName = 'english-cucumbers.jpg'
    source = 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Small%20cucumber%20-%20vegetable.jpg'
  },
  @{
    slug = 'baby-spinach'
    fileName = 'baby-spinach.jpg'
    source = 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Fresh%20Spinach%20leaves.jpg'
  },
  @{
    slug = 'rainbow-bell-peppers'
    fileName = 'rainbow-bell-peppers.jpg'
    source = 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Red%20bell%20pepper.jpg'
  },
  @{
    slug = 'red-onions'
    fileName = 'red-onions.jpg'
    source = 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Red%20onions.jpg'
  },
  @{
    slug = 'sweet-corn-cobs'
    fileName = 'sweet-corn-cobs.jpg'
    source = 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Sweet%20corn.jpg'
  },
  @{
    slug = 'purple-cabbage'
    fileName = 'purple-cabbage.jpg'
    source = 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Purple%20Cabbage.JPG'
  },
  @{
    slug = 'alphonso-mango'
    fileName = 'alphonso-mango.jpg'
    source = 'https://commons.wikimedia.org/wiki/Special:Redirect/file/ALPHONSO%20MANGO.jpg'
  },
  @{
    slug = 'cavendish-banana'
    fileName = 'cavendish-banana.jpg'
    source = 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/A_Banana.jpg/1920px-A_Banana.jpg'
  },
  @{
    slug = 'green-grapes'
    fileName = 'green-grapes.jpg'
    source = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Green_grapes.jpg/1280px-Green_grapes.jpg'
  },
  @{
    slug = 'pomegranate'
    fileName = 'pomegranate.jpg'
    source = 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Pomegranate.jpg/1024px-Pomegranate.jpg'
  },
  @{
    slug = 'watermelon'
    fileName = 'watermelon.jpg'
    source = 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Sliced_Watermelon.jpg/1280px-Sliced_Watermelon.jpg'
  },
  @{
    slug = 'strawberries'
    fileName = 'strawberries.jpg'
    source = 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Strawberries.JPG/1280px-Strawberries.JPG'
  },
  @{
    slug = 'pink-guava'
    fileName = 'pink-guava.jpg'
    source = 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Guava_fruit.jpg/1280px-Guava_fruit.jpg'
  },
  @{
    slug = 'dragon-fruit'
    fileName = 'dragon-fruit.jpg'
    source = 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/A_dragon_fruit.jpg/1280px-A_dragon_fruit.jpg'
  }
)

foreach ($image in $images) {
  $backendTarget = Join-Path $backendDir $image.fileName
  $webTarget = Join-Path $webDir $image.fileName

  if (Test-Path $backendTarget) {
    Copy-Item -Path $backendTarget -Destination $webTarget -Force
    Write-Host "Skipped $($image.slug); already imported"
    continue
  }

  $attempt = 0
  while ($true) {
    try {
      Invoke-WebRequest `
        -Uri $image.source `
        -OutFile $backendTarget `
        -Headers @{ 'User-Agent' = 'produce-ordering-app-image-importer/1.0' }
      Copy-Item -Path $backendTarget -Destination $webTarget -Force
      Write-Host "Imported $($image.slug)"
      Start-Sleep -Seconds 3
      break
    } catch {
      $attempt += 1
      if ($attempt -ge 3) {
        throw
      }

      Write-Host "Retrying $($image.slug) after rate limit or network error..."
      Start-Sleep -Seconds 12
    }
  }
}

Write-Host "Imported $($images.Count) real product photos into backend/public/product-images and web/public/product-images."
