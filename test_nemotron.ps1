$apiKey = "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"
$imgPath = "$env:TEMP\hand_test.jpg"
$imgBytes = [System.IO.File]::ReadAllBytes($imgPath)
$base64 = [System.Convert]::ToBase64String($imgBytes)
$dataUri = "data:image/jpeg;base64,$base64"
$model = "nvidia/nemotron-nano-12b-v2-vl:free"
$payload = @{
    model    = $model
    messages = @(
        @{
            role    = "user"
            content = @(
                @{ type = "text"; text = 'Reply ONLY with JSON: {"obs":"one sentence"}' }
                @{ type = "image_url"; image_url = @{ url = $dataUri } }
            )
        }
    )
}
$jsonPayload = $payload | ConvertTo-Json -Depth 10 -Compress
try {
    $response = Invoke-RestMethod -Uri "https://openrouter.ai/api/v1/chat/completions" `
        -Method Post `
        -Headers @{ "Authorization" = "Bearer $apiKey"; "Content-Type" = "application/json" } `
        -Body $jsonPayload -TimeoutSec 30
    Write-Host "NEMOTRON: $($response.choices[0].message.content)"
}
catch {
    Write-Host "NEMOTRON FAIL: $($_.Exception.Message)"
}
