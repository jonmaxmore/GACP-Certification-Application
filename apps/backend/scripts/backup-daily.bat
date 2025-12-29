@echo off
REM PostgreSQL Backup Script for Windows
REM Run this from Task Scheduler for daily backups

cd /d "%~dp0.."
call npm run backup

echo Backup completed at %date% %time%
