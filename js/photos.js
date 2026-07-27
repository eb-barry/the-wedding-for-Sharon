// Wedding Gallery - prebundled photo loading

import { PHOTO_TEXTURE_MAX_EDGE, ROOM_MATERIALS, TEXTURE_PATHS } from "./config.js";

export async function loadAllRoomPhotos(onProgress){
  const roomIds = Object.keys(ROOM_MATERIALS).map(Number).sort((a, b) => a - b);
  const photosByRoom = {};
  let loaded = 0;
  let total = roomIds.length;

  for (const roomId of roomIds) {
    const roomKey = ROOM_MATERIALS[roomId].roomKey;
    const items = await loadRoomManifest(roomKey);
    total += Math.max(0, items.length - 1);
    const photos = [];
    for (let index = 0; index < items.length; index += 1) {
      const file = items[index];
      const url = `${TEXTURE_PATHS.photos}/${roomKey}/${encodeURIComponent(file)}`;
      const photo = await preparePhotoFromUrl(url, `${roomKey}-${file}`);
      photos.push({ ...photo, roomId });
      loaded += 1;
      onProgress?.(loaded, Math.max(total, loaded), `載入 ${roomKey} 照片…`);
    }
    photosByRoom[roomId] = photos;
  }

  return photosByRoom;
}

async function loadRoomManifest(roomKey){
  const url = `${TEXTURE_PATHS.photos}/${roomKey}/manifest.json`;
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const items = Array.isArray(data?.items) ? data.items : [];
    return items.filter(item => typeof item === "string" && item.length);
  } catch (error) {
    console.warn(`[Wedding Gallery] 無法讀取 ${roomKey} manifest`, error);
    return [];
  }
}

async function preparePhotoFromUrl(url, id){
  const image = await loadImage(url);
  const width = image.width || 1;
  const height = image.height || 1;
  const textureDataUrl = scaleImageToDataUrl(image, PHOTO_TEXTURE_MAX_EDGE);
  return {
    id,
    url,
    textureDataUrl,
    width,
    height,
    aspect: width >= height ? "4x3" : "3x4"
  };
}

function loadImage(url){
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Photo load failed: ${url}`));
    image.src = url;
  });
}

function scaleImageToDataUrl(image, maxEdge){
  const scale = Math.min(1, maxEdge / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL("image/webp", 0.9);
}
