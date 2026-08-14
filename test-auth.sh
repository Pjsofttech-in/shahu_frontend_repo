#!/bin/bash
#
# Test Authentication Flow with cURL
#
# This script demonstrates how to test the login flow and API calls
# with token authentication using cURL commands.
#
# Requires: curl, jq (for JSON parsing)
#
# Usage:
# 1. Make the script executable: chmod +x test-auth.sh
# 2. Update variables (EMAIL, PASSWORD, API_URL)
# 3. Run: ./test-auth.sh
#

# =========================================
# Configuration
# =========================================
EMAIL="admin@example.com"
PASSWORD="password123"
API_URL="http://localhost:8080/api"
TOKEN_FILE="auth_token.txt"

echo "╔════════════════════════════════════════════════════════════╗"
echo "║      Authentication Flow Testing with cURL                ║"
echo "╚════════════════════════════════════════════════════════════╝"

# =========================================
# 1. Test Login
# =========================================
echo ""
echo "📝 Step 1: Login"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Endpoint: POST $API_URL/auth/login"
echo "Request:"
echo "  email: $EMAIL"
echo "  password: ****"
echo ""

LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

echo "Response:"
echo "$LOGIN_RESPONSE" | jq . 2>/dev/null || echo "$LOGIN_RESPONSE"

# Extract token from response
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token // .accessToken // .data.token // .data.accessToken // empty' 2>/dev/null)

if [ -z "$TOKEN" ]; then
  echo ""
  echo "❌ ERROR: No token in response!"
  echo "Make sure your backend returns a 'token' or 'accessToken' field"
  exit 1
fi

echo ""
echo "✅ Token received: ${TOKEN:0:30}..."
echo "$TOKEN" > "$TOKEN_FILE"

# =========================================
# 2. Get Current User
# =========================================
echo ""
echo "👤 Step 2: Get Current User (/auth/me)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Endpoint: GET $API_URL/auth/me"
echo "Authorization: Bearer <token>"
echo ""

ME_RESPONSE=$(curl -s -X GET "$API_URL/auth/me" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN")

echo "Response:"
echo "$ME_RESPONSE" | jq . 2>/dev/null || echo "$ME_RESPONSE"

# =========================================
# 3. Test Protected Endpoint (Example)
# =========================================
echo ""
echo "📊 Step 3: Access Protected Endpoint (/districts)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Endpoint: GET $API_URL/districts"
echo "Authorization: Bearer <token>"
echo ""

PROTECTED_RESPONSE=$(curl -s -X GET "$API_URL/districts" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN")

echo "Response:"
echo "$PROTECTED_RESPONSE" | jq . 2>/dev/null || echo "$PROTECTED_RESPONSE"

# =========================================
# 4. Test with Invalid Token
# =========================================
echo ""
echo "🚫 Step 4: Test with Invalid Token (should get 401)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

INVALID_TOKEN="invalid-token-12345"
INVALID_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET "$API_URL/districts" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $INVALID_TOKEN")

echo "Response (should be 401):"
echo "$INVALID_RESPONSE" | jq . 2>/dev/null || echo "$INVALID_RESPONSE"

# =========================================
# 5. Summary
# =========================================
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                      Test Complete                        ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "✅ If all tests passed:"
echo "   1. Login returned a valid token"
echo "   2. /auth/me returned user info with the token"
echo "   3. Protected endpoints worked with the token"
echo "   4. Invalid token returned 401 error"
echo ""
echo "Token saved to: $TOKEN_FILE"
echo ""
echo "Next steps:"
echo "  1. Run: npm run dev"
echo "  2. Login with: $EMAIL / $PASSWORD"
echo "  3. Check browser DevTools → Network tab"
echo "  4. Verify 'Authorization: Bearer' header in requests"
echo ""

# =========================================
# Advanced: Test with Request/Response Details
# =========================================
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "   For more detailed request/response info, use:"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "📋 Request headers and response:"
echo "  curl -v -X POST $API_URL/auth/login \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"email\":\"$EMAIL\",\"password\":\"password\"}'"
echo ""
echo "🔍 Response headers only:"
echo "  curl -i -X POST $API_URL/auth/login \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"email\":\"$EMAIL\",\"password\":\"password\"}'"
echo ""
echo "📊 Response body as formatted JSON:"
echo "  curl -s -X POST $API_URL/auth/login \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"email\":\"$EMAIL\",\"password\":\"password\"}' | jq ."
echo ""
echo "⏱️  Check response time:"
echo "  curl -w '\nTime: %{time_total}s\n' -X POST $API_URL/auth/login \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"email\":\"$EMAIL\",\"password\":\"password\"}'"
echo ""
