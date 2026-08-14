# Quick Setup Checklist

## ✅ Backend Requirements

Before running the frontend, ensure your backend has:

### 1. Login Endpoint
- **Endpoint:** `POST /auth/login`
- **URL (Local):** `http://localhost:8080/api/auth/login`
- **URL (Production):** `https://shrishahuprabodhini.in/api/auth/login`

### 2. Expected Request Format
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

### 3. Expected Response Format (pick one)
Your backend should return ONE of these formats with status 200:

#### Option A (Recommended)
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

#### Option B (Nested data)
```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "user": { ... }
  }
}
```

#### Option C (AccessToken)
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "user": { ... }
}
```

### 4. All API Endpoints Must Support Authorization
Every protected API endpoint should:
- Accept `Authorization: Bearer <token>` header
- Validate the token
- Return 401 if token is invalid/expired

---

## ✅ Frontend Setup

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment

#### For Local Development
Edit `.env.development`:
```env
VITE_API_BASE_URL=/api
VITE_APP_ENV=development
VITE_ENABLE_DEV_AUTO_LOGIN=false
VITE_ADMIN_LOGIN_TOKEN=
```

**Note:** Vite automatically proxies `/api/*` to `http://localhost:8080/api/*` (see `vite.config.js`)

#### For Production
Edit `.env.production`:
```env
VITE_API_BASE_URL=https://shrishahuprabodhini.in/api
VITE_APP_ENV=production
```

### Step 3: Start Development Server
```bash
npm run dev
```

The app will open at `http://localhost:5173`
- You'll be redirected to `/login`
- Enter admin credentials
- On success, you'll be redirected to `/dashboard`

### Step 4: Build for Production
```bash
npm run build
```

Output will be in `dist/` folder. Deploy this to your web server.

---

## 🔍 Verify Authentication is Working

### In Browser Console (Local Development)

1. **Check if token is stored:**
   ```javascript
   sessionStorage.getItem('authToken')
   ```
   Should show: `eyJhbGciOiJIUzI1NiJ9...` (if logged in)

2. **Check if user is stored:**
   ```javascript
   JSON.parse(sessionStorage.getItem('authUser'))
   ```
   Should show: `{ id: 1, email: "...", fullName: "...", role: "ADMIN" }`

3. **Debug full auth status:**
   - Open `AUTH_DEBUG_HELPER.js` in your project
   - Copy & paste the code in browser console
   - Run: `authDebug()`

### In Network Tab

1. Go to DevTools → Network tab
2. Perform login
3. Look for `POST /api/auth/login` request
4. Check Response tab for token in response body
5. After login, check any other API request:
   - Click on request
   - Go to Headers tab
   - Should show: `Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...`

### Console Logs (Development Only)

Watch for these debug messages:
```
[dev] VITE_ADMIN_LOGIN_TOKEN loaded into sessionStorage      (if auto-login enabled)
[api.request] url=/auth/login authorization=Bearer <token>   (shows each request)
[auth.login] response { data: {...}, headers: {...} }        (login response details)
```

---

## 🐛 Troubleshooting

### Login Not Working - "Invalid email or password"

**Check 1:** Backend is running
```bash
# Test backend directly
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'
```
Should return a token.

**Check 2:** Response format is correct
- Backend response must include a `token` field
- Token format should be: `eyJhbGciOiJIUzI1NiJ9.xxx.yyy` (JWT format)

**Check 3:** Check browser console for error details
Look for error message in the alert box on login page.

---

### Token Not Being Sent to Backend

**Check:** Authorization header in Network tab
1. Open DevTools → Network tab
2. Perform any action that calls the backend
3. Click on the request
4. Check Headers tab → Request Headers
5. Should show: `Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...`

If missing:
- Token may not be stored in sessionStorage
- Check if login was successful
- Check if token is in response

---

### 401 Errors After Login

**Check:** Token is still valid
- Backend might be rejecting tokens with wrong format
- Tokens might be expiring quickly
- Backend might not be validating correctly

**Solution:**
1. Check backend logs for token validation errors
2. Ensure token has correct `Bearer ` prefix
3. Check token expiration time (`exp` claim in JWT)
4. Verify backend is checking Authorization header correctly

---

### CORS Errors

**Cause:** Frontend and backend on different domains without CORS config

**Solutions:**
1. **Best:** Serve frontend from same domain as backend
   - Frontend: `https://shrishahuprabodhini.in/`
   - Backend: `https://shrishahuprabodhini.in/api/`

2. **Alternative:** Configure backend CORS headers
   ```
   Access-Control-Allow-Origin: https://shrishahuprabodhini.in
   Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
   Access-Control-Allow-Headers: Content-Type, Authorization
   Access-Control-Allow-Credentials: true (if using cookies)
   ```

---

## 📋 File Locations

| File | Purpose |
|------|---------|
| `.env.development` | Local dev config |
| `.env.production` | Production config |
| `.env.example` | Example reference |
| `vite.config.js` | Vite & proxy config |
| `AUTH_SETUP_GUIDE.md` | Detailed setup guide |
| `AUTH_DEBUG_HELPER.js` | Debug utilities |
| `src/pages/Login.jsx` | Login form |
| `src/context/AuthContext.jsx` | Auth state |
| `src/api/axiosConfig.js` | API & token management |
| `src/api/services.js` | API endpoints |

---

## 🚀 Next Steps

1. **Verify Backend:** Test `/api/auth/login` endpoint directly
2. **Start Dev Server:** Run `npm run dev`
3. **Login:** Enter admin credentials
4. **Check Token:** Verify in sessionStorage and network headers
5. **Test API Calls:** Navigate to dashboard and check if other API calls include auth header
6. **Build & Deploy:** Run `npm run build` and deploy `dist/` folder

---

## Questions?

1. Check `AUTH_SETUP_GUIDE.md` for detailed documentation
2. Run `authDebug()` in console (copy code from `AUTH_DEBUG_HELPER.js`)
3. Check browser DevTools Network tab for request/response details
4. Check backend logs for error messages
