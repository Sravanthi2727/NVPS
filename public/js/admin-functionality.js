/**
 * Admin Functionality - Make all buttons, filters, and search bars functional
 * This file contains JavaScript to make all admin page controls interactive
 */

// Global variables
let currentPage = '';
let allData = [];
let filteredData = [];

// Initialize functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Detect current page
    currentPage = detectCurrentPage();
    console.log('Current admin page:', currentPage);
    
    // Initialize page-specific functionality
    initializePageFunctionality();
    
    // Add global event listeners
    addGlobalEventListeners();
});

// Detect which admin page we're on
function detectCurrentPage() {
    const path = window.location.pathname;
    if (path.includes('/admin/dashboard')) return 'dashboard';
    if (path.includes('/admin/cart-requests')) return 'cart-requests';
    if (path.includes('/admin/art-requests')) return 'art-requests';
    if (path.includes('/admin/workshop-requests')) return 'workshop-requests';
    if (path.includes('/admin/users')) return 'users';
    if (path.includes('/admin/manage-artworks')) return 'manage-artworks';
    if (path.includes('/admin/menu-management')) return 'menu-management';
    if (path.includes('/admin/franchise')) return 'franchise';
    if (path.includes('/admin/analytics')) return 'analytics';
    return 'unknown';
}

// Initialize functionality based on current page
function initializePageFunctionality() {
    switch(currentPage) {
        case 'dashboard':
            initializeDashboard();
            break;
        case 'cart-requests':
            initializeCartRequests();
            break;
        case 'art-requests':
            initializeArtRequests();
            break;
        case 'workshop-requests':
            initializeWorkshopRequests();
            break;
        case 'users':
            initializeUsers();
            break;
        case 'manage-artworks':
            initializeManageArtworks();
            break;
        case 'menu-management':
            initializeMenuManagement();
            break;
        case 'franchise':
            initializeFranchise();
            break;
        case 'analytics':
            initializeAnalytics();
            break;
    }
}

// Add global event listeners
function addGlobalEventListeners() {
    // Refresh buttons
    const refreshButtons = document.querySelectorAll('[data-action="refresh"], .btn:contains("Refresh")');
    refreshButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            refreshCurrentPageData();
        });
    });
    
    // Export buttons
    const exportButtons = document.querySelectorAll('[data-action="export"], .btn:contains("Export")');
    exportButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            exportCurrentPageData();
        });
    });
}

// Dashboard functionality
function initializeDashboard() {
    console.log('Initializing dashboard functionality...');
    
    // Refresh Data button
    const refreshBtn = document.querySelector('.btn-outline-primary');
    if (refreshBtn && refreshBtn.textContent.includes('Refresh')) {
        refreshBtn.addEventListener('click', function() {
            refreshDashboardData();
        });
    }
    
    // Make stat cards clickable
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach((card, index) => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', function() {
            const cardTypes = ['/admin/cart-requests', '/admin/art-requests', '/admin/workshop-requests', '/admin/franchise'];
            if (cardTypes[index]) {
                window.location.href = cardTypes[index];
            }
        });
    });
    
    // Recent activity view buttons
    const viewButtons = document.querySelectorAll('.btn-outline-primary.btn-sm');
    viewButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const row = btn.closest('tr');
            if (row) {
                showActivityDetails(row);
            }
        });
    });
}

// Cart Requests functionality
function initializeCartRequests() {
    console.log('Initializing cart requests functionality...');
    
    // Get all table rows for filtering
    allData = Array.from(document.querySelectorAll('tbody tr')).map(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length < 7) return null;
        
        return {
            element: row,
            customerName: cells[0]?.querySelector('strong')?.textContent?.toLowerCase() || '',
            customerEmail: cells[0]?.querySelector('small')?.textContent?.toLowerCase() || '',
            paymentMethod: cells[3]?.querySelector('.badge')?.textContent?.toLowerCase() || '',
            status: cells[6]?.querySelector('.badge')?.textContent?.toLowerCase() || '',
            totalAmount: parseFloat(cells[4]?.textContent?.replace('₹', '').replace(',', '') || '0'),
            orderDate: cells[5]?.textContent || ''
        };
    }).filter(item => item !== null);
    
    filteredData = [...allData];
    
    // Initialize filters
    initializeFilters();
    
    // Filter button functionality
    const filterBtn = document.querySelector('.btn-outline-primary');
    if (filterBtn && filterBtn.textContent.includes('Filter')) {
        filterBtn.addEventListener('click', function() {
            toggleFiltersVisibility();
        });
    }
}

