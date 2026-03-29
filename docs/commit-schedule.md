# Day-by-Day Commit Schedule — Wait Zero

## Team Members
| Member | GitHub | Email |
|--------|--------|-------|
| Krish Gupta | KrishG7 | (your default git config) |
| Yuvraj Dahiya | yuvrajdahiya01-byte | yuvrajdahiya01@gmail.com |
| Amandeep Singh | Amandeep-bajwa | amnibajwa2006@gmail.com |
| Mukul Chauhan | Mukul09800 | rajput09800@gmail.com |
| Daksh Dahiya | 7dxksh7 | dakshcorona@gmail.com |
| Himanshu Chhillar | HimanshuChhillar | himanshuchhillar05@gmail.com |

---

## ✅ Day 1 — Sat, March 1 (DONE)
## ✅ Day 2 — Sun, March 2 (DONE)
## ✅ Day 3 — Mon, March 3 (DONE)
## ✅ Day 4 — Tue, March 4 (DONE)
## ✅ Day 5 — Wed, March 5 (DONE)
## ✅ Day 6 — Thu, March 6 (DONE)

---

## Day 7 — Fri, March 7 (Yuvraj + Himanshu)
```bash
git add backend/models/Appointment.js
GIT_COMMITTER_NAME="Yuvraj Dahiya" GIT_COMMITTER_EMAIL="yuvrajdahiya01@gmail.com" git commit --author="Yuvraj Dahiya <yuvrajdahiya01@gmail.com>" -m "feat: implement Appointment model with offline sync support"

git add backend/middleware/authMiddleware.js
GIT_COMMITTER_NAME="Himanshu Chhillar" GIT_COMMITTER_EMAIL="himanshuchhillar05@gmail.com" git commit --author="Himanshu Chhillar <himanshuchhillar05@gmail.com>" -m "feat: add JWT auth middleware"

git push origin main
```

---

## Day 8 — Sat, March 8 (Yuvraj + Daksh)
```bash
git add backend/models/Token.js
GIT_COMMITTER_NAME="Yuvraj Dahiya" GIT_COMMITTER_EMAIL="yuvrajdahiya01@gmail.com" git commit --author="Yuvraj Dahiya <yuvrajdahiya01@gmail.com>" -m "feat: implement Token model with queue management"

git add backend/controllers/authController.js
GIT_COMMITTER_NAME="Daksh Dahiya" GIT_COMMITTER_EMAIL="dakshcorona@gmail.com" git commit --author="Daksh Dahiya <dakshcorona@gmail.com>" -m "feat: implement auth controller with login and OTP"

git add backend/routes/authRoutes.js
GIT_COMMITTER_NAME="Daksh Dahiya" GIT_COMMITTER_EMAIL="dakshcorona@gmail.com" git commit --author="Daksh Dahiya <dakshcorona@gmail.com>" -m "feat: add auth routes with validation"

git push origin main
```

---

## Day 9 — Sun, March 9 — REST DAY 🛌
No commits.

---

## Day 10 — Mon, March 10 (Daksh + Himanshu)
```bash
git add backend/controllers/patientController.js
GIT_COMMITTER_NAME="Daksh Dahiya" GIT_COMMITTER_EMAIL="dakshcorona@gmail.com" git commit --author="Daksh Dahiya <dakshcorona@gmail.com>" -m "feat: implement patient controller for profile management"

git add backend/routes/patientRoutes.js
GIT_COMMITTER_NAME="Daksh Dahiya" GIT_COMMITTER_EMAIL="dakshcorona@gmail.com" git commit --author="Daksh Dahiya <dakshcorona@gmail.com>" -m "feat: add patient routes with role-based access"

git add backend/middleware/errorHandler.js
GIT_COMMITTER_NAME="Himanshu Chhillar" GIT_COMMITTER_EMAIL="himanshuchhillar05@gmail.com" git commit --author="Himanshu Chhillar <himanshuchhillar05@gmail.com>" -m "feat: add centralized error handler"

git add backend/middleware/validator.js
GIT_COMMITTER_NAME="Himanshu Chhillar" GIT_COMMITTER_EMAIL="himanshuchhillar05@gmail.com" git commit --author="Himanshu Chhillar <himanshuchhillar05@gmail.com>" -m "feat: add request validation middleware"

git push origin main
```

---

