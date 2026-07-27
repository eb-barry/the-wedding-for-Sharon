// Wedding Gallery - texture & surface loading

import { ROOM_MATERIALS, TEXTURE_PATHS } from "./config.js";

const imageCache = new Map();

export function getTextureUrl(kind, textureId){
  const root = TEXTURE_PATHS[kind];
  return `${root}/${encodeURIComponent(`${textureId}.webp`)}`;
}

export async function loadTextureImage(kind, textureId){
  const key = `${kind}:${textureId}`;
  if (imageCache.has(key)) return imageCache.get(key);
  try {
    const image = await loadImage(getTextureUrl(kind, textureId));
    imageCache.set(key, image);
    return image;
  } catch (error) {
    console.warn(`[Wedding Gallery] 材質載入失敗：${kind}/${textureId}`, error);
    const fallback = createProceduralTextureCanvas(kind, textureId);
    imageCache.set(key, fallback);
    return fallback;
  }
}

export async function resolveRoomSurfaceTextures(roomId){
  const materials = ROOM_MATERIALS[Number(roomId)] || ROOM_MATERIALS[1];
  const [wallImage, floorImage] = await Promise.all([
    loadTextureImage("walls", materials.wallId),
    loadTextureImage("floors", materials.floorId)
  ]);
  return {
    wallCanvas: imageToCanvas(wallImage),
    floorCanvas: imageToCanvas(floorImage),
    wallAspect: (wallImage.width || 1) / (wallImage.height || 1),
    floorAspect: (floorImage.width || 1) / (floorImage.height || 1)
  };
}

export async function resolveRoomDoorTextures(roomId){
  const materials = ROOM_MATERIALS[Number(roomId)] || ROOM_MATERIALS[1];
  const entries = Object.entries(materials.doors || {});
  const result = {};
  await Promise.all(entries.map(async ([doorwayId, doorTextureId]) => {
    const image = await loadTextureImage("doors", doorTextureId);
    result[doorwayId] = imageToCanvas(image);
  }));
  return result;
}

export function getRoomFrameSettings(roomId){
  const materials = ROOM_MATERIALS[Number(roomId)] || ROOM_MATERIALS[1];
  return {
    outerFrameTypeId: materials.outerFrameId,
    innerFrameTypeId: materials.innerFrameId
  };
}

function loadImage(url){
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Image load failed: ${url}`));
    image.src = url;
  });
}

function imageToCanvas(image){
  const canvas = document.createElement("canvas");
  canvas.width = image.width || 512;
  canvas.height = image.height || 512;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0);
  return canvas;
}

function createProceduralTextureCanvas(kind, textureId){
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = kind === "doors" ? 1024 : 512;
  const ctx = canvas.getContext("2d");
  const colors = {
    floors: "#8B7355",
    walls: "#F5F0E8",
    doors: "#6B4F3A"
  };
  ctx.fillStyle = colors[kind] || "#999";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.font = "24px sans-serif";
  ctx.fillText(String(textureId || kind), 24, 48);
  return canvas;
}
