/**
 * Workshops Page JavaScript
 * Handles workshop registration and interactions
 */

// Global variables
let currentWorkshopData = {};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Workshops page loaded');
    
    // Initialize countdown timers
    initializeCountdowns();
    
    // Initialize particles animation
    initializeParticles();
    
    // Initialize modals
    initializeModals();
});

// Initialize countdown timers
function initializeCountdowns() {
    const countdownElements = document.querySelectorAll('.countdown');
    
    countdownElements.forEach(element => {
        const workshopDate = element.getAttribute('data-date');
        if (workshopDate) {
            updateCountdown(element, new Date(workshopDate));
            
            // Update every minute
            setInterval(() => {
                updateCountdown(element, new Date(workshopDate));
            }, 60000);
        }
    });
}

// Update countdown display
function updateCountdown(element, targetDate) {
    const now = new Date().getTime();
    const distance = targetDate.getTime() - now;
    
    if (distance < 0) {
        element.innerHTML = "Workshop has started";
        return;
    }
    
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
        element.innerHTML = `${days} days, ${hours} hours`;
    } else if (hours > 0) {
        element.innerHTML = `${hours} hours, ${minutes} minutes`;
    } else {
        element.innerHTML = `${minutes} minutes`;
    }
}

// Initialize particles animation
function initializeParticles() {
    const particlesContainer = document.querySelector('.particles');
    if (!particlesContainer) return;
    
    // Create floating particles
    for (let i = 0; i < 20; i++) {
        createParticle(particlesContainer);
    }
}

// Create a single particle
function createParticle(container) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    // Random position and animation
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDuration = (Math.random() * 10 + 5) + 's';
    particle.style.animationDelay = Math.random() * 5 + 's';
    
    container.appendChild(particle);
    
    // Remove and recreate after animation
    setTimeout(() => {
        if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
            createParticle(container);
        }
    }, 15000);
}

// Initialize modal functionality
function initializeModals() {
    // Close modals when clicking outside
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeAllModals();
        }
    });
    
    // Close modals with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });
}

// Handle workshop registration button click
function handleRegisterClick(button) {
    try {
        const workshopId = button.getAttribute('data-workshop-id');
        const workshopTitle = button.getAttribute('data-workshop-title');
        const workshopDate = button.getAttribute('data-workshop-date');
        
        console.log('Registration clicked:', { workshopId, workshopTitle, workshopDate });
        
        if (!workshopId || workshopId === '' || workshopId === 'undefined') {
            console.error('Workshop ID is missing or invalid');
            showNotification('Workshop registration is not available at the moment.', 'error');
            return;
        }
        
        // Check if user is logged in first
        checkAuthenticationAndRegister(workshopId, workshopTitle, workshopDate);
        
    } catch (error) {
        console.error('Error handling registration click:', error);
        showNotification('An error occurred. Please try again.', 'error');
    }
}

// Check if user is authenticated before allowing registration
async function checkAuthenticationAndRegister(workshopId, workshopTitle, workshopDate) {
    try {
        // Check authentication status
        const response = await fetch('/api/auth/status', {
            credentials: 'include'
        });
        
        if (response.ok) {
            const authData = await response.json();
            if (authData.isAuthenticated) {
                // User is logged in, proceed with registration
                currentWorkshopData = {
                    id: workshopId,
                    title: workshopTitle,
                    date: workshopDate
                };
                openRegisterModal(workshopId, workshopTitle, workshopDate);
            } else {
                // User is not logged in
                showLoginRequiredModal();
            }
        } else {
            // Authentication check failed, assume not logged in
            showLoginRequiredModal();
        }
    } catch (error) {
        console.error('Error checking authentication:', error);
        // On error, assume not logged in
        showLoginRequiredModal();
    }
}

