$apiKey = "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"
$imgPath = "$env:TEMP\hand_test.jpg"
$imgBytes = [System.IO.File]::ReadAllBytes($imgPath)
$base64 = [System.Convert]::ToBase64String($imgBytes)
$dataUri = "data:image/jpeg;base64,$base64"

$candidates = @(
    "meta-llama/llama-3.2-11b-vision-instruct:free",
    "meta-llama/llama-3.2-90b-vision-instruct:free",
    "nvidia/nemotron-nano-12b-v2-vl:free",
    "mistralai/mistral-small-3.1-24b-instruct:free"
)

$prompt = 'Look at this palm image. Reply ONLY with JSON: {"obs":"one sentence"}'

foreach ($model in $candidates) {
    Write-Host "`nMODEL: $model"
    $payload = @{
        model       = $model
        temperature = 0.5
        max_tokens  = 100
        messages    = @(
            @{
                role    = "user"
                content = @(
                    @{ type = "text"; text = $prompt }
                    @{ type = "image_url"; image_url = @{ url = $dataUri } }
                )
            }
        )
    }
    
    $jsonPayload = $payload | ConvertTo-Json -Depth 10 -Compress
    
    $start = Get-Date
    try {
        $response = Invoke-RestMethod -Uri "https://openrouter.ai/api/v1/chat/completions" `
            -Method Post `
            -Headers @{
            "Authorization" = "Bearer $apiKey"
            "Content-Type"  = "application/json"
        } `
            -Body $jsonPayload `
            -TimeoutSec 60
        
        $duration = (Get-Date) - $start
        $text = $response.choices[0].message.content
        Write-Host "OK ($($duration.TotalSeconds)s): $text"
    }
    catch {
        $duration = (Get-Date) - $start
        Write-Host "FAIL ($($duration.TotalSeconds)s): $($_.Exception.Message)"
    }
    Start-Sleep -Seconds 1
}
