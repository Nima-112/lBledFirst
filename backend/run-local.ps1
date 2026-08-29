# Set error action to Stop to handle failures gracefully
$ErrorActionPreference = "Stop"

# Resolve path to the .env file at the project root
$envPath = Join-Path $PSScriptRoot "..\.env"

if (Test-Path $envPath) {
    Write-Host "Loading environment variables from $envPath ..." -ForegroundColor Cyan
    Get-Content $envPath | Where-Object { $_ -and -not $_.StartsWith("#") } | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$') {
            $name = $Matches[1].Trim()
            $value = $Matches[2].Trim().Trim('"').Trim("'")
            [System.Environment]::SetEnvironmentVariable($name, $value, [System.EnvironmentVariableTarget]::Process)
        }
    }
} else {
    Write-Warning "No .env file found at $envPath. Running with defaults."
}

Write-Host "Starting Spring Boot application..." -ForegroundColor Green
mvn spring-boot:run
