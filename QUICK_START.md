# Quick Start - Backend & Frontend Connection

## Prerequisites Checklist
- [ ] PostgreSQL installed and running
- [ ] Python 3.x installed
- [ ] Node.js 16+ installed
- [ ] Both `.env` files configured

## Quick Setup (5-10 minutes)

### Backend Setup
```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Run migrations (first time only)
python manage.py migrate

# Start backend server
python manage.py runserver
```
✅ Backend running at: **http://localhost:8000/api/**

---

### Frontend Setup (new terminal)
```bash
cd rtf-academy

# Install dependencies (if not done)
npm install

# Start frontend server
npm run dev
```
✅ Frontend running at: **http://localhost:5174/**

---

## Verify Connection

### In Browser:
1. Open: http://localhost:5174/
2. Open DevTools (F12) → Network tab
3. Navigate to any page
4. Look for requests to `http://localhost:8000/api/...`
5. ✅ Should see 200/201 status codes

### Common Responses:
- **CORS Error**: Backend CORS settings missing this port
- **Connection Refused**: Backend not running on port 8000
- **404 on /api/**: Check `DATABASE_URL` in backend `.env`

---

## Environment Files Checklist

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:8000/api
```

### Backend (.env)
```
DEBUG=True
DATABASE_URL=postgres://rtf_admin:supersecretpassword@localhost:5432/rtf_db
ALLOWED_HOSTS=127.0.0.1,localhost
```

---

## Database First-Time Setup

```bash
cd backend

# Create database in PostgreSQL
psql -U postgres -c "CREATE DATABASE rtf_db;"
psql -U postgres -c "CREATE USER rtf_admin WITH PASSWORD 'supersecretpassword';"
psql -U postgres -d rtf_db -c "GRANT ALL PRIVILEGES ON DATABASE rtf_db TO rtf_admin;"

# Run migrations
python manage.py migrate

# (Optional) Load sample data
python manage.py loaddata rtf_master_seed.json
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| **CORS Error** | Add `http://localhost:5174` to `backend/core/settings.py` → `CORS_ALLOWED_ORIGINS` |
| **Port 8000 in use** | `python manage.py runserver 8001` |
| **Database error** | Check `DATABASE_URL` matches PostgreSQL credentials |
| **No courses showing** | Run `python manage.py loaddata rtf_master_seed.json` |
| **Firebase error** | Place `firebase-credentials.json` in backend root folder |

---

## Test Endpoints (DevTools Console or Postman)

```javascript
// Test backend is responding
fetch('http://localhost:8000/api/courses/')
  .then(r => r.json())
  .then(data => console.log(data))
```

---

## Next Steps
1. Register: http://localhost:5174/register
2. Login: http://localhost:5174/login
3. Browse courses: http://localhost:5174/courses
4. Enroll in a course
5. View admin dashboard: http://localhost:8000/admin/

---

**Full documentation:** See [FULLSTACK_SETUP.md](FULLSTACK_SETUP.md)
