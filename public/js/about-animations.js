/**
 * About Page Animations - Clean & Smooth
 * Enhanced interactions and animations for the about page
 */

document.addEventListener('DOMContentLoaded', function() {
  console.log('About page animations initialized');
  
  // Smooth scroll for internal links
  const smoothScrollLinks = document.querySelectorAll('a[href^="#"]');
  smoothScrollLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
  
  // Intersection Observer for fade-in animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        
        // Animate counters
        if (entry.target.classList.contains('stat-number')) {
          animateCounter(entry.target);
        }
      }
    });
  }, observerOptions);
  
  // Add fade-in animation to elements
  const animatedElements = document.querySelectorAll('.story-content, .story-images, .process-step, .about-team-card, .cta-content');
  animatedElements.forEach(element => {
    element.classList.add('fade-in');
    observer.observe(element);
  });
  
  // Counter Animation
  function animateCounter(element) {
    const target = parseInt(element.dataset.count);
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;
    
    const updateCounter = () => {
      current += increment;
      if (current < target) {
        if (target === 2019) {
          element.textContent = Math.floor(current);
        } else if (target >= 10000) {
          element.textContent = Math.floor(current / 1000) + 'K+';
        } else {
          element.textContent = Math.floor(current) + '+';
        }
        requestAnimationFrame(updateCounter);
      } else {
        if (target === 2019) {
          element.textContent = target;
        } else if (target >= 10000) {
          element.textContent = '10K+';
        } else {
          element.textContent = target + '+';
        }
      }
    };
    
    updateCounter();
  }
  
  // Experience Slider
  let currentSlide = 0;
  const slides = document.querySelectorAll('.experience-slider .slide');
  const dots = document.querySelectorAll('.slider-dots .dot');
  const prevBtn = document.querySelector('.slider-btn.prev');
  const nextBtn = document.querySelector('.slider-btn.next');
  
  function showSlide(index) {
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    if (slides[index]) {
      slides[index].classList.add('active');
      dots[index].classList.add('active');
    }
  }
  
  function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
  }
  
  function prevSlide() {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(currentSlide);
  }
  
  // Slider controls
  if (nextBtn) nextBtn.addEventListener('click', nextSlide);
  if (prevBtn) prevBtn.addEventListener('click', prevSlide);
  
  // Dot navigation
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      currentSlide = index;
      showSlide(currentSlide);
    });
  });
  
  // Auto-advance slider
  setInterval(nextSlide, 5000);
  
  // Testimonial Slider
  let currentTestimonial = 0;
  const testimonials = document.querySelectorAll('.testimonial');
  const testDots = document.querySelectorAll('.test-dots .test-dot');
  const testPrevBtn = document.querySelector('.test-btn.prev');
  const testNextBtn = document.querySelector('.test-btn.next');
  
  function showTestimonial(index) {
    testimonials.forEach(testimonial => testimonial.classList.remove('active'));
    testDots.forEach(dot => dot.classList.remove('active'));
    
    if (testimonials[index]) {
      testimonials[index].classList.add('active');
      testDots[index].classList.add('active');
    }
  }
  
  function nextTestimonial() {
    currentTestimonial = (currentTestimonial + 1) % testimonials.length;
    showTestimonial(currentTestimonial);
  }
  
  function prevTestimonial() {
    currentTestimonial = (currentTestimonial - 1 + testimonials.length) % testimonials.length;
    showTestimonial(currentTestimonial);
  }
  
  // Testimonial controls
  if (testNextBtn) testNextBtn.addEventListener('click', nextTestimonial);
  if (testPrevBtn) testPrevBtn.addEventListener('click', prevTestimonial);
  
  // Testimonial dot navigation
  testDots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      currentTestimonial = index;
      showTestimonial(currentTestimonial);
    });
  });
  
  // Auto-advance testimonials
  setInterval(nextTestimonial, 4000);
  
  // Enhanced hover effects for team cards
  const teamCards = document.querySelectorAll('.about-team-card');
  teamCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-8px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0) scale(1)';
    });
  });
  
  // Parallax effect for hero section
  const heroSection = document.querySelector('.about-hero-section');
  if (heroSection) {
    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      const rate = scrolled * -0.3;
      
      // Apply parallax to floating beans
      const beans = document.querySelectorAll('.coffee-bean');
      beans.forEach((bean, index) => {
        const speed = 0.5 + (index * 0.1);
        bean.style.transform = `translateY(${scrolled * speed}px) rotate(${scrolled * 0.1}deg)`;
      });
    });
  }
  
  // Back to Top Button
  const backToTopBtn = document.getElementById('backToTop');
  if (backToTopBtn) {
    window.addEventListener('scroll', () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      if (scrollTop > 300) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    });
    
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
  
  // Image lazy loading and animation
  const images = document.querySelectorAll('img');
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        
        // Add loading state
        img.style.opacity = '0';
        img.style.transform = 'scale(1.1)';
        
        // Handle image load
        const handleImageLoad = () => {
          img.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
          img.style.opacity = '1';
          img.style.transform = 'scale(1)';
        };
        
        // Handle image error
        const handleImageError = () => {
          console.log('Image failed to load:', img.src);
          img.style.opacity = '0.5';
          img.alt = 'Image not available';
        };
        
        if (img.complete) {
          handleImageLoad();
        } else {
          img.addEventListener('load', handleImageLoad);
          img.addEventListener('error', handleImageError);
        }
        
        imageObserver.unobserve(img);
      }
    });
  });
  
  images.forEach(img => {
    imageObserver.observe(img);
  });
  
  // Keyboard navigation
  document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowLeft') {
      prevSlide();
      prevTestimonial();
    } else if (e.key === 'ArrowRight') {
      nextSlide();
      nextTestimonial();
    }
  });
  
  // Touch/swipe support
  let touchStartX = 0;
  let touchEndX = 0;
  
  const sliders = document.querySelectorAll('.experience-slider, .testimonial-slider');
  sliders.forEach(slider => {
    slider.addEventListener('touchstart', function(e) {
      touchStartX = e.changedTouches[0].screenX;
    });
    
    slider.addEventListener('touchend', function(e) {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    });
  });
  
  function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        nextSlide();
        nextTestimonial();
      } else {
        prevSlide();
        prevTestimonial();
      }
    }
  }
  
  // Add smooth reveal animation to sections
  const sections = document.querySelectorAll('section');
  sections.forEach((section, index) => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(50px)';
    
    setTimeout(() => {
      section.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
      section.style.opacity = '1';
      section.style.transform = 'translateY(0)';
    }, index * 200);
  });
  
  // Performance optimization
  const handleVisibilityChange = () => {
    if (document.hidden) {
      document.body.style.animationPlayState = 'paused';
    } else {
      document.body.style.animationPlayState = 'running';
    }
  };
  
  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  console.log('Enhanced about page animations loaded successfully');
});