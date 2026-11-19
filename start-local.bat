@echo off
setlocal
cd /d "%~dp0"

where npm >nul 2>&1
if errorlevel 1 (
  echo Node.js is not installed. Install it from https://nodejs.org and run this file again.
  pause
  exit /b 1
)

where py >nul 2>&1
if errorlevel 1 (
  where python >nul 2>&1
  if errorlevel 1 (
    echo Python is not installed. Install Python 3.10 or newer and run this file again.
    pause
    exit /b 1
  )
  set "PY=python"
) else (
  set "PY=py"
)

if not exist "backend\venv\Scripts\python.exe" (
  echo Creating the Python environment...
  %PY% -m venv backend\venv
  if errorlevel 1 (
    echo The Python environment could not be created.
    pause
    exit /b 1
  )
)

echo Installing Python packages...
backend\venv\Scripts\python.exe -m pip install -r backend\requirements.txt
if errorlevel 1 (
  echo Python packages could not be installed.
  pause
  exit /b 1
)

if not exist "backend\.env" (
  echo Creating a local development settings file...
  backend\venv\Scripts\python.exe -c "import secrets; from pathlib import Path; Path('backend/.env').write_text('VITAGUARD_ENV=development\nCORS_ORIGINS=http://127.0.0.1:5173,http://localhost:5173\nJWT_SECRET=' + secrets.token_urlsafe(48) + '\n', encoding='utf-8')"
)

if not exist "frontend\node_modules" (
  echo Installing the web packages...
  pushd frontend
  call npm install
  if errorlevel 1 (
    popd
    echo Web packages could not be installed.
    pause
    exit /b 1
  )
  popd
)

echo Starting VitaGuard on this computer.
echo Open http://127.0.0.1:5173
echo Any person can create an account with an email address.
echo Google sign-in still works only for the accounts added in Google Cloud.
start "VitaGuard API" cmd /k "cd /d "%~dp0backend" && venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000"
start "VitaGuard Web" cmd /k "cd /d "%~dp0frontend" && npm run dev -- --host 127.0.0.1 --port 5173"
timeout /t 4 /nobreak >nul
start "" "http://127.0.0.1:5173/"
endlocal
