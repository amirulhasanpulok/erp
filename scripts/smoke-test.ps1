$ErrorActionPreference = "Stop"

$gateway = "http://localhost:3000"

Write-Host "1) Health check..."
Invoke-RestMethod -Method Get -Uri "$gateway/api/v1/health" | Out-Null

Write-Host "2) Register/login sample user..."
$outletId = "00000000-0000-0000-0000-000000000001"
$userId = "00000000-0000-0000-0000-000000000001"
$email = "smoke.admin@example.com"
$password = "StrongPass123!"

try {
  Invoke-RestMethod -Method Post -Uri "$gateway/api/v1/auth/register" -ContentType "application/json" -Body (@{
    userId = $userId
    outletId = $outletId
    email = $email
    password = $password
    role = "hq_admin"
  } | ConvertTo-Json)
} catch {
  Write-Host "Register may already exist; continuing to login..."
}

$login = Invoke-RestMethod -Method Post -Uri "$gateway/api/v1/auth/login" -ContentType "application/json" -Body (@{
  outletId = $outletId
  email = $email
  password = $password
} | ConvertTo-Json)

$token = $login.accessToken
$authHeaders = @{ Authorization = "Bearer $token" }

Write-Host "3) Create outlet/product..."
Invoke-RestMethod -Method Post -Uri "$gateway/api/v1/outlets" -Headers $authHeaders -ContentType "application/json" -Body (@{
  name = "Smoke Outlet"
  hqVisible = $true
} | ConvertTo-Json) | Out-Null

$product = Invoke-RestMethod -Method Post -Uri "$gateway/api/v1/products" -Headers $authHeaders -ContentType "application/json" -Body (@{
  outletId = $outletId
  sku = "SMK-001"
  barcode = "123456789999"
  name = "Smoke Product"
} | ConvertTo-Json)

Write-Host "4) Run POS sale..."
Invoke-RestMethod -Method Post -Uri "$gateway/api/v1/sales" -Headers $authHeaders -ContentType "application/json" -Body (@{
  outletId = $outletId
  productId = $product.id
  quantity = "1.00"
  total = "100.00"
  paymentMethod = "cash"
} | ConvertTo-Json) | Out-Null

Write-Host "5) Place ecommerce order..."
$order = Invoke-RestMethod -Method Post -Uri "$gateway/api/v1/ecommerce/orders" -Headers $authHeaders -ContentType "application/json" -Body (@{
  outletId = $outletId
  productId = $product.id
  quantity = "1.00"
  customerName = "Smoke Customer"
  customerPhone = "01700000000"
  total = "120.00"
} | ConvertTo-Json)

Write-Host "6) Confirm payment callback..."
Invoke-RestMethod -Method Get -Uri "$gateway/api/v1/payments/success?orderId=$($order.id)" | Out-Null

Write-Host "7) Verify reporting/accounting/audit/notifications endpoints..."
Invoke-RestMethod -Method Get -Uri "$gateway/api/v1/reports/sales" -Headers $authHeaders | Out-Null
Invoke-RestMethod -Method Get -Uri "$gateway/api/v1/accounts/trial-balance" -Headers $authHeaders | Out-Null
Invoke-RestMethod -Method Get -Uri "$gateway/api/v1/audits?limit=5" -Headers $authHeaders | Out-Null
Invoke-RestMethod -Method Get -Uri "$gateway/api/v1/notifications?limit=5" -Headers $authHeaders | Out-Null

Write-Host "Smoke test completed successfully."

