// Lazy loading for images and components
class LazyLoader {
  constructor() {
    this.imageObserver = null;
    this.componentObserver = null;
    this.init();
  }

  init() {
    // Set up intersection observer for images
    if ('IntersectionObserver' in window) {
      this.setupImageObserver();
      this.setupComponentObserver();
    } else {
      // Fallback for older browsers
      this.loadAllImages();
    }
  }

  setupImageObserver() {
    const imageOptions = {
      root: null,
      rootMargin: '50px 0px',
      threshold: 0.01
    };

    this.imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          this.loadImage(img);
          observer.unobserve(img);
        }
      });
    }, imageOptions);

    // Observe all images with data-src
    document.querySelectorAll('img[data-src]').forEach(img => {
      this.imageObserver.observe(img);
    });
  }

  setupComponentObserver() {
    const componentOptions = {
      root: null,
      rootMargin: '100px 0px',
      threshold: 0.01
    };

    this.componentObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const component = entry.target;
          this.loadComponent(component);
          observer.unobserve(component);
        }
      });
    }, componentOptions);

    // Observe all components with data-lazy-component
    document.querySelectorAll('[data-lazy-component]').forEach(component => {
      this.componentObserver.observe(component);
    });
  }

  loadImage(img) {
    const src = img.dataset.src;
    if (!src) return;

    // Add loading spinner
    img.classList.add('loading');
    
    // Create new image to preload
    const newImg = new Image();
    newImg.onload = () => {
      img.src = src;
      img.classList.remove('loading');
      img.classList.add('loaded');
      img.removeAttribute('data-src');
    };
    
    newImg.onerror = () => {
      img.classList.remove('loading');
      img.classList.add('error');
    };
    
    newImg.src = src;
  }

  loadComponent(component) {
    const componentName = component.dataset.lazyComponent;
    if (!componentName) return;

    // Add loading state
    component.classList.add('component-loading');
    
    // Load component dynamically
    this.loadComponentContent(component, componentName);
  }

  async loadComponentContent(component, componentName) {
    try {
      // Example: Load component content via AJAX
      const response = await fetch(`/components/${componentName}.html`);
      if (response.ok) {
        const html = await response.text();
        component.innerHTML = html;
        component.classList.remove('component-loading');
        component.classList.add('component-loaded');
      }
    } catch (error) {
      console.error('Failed to load component:', componentName);
      component.classList.remove('component-loading');
      component.classList.add('component-error');
    }
  }

  loadAllImages() {
    // Fallback for browsers without IntersectionObserver
    document.querySelectorAll('img[data-src]').forEach(img => {
      this.loadImage(img);
    });
  }

  // Preload critical images
  preloadCriticalImages(urls) {
    urls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = url;
      document.head.appendChild(link);
    });
  }

  // Add new lazy images dynamically
  observeNewImages() {
    document.querySelectorAll('img[data-src]').forEach(img => {
      if (this.imageObserver) {
        this.imageObserver.observe(img);
      } else {
        this.loadImage(img);
      }
    });
  }
}

// Initialize lazy loader when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.lazyLoader = new LazyLoader();
});

// Reinitialize when new content is loaded (for SPA-like behavior)
window.reinitializeLazyLoad = () => {
  if (window.lazyLoader) {
    window.lazyLoader.observeNewImages();
  }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LazyLoader;
}
