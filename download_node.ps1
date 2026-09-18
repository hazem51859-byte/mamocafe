[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$url = "https://nodejs.org/dist/v22.23.1/win-x64/node.exe"
$out = "z:\Downloads\Market\ZoTech_Market_POS_Windows\runtime\node_v22.exe"
Write-Host "Downloading Node.js v22.23.1..."
Invoke-WebRequest -Uri $url -OutFile $out -UseBasicParsing
Write-Host "Done! File size:"
(Get-Item $out).Length
