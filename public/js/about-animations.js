/**
 * About Page Animations
 * Smooth animations and interactions for the about page
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
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);
  
  // Add fade-in animation to cards
  const animatedElements = document.querySelectorAll('.about-team-card, .about-dev-card, .about-story-card, .franchise-benefit-card, .franchise-support-card, .franchise-business-model-item, .franchise-qualification-item');
  animatedElements.forEach(element => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(30px)';
    element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(element);
  });
  
  // Add revealed class for franchise cards
  const franchiseObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        franchiseObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  const franchiseCards = document.querySelectorAll('.franchise-benefit-card, .franchise-support-card, .franchise-business-model-item, .franchise-qualification-item');
  franchiseCards.forEach(card => {
    franchiseObserver.observe(card);
  });
  
  // Add hover effects to team cards
  const teamCards = document.querySelectorAll('.about-team-card');
  teamCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-8px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0) scale(1)';
    });
  });
  
  // Add stagger animation to dev cards
  const devCards = document.querySelectorAll('.about-dev-card');
  devCards.forEach((card, index) => {
    setTimeout(() => {
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, index * 100);
  });
  
  // Add typing effect to hero title (optional)
  const heroTitle = document.querySelector('.about-hero-title');
  if (heroTitle) {
    const originalText = heroTitle.textContent;
    heroTitle.textContent = '';
    
    let i = 0;
    const typeWriter = () => {
      if (i < originalText.length) {
        heroTitle.textContent += originalText.charAt(i);
        i++;
        setTimeout(typeWriter, 50);
      }
    };
    
    // Start typing effect after a short delay
    setTimeout(typeWriter, 500);
  }
  
  // Add parallax effect to hero section
  const heroSection = document.querySelector('.about-hero-section');
  if (heroSection) {
    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      const rate = scrolled * -0.5;
      heroSection.style.transform = `translateY(${rate}px)`;
    });
  }
  
  // Add click animation to skill tags
  const skillTags = document.querySelectorAll('.about-skill-tag');
  skillTags.forEach(tag => {
    tag.addEventListener('click', function() {
      this.style.transform = 'scale(0.95)';
      setTimeout(() => {
        this.style.transform = 'scale(1)';
      }, 150);
    });
  });
  
  console.log('About page animations loaded successfully');
});