function CompileTypeScriptFiles($folder) {
    $tsFiles = Get-ChildItem $folder -Filter "*.ts"
    $tsFiles | ForEach-Object {
        $tsFile = $_.FullName;
        $options = $tsFile
        Write-Host "Compiling Script: " $tsFile
        cmd.exe /c "tsc " $_.FullName
    }
}


CompileTypeScriptFiles('./')
CompileTypeScriptFiles('./tests')
cmd.exe /c "mocha .\tests\_suite.js"



