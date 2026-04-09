# School Management Dashboard (MERN STACK)

A full-stack school administration dashboard built with MongoDB, Express, React, and Node.js.

## Features

- JWT-based login and admin authentication
- Role-based access control (admin, staff)
- Student CRUD (add, edit, delete)
- Student search and class/section filters
- Attendance marking and date-wise filtering
- Fee records with payment status (Paid, Partial, Unpaid)
- Pagination on student, attendance and fee listings
- Dark mode toggle
- Dashboard summary cards
- Responsive UI

## Project Structure

```bash
school-management-dashboard/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── attendanceController.js
│   │   ├── feeController.js
│   │   └── studentController.js
│   ├── models/
│   │   ├── Attendance.js
│   │   ├── Fee.js
│   │   └── Student.js
│   ├── routes/
│   │   ├── attendanceRoutes.js
│   │   ├── feeRoutes.js
│   │   └── studentRoutes.js
│   ├── .env
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js
│   │   ├── components/
│   │   │   ├── Layout.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Topbar.jsx
│   │   │   ├── StudentForm.jsx
│   │   │   ├── AttendanceForm.jsx
│   │   │   └── FeeForm.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Students.jsx
│   │   │   ├── Attendance.jsx
│   │   │   └── Fees.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   └── package.json
└── README.md
```

## Run Locally

1. Start backend

```bash
cd backend
npm install
npm run dev
```

2. Start frontend (new terminal)

```bash
cd frontend
npm install
npm run dev
```

3. Ensure MongoDB is running locally.

Backend .env:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/school_management_dashboard
JWT_SECRET=your_strong_secret
JWT_EXPIRES_IN=1d
ADMIN_NAME=School Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
```

When backend starts, the default admin user is created automatically if it does not already exist.

## Resume Description

**School Management Dashboard | MERN Stack**  
Built a responsive full-stack school administration dashboard using MongoDB, Express.js, React, and Node.js. Implemented student record management, attendance tracking, fee collection monitoring, dashboard summaries, filtering, and CRUD operations for efficient academic administration.
