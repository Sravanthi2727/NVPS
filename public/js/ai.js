// /**
//  * AI Assistant for Franchise Qualification
//  * Lightweight qualification helper with three-question flow
//  * Requirements: 10.1, 10.2, 10.3
//  */

class FranchiseAIAssistant {
  constructor() {
    this.currentQuestion = 0;
    this.answers = {};
    this.isOpen = false;
    this.isEnabled = true;
    
    // Performance monitoring
    this.startTime = performance.now();
    
    // DOM elements
    this.elements = {
      chatBubble: document.getElementById('aiChatBubble'),
      chatModal: document.getElementById('aiChatModal'),
      modalBackdrop: document.getElementById('aiModalBackdrop'),
      modalClose: document.getElementById('aiModalClose'),
      
      // Screens
      welcomeScreen: document.getElementById('aiWelcomeScreen'),
      question1Screen: document.getElementById('aiQuestion1Screen'),
      question2Screen: document.getElementById('aiQuestion2Screen'),
      question3Screen: document.getElementById('aiQuestion3Screen'),
      resultsScreen: document.getElementById('aiResultsScreen'),
      resultsContent: document.getElementById('aiResultsContent'),
      
      // Action buttons
      startButton: document.getElementById('aiStartQuestions'),
      skipButton: document.getElementById('aiSkipToForm'),
      goToFormButton: document.getElementById('aiGoToForm'),
      startOverButton: document.getElementById('aiStartOver')
    };
    
    this.init();
  }
  
  init() {
    // Check if AI assistant should be enabled
    if (!this.shouldEnable()) {
      this.disable();
      return;
    }
    
    // Verify required elements exist
    if (!this.elements.chatBubble || !this.elements.chatModal) {
      console.log('AI Assistant: Required elements not found, feature disabled');
      this.disable();
      return;
    }
    
    try {
      this.bindEvents();
      this.setupAccessibility();
      this.showAssistantWithDelay();
      this.monitorPerformance();
      
      console.log('AI Assistant: Initialized successfully');
    } catch (error) {
      console.error('AI Assistant: Initialization failed', error);
      this.disable();
    }
  }
  
  shouldEnable() {
    // Check browser support
    if (!window.CSS || !window.CSS.supports || !window.CSS.supports('display', 'flex')) {
      return false;
    }
    
    // Check connection speed (if available)
    if ('connection' in navigator && navigator.connection.effectiveType === 'slow-2g') {
      return false;
    }
    
    // Check if user prefers reduced motion (still enable but with modifications)
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.reduceMotion = true;
    }
    
