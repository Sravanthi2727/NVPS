/**
 * Enhanced Franchise Page JavaScript
 * Clean functionality with smooth animations
 */

document.addEventListener('DOMContentLoaded', function() {
  console.log('Enhanced franchise page loaded');
  
  // Smooth scroll for anchor links
  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  anchorLinks.forEach(link => {
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
  
  // Intersection Observer for animations
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
  const animatedElements = document.querySelectorAll('.feature-item, .investment-card, .timeline-item, .qualification-item, .success-slide');
  animatedElements.forEach(element => {
    element.classList.add('fade-in');
    observer.observe(element);
  });
  
  // Counter Animation
  function animateCounter(element) {
    const text = element.textContent;
    const hasNumber = text.match(/\d+/);
    
    if (hasNumber) {
      const number = parseInt(hasNumber[0]);
      const duration = 2000;
      const increment = number / (duration / 16);
      let current = 0;
      
      const updateCounter = () => {
        current += increment;
        if (current < number) {
          element.textContent = text.replace(/\d+/, Math.floor(current));
          requestAnimationFrame(updateCounter);
        } else {
          element.textContent = text;
        }
      };
      
      updateCounter();
    }
  }
  
  // Success Stories Slider
  let currentSuccess = 0;
  const successSlides = document.querySelectorAll('.success-slide');
  const successDots = document.querySelectorAll('.success-dot');
  const successPrevBtn = document.querySelector('.success-btn.prev');
  const successNextBtn = document.querySelector('.success-btn.next');
  
  function showSuccessSlide(index) {
    successSlides.forEach(slide => slide.classList.remove('active'));
    successDots.forEach(dot => dot.classList.remove('active'));
    
    if (successSlides[index]) {
      successSlides[index].classList.add('active');
      successDots[index].classList.add('active');
    }
  }
  
  function nextSuccess() {
    currentSuccess = (currentSuccess + 1) % successSlides.length;
    showSuccessSlide(currentSuccess);
  }
  
  function prevSuccess() {
    currentSuccess = (currentSuccess - 1 + successSlides.length) % successSlides.length;
    showSuccessSlide(currentSuccess);
  }
  
  // Success slider controls
  if (successNextBtn) successNextBtn.addEventListener('click', nextSuccess);
  if (successPrevBtn) successPrevBtn.addEventListener('click', prevSuccess);
  
  // Success dot navigation
  successDots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      currentSuccess = index;
      showSuccessSlide(currentSuccess);
    });
  });
  
  // Auto-advance success stories
  setInterval(nextSuccess, 5000);
  
  // Form Handling
  const franchiseForm = document.getElementById('franchiseForm');
  const formSuccess = document.getElementById('formSuccess');
  
  if (franchiseForm) {
    franchiseForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Get form data
      const formData = new FormData(this);
      const data = Object.fromEntries(formData);
      
      // Validate form
      if (!validateForm(data)) {
        return;
      }
      
      // Show loading state
      const submitBtn = this.querySelector('button[type="submit"]');
      const btnText = submitBtn.querySelector('.btn-text');
      const btnLoading = submitBtn.querySelector('.btn-loading');
      
      btnText.style.display = 'none';
      btnLoading.style.display = 'flex';
      submitBtn.disabled = true;
      
      // Simulate form submission
      setTimeout(() => {
        // Hide form and show success message
        franchiseForm.style.display = 'none';
        formSuccess.style.display = 'block';
        
        // Scroll to success message
        formSuccess.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
        
        // Log form data (in real app, send to server)
        console.log('Franchise application submitted:', data);
        
        // Reset form
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
        submitBtn.disabled = false;
        franchiseForm.reset();
        
      }, 2000);
    });
  }
  
  // Form Validation
  function validateForm(data) {
    let isValid = true;
    const errors = {};
    
    // Required fields
    const requiredFields = ['fullName', 'email', 'phone', 'city', 'investment', 'timeline'];
    
    requiredFields.forEach(field => {
      if (!data[field] || data[field].trim() === '') {
        errors[field] = 'This field is required';
        isValid = false;
      }
    });
    
    // Email validation
    if (data.email && !isValidEmail(data.email)) {
      errors.email = 'Please enter a valid email address';
      isValid = false;
    }
    
    // Phone validation
    if (data.phone && !isValidPhone(data.phone)) {
      errors.phone = 'Please enter a valid phone number';
      isValid = false;
    }
    
    // Agreement checkbox
    if (!data.agreement) {
      errors.agreement = 'Please accept the terms to continue';
      isValid = false;
    }
    
    // Display errors
    displayFormErrors(errors);
    
    return isValid;
  }
  
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  function isValidPhone(phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  }
  
  function displayFormErrors(errors) {
    // Clear previous errors
    const errorElements = document.querySelectorAll('.form-error');
    errorElements.forEach(el => el.remove());
    
    // Remove error classes
    const inputElements = document.querySelectorAll('.form-group input, .form-group select, .form-group textarea');
    inputElements.forEach(el => el.classList.remove('error'));
    
    // Display new errors
    Object.keys(errors).forEach(field => {
      const input = document.getElementById(field) || document.querySelector(`[name="${field}"]`);
      if (input) {
        input.classList.add('error');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'form-error';
        errorDiv.textContent = errors[field];
        errorDiv.style.color = '#ff6b6b';
        errorDiv.style.fontSize = '0.875rem';
        errorDiv.style.marginTop = '0.25rem';
        
        input.parentNode.appendChild(errorDiv);
      }
    });
  }
  
  // Real-time form validation
  const formInputs = document.querySelectorAll('#franchiseForm input, #franchiseForm select, #franchiseForm textarea');
  formInputs.forEach(input => {
    input.addEventListener('blur', function() {
      validateField(this);
    });
    
    input.addEventListener('input', function() {
      // Clear error state on input
      this.classList.remove('error');
      const errorElement = this.parentNode.querySelector('.form-error');
      if (errorElement) {
        errorElement.remove();
      }
    });
  });
  
  function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    let error = '';
    
    // Required field validation
    if (field.hasAttribute('required') && !value) {
      error = 'This field is required';
    }
    
    // Specific field validations
    if (value) {
      switch (fieldName) {
        case 'email':
          if (!isValidEmail(value)) {
            error = 'Please enter a valid email address';
          }
          break;
        case 'phone':
          if (!isValidPhone(value)) {
            error = 'Please enter a valid phone number';
          }
          break;
      }
    }
    
    // Display error
    if (error) {
      displayFormErrors({ [fieldName]: error });
    }
  }
  
  // Parallax effect for hero section
  const heroSection = document.querySelector('.franchise-hero');
  if (heroSection) {
    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      const rate = scrolled * -0.3;
      
      const heroImage = heroSection.querySelector('.hero-bg-image');
      if (heroImage) {
        heroImage.style.transform = `translateY(${rate}px)`;
      }
    });
  }
  
  // Smooth hover effects for cards
  const cards = document.querySelectorAll('.investment-card, .feature-item, .qualification-item');
  cards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0) scale(1)';
    });
  });
  
  // Keyboard navigation for sliders
  document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowLeft') {
      prevSuccess();
    } else if (e.key === 'ArrowRight') {
      nextSuccess();
    }
  });
  
  // Touch/swipe support for success slider
  let touchStartX = 0;
  let touchEndX = 0;
  
  const successSlider = document.querySelector('.success-slider');
  if (successSlider) {
    successSlider.addEventListener('touchstart', function(e) {
      touchStartX = e.changedTouches[0].screenX;
    });
    
    successSlider.addEventListener('touchend', function(e) {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    });
    
    function handleSwipe() {
      const swipeThreshold = 50;
      const diff = touchStartX - touchEndX;
      
      if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
          nextSuccess();
        } else {
          prevSuccess();
        }
      }
    }
  }
  
  // Performance optimization
  const handleVisibilityChange = () => {
    if (document.hidden) {
      document.body.style.animationPlayState = 'paused';
    } else {
      document.body.style.animationPlayState = 'running';
    }
  };
  
  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  // Initialize animations on load
  const sections = document.querySelectorAll('section');
  sections.forEach((section, index) => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(50px)';
    
    setTimeout(() => {
      section.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
      section.style.opacity = '1';
      section.style.transform = 'translateY(0)';
    }, index * 100);
  });
  
  console.log('Enhanced franchise page functionality loaded successfully');
});