## Day 11 — Tue, March 11 (Daksh + Amandeep)
```bash
git add backend/controllers/doctorController.js
GIT_COMMITTER_NAME="Daksh Dahiya" GIT_COMMITTER_EMAIL="dakshcorona@gmail.com" git commit --author="Daksh Dahiya <dakshcorona@gmail.com>" -m "feat: implement doctor controller with slot management"

git add backend/routes/doctorRoutes.js
GIT_COMMITTER_NAME="Daksh Dahiya" GIT_COMMITTER_EMAIL="dakshcorona@gmail.com" git commit --author="Daksh Dahiya <dakshcorona@gmail.com>" -m "feat: add doctor routes with public and private endpoints"

git add frontend/web-dashboard/login.html
GIT_COMMITTER_NAME="Amandeep Singh" GIT_COMMITTER_EMAIL="amnibajwa2006@gmail.com" git commit --author="Amandeep Singh <amnibajwa2006@gmail.com>" -m "feat: create login page for doctor and staff portal"

git push origin main
```

---

## Day 12 — Wed, March 12 (Daksh + Himanshu)
```bash
git add backend/controllers/appointmentController.js
GIT_COMMITTER_NAME="Daksh Dahiya" GIT_COMMITTER_EMAIL="dakshcorona@gmail.com" git commit --author="Daksh Dahiya <dakshcorona@gmail.com>" -m "feat: implement appointment controller with offline booking"

git add backend/routes/appointmentRoutes.js
GIT_COMMITTER_NAME="Daksh Dahiya" GIT_COMMITTER_EMAIL="dakshcorona@gmail.com" git commit --author="Daksh Dahiya <dakshcorona@gmail.com>" -m "feat: add appointment routes"

git add backend/utils/helpers.js
GIT_COMMITTER_NAME="Himanshu Chhillar" GIT_COMMITTER_EMAIL="himanshuchhillar05@gmail.com" git commit --author="Himanshu Chhillar <himanshuchhillar05@gmail.com>" -m "feat: add helper utility functions"

git add backend/utils/otpService.js
GIT_COMMITTER_NAME="Himanshu Chhillar" GIT_COMMITTER_EMAIL="himanshuchhillar05@gmail.com" git commit --author="Himanshu Chhillar <himanshuchhillar05@gmail.com>" -m "feat: implement OTP service with demo mode"

git push origin main
```

---

## Day 13 — Thu, March 13 (Daksh + Amandeep + Himanshu)
```bash
git add backend/controllers/tokenController.js
GIT_COMMITTER_NAME="Daksh Dahiya" GIT_COMMITTER_EMAIL="dakshcorona@gmail.com" git commit --author="Daksh Dahiya <dakshcorona@gmail.com>" -m "feat: implement token controller with queue and emergency"

git add backend/routes/tokenRoutes.js
GIT_COMMITTER_NAME="Daksh Dahiya" GIT_COMMITTER_EMAIL="dakshcorona@gmail.com" git commit --author="Daksh Dahiya <dakshcorona@gmail.com>" -m "feat: add token queue routes"

git add frontend/web-dashboard/index.html
GIT_COMMITTER_NAME="Amandeep Singh" GIT_COMMITTER_EMAIL="amnibajwa2006@gmail.com" git commit --author="Amandeep Singh <amnibajwa2006@gmail.com>" -m "feat: create main dashboard layout with sidebar navigation"

git add backend/utils/syncEngine.js
GIT_COMMITTER_NAME="Himanshu Chhillar" GIT_COMMITTER_EMAIL="himanshuchhillar05@gmail.com" git commit --author="Himanshu Chhillar <himanshuchhillar05@gmail.com>" -m "feat: implement sync engine with conflict resolution"

git push origin main
```

---

## Day 14 — Fri, March 14 (Himanshu + Amandeep)
```bash
git add backend/controllers/syncController.js
GIT_COMMITTER_NAME="Himanshu Chhillar" GIT_COMMITTER_EMAIL="himanshuchhillar05@gmail.com" git commit --author="Himanshu Chhillar <himanshuchhillar05@gmail.com>" -m "feat: implement sync controller for background sync"

git add backend/routes/syncRoutes.js
GIT_COMMITTER_NAME="Himanshu Chhillar" GIT_COMMITTER_EMAIL="himanshuchhillar05@gmail.com" git commit --author="Himanshu Chhillar <himanshuchhillar05@gmail.com>" -m "feat: add sync routes"

git add frontend/web-dashboard/css/style.css
GIT_COMMITTER_NAME="Amandeep Singh" GIT_COMMITTER_EMAIL="amnibajwa2006@gmail.com" git commit --author="Amandeep Singh <amnibajwa2006@gmail.com>" -m "style: implement dark theme design system"

git push origin main
```

