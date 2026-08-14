@echo off
REM Test Authentication Flow with cURL (Windows Batch)
REM
REM This script demonstrates how to test the login flow with cURL
REM
REM Usage:
REM 1. Update EMAIL, PASSWORD, and API_URL variables below
REM 2. Run: test-auth.bat
REM
REM Note: Requires curl.exe (usually available on Windows 10+)
REM       For JSON pretty-printing, requires jq.exe or similar
REM

setlocal enabledelayedexpansion

REM =========================================
REM Configuration
REM =========================================
set EMAIL=admin@example.com
set PASSWORD=password123
set API_URL=http://localhost:8080/api
set TOKEN_FILE=auth_token.txt

echo.
echo ========================================================
echo  Authentication Flow Testing with cURL (Windows)
echo ========================================================
echo.

REM =========================================
REM 1. Test Login
REM =========================================
echo Step 1: Login
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo Endpoint: POST %API_URL%/auth/login
echo Email: %EMAIL%
echo.

curl -X POST "%API_URL%/auth/login" ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"%EMAIL%\",\"password\":\"%PASSWORD%\"}"

echo.
echo.

REM =========================================
REM 2. Get Current User
REM =========================================
echo Step 2: Get Current User (/auth/me)
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo Note: Replace TOKEN_HERE with the token from Step 1
echo.
echo curl -X GET "%API_URL%/auth/me" ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer TOKEN_HERE"
echo.

REM =========================================
REM 3. Instructions
REM =========================================
echo.
echo ========================================================
echo  Next Steps
echo ========================================================
echo.
echo 1. Copy the token from Step 1 response
echo.
echo 2. Use it in subsequent requests:
echo    curl -X GET "%API_URL%/districts" ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
echo.
echo 3. Start the dev server:
echo    npm run dev
echo.
echo 4. Login in browser and check Network tab
echo    - Look for Authorization header in requests
echo    - Should be: "Bearer your-token-here"
echo.

pause
