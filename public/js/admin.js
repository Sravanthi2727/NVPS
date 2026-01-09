// Admin Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Filter functionality
    initializeFilters();
    
    // Auto-refresh functionality
    initializeAutoRefresh();
    
    // Form validation
    initializeFormValidation();
});

// Filter functionality for tables
function initializeFilters() {
    const statusFilter = document.getElementById('statusFilter');
    const dateFilter = document.getElementById('dateFilter');
    const searchFilter = document.getElementById('searchFilter');
    const workshopFilter = document.getElementById('workshopFilter');
    const roleFilter = document.getElementById('roleFilter');

    // Status filter
    if (statusFilter) {
        statusFilter.addEventListener('change', function() {
            filterTable('status', this.value);
        });
    }

    // Date filter
    if (dateFilter) {
        dateFilter.addEventListener('change', function() {
            filterTable('date', this.value);
        });
    }

    // Search filter
    if (searchFilter) {
        searchFilter.addEventListener('input', function() {
            filterTable('search', this.value);
        });
    }

    // Workshop filter
    if (workshopFilter) {
        workshopFilter.addEventListener('change', function() {
            filterTable('workshop', this.value);
        });
    }

    // Role filter
    if (roleFilter) {
        roleFilter.addEventListener('change', function() {
            filterTable('role', this.value);
        });
    }
}

// Filter table rows based on criteria
function filterTable(filterType, filterValue) {
    const table = document.querySelector('.admin-table tbody');
    if (!table) return;

    const rows = table.querySelectorAll('tr');
    
    rows.forEach(row => {
        let shouldShow = true;
        
        switch(filterType) {
            case 'status':
                if (filterValue) {
                    const statusBadge = row.querySelector('.badge');
                    const status = statusBadge ? statusBadge.textContent.toLowerCase().trim() : '';
                    shouldShow = status.includes(filterValue.toLowerCase());
                }
                break;
                
            case 'search':
                if (filterValue) {
                    const text = row.textContent.toLowerCase();
                    shouldShow = text.includes(filterValue.toLowerCase());
                }
                break;
                
            case 'workshop':
                if (filterValue) {
                    const workshopCell = row.querySelector('.workshop-info');
                    const workshop = workshopCell ? workshopCell.textContent.toLowerCase() : '';
                    shouldShow = workshop.includes(filterValue.toLowerCase());
                }
                break;
                
            case 'role':
                if (filterValue) {
                    const roleBadge = row.querySelectorAll('.badge')[0];
                    const role = roleBadge ? roleBadge.textContent.toLowerCase().trim() : '';
                    shouldShow = role.includes(filterValue.toLowerCase());
                }
                break;
        }
        
        row.style.display = shouldShow ? '' : 'none';
    });
    
    updateTableStats();
}

// Update table statistics after filtering
function updateTableStats() {
    const table = document.querySelector('.admin-table tbody');
    if (!table) return;
    
    const totalRows = table.querySelectorAll('tr').length;
    const visibleRows = table.querySelectorAll('tr:not([style*="display: none"])').length;
    
    // Update any stats display if exists
    const statsElement = document.querySelector('.table-stats');
    if (statsElement) {
        statsElement.textContent = `Showing ${visibleRows} of ${totalRows} entries`;
    }
}

// Auto-refresh functionality
function initializeAutoRefresh() {
    const refreshButton = document.getElementById('refreshButton');
    if (refreshButton) {
        refreshButton.addEventListener('click', function() {
            location.reload();
        });
    }
    
    // Auto-refresh every 5 minutes for dashboard
    if (window.location.pathname === '/admin') {
        setInterval(function() {
            // Only refresh if user is still active (not idle)
            if (document.hasFocus()) {
                updateDashboardStats();
            }
        }, 300000); // 5 minutes
    }
}

// Update dashboard statistics
function updateDashboardStats() {
    // This would typically make AJAX calls to get updated stats
    console.log('Updating dashboard statistics...');
    
    // Example: Update card numbers
    const cards = document.querySelectorAll('.admin-card-number');
    cards.forEach(card => {
        // Add a subtle animation to indicate update
        card.style.opacity = '0.7';
        setTimeout(() => {
            card.style.opacity = '1';
        }, 500);
    });
}

// Form validation
function initializeFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            
            form.classList.add('was-validated');
        });
    });
}

// Utility functions
function showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alertContainer') || document.body;
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    alertContainer.insertBefore(alert, alertContainer.firstChild);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        if (alert.parentNode) {
            alert.remove();
        }
    }, 5000);
}

function confirmAction(message, callback) {
    if (confirm(message)) {
        callback();
    }
}

// Export functions for use in other scripts
window.adminUtils = {
    showAlert,
    confirmAction,
    filterTable,
    updateDashboardStats
};

// Keyboard shortcuts
document.addEventListener('keydown', function(event) {
    // Ctrl/Cmd + R for refresh
    if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
        event.preventDefault();
        location.reload();
    }
    
    // Escape to close modals
    if (event.key === 'Escape') {
        const openModal = document.querySelector('.modal.show');
        if (openModal) {
            bootstrap.Modal.getInstance(openModal).hide();
        }
    }
});

// Handle form submissions with loading states
document.addEventListener('submit', function(event) {
    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        
        // Re-enable after 3 seconds as fallback
        setTimeout(() => {
            submitButton.disabled = false;
            submitButton.innerHTML = submitButton.dataset.originalText || 'Submit';
        }, 3000);
    }
});

// Store original button text for loading states
document.addEventListener('DOMContentLoaded', function() {
    const submitButtons = document.querySelectorAll('button[type="submit"]');
    submitButtons.forEach(button => {
        button.dataset.originalText = button.innerHTML;
    });
});