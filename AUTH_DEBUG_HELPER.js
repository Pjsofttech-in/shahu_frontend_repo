/**
 * AUTH_DEBUG_HELPER.js
 * 
 * Quick debugging utility to check authentication status and configuration.
 * 
 * Run in browser console to verify:
 * - Token is stored correctly
 * - Environment variables are loaded
 * - API base URL is correct
 * - Auth headers are being sent
 * 
 * Usage:
 * 1. Copy this code
 * 2. Paste in browser DevTools Console
 * 3. Call: authDebug()
 */

const authDebug = () => {
  console.clear()
  console.log('%c=== AUTH CONFIGURATION DEBUG ===', 'color: #0066ff; font-size: 16px; font-weight: bold')
  
  // 1. Check sessionStorage
  console.log('\n%c1. SESSION STORAGE:', 'color: #ff9900; font-weight: bold')
  const token = sessionStorage.getItem('authToken')
  const user = sessionStorage.getItem('authUser')
  const cookieAuth = sessionStorage.getItem('cookieAuth')
  
  console.log('Token:', token ? `${token.substring(0, 20)}...` : '❌ NOT FOUND')
  console.log('User:', user ? JSON.parse(user) : '❌ NOT FOUND')
  console.log('Cookie Auth:', cookieAuth)
  
  // 2. Check environment variables
  console.log('\n%c2. ENVIRONMENT VARIABLES:', 'color: #ff9900; font-weight: bold')
  console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL || '/api')
  console.log('App Environment:', import.meta.env.VITE_APP_ENV || 'unknown')
  console.log('Mode:', import.meta.env.MODE)
  console.log('Dev Auto-Login Enabled:', import.meta.env.VITE_ENABLE_DEV_AUTO_LOGIN)
  console.log('Use Cookies:', import.meta.env.VITE_API_USE_COOKIES)
  
  // 3. Check last network request
  console.log('\n%c3. TIPS FOR TROUBLESHOOTING:', 'color: #ff9900; font-weight: bold')
  console.log('✓ Open DevTools → Network tab')
  console.log('✓ Look for /api/auth/login request')
  console.log('✓ Check Response tab for token in response')
  console.log('✓ Check Headers tab → Request Headers for "Authorization: Bearer ..."')
  console.log('✓ In Console, look for logs starting with [api.request] or [api.response.error]')
  
  // 4. Test API call
  console.log('\n%c4. TEST API CALL:', 'color: #ff9900; font-weight: bold')
  console.log('To test with current token, run:')
  console.log(`
    fetch('/api/auth/me', {
      headers: { 'Authorization': 'Bearer ' + sessionStorage.getItem('authToken') }
    }).then(r => r.json()).then(console.log)
  `)
}

// Helper to extract token from localStorage/sessionStorage
const getStoredToken = () => {
  return sessionStorage.getItem('authToken') || localStorage.getItem('authToken') || null
}

// Helper to extract user from localStorage/sessionStorage
const getStoredUser = () => {
  try {
    return JSON.parse(sessionStorage.getItem('authUser') || localStorage.getItem('authUser') || 'null')
  } catch {
    return null
  }
}

// Helper to make authenticated API call
const authApiCall = async (url, method = 'GET', body = null) => {
  const token = getStoredToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  }
  
  const options = { method, headers }
  if (body) options.body = JSON.stringify(body)
  
  try {
    const response = await fetch(url, options)
    const data = await response.json()
    console.log(`${method} ${url}:`, { status: response.status, data })
    return data
  } catch (error) {
    console.error(`${method} ${url}:`, error)
    return null
  }
}

// Export helpers
window.authDebug = authDebug
window.getStoredToken = getStoredToken
window.getStoredUser = getStoredUser
window.authApiCall = authApiCall

console.log('%c✓ Auth Debug Helpers Loaded', 'color: #00cc00; font-weight: bold')
console.log('Available commands:')
console.log('  • authDebug()                    - Show full debug info')
console.log('  • getStoredToken()               - Get stored JWT token')
console.log('  • getStoredUser()                - Get stored user object')
console.log('  • authApiCall(url, method, body) - Make authenticated API call')
console.log('\nExample: authDebug()')
