@echo off
REM 🚀 GACP AWS EC2 Deployment Helper
REM This script helps you connect to EC2 and run deployment

SET SERVER=13.214.184.107
SET USER=ec2-user
SET KEY_PATH=%USERPROFILE%\.ssh\2P_GACP_Application.pem

echo =========================================
echo    GACP AWS EC2 Deployment Helper
echo =========================================
echo.
echo Server: %SERVER%
echo User: %USER%
echo Key: %KEY_PATH%
echo.

REM Check if .pem file exists
IF NOT EXIST "%KEY_PATH%" (
    echo [ERROR] .pem file not found at: %KEY_PATH%
    echo.
    echo Please copy your .pem file to: %KEY_PATH%
    echo Or update KEY_PATH in this script
    echo.
    pause
    exit /b 1
)

echo Choose an option:
echo [1] SSH Connect (manual deployment)
echo [2] Copy deploy script to server
echo [3] Run deployment on server
echo [4] Check server status
echo.
SET /P CHOICE=Enter choice (1-4): 

IF "%CHOICE%"=="1" (
    echo.
    echo Connecting to EC2...
    ssh -i "%KEY_PATH%" %USER%@%SERVER%
)

IF "%CHOICE%"=="2" (
    echo.
    echo Copying deploy script to server...
    scp -i "%KEY_PATH%" scripts\deploy-aws.sh %USER%@%SERVER%:/home/ec2-user/
    echo Done! Run option 3 to execute
)

IF "%CHOICE%"=="3" (
    echo.
    echo Running deployment on server...
    ssh -i "%KEY_PATH%" %USER%@%SERVER% "chmod +x deploy-aws.sh && ./deploy-aws.sh"
)

IF "%CHOICE%"=="4" (
    echo.
    echo Checking server status...
    ssh -i "%KEY_PATH%" %USER%@%SERVER% "pm2 status && curl -s http://localhost:3000/api/v2/health"
)

pause
