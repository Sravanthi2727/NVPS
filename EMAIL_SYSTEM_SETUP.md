# Email Notification System - Rabuste Coffee

## Overview
Complete email notification system implemented for all user interactions. Emails are sent automatically when admin takes actions or users register.

## Email Service Features

### 📧 **Email Types Implemented**

#### **User Notifications:**
1. **Welcome Email** - New user registration
2. **Order Status Updates** - Order approved/rejected/completed
3. **Workshop Status Updates** - Workshop confirmed/cancelled/completed
4. **Franchise Application Updates** - Application approved/rejected/under review

#### **Admin Notifications:**
1. **New Order Alerts** - When customer places order
2. **New Workshop Registration** - When user registers for workshop
3. **New Franchise Application** - When user submits franchise application
4. **New User Request** - When user submits sell-art/conduct-workshop request
5. **New User Registration** - When new user joins platform

### 🎨 **Email Template Features**

- **Responsive Design** - Works on all devices
- **Rabuste Coffee Branding** - Black & gold theme
- **Status Badges** - Color-coded status indicators
- **Professional Layout** - Clean, modern design
- **Call-to-Action Buttons** - Links to dashboard/calendar

## Configuration Required

### 1. **Email Service Setup (.env)**
```env
# Email Service Configuration (Gmail SMTP)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM_NAME=Rabuste Coffee
EMAIL_FROM_ADDRESS=your-email@gmail.com
```

### 2. **Gmail App Password Setup**
1. Go to Google Account settings
2. Enable 2-Factor Authentication
3. Generate App Password for "Mail"
4. Use this password in EMAIL_PASSWORD

### 3. **Admin Email Configuration**
```env
# Admin Notification Configuration
ADMIN_EMAIL=coffeerabuste@gmail.com
ADMIN_NAME=Rabuste Coffee Admin
```

## Admin Email Notifications

### 🔔 **When Admin Gets Notified**

1. **New Order Placed** - Customer places any order (menu/art)
2. **New Workshop Registration** - User registers for workshop
3. **New Franchise Application** - User submits franchise application
4. **New User Request** - User submits sell-art/conduct-workshop request
5. **New User Registration** - New user joins the platform

### 📧 **Admin Email Content**

**New Order Email:**
- Order details (ID, customer info, items, total)
- Order type (menu/art/mixed)
- Delivery address (for art orders)
- Direct link to admin order management

**New Workshop Registration Email:**
- Workshop details (name, date, participant info)
- Registration ID and date
- Calendar integration status
- Direct link to workshop management

**New Franchise Application Email:**
- Applicant information (name, email, phone, location)
- Business details (investment range, timeline, experience)
- Application ID and submission date
- Direct link to franchise management

**New User Request Email:**
- Request details (type, title, description)
- User information (name, email, account type)
- Additional details (price for art, date for workshop)
- Direct link to request management

**New User Registration Email:**
- User details (name, email, registration method)
- Registration date and time
- Direct link to user management

## Email Triggers

### 🛒 **Order Status Changes**
**Endpoint:** `POST /api/admin/orders/:id/status`
**Triggers:** When admin changes order status
**Statuses:** pending → confirmed → completed → cancelled
**Email Content:**
- Order details (ID, items, total)
- New status with color coding
- Admin notes (if provided)
- Link to dashboard

### 🎓 **Workshop Status Changes**
**Endpoint:** `POST /api/workshops/:id/status`
**Triggers:** When admin changes workshop registration status
**Statuses:** registered → confirmed → completed → cancelled
**Email Content:**
- Workshop details (name, date, participant)
- Status update with color coding
- Google Calendar link (if available)
- Admin notes (if provided)

### 🏪 **Franchise Application Updates**
**Endpoint:** `POST /api/admin/franchise/:id/status`
**Triggers:** When admin reviews franchise application
**Statuses:** pending → under-review → approved → rejected
**Email Content:**
- Application details (ID, location, investment)
- Status update with appropriate messaging
- Next steps information
- Admin notes (if provided)

