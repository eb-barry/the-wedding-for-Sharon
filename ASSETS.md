# 素材放置說明（ASSETS）

請用正式檔案**覆蓋同名占位檔**。格式統一：

- 圖片：`.webp`
- 音樂：`bgm.mp3`

## 目錄結構

```text
assets/
  welcome/
    welcome.webp              # 開場歡迎圖（建議直式 1080×1920 或相近）
  audio/
    bgm.mp3                   # 背景音樂（會 loop）
  icons/
    icon-192.png              # PWA 圖示
    icon-512.png
  photos/
    room-01/
      manifest.json           # 列出該房照片檔名與順序
      room-01-01.webp … room-01-18.webp   # 建議每房 16–18 張
    room-02/
      manifest.json
      room-02-01.webp …
    room-03/
      manifest.json
      room-03-01.webp …
  textures/
    floors/
      floor-01.webp           # → room-01
      floor-02.webp           # → room-02
      floor-03.webp           # → room-03
    ceilings/
      C0-01.webp              # → room-01（建議 1024×1024）
      C0-02.webp              # → room-02
      C0-03.webp              # → room-03
    walls/
      wall-01.webp
      wall-02.webp
      wall-03.webp
    doors/
      door-01.webp            # room-01 通往 room-02
      door-02-1.webp          # room-02 通往 room-01（西側）
      door-02-2.webp          # room-02 通往 room-03（東側）
      door-03.webp            # room-03 通往 room-02
    frames/
      classic-01.webp         # room-01 外框（建議長條貼圖，寬 >> 高）
      classic-02.webp
      classic-03.webp
      inner-01.webp           # room-01 內框（同樣建議長條貼圖）
      inner-02.webp
      inner-03.webp
```

## 照片 manifest 範例

`assets/photos/room-01/manifest.json`：

```json
{
  "roomId": "room-01",
  "items": [
    "room-01-01.webp",
    "room-01-02.webp",
    "room-01-03.webp"
  ]
}
```

- 檔名必須與資料夾內實際檔案一致
- 順序即掛牆順序
- **不需要**標題／說明欄位
- 建議單邊約 1600–2048px，避免 repo 過大與手機載入過慢

## 固定材質對應

| 展間 | 地板 | 天花板 | 牆 | 外框 | 內框 | 門 |
|------|------|--------|----|------|------|----|
| room-01 | floor-01 | C0-01 | wall-01 | classic-01 | inner-01 | door-01 |
| room-02 | floor-02 | C0-02 | wall-02 | classic-02 | inner-02 | door-02-1、door-02-2 |
| room-03 | floor-03 | C0-03 | wall-03 | classic-03 | inner-03 | door-03 |

對應程式：`js/config.js` 的 `ROOM_MATERIALS`。天花板檔請放在 `assets/textures/ceilings/`。

## Welcome 文案

目前草稿在 `js/config.js`：

- `WELCOME_TITLE`
- `WELCOME_BODY`

之後可直接改文字，不必動版面結構。
