@echo off
cd /d "%~dp0"
python tools\server.py --port 8765
pause
