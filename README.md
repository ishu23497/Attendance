# FutureDesk Attendance System
.
A professional Attendance Management System UI built with React, Tailwind CSS, and Vite.

## Tech Stack
- React (Vite)
- Tailwind CSS
- React Router DOM
- Lucide React (Icons)

## Features
- **Admin Dashboard**: View all employee attendance records and summary stats.
- **Employee Dashboard**: Mark Check-in and Check-out times.
- **Automated Status**: Automatically marks "Late" if checked in after 10:00 AM.
- **Data Persistence**: Uses `localStorage` to save records (simulated backend).

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run the Project**
   ```bash
   npm run dev
   ```

## Demo Credentials

| Role     | Email                  | Password |
|----------|------------------------|----------|
| **Admin**    | `admin@futuredesk.com` |     |
| **Employee** | `john@futuredesk.com`  |     |

## Project Structure
- `src/components`: Reusable UI components (Sidebar, Navbar, Cards)
- `src/pages`: Main application pages (Login, Dashboards)
- `src/utils`: Mock logic for attendance and authentication