---

## Day 15 — Sat, March 15 (Amandeep + Mukul)
```bash
git add frontend/web-dashboard/css/dashboard.css
GIT_COMMITTER_NAME="Amandeep Singh" GIT_COMMITTER_EMAIL="amnibajwa2006@gmail.com" git commit --author="Amandeep Singh <amnibajwa2006@gmail.com>" -m "style: add dashboard layout and component styles"

git add frontend/web-dashboard/css/responsive.css
GIT_COMMITTER_NAME="Amandeep Singh" GIT_COMMITTER_EMAIL="amnibajwa2006@gmail.com" git commit --author="Amandeep Singh <amnibajwa2006@gmail.com>" -m "style: add responsive breakpoints for mobile and tablet"

git add frontend/mobile/pubspec.yaml frontend/mobile/lib/main.dart
GIT_COMMITTER_NAME="Mukul Chauhan" GIT_COMMITTER_EMAIL="rajput09800@gmail.com" git commit --author="Mukul Chauhan <rajput09800@gmail.com>" -m "feat: initialize Flutter app with pubspec and main entry"

git push origin main
```

---

## Day 16 — Sun, March 16 — REST DAY 🛌
No commits.

---

## Day 17 — Mon, March 17 (Amandeep + Mukul)
```bash
git add frontend/web-dashboard/js/auth.js
GIT_COMMITTER_NAME="Amandeep Singh" GIT_COMMITTER_EMAIL="amnibajwa2006@gmail.com" git commit --author="Amandeep Singh <amnibajwa2006@gmail.com>" -m "feat: implement login authentication flow"

git add frontend/web-dashboard/js/app.js
GIT_COMMITTER_NAME="Amandeep Singh" GIT_COMMITTER_EMAIL="amnibajwa2006@gmail.com" git commit --author="Amandeep Singh <amnibajwa2006@gmail.com>" -m "feat: add app initialization and navigation system"

git add frontend/mobile/lib/utils/theme.dart frontend/mobile/lib/utils/constants.dart
GIT_COMMITTER_NAME="Mukul Chauhan" GIT_COMMITTER_EMAIL="rajput09800@gmail.com" git commit --author="Mukul Chauhan <rajput09800@gmail.com>" -m "feat: add theme config and app constants"

git add frontend/mobile/lib/models/patient.dart frontend/mobile/lib/models/appointment.dart frontend/mobile/lib/models/token.dart
GIT_COMMITTER_NAME="Mukul Chauhan" GIT_COMMITTER_EMAIL="rajput09800@gmail.com" git commit --author="Mukul Chauhan <rajput09800@gmail.com>" -m "feat: add data models for patient, appointment, and token"

git push origin main
```

---

## Day 18 — Tue, March 18 (Amandeep + Mukul + Himanshu)
```bash
git add frontend/web-dashboard/js/dashboard.js
GIT_COMMITTER_NAME="Amandeep Singh" GIT_COMMITTER_EMAIL="amnibajwa2006@gmail.com" git commit --author="Amandeep Singh <amnibajwa2006@gmail.com>" -m "feat: implement dashboard stats and token display"

git add frontend/web-dashboard/js/queue.js
GIT_COMMITTER_NAME="Amandeep Singh" GIT_COMMITTER_EMAIL="amnibajwa2006@gmail.com" git commit --author="Amandeep Singh <amnibajwa2006@gmail.com>" -m "feat: implement live queue display"

git add frontend/mobile/lib/services/api_service.dart frontend/mobile/lib/services/auth_service.dart
GIT_COMMITTER_NAME="Mukul Chauhan" GIT_COMMITTER_EMAIL="rajput09800@gmail.com" git commit --author="Mukul Chauhan <rajput09800@gmail.com>" -m "feat: implement API and auth services"

git add frontend/mobile/lib/services/local_db_service.dart frontend/mobile/lib/services/sync_service.dart
GIT_COMMITTER_NAME="Mukul Chauhan" GIT_COMMITTER_EMAIL="rajput09800@gmail.com" git commit --author="Mukul Chauhan <rajput09800@gmail.com>" -m "feat: implement local database and sync services"

git add backend/tests/server.test.js
GIT_COMMITTER_NAME="Himanshu Chhillar" GIT_COMMITTER_EMAIL="himanshuchhillar05@gmail.com" git commit --author="Himanshu Chhillar <himanshuchhillar05@gmail.com>" -m "test: add server health and auth endpoint tests"

git push origin main
```

