$req = [System.Net.HttpWebRequest]::Create("http://localhost:3001/")
$req.Timeout = 8000
try {
    $res = $req.GetResponse()
    Write-Host "Success: $($res.StatusCode)"
} catch [System.Net.WebException] {
    $resp = $_.Exception.Response
    if ($resp) {
        $stream = $resp.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $text = $reader.ReadToEnd()
        Write-Host "Response error text:"
        Write-Host $text.Substring(0, [Math]::Min(1500, $text.Length))
    } else {
        Write-Host "No response: $($_.Exception.Message)"
    }
}
