@echo off
title Book AI App
echo ==============================================
echo   Starting Local Server (http://localhost:3000)
echo ==============================================

:: Open default browser after a brief delay
start "" http://localhost:3000

:: Start the Next.js development server using npm
npm run dev

pause
