docker-compose up --build -d

try {
    Write-Host "========== RUNNING INTEGRATION TESTS ==========`n"
    composer integration-tests
    exit $LASTEXITCODE
}
finally {
    Write-Host "`n========== CLEANING UP CONTAINERS ==========`n"
    docker compose down 2>&1 |
            Where-Object {
                $_ -notmatch '(Stopping|Removing|Removed|Stopped) $'
            }
}

