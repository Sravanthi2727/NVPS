const fs = require('fs');

// Read gallery file
let galleryContent = fs.readFileSync('views/gallery.ejs', 'utf8');

// Find the script section and replace the wishlist/cart functionality
const scriptStart = galleryContent.indexOf('<script>');
const scriptEnd = galleryContent.lastIndexOf('</script>') + 9;

const beforeScript = galleryContent.substring(0, scriptStart);
const afterScript = galleryContent.substring(scriptEnd);

// Working JavaScript code (simplified from menu page)
const workingScript = `<script>
    // State management for wishlist and cart
    const wishlistItems = new Set();
    const cartItems = new Map();

    // Add event listeners for wishlist and cart buttons
    document.addEventListener('DOMContentLoaded', function() {
        // Load initial state
        loadInitialState();

        // Wishlist button click handlers
        document.querySelectorAll('.add-to-wishlist-btn').forEach(button => {
            button.addEventListener('click', function() {
                const itemId = this.getAttribute('data-item-id');
                const itemName = this.getAttribute('data-item-name');
                const itemPrice = parseFloat(this.getAttribute('data-item-price'));
                const itemImage = this.getAttribute('data-item-image');
                
                toggleWishlistItem(itemId, itemName, itemPrice, itemImage, this);
            });
        });

        // Cart button click handlers
        document.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.addEventListener('click', function() {
                const itemId = this.getAttribute('data-item-id');
                const itemName = this.getAttribute('data-item-name');
                const itemPrice = parseFloat(this.getAttribute('data-item-price'));
                const itemImage = this.getAttribute('data-item-image');
                
                addToCartItem(itemId, itemName, itemPrice, itemImage, this);
            });
        });

        // Category filter functionality
        const filterButtons = document.querySelectorAll('.category-btn');
        const galleryItems = document.querySelectorAll('[data-category]');
        
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                const filter = this.getAttribute('data-filter');
                
                galleryItems.forEach(item => {
                    if (filter === 'all' || item.getAttribute('data-category') === filter) {
                        item.style.display = 'block';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        });
    });

    // Load initial cart and wishlist state
    async function loadInitialState() {
        try {
            // Load cart items
            const cartResponse = await fetch('/api/cart');
            if (cartResponse.ok) {
                const cart = await cartResponse.json();
                cart.forEach(item => {
                    cartItems.set(item.itemId, item.quantity);
                });
            }

            // Load wishlist items
            const wishlistResponse = await fetch('/api/wishlist');
            if (wishlistResponse.ok) {
                const wishlist = await wishlistResponse.json();
                wishlist.forEach(item => {
                    wishlistItems.add(item.itemId);
                });
            }

            // Update UI based on loaded state
            updateAllButtonStates();
        } catch (error) {
            console.log('Could not load initial state (user might not be logged in)');
        }
    }

    // Update all button states based on current cart and wishlist
    function updateAllButtonStates() {
        // Update wishlist buttons
        document.querySelectorAll('.add-to-wishlist-btn').forEach(button => {
            const itemId = button.getAttribute('data-item-id');
            const inWishlist = wishlistItems.has(itemId);
            updateWishlistButtonState(button, inWishlist);
        });

        // Update cart buttons
        document.querySelectorAll('.add-to-cart-btn').forEach(button => {
            const itemId = button.getAttribute('data-item-id');
            const inCart = cartItems.has(itemId);
            updateCartButtonState(button, inCart);
        });
    }

    // Update wishlist button state
    function updateWishlistButtonState(button, inWishlist) {
        if (inWishlist) {
            button.classList.add('in-wishlist');
            const icon = button.querySelector('i');
            if (icon) {
                icon.classList.remove('far');
                icon.classList.add('fas');
            }
        } else {
            button.classList.remove('in-wishlist');
            const icon = button.querySelector('i');
            if (icon) {
                icon.classList.remove('fas');
                icon.classList.add('far');
            }
        }
    }

    // Update cart button state for art items
    function updateCartButtonState(button, inCart) {
        if (inCart) {
            button.innerHTML = '<i class="fas fa-check"></i> In Cart';
            button.style.backgroundColor = 'var(--gold)';
            button.style.color = '#fff';
            button.disabled = true;
        } else {
            button.innerHTML = '<i class="fas fa-shopping-cart"></i>';
            button.style.backgroundColor = 'var(--gold)';
            button.style.color = 'var(--dark)';
            button.disabled = false;
        }
    }

    // Toggle wishlist item
    function toggleWishlistItem(itemId, itemName, price, image, buttonElement) {
        const inWishlist = wishlistItems.has(itemId);
        
        if (inWishlist) {
            removeFromWishlist(itemId, buttonElement);
        } else {
            addToWishlistItem(itemId, itemName, price, image, buttonElement);
        }
    }

    function addToWishlistItem(itemId, itemName, price, image, buttonElement) {
        console.log('Adding to wishlist:', { itemId, itemName, price, image });
        
        fetch('/api/wishlist', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                itemId: itemId,
                name: itemName,
                price: price,
                image: image,
                type: 'art'
            })
        })
        .then(response => {
            if (response.status === 401) {
                window.location.href = '/signin';
                return;
            }
            return response.json();
        })
        .then(data => {
            if (data && data.success) {
                wishlistItems.add(itemId);
                updateWishlistButtonState(buttonElement, true);
                showNotification('Item added to wishlist!', 'success');
            } else if (data) {
                showNotification(data.message || 'Failed to add item to wishlist', 'error');
            }
        })
        .catch(error => {
            console.error('Error adding to wishlist:', error);
            showNotification('Failed to add item to wishlist', 'error');
        });
    }

    function removeFromWishlist(itemId, buttonElement) {
        fetch('/api/wishlist/' + itemId, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data && data.success) {
                wishlistItems.delete(itemId);
                updateWishlistButtonState(buttonElement, false);
                showNotification('Item removed from wishlist!', 'success');
            } else {
                showNotification(data.message || 'Failed to remove item from wishlist', 'error');
            }
        })
        .catch(error => {
            console.error('Error removing from wishlist:', error);
            showNotification('Failed to remove item from wishlist', 'error');
        });
    }

    function addToCartItem(itemId, itemName, price, image, buttonElement) {
        console.log('Adding to cart:', { itemId, itemName, price, image });
        
        if (cartItems.has(itemId)) {
            showNotification('This artwork is already in your cart. Art pieces are unique!', 'error');
            return;
        }
        
        fetch('/api/cart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                itemId: itemId,
                name: itemName,
                price: price,
                image: image,
                quantity: 1,
                type: 'art'
            })
        })
        .then(response => {
            if (response.status === 401) {
                window.location.href = '/signin';
                return;
            }
            return response.json();
        })
        .then(data => {
            if (data && data.success) {
                cartItems.set(itemId, 1);
                updateCartButtonState(buttonElement, true);
                showNotification('Artwork added to cart!', 'success');
            } else if (data) {
                showNotification(data.message || 'Failed to add item to cart', 'error');
            }
        })
        .catch(error => {
            console.error('Error adding to cart:', error);
            showNotification('Failed to add item to cart', 'error');
        });
    }

    // Notification system
    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = 'alert alert-' + (type === 'success' ? 'success' : 'danger') + ' position-fixed';
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; max-width: 300px; animation: slideInRight 0.3s ease;';
        notification.innerHTML = '<i class="fas fa-' + (type === 'success' ? 'check-circle' : 'exclamation-circle') + '"></i> ' + message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
</script>`;

// Combine the parts
const newContent = beforeScript + workingScript + afterScript;

// Write the new content
fs.writeFileSync('views/gallery.ejs', newContent);

console.log('✅ Gallery wishlist functionality restored!');