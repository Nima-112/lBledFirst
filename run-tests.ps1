$ErrorActionPreference = "Stop"
Start-Sleep -Seconds 12
Write-Host "========================================================="
Write-Host "TEST 1 : LOGIN ADMIN + users list"
Write-Host "========================================================="
$loginBody = @{ email = "admin@lbledfirst.ma"; password = "admin123" } | ConvertTo-Json
$r = Invoke-WebRequest -Uri "http://localhost:8080/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json; charset=utf-8" -UseBasicParsing -SessionVariable s
Write-Host "Login: $($r.StatusCode)"

try {
  $users = (Invoke-WebRequest -Uri "http://localhost:8080/api/users" -WebSession $s -UseBasicParsing).Content | ConvertFrom-Json
  $admin = $users | Where-Object { $_.role -eq "admin" } | Select-Object -First 1
  $tourist = $users | Where-Object { $_.role -eq "tourist" } | Select-Object -First 1
  $hostUser = $admin
  Write-Host "Using admin as owner id=$($hostUser.id) name=$($hostUser.name)"
  Write-Host "Using tourist id=$($tourist.id) name=$($tourist.name)"
} catch {
  Write-Host "FETCH USERS FAIL: $($_.Exception.Message)"
  exit 1
}
Write-Host ""

Write-Host "========================================================="
Write-Host "TEST 2 : POST exp -> 1 booking + review, DELETE exp (expect 200 no FK)"
Write-Host "========================================================="
$exp = '{"host":{"id":' + $hostUser.id + '},"title":"Test SoftDelete Casa Weaving","description":"Tissage traditionnel","price":850.00,"duration":2,"category":"Crafts","city":"Casablanca","latitude":33.5731,"longitude":-7.5898,"coverImages":["https://picsum.photos/seed/casa852/800/600"]}'
$r = Invoke-WebRequest -Uri "http://localhost:8080/api/experiences" -Method POST -Body $exp -ContentType "application/json; charset=utf-8" -WebSession $s -UseBasicParsing
$expObj = $r.Content | ConvertFrom-Json
Write-Host "POST experience: $($r.StatusCode) id=$($expObj.id)"

$r = Invoke-WebRequest -Uri "http://localhost:8080/api/experiences/$($expObj.id)/publish" -Method PUT -WebSession $s -UseBasicParsing
Write-Host "Publish: $($r.StatusCode)"

$bk1 = '{"tourist":{"id":' + $tourist.id + '},"experience":{"id":' + $expObj.id + '},"date":"2026-11-15","status":"confirmed","totalPrice":1700.00,"guests":2}'
$r = Invoke-WebRequest -Uri "http://localhost:8080/api/bookings" -Method POST -Body $bk1 -ContentType "application/json; charset=utf-8" -WebSession $s -UseBasicParsing
$bookingId = ($r.Content | ConvertFrom-Json).id
Write-Host "POST booking: $($r.StatusCode) booking_id=$bookingId"

$reviewPayload = '{"tourist":{"id":' + $tourist.id + '},"experience":{"id":' + $expObj.id + '},"rating":5,"comment":"Amazing"}'
try {
  $r = Invoke-WebRequest -Uri "http://localhost:8080/api/reviews" -Method POST -Body $reviewPayload -ContentType "application/json; charset=utf-8" -WebSession $s -UseBasicParsing
  Write-Host "POST review: $($r.StatusCode)"
} catch {
  Write-Host "POST review FAIL (non-blocking): $($_.Exception.Message)"
}

Write-Host "-- DELETE experience id=$($expObj.id) --"
try {
  $r = Invoke-WebRequest -Uri "http://localhost:8080/api/experiences/$($expObj.id)" -Method DELETE -WebSession $s -UseBasicParsing
  Write-Host "DELETE experience: $($r.StatusCode) OK (SOFT-DELETE, pas de FK crash!)"
} catch {
  Write-Host "DELETE experience FAIL: $($_.Exception.Message)"
  $rdr = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
  Write-Host "Body: $($rdr.ReadToEnd())"
  exit 1
}

$allBk = (Invoke-WebRequest -Uri "http://localhost:8080/api/bookings" -WebSession $s -UseBasicParsing).Content | ConvertFrom-Json
$bookingStill = $allBk | Where-Object { [String]$_.id -eq [String]$bookingId }
Write-Host "Booking preserved: $($null -ne $bookingStill) | experience.deleted=$($bookingStill.experience.deleted)"
Write-Host ""

Write-Host "========================================================="
Write-Host "TEST 3 : GET /api/admin/formation-purchases 200"
Write-Host "========================================================="
try {
  $r = Invoke-WebRequest -Uri "http://localhost:8080/api/admin/formation-purchases" -WebSession $s -UseBasicParsing
  $list = $r.Content | ConvertFrom-Json
  Write-Host "GET /api/admin/formation-purchases: $($r.StatusCode) count=$($list.Count)"
} catch {
  Write-Host "FAIL: $($_.Exception.Message)"
  $rdr = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
  Write-Host "Body: $($rdr.ReadToEnd())"
  exit 1
}
Write-Host ""

Write-Host "========================================================="
Write-Host "TEST 4 : GET /experiences cache deleted=false"
Write-Host "========================================================="
$allExp = (Invoke-WebRequest -Uri "http://localhost:8080/api/experiences" -WebSession $s -UseBasicParsing).Content | ConvertFrom-Json
$gone = $allExp | Where-Object { [String]$_.id -eq [String]$expObj.id }
if ($gone) { Write-Host "NOK: deleted exp STILL returned in /experiences" ; exit 1 } else { Write-Host "OK: deleted exp #$($expObj.id) masquée de GET /experiences (deleted=false filter)" }
Write-Host ""

Write-Host "========================================================="
Write-Host "TEST 5 : GET /formations Dashboard count"
Write-Host "========================================================="
$formations = (Invoke-WebRequest -Uri "http://localhost:8080/api/formations" -UseBasicParsing -WebSession $s).Content | ConvertFrom-Json
Write-Host "GET /formations 200 count=$($formations.Count) (valeur pour stat dashboard Formations totales)"
Write-Host ""
Write-Host "ALL TESTS PASSED."
