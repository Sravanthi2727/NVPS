// HERO PARTICLES
document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.particles');

  if (!container) {
    console.warn('Particles container not found');
    return;
  }

  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.className = 'particle';

    p.style.left = Math.random() * 100 + '%';
    p.style.animationDuration = 8 + Math.random() * 8 + 's';
    p.style.opacity = Math.random();

    container.appendChild(p);
  }

  // Initialize workshop organization form
  initializeWorkshopForm();
});


// COUNTDOWN
document.querySelectorAll('.countdown').forEach(el => {
  const target = new Date(el.dataset.date);
  setInterval(() => {
    const now = new Date();
    const diff = target - now;
    const d = Math.max(0, Math.floor(diff / (1000*60*60*24)));
    const h = Math.max(0, Math.floor(diff / (1000*60*60)%24));
    el.textContent = `${d} days ${h} hours remaining`;
  }, 1000);
});

// REGISTER
let currentWorkshopId = null;

// Handle register button click using data attributes (more reliable)
function handleRegisterClick(button) {
  const workshopId = button.getAttribute('data-workshop-id');
  const workshopTitle = button.getAttribute('data-workshop-title');
  const workshopDate = button.getAttribute('data-workshop-date');
  
  console.log('handleRegisterClick called with:', { 
    workshopId, 
    workshopTitle, 
    workshopDate,
    buttonAttributes: {
      'data-workshop-id': button.getAttribute('data-workshop-id'),
      'data-workshop-title': button.getAttribute('data-workshop-title'),
      'data-workshop-date': button.getAttribute('data-workshop-date')
    }
  });
  
  // Check if workshopId is valid
  if (!workshopId || 
      workshopId.trim() === '' || 
      workshopId === 'undefined' || 
      workshopId === 'null' ||
      workshopId === 'NaN') {
    console.error('Invalid workshop ID from button:', {
      workshopId: workshopId,
      type: typeof workshopId,
      length: workshopId ? workshopId.length : 0,
      buttonHTML: button.outerHTML.substring(0, 200)
    });
    showNotification('Workshop ID is missing. Please refresh the page and try again.', 'error');
    return;
  }
  
  openRegister(workshopTitle, workshopDate, workshopId);
}

function openRegister(name, date, workshopId) {
  console.log('openRegister called with:', { name, date, workshopId });
  
  // Ensure workshopId is a valid string
  const validWorkshopId = workshopId && workshopId.trim() !== '' && workshopId !== 'undefined' && workshopId !== 'null' 
    ? String(workshopId).trim() 
    : null;
  
  if (!validWorkshopId) {
    console.error('Invalid workshop ID:', workshopId);
    showNotification('Workshop ID is missing. Please refresh the page and try again.', 'error');
    return;
  }
  
  currentWorkshopId = validWorkshopId;
  
  // Set form values
  const workshopIdInput = document.getElementById('workshopId');
  const workshopNameInput = document.getElementById('workshopName');
  const workshopDateInput = document.getElementById('workshopDate');
  
  if (!workshopIdInput) {
    console.error('workshopId input field not found');
    showNotification('Registration form error. Please refresh the page.', 'error');
    return;
  }
  
  workshopIdInput.value = validWorkshopId;
  
  if (workshopNameInput) {
    workshopNameInput.value = name || '';
  }
  
  if (workshopDateInput) {
    workshopDateInput.value = date || '';
  }
  
  const modal = document.getElementById('registerModal');
  if (modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevent body scroll
  } else {
    console.error('Registration modal not found');
    showNotification('Registration modal not found. Please refresh the page.', 'error');
  }
  
  console.log('Registration modal opened with workshopId:', validWorkshopId);
}

// Make function globally available
window.handleRegisterClick = handleRegisterClick;
window.openRegister = openRegister;

function closeRegister() {
  document.getElementById('registerModal').style.display = 'none';
  document.body.style.overflow = 'auto'; // Restore body scroll
  // Reset form
  const form = document.getElementById('registerForm');
  if (form) {
    form.reset();
  }
  currentWorkshopId = null;
}

