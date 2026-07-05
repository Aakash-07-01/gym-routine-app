@echo off
echo ========================================
echo  Starting Gym Routine Frontend (LOCAL)
echo  Using VITE_API_URL from .env.local
echo ========================================
cd /d "%~dp0frontend"
call npm run dev