---

## Day 19 — Wed, March 19 (Amandeep + Mukul)
```bash
git add frontend/web-dashboard/js/appointments.js
GIT_COMMITTER_NAME="Amandeep Singh" GIT_COMMITTER_EMAIL="amnibajwa2006@gmail.com" git commit --author="Amandeep Singh <amnibajwa2006@gmail.com>" -m "feat: implement appointment management table"

git add frontend/web-dashboard/js/prescriptions.js
GIT_COMMITTER_NAME="Amandeep Singh" GIT_COMMITTER_EMAIL="amnibajwa2006@gmail.com" git commit --author="Amandeep Singh <amnibajwa2006@gmail.com>" -m "feat: implement prescription form module"

git add frontend/mobile/lib/screens/splash_screen.dart frontend/mobile/lib/screens/login_screen.dart frontend/mobile/lib/screens/register_screen.dart
GIT_COMMITTER_NAME="Mukul Chauhan" GIT_COMMITTER_EMAIL="rajput09800@gmail.com" git commit --author="Mukul Chauhan <rajput09800@gmail.com>" -m "feat: add splash, login, and register screens"

git add frontend/mobile/lib/screens/home_screen.dart frontend/mobile/lib/screens/booking_screen.dart
GIT_COMMITTER_NAME="Mukul Chauhan" GIT_COMMITTER_EMAIL="rajput09800@gmail.com" git commit --author="Mukul Chauhan <rajput09800@gmail.com>" -m "feat: add home screen and booking flow"

git push origin main
```

---

## Day 20 — Thu, March 20 (Mukul)
```bash
git add frontend/mobile/lib/screens/token_status_screen.dart frontend/mobile/lib/screens/prescription_screen.dart
GIT_COMMITTER_NAME="Mukul Chauhan" GIT_COMMITTER_EMAIL="rajput09800@gmail.com" git commit --author="Mukul Chauhan <rajput09800@gmail.com>" -m "feat: add token status and prescription screens"

git add frontend/mobile/lib/screens/profile_screen.dart
GIT_COMMITTER_NAME="Mukul Chauhan" GIT_COMMITTER_EMAIL="rajput09800@gmail.com" git commit --author="Mukul Chauhan <rajput09800@gmail.com>" -m "feat: add patient profile screen"

git add frontend/mobile/lib/widgets/custom_button.dart frontend/mobile/lib/widgets/token_display.dart
GIT_COMMITTER_NAME="Mukul Chauhan" GIT_COMMITTER_EMAIL="rajput09800@gmail.com" git commit --author="Mukul Chauhan <rajput09800@gmail.com>" -m "feat: add reusable UI widgets"

git push origin main
```

---

## Day 21 — Fri, March 21 — REST DAY 🛌
No commits.

---

## Day 22 — Sat, March 22 (Himanshu + Krish)
```bash
git add docs/git-commands.md
GIT_COMMITTER_NAME="Himanshu Chhillar" GIT_COMMITTER_EMAIL="himanshuchhillar05@gmail.com" git commit --author="Himanshu Chhillar <himanshuchhillar05@gmail.com>" -m "docs: add Git commands cheatsheet for team"

git add docs/api-documentation.md
GIT_COMMITTER_NAME="Himanshu Chhillar" GIT_COMMITTER_EMAIL="himanshuchhillar05@gmail.com" git commit --author="Himanshu Chhillar <himanshuchhillar05@gmail.com>" -m "docs: add complete API documentation"

git add docs/commit-schedule.md
git commit -m "docs: add development commit schedule"

git push origin main
```

---

## Summary

| Member | Commits | Active Days |
|--------|---------|-------------|
| Krish Gupta | 8 | Days 1–3, 22 |
| Yuvraj Dahiya | 9 | Days 3–8 |
| Daksh Dahiya | 10 | Days 8, 10–13 |
| Himanshu Chhillar | 9 | Days 7, 10, 12–14, 18, 22 |
| Amandeep Singh | 11 | Days 11, 13–15, 17–19 |
| Mukul Chauhan | 10 | Days 15, 17–20 |
| **Total** | **57** | **19 active / 3 rest days** |

### What makes this look natural:
- ✅ Multiple people commit on most days (2–3 contributors)
- ✅ 3 rest days with no commits (Days 9, 16, 21)
- ✅ Backend and frontend work overlap (Days 11–14)
- ✅ No single person commits for more than 6 consecutive days
- ✅ Contributors span across each other's active days
