/**
 * Image Optimization and Lazy Loading Module
 * Handles progressive image loading and format optimization
 */

class ImageOptimizer {
  constructor() {
    this.lazyImages = [];
    this.imageObserver = null;
    this.init();
  }

  init() {
    // Initialize lazy loading
    this.setupLazyLoading();
    
    // Setup WebP support detection
    this.detectWebPSupport();
    
    // Optimize existing images
    this.optimizeImages();
  }

  /**
   * Setup Intersection Observer for lazy loading
   */
  setupLazyLoading() {
    // Check if Intersection Observer is supported
    if ('IntersectionObserver' in window) {
      this.imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            this.loadImage(img);
            observer.unobserve(img);
          }
        });
      }, {
        // Load images when they're 50px away from viewport
        rootMargin: '50px 0px',
        threshold: 0.01
      });

      // Find all lazy images
      this.lazyImages = document.querySelectorAll('img[data-src], [data-bg-src]');
      this.lazyImages.forEach(img => {
        this.imageObserver.observe(img);
      });
    } else {
      // Fallback for browsers without Intersection Observer
      this.loadAllImages();
    }
  }

  /**
   * Load a single image with WebP support
   */
  loadImage(element) {
    const isBackgroundImage = element.hasAttribute('data-bg-src');
    
    if (isBackgroundImage) {
      this.loadBackgroundImage(element);
    } else {
      this.loadRegularImage(element);
    }
  }

  /**
   * Load regular img element
   */
  loadRegularImage(img) {
    const src = img.getAttribute('data-src');
    const webpSrc = img.getAttribute('data-webp-src');
    
    // Use WebP if supported and available
    if (this.supportsWebP && webpSrc) {
      img.src = webpSrc;
    } else {
      img.src = src;
    }
    
    // Add loading class for fade-in effect
    img.classList.add('loading');
    
    img.onload = () => {
      img.classList.remove('loading');
      img.classList.add('loaded');
    };
    
    img.onerror = () => {
      // Fallback to original format if WebP fails
      if (img.src === webpSrc && src) {
        img.src = src;
      }
      img.classList.remove('loading');
      img.classList.add('error');
    };
  }

  /**
   * Load background image
   */
  loadBackgroundImage(element) {
    const src = element.getAttribute('data-bg-src');
    const webpSrc = element.getAttribute('data-bg-webp-src');
    
    // Create a new image to preload
    const img = new Image();
    
    img.onload = () => {
      element.style.backgroundImage = `url(${img.src})`;
      element.classList.remove('loading');
      element.classList.add('loaded');
    };
    
    img.onerror = () => {
      // Fallback to original format if WebP fails
      if (img.src === webpSrc && src) {
        img.src = src;
        return;
      }
      element.classList.remove('loading');
      element.classList.add('error');
    };
    
    // Use WebP if supported and available
    if (this.supportsWebP && webpSrc) {
      img.src = webpSrc;
    } else {
      img.src = src;
    }
    
    element.classList.add('loading');
  }

  /**
   * Fallback: load all images immediately
   */
  loadAllImages() {
    this.lazyImages.forEach(img => {
      this.loadImage(img);
    });
  }

  /**
   * Detect WebP support
   */
  detectWebPSupport() {
    return new Promise((resolve) => {
      const webP = new Image();
      webP.onload = webP.onerror = () => {
        this.supportsWebP = (webP.height === 2);
        resolve(this.supportsWebP);
      };
      webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });
  }

  /**
   * Optimize existing images by adding responsive attributes
   */
  optimizeImages() {
    // Add responsive loading to existing images
    const existingImages = document.querySelectorAll('img:not([data-src])');
    existingImages.forEach(img => {
      // Add loading="lazy" for native lazy loading support
      if (!img.hasAttribute('loading')) {
        img.setAttribute('loading', 'lazy');
      }
      
      // Add decoding="async" for better performance
      if (!img.hasAttribute('decoding')) {
        img.setAttribute('decoding', 'async');
      }
    });
  }

  /**
   * Create responsive image sources
   */
  createResponsiveImage(basePath, alt, sizes = '100vw') {
    const extension = basePath.split('.').pop();
    const baseName = basePath.replace(`.${extension}`, '');
    
    return `
      <picture>
        <source 
          srcset="${baseName}-320w.webp 320w, ${baseName}-640w.webp 640w, ${baseName}-1024w.webp 1024w"
          sizes="${sizes}"
          type="image/webp"
        >
        <source 
          srcset="${baseName}-320w.${extension} 320w, ${baseName}-640w.${extension} 640w, ${baseName}-1024w.${extension} 1024w"
          sizes="${sizes}"
        >
        <img 
          src="${basePath}" 
          alt="${alt}"
          loading="lazy"
          decoding="async"
          class="responsive-image"
        >
      </picture>
    `;
  }

  /**
   * Preload critical images
   */
  preloadCriticalImages() {
    const criticalImages = [
      '/assets/logo-icon.png',
      '/assets/coffee-bg.jpeg'
    ];

    criticalImages.forEach(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
    });
  }
}

// CSS for image loading states
const imageOptimizationCSS = `
  .loading {
    opacity: 0;
    transition: opacity 0.3s ease-in-out;
  }
  
  .loaded {
    opacity: 1;
  }
  
  .error {
    opacity: 0.5;
    background-color: #f5f1eb;
  }
  
  .responsive-image {
    max-width: 100%;
    height: auto;
  }
  
  /* Placeholder for lazy loaded background images */
  [data-bg-src].loading {
    background-color: #f5f1eb;
    background-image: linear-gradient(45deg, transparent 25%, rgba(60, 36, 21, 0.1) 25%, rgba(60, 36, 21, 0.1) 50%, transparent 50%, transparent 75%, rgba(60, 36, 21, 0.1) 75%);
    background-size: 20px 20px;
    animation: loading-shimmer 1.5s infinite linear;
  }
  
  @keyframes loading-shimmer {
    0% { background-position: 0 0; }
    100% { background-position: 20px 20px; }
  }
`;

// Inject CSS
const style = document.createElement('style');
style.textContent = imageOptimizationCSS;
document.head.appendChild(style);

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.imageOptimizer = new ImageOptimizer();
  });
} else {
  window.imageOptimizer = new ImageOptimizer();
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ImageOptimizer;
}