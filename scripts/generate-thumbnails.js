const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sourceDirectories = [
  { src: 'public/images', dest: 'public/images/thumbnails', recursive: false },
  { src: 'public/images/gallery', dest: 'public/images/gallery/thumbnails', recursive: false }
];

// Configuration thumbnails
const config = {
  width: 30,
  quality: 30,
  format: 'webp'
};

async function generateThumbnail(sourcePath, destinationPath) {
  try {
    // Ensure destination directory exists
    const destDir = path.dirname(destinationPath);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    // Generate thumbnail
    await sharp(sourcePath)
      .resize(config.width)
      .webp({ quality: config.quality })
      .toFile(destinationPath);

    console.log(`✓ Generated thumbnail: ${path.basename(destinationPath)}`);
  } catch (error) {
    console.error(`✗ Error generating thumbnail for ${sourcePath}:`, error.message);
  }
}

async function processDirectory(sourceDir, destinationDir, isRecursive = false) {
  try {
    if (!fs.existsSync(destinationDir)) {
      fs.mkdirSync(destinationDir, { recursive: true });
    }

    const files = fs.readdirSync(sourceDir);
    
    for (const file of files) {
      const sourcePath = path.join(sourceDir, file);
      const stats = fs.statSync(sourcePath);
      
      if (stats.isDirectory() && isRecursive) {
        const nestedDestDir = path.join(destinationDir, file);
        await processDirectory(sourcePath, nestedDestDir, isRecursive);
      } else if (stats.isFile() && /\.(jpg|jpeg|png|webp|gif)$/i.test(file)) {
        // Only process image files
        const thumbFilename = `${path.parse(file).name}-thumb.webp`;
        const destinationPath = path.join(destinationDir, thumbFilename);
        await generateThumbnail(sourcePath, destinationPath);
      }
    }
  } catch (error) {
    console.error(`✗ Error processing directory ${sourceDir}:`, error.message);
  }
}

async function main() {
  console.log('↻ Starting thumbnail generation process...');
  
  for (const dir of sourceDirectories) {
    console.log(`\n⌂ Processing directory: ${dir.src}`);
    await processDirectory(dir.src, dir.dest, dir.recursive);
  }
  
  console.log('\n✧ Thumbnail generation complete!');
}

main().catch(error => {
  console.error('✗ An error occurred during thumbnail generation:', error);
  process.exit(1);
});