### 👋 **Welcome Emails**
**Triggers:**
- New user signup (manual registration)
- New Google OAuth user (first login)
**Email Content:**
- Welcome message
- Platform features overview
- Dashboard link
- Community introduction

## Testing the Email System

### 1. **Test Email Endpoint**
```bash
POST /api/admin/debug/test-email
Content-Type: application/json

{
  "type": "welcome|order|workshop|franchise",
  "email": "test@example.com"
}
```

### 2. **Test Different Email Types**

**User Notification Emails:**

**Welcome Email:**
```json
{
  "type": "welcome",
  "email": "user@example.com"
}
```

**Order Status Email:**
```json
{
  "type": "order",
  "email": "customer@example.com"
}
```

**Workshop Status Email:**
```json
{
  "type": "workshop",
  "email": "participant@example.com"
}
```

**Franchise Status Email:**
```json
{
  "type": "franchise",
  "email": "applicant@example.com"
}
```

**Admin Notification Emails:**

**Admin New Order Alert:**
```json
{
  "type": "admin-order"
}
```

**Admin Workshop Registration Alert:**
```json
{
  "type": "admin-workshop"
}
```

**Admin Franchise Application Alert:**
```json
{
  "type": "admin-franchise"
}
```

**Admin User Request Alert:**
```json
{
  "type": "admin-request"
}
```

**Admin New User Registration Alert:**
```json
{
  "type": "admin-user"
}
```

## Email Templates

### 🎨 **Design Features**
- **Header:** Rabuste Coffee logo with tagline
- **Content:** Clean, structured information
- **Status Badges:** Color-coded status indicators
- **Buttons:** Call-to-action with hover effects
- **Footer:** Contact information and social links

### 📱 **Responsive Design**
- Mobile-friendly layout
- Proper font sizing
- Touch-friendly buttons
- Optimized for all email clients

## Status Color Coding

### Order Status Colors
- **Pending:** Yellow/Orange
- **Confirmed:** Green
- **Completed:** Blue
- **Cancelled:** Red

### Workshop Status Colors
- **Registered:** Gold
- **Confirmed:** Green
- **Completed:** Blue
- **Cancelled:** Red

### Franchise Status Colors
- **Pending:** Yellow
- **Under Review:** Blue
- **Approved:** Green
- **Rejected:** Red

## Error Handling

- **Email failures don't block operations** - Status updates proceed even if email fails
- **Comprehensive logging** - All email attempts are logged
- **Graceful degradation** - System continues working without email service
- **Retry mechanism** - Can be extended for failed email retries

## Admin Integration

### Order Management
- Admin can update order status with optional notes
- Customer receives immediate email notification
- Email includes order details and next steps

### Workshop Management
- Admin can confirm/cancel workshop registrations
- Participants receive status updates
- Integration with Google Calendar events

### Franchise Management
- Admin can review and update application status
- Applicants receive professional status updates
- Includes next steps and contact information

## Usage Examples

### 1. **Update Order Status**
```javascript
// Admin updates order to "completed"
// Email automatically sent to customer
POST /api/admin/orders/ORDER_ID/status
{
  "status": "completed",
  "adminNotes": "Your order is ready for pickup!"
}
```

### 2. **Confirm Workshop Registration**
```javascript
// Admin confirms workshop registration
// Email sent to participant with calendar link
POST /api/workshops/REGISTRATION_ID/status
{
  "status": "confirmed",
  "adminNotes": "Looking forward to seeing you!"
}
```

### 3. **Approve Franchise Application**
```javascript
// Admin approves franchise application
// Congratulatory email sent to applicant
POST /api/admin/franchise/APPLICATION_ID/status
{
  "status": "approved",
  "adminNotes": "Welcome to the Rabuste Coffee family!",
  "reviewedBy": "Admin Name"
}
```

## Next Steps

1. **Configure Gmail credentials** in .env file
2. **Test email service** using debug endpoint
3. **Verify email delivery** in spam/inbox
4. **Customize email templates** if needed
5. **Monitor email logs** for any issues

The email system is now fully integrated and ready to enhance user communication! 📧✨