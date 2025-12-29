/**
 * Background Image Optimization
 * Handles lazy loading of the main background image with WebP support
 */

class BackgroundOptimizer {
  constructor() {
    this.supportsWebP = false;
    this.init();
  }

  async init() {
    // Detect WebP support first
    await this.detectWebPSupport();
    
    // Load background image after page load
    if (document.readyState === 'complete') {
      this.loadBackgroundImage();
    } else {
      window.addEventListener('load', () => {
        this.loadBackgroundImage();
      });
    }
  }

  /**
   * Detect WebP support
   */
  detectWebPSupport() {
    return new Promise((resolve) => {
      const webP = new Image();
      webP.onload = webP.onerror = () => {
        this.supportsWebP = (webP.height === 2);
        if (this.supportsWebP) {
          document.body.classList.add('webp-support');
        }
        resolve(this.supportsWebP);
      };
      webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });
  }

  /**
   * Load background image with optimization
   */
  loadBackgroundImage() {
    const img = new Image();
    
    img.onload = () => {
      // Add class to trigger CSS background
      document.body.classList.add('bg-loaded');
      
      // Fade in effect
      document.body.style.transition = 'background-image 0.5s ease-in-out';
    };
    
    img.onerror = () => {
      // Fallback to JPEG if WebP fails
      if (this.supportsWebP) {
        this.supportsWebP = false;
        document.body.classList.remove('webp-support');
        this.loadBackgroundImage();
      }
    };
    
    // Choose format based on support
    if (this.supportsWebP) {
      img.src = '/assets/coffee-bg.webp';
    } else {
      img.src = '/assets/coffee-bg.jpeg';
    }
  }

  /**
   * Preload critical images for better performance
   */
  preloadCriticalImages() {
    const criticalImages = [
      '/assets/logo-icon.png'
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

// Initialize background optimizer
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.backgroundOptimizer = new BackgroundOptimizer();
  });
} else {
  window.backgroundOptimizer = new BackgroundOptimizer();
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BackgroundOptimizer;
}