// ORGANIZE WORKSHOP MODAL
function openOrganizeModal() {
  const modal = document.getElementById('organizeModal');
  if (modal) {
    modal.style.display = 'flex';
    modal.classList.add('show');
    
    // Initialize form when modal opens (in case it wasn't initialized before)
    setTimeout(() => {
      initializeWorkshopForm();
      
      // Add direct click handler to submit button as fallback
      const submitBtn = document.querySelector('#organizeWorkshopForm .submit-btn');
      if (submitBtn) {
        submitBtn.addEventListener('click', function(e) {
          console.log('Submit button clicked directly');
          if (e.target.closest('form')) {
            // Let the form handle it
            return;
          }
          // Handle manually if needed
          e.preventDefault();
          const form = document.getElementById('organizeWorkshopForm');
          if (form) {
            const event = new Event('submit', { bubbles: true, cancelable: true });
            form.dispatchEvent(event);
          }
        });
      }
    }, 100);
    
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    const preferredDateInput = document.getElementById('preferredDate');
    if (preferredDateInput) {
      preferredDateInput.min = today;
    }
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    
    // Add escape key listener
    document.addEventListener('keydown', handleEscapeKey);
  }
}

function closeOrganizeModal() {
  const modal = document.getElementById('organizeModal');
  if (modal) {
    modal.style.display = 'none';
    modal.classList.remove('show');
    
    // Reset form
    const form = document.getElementById('organizeWorkshopForm');
    if (form) {
      form.reset();
    }
    
    // Restore body scroll
    document.body.style.overflow = 'auto';
    
    // Remove escape key listener
    document.removeEventListener('keydown', handleEscapeKey);
  }
}

function handleEscapeKey(e) {
  if (e.key === 'Escape') {
    closeOrganizeModal();
  }
}

// Make functions globally available
window.openOrganizeModal = openOrganizeModal;
window.closeOrganizeModal = closeOrganizeModal;

// Wait for DOM to be ready before adding event listener
document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitBtn = e.target.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      
      // Show loading state
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registering...';
      
      const workshopIdInput = document.getElementById('workshopId');
      const workshopId = (workshopIdInput && workshopIdInput.value) ? workshopIdInput.value.trim() : (currentWorkshopId ? String(currentWorkshopId).trim() : null);
      const workshopName = document.getElementById('workshopName').value;
      const workshopDate = document.getElementById('workshopDate').value;
      const participantName = document.getElementById('participantName').value;
      const participantEmail = document.getElementById('participantEmail').value;
      const participantPhone = document.getElementById('participantPhone').value;
      
      console.log('Form submission - workshopId:', workshopId, 'currentWorkshopId:', currentWorkshopId);
      
      // Validate form
      if (!participantName || !participantEmail || !participantPhone) {
        showNotification('Please fill in all required fields', 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        return;
      }
      
      if (!workshopId || workshopId === '' || workshopId === 'undefined' || workshopId === 'null') {
        console.error('Workshop ID validation failed:', {
          workshopId: workshopId,
          workshopIdInputValue: workshopIdInput ? workshopIdInput.value : 'input not found',
          currentWorkshopId: currentWorkshopId
        });
        showNotification('Workshop ID not found. Please close and reopen the registration form.', 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        return;
      }
      
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(participantEmail)) {
        showNotification('Please enter a valid email address', 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        return;
      }
      
      console.log('Submitting registration with workshopId:', workshopId);
      
      try {
        // Use public registration endpoint that works for both authenticated and non-authenticated users
        const response = await fetch('/api/workshops/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            workshopId: workshopId,
            workshopName: workshopName,
            workshopDate: workshopDate,
            participantName: participantName,
            participantEmail: participantEmail,
            participantPhone: participantPhone
          })
        });
        
        const result = await response.json();
        
        if (result.success) {
          showNotification(result.message || 'Registration successful! You will receive a confirmation email shortly.', 'success');
          setTimeout(() => {
            closeRegister();
          }, 1500);
        } else {
          showNotification(result.error || 'Registration failed. Please try again.', 'error');
        }
      } catch (error) {
        console.error('Registration error:', error);
        showNotification('Registration failed. Please check your connection and try again.', 'error');
      } finally {
        // Restore button state
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    });
  }
});

