# Smart Clinic Booking — Wait Zero

A comprehensive **Healthcare Management System** with **Live Token Generation** and **Automated Appointment Scheduling**, designed to eliminate long clinic wait times.

> **Team:** Wait Zero | **Course:** Software Engineering

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Test Credentials](#test-credentials)
- [Team Members](#team-members)
- [License](#license)

---

## Overview

**Smart Clinic Booking** is a hybrid healthcare platform that manages patient queues and appointments in environments with inconsistent internet connectivity. It uses a centralized cloud server (MySQL) combined with local SQLite storage for **offline data persistence** and automatic **background synchronization**.

### Key Highlights
- 📱 **Patient Mobile App** — Built with Flutter for cross-platform support
- 💻 **Doctor/Staff Dashboard** — Web-based interface for queue and appointment management
- 🔄 **Offline-First Architecture** — Book appointments without internet; data syncs automatically
- 🏥 **Live Token Queue** — Real-time queue management with emergency interrupt support
- 📍 **GPS Check-In** — Geofencing-based patient check-in at the clinic
- 💊 **Digital Prescriptions** — Instant prescription delivery to patient's mobile app

---

## Features

| Feature | Description |
|---|---|
| **Offline Booking (UC-01)** | Book appointments without internet. Data saved locally and synced later. |
| **Background Sync (UC-02)** | Automatic sync of pending records when connectivity is restored. |
| **Call Next Token (UC-03)** | Doctors progress the queue; wait times recalculated in real-time. |
| **Emergency Interrupt (UC-04)** | Insert emergency (RED) token at the top of the queue. |
| **GPS Check-In (UC-05)** | Geofencing prompts patients to check in upon arriving at the clinic. |
| **Digital Prescription (UC-06)** | Doctors issue prescriptions digitally, accessible instantly on mobile. |

---

## Technology Stack

| Layer | Technology |
|---|---|
| Mobile App (Patient) | Flutter (Dart) |
| Web Dashboard (Doctor/Staff) | React (TypeScript) |
| Backend API | Node.js + Express.js |
| Cloud Database | MySQL |
| Local Database | SQLite |
| Authentication | JWT + OTP |
| Encryption | AES-256 |
| Communication | REST API (HTTPS/JSON) |

---

## Project Structure

```
smart-clinic-booking/
├── backend/                  # Node.js + Express API server
│   ├── config/               # Database & auth configuration
│   ├── controllers/          # Request handlers
│   ├── middleware/            # Auth, validation, error handling
│   ├── models/               # Database models (Patient, Doctor, etc.)
│   ├── routes/               # API route definitions
│   ├── utils/                # Helper functions & services
│   └── tests/                # Unit tests
├── frontend/
│   ├── mobile/               # Flutter patient mobile app
│   └── web-dashboard-react/   # Doctor/Staff web dashboard (React + TypeScript)
├── database/
│   ├── schema.sql            # Complete database schema
│   ├── seed.sql              # Sample data for testing
│   └── migrations/           # Incremental table creation scripts
└── docs/                     # Project documentation
```

---

## Prerequisites

Before running the application, ensure you have the following installed:

- **Node.js** (v18 or higher) — [Download](https://nodejs.org/)
- **MySQL** (v8.0 or higher) — [Download](https://dev.mysql.com/downloads/)
- **Flutter SDK** (v3.0 or higher) — [Download](https://flutter.dev/docs/get-started/install)
- **Git** — [Download](https://git-scm.com/)

---

## Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/KrishG7/smart-clinic-booking.git
cd smart-clinic-booking
```

### 2. Set Up the Database
```bash
# Log into MySQL
mysql -u root -p

# Create the database and run schema
source database/schema.sql
source database/seed.sql
```

### 3. Set Up the Backend
```bash
cd backend
cp .env.example .env
# Edit .env with your MySQL credentials
npm install
```

### 4. Set Up the Mobile App
```bash
cd frontend/mobile
flutter pub get
```

### 5. Set Up the Web Dashboard
```bash
cd frontend/web-dashboard-react
npm install
```

---

## Running the Application

### Backend Server
```bash
cd backend
npm start
# Server runs on http://localhost:3000
```

### Mobile App
```bash
cd frontend/mobile
flutter run
```

### Web Dashboard
```bash
cd frontend/web-dashboard-react
npm run dev
# Dashboard runs on http://localhost:5173
```

---

## API Documentation

Full API documentation is available in [`docs/api-documentation.md`](docs/api-documentation.md).

### Quick Reference

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login with OTP |
| GET | `/api/patients/:id` | Get patient profile |
| POST | `/api/appointments` | Book an appointment |
| GET | `/api/tokens/queue/:doctorId` | Get current queue |
| POST | `/api/tokens/next` | Call next patient |
| POST | `/api/sync/push` | Sync local data to server |

---

## Test Credentials

| Role | Phone | OTP |
|---|---|---|
| Patient | 9876543210 | 123456 |
| Doctor | 9876543211 | 123456 |
| Admin/Staff | 9876543212 | 123456 |

> **Note:** For demo purposes, OTP verification accepts `123456` as a valid code for all test accounts.

---

## Team Members

| Name | Roll Number | Role |
|---|---|---|
| Krish Gupta | 24293916007 | Project Lead, Backend Core |
| Yuvraj Dahiya | 24293916069 | Backend API Developer |
| Amandeep Singh | 24293916067 | Web Dashboard Developer |
| Mukul Chauhan | 24293916062 | Database & Models |
| Daksh Dahiya | 24293916060 | Documentation & Testing |
| Himanshu Chhillar | 24293916028 | Flutter UI & Middleware |

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
