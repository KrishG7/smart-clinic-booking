# API Documentation — Smart Clinic Booking

## Base URL
```
http://localhost:3000/api
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Auth Endpoints

### POST /api/auth/register
Register a new user.
```json
{
  "name": "Rahul Sharma",
  "phone": "9876543210",
  "email": "rahul@example.com",
  "password": "mypassword",
  "role": "patient"
}
```

### POST /api/auth/login
Login with phone and password.
```json
{
  "phone": "9876543210",
  "password": "mypassword"
}
```

### POST /api/auth/send-otp
Send OTP for verification.
```json
{
  "phone": "9876543210",
  "purpose": "login"
}
```

### POST /api/auth/verify-otp
Verify OTP and login. Demo OTP: `123456`
```json
{
  "phone": "9876543210",
  "otp": "123456"
}
```

### GET /api/auth/me 🔒
Get current user profile.

---

## Doctor Endpoints

### GET /api/doctors
Get all available doctors. Supports filter: `?specialization=General Medicine`

### GET /api/doctors/:id
Get doctor profile by ID.

### GET /api/doctors/:id/slots?date=2025-03-15
Get available appointment slots for a doctor on a specific date.

### GET /api/doctors/specializations
Get list of all specializations.

---

## Appointment Endpoints 🔒

### POST /api/appointments
Book a new appointment.
```json
{
  "doctorId": 1,
  "appointmentDate": "2025-03-15",
  "appointmentTime": "09:00:00",
  "type": "regular",
  "reason": "General checkup",
  "localId": "local_123456789"
}
```

### GET /api/appointments/my
Get logged-in patient's appointments. Filter: `?status=booked`

### GET /api/appointments/doctor/:doctorId?date=2025-03-15
Get doctor's appointments for a date. (Doctor/Staff only)

### PATCH /api/appointments/:id/status
Update appointment status. (Doctor/Staff only)
```json
{
  "status": "completed",
  "notes": "Prescription issued"
}
```

### DELETE /api/appointments/:id
Cancel an appointment.

---

## Token Queue Endpoints 🔒

### GET /api/tokens/queue/:doctorId
Get live queue for a doctor.

### GET /api/tokens/my
Get patient's tokens for today.

### POST /api/tokens/next
Call next patient. (Doctor/Staff only)
```json
{ "doctorId": 1 }
```

### POST /api/tokens/emergency
Emergency interrupt — inserts at top of queue. (Doctor/Staff only)
```json
{
  "doctorId": 1,
  "patientId": 1
}
```

### POST /api/tokens/:id/checkin
Patient GPS check-in.
```json
{
  "latitude": 28.6139,
  "longitude": 77.2090
}
```

### POST /api/tokens/:id/skip
Skip a token. (Doctor/Staff only)

---

## Sync Endpoints 🔒

### POST /api/sync/push
Push offline data to server.
```json
{
  "deviceId": "flutter_mobile",
  "appointments": [
    {
      "localId": "local_123",
      "patientId": 1,
      "doctorId": 1,
      "appointmentDate": "2025-03-15",
      "appointmentTime": "09:00:00",
      "type": "regular"
    }
  ]
}
```

### GET /api/sync/pull?since=2025-03-15T00:00:00
Pull server data since timestamp.

### GET /api/sync/status
Get sync status and recent logs.

---

## Test Credentials

| Role    | Phone       | Password |
|---------|-------------|----------|
| Patient | 9876543210  | test123  |
| Doctor  | 9876543211  | test123  |
| Admin   | 9876543212  | test123  |

**Demo OTP:** `123456` (works for all numbers in development mode)