// Art Requests functionality
function initializeArtRequests() {
    console.log('Initializing art requests functionality...');
    
    // Similar to cart requests but for art orders
    allData = Array.from(document.querySelectorAll('tbody tr')).map(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length < 7) return null;
        
        return {
            element: row,
            customerName: cells[0]?.querySelector('strong')?.textContent?.toLowerCase() || '',
            customerEmail: cells[0]?.querySelector('small')?.textContent?.toLowerCase() || '',
            paymentMethod: cells[3]?.querySelector('.badge')?.textContent?.toLowerCase() || '',
            status: cells[6]?.querySelector('.badge')?.textContent?.toLowerCase() || '',
            totalAmount: parseFloat(cells[4]?.textContent?.replace('₹', '').replace(',', '') || '0'),
            orderDate: cells[5]?.textContent || ''
        };
    }).filter(item => item !== null);
    
    filteredData = [...allData];
    initializeFilters();
    
    // Filter button
    const filterBtn = document.querySelector('.btn-outline-primary');
    if (filterBtn && filterBtn.textContent.includes('Filter')) {
        filterBtn.addEventListener('click', function() {
            toggleFiltersVisibility();
        });
    }
}

// Workshop Requests functionality
function initializeWorkshopRequests() {
    console.log('Initializing workshop requests functionality...');
    
    // Add search and filter functionality for workshop requests
    addWorkshopFilters();
    
    // View proposal buttons
    const viewButtons = document.querySelectorAll('.btn-outline-primary.btn-sm');
    viewButtons.forEach(btn => {
        if (btn.querySelector('.fa-eye')) {
            btn.addEventListener('click', function() {
                const row = btn.closest('tr');
                showWorkshopProposalDetails(row);
            });
        }
    });
}

// Users functionality
function initializeUsers() {
    console.log('Initializing users functionality...');
    
    // Get all user rows
    allData = Array.from(document.querySelectorAll('tbody tr')).map(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length < 6) return null;
        
        return {
            element: row,
            name: cells[1]?.querySelector('strong')?.textContent?.toLowerCase() || '',
            email: cells[2]?.textContent?.toLowerCase() || '',
            role: cells[3]?.querySelector('.badge')?.textContent?.toLowerCase() || '',
            status: cells[5]?.querySelector('.badge')?.textContent?.toLowerCase() || '',
            joinDate: cells[4]?.textContent || ''
        };
    }).filter(item => item !== null);
    
    filteredData = [...allData];
    
    // Initialize user filters
    initializeUserFilters();
    
    // Add User button functionality
    const addUserBtn = document.querySelector('.btn-primary');
    if (addUserBtn && addUserBtn.textContent.includes('Add User')) {
        addUserBtn.addEventListener('click', function() {
            showAddUserModal();
        });
    }
}

// Initialize filters for cart/art requests
function initializeFilters() {
    const statusFilter = document.getElementById('statusFilter');
    const paymentFilter = document.getElementById('paymentFilter');
    const searchInput = document.getElementById('searchInput');
    
    if (statusFilter) {
        statusFilter.addEventListener('change', applyFilters);
    }
    
    if (paymentFilter) {
        paymentFilter.addEventListener('change', applyFilters);
    }
    
    if (searchInput) {
        searchInput.addEventListener('input', debounce(applyFilters, 300));
    }
}

// Initialize user-specific filters
function initializeUserFilters() {
    const roleFilter = document.getElementById('roleFilter');
    const statusFilter = document.getElementById('statusFilter');
    const dateFilter = document.getElementById('dateFilter');
    const searchFilter = document.getElementById('searchFilter');
    
    if (roleFilter) {
        roleFilter.addEventListener('change', applyUserFilters);
    }
    
    if (statusFilter) {
        statusFilter.addEventListener('change', applyUserFilters);
    }
    
    if (dateFilter) {
        dateFilter.addEventListener('change', applyUserFilters);
    }
    
    if (searchFilter) {
        searchFilter.addEventListener('input', debounce(applyUserFilters, 300));
    }
}

