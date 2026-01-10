/**
 * Franchise Page JavaScript
 * Handles form validation, smooth scrolling, and interactive features
 */

document.addEventListener('DOMContentLoaded', function() {
  
  // ================= FRANCHISE PAGE BACKGROUND OVERRIDE ================= 
  
  // Override main page background for franchise page
  function overrideMainBackground() {
    const body = document.body;
    const franchisePage = document.querySelector('.franchise-page');
    
    if (franchisePage) {
      // Remove main background classes and styles
      body.classList.remove('bg-loaded');
      body.style.backgroundImage = 'none';
      body.style.backgroundColor = '#3C2415';
      
      // Hide the main background overlay
      const overlay = document.querySelector('body::before');
      if (overlay) {
        body.style.setProperty('--overlay-display', 'none');
      }
      
      // Add franchise-specific body class
      body.classList.add('franchise-body');
      
      console.log('Franchise page background override applied');
    }
  }
  
  // Apply background override immediately
  overrideMainBackground();
  
  // ================= CROSS-BROWSER COMPATIBILITY ================= 
  
  // Check for essential browser features and provide fallbacks
  function checkBrowserCompatibility() {
    const features = {
      flexbox: CSS.supports('display', 'flex'),
      grid: CSS.supports('display', 'grid'),
      customProperties: CSS.supports('--test', 'value'),
      smoothScroll: 'scrollBehavior' in document.documentElement.style,
      intersectionObserver: 'IntersectionObserver' in window,
      webp: false // Will be detected asynchronously
    };
    
    // Test WebP support
    const webpTest = new Image();
    webpTest.onload = webpTest.onerror = function() {
      features.webp = (webpTest.height === 2);
      document.documentElement.classList.toggle('webp-support', features.webp);
      document.documentElement.classList.toggle('no-webp', !features.webp);
    };
    webpTest.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    
    // Add feature classes to document
    Object.keys(features).forEach(feature => {
      if (features[feature]) {
        document.documentElement.classList.add(`supports-${feature}`);
      } else {
        document.documentElement.classList.add(`no-${feature}`);
      }
    });
    
    // Provide fallbacks for missing features
    if (!features.smoothScroll) {
      // Polyfill smooth scrolling
      loadSmoothScrollPolyfill();
    }
    
    if (!features.intersectionObserver) {
      // Fallback for scroll animations
      useScrollFallback();
    }
    
    // Log compatibility info for debugging
    console.log('Browser compatibility check:', features);
    
    return features;
  }
  
  function loadSmoothScrollPolyfill() {
    // Simple smooth scroll polyfill
    if (!window.smoothScrollPolyfill) {
      window.smoothScrollPolyfill = function(target, duration = 500) {
        const start = window.pageYOffset;
        const targetPosition = target.getBoundingClientRect().top + start;
        const distance = targetPosition - start;
        let startTime = null;
        
        function animation(currentTime) {
          if (startTime === null) startTime = currentTime;
          const timeElapsed = currentTime - startTime;
          const run = ease(timeElapsed, start, distance, duration);
          window.scrollTo(0, run);
          if (timeElapsed < duration) requestAnimationFrame(animation);
        }
        
        function ease(t, b, c, d) {
          t /= d / 2;
          if (t < 1) return c / 2 * t * t + b;
          t--;
          return -c / 2 * (t * (t - 2) - 1) + b;
        }
        
        requestAnimationFrame(animation);
      };
    }
  }
  
  function useScrollFallback() {
    // Fallback for scroll-triggered animations without IntersectionObserver
    const animateElements = document.querySelectorAll('.animate-on-scroll');
    
    function checkElementsInView() {
      animateElements.forEach(element => {
        const rect = element.getBoundingClientRect();
        const isInView = rect.top < window.innerHeight && rect.bottom > 0;
        
        if (isInView && !element.classList.contains('in-view')) {
          element.classList.add('in-view');
        }
      });
    }
    
    // Throttled scroll listener
    let scrollTimer;
    window.addEventListener('scroll', function() {
      if (scrollTimer) clearTimeout(scrollTimer);
      scrollTimer = setTimeout(checkElementsInView, 100);
    });
    
    // Initial check
    checkElementsInView();
  }
  
  // Run compatibility check
  const browserFeatures = checkBrowserCompatibility();
  
  // ================= ENHANCED SMOOTH SCROLLING FOR CTA BUTTONS ================= 
  
  const ctaButtons = document.querySelectorAll('a[href^="#"]');
  
  ctaButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      // Skip invalid selectors like '#' or empty strings
      if (!targetId || targetId === '#' || targetId.length < 2) {
        return; // Don't do anything for placeholder links
      }
      
      let targetElement;
      try {
        targetElement = document.querySelector(targetId);
      } catch (e) {
        console.warn('Invalid selector:', targetId);
        return;
      }
      
      if (targetElement) {
        // Enhanced smooth scrolling with better UX
        const headerOffset = 80; // Account for any fixed headers
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        // Use native smooth scrolling if supported, otherwise fallback
        if ('scrollBehavior' in document.documentElement.style) {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
            inline: 'nearest'
          });
        } else {
          // Fallback smooth scrolling for older browsers
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
        
        // Update focus for accessibility
        setTimeout(() => {
          targetElement.setAttribute('tabindex', '-1');
          targetElement.focus();
          targetElement.removeAttribute('tabindex');
        }, 500);
        
        // Track scroll interaction for analytics
        if (typeof gtag !== 'undefined') {
          gtag('event', 'scroll_to_section', {
            event_category: 'navigation',
            event_label: targetId.replace('#', ''),
            value: 1
          });
        }
      }
    });
  });
  
  // ================= SECTION NAVIGATION AND FLOW ================= 
  
  // Add smooth transitions between sections
  function initializeSectionFlow() {
    const sections = document.querySelectorAll('section[id], header[id], footer[id]');
    const sectionIds = Array.from(sections).map(section => section.id).filter(id => id);
    
    // Create navigation state
    let currentSectionIndex = 0;
    
    // Add keyboard navigation between sections
    document.addEventListener('keydown', function(e) {
      // Alt + Arrow keys for section navigation
      if (e.altKey && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
        e.preventDefault();
        
        if (e.key === 'ArrowDown' && currentSectionIndex < sectionIds.length - 1) {
          currentSectionIndex++;
        } else if (e.key === 'ArrowUp' && currentSectionIndex > 0) {
          currentSectionIndex--;
        }
        
        const targetSection = document.getElementById(sectionIds[currentSectionIndex]);
        if (targetSection) {
          targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          
          // Announce section change to screen readers
          announceToScreenReader(`Navigated to ${targetSection.getAttribute('aria-labelledby') || targetSection.tagName.toLowerCase()} section`);
        }
      }
    });
    
    // Update current section based on scroll position
    function updateCurrentSection() {
      const scrollPosition = window.pageYOffset + 100; // Offset for better detection
      
      sections.forEach((section, index) => {
        const sectionTop = section.offsetTop;
        const sectionBottom = sectionTop + section.offsetHeight;
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
          currentSectionIndex = index;
        }
      });
    }
    
    // Throttled scroll listener for performance
    let scrollTimeout;
    window.addEventListener('scroll', function() {
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      scrollTimeout = setTimeout(updateCurrentSection, 100);
    });
  }
  
  // Initialize section flow
  initializeSectionFlow();
  
  // ================= ENHANCED ACCESSIBILITY FEATURES ================= 
  
  // Improved keyboard navigation
  const interactiveElements = document.querySelectorAll('button, a, input, select, textarea, [tabindex]');
  
  interactiveElements.forEach(element => {
    // Enhanced keyboard support
    element.addEventListener('keydown', function(e) {
      // Handle Enter key for buttons and links
      if (e.key === 'Enter' && (this.tagName === 'BUTTON' || this.tagName === 'A')) {
        e.preventDefault();
        this.click();
      }
      
      // Handle Space key for buttons
      if (e.key === ' ' && this.tagName === 'BUTTON') {
        e.preventDefault();
        this.click();
      }
    });
    
    // Enhanced focus indicators
    element.addEventListener('focus', function() {
      this.classList.add('keyboard-focused');
    });
    
    element.addEventListener('blur', function() {
      this.classList.remove('keyboard-focused');
    });
    
    // Remove focus class on mouse interaction
    element.addEventListener('mousedown', function() {
      this.classList.remove('keyboard-focused');
    });
  });
  
  // ================= TYPOGRAPHY AND READABILITY ENHANCEMENTS ================= 
  
  // Dynamic font size adjustment based on user preferences
  function adjustTypographyForAccessibility() {
    const rootElement = document.documentElement;
    
    // Respect user's font size preferences
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      rootElement.classList.add('reduce-motion');
    }
    
    // Adjust for high contrast preferences
    if (window.matchMedia && window.matchMedia('(prefers-contrast: high)').matches) {
      rootElement.classList.add('high-contrast');
    }
    
    // Adjust for color scheme preferences
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      rootElement.classList.add('dark-mode-preference');
    }
  }
  
  // Apply typography adjustments on load
  adjustTypographyForAccessibility();
  
  // Listen for changes in user preferences
  if (window.matchMedia) {
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', adjustTypographyForAccessibility);
    window.matchMedia('(prefers-contrast: high)').addEventListener('change', adjustTypographyForAccessibility);
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', adjustTypographyForAccessibility);
  }
  
  // ================= ENHANCED ANIMATION PERFORMANCE ================= 
  
  // Intersection Observer for scroll-triggered animations
  if ('IntersectionObserver' in window) {
    const animationObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          // Unobserve after animation to improve performance
          animationObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });
    
    // Observe elements that should animate on scroll
    const animateElements = document.querySelectorAll('.animate-on-scroll');
    animateElements.forEach(el => animationObserver.observe(el));
  }
  
  // Performance monitoring for animations
  function monitorAnimationPerformance() {
    if ('performance' in window && 'PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.duration > 16.67) { // More than one frame at 60fps
            console.warn(`Animation performance issue detected: ${entry.name} took ${entry.duration}ms`);
          }
        });
      });
      
      try {
        observer.observe({ entryTypes: ['measure'] });
      } catch (e) {
        // Fallback for browsers that don't support this
        console.log('Performance monitoring not available');
      }
    }
  }
  
  monitorAnimationPerformance();
  
  // ================= FORM VALIDATION ================= 
  
  const franchiseForm = document.getElementById('franchiseEnquiryForm');
  
  if (franchiseForm) {
    // Form validation configuration
    const validationConfig = {
      fullName: {
        required: true,
        minLength: 2,
        maxLength: 50,
        pattern: /^[a-zA-Z\s'-]+$/,
        errorMessages: {
          required: 'Full name is required',
          minLength: 'Name must be at least 2 characters',
          maxLength: 'Name must be less than 50 characters',
          pattern: 'Please enter a valid name (letters, spaces, hyphens, and apostrophes only)'
        }
      },
      email: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        errorMessages: {
          required: 'Email address is required',
          pattern: 'Please enter a valid email address'
        }
      },
      phone: {
        required: true,
        // No pattern validation - we use custom validate function that handles formatting
        validate: function(value) {
          // Strip formatting characters for validation
          const cleaned = value.replace(/\D/g, '');
          return cleaned.length >= 10 && cleaned.length <= 15;
        },
        errorMessages: {
          required: 'Phone number is required',
          pattern: 'Please enter a valid phone number (at least 10 digits)'
        }
      },
      cityState: {
        required: true,
        minLength: 3,
        maxLength: 100,
        pattern: /^[a-zA-Z\s,.-]+$/,
        errorMessages: {
          required: 'City & State is required',
          minLength: 'Please enter at least city and state',
          maxLength: 'Location must be less than 100 characters',
          pattern: 'Please enter a valid city and state'
        }
      },
      investmentRange: {
        required: true,
        errorMessages: {
          required: 'Please select your investment range'
        }
      },
      acknowledgment: {
        required: true,
        errorMessages: {
          required: 'Please acknowledge that you understand this is a premium Robusta-only concept'
        }
      }
    };

    // Get form elements
    const formElements = {
      fullName: document.getElementById('fullName'),
      email: document.getElementById('email'),
      phone: document.getElementById('phone'),
      cityState: document.getElementById('cityState'),
      investmentRange: document.getElementById('investmentRange'),
      message: document.getElementById('message'),
      acknowledgment: document.getElementById('acknowledgment'),
      submitButton: document.getElementById('submitButton'),
      successMessage: document.getElementById('successMessage')
    };

    // Character counter for message field
    if (formElements.message) {
      const messageCounter = document.getElementById('message-counter');
      
      formElements.message.addEventListener('input', function() {
        const currentLength = this.value.length;
        const maxLength = 500;
        messageCounter.textContent = `${currentLength} / ${maxLength} characters`;
        
        if (currentLength > maxLength * 0.9) {
          messageCounter.style.color = '#ff6b6b';
        } else {
          messageCounter.style.color = 'rgba(245, 241, 235, 0.6)';
        }
      });
    }

    // Phone number formatting
    if (formElements.phone) {
      formElements.phone.addEventListener('input', function() {
        let value = this.value.replace(/\D/g, '');
        
        if (value.length >= 6) {
          value = value.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
        } else if (value.length >= 3) {
          value = value.replace(/(\d{3})(\d{0,3})/, '($1) $2');
        }
        
        this.value = value;
      });
    }

    // Real-time validation for each field
    Object.keys(validationConfig).forEach(fieldName => {
      const field = formElements[fieldName];
      if (field) {
        // Validate on blur (when user leaves field)
        field.addEventListener('blur', function() {
          validateField(fieldName, field, validationConfig[fieldName]);
        });

        // Clear errors on focus (when user starts typing)
        field.addEventListener('focus', function() {
          clearFieldError(fieldName);
        });

        // Real-time validation for certain fields
        if (fieldName === 'email' || fieldName === 'phone') {
          field.addEventListener('input', function() {
            // Debounce validation to avoid excessive calls
            clearTimeout(this.validationTimeout);
            this.validationTimeout = setTimeout(() => {
              validateField(fieldName, field, validationConfig[fieldName]);
            }, 500);
          });
        }
      }
    });

    // Form submission handling
    franchiseForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Validate all fields
      let isFormValid = true;
      
      Object.keys(validationConfig).forEach(fieldName => {
        const field = formElements[fieldName];
        if (field) {
          const fieldValid = validateField(fieldName, field, validationConfig[fieldName]);
          if (!fieldValid) {
            isFormValid = false;
          }
        }
      });

      if (isFormValid) {
        submitForm();
      } else {
        // Focus on first error field
        const firstErrorField = franchiseForm.querySelector('.error');
        if (firstErrorField) {
          firstErrorField.focus();
          firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    });

    /**
     * Validates a single form field
     * @param {string} fieldName - Name of the field
     * @param {Element} field - Field element
     * @param {Object} config - Validation configuration
     * @returns {boolean} - True if field is valid
     */
    function validateField(fieldName, field, config) {
      const value = field.type === 'checkbox' ? field.checked : field.value.trim();
      const errorElement = document.getElementById(`${fieldName}-error`);
      
      // Required validation
      if (config.required && (!value || (field.type === 'checkbox' && !field.checked))) {
        showFieldError(fieldName, field, errorElement, config.errorMessages.required);
        return false;
      }

      // Skip other validations if field is empty and not required
      if (!value && !config.required) {
        clearFieldError(fieldName);
        return true;
      }

      // Length validations
      if (config.minLength && value.length < config.minLength) {
        showFieldError(fieldName, field, errorElement, config.errorMessages.minLength);
        return false;
      }

      if (config.maxLength && value.length > config.maxLength) {
        showFieldError(fieldName, field, errorElement, config.errorMessages.maxLength);
        return false;
      }

      // Custom validation function (runs before pattern for fields like phone that need formatting handling)
      if (config.validate && typeof config.validate === 'function') {
        if (!config.validate(value)) {
          showFieldError(fieldName, field, errorElement, config.errorMessages.pattern || config.errorMessages.required);
          return false;
        }
        // If custom validation passes, skip pattern validation (for phone numbers with formatting)
        // This prevents pattern validation from failing on formatted numbers
      } else {
        // Pattern validation (only if no custom validate function exists)
        if (config.pattern && !config.pattern.test(value)) {
          showFieldError(fieldName, field, errorElement, config.errorMessages.pattern);
          return false;
        }
      }

      // Field is valid
      clearFieldError(fieldName);
      showFieldSuccess(field);
      return true;
    }

    /**
     * Shows error state for a field
     */
    function showFieldError(fieldName, field, errorElement, message) {
      field.classList.add('error');
      field.classList.remove('success');
      if (errorElement) {
        errorElement.textContent = message;
        errorElement.setAttribute('aria-live', 'polite');
      }
    }

    /**
     * Shows success state for a field
     */
    function showFieldSuccess(field) {
      field.classList.add('success');
      field.classList.remove('error');
    }

    /**
     * Clears error state for a field
     */
    function clearFieldError(fieldName) {
      const field = formElements[fieldName];
      const errorElement = document.getElementById(`${fieldName}-error`);
      
      if (field) {
        field.classList.remove('error');
      }
      
      if (errorElement) {
        errorElement.textContent = '';
        errorElement.removeAttribute('aria-live');
      }
    }

    /**
     * Submits the form with loading state and comprehensive error handling
     */
    function submitForm() {
      const submitButton = formElements.submitButton;
      const btnText = submitButton.querySelector('.btn-text');
      const btnLoading = submitButton.querySelector('.btn-loading');
      
      // Show loading state
      submitButton.disabled = true;
      btnText.style.display = 'none';
      btnLoading.style.display = 'flex';
      
      // Hide any existing error messages
      const existingError = document.getElementById('submission-error');
      if (existingError) {
        existingError.style.display = 'none';
      }
      
      // Collect form data
      const formData = {
        fullName: formElements.fullName.value.trim(),
        email: formElements.email.value.trim(),
        phone: formElements.phone.value.trim(),
        cityState: formElements.cityState.value.trim(),
        investmentRange: formElements.investmentRange.value,
        message: formElements.message.value.trim(),
        acknowledgment: formElements.acknowledgment.checked,
        timestamp: new Date().toISOString(),
        source: 'franchise-page',
        userAgent: navigator.userAgent,
        referrer: document.referrer || 'direct'
      };

      // Attempt form submission with retry logic
      attemptSubmission(formData, 0);
    }

    /**
     * Attempts form submission with retry logic
     * @param {Object} formData - Form data to submit
     * @param {number} retryCount - Current retry attempt
     */
    function attemptSubmission(formData, retryCount = 0) {
      const maxRetries = 2;
      const retryDelay = 1000 * (retryCount + 1); // Exponential backoff
      
      // Simulate API call (replace with actual endpoint)
      const submissionPromise = new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulate network conditions
          const networkSuccess = Math.random() > 0.1; // 90% success rate for demo
          
          if (networkSuccess) {
            resolve({
              success: true,
              message: 'Form submitted successfully',
              confirmationId: 'FR-' + Date.now(),
              data: formData
            });
          } else {
            reject(new Error('Network error: Unable to connect to server'));
          }
        }, 1500 + (Math.random() * 1000)); // Simulate variable network delay
      });

      submissionPromise
        .then(response => {
          console.log('Form submission successful:', response);
          showSuccessMessage(response.confirmationId);
          resetFormState();
        })
        .catch(error => {
          console.error('Form submission failed:', error);
          
          if (retryCount < maxRetries) {
            // Retry submission
            console.log(`Retrying submission (attempt ${retryCount + 1}/${maxRetries})`);
            setTimeout(() => {
              attemptSubmission(formData, retryCount + 1);
            }, retryDelay);
          } else {
            // Max retries reached, show error
            showSubmissionError(error.message);
            resetButtonState();
          }
        });
    }

    /**
     * Shows success message and hides form
     * @param {string} confirmationId - Unique confirmation ID
     */
    function showSuccessMessage(confirmationId = null) {
      franchiseForm.style.display = 'none';
      formElements.successMessage.style.display = 'block';
      
      // Add confirmation ID if provided
      if (confirmationId) {
        const successMessage = formElements.successMessage.querySelector('.franchise-form-success-message');
        const confirmationText = document.createElement('p');
        confirmationText.className = 'franchise-form-confirmation-id';
        confirmationText.innerHTML = `<strong>Confirmation ID:</strong> ${confirmationId}`;
        confirmationText.style.cssText = `
          font-size: 0.875rem;
          color: var(--franchise-text-dark);
          opacity: 0.7;
          margin-top: 12px;
          padding: 8px 12px;
          background: rgba(34, 139, 34, 0.1);
          border-radius: 4px;
          font-family: monospace;
        `;
        successMessage.appendChild(confirmationText);
      }
      
      // Scroll to success message
      formElements.successMessage.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      
      // Focus on success message for screen readers
      formElements.successMessage.setAttribute('tabindex', '-1');
      formElements.successMessage.focus();
      
      // Track successful submission (for analytics)
      if (typeof gtag !== 'undefined') {
        gtag('event', 'form_submit', {
          event_category: 'franchise',
          event_label: 'enquiry_form',
          value: 1
        });
      }
    }

    /**
     * Shows submission error message with retry option
     * @param {string} errorMessage - Error message to display
     */
    function showSubmissionError(errorMessage = 'Unknown error occurred') {
      let errorContainer = document.getElementById('submission-error');
      
      if (!errorContainer) {
        errorContainer = document.createElement('div');
        errorContainer.id = 'submission-error';
        errorContainer.className = 'franchise-form-error submission-error';
        franchiseForm.insertBefore(errorContainer, formElements.submitButton.parentNode);
      }
      
      // Determine error type and provide appropriate message
      let userFriendlyMessage = '';
      let retryButton = '';
      
      if (errorMessage.includes('Network') || errorMessage.includes('fetch')) {
        userFriendlyMessage = `
          <strong>Connection Error:</strong> We're having trouble connecting to our servers. 
          This might be due to a temporary network issue.
        `;
        retryButton = `
          <button type="button" class="btn-retry" onclick="this.parentElement.style.display='none'; submitForm();">
            Try Again
          </button>
        `;
      } else if (errorMessage.includes('timeout')) {
        userFriendlyMessage = `
          <strong>Timeout Error:</strong> The request is taking longer than expected. 
          Please check your internet connection and try again.
        `;
        retryButton = `
          <button type="button" class="btn-retry" onclick="this.parentElement.style.display='none'; submitForm();">
            Try Again
          </button>
        `;
      } else {
        userFriendlyMessage = `
          <strong>Submission Error:</strong> We encountered an unexpected error while processing your request.
        `;
      }
      
      errorContainer.innerHTML = `
        ${userFriendlyMessage}
        <br><br>
        <strong>What you can do:</strong>
        <ul style="margin: 8px 0; padding-left: 20px;">
          <li>Check your internet connection</li>
          <li>Try submitting the form again</li>
          <li>If the problem persists, email us directly at <a href="mailto:franchise@rabuste.com" style="color: var(--franchise-gold);">franchise@rabuste.com</a></li>
        </ul>
        ${retryButton}
        <p style="font-size: 0.8rem; opacity: 0.7; margin-top: 8px;">
          Error details: ${errorMessage}
        </p>
      `;
      
      errorContainer.style.display = 'block';
      errorContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Auto-hide error after 15 seconds
      setTimeout(() => {
        if (errorContainer.style.display !== 'none') {
          errorContainer.style.display = 'none';
        }
      }, 15000);
      
      // Track error (for analytics)
      if (typeof gtag !== 'undefined') {
        gtag('event', 'form_error', {
          event_category: 'franchise',
          event_label: 'submission_failed',
          value: 0
        });
      }
    }

    /**
     * Resets the entire form state after successful submission
     */
    function resetFormState() {
      // Reset form
      franchiseForm.reset();
      
      // Clear all validation states
      Object.keys(validationConfig).forEach(fieldName => {
        clearFieldError(fieldName);
        const field = formElements[fieldName];
        if (field) {
          field.classList.remove('success');
        }
      });
      
      // Reset character counter
      if (formElements.message) {
        const messageCounter = document.getElementById('message-counter');
        messageCounter.textContent = '0 / 500 characters';
        messageCounter.style.color = 'rgba(245, 241, 235, 0.6)';
      }
      
      resetButtonState();
    }

    /**
     * Resets submit button to normal state
     */
    function resetButtonState() {
      const submitButton = formElements.submitButton;
      const btnText = submitButton.querySelector('.btn-text');
      const btnLoading = submitButton.querySelector('.btn-loading');
      
      submitButton.disabled = false;
      btnText.style.display = 'inline';
      btnLoading.style.display = 'none';
    }

    // Add retry button styling
    const retryButtonStyles = document.createElement('style');
    retryButtonStyles.textContent = `
      .btn-retry {
        background: var(--franchise-gold);
        color: var(--franchise-text-dark);
        border: 1px solid var(--franchise-gold);
        border-radius: 4px;
        padding: 8px 16px;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: var(--franchise-transition);
        margin-top: 12px;
      }
      
      .btn-retry:hover {
        background: transparent;
        color: var(--franchise-gold);
      }
    `;
    document.head.appendChild(retryButtonStyles);

    // Expose submitForm function globally for retry button
    window.submitForm = submitForm;
  }
  
  // ================= COMPONENT INTEGRATION VALIDATION ================= 
  
  // Validate that all major components are properly integrated
  function validateComponentIntegration() {
    const validationResults = {
      sections: {},
      forms: {},
      navigation: {},
      animations: {},
      accessibility: {}
    };
    
    // Check all major sections exist
    const requiredSections = [
      'franchise-hero',
      'franchise-benefits', 
      'franchise-business-model',
      'franchise-support',
      'franchise-qualification',
      'franchise-form'
    ];
    
    requiredSections.forEach(sectionClass => {
      const section = document.querySelector(`.${sectionClass}`);
      validationResults.sections[sectionClass] = {
        exists: !!section,
        hasContent: section ? section.children.length > 0 : false,
        hasProperAria: section ? section.hasAttribute('aria-labelledby') || section.hasAttribute('aria-label') : false
      };
    });
    
    // Check form functionality
    const franchiseForm = document.getElementById('franchiseEnquiryForm');
    if (franchiseForm) {
      validationResults.forms.franchiseForm = {
        exists: true,
        hasValidation: !!franchiseForm.querySelector('.franchise-form-error'),
        hasSubmitButton: !!franchiseForm.querySelector('button[type="submit"]'),
        hasRequiredFields: franchiseForm.querySelectorAll('input[required], select[required]').length > 0
      };
    }
    
    // Check navigation elements
    const ctaButtons = document.querySelectorAll('a[href^="#"]');
    validationResults.navigation.ctaButtons = {
      count: ctaButtons.length,
      hasTargets: Array.from(ctaButtons).every(btn => {
        const href = btn.getAttribute('href');
        // Skip invalid selectors like '#' or empty strings
        if (!href || href === '#' || href.length < 2) {
          return true; // Don't fail validation for placeholder links
        }
        try {
          const target = document.querySelector(href);
          return !!target;
        } catch (e) {
          // Invalid selector, skip this button
          return true;
        }
      })
    };
    
    // Check animations and performance
    validationResults.animations = {
      cssAnimationsSupported: CSS.supports('animation', 'test'),
      transformsSupported: CSS.supports('transform', 'translateX(0)'),
      reducedMotionRespected: window.matchMedia('(prefers-reduced-motion: reduce)').matches
    };
    
    // Check accessibility features
    validationResults.accessibility = {
      skipLinksPresent: !!document.querySelector('.skip-link'),
      ariaLiveRegions: document.querySelectorAll('[aria-live]').length,
      focusableElements: document.querySelectorAll('button, a, input, select, textarea, [tabindex]').length,
      altTextPresent: Array.from(document.querySelectorAll('img')).every(img => 
        img.hasAttribute('alt') || img.hasAttribute('aria-label') || img.getAttribute('role') === 'presentation'
      )
    };
    
    // Log validation results
    console.log('Component Integration Validation:', validationResults);
    
    // Check for critical issues
    const criticalIssues = [];
    
    if (Object.values(validationResults.sections).some(section => !section.exists)) {
      criticalIssues.push('Missing required sections');
    }
    
    if (!validationResults.forms.franchiseForm?.exists) {
      criticalIssues.push('Franchise form not found');
    }
    
    if (!validationResults.navigation.ctaButtons.hasTargets) {
      criticalIssues.push('CTA buttons have invalid targets');
    }
    
    if (!validationResults.accessibility.skipLinksPresent) {
      criticalIssues.push('Skip links missing for accessibility');
    }
    
    if (criticalIssues.length > 0) {
      console.warn('Critical integration issues found:', criticalIssues);
    } else {
      console.log('✅ All components properly integrated');
    }
    
    return {
      isValid: criticalIssues.length === 0,
      results: validationResults,
      issues: criticalIssues
    };
  }
  
  // Run integration validation after page load
  setTimeout(() => {
    const integrationCheck = validateComponentIntegration();
    
    // Store results globally for debugging
    window.franchiseIntegrationCheck = integrationCheck;
    
    // Report to analytics if available
    if (typeof gtag !== 'undefined') {
      gtag('event', 'component_integration_check', {
        event_category: 'technical',
        event_label: integrationCheck.isValid ? 'success' : 'failure',
        value: integrationCheck.isValid ? 1 : 0
      });
    }
  }, 1000);
  
  // ================= FINAL POLISH AND MICRO-INTERACTIONS ================= 
  
  // Add scroll progress indicator
  function initializeScrollProgress() {
    // Create scroll progress bar
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    document.body.appendChild(progressBar);
    
    // Update progress on scroll
    function updateScrollProgress() {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      
      progressBar.style.width = Math.min(scrollPercent, 100) + '%';
    }
    
    // Throttled scroll listener for performance
    let scrollTimeout;
    window.addEventListener('scroll', function() {
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      scrollTimeout = setTimeout(updateScrollProgress, 10);
    });
    
    // Initial update
    updateScrollProgress();
  }
  
  // Enhanced image loading with fade-in effect
  function enhanceImageLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    images.forEach(img => {
      img.addEventListener('load', function() {
        this.classList.add('loaded');
      });
      
      // Fallback for images that are already loaded
      if (img.complete) {
        img.classList.add('loaded');
      }
    });
  }
  
  // Add ripple effect to buttons
  function addRippleEffect() {
    const buttons = document.querySelectorAll('.btn-franchise-primary, .btn-franchise-secondary, .btn-franchise-submit');
    
    buttons.forEach(button => {
      button.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
          position: absolute;
          width: ${size}px;
          height: ${size}px;
          left: ${x}px;
          top: ${y}px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          transform: scale(0);
          animation: ripple 0.6s linear;
          pointer-events: none;
        `;
        
        this.appendChild(ripple);
        
        setTimeout(() => {
          ripple.remove();
        }, 600);
      });
    });
    
    // Add ripple animation CSS
    if (!document.getElementById('ripple-styles')) {
      const style = document.createElement('style');
      style.id = 'ripple-styles';
      style.textContent = `
        @keyframes ripple {
          to {
            transform: scale(2);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }
  
  // Enhanced card hover effects
  function enhanceCardInteractions() {
    const cards = document.querySelectorAll('.franchise-benefit-card, .franchise-support-card, .franchise-business-model-item, .franchise-qualification-item');
    
    cards.forEach(card => {
      card.addEventListener('mouseenter', function() {
        // Add subtle tilt effect
        const rect = this.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        this.addEventListener('mousemove', handleCardTilt);
        this.addEventListener('mouseleave', resetCardTilt);
      });
    });
    
    function handleCardTilt(e) {
      const rect = this.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const deltaX = (e.clientX - centerX) / (rect.width / 2);
      const deltaY = (e.clientY - centerY) / (rect.height / 2);
      
      const tiltX = deltaY * 5; // Max 5 degrees
      const tiltY = deltaX * -5; // Max 5 degrees
      
      this.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateZ(10px)`;
    }
    
    function resetCardTilt() {
      this.style.transform = '';
      this.removeEventListener('mousemove', handleCardTilt);
      this.removeEventListener('mouseleave', resetCardTilt);
    }
  }
  
  // Add parallax effect to hero section
  function addParallaxEffect() {
    const hero = document.querySelector('.franchise-hero');
    if (!hero) return;
    
    function updateParallax() {
      const scrolled = window.pageYOffset;
      const rate = scrolled * -0.5;
      
      hero.style.transform = `translateY(${rate}px)`;
    }
    
    // Only add parallax on desktop to avoid performance issues on mobile
    if (window.innerWidth > 1024) {
      let parallaxTimeout;
      window.addEventListener('scroll', function() {
        if (parallaxTimeout) {
          clearTimeout(parallaxTimeout);
        }
        parallaxTimeout = setTimeout(updateParallax, 10);
      });
    }
  }
  
  // Enhanced form interactions
  function enhanceFormInteractions() {
    const formInputs = document.querySelectorAll('.franchise-form-input, .franchise-form-select, .franchise-form-textarea');
    
    formInputs.forEach(input => {
      // Add floating label effect
      const label = document.querySelector(`label[for="${input.id}"]`);
      if (label) {
        input.addEventListener('focus', function() {
          label.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
          if (!this.value) {
            label.classList.remove('focused');
          }
        });
        
        // Check initial state
        if (input.value) {
          label.classList.add('focused');
        }
      }
      
      // Add typing animation feedback
      input.addEventListener('input', function() {
        this.classList.add('typing');
        clearTimeout(this.typingTimeout);
        this.typingTimeout = setTimeout(() => {
          this.classList.remove('typing');
        }, 500);
      });
    });
  }
  
  // Add smooth reveal animations for sections
  function addSectionRevealAnimations() {
    const sections = document.querySelectorAll('section');
    
    if ('IntersectionObserver' in window) {
      const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            
            // Animate child elements with stagger
            const children = entry.target.querySelectorAll('.franchise-benefit-card, .franchise-support-card, .franchise-business-model-item, .franchise-qualification-item');
            children.forEach((child, index) => {
              setTimeout(() => {
                child.classList.add('revealed');
              }, index * 100);
            });
            
            revealObserver.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      });
      
      sections.forEach(section => {
        revealObserver.observe(section);
      });
    }
  }
  
  // Add Easter egg for developers
  function addDeveloperEasterEgg() {
    console.log(`
    ☕ Welcome to Rabuste Coffee Franchise Page! ☕
    
    Built with love and attention to detail.
    
    Tech Stack:
    - Node.js + Express
    - EJS Templates  
    - Vanilla JavaScript
    - CSS Grid & Flexbox
    - Intersection Observer API
    - Property-Based Testing
    
    Performance Optimized:
    ✅ Mobile-First Design
    ✅ Accessibility Compliant
    ✅ SEO Optimized
    ✅ Cross-Browser Compatible
    
    Interested in joining our development team?
    Email: careers@rabuste.com
    `);
    
    // Add konami code easter egg
    let konamiCode = [];
    const konamiSequence = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]; // ↑↑↓↓←→←→BA
    
    document.addEventListener('keydown', function(e) {
      konamiCode.push(e.keyCode);
      
      if (konamiCode.length > konamiSequence.length) {
        konamiCode.shift();
      }
      
      if (konamiCode.length === konamiSequence.length && 
          konamiCode.every((code, index) => code === konamiSequence[index])) {
        
        // Activate coffee rain animation
        activateCoffeeRain();
        konamiCode = [];
      }
    });
  }
  
  function activateCoffeeRain() {
    const coffeeEmojis = ['☕', '🫘', '🤎', '🥤'];
    const container = document.createElement('div');
    container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9999;
    `;
    document.body.appendChild(container);
    
    for (let i = 0; i < 50; i++) {
      setTimeout(() => {
        const coffee = document.createElement('div');
        coffee.textContent = coffeeEmojis[Math.floor(Math.random() * coffeeEmojis.length)];
        coffee.style.cssText = `
          position: absolute;
          top: -50px;
          left: ${Math.random() * 100}%;
          font-size: ${Math.random() * 20 + 20}px;
          animation: coffeefall ${Math.random() * 3 + 2}s linear forwards;
        `;
        container.appendChild(coffee);
        
        setTimeout(() => coffee.remove(), 5000);
      }, i * 100);
    }
    
    // Add animation CSS
    if (!document.getElementById('coffee-rain-styles')) {
      const style = document.createElement('style');
      style.id = 'coffee-rain-styles';
      style.textContent = `
        @keyframes coffeefall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }
    
    setTimeout(() => container.remove(), 6000);
    
    console.log('🎉 Coffee rain activated! You found the easter egg!');
  }
  
  // Initialize all polish features
  function initializeFinalPolish() {
    initializeScrollProgress();
    enhanceImageLoading();
    addRippleEffect();
    enhanceCardInteractions();
    addParallaxEffect();
    enhanceFormInteractions();
    addSectionRevealAnimations();
    addDeveloperEasterEgg();
    
    // Clean up will-change properties after animations
    setTimeout(() => {
      const animatedElements = document.querySelectorAll('[style*="will-change"]');
      animatedElements.forEach(el => {
        el.classList.add('animation-complete');
      });
    }, 3000);
  }
  
  // Initialize polish features after page load
  setTimeout(initializeFinalPolish, 500);
  
  // ================= PERFORMANCE MONITORING ================= 
  
  // Monitor page load performance
  if ('performance' in window) {
    window.addEventListener('load', function() {
      const loadTime = performance.now();
      console.log(`Franchise page loaded in ${loadTime.toFixed(2)}ms`);
      
      // Ensure load time is under 3 seconds (3000ms)
      if (loadTime > 3000) {
        console.warn('Page load time exceeds 3 second target');
      }
    });
  }
  
  // ================= ENHANCED ACCESSIBILITY FEATURES ================= 
  
  // Skip links functionality
  const skipLinks = document.querySelectorAll('.skip-link');
  skipLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      // Skip invalid selectors like '#' or empty strings
      if (!targetId || targetId === '#' || targetId.length < 2) {
        return; // Don't do anything for placeholder links
      }
      
      let targetElement;
      try {
        targetElement = document.querySelector(targetId);
      } catch (e) {
        console.warn('Invalid selector:', targetId);
        return;
      }
      
      if (targetElement) {
        targetElement.setAttribute('tabindex', '-1');
        targetElement.focus();
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
  
  // Enhanced ARIA live regions for dynamic content
  function announceToScreenReader(message, priority = 'polite') {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }
  
  // Expose function globally for use in form submissions
  window.announceToScreenReader = announceToScreenReader;
  
  // Enhanced focus management
  function trapFocus(element) {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];
    
    element.addEventListener('keydown', function(e) {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstFocusable) {
            e.preventDefault();
            lastFocusable.focus();
          }
        } else {
          if (document.activeElement === lastFocusable) {
            e.preventDefault();
            firstFocusable.focus();
          }
        }
      }
      
      if (e.key === 'Escape') {
        // Allow escape to close modals or return focus
        element.dispatchEvent(new CustomEvent('escape-pressed'));
      }
    });
  }
  
  // Apply focus trapping to form sections
  const formSection = document.querySelector('.franchise-form-section');
  if (formSection) {
    trapFocus(formSection);
  }
  
});

// ================= UTILITY FUNCTIONS ================= 

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Formats phone number for display
 * @param {string} phone - Phone number to format
 * @returns {string} - Formatted phone number
 */
function formatPhoneNumber(phone) {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  
  return phone;
}

/**
 * Checks if element is in viewport
 * @param {Element} element - Element to check
 * @returns {boolean} - True if element is visible
 */
function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// ================= AI ASSISTANT FUNCTIONALITY ================= 
// Note: AI Assistant is handled by ai.js - this section removed to avoid duplicate class declaration

// ================= AI ASSISTANT UTILITY FUNCTIONS ================= 

/**
 * Checks if AI assistant should be enabled based on performance
 */
function shouldEnableAIAssistant() {
  // Disable on very slow connections
  if ('connection' in navigator && navigator.connection.effectiveType === 'slow-2g') {
    return false;
  }
  
  // Disable on very old browsers
  if (!window.CSS || !window.CSS.supports || !window.CSS.supports('display', 'flex')) {
    return false;
  }
  
  // Disable if reduced motion is preferred and animations are critical
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // Still enable but with reduced animations
    return true;
  }
  
  return true;
}

/**
 * Graceful degradation for AI assistant
 */
function handleAIAssistantError(error) {
  console.error('AI Assistant Error:', error);
  
  // Hide the assistant
  const aiContainer = document.getElementById('aiAssistant');
  if (aiContainer) {
    aiContainer.style.display = 'none';
  }
  
  // Optionally show a fallback message or direct users to the form
  const fallbackMessage = document.createElement('div');
  fallbackMessage.innerHTML = `
    <div style="position: fixed; bottom: 24px; right: 24px; background: var(--franchise-gold); color: var(--franchise-text-dark); padding: 12px 20px; border-radius: 8px; font-size: 0.875rem; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 1000;">
      <a href="#franchise-form" style="color: inherit; text-decoration: none; font-weight: 600;">
        Ready to apply? Go to form →
      </a>
    </div>
  `;
  
  // Only show fallback if the original assistant was supposed to be visible
  if (shouldEnableAIAssistant()) {
    document.body.appendChild(fallbackMessage);
    
    // Auto-hide fallback after 10 seconds
    setTimeout(() => {
      if (document.body.contains(fallbackMessage)) {
        document.body.removeChild(fallbackMessage);
      }
    }, 10000);
  }
}

// Global error handler for AI assistant
window.addEventListener('error', function(event) {
  if (event.filename && event.filename.includes('franchise.js') && 
      event.message && event.message.toLowerCase().includes('ai')) {
    handleAIAssistantError(event.error);
  }
});