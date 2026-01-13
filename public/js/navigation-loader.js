/**
 * Navigation Loading Helper
 * Shows loading page during slow page transitions
 */

class NavigationLoader {
    constructor() {
        this.loadingPage = '/loading';
        this.loadingThreshold = 500; // Show loading after 500ms
        this.isLoading = false;
        this.init();
    }

    init() {
        // Add loading styles to head
        this.addLoadingStyles();
        
        // Intercept navigation clicks
        this.interceptNavigation();
        
        // Show loading on page unload
        this.setupPageUnload();
    }

    addLoadingStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .nav-loading-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.95);
                z-index: 9999;
                display: none;
                align-items: center;
                justify-content: center;
                backdrop-filter: blur(5px);
            }
            
            .nav-loading-content {
                text-align: center;
                color: #d6a45a;
                font-family: 'Playfair Display', serif;
            }
            
            .nav-loading-spinner {
                width: 60px;
                height: 60px;
                border: 3px solid rgba(214, 164, 90, 0.2);
                border-top: 3px solid #d6a45a;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 1rem;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .nav-loading-text {
                font-size: 1.5rem;
                margin-bottom: 1rem;
                text-shadow: 0 0 10px rgba(214, 164, 90, 0.5);
            }
            
            .nav-loading-subtitle {
                font-size: 1rem;
                color: #ccc;
                font-style: italic;
            }
        `;
        document.head.appendChild(style);
    }

    interceptNavigation() {
        // Intercept all navigation clicks
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && this.shouldInterceptLink(link)) {
                this.handleNavigationClick(link, e);
            }
        });
    }

    shouldInterceptLink(link) {
        const href = link.getAttribute('href');
        
        // Don't intercept external links, anchors, or special links
        if (!href || 
            href.startsWith('#') || 
            href.startsWith('javascript:') || 
            href.startsWith('mailto:') || 
            href.startsWith('tel:') ||
            href.includes('://') && !href.includes(window.location.hostname)) {
            return false;
        }

        // Don't intercept if link has data-no-loading attribute
        if (link.hasAttribute('data-no-loading')) {
            return false;
        }

        // Only intercept internal navigation links
        return href.startsWith('/') || href.includes(window.location.hostname);
    }

    handleNavigationClick(link, event) {
        const href = link.getAttribute('href');
        
        // Check if it's a different page
        if (href !== window.location.pathname) {
            event.preventDefault();
            
            // Show loading after threshold
            setTimeout(() => {
                if (!this.isLoading) {
                    this.showLoading(href);
                }
            }, this.loadingThreshold);
            
            // Navigate to the page
            setTimeout(() => {
                window.location.href = href;
            }, 100);
        }
    }

    showLoading(targetUrl) {
        this.isLoading = true;
        
        // Create loading overlay
        const overlay = document.createElement('div');
        overlay.className = 'nav-loading-overlay';
        overlay.style.display = 'flex';
        
        overlay.innerHTML = `
            <div class="nav-loading-content">
                <div class="nav-loading-spinner"></div>
                <div class="nav-loading-text">Loading Rabuste Experience...</div>
                <div class="nav-loading-subtitle">Please wait while we prepare your bold moment</div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // Add fade-in effect
        setTimeout(() => {
            overlay.style.opacity = '1';
        }, 10);
    }

    setupPageUnload() {
        // Show loading when user is leaving the page
        window.addEventListener('beforeunload', () => {
            this.showLoading();
        });
        
        // Show loading on back/forward buttons
        window.addEventListener('pageshow', (event) => {
            if (event.persisted) {
                this.hideLoading();
            }
        });
    }

    hideLoading() {
        const overlay = document.querySelector('.nav-loading-overlay');
        if (overlay) {
            overlay.style.opacity = '0';
            setTimeout(() => {
                overlay.remove();
            }, 300);
        }
        this.isLoading = false;
    }

    // Public method to manually show loading
    show() {
        this.showLoading();
    }

    // Public method to manually hide loading
    hide() {
        this.hideLoading();
    }
}

// Initialize the navigation loader
document.addEventListener('DOMContentLoaded', () => {
    window.navLoader = new NavigationLoader();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NavigationLoader;
}
