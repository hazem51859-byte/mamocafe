$env:NODE_ENV = "production"
$env:ENFORCE_ACTIVATION = "true"
$env:PORT = "5050"

$logOut = "C:\ProgramData\ZoTechPOS\out.log"
$logErr = "C:\ProgramData\ZoTechPOS\err.log"

$proc = Start-Process `
    -FilePath "z:\Downloads\Market\ZoTech_Market_POS_Windows\runtime\node.exe" `
    -ArgumentList "z:\Downloads\Market\ZoTech_Market_POS_Windows\server\index.js" `
    -WorkingDirectory "z:\Downloads\Market\ZoTech_Market_POS_Windows" `
    -PassThru -NoNewWindow `
    -RedirectStandardOutput $logOut `
    -RedirectStandardError $logErr

Start-Sleep -Seconds 5

Write-Host "=== STDOUT ==="
if (Test-Path $logOut) { Get-Content $logOut }

Write-Host "=== STDERR ==="
if (Test-Path $logErr) { Get-Content $logErr }

Write-Host "=== PORT 5050 ==="
netstat -ano | Select-String "5050"

Write-Host "=== Process Status ==="
if ($proc.HasExited) { Write-Host "Process EXITED with code: $($proc.ExitCode)" } else { Write-Host "Process RUNNING with PID: $($proc.Id)" }
