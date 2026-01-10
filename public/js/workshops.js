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
function openRegister(name, date) {
  document.getElementById('workshopName').value = name;
  document.getElementById('workshopDate').value = date;
  document.getElementById('registerModal').style.display = 'flex';
}

function closeRegister() {
  document.getElementById('registerModal').style.display = 'none';
}

document.getElementById('registerForm').addEventListener('submit', e => {
  e.preventDefault();
  
  // Get form data
  const workshopName = document.getElementById('workshopName').value;
  const workshopDate = document.getElementById('workshopDate').value;
  const formData = new FormData(e.target);
  const userName = formData.get('name') || e.target.elements[2].value;
  const userEmail = formData.get('email') || e.target.elements[3].value;
  const userPhone = formData.get('phone') || e.target.elements[4].value;
  
  // Create workshop registration object
  const registration = {
    id: Date.now(),
    workshopName: workshopName,
    workshopDate: workshopDate,
    userName: userName,
    userEmail: userEmail,
    userPhone: userPhone,
    registrationDate: new Date().toISOString().split('T')[0],
    status: 'registered'
  };
  
  // Get current registrations from localStorage
  let registrations = JSON.parse(localStorage.getItem('workshopRegistrations')) || [];
  
  // Add new registration
  registrations.push(registration);
  
  // Save to localStorage
  localStorage.setItem('workshopRegistrations', JSON.stringify(registrations));
  
  alert('Registration successful! You can view your registered workshops in your dashboard.');
  closeRegister();
  
  // Reset form
  e.target.reset();
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
