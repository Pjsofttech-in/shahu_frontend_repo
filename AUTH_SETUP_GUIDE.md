# Authentication & Backend Setup Guide

## Overview
Your admin panel is configured for token-based authentication with support for both local and production environments.

## Current Architecture

### Frontend Flow
```
Login Page (email + password)
    ↓
POST /auth/login → Backend
    ↓
Backend returns: { token, user }
    ↓
Token stored in SessionStorage
    ↓
Token added to all requests: Authorization: Bearer <token>
    ↓
Protected routes check auth → Navigate to Dashboard
```

## Local Development Setup

### Prerequisites
- Backend running on `http://localhost:8080`
- Backend should expose: `POST /auth/login` endpoint

### Step 1: Start the Development Server
```bash
npm run dev
```
- Frontend will run on `http://localhost:5173`
- Vite proxy automatically forwards `/api/*` to `http://localhost:8080/api/*`

### Step 2: Backend Login Endpoint Requirements
Your backend needs to implement `POST /auth/login` with:

**Request:**
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Response (one of these formats):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "fullName": "Admin Name",
    "role": "ADMIN"
  }
}
```

OR with nested structure:
```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "admin": {
      "id": 1,
      "email": "admin@example.com",
      "adminName": "Admin Name"
    }
  }
}
```

OR with accessToken/jwt:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "user": { ... }
}
```

### Step 3: Configure Environment Variables (.env.development)
```env
# Local development
VITE_API_BASE_URL=/api
VITE_APP_ENV=development

# Optional: For dev auto-login (remove before production)
VITE_ADMIN_LOGIN_TOKEN=your-test-token-here
VITE_ENABLE_DEV_AUTO_LOGIN=true

# Set to false unless you want cookie-based auth
VITE_API_USE_COOKIES=false
```

### Step 4: Test Login Locally
1. Navigate to `http://localhost:5173`
2. You'll be redirected to `/login`
3. Enter credentials: `admin@example.com` / `password`
4. Click "Login"
5. On success → redirected to `/dashboard`
6. Check browser console for debug logs: `[api.request]` shows token being sent

### Debugging Local Issues
- **Console Logs:** Check browser DevTools → Console for `[api.request]` and `[api.response.error]` logs
- **Network Tab:** Verify Authorization header is sent with every API request
- **Session Storage:** Check Application → SessionStorage for `authToken` and `authUser`

---

## Production Setup

### Step 1: Build the Application
```bash
npm run build
```
- Creates optimized production build in `dist/` folder
- Uses `.env.production` configuration

### Step 2: Configure Production Environment (.env.production)
```env
# Production settings
VITE_API_BASE_URL=https://shrishahuprabodhini.in/api
VITE_APP_ENV=production

# DO NOT enable auto-login in production
# VITE_ENABLE_DEV_AUTO_LOGIN=false (default)
# VITE_ADMIN_LOGIN_TOKEN= (must be empty)

# Use this only if backend uses cookie-based sessions
# VITE_API_USE_COOKIES=false
```

### Step 3: Deploy Frontend
- Copy contents of `dist/` to your web server (Nginx, Apache, etc.)
- Frontend should be served from the same domain as your backend OR
- Configure CORS properly if frontend and backend are on different domains

### Step 4: Backend Production Endpoint
- Backend must be accessible at: `https://shrishahuprabodhini.in/api/auth/login`
- SSL certificate must be valid
- CORS headers must allow your frontend origin

### Step 5: Test Production Login
1. Navigate to production URL
2. Login with admin credentials
3. Verify token is stored and API requests include Authorization header

---

## Authentication Flow Details

### 1. Token Extraction (Multi-Format Support)
The system looks for token in multiple locations (in order):
1. `response.data.token`
2. `response.data.accessToken`
3. `response.data.jwt`
4. `response.data.jwtToken`
5. `response.data.authorization`
6. `response.data.data.token`
7. `response.data.admin.token`
8. `response.data.user.token`
9. Response headers: `authorization` or `x-auth-token`

### 2. User Extraction
The system tries to find user data in:
1. `response.data.user`
2. `response.data.admin`
3. `response.data.profile`
4. `response.data.data.*` (nested)

### 3. Token Storage
- **In Memory:** `AuthContext` state
- **Persistent:** `sessionStorage.authToken`
- **User Data:** `sessionStorage.authUser` (JSON)

