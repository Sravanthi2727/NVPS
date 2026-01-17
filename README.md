# ☕ Rabuste Café Website

Rabuste is a full‑stack café website built using **Node.js, Express, MongoDB, and EJS**, designed to provide a modern digital experience for a café. The platform showcases the café brand, menu, workshops, artworks, and supports authentication and payments.

This README explains the project features, tech stack, setup instructions, and available scripts based on the current codebase and recorded walkthrough.

---

## 🚀 Features

### 🌐 Frontend (EJS + CSS + JS)

* Elegant landing page with **video background hero section**
* Café story & brand identity
* Menu display (food & beverages)
* Workshops & events section
* Artworks / gallery section
* Responsive UI for desktop & mobile

### 🔐 Authentication

* Local authentication using **Passport.js**
* Google OAuth 2.0 login
* Secure password hashing with **bcrypt**
* Session‑based authentication

### 🛠 Backend

* REST‑based Express server
* Modular routing structure
* MongoDB with Mongoose schemas
* Admin‑ready structure for content initialization

### 💳 Payments

* Razorpay integration for secure online payments

### ⚡ Performance & Security

* Compression middleware
* Helmet for security headers
* CORS enabled
* Node cache for optimization

### 🧠 AI Integration

* Google Generative AI APIs integrated for intelligent features (content or future enhancements)

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

## 🧱 Tech Stack

* **Backend:** Node.js, Express.js
* **Frontend:** EJS, HTML, CSS, JavaScript
* **Database:** MongoDB (Mongoose)
* **Authentication:** Passport.js (Local + Google OAuth)
* **Payments:** Razorpay
* **AI:** Google Generative AI
* **Testing:** Jest, Supertest

---

## 📁 Project Structure (High‑Level)

```
NVPS/
├── app
├── package
├── package-lock
├── .env
├── .gitignore
├── README
│
├── src/
│   ├── routes/
│   │   ├── index
│   │   ├── auth
│   │   ├── menu
│   │   ├── artwork
│   │   ├── workshop
│   │   ├── payment
│   │   └── admin
│   │
│   ├── controllers/
│   │   ├── auth
│   │   ├── menu
│   │   ├── artwork
│   │   ├── workshop
│   │   ├── payment
│   │   └── admin
│   │
│   └── services/
│       ├── auth
│       ├── menu
│       ├── artwork
│       ├── workshop
│       ├── payment
│       └── admin
│
├── config/
│   ├── db
│   ├── passport
│   └── razorpay
│
├── models/
│   ├── User
│   ├── MenuItem
│   ├── Artwork
│   ├── Workshop
│   └── Payment
│
├── middlewares/
│   ├── auth
│   ├── admin
│   ├── upload
│   └── error
│
├── views/
│   ├── layouts/
│   ├── partials/
│   ├── pages/
│   ├── auth/
│   └── admin/
│
├── public/
│   ├── css/
│   │   ├── main
│   │   ├── auth
│   │   └── admin
│   │
│   ├── js/
│   │   ├── main
│   │   ├── auth
│   │   └── admin
│   │
│   ├── images/
│   │   ├── hero/
│   │   ├── menu/
│   │   ├── artworks/
│   │   └── workshops/
│   │
│   └── videos/
│       └── hero-bg
│
├── init/
│   ├── init-artworks
│   ├── init-menu-items
│   ├── init-workshops
│   └── init-all
│
├── scripts/
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
