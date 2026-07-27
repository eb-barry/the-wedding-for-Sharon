# Sharon's Wedding Gallery

手機瀏覽器即可開啟的 **3D 婚禮照片展館**（支援 PWA）。

參考 Photo Effects 的 F7 Virtual Gallery，改為：

- 材質全部預設固定，無需使用者調整
- 照片預先放在 repo
- Welcome 開場圖 + 操作說明
- 進入後循環播放 `bgm.mp3`
- 預設啟用陀螺儀（需使用者同意授權）
- 導覽 HUD：重設視角、靜音

## 三個展間

| 展間 | 形狀 | 連通 |
|------|------|------|
| room-01 | 方形 | 東門 → room-02 |
| room-02 | 圓形 | 西門 → room-01、東門 → room-03 |
| room-03 | 方形 | 西門 → room-02 |

## 本機預覽

用任何靜態伺服器開啟根目錄（需透過 `http://` 或 `https://`，不要用 `file://`）：

```bash
python3 -m http.server 8080
```

然後用手機同一區網連到電腦 IP，或用桌面瀏覽器開啟 `http://localhost:8080`。

## PWA

- `manifest.json` + `service-worker.js`
- 建議部署到 **HTTPS**（GitHub Pages / Cloudflare Pages）
- iOS 陀螺儀授權與「加入主畫面」都需要 HTTPS 環境

## 放置你的素材

請見 [ASSETS.md](./ASSETS.md)。目前 repo 內是**占位色塊／測試音訊**，請替換成正式圖與音樂。

## 技術

- Vanilla JS ES Modules
- Three.js `0.170.0`（CDN）
- 無後端
