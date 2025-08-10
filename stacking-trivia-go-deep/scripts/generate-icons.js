// PWA icon generator script
import sharp from 'sharp'
import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const ICON_SIZES = [
  { size: 72, name: 'icon-72x72.png', purpose: 'any' },
  { size: 96, name: 'icon-96x96.png', purpose: 'any' },
  { size: 128, name: 'icon-128x128.png', purpose: 'any' },
  { size: 144, name: 'icon-144x144.png', purpose: 'any' },
  { size: 152, name: 'icon-152x152.png', purpose: 'any' },
  { size: 192, name: 'icon-192x192.png', purpose: 'any' },
  { size: 384, name: 'icon-384x384.png', purpose: 'any' },
  { size: 512, name: 'icon-512x512.png', purpose: 'any' },
  // Maskable icons for better Android integration
  { size: 192, name: 'icon-192x192-maskable.png', purpose: 'maskable' },
  { size: 512, name: 'icon-512x512-maskable.png', purpose: 'maskable' }
]

async function createBaseIcon() {
  const iconDir = path.join(__dirname, '../public/icons')
  
  // Ensure icons directory exists
  await fs.mkdir(iconDir, { recursive: true })
  
  // Create a base trivia game icon with sharp
  const baseIcon = sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 79, g: 70, b: 229, alpha: 1 } // Indigo-600
    }
  })
  
  // Add circular design with text overlay
  const svgOverlay = `
    <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
      <!-- Background circle -->
      <circle cx="256" cy="256" r="240" fill="#4f46e5" stroke="#fff" stroke-width="8"/>
      
      <!-- Inner circle -->
      <circle cx="256" cy="256" r="180" fill="#6366f1" opacity="0.9"/>
      
      <!-- Question mark -->
      <text x="256" y="300" font-family="Arial Black, Arial" font-size="180" 
            font-weight="bold" text-anchor="middle" fill="white">?</text>
      
      <!-- App name -->
      <text x="256" y="450" font-family="Arial, sans-serif" font-size="32" 
            font-weight="bold" text-anchor="middle" fill="white">TRIVIA</text>
    </svg>
  `
  
  return baseIcon.composite([
    { input: Buffer.from(svgOverlay), top: 0, left: 0 }
  ])
}

async function createMaskableIcon(size) {
  // Maskable icons need safe zone padding (10% on all sides)
  const safeZone = size * 0.1
  const contentSize = size - (safeZone * 2)
  
  const svgOverlay = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <!-- Background with safe zone -->
      <rect width="${size}" height="${size}" fill="#4f46e5"/>
      
      <!-- Main circle within safe zone -->
      <circle cx="${size/2}" cy="${size/2}" r="${contentSize/2 * 0.8}" 
              fill="#6366f1" stroke="#fff" stroke-width="${Math.max(2, size/64)}"/>
      
      <!-- Question mark scaled for safe zone -->
      <text x="${size/2}" y="${size/2 + contentSize * 0.15}" 
            font-family="Arial Black, Arial" font-size="${contentSize * 0.35}" 
            font-weight="bold" text-anchor="middle" fill="white">?</text>
      
      <!-- App name -->
      <text x="${size/2}" y="${size/2 + contentSize * 0.4}" 
            font-family="Arial, sans-serif" font-size="${contentSize * 0.08}" 
            font-weight="bold" text-anchor="middle" fill="white">TRIVIA</text>
    </svg>
  `
  
  return sharp(Buffer.from(svgOverlay))
}

async function generateIcons() {
  console.log('🎨 Generating PWA icons...')
  
  const iconDir = path.join(__dirname, '../public/icons')
  await fs.mkdir(iconDir, { recursive: true })
  
  for (const iconSpec of ICON_SIZES) {
    try {
      let iconImage
      
      if (iconSpec.purpose === 'maskable') {
        iconImage = await createMaskableIcon(iconSpec.size)
      } else {
        // Create base icon at the target size directly
        iconImage = await createBaseIconAtSize(iconSpec.size)
      }
      
      await iconImage
        .png({ quality: 90, compressionLevel: 9 })
        .toFile(path.join(iconDir, iconSpec.name))
      
      console.log(`✓ Generated ${iconSpec.name} (${iconSpec.size}x${iconSpec.size})`)
    } catch (error) {
      console.error(`✗ Failed to generate ${iconSpec.name}:`, error.message)
    }
  }
  
  // Generate favicon variations
  await generateFavicons(iconDir)
  
  console.log('🎉 All PWA icons generated successfully!')
}

async function createBaseIconAtSize(size) {
  const svgOverlay = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <!-- Background circle -->
      <circle cx="${size/2}" cy="${size/2}" r="${size * 0.47}" fill="#4f46e5" stroke="#fff" stroke-width="${Math.max(2, size/64)}"/>
      
      <!-- Inner circle -->
      <circle cx="${size/2}" cy="${size/2}" r="${size * 0.35}" fill="#6366f1" opacity="0.9"/>
      
      <!-- Question mark -->
      <text x="${size/2}" y="${size/2 + size * 0.12}" font-family="Arial Black, Arial" font-size="${size * 0.35}" 
            font-weight="bold" text-anchor="middle" fill="white">?</text>
      
      <!-- App name -->
      <text x="${size/2}" y="${size * 0.88}" font-family="Arial, sans-serif" font-size="${size * 0.063}" 
            font-weight="bold" text-anchor="middle" fill="white">TRIVIA</text>
    </svg>
  `
  
  return sharp(Buffer.from(svgOverlay))
}

async function generateFavicons(iconDir) {
  const faviconSizes = [16, 32, 48, 64]
  
  for (const size of faviconSizes) {
    const faviconIcon = await createBaseIconAtSize(size)
    await faviconIcon
      .png({ quality: 90 })
      .toFile(path.join(iconDir, `favicon-${size}x${size}.png`))
    console.log(`✓ Generated favicon-${size}x${size}.png`)
  }
  
  // Generate traditional favicon.ico (use PNG instead as ICO not supported)
  const faviconIco = await createBaseIconAtSize(32)
  await faviconIco
    .png({ quality: 90 })
    .toFile(path.join(iconDir, 'favicon.png'))
  console.log('✓ Generated favicon.png')
  
  // Apple touch icons
  const appleSizes = [57, 72, 76, 114, 120, 144, 152, 180]
  for (const size of appleSizes) {
    const appleIcon = await createBaseIconAtSize(size)
    await appleIcon
      .png({ quality: 90 })
      .toFile(path.join(iconDir, `apple-touch-icon-${size}x${size}.png`))
    console.log(`✓ Generated apple-touch-icon-${size}x${size}.png`)
  }
  
  // Default apple touch icon
  const defaultAppleIcon = await createBaseIconAtSize(180)
  await defaultAppleIcon
    .png({ quality: 90 })
    .toFile(path.join(iconDir, 'apple-touch-icon.png'))
  console.log('✓ Generated apple-touch-icon.png')
}

// Run the generator
if (import.meta.url === `file://${process.argv[1]}`) {
  generateIcons().catch(console.error)
}

export { generateIcons, ICON_SIZES }