// GALLERY
function openGallery(images) {
  const gallery = document.getElementById('galleryContent');
  gallery.innerHTML = '';
  images.forEach(src => {
    const img = document.createElement('img');
    img.src = src;
    gallery.appendChild(img);
  });
  document.getElementById('galleryModal').style.display = 'flex';
}

function closeGallery() {
  document.getElementById('galleryModal').style.display = 'none';
}

// WORKSHOP ORGANIZATION FORM
function initializeWorkshopForm() {
  console.log('Initializing workshop form...');
  const form = document.getElementById('organizeWorkshopForm');
  if (!form) {
    console.error('Workshop form not found!');
    return;
  }
  
  // Check if already initialized
  if (form.dataset.initialized === 'true') {
    console.log('Form already initialized, skipping...');
    return;
  }
  
  console.log('Workshop form found, adding event listeners...');

  // Form submission handler
  form.addEventListener('submit', handleWorkshopFormSubmission);

  // Real-time validation
  const inputs = form.querySelectorAll('input, select, textarea');
  inputs.forEach(input => {
    input.addEventListener('blur', validateField);
    input.addEventListener('input', clearValidationError);
  });

  // Auto-resize textareas
  const textareas = form.querySelectorAll('textarea');
  textareas.forEach(textarea => {
    textarea.addEventListener('input', autoResizeTextarea);
  });
  
  // Mark as initialized
  form.dataset.initialized = 'true';
  
  console.log('Workshop form initialized successfully');
}

function handleWorkshopFormSubmission(e) {
  console.log('Form submission triggered');
  e.preventDefault();
  
  const submitBtn = e.target.querySelector('.submit-btn');
  const formData = collectWorkshopFormData();
  
  console.log('Collected form data:', formData);
  
  // Validate form
  if (!validateWorkshopForm(formData)) {
    console.log('Form validation failed');
    showNotification('Please fill in all required fields correctly.', 'error');
    return;
  }

  console.log('Form validation passed, submitting...');
  
  // Show loading state
  submitBtn.classList.add('loading');
  submitBtn.disabled = true;

  // Make API call to backend
  fetch('/submit-workshop-proposal', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData)
  })
  .then(response => {
    console.log('Response received:', response);
    return response.json();
  })
  .then(data => {
    console.log('Response data:', data);
    if (data.success) {
      // Show success message
      showNotification(data.message, 'success');
      
      // Reset form and close modal
      e.target.reset();
      closeOrganizeModal();
    } else {
      // Show error message
      showNotification(data.message || 'Failed to submit workshop proposal.', 'error');
    }
  })
  .catch(error => {
    console.error('Error submitting workshop proposal:', error);
    showNotification('Failed to submit workshop proposal. Please check your connection and try again.', 'error');
  })
  .finally(() => {
    // Remove loading state
    submitBtn.classList.remove('loading');
    submitBtn.disabled = false;
  });
}

function collectWorkshopFormData() {
  return {
    // Workshop Details
    title: document.getElementById('proposedTitle')?.value || '',
    category: document.getElementById('proposedCategory')?.value || '',
    description: document.getElementById('proposedDescription')?.value || '',
    
    // Organizer Information
    organizerName: document.getElementById('organizerName')?.value || '',
    organizerEmail: document.getElementById('organizerEmail')?.value || '',
    organizerPhone: document.getElementById('organizerPhone')?.value || '',
    organizerExperience: document.getElementById('organizerExperience')?.value || '',
    
    // Workshop Logistics
    duration: document.getElementById('proposedDuration')?.value || '',
    capacity: document.getElementById('proposedCapacity')?.value || '',
    skillLevel: document.getElementById('proposedSkillLevel')?.value || '',
    price: document.getElementById('proposedPrice')?.value || '',
    preferredDate: document.getElementById('preferredDate')?.value || '',
    
    // Materials & Requirements
    materialsNeeded: document.getElementById('materialsNeeded')?.value || '',
    spaceRequirements: document.getElementById('spaceRequirements')?.value || '',
    materialsProvided: document.getElementById('materialsProvided')?.checked || false,
    flexibleSchedule: document.getElementById('flexibleSchedule')?.checked || false,
    
    // Additional Information
    additionalNotes: document.getElementById('additionalNotes')?.value || '',
    collaborationType: document.getElementById('collaborationType')?.value || '',
    
    // Metadata
    submittedAt: new Date().toISOString(),
    source: 'workshop_page'
  };
}

