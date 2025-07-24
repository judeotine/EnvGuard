const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function convertSvgToPng() {
  try {
    const inputPath = path.join(__dirname, '../assets/logo/envguard-logo.svg');
    const outputPath = path.join(__dirname, '../assets/logo/envguard-logo.png');
    
    await sharp(inputPath, { density: 300 })
      .resize(512, 512, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 } 
      })
      .toFile(outputPath);
    
    console.log(`Successfully converted ${path.basename(inputPath)} to ${path.basename(outputPath)}`);
    
    const faviconPath = path.join(__dirname, '../assets/logo/favicon.ico');
    await sharp(inputPath)
      .resize(32, 32)
      .toFormat('png')
      .toFile(faviconPath);
    
    console.log(`Created favicon.ico`);
    
  } catch (error) {
    console.error(' Error during conversion:', error);
    process.exit(1);
  }
}

convertSvgToPng();
