Get-CimInstance Win32_Process -Filter "name='node.exe'" | Select-Object ProcessId, ExecutablePath, CommandLine | Format-List
