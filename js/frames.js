// Wedding Gallery - classic outer/inner frame baking (strip textures)

import {
  INNER_FRAME_WIDTH_PX,
  OUTER_FRAME_WIDTH_PX,
  TEXTURE_PATHS
} from "./config.js";

const frameImageCache = new Map();

export function getFrameTextureUrl(frameId){
  return `${TEXTURE_PATHS.frames}/${encodeURIComponent(`${frameId}.webp`)}`;
}

export async function loadFrameImage(frameId){
  if (!frameId) return null;
  if (frameImageCache.has(frameId)) return frameImageCache.get(frameId);
  const image = await loadImage(getFrameTextureUrl(frameId));
  frameImageCache.set(frameId, image);
  return image;
}

export async function bakeFramedTexture(photoSource, frameSettings = {}){
  const outerFrameTypeId = frameSettings.outerFrameTypeId || "classic-01";
  const innerFrameTypeId = frameSettings.innerFrameTypeId || "inner-01";
  const photoImage = typeof photoSource === "string"
    ? await loadImage(photoSource)
    : photoSource;

  const [outerTexture, innerTexture] = await Promise.all([
    loadFrameImage(outerFrameTypeId),
    loadFrameImage(innerFrameTypeId)
  ]);

  const outerW = OUTER_FRAME_WIDTH_PX;
  const innerW = INNER_FRAME_WIDTH_PX;
  const total = outerW + innerW;
  const width = photoImage.width + total * 2;
  const height = photoImage.height + total * 2;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, width, height);

  if (outerTexture) {
    drawStripFrameRing(ctx, outerTexture, 0, 0, width, height, outerW, Math.max(4, outerW * 0.2), 0);
  } else {
    ctx.fillStyle = "#d4af37";
    fillFrameRing(ctx, 0, 0, width, height, outerW);
  }

  const ix = outerW;
  const iy = outerW;
  const iw = width - outerW * 2;
  const ih = height - outerW * 2;
  if (innerTexture) {
    drawStripFrameRing(ctx, innerTexture, ix, iy, iw, ih, innerW, 0, 0);
  } else {
    ctx.fillStyle = "#f5f5f0";
    fillFrameRing(ctx, ix, iy, iw, ih, innerW);
  }

  const px = total;
  const py = total;
  ctx.drawImage(photoImage, px, py, photoImage.width, photoImage.height);
  return canvas;
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

function fillFrameRing(ctx, x, y, w, h, frameWidth){
  const fw = Math.max(1, Math.min(frameWidth, Math.min(w, h) / 2));
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.rect(x + fw, y + fw, w - fw * 2, h - fw * 2);
  ctx.fill("evenodd");
}

function drawStripFrameRing(ctx, stripImage, x, y, w, h, frameWidth, outerRadius = 0, holeRadius = 0){
  const fw = Math.max(1, Math.min(frameWidth, Math.min(w, h) / 2));
  if (fw <= 0 || w <= 0 || h <= 0) return;

  const outerR = Math.max(0, Math.min(outerRadius, Math.min(w, h) / 2));
  const holeW = Math.max(1, w - fw * 2);
  const holeH = Math.max(1, h - fw * 2);
  const innerR = Math.max(0, Math.min(holeRadius, Math.min(holeW, holeH) / 2));

  ctx.save();
  ctx.beginPath();
  roundRectPath(ctx, x, y, w, h, outerR);
  roundRectPath(ctx, x + fw, y + fw, holeW, holeH, innerR);
  ctx.clip("evenodd");

  drawStripRail(ctx, stripImage, x, y, w, fw, 0);
  drawStripRail(ctx, stripImage, x + w, y, h, fw, 90);
  drawStripRail(ctx, stripImage, x + w, y + h, w, fw, 180);
  drawStripRail(ctx, stripImage, x, y + h, h, fw, 270);
  ctx.restore();
}

function drawStripRail(ctx, stripImage, originX, originY, length, thickness, angleDeg){
  if (length <= 0 || thickness <= 0 || !stripImage) return;
  ctx.save();
  ctx.translate(originX, originY);
  ctx.rotate((angleDeg * Math.PI) / 180);
  const m = Math.min(thickness, length / 2);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(length, 0);
  ctx.lineTo(length - m, thickness);
  ctx.lineTo(m, thickness);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(stripImage, 0, 0, stripImage.width, stripImage.height, 0, 0, length, thickness);
  ctx.restore();
}

function roundRectPath(ctx, x, y, w, h, radius){
  const r = Math.max(0, Math.min(radius, Math.min(w, h) / 2));
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
