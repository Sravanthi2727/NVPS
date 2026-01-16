// HOME PAGE ANIMATIONS SCRIPT

document.addEventListener('DOMContentLoaded', function() {
    
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                
                // Animate children with stagger effect
                const children = entry.target.querySelectorAll('.signature-image-card, .art-card, .workshop-card');
                children.forEach((child, index) => {
                    setTimeout(() => {
                        child.classList.add('animate');
                    }, index * 150);
                });
            }
        });
    }, observerOptions);

    // Observe all sections
    const sections = document.querySelectorAll('.why-robusta-box, .section-soft, .franchise-card');
    sections.forEach(section => observer.observe(section));

    // Observe individual cards
    const cards = document.querySelectorAll('.signature-image-card, .art-card, .workshop-card');
    cards.forEach(card => observer.observe(card));

    // Observe titles and eyebrows
    const titles = document.querySelectorAll('.section-title, .intro-eyebrow');
    titles.forEach(title => observer.observe(title));

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
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

    // Parallax effect on scroll
    let ticking = false;
    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                const scrolled = window.pageYOffset;
                
                // Parallax for hero
                const hero = document.querySelector('.hero-video-bg');
                if (hero) {
                    hero.style.transform = `translateY(${scrolled * 0.5}px)`;
                }

                // Parallax for sections
                const sections = document.querySelectorAll('.section-soft');
                sections.forEach((section, index) => {
                    const rect = section.getBoundingClientRect();
                    if (rect.top < window.innerHeight && rect.bottom > 0) {
                        const offset = (window.innerHeight - rect.top) * 0.1;
                        section.style.transform = `translateY(${offset}px)`;
                    }
                });

                ticking = false;
            });
            ticking = true;
        }
    });

    // Add hover effect to buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const ripple = document.createElement('span');
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    });

    // Image lazy loading with fade in
    const images = document.querySelectorAll('img[src]');
    images.forEach(img => {
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.5s ease-in';
        
        if (img.complete) {
            img.style.opacity = '1';
        } else {
            img.addEventListener('load', function() {
                this.style.opacity = '1';
            });
        }
    });

    // Counter animation for numbers (if any)
    function animateCounter(element, target, duration = 2000) {
        let start = 0;
        const increment = target / (duration / 16);
        
        const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
                element.textContent = target;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(start);
            }
        }, 16);
    }

    // Observe counters if they exist
    const counters = document.querySelectorAll('[data-counter]');
    counters.forEach(counter => {
        observer.observe(counter);
        counter.addEventListener('animationstart', function() {
            const target = parseInt(this.getAttribute('data-counter'));
            animateCounter(this, target);
        });
    });

    // Add entrance animation to hero content
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        setTimeout(() => {
            heroContent.style.opacity = '1';
        }, 100);
    }

    // Stagger animation for workshop cards
    const workshopCards = document.querySelectorAll('.workshop-card');
    workshopCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.2}s`;
    });

    // Add floating animation to logo
    const logo = document.querySelector('.hero-logo');
    if (logo) {
        setInterval(() => {
            logo.style.animation = 'none';
            setTimeout(() => {
                logo.style.animation = 'fadeInDown 1s ease-out, float 3s ease-in-out infinite';
            }, 10);
        }, 3000);
    }

    // Add typing effect to hero title (optional)
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle && heroTitle.hasAttribute('data-typing')) {
        const text = heroTitle.textContent;
        heroTitle.textContent = '';
        let i = 0;
        
        const typeWriter = setInterval(() => {
            if (i < text.length) {
                heroTitle.textContent += text.charAt(i);
                i++;
            } else {
                clearInterval(typeWriter);
            }
        }, 100);
    }

    console.log('Home page animations initialized');
});

// Add floating keyframe animation
const style = document.createElement('style');
style.textContent = `
    @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
    }
    
    .ripple {
        position: absolute;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.5);
        transform: translate(-50%, -50%);
        animation: rippleEffect 0.6s ease-out;
        pointer-events: none;
    }
    
    @keyframes rippleEffect {
        to {
            width: 200px;
            height: 200px;
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
