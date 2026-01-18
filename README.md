# ☕ Rabuste Coffee - India's First Robusta-Only Café

**🌐 Live Website:** [https://nvps-1.onrender.com/](https://nvps-1.onrender.com/)

Rabuste is a comprehensive full-stack café website built using **Node.js, Express, MongoDB, and EJS**, designed to provide a modern digital experience for India's first Robusta-only café. The platform seamlessly integrates coffee culture, art, technology, and community experiences through an elegant web interface.

This README provides detailed documentation of all features, technologies, architecture, and functionalities implemented in the Rabuste Coffee platform.

---

## 🚀 Core Features & Functionalities

### 🌐 Frontend Experience
* **Immersive Hero Section** - Full-screen video background with smooth parallax effects
* **Responsive Design** - Mobile-first approach with optimized layouts for all devices
* **Interactive Menu System** - Dynamic filtering and categorization of Robusta coffee offerings
* **Art Gallery Integration** - Curated artwork display with coffee pairing suggestions
* **Workshop Management** - Event listings with registration and calendar integration
* **Real-time Chat** - AI-powered coffee recommendations using Gemini API
* **Smooth Animations** - CSS3 and JavaScript animations for enhanced user experience
* **Lazy Loading** - Optimized image loading for better performance

### 🔐 Authentication & Security
* **Multi-Strategy Authentication** - Local authentication with Passport.js
* **Google OAuth 2.0** - Seamless social login integration
* **Role-Based Access Control** - Admin, franchise, and user role management
* **Secure Password Handling** - bcrypt encryption with salt rounds
* **Session Management** - Express-session with MongoDB store
* **CSRF Protection** - Security middleware implementation
* **Input Validation** - Server-side validation for all forms

### 🛠 Backend Architecture
* **RESTful API Design** - Clean, organized endpoint structure
* **MVC Pattern** - Separation of concerns with controllers, models, and views
* **Middleware Stack** - Custom authentication, authorization, and error handling
* **Database Optimization** - MongoDB with Mongoose ODM and indexing
* **File Upload System** - Multer integration for image management
* **Caching Strategy** - Node-cache implementation for performance
* **Email Services** - Automated email notifications for bookings and updates

### 💳 Payment Integration
* **Razorpay Gateway** - Secure payment processing for workshops and orders
* **Order Management** - Complete order lifecycle tracking
* **Cart Functionality** - Session-based shopping cart with persistence
* **Payment Verification** - Webhook integration for payment confirmation
* **Invoice Generation** - Automated receipt and invoice creation

### � AI & Smart Features
* **Gemini AI Integration** - Intelligent coffee recommendations based on preferences
* **Food-Drink Pairing** - AI-powered pairing suggestions using CSV data analysis
* **Personalized Recommendations** - Machine learning-based user preference analysis
* **Natural Language Processing** - Chat interface for coffee discovery
* **Recommendation Engine** - Python-based API for advanced suggestions

### 📊 Admin Dashboard
* **Content Management System** - Full CRUD operations for all content
* **User Management** - Admin panel for user roles and permissions
* **Analytics Dashboard** - Google Analytics integration with custom metrics
* **Workshop Management** - Event creation, scheduling, and participant tracking
* **Menu Management** - Dynamic menu item creation with image upload
* **Artwork Curation** - Gallery management with artist information
* **Franchise Management** - Franchise application and approval system

### 🎨 Advanced UI/UX Features
* **Parallax Scrolling** - Smooth background effects on desktop (disabled on mobile)
* **Custom Scrollbar** - Branded scrollbar design with gold accents
* **Theme System** - Consistent color scheme and typography
* **Loading Animations** - Skeleton screens and loading states
* **Error Handling** - User-friendly error pages and messages
* **Accessibility** - WCAG compliant design elements
* **SEO Optimization** - Meta tags, structured data, and semantic HTML

---

## 📄 Pages Overview

### 🏠 Home Page

* First impression of the Rabuste Café brand
* Full-width **video background hero section** showcasing café ambience
* Clear call-to-action buttons (Explore Menu, Workshops, etc.)
* Smooth scrolling and visually rich layout to see the café vibe instantly

### 🛠 Admin Portal

* Secure admin-only access (role-based authorization)

* Add, update, or delete:

  * Menu items
  * Artworks
  * Workshops

* Manage workshop registrations

* Acts as a lightweight CMS for café content

* First impression of the Rabuste Café brand

* Full-width **video background hero section** showcasing café ambience

* Clear call-to-action buttons (Explore Menu, Workshops, etc.)

* Smooth scrolling and visually rich layout to see the café vibe instantly

### ☕ About / Our Story Page

* Tells the story of Rabuste Café
* Highlights the café’s philosophy, values, and inspiration
* Builds emotional connection with users and strengthens brand identity

### 🍽 Menu Page

* Displays food and beverage items dynamically from the database
* Well-structured categories for easy browsing
* Designed for readability and visual appeal

### 🎨 Artworks / Gallery Page

* Showcases curated artworks and creative visuals
* Acts as a visual storytelling section reflecting café aesthetics
* Data is seeded using initialization scripts

### 🧑‍🏫 Workshops Page

* Lists ongoing and upcoming workshops/events
* Encourages community engagement and learning
* Content is dynamically loaded from the database

### 🔐 Authentication Pages

#### Login Page

* Allows users to log in using:

  * Email & password (Local Strategy)
  * Google OAuth 2.0
* Secure session handling with Passport.js

#### Register Page

* New user registration with encrypted passwords
* Input validation for security and usability

### 💳 Payment / Checkout Flow

* Integrated with **Razorpay**
* Enables secure online transactions
* Used for paid workshops or services

### 📞 Contact / Footer Section

* Contact information and navigation links
* Social media presence
* Consistent footer across all pages

---

## 🌟 Key Features Deep Dive

### 🤖 AI-Powered Recommendations
* **Gemini AI Integration** - Advanced natural language processing for coffee recommendations
* **Personalized Suggestions** - Machine learning algorithms analyze user preferences
* **Food-Drink Pairing** - CSV-based data analysis for optimal menu combinations
* **Chat Interface** - Interactive AI assistant for menu exploration and discovery

### 🎨 Art & Coffee Integration
* **Curated Gallery** - Professional artworks paired with specific coffee recommendations
* **Artist Collaboration** - Platform for local artists to showcase and sell their work
* **Coffee-Art Pairing** - Unique concept linking visual art with coffee experiences
* **Purchase Integration** - Secure art buying with integrated payment processing

### 📅 Workshop Management System
* **Google Calendar Integration** - Seamless event scheduling and management
* **Registration System** - Complete booking workflow with payment processing
* **Skill-Based Categories** - Workshops organized by difficulty and topic
* **Community Building** - Events designed to foster coffee and art communities

### 🏢 Franchise Management
* **Application Portal** - Comprehensive franchise application system
* **Business Model Documentation** - Detailed franchise information and requirements
* **Support System** - Training and ongoing support for franchise partners
* **ROI Projections** - Transparent financial modeling and investment details

### 📊 Analytics & Insights
* **Google Analytics Integration** - Comprehensive website traffic and user behavior analysis
* **Custom Metrics** - Café-specific KPIs and performance indicators
* **User Journey Tracking** - Complete customer experience mapping
* **Conversion Optimization** - Data-driven improvements to user experience

---

## 🧱 Technology Stack

### Backend Technologies
* **Node.js** - JavaScript runtime environment
* **Express.js** - Web application framework
* **MongoDB** - NoSQL database with Mongoose ODM
* **Passport.js** - Authentication middleware (Local + Google OAuth)
* **bcrypt** - Password hashing and encryption
* **Express-session** - Session management
* **Multer** - File upload handling
* **Nodemailer** - Email service integration
* **Helmet** - Security middleware
* **CORS** - Cross-origin resource sharing
* **Compression** - Response compression middleware

### Frontend Technologies
* **EJS** - Embedded JavaScript templating
* **HTML5** - Semantic markup with modern standards
* **CSS3** - Advanced styling with Flexbox/Grid, animations, and responsive design
* **Vanilla JavaScript** - DOM manipulation and interactive features
* **Bootstrap 5** - Responsive framework components
* **Font Awesome** - Icon library
* **Google Fonts** - Typography (Inter, Playfair Display)

### AI & Machine Learning
* **Google Generative AI (Gemini)** - Intelligent chat and recommendations
* **Python Flask API** - Recommendation engine backend
* **Pandas** - Data analysis for food-drink pairing
* **CSV Data Processing** - Menu and pairing data management

### Payment & External Services
* **Razorpay** - Payment gateway integration
* **Google OAuth 2.0** - Social authentication
* **Google Calendar API** - Workshop scheduling
* **Google Analytics** - Website analytics and tracking
* **Nodemailer** - Email notifications and confirmations

### Development & Testing
* **Jest** - JavaScript testing framework
* **Supertest** - HTTP assertion testing
* **Nodemon** - Development server auto-restart
* **ESLint** - Code linting and formatting
* **Git** - Version control system

### Deployment & Infrastructure
* **Render** - Cloud hosting platform
* **MongoDB Atlas** - Cloud database hosting
* **Environment Variables** - Secure configuration management
* **SSL/HTTPS** - Secure data transmission
* **CDN Integration** - Optimized asset delivery

---

## 📁 Project Architecture

```
rabuste-coffee/
├── 📄 app.js                          # Main application entry point
├── 📄 package.json                    # Dependencies and scripts
├── 📄 .env                           # Environment variables
├── 📄 .gitignore                     # Git ignore rules
├── 📄 README.md                      # Project documentation
│
├── 📁 config/                        # Configuration files
│   ├── 📄 database.js               # MongoDB connection setup
│   └── 📄 client_secret_*.json      # Google OAuth credentials
│
├── 📁 models/                        # Database schemas
│   ├── 📄 User.js                   # User authentication model
│   ├── 📄 MenuItem.js               # Menu items schema
│   ├── 📄 Artwork.js                # Gallery artworks model
│   ├── 📄 Workshop.js               # Workshop events schema
│   ├── 📄 Order.js                  # Order management model
│   ├── 📄 Cart.js                   # Shopping cart schema
│   ├── 📄 Franchise.js              # Franchise applications
│   └── 📄 Request.js                # General requests model
│
├── 📁 src/                          # Source code organization
│   ├── 📁 controllers/              # Business logic controllers
│   │   ├── 📄 authController.js     # Authentication logic
│   │   ├── 📄 adminController.js    # Admin panel logic
│   │   └── 📄 homeController.js     # Home page logic
│   │
│   ├── 📁 routes/                   # API route definitions
│   └── 📁 services/                 # External service integrations
│       └── 📄 googleAnalyticsService.js
│
├── 📁 middleware/                    # Custom middleware
│   ├── 📄 auth.js                   # Authentication middleware
│   ├── 📄 adminAuth.js              # Admin authorization
│   └── 📄 cache.js                  # Caching middleware
│
├── 📁 views/                        # EJS templates
│   ├── 📁 admin/                    # Admin panel views
│   │   ├── 📄 dashboard.ejs         # Admin dashboard
│   │   ├── 📄 menu-management.ejs   # Menu management
│   │   ├── 📄 users.ejs             # User management
│   │   └── 📄 analytics.ejs         # Analytics dashboard
│   │
│   ├── 📁 partials/                 # Reusable components
│   │   ├── 📄 navbar.ejs            # Navigation bar
│   │   ├── 📄 footer.ejs            # Footer component
│   │   └── 📄 geminiChat.ejs        # AI chat interface
│   │
│   ├── 📄 home.ejs                  # Landing page
│   ├── 📄 menu.ejs                  # Menu display
│   ├── 📄 gallery.ejs               # Art gallery
│   ├── 📄 workshops.ejs             # Workshop listings
│   ├── 📄 about.ejs                 # About page
│   ├── 📄 signin.ejs                # Login page
│   └── 📄 signup.ejs                # Registration page
│
├── 📁 public/                       # Static assets
│   ├── 📁 css/                      # Stylesheets
│   │   ├── 📄 style.css             # Main styles
│   │   ├── 📄 menu.css              # Menu page styles
│   │   ├── 📄 admin.css             # Admin panel styles
│   │   └── 📄 themes.css            # Theme variables
│   │
│   ├── 📁 js/                       # Client-side JavaScript
│   │   ├── 📄 parallax.js           # Parallax effects
│   │   ├── 📄 geminiChat.js         # AI chat functionality
│   │   ├── 📄 admin.js              # Admin panel scripts
│   │   └── 📄 animations.js         # UI animations
│   │
│   ├── 📁 assets/                   # Media files
│   │   ├── 📁 menu_images/          # Menu item photos
│   │   ├── 📁 workshops/            # Workshop images
│   │   ├── 📄 bg.mp4                # Hero video background
│   │   ├── 📄 home_bg.jpg           # Parallax background
│   │   └── 📄 logo-icon.png         # Brand logo
│   │
│   └── 📁 uploads/                  # User uploaded content
│       ├── 📁 artworks/             # Uploaded artwork images
│       └── 📁 menu/                 # Menu item uploads
│
├── 📁 ai/                           # AI recommendation system
│   ├── 📁 data/                     # Training data
│   │   ├── 📄 drinks.csv            # Beverage data
│   │   ├── 📄 food.csv              # Food item data
│   │   └── 📄 pairing.csv           # Pairing recommendations
│   │
│   ├── 📁 recommender/              # Recommendation engine
│   │   └── 📄 api.py                # Python Flask API
│   │
│   ├── 📄 requirements.txt          # Python dependencies
│   └── 📄 runtime.txt               # Python version
│
├── 📁 init/                         # Database initialization
│   ├── 📄 artworks.json             # Initial artwork data
│   ├── 📄 menu-items.json           # Initial menu data
│   ├── 📄 workshops.json            # Initial workshop data
│   ├── 📄 init-artworks.js          # Artwork seeder
│   ├── 📄 init-menu-items.js        # Menu seeder
│   └── 📄 init-workshops.js         # Workshop seeder
│
├── 📁 scripts/                      # Utility scripts
│   ├── 📄 optimize-images.js        # Image optimization
│   ├── 📄 make-admin.js             # Admin user creation
│   └── 📄 list-users.js             # User management
│
├── 📁 services/                     # External integrations
│   ├── 📄 emailService.js           # Email notifications
│   └── 📄 googleCalendarService.js  # Calendar integration
│
├── 📁 gemini/                       # AI chat system
│   ├── 📄 gemini.controller.js      # Chat controller
│   ├── 📄 gemini.route.js           # Chat routes
│   └── 📄 gemini.service.js         # Gemini API service
│
└── 📁 docs/                         # Documentation
    ├── 📄 admin-guide.md            # Admin user guide
    ├── 📄 mvc-implementation.md     # Architecture documentation
    └── 📄 image-optimization.md     # Performance guide
```
│   └── optimize-images
│
├── tests/
│   ├── auth
│   ├── menu
│   ├── workshop
│   └── payment
│
└── docs/
    ├── erd/
    │   └── rabuste_erd
    ├── api-docs
    └── project-report

```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Sravanthi2727/NVPS.git
cd NVPS
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
SESSION_SECRET=your_secret_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
```

### 4️⃣ Initialize Database Content (Optional)

```bash
npm run init-all
```

### 5️⃣ Start the Server

```bash
npm start
```

Server will run at:

```
http://localhost:3000
```

---

## 📜 Available Scripts

| Script                    | Description           |
| ------------------------- | --------------------- |
| `npm start`               | Start the server      |
| `npm test`                | Run tests             |
| `npm test:watch`          | Watch test mode       |
| `npm run optimize-images` | Optimize images       |
| `npm run init-artworks`   | Seed artworks data    |
| `npm run init-menu-items` | Seed menu data        |
| `npm run init-workshops`  | Seed workshops data   |
| `npm run init-all`        | Seed all initial data |

---

## 🧪 Testing

* Jest for unit testing
* Supertest for API testing

Run tests using:

```bash
npm test
```

---

## 🎥 Demo & Walkthrough

A complete screen recording walkthrough of the website has been provided, demonstrating:

* Homepage UI & hero video
* Page-to-page navigation
* Menu, workshops, and gallery pages
* Authentication & payment flow
* Overall user experience and responsiveness

A complete screen recording walkthrough of the website has been provided, demonstrating:

* Homepage UI & hero video
* Navigation flow
* Menu, workshops, and gallery
* Authentication flow
* Overall user experience

---

## 📌 Future Enhancements

* Admin dashboard
* Online table reservation
* Order tracking system
* Enhanced AI‑powered recommendations
* CMS‑based content management

---

## 🗄️ Database ERD (Entity Relationship Diagram)

A proper ERD diagram has been created for use in **reports, PPTs, and viva presentations**.

📌 **Entities Included:** User, MenuItem, Artwork, Workshop, Payment

📎 **Download ERD Image:** `rabuste_erd.png`

---

## ❓ Why This Database Design?

This database design was chosen to ensure **scalability, clarity, and real-world usability** while keeping the system modular and maintainable.

### 1️⃣ Separation of Concerns

Each major feature of the website has its own collection:

* **User** → authentication & roles
* **MenuItem** → café offerings
* **Artwork** → gallery content
* **Workshop** → events & learning sessions
* **Payment** → transaction tracking

This avoids data redundancy and makes updates safer.

### 2️⃣ Scalable User–Workshop Relationship

Instead of embedding payments or registrations inside users:

* A separate **Payment** collection is used
* Allows:

  * One user to attend multiple workshops
  * One workshop to have many participants
  * Easy tracking of payment status

### 3️⃣ MongoDB-Friendly Design

* Uses **references (ObjectId)** where relationships are required
* Keeps collections flexible and schema evolution-friendly
* Ideal for a growing café platform

### 4️⃣ Admin Readiness

* `role` field in User enables admin functionality
* Admin portal can safely manage content without affecting user data

### 5️⃣ Real-World Alignment

This structure mirrors real café systems:

* Users don’t modify menu data
* Payments are immutable records
* Content is managed separately by admins

Overall, this design balances **performance, simplicity, and extensibility**, making it suitable for both academic evaluation and production use.

---

### 🍽 MenuItem

* **_id** (ObjectId)
* title
* description
* category (coffee, beverage, food, etc.)
* price
* imageUrl
* isAvailable

**Relationships:**

* Independent entity (read-only for users)

---

### 🎨 Artwork

* **_id** (ObjectId)
* title
* artistName
* description
* imageUrl
* createdAt

**Relationships:**

* Independent entity (used for gallery display)

---

### 🧑‍🏫 Workshop

* **_id** (ObjectId)
* title
* description
* date
* price
* capacity
* imageUrl

**Relationships:**

* One Workshop can have many Users (registrations)

---

### 🧾 Payment

* **_id** (ObjectId)
* userId (ref: User)
* workshopId (ref: Workshop)
* razorpayOrderId
* razorpayPaymentId
* amount
* status
* createdAt

**Relationships:**

* Many Payments belong to one User
* Many Payments belong to one Workshop

---

### 🔗 ERD Relationship Summary

```
User 1 ────< Payment >──── 1 Workshop
User 1 ────< Workshop (registrations)
```

---

## 🤝 Contributors

* Project developed as part of academic / portfolio work

---

## 📄 License

This project is licensed under the **ISC License**.

---

## ⭐ Support

If you find this project useful, consider giving it a star on GitHub ⭐

## 🚀 Live Demo & Features

**🌐 Website:** [https://nvps-1.onrender.com/](https://nvps-1.onrender.com/)

### 🎯 Key Highlights
* **Robusta-Only Focus** - India's first café dedicated exclusively to Robusta coffee
* **AI-Powered Experience** - Gemini AI integration for personalized recommendations
* **Art & Coffee Fusion** - Unique concept combining coffee culture with visual arts
* **Community Workshops** - Educational and creative events for coffee enthusiasts
* **Franchise Opportunities** - Scalable business model for expansion
* **Mobile-First Design** - Optimized for all devices with responsive layouts

### 🔧 Technical Achievements
* **Performance Optimization** - Lazy loading, image optimization, and caching
* **Security Implementation** - HTTPS, CSRF protection, and secure authentication
* **Scalable Architecture** - MVC pattern with modular component design
* **Database Optimization** - Efficient MongoDB queries with proper indexing
* **API Integration** - Multiple third-party services seamlessly integrated
* **Testing Coverage** - Comprehensive unit and integration testing

---

## 🛠 Installation & Development Setup

### Prerequisites
* **Node.js** (v16 or higher)
* **MongoDB** (local or Atlas)
* **Python** (v3.8+ for AI recommendations)
* **Git** for version control

### 1️⃣ Clone Repository
```bash
git clone https://github.com/Sravanthi2727/NVPS.git
cd NVPS
```

### 2️⃣ Install Dependencies
```bash
# Install Node.js dependencies
npm install

# Install Python dependencies for AI system
cd ai
pip install -r requirements.txt
cd ..
```

### 3️⃣ Environment Configuration
Create `.env` file in root directory:
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/rabuste
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/rabuste

# Authentication
SESSION_SECRET=your_super_secret_session_key_here
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret

# Payment Gateway
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# AI Integration
GEMINI_API_KEY=your_google_gemini_api_key

# Email Service
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_specific_password

# Google Services
GOOGLE_CALENDAR_CLIENT_ID=your_calendar_client_id
GOOGLE_CALENDAR_CLIENT_SECRET=your_calendar_client_secret
GOOGLE_ANALYTICS_TRACKING_ID=your_ga_tracking_id
```

### 4️⃣ Database Initialization
```bash
# Initialize database with sample data
npm run init-all

# Or initialize specific collections
npm run init-menu-items
npm run init-workshops
npm run init-artworks
```

### 5️⃣ Start Development Server
```bash
# Start main application
npm run dev

# Start AI recommendation service (separate terminal)
cd ai
python api.py
```

### 6️⃣ Access Application
* **Main Website:** http://localhost:3000
* **Admin Panel:** http://localhost:3000/admin
* **AI API:** http://localhost:5000

---

## 📜 Available Scripts

| Command | Description | Usage |
|---------|-------------|-------|
| `npm start` | Production server | `npm start` |
| `npm run dev` | Development with nodemon | `npm run dev` |
| `npm test` | Run test suite | `npm test` |
| `npm run test:watch` | Watch mode testing | `npm run test:watch` |
| `npm run init-all` | Initialize all data | `npm run init-all` |
| `npm run init-menu-items` | Seed menu data | `npm run init-menu-items` |
| `npm run init-workshops` | Seed workshop data | `npm run init-workshops` |
| `npm run init-artworks` | Seed artwork data | `npm run init-artworks` |
| `npm run optimize-images` | Compress images | `npm run optimize-images` |
| `npm run make-admin` | Create admin user | `npm run make-admin` |
| `npm run list-users` | Display all users | `npm run list-users` |

---

## 🧪 Testing Strategy

### Unit Testing
```bash
# Run all tests
npm test

# Run specific test files
npm test -- --testPathPattern=auth
npm test -- --testPathPattern=menu
npm test -- --testPathPattern=workshop
```

### Integration Testing
```bash
# Test API endpoints
npm run test:integration

# Test database operations
npm run test:database
```

### Performance Testing
```bash
# Image optimization testing
npm run test:performance

# Load testing
npm run test:load
```

---

## 🚀 Deployment Guide

### Render Deployment (Current)
1. **Connect Repository** - Link GitHub repository to Render
2. **Environment Variables** - Configure all required environment variables
3. **Build Command** - `npm install`
4. **Start Command** - `npm start`
5. **Auto-Deploy** - Automatic deployment on git push

### Alternative Deployment Options

#### Heroku
```bash
# Install Heroku CLI
npm install -g heroku

# Login and create app
heroku login
heroku create rabuste-coffee

# Set environment variables
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set SESSION_SECRET=your_session_secret

# Deploy
git push heroku main
```

#### DigitalOcean App Platform
```bash
# Create app.yaml configuration
# Deploy via DigitalOcean dashboard
# Configure environment variables
# Set up custom domain
```

#### AWS Elastic Beanstalk
```bash
# Install EB CLI
pip install awsebcli

# Initialize and deploy
eb init
eb create rabuste-production
eb deploy
```

---

## 📊 Database Schema & Relationships

### Core Collections

#### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (user/admin/franchise),
  googleId: String (optional),
  preferences: {
    coffeeStrength: String,
    favoriteCategories: [String],
    dietaryRestrictions: [String]
  },
  createdAt: Date,
  updatedAt: Date
}
```

#### Menu Items Collection
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  price: Number,
  category: String,
  subCategory: String,
  image: String,
  ingredients: [String],
  allergens: [String],
  nutritionalInfo: Object,
  isAvailable: Boolean,
  displayOrder: Number,
  reviews: [{
    customer: String,
    rating: Number,
    comment: String,
    date: Date
  }]
}
```

#### Workshops Collection
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  date: Date,
  type: String (upcoming/past),
  category: String,
  image: String,
  meta: {
    duration: String,
    level: String,
    tags: [String],
    maxParticipants: Number,
    currentParticipants: Number
  },
  galleryImages: [String],
  isActive: Boolean,
  displayOrder: Number
}
```

#### Artworks Collection
```javascript
{
  _id: ObjectId,
  title: String,
  artist: String,
  price: Number,
  image: String,
  category: String,
  description: String,
  year: Number,
  medium: String,
  dimensions: String,
  availability: String,
  coffeeParings: [String]
}
```

### Relationship Mapping
```
User ──┬── Orders (1:many)
       ├── Cart Items (1:many)
       ├── Workshop Registrations (1:many)
       └── Art Purchases (1:many)

Workshop ──── Registrations (1:many)
MenuItem ──── Order Items (1:many)
Artwork ────── Purchases (1:many)
```

---

## 🔒 Security Implementation

### Authentication Security
* **Password Hashing** - bcrypt with salt rounds
* **Session Management** - Secure session cookies
* **OAuth Integration** - Google OAuth 2.0
* **CSRF Protection** - Cross-site request forgery prevention
* **Rate Limiting** - API endpoint protection

### Data Security
* **Input Validation** - Server-side validation for all inputs
* **SQL Injection Prevention** - Mongoose ODM protection
* **XSS Protection** - Content Security Policy headers
* **HTTPS Enforcement** - SSL/TLS encryption
* **Environment Variables** - Secure configuration management

### File Upload Security
* **File Type Validation** - Allowed file extensions only
* **File Size Limits** - Maximum upload size restrictions
* **Virus Scanning** - Malware detection for uploads
* **Secure Storage** - Protected file storage locations

---

## 🎨 UI/UX Design Philosophy

### Design Principles
* **Robusta-Centric Branding** - Bold, intense, and powerful visual identity
* **Coffee Culture Integration** - Warm, inviting, and community-focused
* **Art Gallery Aesthetic** - Clean, sophisticated, and visually appealing
* **Mobile-First Approach** - Responsive design for all screen sizes

### Color Palette
```css
:root {
  --gold: #d6a45a;           /* Primary brand color */
  --gold-soft: #e3b873;     /* Secondary gold */
  --text: #f5f2ee;          /* Primary text */
  --muted: rgba(245, 242, 238, 0.7); /* Secondary text */
  --dark: #000000;          /* Background */
}
```

### Typography
* **Primary Font** - Inter (clean, modern sans-serif)
* **Display Font** - Playfair Display (elegant serif for headings)
* **Font Weights** - 400 (regular), 600 (semi-bold), 700 (bold)

### Interactive Elements
* **Hover Effects** - Smooth transitions and micro-interactions
* **Loading States** - Skeleton screens and progress indicators
* **Error Handling** - User-friendly error messages and recovery
* **Accessibility** - WCAG 2.1 AA compliance

---

## 📈 Performance Optimization

### Frontend Optimization
* **Image Optimization** - WebP format with fallbacks
* **Lazy Loading** - Images loaded on scroll
* **CSS Minification** - Compressed stylesheets
* **JavaScript Bundling** - Optimized script loading
* **Font Optimization** - Preloaded web fonts

### Backend Optimization
* **Database Indexing** - Optimized MongoDB queries
* **Caching Strategy** - Node-cache for frequently accessed data
* **Compression** - Gzip compression for responses
* **CDN Integration** - Static asset delivery optimization
* **Connection Pooling** - Efficient database connections

### Mobile Optimization
* **Responsive Images** - Device-appropriate image sizes
* **Touch Optimization** - Touch-friendly interface elements
* **Reduced Animations** - Performance-conscious mobile experience
* **Offline Capability** - Service worker implementation (planned)

---

## 🤝 Contributing Guidelines

### Development Workflow
1. **Fork Repository** - Create personal fork
2. **Create Branch** - Feature-specific branch naming
3. **Make Changes** - Follow coding standards
4. **Test Changes** - Run test suite
5. **Submit PR** - Detailed pull request description

### Code Standards
* **ESLint Configuration** - Consistent code formatting
* **Naming Conventions** - camelCase for variables, PascalCase for components
* **Comment Standards** - JSDoc for functions and complex logic
* **Git Commit Messages** - Conventional commit format

### Testing Requirements
* **Unit Tests** - All new functions must have tests
* **Integration Tests** - API endpoints require integration tests
* **Manual Testing** - UI/UX testing across devices
* **Performance Testing** - Load testing for new features

---

## 📞 Support & Contact

### Technical Support
* **GitHub Issues** - Bug reports and feature requests
* **Documentation** - Comprehensive guides in `/docs` folder
* **Code Comments** - Inline documentation for complex logic

### Business Inquiries
* **Franchise Opportunities** - Available through website contact form
* **Partnership Requests** - Business development inquiries welcome
* **Custom Development** - Available for similar projects

### Community
* **Coffee Enthusiasts** - Join our workshops and events
* **Local Artists** - Gallery submission opportunities
* **Developers** - Open source contributions welcome

---

## 📄 License & Legal

### Open Source License
This project is licensed under the **ISC License** - see the LICENSE file for details.

### Third-Party Licenses
* **Node.js** - MIT License
* **Express.js** - MIT License
* **MongoDB** - Server Side Public License
* **Bootstrap** - MIT License
* **Google Fonts** - SIL Open Font License

### Terms of Use
* **Educational Use** - Free for learning and academic purposes
* **Commercial Use** - Contact for commercial licensing
* **Attribution** - Credit required for derivative works

---

## 🎯 Future Roadmap

### Phase 1 - Enhanced Features (Q2 2026)
* **Mobile App** - React Native mobile application
* **Advanced Analytics** - Detailed user behavior insights
* **Loyalty Program** - Customer rewards and points system
* **Inventory Management** - Real-time stock tracking

### Phase 2 - Expansion (Q3 2026)
* **Multi-Location Support** - Franchise management system
* **Delivery Integration** - Third-party delivery service APIs
* **Advanced AI** - Machine learning recommendation improvements
* **Social Features** - User reviews and community interactions

### Phase 3 - Innovation (Q4 2026)
* **IoT Integration** - Smart café equipment connectivity
* **Blockchain Loyalty** - Cryptocurrency-based rewards
* **AR Experience** - Augmented reality menu and art viewing
* **Voice Ordering** - Voice-activated ordering system

---

## ⭐ Acknowledgments

### Development Team
* **Full-Stack Development** - Comprehensive web application
* **UI/UX Design** - Modern, responsive interface design
* **Database Architecture** - Scalable MongoDB implementation
* **AI Integration** - Gemini API and recommendation engine

### Special Thanks
* **Coffee Community** - Inspiration and feedback
* **Local Artists** - Gallery content and collaboration
* **Beta Testers** - Early feedback and bug reports
* **Open Source Community** - Libraries and frameworks used

### Technologies & Services
* **Google Cloud** - AI services and authentication
* **MongoDB Atlas** - Database hosting and management
* **Render** - Application hosting and deployment
* **Razorpay** - Payment processing integration

---

**🚀 Ready to explore India's first Robusta-only café experience?**

**Visit:** [https://nvps-1.onrender.com/](https://nvps-1.onrender.com/)

**⭐ Star this repository if you find it useful!**