### 4. Token Usage
Every request automatically includes:
```
Authorization: Bearer <token>
```

### 5. Token Expiration
- 401 responses clear the token and redirect to `/401` (Unauthorized page)
- In production, users are redirected to login
- In development, errors are logged for debugging

---

## API Endpoints

### Authentication Endpoints

#### POST /auth/login
**Local:** `http://localhost:8080/api/auth/login`  
**Production:** `https://shrishahuprabodhini.in/api/auth/login`

**Request:**
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "token": "jwt-token-here",
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "fullName": "Admin Name",
    "role": "ADMIN"
  }
}
```

#### GET /auth/me (Get Current User)
Requires: Authorization header with token

**Response (200 OK):**
```json
{
  "id": 1,
  "email": "admin@example.com",
  "fullName": "Admin Name",
  "role": "ADMIN"
}
```

---

## Common Issues & Solutions

### Issue: "Invalid email or password" but credentials are correct
- **Cause:** Backend endpoint doesn't exist or returns wrong format
- **Solution:** Check backend logs, verify endpoint is `/auth/login`, ensure response includes token

### Issue: Token not being sent to backend
- **Cause:** Token not stored in sessionStorage
- **Solution:** Check if login response includes token field. Check browser DevTools → Application → SessionStorage

### Issue: 401 errors on protected routes
- **Cause:** Token expired or backend rejects token
- **Solution:** Check token expiration on backend, verify token format (should be JWT)

### Issue: CORS errors
- **Cause:** Frontend and backend on different domains without proper CORS config
- **Solution:** 
  - Configure backend CORS to allow frontend origin
  - OR serve frontend from same domain as backend

### Issue: Login page not showing after page refresh
- **Cause:** Auto-login is enabled and token is still valid
- **Solution:** Either disable auto-login or clear sessionStorage

---

## Security Checklist

- ✓ Token stored in sessionStorage (cleared on browser close)
- ✓ Token sent in Authorization header (not in URL or cookie)
- ✓ Use HTTPS in production
- ✓ Don't commit real tokens to version control
- ✓ Backend should validate token on every request
- ✓ Backend should set short token expiration (e.g., 24 hours)
- ✓ Implement token refresh mechanism if needed

---

## Testing Credentials (Local Development Only)

Use these for testing if your backend has them:
- Email: `admin@example.com`
- Password: `password`

**Note:** Change these credentials in production and never commit them to Git.

---

## Environment Variables Reference

| Variable | Local | Production | Purpose |
|----------|-------|-----------|---------|
| `VITE_API_BASE_URL` | `/api` | `https://shrishahuprabodhini.in/api` | Backend API URL |
| `VITE_APP_ENV` | `development` | `production` | App environment |
| `VITE_ADMIN_LOGIN_TOKEN` | test-token | empty | Dev auto-login token |
| `VITE_ENABLE_DEV_AUTO_LOGIN` | `true` | `false` | Enable dev auto-login |
| `VITE_API_USE_COOKIES` | `false` | `false` | Use cookie-based auth |

---

## File Structure

```
src/
├── pages/
│   └── Login.jsx              ← Login form component
├── context/
│   └── AuthContext.jsx        ← Auth state management
├── api/
│   ├── axiosConfig.js         ← Token storage & interceptors
│   └── services.js            ← API endpoints (authService.login)
├── components/
│   └── common/
│       └── ProtectedRoute.jsx ← Route protection wrapper
└── App.jsx                    ← Route definitions & HomeRoute redirect

.env.development              ← Local configuration
.env.production               ← Production configuration
.env.example                  ← Example configuration
vite.config.js               ← Vite config with proxy settings
```

---

## Next Steps

1. **Configure Backend:** Ensure backend has `/auth/login` endpoint working
2. **Test Locally:** Run `npm run dev` and test login flow
3. **Verify Token:** Check that token is sent in Authorization header
4. **Set Up Production:** Update `.env.production` with live backend URL
5. **Deploy:** Build and deploy to production server

---

## Support

For issues or questions:
1. Check browser console logs for `[api.request]` and `[api.response.error]` messages
2. Verify backend is returning token in login response
3. Check that Authorization header is sent with requests
4. Ensure environment variables are correctly set for your environment
