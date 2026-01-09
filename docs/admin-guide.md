# Admin Dashboard Guide

## Overview
The Rabuste Coffee Admin Dashboard provides a comprehensive interface for managing your coffee shop operations, including cart requests, workshop bookings, and user management.

## Features

### 🛒 Cart Requests Management
- View all customer orders and cart requests
- Update order status (Pending → Processing → Completed)
- Filter orders by status, date, or customer
- View detailed order information
- Cancel orders when necessary

### 📅 Workshop Requests Management
- Manage workshop booking requests
- Approve or reject workshop registrations
- View workshop schedules and availability
- Track participant numbers
- Filter by workshop type, date, or status

### 👥 User Management
- View all registered users
- Manage user roles (Customer, Staff, Admin)
- Update user status (Active, Inactive, Suspended)
- Add new users manually
- View user activity and statistics

### 📊 Dashboard Analytics
- Real-time overview of key metrics
- Recent activity feed
- Quick access to all management sections
- Visual statistics and charts

## Access

### URL Structure
- Main Dashboard: `/admin`
- Cart Requests: `/admin/cart-requests`
- Workshop Requests: `/admin/workshop-requests`
- User Management: `/admin/users`

### Navigation
- Access admin panel via the "Admin" link in the main navigation
- Use the dashboard cards for quick navigation
- "Back to Dashboard" buttons on all sub-pages

## Key Functions

### Filtering and Search
All management pages include:
- **Status filters**: Filter by request/user status
- **Date filters**: Filter by specific dates
- **Search functionality**: Search by name, email, or other criteria
- **Type filters**: Filter by workshop type, role, etc.

### Actions Available

#### Cart Requests
- **View**: See detailed order information
- **Update Status**: Change order status
- **Process**: Mark orders as processing or completed
- **Cancel**: Cancel orders when needed

#### Workshop Requests
- **View**: See detailed booking information
- **Approve**: Approve workshop registrations
- **Reject**: Reject workshop requests
- **Complete**: Mark workshops as completed

#### User Management
- **View Profile**: See detailed user information
- **Change Role**: Update user permissions
- **Update Status**: Activate, deactivate, or suspend users
- **Add Users**: Create new user accounts

## Technical Details

### Mock Data
Currently using mock data for demonstration. In production, replace with:
- Database queries for real data
- API endpoints for CRUD operations
- Authentication middleware for security

### Security Considerations
- Add proper authentication before deployment
- Implement role-based access control
- Add CSRF protection for forms
- Validate all user inputs

### Responsive Design
- Fully responsive layout
- Mobile-friendly interface
- Touch-optimized controls
- Accessible design patterns

## Customization

### Styling
- Main styles in `/public/css/admin.css`
- Uses Bootstrap 5 for base components
- Custom color scheme matching brand
- Font Awesome icons throughout

### JavaScript
- Enhanced functionality in `/public/js/admin.js`
- Real-time filtering and search
- Form validation
- Modal interactions
- Keyboard shortcuts

### Templates
- EJS templates in `/views/admin/`
- Consistent layout and styling
- Reusable components
- SEO-friendly structure

## Future Enhancements

### Planned Features
- Real-time notifications
- Export functionality (CSV, PDF)
- Advanced analytics and reporting
- Bulk operations
- Email integration
- Calendar integration for workshops

### Database Integration
- Replace mock data with MongoDB/PostgreSQL
- Add proper data models
- Implement caching for performance
- Add data validation

### Authentication
- Implement proper admin authentication
- Add role-based permissions
- Session management
- Password reset functionality

## Support
For technical support or feature requests, contact the development team or refer to the main project documentation.