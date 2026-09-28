# 业主端图案资源（本地备份）

本目录存放业主端（生态/业主端.html）涉及到的所有图案，便于离线使用或另作他用。

## 已有本地文件

| 文件名 | 用途 | 来源 |
|--------|------|------|
| daoq-logo-gold.svg | 金色品牌 LOGO | 项目 assets 复制 |
| shuzhili-logo.svg | 数治理方 Logo（备用） | 项目 assets 复制 |
| secretary-avatar.svg | 智能管家头像 | 本地创建 |

## 外部图片（需下载）

以下图片来自 DiceBear API，运行 `download-images.ps1` 可批量下载到本目录。

### 头像类 (avataaars)
| 原 URL | 下载后文件名 |
|--------|--------------|
| seed=MySelf | avatar-myself.svg |
| seed=0~8 | avatar-0.svg ~ avatar-8.svg |
| seed=Li | avatar-li.svg |
| seed=Worker1 | avatar-worker1.svg |
| seed=Felix | avatar-felix.svg |
| seed=me | avatar-me.svg |

### AI/机器人类 (bottts)
| 原 URL | 下载后文件名 |
|--------|--------------|
| seed=AI | avatar-ai.svg |
| seed=SmartButler | avatar-smartbutler.svg |
| seed=Assistant | avatar-assistant.svg |
| seed=Helper | avatar-helper.svg |

### 其他
| 原 URL | 下载后文件名 |
|--------|--------------|
| notionists/seed=Butler | avatar-butler.svg |
| lorelei/seed=Smart | avatar-smart.svg |
| icons/seed=AI | avatar-icon-ai.svg |
| initials/seed=DocPage5 | avatar-docpage5.svg |
| initials/seed=User | avatar-initials-user.svg |

### 下载方式

在项目根目录运行：
```powershell
cd 生态\assets\owner
.\download-images.ps1
```

或手动访问上述 URL 并另存为对应文件名。

## 动态生成（无法预下载）

- **QR 码**：`https://api.qrserver.com/v1/create-qr-code/` — 根据 data 参数动态生成，需联网或改用本地 QR 库。
- **initials 按用户名**：`seed=${userName}` 随用户变化，可下载 `avatar-initials-user.svg` 作为默认占位。

## 业主端中的引用路径

- 品牌 LOGO：`../assets/daoq-logo-gold.svg`（项目根 assets）
- 智能管家头像：`assets/secretary-avatar.png`（可改为 `assets/owner/secretary-avatar.svg`）
- DiceBear：代码中为完整 URL，改为本地需替换为 `assets/owner/avatar-xxx.svg`
