$r = Invoke-RestMethod -Uri "https://openrouter.ai/api/v1/models"
$r.data | Where-Object { $_.id -like "*llama-3.2*vision*" } | Select-Object id, architecture
