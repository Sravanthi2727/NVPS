// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Scroll-triggered animations
const observerOptions = {
    threshold: 0.2,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const target = entry.target;
            
            // Philosophy cards animation
            if (target.classList.contains('philosophy-card')) {
                const columnIndex = Array.from(target.parentNode.parentNode.children).indexOf(target.parentNode);
                const isLeftColumn = columnIndex % 2 === 0;
                
                setTimeout(() => {
                    target.classList.add(isLeftColumn ? 'animate-left' : 'animate-right');
                }, isLeftColumn ? 0 : 400);
            }
            
            // Gallery section animation
            if (target.classList.contains('gallery-grid')) {
                const galleryItems = target.querySelectorAll('.gallery-item');
                galleryItems.forEach((item, index) => {
                    setTimeout(() => {
                        item.classList.add('animate-gallery');
                    }, index * 200);
                });
            }
            
            // Manifesto section animation
            if (target.classList.contains('manifesto-section')) {
                setTimeout(() => {
                    target.classList.add('animate-manifesto');
                }, 200);
            }
            
            // Stop observing once animated
            observer.unobserve(target);
        }
    });
}, observerOptions);

// Observe elements for scroll animations
document.addEventListener('DOMContentLoaded', () => {
    // Observe philosophy cards individually
    document.querySelectorAll('.philosophy-card').forEach(card => {
        observer.observe(card);
    });
    
    // Observe ONLY the entire stats section
    const statsSection = document.querySelector('.stats-section');
    if (statsSection) {
        observer.observe(statsSection);
    }
    
    // Observe manifesto section
    const manifestoSection = document.querySelector('.manifesto-section');
    if (manifestoSection) {
        observer.observe(manifestoSection);
    }
    
    // Observe gallery section for scroll-triggered animations
    const gallerySection = document.querySelector('.gallery-grid');
    if (gallerySection) {
        observer.observe(gallerySection);
    }
});
