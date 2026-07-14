@echo off
REM Qwen Code Desktop - Build Script for Windows
REM Run this script to build the application

echo ========================================
echo   Qwen Code Desktop - Build Script
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo [INFO] Node.js version:
node --version
echo.

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm is not installed!
    echo Please reinstall Node.js
    echo.
    pause
    exit /b 1
)

echo [INFO] npm version:
npm --version
echo.

REM Install dependencies
echo [STEP 1/3] Installing dependencies...
echo.
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install dependencies!
    echo.
    pause
    exit /b 1
)

echo.
echo [STEP 2/3] Dependencies installed successfully!
echo.

REM Ask user which build type
echo ========================================
echo   Select Build Type:
echo ========================================
echo.
echo   1. Build Installer (Recommended)
echo   2. Build Portable Version
echo   3. Build Both
echo   4. Exit
echo.

set /p choice="Enter your choice (1-4): "

if "%choice%"=="4" (
    echo Build cancelled.
    pause
    exit /b 0
)

if "%choice%"=="1" (
    echo.
    echo [STEP 3/3] Building installer...
    echo.
    call npm run build
    goto :build_done
)

if "%choice%"=="2" (
    echo.
    echo [STEP 3/3] Building portable version...
    echo.
    call npm run build:portable
    goto :build_done
)

if "%choice%"=="3" (
    echo.
    echo [STEP 3/3] Building installer...
    echo.
    call npm run build
    echo.
    echo [INFO] Now building portable version...
    echo.
    call npm run build:portable
    goto :build_done
)

echo Invalid choice!
pause
exit /b 1

:build_done
echo.
echo ========================================
echo   Build Complete!
echo ========================================
echo.
echo Output files are in: build\dist\
echo.
echo You can now install the application by running:
echo   - Qwen Code Desktop Setup x64.exe
echo.
pause
