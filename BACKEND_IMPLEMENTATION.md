# Backend Implementation Reference

This guide explains what your backend needs to implement for the admin login to work correctly.

## Backend Endpoints Required

### 1. POST /auth/login
Authenticate admin user and return JWT token.

**Endpoint Path:**
- Development: `http://localhost:8080/api/auth/login`
- Production: `https://shrishahuprabodhini.in/api/auth/login`

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbkBleGFtcGxlLmNvbSIsImlhdCI6MTcyNDM1MTI0MCwiZXhwIjoxNzI0NDM3NjQwfQ.xxx",
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "fullName": "Admin User",
    "role": "ADMIN"
  }
}
```

**Error Response (401):**
```json
{
  "error": "Invalid email or password",
  "message": "Authentication failed"
}
```

**Token Format:** Must be a valid JWT token (3 parts separated by dots)
```
[header].[payload].[signature]
```

---

### 2. GET /auth/me
Get current authenticated user details.

**Endpoint Path:**
- Development: `http://localhost:8080/api/auth/me`
- Production: `https://shrishahuprabodhini.in/api/auth/me`

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "id": 1,
  "email": "admin@example.com",
  "fullName": "Admin User",
  "role": "ADMIN"
}
```

**Error Response (401):**
```json
{
  "error": "Token invalid or expired"
}
```

---

## How Frontend Sends Token

The frontend will send the JWT token in the `Authorization` header of **every request** after successful login.

### Example Request Headers
```
GET /api/districts HTTP/1.1
Host: localhost:8080
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbkBleGFtcGxlLmNvbSIsImlhdCI6MTcyNDM1MTI0MCwiZXhwIjoxNzI0NDM3NjQwfQ.xxx
```

### Token Format
- **Prefix:** `Bearer ` (with space)
- **Token:** JWT string (typically starts with `eyJ`)
- **Full Header:** `Authorization: Bearer <jwt-token>`

---

## Backend Validation Checklist

### ✅ For Login Endpoint (/auth/login)

1. **Accept POST request** with email and password
2. **Validate credentials** against admin user table
3. **Generate JWT token** (recommended 24-hour expiration)
4. **Return response** with token and user object
5. **Handle errors** properly (400, 401 responses)

### ✅ For All Protected Endpoints

1. **Check for Authorization header**
   ```
   if (!request.headers.Authorization) return 401
   ```

2. **Extract token** from header
   ```
   const authHeader = request.headers.Authorization
   const token = authHeader.replace('Bearer ', '')
   ```

3. **Validate JWT token**
   - Check signature is valid
   - Check token hasn't expired
   - Extract user ID from token

4. **Return 401 if invalid**
   - Token is malformed
   - Token signature is invalid
   - Token has expired
   - User doesn't exist

### ✅ Recommended Token Payload

Include these fields in JWT token `payload` section:
```json
{
  "sub": "admin@example.com",        // user identifier
  "id": 1,                            // user ID
  "email": "admin@example.com",       // user email
  "role": "ADMIN",                    // user role
  "iat": 1724351240,                  // issued at (Unix timestamp)
  "exp": 1724437640                   // expiration (Unix timestamp) - 24 hours from iat
}
```

---

## Sample Backend Implementations

### Spring Boot (Java)
```java
@PostMapping("/api/auth/login")
public ResponseEntity<?> login(@RequestBody LoginRequest request) {
    Admin admin = adminRepository.findByEmail(request.getEmail())
        .orElseThrow(() -> new RuntimeException("Invalid credentials"));
    
    if (!passwordEncoder.matches(request.getPassword(), admin.getPassword())) {
        throw new RuntimeException("Invalid credentials");
    }
    
    String token = jwtUtil.generateToken(admin.getEmail(), admin.getId());
    
    return ResponseEntity.ok(new AuthResponse(
        token,
        new UserDTO(admin.getId(), admin.getEmail(), admin.getFullName(), "ADMIN")
    ));
}

