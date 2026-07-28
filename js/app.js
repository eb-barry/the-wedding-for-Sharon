// Wedding Gallery - app bootstrap & tour session

import {
  APP_NAME,
  START_BUTTON_LABEL,
  TEXTURE_PATHS,
  WELCOME_BODY,
  WELCOME_TITLE
} from "./config.js";
import { getRoomFrameSettings, resolveRoomDoorTextures, resolveRoomSurfaceTextures } from "./assets.js";
import { GalleryAudio } from "./audio.js";
import { loadAllRoomPhotos } from "./photos.js";
import { Gallery3DScene } from "./scene.js";
import { loadFrameImage } from "./frames.js";
import { ROOM_MATERIALS } from "./config.js";

const root = document.getElementById("app");
const audio = new GalleryAudio();

let scene = null;
let photosByRoom = {};
let currentRoomId = 1;
let rebuildSerial = 0;
let gyroEnabled = false;
let sessionReady = false;

function isLikelyMobileDevice(){
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent || "");
}

function canUseDeviceOrientation(){
  return typeof window !== "undefined" && "DeviceOrientationEvent" in window;
}

function needsGyroPermissionPrompt(){
  return typeof DeviceOrientationEvent !== "undefined"
    && typeof DeviceOrientationEvent.requestPermission === "function";
}

function shouldOfferGyro(){
  return isLikelyMobileDevice() && canUseDeviceOrientation();
}

