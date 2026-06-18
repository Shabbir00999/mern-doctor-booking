# DocReserve - MERN Book a Doctor Application

DocReserve is a modern, responsive full-stack MERN (MongoDB, Express, React, Node) application for listing clinics, searching medical personnel, booking calendar slots, and managing appointments.

It features role-based access control (Patient, Doctor, and Admin), profile image uploads, review analytics, and a premium custom CSS design interface.

---

## Key Features

- **Responsive Portal Shell**: Smooth flex/grid layouts with a modern deep blue glassmorphism theme.
- **Unified Authentication**: Secured credentials handling via JWT and password hashing using `bcryptjs`.
- **Specialist Listings**: Search doctor profiles by name and filter by specialization, consultation fees, and experience.
- **Dynamic Scheduler**: Generates upcoming calendar dates and checks availability against the doctor's weekly calendar settings.
- **Appointments Management**: Patients can book or cancel; doctors can approve/cancel; admins have full audit controls.
- **Clinical Audits**: Admin panel displays database statistics and features doctor verification triggers.
- **Review Engine**: Recalculates average ratings and reviews count on database changes.

---

## Folder Structure

```text
mern-doctor-booking/
├── backend/
│   ├── config/          # DB connection
│   ├── controllers/     # API logic
│   ├── middleware/      # Auth & Multer middlewares
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express route handlers
│   ├── uploads/         # Destination for profile pictures
│   ├── .env             # Backend environment variables
│   ├── package.json     # Backend dependencies
│   ├── seed.js          # DB Seeding Script
│   └── server.js        # Entry point
└── frontend/
    ├── public/
    ├── src/
    │   ├── assets/      # Static files & images
    │   ├── components/  # ProtectedRoute, Navbar, Footer, DoctorCard
    │   ├── context/     # Auth Context
    │   ├── pages/       # Home, Login, Register, DoctorList, DoctorProfile, Dashboards
    │   ├── App.css      # Page custom design styling
    │   ├── App.jsx      # Routes & App shell
    │   ├── index.css    # Global CSS variables & resets
    │   └── main.jsx     # App entry point
    ├── package.json     # Frontend dependencies
    └── vite.config.js   # Vite config with proxy settings
```

---

## Prerequisites

- **Node.js** installed locally.
- **MongoDB** running locally (e.g. `mongodb://127.0.0.1:27017`) OR a **MongoDB Atlas Connection URI**.

---

## Quick Setup Instructions

Recommended active workspace directory:
`C:\Users\shabb\.gemini\antigravity\scratch\mern-doctor-booking`

### 1. Install Dependencies
From the root directory, run the following command to automatically install all dependencies in both the backend and frontend directories:
```bash
npm run install-all
```

### 2. Configure Database Environment (.env)
Open the [backend/.env](file:///C:/Users/shabb/.gemini/antigravity/scratch/mern-doctor-booking/backend/.env) file. If you are using MongoDB Atlas, replace the default connection URI with your Atlas string:
```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=super_secret_jwt_token_key_for_doctor_booking_system_12345
JWT_EXPIRES_IN=7d
```

### 3. Seed Database Collections
Run the database seed script to populate default data (Admin, Patient, 3 Doctors, reviews, and a pending appointment):
```bash
npm run seed
```

### 4. Run Backend & Frontend Servers
You need to start both servers. Open two terminals and run:

**Terminal 1: Start Backend (Port 5000)**
```bash
npm run start-backend
```

**Terminal 2: Start Frontend (Port 3000)**
```bash
npm run start-frontend
```

Now, navigate to `http://localhost:3000` in your web browser.

---

## Seeded Credentials for Testing

Use the following logins to audit the roles inside the seeded database:

### 1. System Admin
- **Email:** `admin@example.com`
- **Password:** `admin123`
- *Use to approve pending doctors, delete users, and view stats.*

### 2. Patient Account
- **Email:** `patient@example.com`
- **Password:** `patient123`
- *Use to search doctors, book appointments, and leave star reviews.*

### 3. Doctor Account (Approved)
- **Email:** `doctor1@example.com`
- **Password:** `doctor123`
- *Use to view upcoming bookings, approve bookings, and adjust profile settings.*

### 4. Doctor Account (Pending Admin Approval)
- **Email:** `doctor3@example.com`
- **Password:** `doctor123`
- *Logs in and views pending banner status. Needs admin approval to show in patient search lists.*
