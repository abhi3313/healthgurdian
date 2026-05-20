# HealthGuardian Frontend

React, Vite, Tailwind CSS, and Framer Motion frontend for HealthGuardian.

## Quick Start

```bash
npm install
npm run dev
```

The app uses `/api` by default, which Vite proxies to the backend configured in `vite.config.js`.

## Authentication

- JWT is stored in `localStorage` as `hg_token`.
- The user object is stored as `hg_user`.
- Axios attaches `Authorization: Bearer <token>` automatically.
- Login, registration, Google sign-in, and OTP login use real backend auth endpoints.

## Main Routes

| Path | Role | Page |
| --- | --- | --- |
| `/login` | Public | Login |
| `/register` | Public | Register |
| `/patient` | Patient | Patient Dashboard |
| `/patient/records` | Patient | My Records |
| `/patient/upload` | Patient | Upload Report |
| `/doctor` | Doctor | Doctor Dashboard |
| `/doctor/patients` | Doctor | Patient List |
| `/doctor/appointments` | Doctor | Appointments |
| `/admin` | Admin | Admin Panel |
| `/ai-chat` | Authenticated | AI Chat |

## API Services

- `src/services/api.js` provides the Axios client.
- `src/services/authService.js` handles auth helper calls.
- `src/services/patientService.js` handles patient routes.
- `src/services/doctorService.js` handles doctor routes.
- `src/services/adminService.js` handles admin routes.

## Build

```bash
npm run build
```
