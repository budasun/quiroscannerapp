$apiKey = "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"

$imgPath = "$env:TEMP\hand_test.jpg"
if (-not (Test-Path $imgPath)) {
    Write-Host "Error: Image not found at $imgPath" -ForegroundColor Red
    exit
}
$imgBytes = [System.IO.File]::ReadAllBytes($imgPath)
$base64 = [System.Convert]::ToBase64String($imgBytes)
$dataUri = "data:image/jpeg;base64,$base64"

# Modelos a testear
$candidates = @(
    "meta-llama/llama-3.2-11b-vision-instruct:free",
    "meta-llama/llama-3.2-90b-vision-instruct:free",
    "nvidia/nemotron-nano-12b-v2-vl:free",
    "mistralai/mistral-small-3.1-24b-instruct:free"
)

$prompt = 'Look at this palm image. Reply ONLY with valid JSON: {"obs":"one sentence"}'

$results = @()

foreach ($model in $candidates) {
    Write-Host "`n>> Testing $model..." -ForegroundColor Cyan
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    
    $payload = [ordered]@{
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

    $body = $payload | ConvertTo-Json -Depth 10 -Compress

    try {
        $resp = Invoke-WebRequest `
            -Uri "https://openrouter.ai/api/v1/chat/completions" `
            -Method POST `
            -Headers @{
            "Authorization" = "Bearer $apiKey"
            "Content-Type"  = "application/json"
            "HTTP-Referer"  = "https://tao-health-scanner.vercel.app"
            "X-Title"       = "Tao Health Scanner"
        } `
            -Body $body `
            -TimeoutSec 60

        $stopwatch.Stop()
        $json = $resp.Content | ConvertFrom-Json
        $text = $json.choices[0].message.content
        $latency = $stopwatch.Elapsed.TotalSeconds
        
        Write-Host "OK ($($latency.ToString('F2'))s) -> $text" -ForegroundColor Green
        $results += [PSCustomObject]@{
            Model    = $model
            Status   = "OK"
            Latency  = $latency
            Response = $text
        }
    }
    catch {
        $stopwatch.Stop()
        $msg = "(Generic error)"
        try {
            if ($_.Exception.Response) {
                $stream = $_.Exception.Response.GetResponseStream()
                $reader = [System.IO.StreamReader]::new($stream)
                $msg = $reader.ReadToEnd()
            }
            else {
                $msg = $_.Exception.Message
            }
        }
        catch { $msg = $_.Exception.Message }
        
        Write-Host "FAIL ($($stopwatch.Elapsed.TotalSeconds.ToString('F2'))s) -> $msg" -ForegroundColor Red
        $results += [PSCustomObject]@{
            Model    = $model
            Status   = "FAIL"
            Latency  = $stopwatch.Elapsed.TotalSeconds
            Response = $msg
        }
    }
    
    Start-Sleep -Seconds 2
}

Write-Host "`n=== RESULTADOS FINAL DEL TESTEO ===" -ForegroundColor Yellow
$results | Sort-Object Latency | Format-Table -AutoSize
