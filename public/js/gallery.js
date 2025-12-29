// gallery.js
document.addEventListener('DOMContentLoaded', function() {
    // Initialize gallery if it exists on the page
    if (document.querySelector('.gallery-container')) {
        const gallery = document.querySelector('.gallery-container');
        const filterButtons = document.querySelectorAll('.filter-btn');

        // Filter gallery items
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Remove active class from all buttons
                filterButtons.forEach(btn => btn.classList.remove('active'));
                // Add active class to clicked button
                this.classList.add('active');
                
                const filter = this.getAttribute('data-filter');
                
                // Show/hide gallery items
                document.querySelectorAll('.gallery-item').forEach(item => {
                    if (filter === 'all' || item.getAttribute('data-category') === filter) {
                        item.style.display = 'block';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        });
    }

    // Smooth scroll to top for home link
    const homeLink = document.querySelector('a[href="index.html"]');
    if (homeLink) {
        homeLink.addEventListener('click', function(e) {
            // Only prevent default if we're already on the home page
            if (window.location.pathname.endsWith('index.html') || 
                window.location.pathname === '/') {
                e.preventDefault();
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }
        });
    }
});