    return true;
  }
  
  disable() {
    this.isEnabled = false;
    const aiContainer = document.getElementById('aiAssistant');
    if (aiContainer) {
      aiContainer.style.display = 'none';
    }
  }
  
  bindEvents() {
    const { chatBubble, modalClose, modalBackdrop, startButton, skipButton, goToFormButton, startOverButton } = this.elements;
    
    // Chat bubble click
    chatBubble.addEventListener('click', () => this.openModal());
    
    // Modal close events
    modalClose.addEventListener('click', () => this.closeModal());
    modalBackdrop.addEventListener('click', () => this.closeModal());
    
    // Keyboard events
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.closeModal();
      }
    });
    
    // Welcome screen actions
    startButton.addEventListener('click', () => this.startQuestions());
    skipButton.addEventListener('click', () => this.goToForm());
    
    // Question option buttons (event delegation)
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('ai-btn-option')) {
        this.handleAnswer(e.target.dataset.answer);
      }
    });
    
    // Results screen actions
    goToFormButton.addEventListener('click', () => this.goToForm());
    startOverButton.addEventListener('click', () => this.resetAssistant());
  }
  
  setupAccessibility() {
    const { chatModal, modalBackdrop } = this.elements;
    
    // Set up focus trap elements
    this.focusableElements = chatModal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    // Initial ARIA attributes
    chatModal.setAttribute('aria-hidden', 'true');
    modalBackdrop.setAttribute('aria-hidden', 'true');
  }
  
  showAssistantWithDelay() {
    // Show assistant after page load to avoid performance impact
    setTimeout(() => {
      this.showAssistant();
    }, 3000);
  }
  
  showAssistant() {
    const { chatBubble } = this.elements;
    
    if (this.reduceMotion) {
      // Simple show without animation
      chatBubble.style.opacity = '1';
      return;
    }
    
    // Entrance animation
    chatBubble.style.opacity = '0';
    chatBubble.style.transform = 'translateY(20px) scale(0.8)';
    
    requestAnimationFrame(() => {
      chatBubble.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
      chatBubble.style.opacity = '1';
      chatBubble.style.transform = 'translateY(0) scale(1)';
    });
  }
  
  openModal() {
    if (!this.isEnabled) return;
    
    this.isOpen = true;
    const { chatModal, modalBackdrop, chatBubble, modalClose } = this.elements;
    
    // Show modal and backdrop
    modalBackdrop.style.display = 'block';
    chatModal.style.display = 'flex';
    
    // Trigger animations
    requestAnimationFrame(() => {
      modalBackdrop.classList.add('show');
      chatModal.classList.add('show');
    });
    
    // Update ARIA attributes
    chatModal.setAttribute('aria-hidden', 'false');
    modalBackdrop.setAttribute('aria-hidden', 'false');
    chatBubble.setAttribute('aria-expanded', 'true');
    
    // Focus management
    modalClose.focus();
    
    // Screen reader announcement
    this.announceToScreenReader('Franchise qualification helper opened');
    
    // Analytics tracking
    this.trackEvent('ai_assistant_opened');
  }
  
  closeModal() {
    if (!this.isOpen) return;
    
    this.isOpen = false;
    const { chatModal, modalBackdrop, chatBubble } = this.elements;
    
    // Hide animations
    modalBackdrop.classList.remove('show');
    chatModal.classList.remove('show');
    
    setTimeout(() => {
      modalBackdrop.style.display = 'none';
      chatModal.style.display = 'none';
    }, 300);
    
    // Update ARIA attributes
    chatModal.setAttribute('aria-hidden', 'true');
    modalBackdrop.setAttribute('aria-hidden', 'true');
    chatBubble.setAttribute('aria-expanded', 'false');
    
    // Return focus
    chatBubble.focus();
    
    // Screen reader announcement
    this.announceToScreenReader('Franchise qualification helper closed');
  }
  
  startQuestions() {
    this.currentQuestion = 1;
    this.showScreen('question1');
    this.announceToScreenReader('Starting qualification questions');
    this.trackEvent('ai_questions_started');
  }
  
  handleAnswer(answer) {
    if (!answer) return;
    
    // Store answer
    this.answers[`question${this.currentQuestion}`] = answer;
    
    // Progress to next question or results
    if (this.currentQuestion < 3) {
      this.currentQuestion++;
      this.showScreen(`question${this.currentQuestion}`);
      this.announceToScreenReader(`Question ${this.currentQuestion} of 3`);
    } else {
      this.showResults();
    }
    
    // Track answer
    this.trackEvent('ai_question_answered', { 
      question: this.currentQuestion - (this.currentQuestion < 3 ? 0 : 1), 
      answer: answer 
    });
  }
  
  showScreen(screenName) {
    const screens = [
      this.elements.welcomeScreen,
      this.elements.question1Screen,
      this.elements.question2Screen,
      this.elements.question3Screen,
      this.elements.resultsScreen
    ];
    
    // Hide all screens
    screens.forEach(screen => {
      if (screen) screen.style.display = 'none';
    });
    
    // Show target screen
    const targetScreen = this.elements[`${screenName}Screen`];
    if (targetScreen) {
      targetScreen.style.display = 'flex';
    }
  }
  
  showResults() {
    const results = this.generateResults();
    this.elements.resultsContent.innerHTML = results;
    this.showScreen('results');
    this.announceToScreenReader('Qualification results ready');
    this.trackEvent('ai_results_shown', { answers: this.answers });
  }
  
  generateResults() {
    const { question1: experience, question2: investment, question3: involvement } = this.answers;
    
    // Logic-based response system (no actual AI required)
    let recommendation = '';
    let highlights = [];
    let nextSteps = '';
    
    // Experience-based recommendations
    if (experience === 'extensive') {
      recommendation = "Excellent! Your extensive experience makes you an ideal franchise candidate.";
      highlights.push("Your F&B background aligns perfectly with our business model");
      highlights.push("You understand the operational challenges and opportunities");
    } else if (experience === 'some') {
      recommendation = "Great! Your industry experience combined with our support creates a winning combination.";
      highlights.push("Your existing knowledge will accelerate your success");
      highlights.push("Our training will build on your foundation");
    } else {
      recommendation = "Perfect! Many of our most successful franchisees started with fresh perspectives.";
      highlights.push("Our comprehensive training program sets you up for success");
      highlights.push("Fresh energy and enthusiasm often drive the best results");
    }
    
    // Investment-based guidance
    if (investment === '75-100k') {
      highlights.push("Your investment range opens opportunities in emerging markets");
      nextSteps = "We'll focus on locations with strong growth potential and lower entry costs.";
    } else if (investment === '100-150k') {
      highlights.push("Your investment capacity fits our standard franchise model perfectly");
      nextSteps = "We can explore prime locations with established foot traffic.";
    } else if (investment === '150k+') {
      highlights.push("Your investment capacity opens premium location opportunities");
      nextSteps = "We'll discuss flagship locations and multi-unit development options.";
    } else {
      highlights.push("We'll work together to find the investment level that matches your goals");
      nextSteps = "Our team will present options across different investment ranges.";
    }
    
    // Involvement-based recommendations
    if (involvement === 'hands-on') {
      highlights.push("Your hands-on approach maximizes the community-building aspect of Rabuste Coffee");
      if (!nextSteps) nextSteps = "We'll focus on operational training and community engagement strategies.";
    } else if (involvement === 'semi-passive') {
      highlights.push("Our management support systems accommodate your preferred level of involvement");
      if (!nextSteps) nextSteps = "We'll discuss hybrid management models and oversight systems.";
    } else {
      highlights.push("Our turnkey operations and management partnerships support passive ownership");
      if (!nextSteps) nextSteps = "We'll explore management partnership options and ROI projections.";
    }
    
    // Default next steps if not set
    if (!nextSteps) {
      nextSteps = "We'll schedule a discovery call to discuss your specific situation and goals.";
    }
    
    return `
      <h4>${recommendation}</h4>
      <p>Based on your responses, here's why Rabuste Coffee is an excellent fit:</p>
      <ul>
        ${highlights.map(highlight => `<li>${highlight}</li>`).join('')}
      </ul>
      <p><strong>Recommended Next Step:</strong> ${nextSteps}</p>
      <p>Complete our franchise application below, and our development team will contact you within 2 business days to discuss your opportunity in detail.</p>
    `;
  }
  
  goToForm() {
    this.closeModal();
    
    // Smooth scroll to form
    const formSection = document.getElementById('franchise-form');
    if (formSection) {
      formSection.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
      
      // Focus first form field after scroll
      setTimeout(() => {
        const firstInput = document.getElementById('fullName');
        if (firstInput) {
          firstInput.focus();
        }
      }, 800);
    }
    
    this.trackEvent('ai_go_to_form');
  }
  
  resetAssistant() {
    this.currentQuestion = 0;
    this.answers = {};
    this.showScreen('welcome');
    this.announceToScreenReader('Qualification helper reset');
    this.trackEvent('ai_reset');
  }
  
  announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      if (document.body.contains(announcement)) {
        document.body.removeChild(announcement);
      }
    }, 1000);
  }
  
  trackEvent(eventName, data = {}) {
    // Analytics tracking
    if (typeof gtag !== 'undefined') {
      gtag('event', eventName, {
        event_category: 'ai_assistant',
        event_label: 'franchise_qualification',
        custom_map: { dimension1: 'ai_feature' },
        ...data
      });
    }
    
    // Development logging
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.log(`AI Assistant Event: ${eventName}`, data);
    }
  }
  
  monitorPerformance() {
    if (!('performance' in window)) return;
    
    const initTime = performance.now() - this.startTime;
    
    // Log initialization time
    if (initTime > 100) {
      console.warn(`AI Assistant: Slow initialization (${initTime.toFixed(2)}ms)`);
    }
    
    // Monitor memory usage periodically
    if (performance.memory) {
      setInterval(() => {
        const memoryUsage = performance.memory.usedJSHeapSize / 1024 / 1024;
        if (memoryUsage > 100) { // 100MB threshold
          console.warn(`AI Assistant: High memory usage detected (${memoryUsage.toFixed(2)}MB)`);
        }
      }, 30000); // Check every 30 seconds
    }
    
    // Track performance metrics
    this.trackEvent('ai_performance', {
      init_time: Math.round(initTime),
      reduced_motion: !!this.reduceMotion
    });
  }
}

