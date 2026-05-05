# HealthGuardian – Frontend

Personal Health Management System built with React + Tailwind CSS + Framer Motion.

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev
```

App runs at: http://localhost:3000  
Backend expected at: http://localhost:5000/api/

---

## 📁 Folder Structure

```
src/
├── main.jsx                  # Entry point
├── App.jsx                   # Router & route guards
├── index.css                 # Global styles + design system
│
├── context/
│   └── AuthContext.jsx       # JWT auth state (login/register/logout)
│
├── services/
│   ├── api.js                # Axios base instance + interceptors
│   ├── authService.js        # /auth/* endpoints
│   ├── patientService.js     # /patient/* endpoints
│   ├── doctorService.js      # /doctor/* endpoints
│   ├── adminService.js       # /admin/* endpoints
│   └── aiService.js          # /ai/* endpoints
│
├── utils/
│   ├── constants.js          # Enums, options, ranges
│   └── helpers.js            # Date formatting, avatar, status utils
│
├── components/
│   ├── common/
│   │   ├── DashboardLayout.jsx  # Sidebar + TopBar + Outlet wrapper
│   │   ├── Sidebar.jsx          # Role-based sidebar navigation
│   │   ├── TopBar.jsx           # Header with greeting + search
│   │   ├── StatCard.jsx         # Animated stat card
│   │   └── LoadingSpinner.jsx   # Spinner, FullPageLoader, Skeleton
│   └── ui/
│       └── Modal.jsx            # Animated modal dialog
│
└── pages/
    ├── auth/
    │   ├── Login.jsx            # Login with demo credentials
    │   └── Register.jsx         # 2-step registration
    ├── patient/
    │   ├── PatientDashboard.jsx # Vitals, charts, appointments
    │   ├── MyRecords.jsx        # CRUD health records
    │   └── UploadReport.jsx     # Drag & drop file upload
    ├── doctor/
    │   ├── DoctorDashboard.jsx  # Stats, schedule, patients
    │   └── PatientList.jsx      # Patient cards + detail modal
    ├── admin/
    │   └── AdminPanel.jsx       # User management, system health
    └── ai/
        └── AIChat.jsx           # Full AI chat interface
```

---

## 🔑 Authentication

- JWT stored in `localStorage` as `hg_token`
- User object stored as `hg_user`
- Axios interceptor auto-attaches `Authorization: Bearer <token>`
- 401 response auto-redirects to `/login`

---

## 🧭 Routes

| Path              | Role    | Page                |
|-------------------|---------|---------------------|
| `/login`          | Public  | Login               |
| `/register`       | Public  | Register            |
| `/patient`        | Patient | Patient Dashboard   |
| `/patient/records`| Patient | My Records          |
| `/patient/upload` | Patient | Upload Report       |
| `/patient/ai-chat`| Patient | AI Chat             |
| `/doctor`         | Doctor  | Doctor Dashboard    |
| `/doctor/patients`| Doctor  | Patient List        |
| `/doctor/ai-chat` | Doctor  | AI Chat             |
| `/admin`          | Admin   | Admin Panel         |
| `/admin/ai-chat`  | Admin   | AI Chat             |

---

## 🎨 Design System

| Token         | Value       |
|---------------|-------------|
| Base bg       | `#0f1623`   |
| Card bg       | `#151e2e`   |
| Border        | `#1e2d42`   |
| Primary       | `#3897f0`   |
| Accent        | `#00e5c3`   |
| Success       | `#2dce89`   |
| Danger        | `#f5365c`   |
| Warning       | `#fb8c00`   |
| Font Display  | Syne        |
| Font Body     | Plus Jakarta Sans |
| Font Mono     | JetBrains Mono |

---

## 📡 API Endpoints Used

| Method | Endpoint                    | Purpose               |
|--------|-----------------------------|-----------------------|
| POST   | `/auth/login`               | Login                 |
| POST   | `/auth/register`            | Register              |
| GET    | `/patient/dashboard`        | Patient dashboard     |
| GET    | `/patient/records`          | Get records           |
| POST   | `/patient/records`          | Add record            |
| PUT    | `/patient/records/:id`      | Update record         |
| DELETE | `/patient/records/:id`      | Delete record         |
| POST   | `/patient/reports/upload`   | Upload file           |
| GET    | `/doctor/dashboard`         | Doctor dashboard      |
| GET    | `/doctor/patients`          | Patient list          |
| GET    | `/doctor/patients/:id/records` | Patient records    |
| GET    | `/admin/stats`              | Admin statistics      |
| GET    | `/admin/users`              | User list             |
| POST   | `/admin/users`              | Create user           |
| DELETE | `/admin/users/:id`          | Delete user           |
| PATCH  | `/admin/users/:id/toggle-status` | Toggle status   |
| POST   | `/ai/query`                 | AI chat query         |

---

## 📦 Dependencies

- **react** + **react-dom** – UI
- **react-router-dom** – Routing
- **axios** – API calls
- **framer-motion** – Animations
- **@tanstack/react-query** – Data fetching + caching
- **recharts** – Charts
- **react-hot-toast** – Notifications
- **react-icons** – Icons
- **clsx** – Conditional classes
- **date-fns** – Date formatting
- **tailwindcss** – Styling
