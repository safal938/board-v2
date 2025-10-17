# 🚀 Quick Vercel Deployment Script

Write-Host "🚀 Deploying Canvas Board API to Vercel..." -ForegroundColor Cyan
Write-Host ""

# Navigate to board directory
Set-Location "d:\Office_work\EASL\demofinal\board"

# Check if Vercel CLI is installed
Write-Host "📦 Checking Vercel CLI..." -ForegroundColor Yellow
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue

if (-not $vercelInstalled) {
    Write-Host "❌ Vercel CLI not found. Installing..." -ForegroundColor Red
    npm install -g vercel
    Write-Host "✅ Vercel CLI installed!" -ForegroundColor Green
} else {
    Write-Host "✅ Vercel CLI is already installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "📋 Deployment options:" -ForegroundColor Cyan
Write-Host "1. Deploy to production (recommended)"
Write-Host "2. Deploy to preview"
Write-Host "3. Skip deployment"
Write-Host ""

$choice = Read-Host "Enter your choice (1-3)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "🚀 Deploying to production..." -ForegroundColor Cyan
        vercel --prod
        Write-Host ""
        Write-Host "✅ Deployment complete!" -ForegroundColor Green
        Write-Host "🌐 Your API is now live at: https://board-inky-seven.vercel.app/api/" -ForegroundColor Green
    }
    "2" {
        Write-Host ""
        Write-Host "🚀 Deploying to preview..." -ForegroundColor Cyan
        vercel
        Write-Host ""
        Write-Host "✅ Preview deployment complete!" -ForegroundColor Green
    }
    "3" {
        Write-Host ""
        Write-Host "⏭️  Skipping deployment" -ForegroundColor Yellow
    }
    default {
        Write-Host ""
        Write-Host "❌ Invalid choice" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "1. Test API: curl https://board-inky-seven.vercel.app/api/health"
Write-Host "2. Test board data: curl https://board-inky-seven.vercel.app/api/board-items"
Write-Host "3. Run voice controller: cd ..\python_meet_client && python voice_canvas_function_calling.py"
Write-Host ""
Write-Host "✨ Happy coding!" -ForegroundColor Magenta