// Utility Functions
const AIAssistantUtils = {
  
  /**
   * Graceful error handling for AI assistant
   */
  handleError(error, context = 'unknown') {
    console.error(`AI Assistant Error (${context}):`, error);
    
    // Hide assistant on critical errors
    const aiContainer = document.getElementById('aiAssistant');
    if (aiContainer) {
      aiContainer.style.display = 'none';
    }
    
    // Show fallback CTA
    this.showFallbackCTA();
    
    // Track error
    if (typeof gtag !== 'undefined') {
      gtag('event', 'ai_error', {
        event_category: 'ai_assistant',
        event_label: context,
        value: 0
      });
    }
  },
  
  /**
   * Show fallback CTA when AI assistant fails
   */
  showFallbackCTA() {
    // Only show if not already present
    if (document.getElementById('ai-fallback-cta')) return;
    
    const fallback = document.createElement('div');
    fallback.id = 'ai-fallback-cta';
    fallback.innerHTML = `
      <div style="
        position: fixed; 
        bottom: 24px; 
        right: 24px; 
        background: var(--franchise-gold); 
        color: var(--franchise-text-dark); 
        padding: 12px 20px; 
        border-radius: 8px; 
        font-size: 0.875rem; 
        font-weight: 600;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15); 
        z-index: 1000;
        transition: all 0.3s ease;
      ">
        <a href="#franchise-form" style="color: inherit; text-decoration: none;">
          Ready to apply? Go to form →
        </a>
      </div>
    `;
    
    document.body.appendChild(fallback);
    
    // Auto-hide after 10 seconds
    setTimeout(() => {
      if (document.body.contains(fallback)) {
        fallback.style.opacity = '0';
        setTimeout(() => {
          if (document.body.contains(fallback)) {
            document.body.removeChild(fallback);
          }
        }, 300);
      }
    }, 10000);
  }
};

// Initialize AI Assistant
document.addEventListener('DOMContentLoaded', function() {
  // Check if AI assistant container exists
  if (!document.getElementById('aiAssistant')) {
    console.log('AI Assistant: Container not found, feature not available');
    return;
  }
  
  try {
    // Initialize with error handling
    const aiAssistant = new FranchiseAIAssistant();
    
    // Make available globally for debugging
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      window.franchiseAI = aiAssistant;
    }
    
  } catch (error) {
    AIAssistantUtils.handleError(error, 'initialization');
  }
});

// Global error handler for AI assistant
window.addEventListener('error', function(event) {
  if (event.filename && (event.filename.includes('ai.js') || event.filename.includes('franchise.js')) && 
      event.message && event.message.toLowerCase().includes('ai')) {
    AIAssistantUtils.handleError(event.error, 'runtime');
  }
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', function(event) {
  if (event.reason && event.reason.stack && event.reason.stack.includes('FranchiseAIAssistant')) {
    AIAssistantUtils.handleError(event.reason, 'promise_rejection');
  }
});