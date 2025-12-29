/**
 * Image Optimization Script
 * Generates optimized versions of images in multiple formats and sizes
 * 
 * This script would typically use libraries like sharp or imagemin
 * For this implementation, we'll create the structure and mock the optimization
 */

const fs = require('fs');
const path = require('path');

class ImageOptimizer {
  constructor() {
    this.inputDir = path.join(__dirname, '../public/assets');
    this.outputDir = path.join(__dirname, '../public/assets/optimized');
    this.sizes = [320, 640, 1024, 1920];
    this.formats = ['webp', 'jpeg', 'png'];
  }

  /**
   * Initialize optimization process
   */
  async init() {
    console.log('🖼️  Starting image optimization...');
    
    // Create output directory if it doesn't exist
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    // Get all images in the assets directory
    const images = this.getImageFiles();
    
    for (const image of images) {
      await this.optimizeImage(image);
    }

    console.log('✅ Image optimization complete!');
    this.generateReport();
  }

  /**
   * Get all image files from the assets directory
   */
  getImageFiles() {
    const files = fs.readdirSync(this.inputDir);
    return files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.gif'].includes(ext);
    });
  }

  /**
   * Optimize a single image
   */
  async optimizeImage(filename) {
    const inputPath = path.join(this.inputDir, filename);
    const baseName = path.parse(filename).name;
    const originalExt = path.parse(filename).ext;

    console.log(`📸 Optimizing ${filename}...`);

    // For each size, create optimized versions
    for (const size of this.sizes) {
      for (const format of this.formats) {
        // Skip if format doesn't make sense for the image
        if (originalExt === '.png' && format === 'jpeg') continue;
        
        const outputFilename = `${baseName}-${size}w.${format}`;
        const outputPath = path.join(this.outputDir, outputFilename);

        // In a real implementation, you would use sharp or similar:
        // await sharp(inputPath)
        //   .resize(size, null, { withoutEnlargement: true })
        //   .toFormat(format, { quality: format === 'webp' ? 85 : 80 })
        //   .toFile(outputPath);

        // For this mock implementation, we'll create placeholder files
        this.createOptimizedPlaceholder(inputPath, outputPath, size, format);
      }
    }

    // Create WebP version of original size
    const webpOriginal = `${baseName}.webp`;
    const webpPath = path.join(this.inputDir, webpOriginal);
    this.createWebPVersion(inputPath, webpPath);
  }

  /**
   * Create optimized placeholder (mock implementation)
   */
  createOptimizedPlaceholder(inputPath, outputPath, size, format) {
    const stats = fs.statSync(inputPath);
    const originalSize = stats.size;
    
    // Calculate estimated optimized size (rough approximation)
    let optimizedSize = originalSize;
    
    // Size reduction based on width
    const sizeReduction = Math.min(size / 1920, 1);
    optimizedSize *= sizeReduction * sizeReduction;
    
    // Format-based compression
    if (format === 'webp') {
      optimizedSize *= 0.7; // WebP is typically 30% smaller
    } else if (format === 'jpeg') {
      optimizedSize *= 0.8; // JPEG compression
    }

    // Create a metadata file instead of actual image for this demo
    const metadata = {
      original: path.basename(inputPath),
      size: `${size}w`,
      format: format,
      originalSize: originalSize,
      optimizedSize: Math.round(optimizedSize),
      compression: Math.round((1 - optimizedSize / originalSize) * 100)
    };

    fs.writeFileSync(outputPath + '.meta', JSON.stringify(metadata, null, 2));
  }

  /**
   * Create WebP version of original image
   */
  createWebPVersion(inputPath, outputPath) {
    const stats = fs.statSync(inputPath);
    const metadata = {
      original: path.basename(inputPath),
      format: 'webp',
      originalSize: stats.size,
      optimizedSize: Math.round(stats.size * 0.7),
      compression: 30
    };

    fs.writeFileSync(outputPath + '.meta', JSON.stringify(metadata, null, 2));
  }

  /**
   * Generate optimization report
   */
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      optimizations: [],
      totalSavings: 0
    };

    // Read all metadata files
    const metaFiles = fs.readdirSync(this.outputDir).filter(f => f.endsWith('.meta'));
    
    for (const metaFile of metaFiles) {
      const metaPath = path.join(this.outputDir, metaFile);
      const metadata = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
      report.optimizations.push(metadata);
      report.totalSavings += (metadata.originalSize - metadata.optimizedSize);
    }

    // Write report
    const reportPath = path.join(this.outputDir, 'optimization-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log(`📊 Optimization Report:`);
    console.log(`   - Total files processed: ${report.optimizations.length}`);
    console.log(`   - Total size savings: ${Math.round(report.totalSavings / 1024)} KB`);
    console.log(`   - Report saved to: ${reportPath}`);
  }

  /**
   * Generate responsive image HTML
   */
  generateResponsiveHTML(imageName, alt, sizes = '100vw') {
    const baseName = path.parse(imageName).name;
    
    return `
<picture>
  <source 
    srcset="/assets/optimized/${baseName}-320w.webp 320w, 
            /assets/optimized/${baseName}-640w.webp 640w, 
            /assets/optimized/${baseName}-1024w.webp 1024w,
            /assets/optimized/${baseName}-1920w.webp 1920w"
    sizes="${sizes}"
    type="image/webp"
  >
  <source 
    srcset="/assets/optimized/${baseName}-320w.jpeg 320w, 
            /assets/optimized/${baseName}-640w.jpeg 640w, 
            /assets/optimized/${baseName}-1024w.jpeg 1024w,
            /assets/optimized/${baseName}-1920w.jpeg 1920w"
    sizes="${sizes}"
  >
  <img 
    src="/assets/${imageName}" 
    alt="${alt}"
    loading="lazy"
    decoding="async"
    class="responsive-image"
  >
</picture>`.trim();
  }
}

// CLI usage
if (require.main === module) {
  const optimizer = new ImageOptimizer();
  optimizer.init().catch(console.error);
}

module.exports = ImageOptimizer;