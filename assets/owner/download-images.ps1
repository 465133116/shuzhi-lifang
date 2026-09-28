# 业主端图案本地下载脚本（需联网）
$base = if ($PSScriptRoot) { $PSScriptRoot } else { (Get-Location).Path }

$urls = @(
    @{url="https://api.dicebear.com/7.x/avataaars/svg?seed=MySelf"; file="avatar-myself.svg"},
    @{url="https://api.dicebear.com/7.x/avataaars/svg?seed=0"; file="avatar-0.svg"},
    @{url="https://api.dicebear.com/7.x/avataaars/svg?seed=1"; file="avatar-1.svg"},
    @{url="https://api.dicebear.com/7.x/avataaars/svg?seed=2"; file="avatar-2.svg"},
    @{url="https://api.dicebear.com/7.x/avataaars/svg?seed=3"; file="avatar-3.svg"},
    @{url="https://api.dicebear.com/7.x/avataaars/svg?seed=4"; file="avatar-4.svg"},
    @{url="https://api.dicebear.com/7.x/avataaars/svg?seed=5"; file="avatar-5.svg"},
    @{url="https://api.dicebear.com/7.x/avataaars/svg?seed=6"; file="avatar-6.svg"},
    @{url="https://api.dicebear.com/7.x/avataaars/svg?seed=7"; file="avatar-7.svg"},
    @{url="https://api.dicebear.com/7.x/avataaars/svg?seed=8"; file="avatar-8.svg"},
    @{url="https://api.dicebear.com/7.x/avataaars/svg?seed=Li"; file="avatar-li.svg"},
    @{url="https://api.dicebear.com/7.x/avataaars/svg?seed=Worker1"; file="avatar-worker1.svg"},
    @{url="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"; file="avatar-felix.svg"},
    @{url="https://api.dicebear.com/7.x/avataaars/svg?seed=me"; file="avatar-me.svg"},
    @{url="https://api.dicebear.com/7.x/bottts/svg?seed=AI&size=176&backgroundColor=b6e3f4"; file="avatar-ai.svg"},
    @{url="https://api.dicebear.com/7.x/bottts/svg?seed=SmartButler&size=176&backgroundColor=b6e3f4"; file="avatar-smartbutler.svg"},
    @{url="https://api.dicebear.com/7.x/bottts/svg?seed=Assistant&size=176&backgroundColor=ffdfbf"; file="avatar-assistant.svg"},
    @{url="https://api.dicebear.com/7.x/bottts/svg?seed=Helper&size=176&backgroundColor=b6e3f4"; file="avatar-helper.svg"},
    @{url="https://api.dicebear.com/7.x/notionists/svg?seed=Butler&size=176&backgroundColor=e6f7ff"; file="avatar-butler.svg"},
    @{url="https://api.dicebear.com/7.x/lorelei/svg?seed=Smart&size=176&backgroundColor=ffd5dc"; file="avatar-smart.svg"},
    @{url="https://api.dicebear.com/7.x/icons/svg?seed=AI&size=176&backgroundColor=1890ff"; file="avatar-icon-ai.svg"},
    @{url="https://api.dicebear.com/7.x/initials/svg?seed=DocPage5&backgroundColor=e6f7ff"; file="avatar-docpage5.svg"},
    @{url="https://api.dicebear.com/7.x/initials/svg?seed=User"; file="avatar-initials-user.svg"}
)

foreach ($item in $urls) {
    try {
        $outPath = Join-Path $base $item.file
        Invoke-WebRequest -Uri $item.url -OutFile $outPath -UseBasicParsing -ErrorAction Stop
        Write-Host "OK: $($item.file)"
    } catch {
        Write-Host "FAIL: $($item.file) - $_"
    }
}
Write-Host "Download complete."
