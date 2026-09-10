3000..3005 | ForEach-Object {
    $port = $_
    $client = New-Object System.Net.Sockets.TcpClient
    try {
        $client.Connect("127.0.0.1", $port)
        Write-Host "Port $port is OPEN"
        $client.Close()
    } catch {
        Write-Host "Port $port is closed"
    }
}