// Show modal requiring login for workshop registration
function showLoginRequiredModal() {
    // Remove existing login modal if any
    const existingModal = document.getElementById('loginRequiredModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create login required modal
    const modal = document.createElement('div');
    modal.id = 'loginRequiredModal';
    modal.className = 'modal';
    modal.style.cssText = `
        display: flex;
        position: fixed;
        z-index: 10000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.8);
        align-items: center;
        justify-content: center;
    `;
    
    modal.innerHTML = `
        <div class="modal-content" style="
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            color: #f5f2ee;
            padding: 2rem;
            border-radius: 12px;
            max-width: 500px;
            width: 90%;
            text-align: center;
            border: 2px solid #d6a45a;
            box-shadow: 0 10px 30px rgba(214, 164, 90, 0.3);
        ">
            <div style="margin-bottom: 1.5rem;">
                <i class="fas fa-user-lock" style="font-size: 3rem; color: #d6a45a; margin-bottom: 1rem;"></i>
                <h3 style="color: #d6a45a; margin-bottom: 0.5rem;">Login Required</h3>
                <p style="color: #ccc; margin-bottom: 0;">
                    You need to be logged in to register for workshops. This helps us manage your registrations and send you important updates.
                </p>
            </div>
            
            <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                <a href="/auth/google" style="
                    background: #d6a45a;
                    color: #000;
                    padding: 0.75rem 1.5rem;
                    border-radius: 8px;
                    text-decoration: none;
                    font-weight: 600;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    transition: all 0.3s ease;
                " onmouseover="this.style.background='#c19441'" onmouseout="this.style.background='#d6a45a'">
                    <i class="fab fa-google"></i>
                    Login with Google
                </a>
                
                <button onclick="closeLoginRequiredModal()" style="
                    background: transparent;
                    color: #d6a45a;
                    border: 2px solid #d6a45a;
                    padding: 0.75rem 1.5rem;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                " onmouseover="this.style.background='#d6a45a'; this.style.color='#000'" onmouseout="this.style.background='transparent'; this.style.color='#d6a45a'">
                    Cancel
                </button>
            </div>
            
            <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid rgba(214, 164, 90, 0.3);">
                <small style="color: #999;">
                    <i class="fas fa-info-circle"></i>
                    After logging in, you'll be able to view your registered workshops in your dashboard and receive calendar invites.
                </small>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeLoginRequiredModal();
        }
    });
}

// Close login required modal
function closeLoginRequiredModal() {
    const modal = document.getElementById('loginRequiredModal');
    if (modal) {
        modal.remove();
    }
}

// Open registration modal
function openRegisterModal(workshopId, workshopTitle, workshopDate) {
    const modal = document.getElementById('registerModal');
    if (!modal) {
        console.error('Registration modal not found');
        return;
    }
    
    // Populate form fields
    const workshopIdField = document.getElementById('workshopId');
    const workshopNameField = document.getElementById('workshopName');
    const workshopDateField = document.getElementById('workshopDate');
    
    if (workshopIdField) workshopIdField.value = workshopId;
    if (workshopNameField) workshopNameField.value = workshopTitle;
    if (workshopDateField) workshopDateField.value = workshopDate;
    
    // Clear participant fields
    const participantName = document.getElementById('participantName');
    const participantEmail = document.getElementById('participantEmail');
    const participantPhone = document.getElementById('participantPhone');
    
    if (participantName) participantName.value = '';
    if (participantEmail) participantEmail.value = '';
    if (participantPhone) participantPhone.value = '';
    
    // Show modal
    modal.classList.add('show');
    modal.style.display = 'flex';
    
    // Focus on first input
    if (participantName) {
        setTimeout(() => participantName.focus(), 100);
    }
}

// Close registration modal
function closeRegister() {
    const modal = document.getElementById('registerModal');
    if (modal) {
        modal.classList.remove('show');
        modal.style.display = 'none';
    }
}

// Open organize workshop modal
function openOrganizeModal() {
    const modal = document.getElementById('organizeModal');
    if (modal) {
        modal.classList.add('show');
        modal.style.display = 'flex';
        
        // Focus on first input
        const firstInput = modal.querySelector('input');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    }
}

// Close organize workshop modal
function closeOrganizeModal() {
    const modal = document.getElementById('organizeModal');
    if (modal) {
        modal.classList.remove('show');
        modal.style.display = 'none';
    }
}

// Close all modals
function closeAllModals() {
    closeRegister();
    closeOrganizeModal();
    closeGallery();
}

// Open gallery modal
function openGallery(images) {
    const modal = document.getElementById('galleryModal');
    const content = document.getElementById('galleryContent');
    
    if (!modal || !content) return;
    
    if (!images || images.length === 0) {
        content.innerHTML = '<p style="color: var(--text); text-align: center; padding: 2rem;">No gallery images available</p>';
    } else {
        content.innerHTML = images.map(img => 
            `<img src="${img}" alt="Workshop Gallery" style="width: 100%; border-radius: 8px; margin-bottom: 1rem;">`
        ).join('');
    }
    
    modal.classList.add('show');
    modal.style.display = 'flex';
}

// Close gallery modal
function closeGallery() {
    const modal = document.getElementById('galleryModal');
    if (modal) {
        modal.classList.remove('show');
        modal.style.display = 'none';
    }
}

// Handle workshop registration form submission
document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegistrationSubmit);
    }
    
    const organizeForm = document.getElementById('organizeWorkshopForm');
    if (organizeForm) {
        organizeForm.addEventListener('submit', handleOrganizeSubmit);
    }
});

// Handle registration form submission
async function handleRegistrationSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // Get form data
    const formData = new FormData(form);
    const registrationData = {
        workshopId: document.getElementById('workshopId')?.value,
        workshopName: document.getElementById('workshopName')?.value,
        workshopDate: document.getElementById('workshopDate')?.value,
        participantName: document.getElementById('participantName')?.value,
        participantEmail: document.getElementById('participantEmail')?.value,
        participantPhone: document.getElementById('participantPhone')?.value
    };
    
    console.log('Submitting registration:', registrationData);
    
    // Validate required fields
    if (!registrationData.participantName || !registrationData.participantEmail || !registrationData.participantPhone) {
        showNotification('Please fill in all required fields.', 'error');
        return;
    }
    
    // Disable submit button
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registering...';
    }
    
    try {
        const response = await fetch('/api/workshops/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // Include authentication cookies
            body: JSON.stringify(registrationData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Registration successful! You will receive a confirmation email shortly.', 'success');
            closeRegister();
            form.reset();
        } else {
            showNotification(result.error || 'Registration failed. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showNotification('Network error. Please check your connection and try again.', 'error');
    } finally {
        // Re-enable submit button
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-check"></i> Confirm Registration';
        }
    }
}

// Handle organize workshop form submission
async function handleOrganizeSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // Get form data
    const proposalData = {
        title: document.getElementById('proposedTitle')?.value,
        category: document.getElementById('proposedCategory')?.value,
        description: document.getElementById('proposedDescription')?.value,
        organizerName: document.getElementById('organizerName')?.value,
        organizerEmail: document.getElementById('organizerEmail')?.value,
        organizerPhone: document.getElementById('organizerPhone')?.value,
        organizerExperience: document.getElementById('organizerExperience')?.value,
        duration: document.getElementById('proposedDuration')?.value,
        capacity: document.getElementById('proposedCapacity')?.value,
        skillLevel: document.getElementById('proposedSkillLevel')?.value,
        price: document.getElementById('proposedPrice')?.value,
        preferredDate: document.getElementById('preferredDate')?.value,
        materialsNeeded: document.getElementById('materialsNeeded')?.value,
        collaborationType: document.getElementById('collaborationType')?.value,
        additionalNotes: document.getElementById('additionalNotes')?.value
    };
    
    console.log('Submitting workshop proposal:', proposalData);
    
    // Validate required fields
    const requiredFields = ['title', 'category', 'description', 'organizerName', 'organizerEmail', 'duration', 'capacity'];
    const missingFields = requiredFields.filter(field => !proposalData[field]);
    
    if (missingFields.length > 0) {
        showNotification(`Please fill in all required fields: ${missingFields.join(', ')}`, 'error');
        return;
    }
    
    // Disable submit button
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    }
    
    try {
        const response = await fetch('/submit-workshop-proposal', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(proposalData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Workshop proposal submitted successfully! We will review it and get back to you soon.', 'success');
            closeOrganizeModal();
            form.reset();
        } else {
            showNotification(result.message || 'Proposal submission failed. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Proposal submission error:', error);
        showNotification('Network error. Please check your connection and try again.', 'error');
    } finally {
        // Re-enable submit button
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Proposal';
        }
    }
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.workshop-notification');
    existingNotifications.forEach(n => n.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `workshop-notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        max-width: 400px;
        font-size: 14px;
        line-height: 1.4;
        animation: slideInRight 0.3s ease;
    `;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Expose functions globally for onclick handlers
window.handleRegisterClick = handleRegisterClick;
window.openRegisterModal = openRegisterModal;
window.closeRegister = closeRegister;
window.openOrganizeModal = openOrganizeModal;
window.closeOrganizeModal = closeOrganizeModal;
window.openGallery = openGallery;
window.closeGallery = closeGallery;
window.closeLoginRequiredModal = closeLoginRequiredModal;

console.log('✅ Workshops JavaScript loaded successfully');