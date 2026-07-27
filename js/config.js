// Wedding Gallery - fixed room materials & app constants

export const APP_NAME = "Sharon's Wedding Gallery";
export const APP_VERSION = "1.0.0";

export const ASSET_ROOT = "./assets";

/** Fixed materials per room. Room 2 has two distinct door textures. */
export const ROOM_MATERIALS = {
  1: {
    roomKey: "room-01",
    floorId: "floor-01",
    wallId: "wall-01",
    outerFrameId: "classic-01",
    innerFrameId: "inner-01",
    doors: {
      "east-door": "door-01"
    }
  },
  2: {
    roomKey: "room-02",
    floorId: "floor-02",
    wallId: "wall-02",
    outerFrameId: "classic-02",
    innerFrameId: "inner-02",
    doors: {
      "round-door-west": "door-02-1",
      "round-door-east": "door-02-2"
    }
  },
  3: {
    roomKey: "room-03",
    floorId: "floor-03",
    wallId: "wall-03",
    outerFrameId: "classic-03",
    innerFrameId: "inner-03",
    doors: {
      "west-door": "door-03"
    }
  }
};

export const TEXTURE_PATHS = {
  floors: `${ASSET_ROOT}/textures/floors`,
  walls: `${ASSET_ROOT}/textures/walls`,
  doors: `${ASSET_ROOT}/textures/doors`,
  frames: `${ASSET_ROOT}/textures/frames`,
  photos: `${ASSET_ROOT}/photos`,
  welcome: `${ASSET_ROOT}/welcome/welcome.webp`,
  bgm: `${ASSET_ROOT}/audio/bgm.mp3`
};

export const OUTER_FRAME_WIDTH_PX = 55;
export const INNER_FRAME_WIDTH_PX = 25;
export const PHOTO_TEXTURE_MAX_EDGE = 1600;

export const WELCOME_TITLE = "歡迎來到我們的 3D 婚禮展館";
export const WELCOME_BODY = [
  "請用手指拖曳螢幕環顧四周；若已開啟陀螺儀，轉動手機即可瀏覽。",
  "點一下地板可以往前走；點門片可進入下一個展間。",
  "右下角可重設視角與靜音。準備好後，請點「開始導覽」。"
].join("\n");

export const START_BUTTON_LABEL = "開始導覽";
