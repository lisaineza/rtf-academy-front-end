# RTF Academy - Full Stack Setup Guide

## Overview
This guide walks you through setting up both the Django backend and the React frontend for local development and connecting them together.

## Prerequisites
- **Python 3.x** (for backend)
- **Node.js 16+** (for frontend)
- **PostgreSQL** (for database)
- **Git**

---

## Part 1: Backend Setup (Django)

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Create Virtual Environment
**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables
The `.env` file has already been created. Update it with your local settings:

```env
# Django Settings
SECRET_KEY=django-insecure-your-secret-key-change-this-in-production
DEBUG=True
ALLOWED_HOSTS=127.0.0.1,localhost

# Database Configuration (update with your PostgreSQL credentials)
DATABASE_URL=postgres://rtf_admin:supersecretpassword@localhost:5432/rtf_db

# Firebase (obtain from Firebase Console)
FIREBASE_CREDENTIALS_PATH=firebase-credentials.json
```

**Important:** Update the `DATABASE_URL` to match your PostgreSQL configuration.

### 5. Setup PostgreSQL Database
```bash
# Make sure PostgreSQL is running, then create the database
psql -U postgres
```

```sql
-- In PostgreSQL terminal
CREATE DATABASE rtf_db;
CREATE USER rtf_admin WITH PASSWORD 'supersecretpassword';
ALTER ROLE rtf_admin SET client_encoding TO 'utf8';
ALTER ROLE rtf_admin SET default_transaction_isolation TO 'read committed';
ALTER ROLE rtf_admin SET default_transaction_deferrable TO on;
ALTER ROLE rtf_admin SET default_transaction_read_committed TO on;
ALTER ROLE rtf_admin SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE rtf_db TO rtf_admin;
\q
```

### 6. Run Database Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### 7. (Optional) Seed Database with Mock Data
```bash
python manage.py loaddata rtf_master_seed.json
```

Or follow the [Database Seeding Guide](database_Seeding_guide.md).

### 8. Create Superuser for Django Admin
```bash
python manage.py createsuperuser
```

### 9. Start the Backend Server
```bash
python manage.py runserver
```

The backend will be available at: **http://localhost:8000/api/**

---

## Part 2: Frontend Setup (React)

### 1. Navigate to Frontend Directory
```bash
cd rtf-academy
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
The `.env` file has already been created with the local backend URL. Verify it looks like:

```env
# --- Backend API ---
# Local backend
VITE_API_BASE_URL=http://localhost:8000/api

# --- Firebase Configuration ---
VITE_FIREBASE_API_KEY=your_firebase_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id

# --- Firebase Credentials & Database ---
FIREBASE_CREDENTIALS_PATH=firebase-credentials.json
DATABASE_URL=postgres://rtf_admin:supersecretpassword@localhost:5432/rtf_db
```

### 4. Start the Frontend Development Server
```bash
npm run dev
```

The frontend will be available at: **http://localhost:5174/**

---

## Part 3: Verify Connection

### Step 1: Check Backend is Running
Open your browser and visit:
```
http://localhost:8000/api/courses/
```

You should see a JSON response with the courses list.

### Step 2: Check Frontend is Running
Open your browser and visit:
```
http://localhost:5174/
```

You should see the RTF Academy homepage.

### Step 3: Test API Connection from Frontend
1. Go to **http://localhost:5174/courses** 
2. Open your browser's Developer Tools (F12)
3. Check the Network tab for API requests to `http://localhost:8000/api/courses/`
4. Verify responses are received without CORS errors

---

## API Endpoint Mapping

### Authentication & Users
```
GET  /api/users/me/             - Get current user profile (requires token)
POST /api/auth/register/        - Register new user
POST /api/auth/login/           - Login user
```

### Courses & Lessons
```
GET  /api/courses/              - List all published courses
GET  /api/courses/{id}/         - Get course details (UUID format)
GET  /api/courses/lessons/{id}/ - Get lesson details (UUID format)
```

### Enrollments & Progress
```
GET  /api/enrollments/          - List user's enrollments
POST /api/enrollments/          - Enroll in a course
GET  /api/enrollments/{id}/     - Get enrollment details

POST /api/progress/lesson/      - Complete lesson
GET  /api/progress/course/{id}/ - Get course progress
```

### Assessments & Certificates
```
GET  /api/assessments/module/{id}/        - Get module assessment/quiz
POST /api/assessments/{id}/submit/        - Submit assessment answers

POST /api/certificates/generate/{id}/    - Generate certificate
GET  /api/certificates/my/               - Get user's certificates
GET  /api/certificates/verify/{code}/    - Verify certificate code
```

### Admin
```
GET  /api/admin/stats/          - Get admin dashboard statistics
```

---

## Common Issues & Troubleshooting

### CORS Error
**Problem:** `Access to XMLHttpRequest blocked by CORS policy`

**Solution:** 
- Verify backend is running on `http://localhost:8000`
- Check `CORS_ALLOWED_ORIGINS` in `backend/core/settings.py` includes `http://localhost:5174`
- Clear browser cache and refresh

### Database Connection Error
**Problem:** `psycopg2.OperationalError: could not connect to server`

**Solution:**
- Verify PostgreSQL is running
- Check `DATABASE_URL` in `.env` matches your PostgreSQL setup
- Ensure database and user exist: `psql -l`

### Firebase Authentication Error
**Problem:** `Firebase configuration not found`

**Solution:**
- Download Firebase credentials JSON from Firebase Console
- Place it in backend root directory as `firebase-credentials.json`
- Ensure `FIREBASE_CREDENTIALS_PATH` points to the correct location

### Port Already in Use
**Problem:** `Port 8000 (or 5174) is already in use`

**Solution:**
```bash
# Backend (use different port)
python manage.py runserver 8001

# Frontend (Vite auto-selects next available port)
npm run dev -- --port 5175
```

---

## Running Both Services

### Option 1: Two Terminal Windows
**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python manage.py runserver
```

**Terminal 2 - Frontend:**
```bash
cd rtf-academy
npm run dev
```

### Option 2: Using Process Manager
Install `concurrently` (optional):
```bash
npm install -D concurrently
```

Create scripts in root `package.json` if needed.

---

## Next Steps

1. **Configure Firebase:** 
   - Create Firebase project and download credentials
   - Add credentials to both backend and frontend

2. **Database Seeding:**
   - Run `python manage.py loaddata rtf_master_seed.json` to populate sample courses

3. **Admin Dashboard:**
   - Visit `http://localhost:8000/admin/` with superuser credentials

4. **Testing:**
   - Register a new account at `http://localhost:5174/register`
   - Enroll in a course from the course catalog
   - Track your learning progress

---

## Additional Documentation

- Backend Setup: [backend/initial_setup.md](backend/initial_setup.md)
- Database Seeding: [backend/database_Seeding_guide.md](backend/database_Seeding_guide.md)
- Deployment Architecture: [backend/CI_CD__deployment_architecture.md](backend/CI_CD__deployment_architecture.md)

---

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review backend logs in terminal
3. Check browser console (F12) for frontend errors
4. Verify .env files are properly configured
