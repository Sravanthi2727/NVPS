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
  alert('Registration successful!');
  closeRegister();
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
