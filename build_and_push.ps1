# Docker Build and Push Script for AI Meeting Companion

$DOCKER_USERNAME = "petros1234"
$SERVER_IMAGE_NAME = "ai-meeting-companion-server"
$CLIENT_IMAGE_NAME = "ai-meeting-companion-client"
$TAG = "latest"

Write-Host "Starting Docker Build Process..." -ForegroundColor Green

# 1. Build Server Image
Write-Host "Building Server Image..." -ForegroundColor Cyan
# Using ${} to properly delimit variable names from the colon
docker build -t "${DOCKER_USERNAME}/${SERVER_IMAGE_NAME}:${TAG}" ./server
if ($LASTEXITCODE -ne 0) {
  Write-Error "Server build failed!"
  exit 1
}

# 2. Build Client Image
Write-Host "Building Client Image..." -ForegroundColor Cyan
docker build -t "${DOCKER_USERNAME}/${CLIENT_IMAGE_NAME}:${TAG}" ./client
if ($LASTEXITCODE -ne 0) {
  Write-Error "Client build failed!"
  exit 1
}

# 3. Push Images to Docker Hub
Write-Host "Pushing Images to Docker Hub..." -ForegroundColor Yellow

Write-Host "Pushing Server Image..."
docker push "${DOCKER_USERNAME}/${SERVER_IMAGE_NAME}:${TAG}"
if ($LASTEXITCODE -ne 0) {
  Write-Error "Failed to push server image. Make sure you are logged in to Docker Hub (docker login)."
  exit 1
}

Write-Host "Pushing Client Image..."
docker push "${DOCKER_USERNAME}/${CLIENT_IMAGE_NAME}:${TAG}"
if ($LASTEXITCODE -ne 0) {
  Write-Error "Failed to push client image. Make sure you are logged in to Docker Hub (docker login)."
  exit 1
}

Write-Host "Build and Push Completed Successfully!" -ForegroundColor Green
