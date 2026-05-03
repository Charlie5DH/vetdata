# Windows PowerShell deploy: pushes the project to the droplet over SSH using
# a tar pipe (no rsync required — Windows 10+ ships tar.exe and OpenSSH).
#
# Usage (from the project root, e.g. E:\Private\vetdata):
#
#   .\scripts\deploy.ps1 vetdata@157.245.131.216
#   .\scripts\deploy.ps1 vetdata@157.245.131.216 -Up
#
# -Up also runs `docker compose ... up -d --build` on the droplet after sync.
#
# If PowerShell blocks the script, allow it for this session:
#   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

[CmdletBinding()]
param(
    [Parameter(Mandatory = $true, Position = 0)]
    [string]$Remote,

    [switch]$Up
)

$ErrorActionPreference = 'Stop'

# Move to the repo root (one level up from this script).
$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot
Write-Host "==> Project root: $repoRoot" -ForegroundColor Cyan

# Excludes mirror scripts/deploy.sh.
$excludes = @(
    '--exclude=./.git',
    '--exclude=./.venv',
    '--exclude=./venv',
    '--exclude=./frontend/node_modules',
    '--exclude=./frontend/dist',
    '--exclude=./frontend/build',
    '--exclude=./.vscode',
    '--exclude=./.idea',
    '--exclude=./.env',
    '--exclude=./.env.local',
    '--exclude=./.env.production',
    '--exclude=./backend/.env',
    '--exclude=./backend/.env.local',
    '--exclude=./backend/.env.production',
    '--exclude=./frontend/.env',
    '--exclude=./frontend/.env.local',
    '--exclude=*/__pycache__',
    '--exclude=*.pyc',
    '--exclude=*.log'
)

Write-Host "==> Building tar stream and piping to $Remote" -ForegroundColor Cyan

# Make sure the destination exists, then untar into it. Existing
# .env.production files on the server are NOT touched (excluded above).
$remoteSetup = "mkdir -p ~/vetdata && tar -xzf - -C ~/vetdata"

# Use cmd.exe to run a true shell pipeline (PowerShell's pipeline is
# object-based and won't pipe binary streams to ssh.exe correctly).
$tarArgs = ($excludes -join ' ') + ' -czf - .'
$cmd = "tar $tarArgs | ssh $Remote `"$remoteSetup`""
Write-Host "    $cmd" -ForegroundColor DarkGray
& cmd.exe /c $cmd
if ($LASTEXITCODE -ne 0) {
    throw "tar | ssh failed with exit code $LASTEXITCODE"
}

Write-Host "==> Sync complete." -ForegroundColor Green

if ($Up) {
    Write-Host "==> Rebuilding and restarting stack on $Remote" -ForegroundColor Cyan
    # We rely on .env (auto-loaded by compose). The first deploy creates
    # it from .env.production.example; see DEPLOY.md.
    & ssh $Remote "cd ~/vetdata && docker compose -f docker-compose.prod.yml up -d --build"
    if ($LASTEXITCODE -ne 0) { throw "docker compose up failed (exit $LASTEXITCODE)" }
    Write-Host "==> Tailing logs (Ctrl-C to detach)..." -ForegroundColor Cyan
    & ssh -t $Remote "cd ~/vetdata && docker compose -f docker-compose.prod.yml logs -f --tail=50"
}
