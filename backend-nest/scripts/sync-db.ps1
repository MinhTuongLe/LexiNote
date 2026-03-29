$LocalDB = "postgresql://postgres:postgres@localhost:5432/lexinote"
$LivePooler = "postgresql://postgres.htrrsvagyxbvbmudgqgp:Minhtuongle%4009122002@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
$LiveDirect = "postgresql://postgres:Minhtuongle%4009122002@db.htrrsvagyxbvbmudgqgp.supabase.co:5432/postgres"

$Mode = $args[0]

if ($Mode -eq "push") {
    $Src = $LocalDB
    $Dst = $LiveDirect
    Write-Host "MODE: PUSH  LOCAL -> LIVE (Supabase)" -ForegroundColor Yellow
} elseif ($Mode -eq "pull") {
    $Src = $LiveDirect
    $Dst = $LocalDB
    Write-Host "MODE: PULL  LIVE (Supabase) -> LOCAL" -ForegroundColor Yellow
} else {
    Write-Host "Usage: npm run db:push-live  OR  npm run db:pull-live"
    exit 1
}

$Confirm = Read-Host "Are you sure? This will OVERWRITE data at destination! (y/N)"
if ($Confirm -ne "y") { Write-Host "Cancelled."; exit 0 }

if ($Mode -eq "push") {
    Write-Host "Step 1/3: Syncing Schema to Live via Direct URL..." -ForegroundColor Cyan
    $env:DIRECT_URL = $LiveDirect
    $env:DATABASE_URL = $LivePooler
    npx prisma db push --accept-data-loss
}

Write-Host "Step 2/3: Dumping source database..." -ForegroundColor Cyan
pg_dump --dbname=$Src --clean --if-exists --no-owner --no-privileges --file=db_sync_temp.sql

Write-Host "Step 3/3: Importing into destination..." -ForegroundColor Cyan
psql --dbname=$Dst --file=db_sync_temp.sql

if (Test-Path db_sync_temp.sql) {
    Remove-Item db_sync_temp.sql
}

if ($Mode -eq "pull") {
    Write-Host "Refreshing Prisma Client..." -ForegroundColor Cyan
    npx prisma generate
}

Write-Host "SUCCESS: Done!" -ForegroundColor Green
