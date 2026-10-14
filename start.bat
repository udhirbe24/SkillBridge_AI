@echo off
title SkillBridge AI Launcher
echo ===================================================
echo           Starting SkillBridge AI Platform
echo ===================================================

echo [1/3] Starting Backend Engine (FastAPI on port 8000)...
start "SkillBridge Backend (Port 8000)" cmd /k "cd /d %~dp0backend && python -m uvicorn app.main:app --reload --port 8000"

echo [2/3] Starting Frontend Interface (Next.js on port 3000)...
start "SkillBridge Frontend (Port 3000)" cmd /k "cd /d %~dp0frontend && npm.cmd run dev"

echo [3/3] Waiting 4 seconds for servers to initialize...
timeout /t 4 /nobreak >nul

echo Opening browser to http://localhost:3000 ...
start http://localhost:3000

echo.
echo ===================================================
echo  SkillBridge AI is running!
echo  - Frontend:  http://localhost:3000
echo  - API Docs:  http://localhost:8000/docs
echo ===================================================
echo  NOTE: Keep the two command prompt windows open 
echo  while you are using the app. Close them to stop.
echo ===================================================
pause
