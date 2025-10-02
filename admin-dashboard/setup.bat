@echo off
echo Setting up Transportify Admin Dashboard...
echo.

echo Installing dependencies...
cd server
npm install
if %errorlevel% neq 0 (
    echo Error installing dependencies!
    pause
    exit /b 1
)

echo.
echo Setup complete!
echo.
echo To start the admin server:
echo 1. Run: cd server
echo 2. Run: npm start
echo.
echo Then visit: http://localhost:3001/admin/login
echo Default credentials: admin / admin123
echo.
pause

