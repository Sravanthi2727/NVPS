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

function openRegister(name, date, workshopId) {
  currentWorkshopId = workshopId;
  document.getElementById('workshopName').value = name;
  document.getElementById('workshopDate').value = date;
  document.getElementById('registerModal').style.display = 'flex';
}

function closeRegister() {
  document.getElementById('registerModal').style.display = 'none';
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

document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const workshopName = document.getElementById('workshopName').value;
  const workshopDate = document.getElementById('workshopDate').value;
  
  // Get form values
  const participantName = formData.get('name') || e.target.querySelector('input[placeholder="Your Name"]').value;
  const participantEmail = formData.get('email') || e.target.querySelector('input[type="email"]').value;
  const participantPhone = formData.get('phone') || e.target.querySelector('input[type="tel"]').value;
  
  if (!participantName || !participantEmail || !participantPhone) {
    alert('Please fill in all required fields');
    return;
  }
  
  if (!currentWorkshopId) {
    alert('Workshop ID not found. Please try again.');
    return;
  }
  
  try {
    const response = await fetch('/api/workshops', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workshopId: currentWorkshopId,
        workshopName,
        workshopDate,
        participantName,
        participantEmail,
        participantPhone
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert('Registration successful! You will receive a confirmation email shortly.');
      closeRegister();
      e.target.reset();
    } else {
      alert(result.error || 'Registration failed. Please try again.');
    }
  } catch (error) {
    console.error('Registration error:', error);
    alert('Registration failed. Please check your connection and try again.');
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