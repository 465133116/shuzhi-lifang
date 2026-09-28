@echo off
chcp 65001 >nul
cd /d "%~dp0"

if exist "%~dp0serve-8080.ps1" (
  where powershell >nul 2>&1 && goto try_ps
)

where py >nul 2>&1 && goto try_py
where python >nul 2>&1 && goto try_python
where node >nul 2>&1 && goto try_node
goto none

:try_ps
start "Eco-8080" /D "%~dp0" cmd /k powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0serve-8080.ps1"
timeout /t 2 /nobreak >nul
start "" "http://127.0.0.1:8080/"
exit /b 0

:try_py
start "Eco-8080" /D "%~dp0" cmd /k py -3 -m http.server 8080
timeout /t 2 /nobreak >nul
start "" "http://localhost:8080/"
exit /b 0

:try_python
start "Eco-8080" /D "%~dp0" cmd /k python -m http.server 8080
timeout /t 2 /nobreak >nul
start "" "http://localhost:8080/"
exit /b 0

:try_node
start "Eco-8080" /D "%~dp0" cmd /k npx --yes serve . -l 8080
timeout /t 3 /nobreak >nul
start "" "http://localhost:8080/"
exit /b 0

:none
echo [Error] Missing serve-8080.ps1 or PowerShell. On Windows 10/11, enable PowerShell.
echo Optional: install Python 3 or Node.js in PATH as fallback.
pause
exit /b 1