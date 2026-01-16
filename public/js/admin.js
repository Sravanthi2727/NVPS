// Admin Dashboard Common JavaScript

// Generic table filter function
function filterTable(tableSelector, filters) {
    const rows = document.querySelectorAll(`${tableSelector} tbody tr`);
    
    rows.forEach(row => {
        let showRow = true;
        const cells = row.querySelectorAll('td');
        
        // Apply each filter
        for (const [filterType, filterValue] of Object.entries(filters)) {
            if (!filterValue) continue; // Skip empty filters
            
            const lowerFilterValue = filterValue.toLowerCase();
            
            switch(filterType) {
                case 'status':
                    const statusBadge = row.querySelector('.badge');
                    if (statusBadge) {
                        const status = statusBadge.textContent.toLowerCase();
                        if (!status.includes(lowerFilterValue)) {
                            showRow = false;
                        }
                    }
                    break;
                    
                case 'search':
                    let found = false;
                    cells.forEach(cell => {
                        if (cell.textContent.toLowerCase().includes(lowerFilterValue)) {
                            found = true;
                        }
                    });
                    if (!found) showRow = false;
                    break;
                    
                case 'date':
                    const dateCell = Array.from(cells).find(cell => {
                        const text = cell.textContent;
                        return text.match(/\d{1,2}\/\d{1,2}\/\d{4}/) || text.match(/\d{4}-\d{2}-\d{2}/);
                    });
                    if (dateCell) {
                        const cellDate = dateCell.textContent;
                        if (!cellDate.includes(filterValue)) {
                            showRow = false;
                        }
                    }
                    break;
            }
        }
        
        row.style.display = showRow ? '' : 'none';
    });
}

// Initialize filters for a page
function initializeFilters(tableSelector) {
    const statusFilter = document.getElementById('statusFilter');
    const searchFilter = document.getElementById('searchFilter') || document.getElementById('searchInput');
    const dateFilter = document.getElementById('dateFilter');
    const paymentFilter = document.getElementById('paymentFilter');
    
    const applyFilters = () => {
        const filters = {};
        
        if (statusFilter) filters.status = statusFilter.value;
        if (searchFilter) filters.search = searchFilter.value;
        if (dateFilter) filters.date = dateFilter.value;
        if (paymentFilter) filters.payment = paymentFilter.value;
        
        filterTable(tableSelector, filters);
    };
    
    if (statusFilter) {
        statusFilter.addEventListener('change', applyFilters);
    }
    
    if (searchFilter) {
        searchFilter.addEventListener('input', applyFilters);
    }
    
    if (dateFilter) {
        dateFilter.addEventListener('change', applyFilters);
    }
    
    if (paymentFilter) {
        paymentFilter.addEventListener('change', applyFilters);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Check which admin page we're on and initialize appropriate filters
    const currentPath = window.location.pathname;
    
    if (currentPath.includes('/admin/cart-requests')) {
        initializeFilters('.admin-table table');
    } else if (currentPath.includes('/admin/art-requests')) {
        initializeFilters('.admin-table table');
    } else if (currentPath.includes('/admin/workshop-requests')) {
        initializeFilters('table');
    } else if (currentPath.includes('/admin/users')) {
        initializeFilters('.admin-table table');
    } else if (currentPath.includes('/admin/franchise')) {
        // Franchise page has its own filter logic
        console.log('Franchise page - using custom filters');
    }
});
