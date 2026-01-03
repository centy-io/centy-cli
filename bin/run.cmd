@echo off
setlocal

:: Check if Bun is available
where bun >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    bun "%~dp0run.js" %*
    exit /b %ERRORLEVEL%
)

:: Fall back to Node.js with tip message
echo Tip: Install Bun for faster CLI performance: https://bun.sh >&2
node "%~dp0run.js" %*
exit /b %ERRORLEVEL%