// Apply filters for cart/art requests
function applyFilters() {
    const statusFilter = document.getElementById('statusFilter')?.value.toLowerCase() || '';
    const paymentFilter = document.getElementById('paymentFilter')?.value.toLowerCase() || '';
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    
    filteredData = allData.filter(item => {
        const matchesStatus = !statusFilter || item.status.includes(statusFilter);
        const matchesPayment = !paymentFilter || item.paymentMethod.includes(paymentFilter);
        const matchesSearch = !searchTerm || 
            item.customerName.includes(searchTerm) || 
            item.customerEmail.includes(searchTerm);
        
        return matchesStatus && matchesPayment && matchesSearch;
    });
    
    updateTableDisplay();
    updateFilterStats();
}

// Apply filters for users
function applyUserFilters() {
    const roleFilter = document.getElementById('roleFilter')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('statusFilter')?.value.toLowerCase() || '';
    const dateFilter = document.getElementById('dateFilter')?.value || '';
    const searchTerm = document.getElementById('searchFilter')?.value.toLowerCase() || '';
    
    filteredData = allData.filter(item => {
        const matchesRole = !roleFilter || item.role.includes(roleFilter);
        const matchesStatus = !statusFilter || item.status.includes(statusFilter);
        const matchesSearch = !searchTerm || 
            item.name.includes(searchTerm) || 
            item.email.includes(searchTerm);
        
        let matchesDate = true;
        if (dateFilter) {
            const filterDate = new Date(dateFilter);
            const itemDate = new Date(item.joinDate);
            matchesDate = itemDate.toDateString() === filterDate.toDateString();
        }
        
        return matchesRole && matchesStatus && matchesSearch && matchesDate;
    });
    
    updateTableDisplay();
    updateUserStats();
}

