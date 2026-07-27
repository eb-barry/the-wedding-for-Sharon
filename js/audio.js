// Wedding Gallery - looping background music

import { TEXTURE_PATHS } from "./config.js";

export class GalleryAudio {
  constructor(){
    this.audio = new Audio(TEXTURE_PATHS.bgm);
    this.audio.loop = true;
    this.audio.preload = "auto";
    this.audio.volume = 0.55;
    this.muted = false;
    this.started = false;
  }

  async start(){
    this.started = true;
    this.audio.muted = this.muted;
    try {
      await this.audio.play();
      return true;
    } catch (error) {
      console.warn("[Wedding Gallery] 無法自動播放音樂", error);
      return false;
    }
  }

  setMuted(muted){
    this.muted = Boolean(muted);
    this.audio.muted = this.muted;
    if (!this.muted && this.started && this.audio.paused) {
      this.audio.play().catch(() => {});
    }
  }

  toggleMute(){
    this.setMuted(!this.muted);
    return this.muted;
  }

  pause(){
    this.audio.pause();
  }

  resume(){
    if (!this.started || this.muted) return;
    this.audio.play().catch(() => {});
  }
}
