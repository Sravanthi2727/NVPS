/**
 * Email Service
 * Handles all email notifications for Rabuste Coffee
 */

const nodemailer = require('nodemailer');
require('dotenv').config();

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  // Initialize email transporter
  initializeTransporter() {
    try {
      console.log('🔧 Initializing email service...');
      
      this.transporter = nodemailer.createTransporter({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });

      // Verify connection
      this.transporter.verify((error, success) => {
        if (error) {
          console.error('❌ Email service initialization failed:', error);
        } else {
          console.log('✅ Email service initialized successfully');
        }
      });

    } catch (error) {
      console.error('❌ Error initializing email service:', error);
    }
  }

  // Send email with template
  async sendEmail(to, subject, htmlContent, textContent = null) {
    try {
      if (!this.transporter) {
        throw new Error('Email service not initialized');
      }

      const mailOptions = {
        from: `${process.env.EMAIL_FROM_NAME || 'Rabuste Coffee'} <${process.env.EMAIL_FROM_ADDRESS}>`,
        to: to,
        subject: subject,
        html: htmlContent,
        text: textContent || this.stripHtml(htmlContent)
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully to:', to);
      return { success: true, messageId: result.messageId };

    } catch (error) {
      console.error('❌ Error sending email:', error);
      return { success: false, error: error.message };
    }
  }

  // Strip HTML tags for text version
  stripHtml(html) {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  // Get email template wrapper
  getEmailTemplate(title, content, footerText = null) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .email-container {
            background: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
            color: #d6a45a;
            padding: 30px 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: bold;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
          }
          .header .tagline {
            color: #f5f2ee;
            font-size: 14px;
            margin-top: 5px;
          }
          .content {
            padding: 30px 20px;
            background: #ffffff;
          }
          .content h2 {
            color: #d6a45a;
            margin-top: 0;
            font-size: 24px;
          }
          .content h3 {
            color: #333;
            font-size: 18px;
            margin-top: 25px;
          }
          .status-badge {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .status-approved {
            background: #e8f5e8;
            color: #27ae60;
            border: 2px solid #27ae60;
          }
          .status-rejected {
            background: #fdeaea;
            color: #e74c3c;
            border: 2px solid #e74c3c;
          }
          .status-confirmed {
            background: #e8f5e8;
            color: #27ae60;
            border: 2px solid #27ae60;
          }
          .status-cancelled {
            background: #fdeaea;
            color: #e74c3c;
            border: 2px solid #e74c3c;
          }
          .status-completed {
            background: #e8f4f8;
            color: #3498db;
            border: 2px solid #3498db;
          }
          .info-box {
            background: #f8f9fa;
            border-left: 4px solid #d6a45a;
            padding: 15px;
            margin: 20px 0;
            border-radius: 0 5px 5px 0;
          }
          .button {
            display: inline-block;
            background: #d6a45a;
            color: #000;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 15px 0;
            transition: background 0.3s ease;
          }
          .button:hover {
            background: #c19441;
          }
          .footer {
            background: #1a1a1a;
            color: #f5f2ee;
            padding: 20px;
            text-align: center;
            font-size: 14px;
          }
          .footer a {
            color: #d6a45a;
            text-decoration: none;
          }
          .social-links {
            margin: 15px 0;
          }
          .social-links a {
            display: inline-block;
            margin: 0 10px;
            color: #d6a45a;
            font-size: 18px;
          }
          @media (max-width: 600px) {
            body {
              padding: 10px;
            }
            .header h1 {
              font-size: 24px;
            }
            .content {
              padding: 20px 15px;
            }
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <h1>☕ RABUSTE COFFEE</h1>
            <div class="tagline">Where Creativity Meets Caffeine</div>
          </div>
          <div class="content">
            ${content}
          </div>
          <div class="footer">
            <div class="social-links">
              <a href="#">📧</a>
              <a href="#">📱</a>
              <a href="#">🌐</a>
            </div>
            <p>
              ${footerText || 'Thank you for being part of the Rabuste Coffee community!'}
            </p>
            <p>
              <small>
                This email was sent from Rabuste Coffee. If you have any questions, please contact us.
              </small>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Order Status Update Email
  async sendOrderStatusEmail(userEmail, orderData, newStatus, adminNotes = null) {
    try {
      const statusMessages = {
        'pending': {
          title: 'Order Received',
          message: 'Your order has been received and is being processed.',
          color: 'status-pending'
        },
        'confirmed': {
          title: 'Order Confirmed',
          message: 'Great news! Your order has been confirmed and is being prepared.',
          color: 'status-approved'
        },
        'completed': {
          title: 'Order Completed',
          message: 'Your order is ready! You can now pick it up from our café.',
          color: 'status-completed'
        },
        'cancelled': {
          title: 'Order Cancelled',
          message: 'Your order has been cancelled. If you have any questions, please contact us.',
          color: 'status-rejected'
        }
      };

      const statusInfo = statusMessages[newStatus] || statusMessages['pending'];
      
      const content = `
        <h2>Order Status Update</h2>
        <p>Hello! We have an update regarding your order.</p>
        
        <div class="info-box">
          <h3>Order Details</h3>
          <p><strong>Order ID:</strong> #${orderData._id.toString().slice(-6).toUpperCase()}</p>
          <p><strong>Order Date:</strong> ${new Date(orderData.orderDate).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</p>
          <p><strong>Total Amount:</strong> ₹${orderData.totalAmount}</p>
          <p><strong>Status:</strong> <span class="status-badge ${statusInfo.color}">${newStatus.toUpperCase()}</span></p>
        </div>

        <h3>${statusInfo.title}</h3>
        <p>${statusInfo.message}</p>

        ${adminNotes ? `
          <div class="info-box">
            <h3>Additional Notes</h3>
            <p>${adminNotes}</p>
          </div>
        ` : ''}

        <h3>Order Items</h3>
        <ul>
          ${orderData.items.map(item => `
            <li>${item.name} ${item.quantity > 1 ? `(Qty: ${item.quantity})` : ''} - ₹${item.price * item.quantity}</li>
          `).join('')}
        </ul>

        ${newStatus === 'completed' ? `
          <p>
            <a href="http://localhost:3000/dashboard" class="button">View in Dashboard</a>
          </p>
        ` : ''}

        <p>Thank you for choosing Rabuste Coffee!</p>
      `;

      const subject = `Order Update: ${statusInfo.title} - Rabuste Coffee`;
      const htmlContent = this.getEmailTemplate(subject, content);

      return await this.sendEmail(userEmail, subject, htmlContent);

    } catch (error) {
      console.error('❌ Error sending order status email:', error);
      return { success: false, error: error.message };
    }
  }

  // Workshop Status Update Email
  async sendWorkshopStatusEmail(userEmail, workshopData, newStatus, adminNotes = null) {
    try {
      const statusMessages = {
        'registered': {
          title: 'Workshop Registration Confirmed',
          message: 'Thank you for registering! We\'re excited to have you join us.',
          color: 'status-approved'
        },
        'confirmed': {
          title: 'Workshop Confirmed',
          message: 'Your workshop registration has been confirmed by our team.',
          color: 'status-confirmed'
        },
        'completed': {
          title: 'Workshop Completed',
          message: 'Thank you for attending the workshop! We hope you enjoyed the experience.',
          color: 'status-completed'
        },
        'cancelled': {
          title: 'Workshop Cancelled',
          message: 'Unfortunately, this workshop has been cancelled. We apologize for any inconvenience.',
          color: 'status-cancelled'
        }
      };

      const statusInfo = statusMessages[newStatus] || statusMessages['registered'];
      
      const content = `
        <h2>Workshop Update</h2>
        <p>Hello ${workshopData.participantName}! We have an update regarding your workshop registration.</p>
        
        <div class="info-box">
          <h3>Workshop Details</h3>
          <p><strong>Workshop:</strong> ${workshopData.workshopName}</p>
          <p><strong>Date & Time:</strong> ${new Date(workshopData.workshopDate).toLocaleDateString('en-US', { 
            weekday: 'long',
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
          <p><strong>Participant:</strong> ${workshopData.participantName}</p>
          <p><strong>Status:</strong> <span class="status-badge ${statusInfo.color}">${newStatus.toUpperCase()}</span></p>
        </div>

        <h3>${statusInfo.title}</h3>
        <p>${statusInfo.message}</p>

        ${adminNotes ? `
          <div class="info-box">
            <h3>Additional Information</h3>
            <p>${adminNotes}</p>
          </div>
        ` : ''}

        ${workshopData.calendarEventLink ? `
          <p>
            <a href="${workshopData.calendarEventLink}" class="button">📅 View in Google Calendar</a>
          </p>
        ` : ''}

        ${newStatus === 'confirmed' ? `
          <div class="info-box">
            <h3>What to Bring</h3>
            <p>Please bring your enthusiasm and creativity! All materials will be provided.</p>
            <p><strong>Location:</strong> Rabuste Coffee, Main Branch</p>
            <p><strong>Contact:</strong> ${workshopData.participantPhone}</p>
          </div>
        ` : ''}

        <p>
          <a href="http://localhost:3000/dashboard" class="button">View in Dashboard</a>
        </p>

        <p>Thank you for being part of our creative community!</p>
      `;

      const subject = `Workshop Update: ${statusInfo.title} - Rabuste Coffee`;
      const htmlContent = this.getEmailTemplate(subject, content);

      return await this.sendEmail(userEmail, subject, htmlContent);

    } catch (error) {
      console.error('❌ Error sending workshop status email:', error);
      return { success: false, error: error.message };
    }
  }

  // Franchise Application Status Email
  async sendFranchiseStatusEmail(userEmail, franchiseData, newStatus, adminNotes = null) {
    try {
      const statusMessages = {
        'pending': {
          title: 'Application Received',
          message: 'Thank you for your interest in Rabuste Coffee franchise. We are reviewing your application.',
          color: 'status-pending'
        },
        'under-review': {
          title: 'Application Under Review',
          message: 'Your franchise application is currently under detailed review by our team.',
          color: 'status-pending'
        },
        'approved': {
          title: 'Application Approved',
          message: 'Congratulations! Your franchise application has been approved. Welcome to the Rabuste Coffee family!',
          color: 'status-approved'
        },
        'rejected': {
          title: 'Application Status Update',
          message: 'After careful consideration, we are unable to approve your franchise application at this time.',
          color: 'status-rejected'
        }
      };

      const statusInfo = statusMessages[newStatus] || statusMessages['pending'];
      
      const content = `
        <h2>Franchise Application Update</h2>
        <p>Dear ${franchiseData.fullName || 'Applicant'},</p>
        <p>We have an update regarding your franchise application.</p>
        
        <div class="info-box">
          <h3>Application Details</h3>
          <p><strong>Application ID:</strong> #${franchiseData._id.toString().slice(-6).toUpperCase()}</p>
          <p><strong>Submitted:</strong> ${new Date(franchiseData.submittedAt).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</p>
          <p><strong>Location:</strong> ${franchiseData.city}</p>
          <p><strong>Investment Range:</strong> ${franchiseData.investmentRange}</p>
          <p><strong>Status:</strong> <span class="status-badge ${statusInfo.color}">${newStatus.toUpperCase().replace('-', ' ')}</span></p>
        </div>

        <h3>${statusInfo.title}</h3>
        <p>${statusInfo.message}</p>

        ${adminNotes ? `
          <div class="info-box">
            <h3>Additional Information</h3>
            <p>${adminNotes}</p>
          </div>
        ` : ''}

        ${newStatus === 'approved' ? `
          <div class="info-box">
            <h3>Next Steps</h3>
            <p>Our franchise team will contact you within 2-3 business days to discuss the next steps in the process.</p>
            <p>Please keep this email for your records.</p>
          </div>
        ` : ''}

        ${newStatus === 'rejected' ? `
          <div class="info-box">
            <h3>Future Opportunities</h3>
            <p>While we cannot approve your application at this time, we encourage you to reapply in the future as circumstances change.</p>
            <p>Thank you for your interest in Rabuste Coffee.</p>
          </div>
        ` : ''}

        <p>
          <a href="http://localhost:3000/dashboard" class="button">View Application Status</a>
        </p>

        <p>Thank you for your interest in Rabuste Coffee!</p>
      `;

      const subject = `Franchise Application: ${statusInfo.title} - Rabuste Coffee`;
      const htmlContent = this.getEmailTemplate(subject, content);

      return await this.sendEmail(userEmail, subject, htmlContent);

    } catch (error) {
      console.error('❌ Error sending franchise status email:', error);
      return { success: false, error: error.message };
    }
  }

  // Welcome Email for New Users
  async sendWelcomeEmail(userEmail, userName) {
    try {
      const content = `
        <h2>Welcome to Rabuste Coffee! ☕</h2>
        <p>Hello ${userName}!</p>
        <p>Welcome to the Rabuste Coffee community - where creativity meets caffeine!</p>
        
        <div class="info-box">
          <h3>What You Can Do</h3>
          <ul>
            <li>🎨 Browse our art gallery and purchase unique pieces</li>
            <li>☕ Order delicious coffee and snacks</li>
            <li>🎓 Register for creative workshops</li>
            <li>🏪 Explore franchise opportunities</li>
            <li>📊 Track your orders and registrations in your dashboard</li>
          </ul>
        </div>

        <p>
          <a href="http://localhost:3000/dashboard" class="button">Visit Your Dashboard</a>
        </p>

        <p>We're excited to have you as part of our creative community!</p>
      `;

      const subject = 'Welcome to Rabuste Coffee! ☕';
      const htmlContent = this.getEmailTemplate(subject, content);

      return await this.sendEmail(userEmail, subject, htmlContent);

    } catch (error) {
      console.error('❌ Error sending welcome email:', error);
      return { success: false, error: error.message };
    }
  }

  // ========== ADMIN NOTIFICATION EMAILS ==========

  // Notify admin of new order
  async notifyAdminNewOrder(orderData) {
    try {
      const adminEmail = process.env.ADMIN_EMAIL;
      if (!adminEmail) {
        console.log('⚠️ No admin email configured for order notifications');
        return { success: false, error: 'Admin email not configured' };
      }

      const content = `
        <h2>🛒 New Order Received</h2>
        <p>A new order has been placed on Rabuste Coffee website.</p>
        
        <div class="info-box">
          <h3>Order Details</h3>
          <p><strong>Order ID:</strong> #${orderData._id.toString().slice(-6).toUpperCase()}</p>
          <p><strong>Customer:</strong> ${orderData.customerName}</p>
          <p><strong>Email:</strong> ${orderData.customerEmail}</p>
          <p><strong>Phone:</strong> ${orderData.customerPhone || 'Not provided'}</p>
          <p><strong>Order Date:</strong> ${new Date(orderData.orderDate).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
          <p><strong>Total Amount:</strong> ₹${orderData.totalAmount}</p>
          <p><strong>Order Type:</strong> ${orderData.orderType || 'Mixed'}</p>
        </div>

        <h3>Order Items</h3>
        <ul>
          ${orderData.items.map(item => `
            <li>
              <strong>${item.name}</strong> 
              ${item.quantity > 1 ? `(Qty: ${item.quantity})` : ''} 
              - ₹${item.price * item.quantity}
              ${item.type === 'art' ? ' <span style="color: #d6a45a;">[Art Piece]</span>' : ''}
            </li>
          `).join('')}
        </ul>

        ${orderData.deliveryAddress ? `
          <div class="info-box">
            <h3>Delivery Address</h3>
            <p>${orderData.deliveryAddress}</p>
          </div>
        ` : ''}

        <p>
          <a href="http://localhost:3000/admin/orders" class="button">Manage Orders</a>
        </p>

        <p>Please review and update the order status as needed.</p>
      `;

      const subject = `New Order #${orderData._id.toString().slice(-6).toUpperCase()} - ₹${orderData.totalAmount}`;
      const htmlContent = this.getEmailTemplate(subject, content);

      return await this.sendEmail(adminEmail, subject, htmlContent);

    } catch (error) {
      console.error('❌ Error sending admin order notification:', error);
      return { success: false, error: error.message };
    }
  }

  // Notify admin of new workshop registration
  async notifyAdminNewWorkshopRegistration(workshopData) {
    try {
      const adminEmail = process.env.ADMIN_EMAIL;
      if (!adminEmail) {
        console.log('⚠️ No admin email configured for workshop notifications');
        return { success: false, error: 'Admin email not configured' };
      }

      const content = `
        <h2>🎓 New Workshop Registration</h2>
        <p>A new participant has registered for a workshop.</p>
        
        <div class="info-box">
          <h3>Workshop Details</h3>
          <p><strong>Workshop:</strong> ${workshopData.workshopName}</p>
          <p><strong>Date & Time:</strong> ${new Date(workshopData.workshopDate).toLocaleDateString('en-US', { 
            weekday: 'long',
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
          <p><strong>Registration ID:</strong> #${workshopData._id.toString().slice(-6).toUpperCase()}</p>
        </div>

        <div class="info-box">
          <h3>Participant Information</h3>
          <p><strong>Name:</strong> ${workshopData.participantName}</p>
          <p><strong>Email:</strong> ${workshopData.participantEmail}</p>
          <p><strong>Phone:</strong> ${workshopData.participantPhone}</p>
          <p><strong>Registration Date:</strong> ${new Date(workshopData.registrationDate).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
        </div>

        ${workshopData.calendarEventCreated ? `
          <div class="info-box">
            <h3>Calendar Integration</h3>
            <p>✅ Google Calendar event has been created automatically</p>
            ${workshopData.googleCalendarEventLink ? `
              <p><a href="${workshopData.googleCalendarEventLink}" class="button">View Calendar Event</a></p>
            ` : ''}
          </div>
        ` : ''}

        <p>
          <a href="http://localhost:3000/admin/workshops" class="button">Manage Workshop Registrations</a>
        </p>

        <p>Please confirm the registration and contact the participant if needed.</p>
      `;

      const subject = `New Workshop Registration: ${workshopData.workshopName} - ${workshopData.participantName}`;
      const htmlContent = this.getEmailTemplate(subject, content);

      return await this.sendEmail(adminEmail, subject, htmlContent);

    } catch (error) {
      console.error('❌ Error sending admin workshop notification:', error);
      return { success: false, error: error.message };
    }
  }

  // Notify admin of new franchise application
  async notifyAdminNewFranchiseApplication(franchiseData) {
    try {
      const adminEmail = process.env.ADMIN_EMAIL;
      if (!adminEmail) {
        console.log('⚠️ No admin email configured for franchise notifications');
        return { success: false, error: 'Admin email not configured' };
      }

      const content = `
        <h2>🏪 New Franchise Application</h2>
        <p>A new franchise application has been submitted.</p>
        
        <div class="info-box">
          <h3>Application Details</h3>
          <p><strong>Application ID:</strong> #${franchiseData._id.toString().slice(-6).toUpperCase()}</p>
          <p><strong>Submitted:</strong> ${new Date(franchiseData.submittedAt).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
        </div>

        <div class="info-box">
          <h3>Applicant Information</h3>
          <p><strong>Name:</strong> ${franchiseData.fullName}</p>
          <p><strong>Email:</strong> ${franchiseData.email}</p>
          <p><strong>Phone:</strong> ${franchiseData.phoneNumber}</p>
          <p><strong>Location:</strong> ${franchiseData.city}</p>
        </div>

        <div class="info-box">
          <h3>Business Details</h3>
          <p><strong>Investment Range:</strong> ${franchiseData.investmentRange}</p>
          <p><strong>Expected Timeline:</strong> ${franchiseData.expectedTimeline}</p>
          ${franchiseData.businessExperience ? `
            <p><strong>Business Experience:</strong></p>
            <p>${franchiseData.businessExperience}</p>
          ` : ''}
        </div>

        <p>
          <a href="http://localhost:3000/admin/franchise" class="button">Review Application</a>
        </p>

        <p>Please review the application and update the status accordingly.</p>
      `;

      const subject = `New Franchise Application: ${franchiseData.fullName} - ${franchiseData.city}`;
      const htmlContent = this.getEmailTemplate(subject, content);

      return await this.sendEmail(adminEmail, subject, htmlContent);

    } catch (error) {
      console.error('❌ Error sending admin franchise notification:', error);
      return { success: false, error: error.message };
    }
  }

  // Notify admin of new user request (sell art, conduct workshop, etc.)
  async notifyAdminNewUserRequest(requestData, userData) {
    try {
      const adminEmail = process.env.ADMIN_EMAIL;
      if (!adminEmail) {
        console.log('⚠️ No admin email configured for request notifications');
        return { success: false, error: 'Admin email not configured' };
      }

      const requestTypeNames = {
        'sell-art': 'Sell Art Request',
        'conduct-workshop': 'Conduct Workshop Request',
        'general': 'General Request'
      };

      const content = `
        <h2>📝 New User Request</h2>
        <p>A user has submitted a new request on the website.</p>
        
        <div class="info-box">
          <h3>Request Details</h3>
          <p><strong>Request ID:</strong> #${requestData._id.toString().slice(-6).toUpperCase()}</p>
          <p><strong>Type:</strong> ${requestTypeNames[requestData.type] || requestData.type}</p>
          <p><strong>Title:</strong> ${requestData.title}</p>
          <p><strong>Submitted:</strong> ${new Date(requestData.createdAt).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
        </div>

        <div class="info-box">
          <h3>User Information</h3>
          <p><strong>Name:</strong> ${userData.name}</p>
          <p><strong>Email:</strong> ${userData.email}</p>
          <p><strong>User Type:</strong> ${userData.isOAuthUser ? 'Google User' : 'Registered User'}</p>
        </div>

        <div class="info-box">
          <h3>Request Description</h3>
          <p>${requestData.description}</p>
        </div>

        ${requestData.type === 'sell-art' && requestData.price ? `
          <div class="info-box">
            <h3>Art Details</h3>
            <p><strong>Asking Price:</strong> ₹${requestData.price}</p>
          </div>
        ` : ''}

        ${requestData.type === 'conduct-workshop' && requestData.preferredDate ? `
          <div class="info-box">
            <h3>Workshop Details</h3>
            <p><strong>Preferred Date:</strong> ${new Date(requestData.preferredDate).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric'
            })}</p>
          </div>
        ` : ''}

        <p>
          <a href="http://localhost:3000/admin/requests" class="button">Review Request</a>
        </p>

        <p>Please review the request and respond to the user accordingly.</p>
      `;

      const subject = `New ${requestTypeNames[requestData.type] || 'Request'}: ${requestData.title}`;
      const htmlContent = this.getEmailTemplate(subject, content);

      return await this.sendEmail(adminEmail, subject, htmlContent);

    } catch (error) {
      console.error('❌ Error sending admin request notification:', error);
      return { success: false, error: error.message };
    }
  }

  // Notify admin of new user registration
  async notifyAdminNewUserRegistration(userData) {
    try {
      const adminEmail = process.env.ADMIN_EMAIL;
      if (!adminEmail) {
        console.log('⚠️ No admin email configured for user registration notifications');
        return { success: false, error: 'Admin email not configured' };
      }

      const content = `
        <h2>👋 New User Registration</h2>
        <p>A new user has joined the Rabuste Coffee community!</p>
        
        <div class="info-box">
          <h3>User Details</h3>
          <p><strong>Name:</strong> ${userData.name}</p>
          <p><strong>Email:</strong> ${userData.email}</p>
          <p><strong>Registration Method:</strong> ${userData.isOAuthUser ? 'Google OAuth' : 'Manual Registration'}</p>
          <p><strong>Joined:</strong> ${new Date(userData.createdAt || Date.now()).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
        </div>

        <p>
          <a href="http://localhost:3000/admin/users" class="button">View All Users</a>
        </p>

        <p>Welcome email has been sent to the new user automatically.</p>
      `;

      const subject = `New User Registration: ${userData.name}`;
      const htmlContent = this.getEmailTemplate(subject, content);

      return await this.sendEmail(adminEmail, subject, htmlContent);

    } catch (error) {
      console.error('❌ Error sending admin user registration notification:', error);
      return { success: false, error: error.message };
    }
  }
}

// Create singleton instance
const emailService = new EmailService();

module.exports = emailService;