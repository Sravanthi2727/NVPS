/**
 * Parallax Effect for Sections (Excluding Hero)
 * Hero has only video background, other sections have image parallax
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get all sections that need parallax effect (excluding hero)
    const parallaxSections = [
        { element: document.querySelector('.why-robusta-section'), speed: 0.3, type: 'section' },
        { element: document.querySelector('#signature'), speed: 0.4, type: 'section' },
        { element: document.querySelector('#art'), speed: 0.3, type: 'section' },
        { element: document.querySelector('#workshops'), speed: 0.4, type: 'section' },
        { element: document.querySelector('#franchise'), speed: 0.3, type: 'section' }
    ];
    
    // Check if device supports parallax (not mobile)
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
        console.log('Mobile device detected, skipping parallax effect');
        return;
    }
    
    // Parallax scroll effect for sections only
    function updateParallax() {
        const scrolled = window.pageYOffset;
        
        parallaxSections.forEach(section => {
            if (section.element) {
                const rect = section.element.getBoundingClientRect();
                const elementTop = rect.top + scrolled;
                const elementHeight = rect.height;
                const windowHeight = window.innerHeight;
                
                // Check if element is in viewport
                if (scrolled + windowHeight > elementTop && scrolled < elementTop + elementHeight) {
                    const yPos = (scrolled - elementTop) * section.speed;
                    
                    // Apply parallax to section background using CSS custom property
                    section.element.style.setProperty('--parallax-y', `${yPos}px`);
                }
            }
        });
    }
    
    // Throttle scroll events for better performance
    let ticking = false;
    
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }
    
    function handleScroll() {
        ticking = false;
        requestTick();
    }
    
    // Add scroll event listener
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Handle window resize
    window.addEventListener('resize', function() {
        const newIsMobile = window.innerWidth <= 768;
        
        if (newIsMobile && !isMobile) {
            // Switched to mobile, remove parallax
            parallaxSections.forEach(section => {
                if (section.element) {
                    section.element.style.setProperty('--parallax-y', '0px');
                }
            });
            window.removeEventListener('scroll', handleScroll);
        } else if (!newIsMobile && isMobile) {
            // Switched to desktop, add parallax back
            window.addEventListener('scroll', handleScroll, { passive: true });
        }
    });
    
    console.log('✅ Parallax effect initialized for sections only - Hero has video background');
});