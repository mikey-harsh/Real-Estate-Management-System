$ErrorActionPreference = 'Stop'
$base = 'http://localhost:4000'
Write-Output '== Registering test seller =='
try {
  $body = @{ name='E2E Seller'; email='e2e_seller@localdev.test'; phone='0000000000'; password='Password123!'; role='seller' } | ConvertTo-Json
  $reg = Invoke-RestMethod -Uri "$base/api/users/register" -Method Post -Body $body -ContentType 'application/json'
  Write-Output ($reg | ConvertTo-Json -Compress)
} catch {
  Write-Output "Register failed: $($_.Exception.Message)"
}

Write-Output '== Logging in =='
try {
  $loginBody = @{ email='e2e_seller@localdev.test'; password='Password123!' } | ConvertTo-Json
  $login = Invoke-RestMethod -Uri "$base/api/users/login" -Method Post -Body $loginBody -ContentType 'application/json'
  Write-Output ($login | ConvertTo-Json -Compress)
  $token = $login.token
} catch {
  Write-Output "Login failed: $($_.Exception.Message)"
  if ($_.Exception.Response) { Write-Output ($_.Exception.Response.Content.ReadAsStringAsync().Result) }
  exit 1
}

Write-Output '== Posting property with image (curl) =='
$postCmd = 'curl.exe -s -X POST "' + $base + '/api/user/properties" -H "Authorization: Bearer ' + $token + '" -F "title=E2E Test Listing" -F "location=E2E City" -F "price=5000000" -F "beds=2" -F "baths=1" -F "sqft=800" -F "type=Flat" -F "availability=For Sale" -F "description=E2E test property" -F "phone=0000000000" -F "amenities=[]" -F "images=@backend\\uploads\\test-image.jpg"'
Write-Output ("Running: " + $postCmd)
$curlOut = Invoke-Expression $postCmd
Write-Output $curlOut

Write-Output '== Fetching public product list =='
try {
  $list = Invoke-RestMethod -Uri "$base/api/products/list" -Method Get
  Write-Output ($list | ConvertTo-Json -Compress)
  $found = $false
  foreach ($p in $list.property) { if ($p.title -eq 'E2E Test Listing') { $found = $true } }
  Write-Output ("FOUND:E2E Test Listing=" + $found)
} catch {
  Write-Output "List fetch failed: $($_.Exception.Message)"
}
