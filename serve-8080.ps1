# Static file server on port 8080 using .NET HttpListener (Windows, no Python/Node).
$ErrorActionPreference = 'Stop'
$port = 8080
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$root = [System.IO.Path]::GetFullPath($root)
$rootFull = $root.TrimEnd('\') + '\'

$mime = @{
    '.html' = 'text/html; charset=utf-8'
    '.htm'  = 'text/html; charset=utf-8'
    '.js'   = 'application/javascript; charset=utf-8'
    '.mjs'  = 'application/javascript; charset=utf-8'
    '.css'  = 'text/css; charset=utf-8'
    '.json' = 'application/json; charset=utf-8'
    '.svg'  = 'image/svg+xml; charset=utf-8'
    '.xml'  = 'application/xml; charset=utf-8'
    '.wasm' = 'application/wasm'
    '.png'  = 'image/png'
    '.jpg'  = 'image/jpeg'
    '.jpeg' = 'image/jpeg'
    '.gif'  = 'image/gif'
    '.webp' = 'image/webp'
    '.ico'  = 'image/x-icon'
    '.woff' = 'font/woff'
    '.woff2'= 'font/woff2'
    '.ttf'  = 'font/ttf'
    '.otf'  = 'font/otf'
    '.eot'  = 'application/vnd.ms-fontobject'
    '.map'  = 'application/json'
    '.txt'  = 'text/plain; charset=utf-8'
    '.md'   = 'text/markdown; charset=utf-8'
}

$listener = New-Object System.Net.HttpListener
[void]$listener.Prefixes.Add("http://127.0.0.1:$port/")
[void]$listener.Prefixes.Add("http://localhost:$port/")
try { [void]$listener.Prefixes.Add("http://[::1]:$port/") } catch { }

try {
    $listener.Start()
} catch {
    Write-Host ("Cannot bind port {0}: {1}" -f $port, $_.Exception.Message)
    Write-Host 'Close programs using this port or edit $port in serve-8080.ps1.'
    exit 1
}

Write-Host ("Root: http://127.0.0.1:{0}/" -f $port)
Write-Host ("Dir:  {0}" -f $rootFull)
Write-Host 'Close this window to stop.'
Write-Host ''

function Send-Status($response, $code, $text, $reqMethod) {
    $bytes = [Text.Encoding]::UTF8.GetBytes($text)
    $response.StatusCode = $code
    $response.ContentType = 'text/plain; charset=utf-8'
    $response.ContentLength64 = $bytes.Length
    if ($reqMethod -ne 'HEAD') {
        $response.OutputStream.Write($bytes, 0, $bytes.Length)
    }
    $response.Close()
}

while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    $req = $ctx.Request
    $res = $ctx.Response
    try {
        $raw = $req.Url.AbsolutePath
        if ([string]::IsNullOrEmpty($raw) -or $raw -eq '/') {
            $rel = 'index.html'
        } else {
            $decoded = [System.Uri]::UnescapeDataString($raw.TrimStart('/'))
            $rel = $decoded.Replace('/', [System.IO.Path]::DirectorySeparatorChar)
        }
        $candidate = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($root, $rel))
        if (-not $candidate.StartsWith($rootFull, [StringComparison]::OrdinalIgnoreCase)) {
            Send-Status $res 403 'Forbidden' $req.HttpMethod
            continue
        }
        if ([System.IO.Directory]::Exists($candidate)) {
            $candidate = [System.IO.Path]::Combine($candidate, 'index.html')
        }
        if (-not [System.IO.File]::Exists($candidate)) {
            Send-Status $res 404 'Not found' $req.HttpMethod
            continue
        }
        $ext = [System.IO.Path]::GetExtension($candidate).ToLowerInvariant()
        $contentType = if ($mime.ContainsKey($ext)) { $mime[$ext] } else { 'application/octet-stream' }
        $bytes = [System.IO.File]::ReadAllBytes($candidate)
        $res.StatusCode = 200
        $res.ContentType = $contentType
        $res.ContentLength64 = $bytes.Length
        if ($req.HttpMethod -ne 'HEAD') {
            $res.OutputStream.Write($bytes, 0, $bytes.Length)
        }
        $res.Close()
    } catch {
        try { $res.Abort() } catch { }
    }
}
