@echo off
echo ========================================
echo  Starting Gym Routine Backend (LOCAL)
echo  Profile: local (H2 in-memory DB)
echo  URL: http://localhost:8080
echo  H2 Console: http://localhost:8080/h2-console
echo ========================================
cd /d "%~dp0backend"
call mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=local
pause