function escapeHtml(text){
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderShell(){
  root.innerHTML = `
    <main class="app-shell" id="appShell">
      <section class="welcome-screen" id="welcomeScreen" aria-label="歡迎畫面">
        <img class="welcome-image" src="${TEXTURE_PATHS.welcome}" alt="婚禮展館歡迎圖" decoding="async" />
        <div class="welcome-card">
          <h1 class="welcome-title">${escapeHtml(WELCOME_TITLE)}</h1>
          <p class="welcome-body">${escapeHtml(WELCOME_BODY).replaceAll("\n", "<br>")}</p>
          <button type="button" class="welcome-start-btn" id="startBtn">${escapeHtml(START_BUTTON_LABEL)}</button>
        </div>
      </section>

      <section class="loading-screen hidden" id="loadingScreen" aria-live="polite" aria-label="載入中">
        <div class="loading-card">
          <p class="loading-title">正在布置展間</p>
          <div class="loading-bar" aria-hidden="true"><span id="loadingBarFill"></span></div>
          <p class="loading-text" id="loadingText">準備中…</p>
        </div>
      </section>

      <section class="gyro-prompt hidden" id="gyroPrompt" role="dialog" aria-modal="true" aria-label="陀螺儀權限">
        <div class="gyro-prompt-card">
          <h2>啟用陀螺儀環顧</h2>
          <p>轉動手機即可環顧 3D 展館。請點「同意」以授權裝置方向感測（建議開啟）。</p>
          <div class="gyro-prompt-actions">
            <button type="button" class="primary-btn" id="gyroAllowBtn">同意</button>
            <button type="button" class="secondary-btn" id="gyroSkipBtn">改用拖曳操作</button>
          </div>
        </div>
      </section>

      <section class="tour-screen hidden" id="tourScreen" aria-label="3D 展館">
        <div class="tour-stage" id="tourStage"></div>
        <div class="tour-hud">
          <div class="tour-room-label" id="roomLabel">展間 1</div>
          <div class="tour-controls">
            <button type="button" class="hud-btn hud-btn-icon" id="resetViewBtn" aria-label="回到房間中心" title="回到房間中心">
              <img src="./assets/icons/icon-gps.webp" alt="" width="26" height="26" decoding="async" />
            </button>
            <button type="button" class="hud-btn" id="muteBtn" aria-label="靜音" title="靜音" aria-pressed="false">🔊</button>
          </div>
        </div>
        <p class="tour-hint" id="tourHint">點地板前進 · 點門換展間 · 拖曳或轉動手機環顧</p>
      </section>
    </main>
  `;
}

function setLoadingProgress(current, total, message){
  const fill = document.getElementById("loadingBarFill");
  const text = document.getElementById("loadingText");
  const ratio = total > 0 ? Math.min(1, current / total) : 0;
  if (fill) fill.style.width = `${Math.round(ratio * 100)}%`;
  if (text) text.textContent = message || `載入中 ${Math.round(ratio * 100)}%`;
}

function showOnly(id){
  ["welcomeScreen", "loadingScreen", "gyroPrompt", "tourScreen"].forEach(screenId => {
    document.getElementById(screenId)?.classList.toggle("hidden", screenId !== id);
  });
}

function updateMuteButton(){
  const btn = document.getElementById("muteBtn");
  if (!btn) return;
  btn.textContent = audio.muted ? "🔇" : "🔊";
  btn.setAttribute("aria-pressed", audio.muted ? "true" : "false");
  btn.setAttribute("aria-label", audio.muted ? "取消靜音" : "靜音");
  btn.title = audio.muted ? "取消靜音" : "靜音";
}

function updateRoomLabel(roomId){
  const label = document.getElementById("roomLabel");
  if (label) label.textContent = `展間 ${roomId}`;
}

async function ensureScene(){
  if (scene) return scene;
  const stage = document.getElementById("tourStage");
  scene = new Gallery3DScene(stage, {
    onDoorwaySelected: async ({ targetRoomId }) => {
      if (!targetRoomId || targetRoomId === currentRoomId) return;
      const fromRoomId = currentRoomId;
      scene.prepareForRoomTransition();
      currentRoomId = targetRoomId;
      updateRoomLabel(currentRoomId);
      await loadActiveRoom(currentRoomId, fromRoomId);
    }
  });
  scene.start();
  return scene;
}

async function loadActiveRoom(roomId, fromRoomId = null){
  const serial = ++rebuildSerial;
  await ensureScene();
  if (serial !== rebuildSerial) return;

  const [surfaceTextures, doorTextureCanvases] = await Promise.all([
    resolveRoomSurfaceTextures(roomId),
    resolveRoomDoorTextures(roomId)
  ]);
  if (serial !== rebuildSerial) return;

  await scene.loadRoom({
    roomId,
    surfaceTextures,
    doorTextureCanvases,
    photos: photosByRoom[roomId] || [],
    fromRoomId,
    interactionEnabled: true,
    frameSettings: getRoomFrameSettings(roomId)
  });

  if (gyroEnabled) {
    const ok = await scene.enableGyro();
    if (!ok) gyroEnabled = false;
  }
}

async function preloadFrameTextures(){
  const ids = new Set();
  Object.values(ROOM_MATERIALS).forEach(room => {
    ids.add(room.outerFrameId);
    ids.add(room.innerFrameId);
  });
  await Promise.all([...ids].map(id => loadFrameImage(id).catch(() => null)));
}

async function requestFullscreen(){
  const shell = document.getElementById("appShell");
  try {
    if (shell?.requestFullscreen) await shell.requestFullscreen();
    else if (shell?.webkitRequestFullscreen) shell.webkitRequestFullscreen();
  } catch {
    // ignore — many mobile browsers restrict fullscreen
  }
}

async function enableGyroFlow(){
  if (!shouldOfferGyro()) {
    gyroEnabled = false;
    return false;
  }

  if (needsGyroPermissionPrompt()) {
    showOnly("gyroPrompt");
    return new Promise(resolve => {
      const allowBtn = document.getElementById("gyroAllowBtn");
      const skipBtn = document.getElementById("gyroSkipBtn");
      const cleanup = () => {
        allowBtn?.removeEventListener("click", onAllow);
        skipBtn?.removeEventListener("click", onSkip);
      };
      const onAllow = async () => {
        cleanup();
        await ensureScene();
        const ok = await scene.enableGyro();
        gyroEnabled = ok;
        resolve(ok);
      };
      const onSkip = () => {
        cleanup();
        gyroEnabled = false;
        resolve(false);
      };
      allowBtn?.addEventListener("click", onAllow, { once: true });
      skipBtn?.addEventListener("click", onSkip, { once: true });
    });
  }

  await ensureScene();
  gyroEnabled = await scene.enableGyro();
  return gyroEnabled;
}

async function startTour(){
  showOnly("loadingScreen");
  setLoadingProgress(0, 1, "載入材質與照片…");

  await audio.start();
  updateMuteButton();
  await requestFullscreen();

  await preloadFrameTextures();
  photosByRoom = await loadAllRoomPhotos((current, total, message) => {
    setLoadingProgress(current, total, message);
  });

  setLoadingProgress(1, 1, "進入展間…");
  currentRoomId = 1;
  updateRoomLabel(currentRoomId);
  await ensureScene();
  await enableGyroFlow();

  showOnly("tourScreen");
  sessionReady = true;
  await loadActiveRoom(1, null);

  const hint = document.getElementById("tourHint");
  if (hint) {
    hint.textContent = gyroEnabled
      ? "轉動手機環顧 · 點照片放大 · 再點退回 · 點門換展間"
      : "拖曳環顧 · 點照片放大 · 再點退回 · 點門換展間";
  }
}

function bindEvents(){
  document.getElementById("startBtn")?.addEventListener("click", () => {
    startTour().catch(error => {
      console.error(error);
      alert("展館載入失敗，請重新整理後再試一次。");
      showOnly("welcomeScreen");
    });
  });

  document.getElementById("muteBtn")?.addEventListener("click", () => {
    audio.toggleMute();
    updateMuteButton();
  });

  document.getElementById("resetViewBtn")?.addEventListener("click", () => {
    scene?.resetView();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) audio.pause();
    else if (sessionReady) audio.resume();
  });

  window.addEventListener("resize", () => scene?.resize());
}

function registerServiceWorker(){
  if (!("serviceWorker" in navigator)) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(error => {
      console.warn("[Wedding Gallery] SW 註冊失敗", error);
    });
  });
}

function init(){
  document.title = APP_NAME;
  renderShell();
  bindEvents();
  registerServiceWorker();
}

init();