@GetMapping("/api/auth/me")
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
    String token = authHeader.replace("Bearer ", "");
    Claims claims = jwtUtil.parseToken(token);
    // Return user details...
}
```

### Node.js/Express
```javascript
const jwt = require('jsonwebtoken');

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  const admin = await Admin.findOne({ email });
  if (!admin || !admin.comparePassword(password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const token = jwt.sign(
    { id: admin.id, email: admin.email, role: 'ADMIN' },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
  
  res.json({
    token,
    user: {
      id: admin.id,
      email: admin.email,
      fullName: admin.fullName,
      role: 'ADMIN'
    }
  });
});

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token' });
  
  const token = authHeader.replace('Bearer ', '');
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

app.get('/api/auth/me', verifyToken, (req, res) => {
  res.json(req.user);
});
```

### Python/Flask
```python
from flask import Flask, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from datetime import timedelta

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    admin = Admin.query.filter_by(email=data['email']).first()
    
    if not admin or not admin.check_password(data['password']):
        return {'error': 'Invalid credentials'}, 401
    
    token = create_access_token(
        identity=admin.email,
        expires_delta=timedelta(days=1)
    )
    
    return {
        'token': token,
        'user': {
            'id': admin.id,
            'email': admin.email,
            'fullName': admin.full_name,
            'role': 'ADMIN'
        }
    }, 200

@app.route('/api/auth/me', methods=['GET'])
@jwt_required()
def get_current_user():
    email = get_jwt_identity()
    admin = Admin.query.filter_by(email=email).first()
    return {
        'id': admin.id,
        'email': admin.email,
        'fullName': admin.full_name,
        'role': 'ADMIN'
    }, 200
```

---

## Testing Your Backend

### Test Login Endpoint with cURL
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'
```

Expected response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "fullName": "Admin User",
    "role": "ADMIN"
  }
}
```

### Test Protected Endpoint with Token
```bash
curl -X GET http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

Expected response:
```json
{
  "id": 1,
  "email": "admin@example.com",
  "fullName": "Admin User",
  "role": "ADMIN"
}
```

### Test Invalid Token
```bash
curl -X GET http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer invalid-token"
```

Expected response (401):
```json
{
  "error": "Invalid token"
}
```

---

## Vite Proxy Configuration

The frontend development server automatically proxies requests:

**vite.config.js:**
```javascript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
      secure: false,
    },
  },
}
```

This means:
- Frontend request to `http://localhost:5173/api/auth/login`
- Is forwarded to `http://localhost:8080/api/auth/login`
- Backend sees it as a direct request (no CORS issues)

---

## Environment Variables for Frontend

The frontend uses these environment variables to determine the API URL:

**Local Development (.env.development):**
```env
VITE_API_BASE_URL=/api
# Backend expected at: http://localhost:8080/api
```

**Production (.env.production):**
```env
VITE_API_BASE_URL=https://shrishahuprabodhini.in/api
# Backend expected at: https://shrishahuprabodhini.in/api
```

---

## Common Backend Issues & Solutions

### Issue: Frontend gets 401 but login shows success

**Cause:** Token format is incorrect or backend is not accepting Bearer prefix

**Solution:**
- Verify token in login response starts with `eyJ` (Base64 encoded)
- Check backend is looking for `Authorization: Bearer <token>` format
- Test token endpoint manually with cURL

### Issue: Token works once then returns 401

**Cause:** Token is expiring

**Solution:**
- Increase token expiration time (recommend 24 hours for development, 8 hours for production)
- Implement token refresh mechanism
- Check server and client time synchronization

### Issue: CORS errors in browser

**Cause:** Backend not configured for CORS

**Solution:**
- In local development: Vite proxy handles this (no CORS needed)
- In production: Configure backend CORS headers or serve frontend from same domain

### Issue: 404 on /api/auth/login

**Cause:** Endpoint doesn't exist or URL is wrong

**Solution:**
- Verify backend is running on port 8080 (local) or correct domain (production)
- Check endpoint path is exactly `/api/auth/login`
- Check backend logs for received requests

---

## Security Best Practices

1. **Use HTTPS in production** - Never send tokens over HTTP
2. **Short token expiration** - Recommend 24 hours or less
3. **Validate token on every request** - Don't trust client-side validation
4. **Use secure random JWT secret** - At least 32 characters
5. **Never log tokens** - They can grant access to the system
6. **Implement logout** - Clear token on client side
7. **Handle token expiration gracefully** - Redirect to login when 401 received

---

## Next Steps

1. Implement login endpoint that returns token and user object
2. Implement token validation on all protected endpoints
3. Test endpoints with cURL or Postman
4. Start frontend with `npm run dev`
5. Test full login flow in browser
6. Verify token is sent in Authorization header for all requests
