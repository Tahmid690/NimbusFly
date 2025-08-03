# ✈️ NimbusFly - Airline Ticket Management System

<div align="center">

![NimbusFly Logo](/nimbusfly-frontend/public/lgp.png)

**A comprehensive airplane ticket management system with stunning frontend and powerful backend**

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-Visit_Site-4F46E5?style=for-the-badge)](https://nimbus-fly.vercel.app/)
[![API Backend](https://img.shields.io/badge/🔗_API-Backend_Live-10B981?style=for-the-badge)](https://nimbusfly.onrender.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org/)

</div>

---

## 🎯 About The Project

NimbusFly is a full-featured airline ticket management system developed as a term project for **CSE 216: Database Sessional Course**. This comprehensive platform allows users to seamlessly book airplane tickets online while providing airlines with powerful management tools to handle their flights, aircraft, and operations.

**🌟 Why NimbusFly?**
- Built with modern web technologies for optimal performance
- Database-optimized search for lightning-fast results
- Proper transaction management ensuring data integrity
- Stunning, responsive frontend design
- Complete airline management ecosystem

---

## ✨ Key Features

### 👥 **For Passengers**
- 🔍 **Advanced Flight Search** - Search by date, destination, and multiple parameters
- 🎫 **Multi-Passenger Booking** - Book tickets for multiple passengers at once
- ✈️ **Flexible Travel Options** - Round-trip tickets and transit flight support
- 💺 **Seat Class Selection** - Choose from economy, business, or first class
- 📱 **Complete Booking Management** - Cancel bookings and manage reservations
- 📄 **Digital Boarding Pass** - Download boarding passes as PDF
- 🔧 **Account Management** - Registration, password changes, and profile updates
- 🎛️ **Smart Filtering & Sorting** - Filter by airline, time, date, price; sort by price, departure time, duration

### 🏢 **For Airlines**
- ✈️ **Flight Management** - Add flights to different destinations
- 🛩️ **Aircraft Collection** - Maintain and add aircraft to fleet
- 📅 **Schedule Control** - Cancel and reschedule flights efficiently  
- 📊 **Analytics Dashboard** - Track comprehensive statistics and insights
- 🎛️ **Full-Featured Admin Panel** - Complete airline operations management

---

## 🛠️ Tech Stack

| Frontend | Backend | Database | Styling | Deployment |
|----------|---------|----------|---------|------------|
| ![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black) | ![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white) | ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white) | ![Tailwind](https://img.shields.io/badge/Tailwind-06B6D4?style=flat&logo=tailwindcss&logoColor=white) | ![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat&logo=vercel&logoColor=white) |
| React.js | Express.js | Supabase | Tailwind CSS | Vercel |

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/NimbusFly.git
   cd NimbusFly
   ```

2. **Install dependencies**
   ```bash
   npm install
   npm run install:all
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   # Database Configuration
   DATABASE_PUBLIC_URL=postgresql://postgres.bwbqdbuirtgadpcwyisv:KisuPariNa@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
   PORT=3000
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=465
   SMTP_USER=nimbusfly7688@gmail.com   
   SMTP_PASS="dkix jxrp yteh umau"
   ADMIN_EMAIL=tanvirzihad1988@gmail.com
   ADMIN_EMAIL2=tahmidhossain690@gmail.com
   FRONTEND_SERVER="http://localhost:5173"
   ```
   Create a `.env` file in the nimbusfly-frontend directory:
   ```env
   VITE_API_URL="http://localhost:3000"
   ```

4. **Run the application**
   ```bash
   npm run dev
   ```

   This command runs both frontend and backend concurrently. The application will be available at:
   - **Frontend**: `http://localhost:3000`
   - **Backend**: `http://localhost:5173`

---

## 🌐 Live Demo

Experience NimbusFly in action:

**🔗 Frontend Application**: [https://nimbus-fly.vercel.app/](https://nimbus-fly.vercel.app/)

**🔗 API Backend**: [https://nimbusfly.onrender.com/](https://nimbusfly.onrender.com/)

### Demo Credentials

**👤 User Account**: Create your own account through registration

**👨‍💼 Admin Access**:
- **Email**: `bimanbangla@nimbusfly.com`
- **Password**: `bbnimbus`

---

## 📸 Screenshots


![Home Page](/nimbusfly-frontend/public/homepage.png)
*Modern, intuitive homepage with flight search*

![Flight Results](/nimbusfly-frontend/public/flightsearch.png)  
*Advanced filtering and sorting options*

![User Dashboard](/nimbusfly-frontend/public/userdashboard.png)
*Seamless user experience*

![Admin Dashboard](/nimbusfly-frontend/public/admindashboard.png)
*Comprehensive airline management dashboard*


---

## 🎯 Performance Highlights

- ⚡ **Optimized Database Queries** - Lightning-fast search results
- 🔒 **Transaction Management** - Ensures data consistency and integrity
- 📱 **Responsive Design** - Perfect experience across all devices
- 🚀 **Modern Architecture** - Scalable and maintainable codebase

---

## 📁 Project Structure

```
NIMBUSFLY/
├── nimbusfly-backend/           # Node.js Backend
│   ├── .claude/                 # Claude AI configuration
│   ├── config/                  # Database & app configuration
│   ├── controllers/             # Business logic controllers
│   ├── middleware/              # Custom middleware functions
│   ├── node_modules/            # Backend dependencies
│   ├── routes/                  # API route definitions
│   ├── .env                     # Environment variables
│   ├── .gitignore              # Git ignore rules
│   ├── app.js                  # Main application entry
│   ├── package-lock.json       # Dependency lock file
│   └── package.json            # Backend dependencies & scripts
│
├── nimbusfly-frontend/          # React Frontend
│   ├── dist/                    # Production build output
│   ├── node_modules/            # Frontend dependencies
│   ├── public/                  # Static public assets
│   ├── src/                     # Source code
│   │   ├── assets/              # Images, icons, static files
│   │   ├── components/          # Reusable React components
│   │   ├── App.css             # Main application styles
│   │   ├── App.jsx             # Root App component
│   │   ├── index.css           # Global CSS styles
│   │   └── main.jsx            # React app entry point
│   ├── .env                     # Frontend environment variables
│   ├── .gitignore              # Git ignore rules
│   ├── eslint.config.js        # ESLint configuration
│   ├── index.html              # Main HTML template
│   ├── package-lock.json       # Dependency lock file
│   ├── package.json            # Frontend dependencies & scripts
│   ├── tailwind.config.js      # Tailwind CSS configuration
│   ├── test-confirmation.html  # Test page
│   ├── vercel.json             # Vercel deployment config
│   └── vite.config.js          # Vite build configuration
│
├── node_modules/                # Root level dependencies
├── .gitignore                   # Root git ignore
├── package-lock.json            # Root dependency lock
├── package.json                 # Root package with concurrently setup
├── README.md                    # Project documentation
├── schema.sql                   # Database schema file
└── SQL Queries.sql                   # Database schema file
```

---

## 🤝 Contributing

This project was developed as a term project for CSE 216: Database Sessional Course and is currently **closed for external contributions**.

---

## 👨‍💻 Developer

**Md. Tahmid Hossain**
- 📧 Contact: [tahmidhossain690@gmail.com]
- 🔗 LinkedIn: [Md. Tahmid Hossain](https://www.linkedin.com/in/md-tahmid-hossain-a7a497282/)
- 🐙 GitHub: [Tahmid690](https://github.com/tahmid690)

**Tanvir Hossen Zihad**
- 📧 Contact: [tanvirzihad1988@gmail.com]
- 🔗 LinkedIn: [Tanvir Zihad](https://www.linkedin.com/in/tanvir-zihad-5a1366366/)
- 🐙 GitHub: [TanvirZihad](https://github.com/TanvirZihad)

---

## 🙏 Acknowledgments

- **Course**: CSE 216 - Database Sessional Course
- **University**: Bangladesh University of Engineering and Technology
- **Technologies**: React, Node.js, PostgreSQL, Tailwind CSS
- **Deployment**: Vercel & Render

---

<div align="center">

**⭐ If you found this project interesting, please consider giving it a star!**

[![GitHub stars](https://img.shields.io/github/stars/tahmid690/NimbusFly?style=social)](https://github.com/tahmid690/NimbusFly)

</div>
