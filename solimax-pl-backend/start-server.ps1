# Start Solimax Backend Server
# Run this script to start the server with auto-restart on file changes

Set-Location $PSScriptRoot
Write-Host "Starting Solimax Backend Server..." -ForegroundColor Green
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

npm run dev
