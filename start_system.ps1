# AniSense System Startup Script
# Starts: Ollama, Backend (FastAPI), and Frontend (React)

$IMS_DIR = "c:\Users\VIKRAM\Desktop\IMS"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  AniSense - Complete System Startup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Function to start process in new terminal
function Start-InTerminal {
    param(
        [string]$Title,
        [string]$Command,
        [string]$WorkingDir
    )

    Write-Host "[*] Starting: $Title..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$WorkingDir'; $Command" -WindowStyle Normal
    Start-Sleep -Seconds 2
}

# 1. Start Ollama
Write-Host "[1/3] Starting Ollama LLM Server..." -ForegroundColor Green
Start-InTerminal "Ollama Server" "ollama serve" $IMS_DIR

# 2. Start Backend (FastAPI)
Write-Host "[2/3] Starting Backend (FastAPI)..." -ForegroundColor Green
$backendCmd = "python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000"
Start-InTerminal "Backend Server" $backendCmd "$IMS_DIR\backend"

# 3. Start Frontend (React + Vite)
Write-Host "[3/3] Starting Frontend (React + Vite)..." -ForegroundColor Green
$frontendCmd = "npm run dev"
Start-InTerminal "Frontend Server" $frontendCmd "$IMS_DIR\frontend"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  All Services Started!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Services running on:" -ForegroundColor Yellow
Write-Host "  [OK] Ollama:   http://localhost:11434" -ForegroundColor White
Write-Host "  [OK] Backend:  http://localhost:8000" -ForegroundColor White
Write-Host "  [OK] Frontend: http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "Open your browser and visit: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C in each window to stop services" -ForegroundColor Gray
