@echo off
cd /d "%~dp0"
python server\server.py --port 8765
pause
