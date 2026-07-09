# Frontend-Backend Connection Status Guide

## Connection Verification Checklist

### 1. Backend Service Status
- [ ] Backend running on `http://localhost:8000`
  - Command: `python manage.py runserver`
  - Expected: Django development server starts without errors

- [ ] Database connected
  - Check terminal for: "Starting development server at..."
  - Not: "OperationalError: could not connect to server"

- [ ] CORS enabled
  - Check: `backend/core/settings.py` includes your frontend port in `CORS_ALLOWED_ORIGINS`

### 2. Frontend Service Status  
- [ ] Frontend running on `http://localhost:5174`
  - Command: `npm run dev` (in `rtf-academy/` directory)
  - Expected: "➜  Local:   http://localhost:5174/"

- [ ] .env configured
  - Check: `rtf-academy/.env` has `VITE_API_BASE_URL=http://localhost:8000/api`

### 3. API Connection Test
Use your browser's Developer Tools (F12):

#### Test 1: Backend API Direct Access
```
1. Open: http://localhost:8000/api/courses/
2. Expected: JSON response with courses list
3. If 404: Check DATABASE_URL in backend/.env
4. If connection refused: Ensure backend is running
```

#### Test 2: Frontend to Backend Communication
```
1. Open: http://localhost:5174/
2. Press F12 → Network tab
3. Refresh page or navigate
4. Look for: requests to http://localhost:8000/api/...
5. Check status codes (200/201 = good, 403 = auth required, CORS error = config issue)
```

#### Test 3: Console Error Checking
```
1. Press F12 → Console tab
2. Watch for errors while navigating
3. CORS errors: Fix backend CORS_ALLOWED_ORIGINS
4. 404 errors: Check endpoint URL in frontend api.js
5. Network errors: Check backend is running
```

### 4. Configuration Files Verification

#### Backend (.env)
- [ ] `DEBUG=True` (development only)
- [ ] `DATABASE_URL=postgres://...` (correct PostgreSQL credentials)
- [ ] `ALLOWED_HOSTS=127.0.0.1,localhost`
- [ ] `CORS_ALLOWED_ORIGINS` includes `http://localhost:5174`

#### Frontend (.env)
- [ ] `VITE_API_BASE_URL=http://localhost:8000/api`
- [ ] No trailing slash in URL (handled by request function)

---

## Common Connection Issues & Fixes

### ❌ CORS Error
**Message:** `Access to XMLHttpRequest at 'http://localhost:8000/api/...' from origin 'http://localhost:5174' has been blocked by CORS policy`

**Cause:** Backend CORS whitelist doesn't include frontend port

**Fix:**
```python
# backend/core/settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5174",  # Add this line if missing
    # ... other origins
]
```

**Then restart backend server.**

---

### ❌ Connection Refused
**Message:** `Failed to fetch` or `ERR_CONNECTION_REFUSED`

**Cause:** Backend not running on port 8000

**Fix:**
```bash
cd backend
python manage.py runserver
# Should show: "Starting development server at http://127.0.0.1:8000/"
```

---

### ❌ 404 Not Found
**Message:** Response status 404 from `/api/courses/`

**Cause:** 
1. Incorrect DATABASE_URL
2. Database not migrated
3. API endpoint doesn't exist

**Fix:**
```bash
# Check database connection
echo $DATABASE_URL  # or check .env

# Run migrations
python manage.py migrate

# Restart backend
python manage.py runserver
```

---

### ❌ 500 Server Error
**Message:** Response status 500 from backend

**Cause:** Backend encountered an error

**Fix:**
```bash
# Check backend terminal for error messages
# Common issues:
# 1. Firebase credentials missing: Add firebase-credentials.json to backend/
# 2. Database error: Check DATABASE_URL credentials
# 3. Import error: Ensure all packages installed (pip install -r requirements.txt)
```

---

### ❌ Firebase Error
**Message:** `Firebase configuration not found` or auth failures

**Cause:** Firebase credentials not configured

**Fix:**
```bash
# Option 1: Skip Firebase (use local auth only)
# Leave VITE_FIREBASE_* variables blank in frontend/.env

# Option 2: Configure Firebase
# 1. Create Firebase project at https://console.firebase.google.com/
# 2. Download service account JSON
# 3. Place in backend/firebase-credentials.json
# 4. Set FIREBASE_CREDENTIALS_PATH in backend/.env
```

---

## Network Request Flow Diagram

```
Frontend (React)
    ↓
[http://localhost:5174/]
    ↓
API Service (api.js)
    ↓
Fetch Request
    ↓
http://localhost:8000/api/courses/
    ↓
Backend (Django)
    ↓
Core Settings (CORS check)
    ↓
Route Handler (/api/courses)
    ↓
Database Query
    ↓
JSON Response
    ↓
Frontend Receives Data
```

---

## Testing with Different Tools

### Using Curl (Terminal)
```bash
# Test backend directly
curl http://localhost:8000/api/courses/

# With authentication token
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:8000/api/users/me/
```

### Using Postman
```
1. New Request
2. URL: http://localhost:8000/api/courses/
3. Method: GET
4. Send
5. Check response and status code
```

### Using Browser Console
```javascript
// Test in DevTools Console (F12)
fetch('http://localhost:8000/api/courses/')
  .then(r => r.json())
  .then(data => console.log('Success:', data))
  .catch(e => console.error('Error:', e))
```

---

## Performance Checks

### Check Response Times
1. Open DevTools (F12) → Network tab
2. Reload page
3. Check timing for `/api/courses/` request
4. Should be under 500ms

### Monitor Network Traffic
1. DevTools → Network tab
2. Filter by XHR (XMLHttpRequest)
3. Watch for failed requests (red)
4. Check request/response headers

---

## Success Indicators

### ✅ Everything Connected
- [ ] Frontend loads at http://localhost:5174/ without errors
- [ ] Backend API responds at http://localhost:8000/api/courses/
- [ ] Network tab shows requests to backend API
- [ ] Console shows no CORS errors
- [ ] Database queries work (courses load)
- [ ] Can register/login users (if Firebase configured)
- [ ] Can enroll in courses
- [ ] Can view course content

### ✅ Specific Tests Passing
- [ ] `GET /api/courses/` returns course list (200)
- [ ] `GET /api/courses/{id}/` returns course details (200)
- [ ] `POST /api/enrollments/` enrolls in course (201)
- [ ] `GET /api/users/me/` returns user profile with auth (200)

---

## Quick Diagnostics Command

Run in backend terminal to test connectivity:
```bash
# Test database
python manage.py shell
>>> from courses.models import Course
>>> Course.objects.count()  # Should return count, not error

# Test migrations
python manage.py migrate --plan

# Check settings
python manage.py check
```

---

## Restart Everything Fresh

If having persistent issues:

```bash
# Backend terminal
Ctrl+C  # Stop server
python manage.py runserver  # Restart

# Frontend terminal  
Ctrl+C  # Stop dev server
npm run dev  # Restart

# Open fresh browser window
# Clear cache: Ctrl+Shift+Delete
# Reload: Ctrl+F5 (hard refresh)
```

---

## Support Resources

- **Full Setup Guide:** [FULLSTACK_SETUP.md](FULLSTACK_SETUP.md)
- **Quick Start:** [QUICK_START.md](QUICK_START.md)
- **Backend Setup:** [backend/initial_setup.md](backend/initial_setup.md)
- **Database Seeding:** [backend/database_Seeding_guide.md](backend/database_Seeding_guide.md)

---

**Last Updated:** 2026-07-09
**Status:** ✅ Documentation Complete
