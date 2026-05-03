# Wait Zero — User Manual

**Smart Clinic Booking: Healthcare Management System**
Version 1.0.0 | Team: Wait Zero | Course: Software Engineering

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [System Requirements](#2-system-requirements)
3. [Installation & First-Time Setup](#3-installation--first-time-setup)
4. [Patient Mobile App — User Guide](#4-patient-mobile-app--user-guide)
5. [Doctor / Staff Web Dashboard — User Guide](#5-doctor--staff-web-dashboard--user-guide)
6. [Test Credentials (Demo Mode)](#6-test-credentials-demo-mode)
7. [Frequently Asked Questions](#7-frequently-asked-questions)
8. [Known Limitations](#8-known-limitations)
9. [Contact & Support](#9-contact--support)
10. [Appendix A — Installing Prerequisites From Scratch](#appendix-a--installing-prerequisites-from-scratch)

---

## 1. Introduction

**Wait Zero** is a healthcare management platform built to eliminate long clinic waiting times. It consists of two interfaces that work together:

| Interface | Who Uses It | Platform |
|---|---|---|
| **Patient Mobile App** | Patients | Flutter (Android / iOS) |
| **Doctor/Staff Web Dashboard** | Doctors & Reception Staff | Web Browser |

### What Can You Do?

- 📅 **Book appointments** — even without internet (offline mode)
- 🎫 **Get a live queue token** — know your exact position in the queue
- 🔴 **Emergency interrupt** — critical patients jump to the front
- 📍 **GPS check-in** — auto check-in when you arrive at the clinic
- 💊 **Receive digital prescriptions** — directly on your phone after the visit
- 🔄 **Auto-sync** — offline bookings sync automatically when you reconnect

---

## 2. System Requirements

### To Run the Backend Server
| Requirement | Version |
|---|---|
| Node.js | v18 or higher |
| MySQL | v8.0 or higher |
| npm | v9 or higher |
| Operating System | Windows / macOS / Linux |

### To Use the Patient Mobile App
| Requirement | Details |
|---|---|
| Flutter SDK | v3.0 or higher |
| Android | SDK 21+ (Android 5.0+) |
| iOS | iOS 12+ |

### To Use the Web Dashboard
| Requirement | Details |
|---|---|
| Browser | Chrome, Firefox, Edge, Safari (latest) |
| Node.js | v18 or higher (to run dev server) |
| Internet | Required for real-time queue features |

---

## 3. Installation & First-Time Setup

> **For Peer Testers:** Follow these steps in order. The system runs entirely on your local machine.

### Step 1 — Clone the Repository

```bash
git clone https://github.com/KrishG7/smart-clinic-booking.git
cd smart-clinic-booking
```

### Step 2 — Set Up MySQL Database

1. Open MySQL and log in:
   ```bash
   mysql -u root -p
   ```
2. Run the schema and seed files:
   ```sql
   source database/schema.sql;
   source database/seed.sql;
   ```

### Step 3 — Configure and Start the Backend

```bash
cd backend
cp .env.example .env
```

Open `.env` and fill in your MySQL credentials:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=smart_clinic
JWT_SECRET=any_random_string_here
```

Then install dependencies and start:
```bash
npm install
npm start
```

✅ Backend runs at: `http://localhost:3000`
✅ Health check: `http://localhost:3000/api/health`

### Step 4 — Start the Web Dashboard

**Option A — React Dashboard (recommended):**
```bash
cd frontend/web-dashboard-react
npm install
npm run dev
```
Open: `http://localhost:5173`

**Option B — Plain HTML Dashboard:**
Open `frontend/web-dashboard/index.html` directly in your browser (requires backend running).

### Step 5 — Run the Flutter Mobile App

```bash
cd frontend/mobile
flutter pub get
flutter run
```

> **Android Emulator Note:** In `frontend/mobile/lib/utils/constants.dart`, change `localhost` to `10.0.2.2` for the Android emulator to reach the backend.

---

## 4. Patient Mobile App — User Guide

### 4.1 Registration & Login

1. **Open** the Wait Zero app on your phone/emulator.
2. On the **Welcome Screen**, tap **"Get Started"**.
3. Enter your **phone number** and tap **"Send OTP"**.
4. Enter the 6-digit **OTP** you receive (demo OTP: `123456`).
5. If it's your first time, fill in your **name, age, and health details**.
6. Tap **"Register"** — you're in!

> **Returning users:** Just enter phone + OTP to log back in.

---

### 4.2 Home Screen Overview

After login, the Home Screen shows:

| Section | Description |
|---|---|
| **Your Token** | Your current queue number and estimated wait time |
| **Upcoming Appointment** | Next scheduled appointment date and time |
| **Quick Actions** | Book, View Queue, My Prescriptions |
| **Sync Status** | Shows if pending offline bookings are synced |

---

### 4.3 Booking an Appointment (UC-01 & UC-02)

**Online Booking:**
1. Tap **"Book Appointment"** on the Home Screen.
2. Select a **Doctor** from the list.
3. Choose a **Date** using the calendar picker.
4. Select an available **Time Slot**.
5. Tap **"Confirm Booking"**.
6. ✅ You'll see a confirmation with your appointment ID.

**Offline Booking (No Internet Needed):**
1. Follow the same steps — the app detects no internet automatically.
2. The booking is saved locally on your device.
3. A 🔄 **"Pending Sync"** badge appears on the home screen.
4. When internet returns, the app syncs automatically within 60 seconds.
5. ✅ Confirmation appears once synced.

---

### 4.4 Viewing Your Queue Token (UC-03)

1. Tap **"My Token"** on the Home Screen.
2. The **Token Status Screen** shows:
   - Your token number (e.g., `T-047`)
   - Patients ahead of you
   - Estimated wait time
   - Doctor name and room number
3. The status updates automatically every 30 seconds.

**Token Statuses:**
| Status | Meaning |
|---|---|
| 🟡 Waiting | You're in the queue |
| 🟢 Your Turn | Please go to the doctor's room |
| ✅ Completed | Your appointment is done |
| 🔴 Missed | You didn't check in when called |

---

### 4.5 GPS Check-In (UC-05)

1. When you physically arrive near the clinic (within 200 metres), a **"Check In Now"** notification appears automatically.
2. Tap it to confirm your arrival.
3. Your token status changes to **"Arrived"** — the doctor's dashboard is updated.

> **Note:** Location permissions must be granted to the app for this feature.

---

### 4.6 Viewing Digital Prescriptions (UC-06)

1. After your appointment, tap **"My Prescriptions"** from the Home Screen.
2. Select the prescription from the list.
3. The prescription shows:
   - Doctor name and date
   - Medicines, dosage, and instructions
   - Follow-up date (if any)
4. Tap **"Download PDF"** to save it.

---

## 5. Doctor / Staff Web Dashboard — User Guide

### 5.1 Logging In

1. Open the web dashboard at `http://localhost:5173` (or open `web-dashboard/index.html`).
2. Enter your **registered phone number**.
3. Tap **"Send OTP"** and enter the 6-digit code (demo: `123456`).
4. ✅ You're redirected to the Dashboard.

---

### 5.2 Dashboard Overview

The left sidebar has these sections:

| Section | Description |
|---|---|
| **Dashboard** | Summary stats — total patients, queue length, appointments today |
| **Queue** | Live patient queue management |
| **Appointments** | View and manage all appointments |
| **Prescriptions** | Issue new digital prescriptions |

---

### 5.3 Managing the Live Queue (UC-03)

1. Click **"Queue"** in the sidebar.
2. The queue shows all patients waiting, in order.
3. Each patient card shows: Token number, Patient name, Wait time, Status.

**To call the next patient:**
- Click the **"Call Next"** button at the top of the queue.
- The current patient's status changes to **"Your Turn"**.
- Their mobile app gets a notification instantly.

**To mark a patient as complete:**
- Click **"Mark Done"** on the patient card.
- Wait times for remaining patients update automatically.

---

### 5.4 Emergency Token Interrupt (UC-04)

1. In the **Queue** section, click the red **"Emergency"** button.
2. Select the patient being added as an emergency.
3. Enter the reason (e.g., "Chest pain").
4. Confirm — the patient is inserted at **position 1** in the queue.
5. All other patients' wait times are updated automatically.

> **Emergency tokens are marked RED** and cannot be manually moved down.

---

### 5.5 Managing Appointments

1. Click **"Appointments"** in the sidebar.
2. You can:
   - **View** all upcoming, past, and pending appointments.
   - **Filter** by date, doctor, or status.
   - **Confirm** or **Cancel** any appointment.
   - **Search** by patient name or phone number.

---

### 5.6 Issuing a Digital Prescription (UC-06)

1. Click **"Prescriptions"** in the sidebar.
2. Select the patient from the list (they must have a completed appointment today).
3. Fill in:
   - **Medicines**: name, dosage, frequency, duration
   - **Instructions**: e.g., "Take after meals"
   - **Follow-up Date** (optional)
   - **Doctor Notes** (optional)
4. Click **"Issue Prescription"**.
5. ✅ The patient's mobile app receives it instantly.

---

## 6. Test Credentials (Demo Mode)

> Use these to test the system. The primary login is phone + password.
> In development the OTP `123456` is also accepted as a shortcut for any
> registered phone — do not rely on that in production.

| Role | Phone Number | Password |
|---|---|---|
| **Patient** | 9876543210 | test123 |
| **Doctor** | 9876543211 | test123 |
| **Admin** | 9876543212 | test123 |

---

## 7. Frequently Asked Questions

**Q: The app says "Cannot connect to server" — what do I do?**
> Make sure the backend is running (`npm start` in the `backend/` folder). Check that it's accessible at `http://localhost:3000/api/health`.

**Q: I don't receive an OTP on my phone.**
> In demo mode, always use `123456` as the OTP. Real SMS is not configured in the demo build.

**Q: My offline booking didn't sync.**
> Check that the backend is running and your device has internet. The app retries every 60 seconds. You can also tap **"Sync Now"** on the home screen.

**Q: GPS check-in isn't triggering.**
> Ensure location permissions are enabled for the app. The geofence is set to 200 metres around coordinates `28.6139°N, 77.2090°E` (New Delhi, demo coordinates).

**Q: The Flutter app crashes on Android emulator.**
> In `frontend/mobile/lib/utils/constants.dart`, change `localhost` to `10.0.2.2` — Android emulators use this address to reach the host machine.

**Q: I get a CORS error in the browser.**
> Open `backend/.env` and add your browser's origin to `CORS_ORIGINS`. The default allows `localhost:5173`, `localhost:5500`, and `localhost:8080`.

---

## 8. Known Limitations

| Limitation | Details |
|---|---|
| OTP is mocked | Real SMS delivery is not configured; demo OTP is always `123456` |
| GPS coordinates are fixed | Geofence is set to New Delhi coordinates for demo purposes |
| Single clinic only | The system manages one clinic in the current version |
| No push notifications | Real-time updates use polling (every 30s) instead of push |
| Android emulator needs manual URL change | `localhost` must be changed to `10.0.2.2` in `constants.dart` |

---

## 9. Contact & Support

| Name | Role | Contact |
|---|---|---|
| Krish Gupta | Lead Developer | github: @KrishG7 |
| Mukul Chauhan | Mobile Developer | @Mukul09800 |
| Amandeep Singh | Web Frontend | @Amandeep-bajwa |
| Himanshu Chhillar | Backend & Testing | @HimanshuChhillar |
| Daksh Dahiya | API & Middleware | @7dxksh7 |
| Yuvraj Dahiya | Database & Models | @yuvrajdahiya01-byte |

**Repository:** https://github.com/KrishG7/smart-clinic-booking
**Issues:** https://github.com/KrishG7/smart-clinic-booking/issues

---

## Appendix A — Installing Prerequisites From Scratch

> **If you have nothing installed**, follow this section for your OS before going to [Section 3](#3-installation--first-time-setup).

---

### A1. Install Git

**Windows:**
1. Download from https://git-scm.com/download/win
2. Run the installer → keep all defaults → click Install
3. Open **Git Bash** (search in Start menu) and verify:
   ```bash
   git --version
   ```

**macOS:**
```bash
# Option 1: Xcode Command Line Tools (easiest)
xcode-select --install

# Option 2: Homebrew
brew install git
```
Verify: `git --version`

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install git -y
git --version
```

---

### A2. Install Node.js (v18+) & npm

**Windows:**
1. Go to https://nodejs.org/
2. Download the **LTS** version (v18 or v20)
3. Run the installer → check "Add to PATH" → Install
4. Open **Command Prompt** and verify:
   ```bash
   node --version
   npm --version
   ```

**macOS:**
```bash
# Option 1: Direct download
# Go to https://nodejs.org/ and download LTS .pkg installer

# Option 2: Homebrew
brew install node@20
```
Verify: `node --version && npm --version`

**Linux (Ubuntu/Debian):**
```bash
# Using NodeSource (recommended — gets latest LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install nodejs -y
node --version
npm --version
```

---

### A3. Install MySQL (v8.0+)

**Windows:**
1. Download **MySQL Installer** from https://dev.mysql.com/downloads/installer/
2. Choose "Developer Default" or "Server only"
3. During setup:
   - Set a **root password** (remember this — you'll need it in `.env`)
   - Keep port as `3306`
   - Select "Start MySQL Server at System Startup"
4. After install, open **MySQL Command Line Client** from Start menu
5. Verify by logging in:
   ```bash
   mysql -u root -p
   ```

**macOS:**
```bash
# Using Homebrew (easiest)
brew install mysql
brew services start mysql

# Set root password
mysql_secure_installation

# Verify
mysql -u root -p
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install mysql-server -y
sudo systemctl start mysql
sudo systemctl enable mysql

# Set root password
sudo mysql_secure_installation

# Verify
sudo mysql -u root -p
```

> **Important:** Remember the root password you set — you'll enter it in the `.env` file later.

---

### A4. Install Flutter SDK (v3.0+) — Only Needed for Mobile App

> **Skip this if you only want to test the web dashboard and backend.**

**Windows:**
1. Download Flutter SDK from https://docs.flutter.dev/get-started/install/windows
2. Extract the zip to `C:\flutter`
3. Add `C:\flutter\bin` to your System PATH:
   - Search "Environment Variables" → System variables → Path → Edit → New → `C:\flutter\bin`
4. Open a **new** Command Prompt and run:
   ```bash
   flutter doctor
   ```
5. Install **Android Studio** from https://developer.android.com/studio
   - During setup, install the Android SDK
   - Open Android Studio → Settings → SDK Manager → Install SDK 33+
   - Open AVD Manager → Create a virtual device (Pixel 5 recommended)

**macOS:**
```bash
# Using Homebrew
brew install --cask flutter

# Or manual download from https://docs.flutter.dev/get-started/install/macos

# Verify
flutter doctor
```
Also install **Xcode** from App Store (for iOS simulator) or **Android Studio** (for Android emulator).

**Linux (Ubuntu/Debian):**
```bash
# Using snap (easiest)
sudo snap install flutter --classic
flutter doctor

# Install Android Studio
sudo snap install android-studio --classic
```
Open Android Studio → SDK Manager → install SDK 33+ → create an emulator.

After installing, run `flutter doctor` and fix any issues it reports.

---

### A5. Quick Verification Checklist

Run these commands to confirm everything is installed:

```bash
git --version        # Should show 2.x+
node --version       # Should show v18.x+ or v20.x+
npm --version        # Should show 9.x+
mysql --version      # Should show 8.x+
flutter --version    # Should show 3.x+ (only if testing mobile)
```

If all ✅, go to [Section 3 — Installation & First-Time Setup](#3-installation--first-time-setup).

---

*Wait Zero — Smart Clinic Booking | Version 1.0.0*
