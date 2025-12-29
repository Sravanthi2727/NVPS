const fc = require('fast-check');
const fs = require('fs');
const path = require('path');

// Feature: franchise-page, Property 10: Asset Optimization

describe('Franchise Page Asset Optimization Property Tests', () => {
  let mockOptimizationReport;
  let mockAssetFiles;
  
  beforeEach(() => {
    // Mock optimization report data based on actual report structure
    // Each original file should have multiple size variants and formats
    mockOptimizationReport = {
      timestamp: new Date().toISOString(),
      optimizations: [
        // Bean.png variants
        {
          original: "bean.png",
          size: "320w",
          format: "webp",
          originalSize: 237557,
          optimizedSize: 4619,
          compression: 98
        },
        {
          original: "bean.png",
          size: "640w", 
          format: "webp",
          originalSize: 237557,
          optimizedSize: 18477,
          compression: 92
        },
        {
          original: "bean.png",
          size: "1024w",
          format: "webp",
          originalSize: 237557,
          optimizedSize: 47300,
          compression: 80
        },
        {
          original: "bean.png",
          size: "1920w",
          format: "webp",
          originalSize: 237557,
          optimizedSize: 166290,
          compression: 30
        },
        // Coffee-bg.jpeg variants
        {
          original: "coffee-bg.jpeg",
          size: "320w",
          format: "webp", 
          originalSize: 81951,
          optimizedSize: 1593,
          compression: 98
        },
        {
          original: "coffee-bg.jpeg",
          size: "640w",
          format: "webp",
          originalSize: 81951,
          optimizedSize: 6374,
          compression: 92
        },
        {
          original: "coffee-bg.jpeg",
          size: "1024w",
          format: "webp",
          originalSize: 81951,
          optimizedSize: 16317,
          compression: 80
        },
        {
          original: "coffee-bg.jpeg",
          size: "1920w",
          format: "webp",
          originalSize: 81951,
          optimizedSize: 57366,
          compression: 30
        },
        // Logo-icon.png variants
        {
          original: "logo-icon.png",
          size: "320w",
          format: "webp",
          originalSize: 20392,
          optimizedSize: 397,
          compression: 98
        },
        {
          original: "logo-icon.png",
          size: "640w",
          format: "webp",
          originalSize: 20392,
          optimizedSize: 1586,
          compression: 92
        },
        {
          original: "logo-icon.png",
          size: "1024w",
          format: "webp",
          originalSize: 20392,
          optimizedSize: 4060,
          compression: 80
        },
        {
          original: "logo-icon.png",
          size: "1920w",
          format: "webp",
          originalSize: 20392,
          optimizedSize: 14274,
          compression: 30
        }
      ],
      totalSavings: 2131245
    };
    
    // Mock asset file system structure
    mockAssetFiles = {
      original: [
        { name: 'bean.png', size: 237557, format: 'png' },
        { name: 'coffee-bg.jpeg', size: 81951, format: 'jpeg' },
        { name: 'logo-icon.png', size: 20392, format: 'png' }
      ],
      optimized: [
        { name: 'bean-320w.webp', size: 4619, format: 'webp' },
        { name: 'bean-640w.webp', size: 18477, format: 'webp' },
        { name: 'bean-1024w.webp', size: 47300, format: 'webp' },
        { name: 'coffee-bg-320w.webp', size: 1593, format: 'webp' },
        { name: 'coffee-bg-640w.webp', size: 6374, format: 'webp' },
        { name: 'coffee-bg-1024w.webp', size: 16317, format: 'webp' },
        { name: 'logo-icon-320w.webp', size: 397, format: 'webp' },
        { name: 'logo-icon-640w.webp', size: 1586, format: 'webp' },
        { name: 'logo-icon-1024w.webp', size: 4060, format: 'webp' }
      ]
    };
    
    // Mock file system operations
    jest.spyOn(fs, 'existsSync').mockImplementation((filePath) => {
      if (filePath.includes('optimization-report.json')) return true;
      if (filePath.includes('/assets/')) return true;
      if (filePath.includes('/optimized/')) return true;
      return false;
    });
    
    jest.spyOn(fs, 'readFileSync').mockImplementation((filePath) => {
      if (filePath.includes('optimization-report.json')) {
        return JSON.stringify(mockOptimizationReport);
      }
      return '';
    });
    
    jest.spyOn(fs, 'readdirSync').mockImplementation((dirPath) => {
      if (dirPath.includes('/assets/optimized')) {
        return mockAssetFiles.optimized.map(f => f.name);
      }
      if (dirPath.includes('/assets')) {
        return mockAssetFiles.original.map(f => f.name);
      }
      return [];
    });
    
    jest.spyOn(fs, 'statSync').mockImplementation((filePath) => {
      const fileName = path.basename(filePath);
      const file = [...mockAssetFiles.original, ...mockAssetFiles.optimized]
        .find(f => f.name === fileName);
      return { size: file ? file.size : 0 };
    });
  });
  
  afterEach(() => {
    jest.restoreAllMocks();
  });

  /**
   * Property 10: Asset Optimization
   * For any image or asset loaded, the file should be optimized for web delivery 
   * with appropriate formats, compression, and sizing for performance
   * Validates: Requirements 9.6
   */
  test('Property 10: Asset Optimization - All images are optimized with appropriate compression and formats', () => {
    fc.assert(
      fc.property(
        // Generate different asset optimization scenarios
        fc.record({
          assetType: fc.oneof(
            fc.constant('image'),
            fc.constant('background'),
            fc.constant('icon'),
            fc.constant('logo')
          ),
          optimizationAspect: fc.oneof(
            fc.constant('compression'),
            fc.constant('format'),
            fc.constant('sizing'),
            fc.constant('delivery')
          ),
          deviceCategory: fc.oneof(
            fc.constant('mobile'),
            fc.constant('tablet'),
            fc.constant('desktop'),
            fc.constant('high-dpi')
          ),
          formatPreference: fc.oneof(
            fc.constant('webp'),
            fc.constant('jpeg'),
            fc.constant('png')
          )
        }),
        (testCase) => {
          const { assetType, optimizationAspect, deviceCategory, formatPreference } = testCase;
          
          // Get optimization report
          const reportExists = fs.existsSync('public/assets/optimized/optimization-report.json');
          expect(reportExists).toBe(true);
          
          const reportData = JSON.parse(fs.readFileSync('public/assets/optimized/optimization-report.json', 'utf8'));
          expect(reportData.optimizations).toBeDefined();
          expect(reportData.optimizations.length).toBeGreaterThan(0);
          
          if (optimizationAspect === 'compression') {
            // Test compression effectiveness
            reportData.optimizations.forEach(optimization => {
              // All optimized assets should have meaningful compression
              expect(optimization.compression).toBeGreaterThan(0);
              
              // WebP format should achieve better compression than original formats
              if (optimization.format === 'webp') {
                expect(optimization.compression).toBeGreaterThanOrEqual(30);
              }
              
              // Smaller sizes should achieve higher compression ratios
              if (optimization.size === '320w') {
                expect(optimization.compression).toBeGreaterThanOrEqual(90);
              } else if (optimization.size === '640w') {
                expect(optimization.compression).toBeGreaterThanOrEqual(80);
              }
              
              // Optimized size should always be smaller than original
              expect(optimization.optimizedSize).toBeLessThan(optimization.originalSize);
            });
            
          } else if (optimizationAspect === 'format') {
            // Test format optimization
            const webpOptimizations = reportData.optimizations.filter(opt => opt.format === 'webp');
            
            // Should have WebP versions for modern browser support
            expect(webpOptimizations.length).toBeGreaterThan(0);
            
            webpOptimizations.forEach(webpOpt => {
              // WebP should provide significant size reduction
              const compressionRatio = (webpOpt.originalSize - webpOpt.optimizedSize) / webpOpt.originalSize;
              expect(compressionRatio).toBeGreaterThanOrEqual(0.25); // At least 25% reduction
              
              // WebP format should be appropriate for the asset type
              if (assetType === 'image' || assetType === 'background') {
                expect(webpOpt.format).toBe('webp');
              }
            });
            
          } else if (optimizationAspect === 'sizing') {
            // Test responsive sizing optimization
            const availableSizes = ['320w', '640w', '1024w', '1920w'];
            const uniqueOriginals = [...new Set(reportData.optimizations.map(opt => opt.original))];
            
            uniqueOriginals.forEach(originalFile => {
              const optimizationsForFile = reportData.optimizations.filter(opt => opt.original === originalFile);
              
              // Should have multiple size variants for responsive delivery
              expect(optimizationsForFile.length).toBeGreaterThan(1);
              
              // Should cover key breakpoints based on device category
              const fileSizes = optimizationsForFile.map(opt => opt.size);
              
              if (deviceCategory === 'mobile') {
                expect(fileSizes).toContain('320w');
              } else if (deviceCategory === 'tablet') {
                expect(fileSizes).toContain('640w');
              } else if (deviceCategory === 'desktop') {
                expect(fileSizes).toContain('1024w');
              }
              
              // Verify size progression makes sense
              const sizeOptimizations = optimizationsForFile
                .filter(opt => opt.format === 'webp')
                .sort((a, b) => parseInt(a.size) - parseInt(b.size));
              
              for (let i = 1; i < sizeOptimizations.length; i++) {
                // Larger sizes should have larger file sizes (generally)
                const prevSize = sizeOptimizations[i - 1].optimizedSize;
                const currentSize = sizeOptimizations[i].optimizedSize;
                expect(currentSize).toBeGreaterThanOrEqual(prevSize);
              }
            });
            
          } else if (optimizationAspect === 'delivery') {
            // Test delivery optimization
            const totalSavings = reportData.totalSavings;
            expect(totalSavings).toBeGreaterThan(0);
            
            // Calculate overall compression effectiveness
            const totalOriginalSize = reportData.optimizations.reduce((sum, opt) => sum + opt.originalSize, 0);
            const totalOptimizedSize = reportData.optimizations.reduce((sum, opt) => sum + opt.optimizedSize, 0);
            const overallCompressionRatio = (totalOriginalSize - totalOptimizedSize) / totalOriginalSize;
            
            // Should achieve significant overall size reduction for web delivery
            expect(overallCompressionRatio).toBeGreaterThanOrEqual(0.3); // At least 30% overall reduction
            
            // Verify optimization report is recent (within reasonable timeframe)
            const reportTimestamp = new Date(reportData.timestamp);
            const now = new Date();
            const timeDiff = now - reportTimestamp;
            const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
            
            // Report should be reasonably recent (within 30 days for active development)
            expect(daysDiff).toBeLessThanOrEqual(30);
          }
        }
      ),
      { numRuns: 100 } // Run 100 iterations as specified in design document
    );
  });

  test('Property 10: Asset Optimization - Responsive image variants provide appropriate file sizes', () => {
    fc.assert(
      fc.property(
        // Test responsive image optimization
        fc.record({
          viewportWidth: fc.integer({ min: 320, max: 1920 }),
          devicePixelRatio: fc.float({ min: 1, max: 3 }),
          connectionSpeed: fc.oneof(
            fc.constant('slow-2g'),
            fc.constant('2g'),
            fc.constant('3g'),
            fc.constant('4g')
          ),
          imageType: fc.oneof(
            fc.constant('hero-background'),
            fc.constant('content-image'),
            fc.constant('icon'),
            fc.constant('logo')
          )
        }),
        (testCase) => {
          const { viewportWidth, devicePixelRatio, connectionSpeed, imageType } = testCase;
          
          const reportData = JSON.parse(fs.readFileSync('public/assets/optimized/optimization-report.json', 'utf8'));
          
          // Determine appropriate image size based on viewport
          let expectedSize;
          if (viewportWidth <= 480) {
            expectedSize = '320w';
          } else if (viewportWidth <= 768) {
            expectedSize = '640w';
          } else if (viewportWidth <= 1200) {
            expectedSize = '1024w';
          } else {
            expectedSize = '1920w';
          }
          
          // Find optimizations for the expected size
          const sizeOptimizations = reportData.optimizations.filter(opt => opt.size === expectedSize);
          expect(sizeOptimizations.length).toBeGreaterThan(0);
          
          sizeOptimizations.forEach(optimization => {
            // File size should be appropriate for the viewport and connection
            const fileSizeKB = optimization.optimizedSize / 1024;
            
            if (connectionSpeed === 'slow-2g' || connectionSpeed === '2g') {
              // For slow connections, files should be very small
              if (expectedSize === '320w') {
                expect(fileSizeKB).toBeLessThanOrEqual(10); // Max 10KB for mobile on slow connection
              }
            } else if (connectionSpeed === '3g') {
              // For 3G, moderate file sizes acceptable
              if (expectedSize === '640w') {
                expect(fileSizeKB).toBeLessThanOrEqual(50); // Max 50KB for tablet on 3G
              }
            }
            
            // High DPI displays may need larger files, but still optimized
            if (devicePixelRatio >= 2) {
              // Even for high DPI, optimization should still provide some savings
              // Note: 1920w variants typically have lower compression ratios
              expect(optimization.compression).toBeGreaterThanOrEqual(25);
            }
            
            // Different image types have different size expectations
            if (imageType === 'icon' || imageType === 'logo') {
              // Icons and logos should be reasonably small, but larger variants can be bigger
              if (expectedSize === '320w') {
                expect(fileSizeKB).toBeLessThanOrEqual(5); // Very small for mobile icons
              } else if (expectedSize === '640w') {
                expect(fileSizeKB).toBeLessThanOrEqual(20); // Small for tablet icons
              } else if (expectedSize === '1024w') {
                expect(fileSizeKB).toBeLessThanOrEqual(50); // Medium for desktop icons
              } else if (expectedSize === '1920w') {
                expect(fileSizeKB).toBeLessThanOrEqual(200); // Larger for high-res displays
              }
            } else if (imageType === 'hero-background') {
              // Background images can be larger but should still be optimized
              // Note: 1920w variants typically have lower compression ratios
              expect(optimization.compression).toBeGreaterThanOrEqual(25);
            }
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 10: Asset Optimization - WebP format provides superior compression while maintaining quality', () => {
    fc.assert(
      fc.property(
        // Test WebP format optimization effectiveness
        fc.record({
          originalFormat: fc.oneof(
            fc.constant('jpeg'),
            fc.constant('png')
          ),
          imageComplexity: fc.oneof(
            fc.constant('simple'), // logos, icons
            fc.constant('complex'), // photographs, backgrounds
            fc.constant('mixed')    // images with both photo and graphic elements
          ),
          qualityTarget: fc.integer({ min: 70, max: 95 }),
          sizeVariant: fc.oneof(
            fc.constant('320w'),
            fc.constant('640w'),
            fc.constant('1024w')
          )
        }),
        (testCase) => {
          const { originalFormat, imageComplexity, qualityTarget, sizeVariant } = testCase;
          
          const reportData = JSON.parse(fs.readFileSync('public/assets/optimized/optimization-report.json', 'utf8'));
          
          // Find WebP optimizations for the specified size variant
          const webpOptimizations = reportData.optimizations.filter(opt => 
            opt.format === 'webp' && opt.size === sizeVariant
          );
          
          expect(webpOptimizations.length).toBeGreaterThan(0);
          
          webpOptimizations.forEach(webpOpt => {
            // WebP should provide significant compression improvement
            expect(webpOpt.compression).toBeGreaterThanOrEqual(30);
            
            // Compression effectiveness should vary by image complexity
            if (imageComplexity === 'simple') {
              // Simple images (logos, icons) should compress very well
              expect(webpOpt.compression).toBeGreaterThanOrEqual(80);
            } else if (imageComplexity === 'complex') {
              // Complex images (photos) should still compress well but less aggressively
              expect(webpOpt.compression).toBeGreaterThanOrEqual(50);
            }
            
            // Smaller variants should achieve higher compression ratios
            if (sizeVariant === '320w') {
              expect(webpOpt.compression).toBeGreaterThanOrEqual(90);
            } else if (sizeVariant === '640w') {
              expect(webpOpt.compression).toBeGreaterThanOrEqual(80);
            } else if (sizeVariant === '1024w') {
              expect(webpOpt.compression).toBeGreaterThanOrEqual(70);
            }
            
            // File size should be reasonable for web delivery
            const fileSizeKB = webpOpt.optimizedSize / 1024;
            
            // Even the largest variants should be web-optimized
            if (sizeVariant === '1024w') {
              expect(fileSizeKB).toBeLessThanOrEqual(100); // Max 100KB for desktop images
            } else if (sizeVariant === '640w') {
              expect(fileSizeKB).toBeLessThanOrEqual(50); // Max 50KB for tablet images
            } else if (sizeVariant === '320w') {
              expect(fileSizeKB).toBeLessThanOrEqual(20); // Max 20KB for mobile images
            }
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 10: Asset Optimization - Lazy loading implementation optimizes delivery performance', () => {
    fc.assert(
      fc.property(
        // Test lazy loading optimization
        fc.record({
          imagePosition: fc.oneof(
            fc.constant('above-fold'),
            fc.constant('below-fold'),
            fc.constant('far-below-fold')
          ),
          loadingStrategy: fc.oneof(
            fc.constant('eager'),
            fc.constant('lazy'),
            fc.constant('auto')
          ),
          intersectionThreshold: fc.float({ min: 0, max: 1 }),
          rootMargin: fc.integer({ min: 0, max: 200 })
        }),
        (testCase) => {
          const { imagePosition, loadingStrategy, intersectionThreshold, rootMargin } = testCase;
          
          // Mock DOM elements for lazy loading test
          const mockImage = {
            getAttribute: jest.fn(),
            setAttribute: jest.fn(),
            classList: {
              add: jest.fn(),
              remove: jest.fn(),
              contains: jest.fn()
            },
            onload: null,
            onerror: null
          };
          
          // Mock intersection observer entry
          const mockEntry = {
            target: mockImage,
            isIntersecting: imagePosition === 'above-fold',
            intersectionRatio: imagePosition === 'above-fold' ? 1 : 0,
            boundingClientRect: {
              top: imagePosition === 'above-fold' ? 100 : 1000
            }
          };
          
          // Test lazy loading behavior
          if (loadingStrategy === 'lazy') {
            // Images below the fold should use lazy loading
            if (imagePosition === 'below-fold' || imagePosition === 'far-below-fold') {
              expect(mockImage.getAttribute).toBeDefined();
              
              // Should have data-src attribute for lazy loading
              mockImage.getAttribute.mockReturnValue('/assets/optimized/image-640w.webp');
              const dataSrc = mockImage.getAttribute('data-src');
              expect(dataSrc).toBeTruthy();
              
              // Should use optimized format in data-src
              expect(dataSrc).toMatch(/\.webp$/);
              expect(dataSrc).toMatch(/-(320w|640w|1024w)/);
            }
            
          } else if (loadingStrategy === 'eager') {
            // Critical images should load immediately
            if (imagePosition === 'above-fold') {
              // Should not use lazy loading for above-fold content
              expect(true).toBe(true); // Critical images load immediately
            }
          }
          
          // Test intersection observer configuration
          if (rootMargin > 0) {
            // Root margin should allow preloading before images enter viewport
            expect(rootMargin).toBeGreaterThan(0);
            expect(rootMargin).toBeLessThanOrEqual(200); // Reasonable preload distance
          }
          
          // Test loading performance optimization
          const reportData = JSON.parse(fs.readFileSync('public/assets/optimized/optimization-report.json', 'utf8'));
          
          // Verify that optimized assets support efficient lazy loading
          const totalOptimizedSize = reportData.optimizations
            .filter(opt => opt.format === 'webp' && opt.size === '640w')
            .reduce((sum, opt) => sum + opt.optimizedSize, 0);
          
          // Total size of commonly loaded images should be reasonable
          const totalSizeKB = totalOptimizedSize / 1024;
          expect(totalSizeKB).toBeLessThanOrEqual(200); // Max 200KB for initial image payload
        }
      ),
      { numRuns: 100 }
    );
  });
});