// Update table display based on filtered data
function updateTableDisplay() {
    // Hide all rows first
    allData.forEach(item => {
        item.element.style.display = 'none';
    });
    
    // Show filtered rows
    filteredData.forEach(item => {
        item.element.style.display = '';
    });
    
    // Show/hide empty state
    const tbody = document.querySelector('tbody');
    const existingEmptyRow = tbody.querySelector('.empty-state-row');
    
    if (filteredData.length === 0) {
        if (!existingEmptyRow) {
            const emptyRow = document.createElement('tr');
            emptyRow.className = 'empty-state-row';
            emptyRow.innerHTML = `
                <td colspan="8" class="text-center py-4">
                    <div class="text-muted">
                        <i class="fas fa-search fa-2x mb-2"></i>
                        <p>No results found matching your filters</p>
                        <button class="btn btn-outline-primary btn-sm" onclick="clearAllFilters()">
                            Clear Filters
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(emptyRow);
        }
    } else {
        if (existingEmptyRow) {
            existingEmptyRow.remove();
        }
    }
}

// Update filter statistics
function updateFilterStats() {
    const statsElement = document.querySelector('.filter-stats');
    if (!statsElement) {
        // Create stats element if it doesn't exist
        const filtersCard = document.querySelector('.admin-card');
        if (filtersCard) {
            const stats = document.createElement('div');
            stats.className = 'filter-stats mt-2';
            stats.innerHTML = `<small class="text-muted">Showing ${filteredData.length} of ${allData.length} items</small>`;
            filtersCard.appendChild(stats);
        }
    } else {
        statsElement.innerHTML = `<small class="text-muted">Showing ${filteredData.length} of ${allData.length} items</small>`;
    }
}

// Update user statistics
function updateUserStats() {
    updateFilterStats();
    
    // Update role distribution
    const roleStats = {};
    filteredData.forEach(user => {
        const role = user.role;
        roleStats[role] = (roleStats[role] || 0) + 1;
    });
    
    console.log('Role distribution:', roleStats);
}

// Toggle filters visibility
function toggleFiltersVisibility() {
    const filtersCard = document.querySelector('.admin-card');
    if (filtersCard) {
        const isHidden = filtersCard.style.display === 'none';
        filtersCard.style.display = isHidden ? 'block' : 'none';
        
        // Update button text
        const filterBtn = document.querySelector('.btn-outline-primary');
        if (filterBtn) {
            const icon = filterBtn.querySelector('i');
            const text = filterBtn.childNodes[filterBtn.childNodes.length - 1];
            if (isHidden) {
                icon.className = 'fas fa-filter me-2';
                text.textContent = 'Hide Filters';
            } else {
                icon.className = 'fas fa-filter me-2';
                text.textContent = 'Show Filters';
            }
        }
    }
}

// Clear all filters
function clearAllFilters() {
    // Clear all filter inputs
    const statusFilter = document.getElementById('statusFilter');
    const paymentFilter = document.getElementById('paymentFilter');
    const searchInput = document.getElementById('searchInput');
    const roleFilter = document.getElementById('roleFilter');
    const dateFilter = document.getElementById('dateFilter');
    const searchFilter = document.getElementById('searchFilter');
    
    if (statusFilter) statusFilter.value = '';
    if (paymentFilter) paymentFilter.value = '';
    if (searchInput) searchInput.value = '';
    if (roleFilter) roleFilter.value = '';
    if (dateFilter) dateFilter.value = '';
    if (searchFilter) searchFilter.value = '';
    
    // Reset filtered data
    filteredData = [...allData];
    updateTableDisplay();
    updateFilterStats();
}

// Add workshop-specific filters
function addWorkshopFilters() {
    // Add search functionality for workshop tables
    const tables = document.querySelectorAll('.admin-table table');
    tables.forEach((table, index) => {
        const tableContainer = table.closest('.admin-card');
        if (tableContainer) {
            // Add search input to each table
            const searchContainer = document.createElement('div');
            searchContainer.className = 'mb-3';
            searchContainer.innerHTML = `
                <div class="row g-2">
                    <div class="col-md-6">
                        <input type="text" class="form-control" placeholder="Search ${index === 0 ? 'bookings' : 'proposals'}..." 
                               onkeyup="filterWorkshopTable(this, ${index})">
                    </div>
                    <div class="col-md-3">
                        <select class="form-select" onchange="filterWorkshopTable(this, ${index})">
                            <option value="">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                    <div class="col-md-3">
                        <button class="btn btn-outline-primary w-100" onclick="clearWorkshopFilters(${index})">
                            <i class="fas fa-times me-1"></i>Clear
                        </button>
                    </div>
                </div>
            `;
            
            const tableElement = tableContainer.querySelector('.admin-table');
            tableElement.insertBefore(searchContainer, tableElement.querySelector('table'));
        }
    });
}

// Filter workshop tables
function filterWorkshopTable(input, tableIndex) {
    const table = document.querySelectorAll('.admin-table table')[tableIndex];
    if (!table) return;
    
    const searchTerm = input.type === 'text' ? input.value.toLowerCase() : '';
    const statusFilter = input.type === 'select-one' ? input.value.toLowerCase() : '';
    
    // Get the other filter value
    const container = input.closest('.row');
    const searchInput = container.querySelector('input[type="text"]');
    const statusSelect = container.querySelector('select');
    
    const finalSearchTerm = searchInput ? searchInput.value.toLowerCase() : searchTerm;
    const finalStatusFilter = statusSelect ? statusSelect.value.toLowerCase() : statusFilter;
    
    const rows = table.querySelectorAll('tbody tr');
    let visibleCount = 0;
    
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length < 3) return;
        
        const name = cells[0]?.textContent?.toLowerCase() || '';
        const workshop = cells[1]?.textContent?.toLowerCase() || '';
        const status = cells[cells.length - 2]?.querySelector('.badge')?.textContent?.toLowerCase() || '';
        
        const matchesSearch = !finalSearchTerm || name.includes(finalSearchTerm) || workshop.includes(finalSearchTerm);
        const matchesStatus = !finalStatusFilter || status.includes(finalStatusFilter);
        
        if (matchesSearch && matchesStatus) {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    });
    
    // Show empty state if no results
    showWorkshopEmptyState(table, visibleCount === 0);
}

// Clear workshop filters
function clearWorkshopFilters(tableIndex) {
    const container = document.querySelectorAll('.admin-table')[tableIndex];
    if (!container) return;
    
    const searchInput = container.querySelector('input[type="text"]');
    const statusSelect = container.querySelector('select');
    
    if (searchInput) searchInput.value = '';
    if (statusSelect) statusSelect.value = '';
    
    // Show all rows
    const table = container.querySelector('table');
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
        row.style.display = '';
    });
    
    showWorkshopEmptyState(table, false);
}

// Show/hide workshop empty state
function showWorkshopEmptyState(table, show) {
    const tbody = table.querySelector('tbody');
    let emptyRow = tbody.querySelector('.filter-empty-row');
    
    if (show && !emptyRow) {
        emptyRow = document.createElement('tr');
        emptyRow.className = 'filter-empty-row';
        emptyRow.innerHTML = `
            <td colspan="6" class="text-center py-4">
                <div class="text-muted">
                    <i class="fas fa-search fa-2x mb-2"></i>
                    <p>No results found</p>
                </div>
            </td>
        `;
        tbody.appendChild(emptyRow);
    } else if (!show && emptyRow) {
        emptyRow.remove();
    }
}

// Refresh current page data
function refreshCurrentPageData() {
    console.log('Refreshing data for:', currentPage);
    
    // Show loading indicator
    showLoadingIndicator(true);
    
    // Simulate API call delay
    setTimeout(() => {
        // Reload the page to get fresh data
        window.location.reload();
    }, 1000);
}

// Export current page data
function exportCurrentPageData() {
    console.log('Exporting data for:', currentPage);
    
    let dataToExport = [];
    let filename = '';
    
    switch(currentPage) {
        case 'cart-requests':
            dataToExport = extractCartRequestsData();
            filename = 'cart-requests.csv';
            break;
        case 'art-requests':
            dataToExport = extractArtRequestsData();
            filename = 'art-requests.csv';
            break;
        case 'users':
            dataToExport = extractUsersData();
            filename = 'users.csv';
            break;
        default:
            showNotification('Export not available for this page', 'warning');
            return;
    }
    
    if (dataToExport.length > 0) {
        downloadCSV(dataToExport, filename);
        showNotification('Data exported successfully!', 'success');
    } else {
        showNotification('No data to export', 'warning');
    }
}

// Extract cart requests data for export
function extractCartRequestsData() {
    const rows = document.querySelectorAll('tbody tr');
    const data = [];
    
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 7) {
            data.push({
                'Customer Name': cells[0]?.querySelector('strong')?.textContent || '',
                'Customer Email': cells[0]?.querySelector('small')?.textContent || '',
                'Items': cells[1]?.textContent?.trim() || '',
                'Payment Method': cells[3]?.querySelector('.badge')?.textContent || '',
                'Total Amount': cells[4]?.textContent || '',
                'Order Date': cells[5]?.textContent || '',
                'Status': cells[6]?.querySelector('.badge')?.textContent || ''
            });
        }
    });
    
    return data;
}

// Extract art requests data for export
function extractArtRequestsData() {
    return extractCartRequestsData(); // Same structure
}

// Extract users data for export
function extractUsersData() {
    const rows = document.querySelectorAll('tbody tr');
    const data = [];
    
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 6) {
            data.push({
                'User ID': cells[0]?.textContent || '',
                'Name': cells[1]?.querySelector('strong')?.textContent || '',
                'Email': cells[2]?.textContent || '',
                'Role': cells[3]?.querySelector('.badge')?.textContent || '',
                'Join Date': cells[4]?.textContent || '',
                'Status': cells[5]?.querySelector('.badge')?.textContent || ''
            });
        }
    });
    
    return data;
}

// Download data as CSV
function downloadCSV(data, filename) {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Show activity details modal
function showActivityDetails(row) {
    const cells = row.querySelectorAll('td');
    if (cells.length < 6) return;
    
    const details = {
        type: cells[0]?.querySelector('.badge')?.textContent || '',
        customer: cells[1]?.querySelector('strong')?.textContent || '',
        email: cells[1]?.querySelector('small')?.textContent || '',
        details: cells[2]?.textContent || '',
        date: cells[3]?.textContent || '',
        status: cells[4]?.querySelector('.badge')?.textContent || ''
    };
    
    showModal('Activity Details', `
        <div class="row">
            <div class="col-md-6">
                <h6 style="color: #d6a45a;">Customer Information</h6>
                <p><strong>Name:</strong> ${details.customer}</p>
                <p><strong>Email:</strong> ${details.email}</p>
                <p><strong>Type:</strong> <span class="badge bg-info">${details.type}</span></p>
            </div>
            <div class="col-md-6">
                <h6 style="color: #d6a45a;">Order Details</h6>
                <p><strong>Details:</strong> ${details.details}</p>
                <p><strong>Date:</strong> ${details.date}</p>
                <p><strong>Status:</strong> <span class="badge bg-warning">${details.status}</span></p>
            </div>
        </div>
    `);
}

// Show workshop proposal details
function showWorkshopProposalDetails(row) {
    const cells = row.querySelectorAll('td');
    if (cells.length < 6) return;
    
    const details = {
        organizer: cells[0]?.querySelector('strong')?.textContent || '',
        email: cells[0]?.querySelector('small')?.textContent || '',
        title: cells[1]?.textContent || '',
        category: cells[2]?.textContent || '',
        duration: cells[3]?.textContent || '',
        capacity: cells[4]?.textContent || '',
        status: cells[5]?.querySelector('.badge')?.textContent || ''
    };
    
    showModal('Workshop Proposal Details', `
        <div class="row">
            <div class="col-md-6">
                <h6 style="color: #d6a45a;">Organizer Information</h6>
                <p><strong>Name:</strong> ${details.organizer}</p>
                <p><strong>Email:</strong> ${details.email}</p>
                <p><strong>Status:</strong> <span class="badge bg-warning">${details.status}</span></p>
            </div>
            <div class="col-md-6">
                <h6 style="color: #d6a45a;">Workshop Details</h6>
                <p><strong>Title:</strong> ${details.title}</p>
                <p><strong>Category:</strong> ${details.category}</p>
                <p><strong>Duration:</strong> ${details.duration}</p>
                <p><strong>Capacity:</strong> ${details.capacity}</p>
            </div>
        </div>
        <div class="mt-3">
            <h6 style="color: #d6a45a;">Actions</h6>
            <div class="btn-group">
                <button class="btn btn-success btn-sm" onclick="updateWorkshopStatus('approved')">Approve</button>
                <button class="btn btn-danger btn-sm" onclick="updateWorkshopStatus('rejected')">Reject</button>
                <button class="btn btn-info btn-sm" onclick="updateWorkshopStatus('under-review')">Under Review</button>
            </div>
        </div>
    `);
}

// Show generic modal
function showModal(title, content) {
    // Create modal if it doesn't exist
    let modal = document.getElementById('genericModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'genericModal';
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content" style="background: #1a1a1a; border: 1px solid #d6a45a;">
                    <div class="modal-header" style="border-bottom: 1px solid #333;">
                        <h5 class="modal-title" style="color: #d6a45a;"></h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body"></div>
                    <div class="modal-footer" style="border-top: 1px solid #333;">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    modal.querySelector('.modal-title').textContent = title;
    modal.querySelector('.modal-body').innerHTML = content;
    
    new bootstrap.Modal(modal).show();
}

// Show loading indicator
function showLoadingIndicator(show) {
    let indicator = document.getElementById('loadingIndicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'loadingIndicator';
        indicator.className = 'position-fixed top-50 start-50 translate-middle';
        indicator.style.zIndex = '9999';
        indicator.innerHTML = `
            <div class="text-center p-4" style="background: rgba(26, 26, 26, 0.9); border-radius: 10px; border: 1px solid #d6a45a;">
                <div class="spinner-border text-warning mb-2" role="status"></div>
                <div style="color: #d6a45a;">Loading...</div>
            </div>
        `;
        document.body.appendChild(indicator);
    }
    
    indicator.style.display = show ? 'block' : 'none';
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'success' ? 'success' : type === 'error' ? 'danger' : type === 'warning' ? 'warning' : 'info'} position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; max-width: 300px; padding: 1rem; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);';
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
        ${message}
        <button type="button" class="btn-close btn-close-white ms-2" onclick="this.parentElement.remove()"></button>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Debounce function for search inputs
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Refresh dashboard data
function refreshDashboardData() {
    showLoadingIndicator(true);
    
    // Simulate API call
    setTimeout(() => {
        showLoadingIndicator(false);
        showNotification('Dashboard data refreshed!', 'success');
        
        // Update stat cards with animation
        const statNumbers = document.querySelectorAll('.stat-number');
        statNumbers.forEach(stat => {
            stat.style.transform = 'scale(1.1)';
            setTimeout(() => {
                stat.style.transform = 'scale(1)';
            }, 200);
        });
    }, 1500);
}

// Initialize specific page functionalities
function initializeManageArtworks() {
    console.log('Initializing manage artworks functionality...');
    // Artwork management is already handled in the existing script
}

function initializeMenuManagement() {
    console.log('Initializing menu management functionality...');
    // Menu management is already handled in the existing script
}

function initializeFranchise() {
    console.log('Initializing franchise functionality...');
    // Franchise management is already handled in the existing script
}

function initializeAnalytics() {
    console.log('Initializing analytics functionality...');
    // Analytics functionality is already handled in the existing script
}

// Make functions globally available
window.clearAllFilters = clearAllFilters;
window.filterWorkshopTable = filterWorkshopTable;
window.clearWorkshopFilters = clearWorkshopFilters;
window.showNotification = showNotification;