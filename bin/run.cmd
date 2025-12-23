@echo off
where bun >nul 2>&1
if %ERRORLEVEL% EQU 0 (
  bun "%~dp0run.js" %*
) else (
  echo Tip: Install Bun for faster CLI performance: https://bun.sh 1>&2
  node "%~dp0run.js" %*
)