function validateWorkshopForm(data) {
  const requiredFields = [
    'title', 'category', 'description', 
    'organizerName', 'organizerEmail', 
    'duration', 'capacity'
  ];
  
  for (const field of requiredFields) {
    if (!data[field] || data[field].trim() === '') {
      highlightRequiredField(field);
      return false;
    }
  }
  
  // Email validation
  if (data.organizerEmail && !isValidEmail(data.organizerEmail)) {
    highlightRequiredField('organizerEmail');
    return false;
  }
  
  return true;
}

function highlightRequiredField(fieldName) {
  const fieldMap = {
    'title': 'proposedTitle',
    'category': 'proposedCategory',
    'description': 'proposedDescription',
    'organizerName': 'organizerName',
    'organizerEmail': 'organizerEmail',
    'duration': 'proposedDuration',
    'capacity': 'proposedCapacity'
  };
  
  const element = document.getElementById(fieldMap[fieldName] || fieldName);
  if (element) {
    element.focus();
    element.style.borderColor = '#e74c3c';
    element.style.background = 'rgba(231, 76, 60, 0.1)';
    
    // Remove highlight after 3 seconds
    setTimeout(() => {
      element.style.borderColor = '';
      element.style.background = '';
    }, 3000);
  }
}

function validateField(e) {
  const field = e.target;
  const value = field.value.trim();
  
  // Check if required field is empty
  if (field.hasAttribute('required') && !value) {
    field.style.borderColor = '#e74c3c';
    field.style.background = 'rgba(231, 76, 60, 0.1)';
    return false;
  }
  
  // Email validation
  if (field.type === 'email' && value && !isValidEmail(value)) {
    field.style.borderColor = '#e74c3c';
    field.style.background = 'rgba(231, 76, 60, 0.1)';
    return false;
  }
  
  // Valid field styling
  if (value) {
    field.style.borderColor = '#27ae60';
    field.style.background = 'rgba(39, 174, 96, 0.1)';
  }
  
  return true;
}

function clearValidationError(e) {
  const field = e.target;
  if (field.value.trim()) {
    field.style.borderColor = '';
    field.style.background = '';
  }
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function autoResizeTextarea(e) {
  const textarea = e.target;
  textarea.style.height = 'auto';
  textarea.style.height = textarea.scrollHeight + 'px';
}

function showNotification(message, type = 'info') {
  // Remove existing notifications
  const existingNotifications = document.querySelectorAll('.workshop-notification');
  existingNotifications.forEach(notification => notification.remove());
  
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `workshop-notification ${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i>
      <span>${message}</span>
      <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `;
  
  // Add styles
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    max-width: 400px;
    background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
    color: white;
    padding: 16px;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    animation: slideInRight 0.3s ease-out;
  `;
  
  // Add to page
  document.body.appendChild(notification);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.animation = 'slideOutRight 0.3s ease-out';
      setTimeout(() => notification.remove(), 300);
    }
  }, 5000);
}

// Add CSS for notifications
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
  @keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOutRight {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
  
  .notification-content {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .notification-close {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    padding: 4px;
    margin-left: auto;
    opacity: 0.8;
    transition: opacity 0.2s;
  }
  
  .notification-close:hover {
    opacity: 1;
  }
`;
document.head.appendChild(notificationStyles);