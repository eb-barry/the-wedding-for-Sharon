// Wedding Gallery - 三房型拓撲（方形 → 圓形雙門 → 方形）

export const GALLERY3D_ROOM_COUNT = 3;

export const SQUARE_ROOM_SIZE = 12;
export const ROUND_ROOM_RADIUS = 6;
export const ROOM_WALL_HEIGHT = 4.5;
export const EYE_HEIGHT = 1.65;
export const DOOR_WIDTH = 0.85;
export const DOOR_HEIGHT = 1.75;

/** @typedef {{ id: string, targetRoomId: number, side?: string, angle?: number }} DoorwayDef */

export const ROOM_DEFINITIONS = [
  {
    id: 1,
    shape: "square",
    label: "room-01",
    doorways: [{ id: "east-door", targetRoomId: 2, side: "east" }]
  },
  {
    id: 2,
    shape: "round",
    label: "room-02",
    doorways: [
      { id: "round-door-west", targetRoomId: 1, angle: Math.PI },
      { id: "round-door-east", targetRoomId: 3, angle: 0 }
    ]
  },
  {
    id: 3,
    shape: "square",
    label: "room-03",
    doorways: [{ id: "west-door", targetRoomId: 2, side: "west" }]
  }
];

export function getRoomDefinition(roomId){
  return ROOM_DEFINITIONS.find(room => room.id === Number(roomId)) || ROOM_DEFINITIONS[0];
}

export function getSpawnPose(roomId, fromRoomId = null){
  const room = getRoomDefinition(roomId);
  if (room.shape === "square") {
    const half = SQUARE_ROOM_SIZE / 2;
    if (fromRoomId === 2 && roomId === 1) {
      return { x: half - 2.2, y: EYE_HEIGHT, z: 0, yaw: Math.PI };
    }
    if (fromRoomId === 2 && roomId === 3) {
      return { x: -half + 2.2, y: EYE_HEIGHT, z: 0, yaw: 0 };
    }
    return { x: 0, y: EYE_HEIGHT, z: half - 2.2, yaw: Math.PI };
  }

  const radius = ROUND_ROOM_RADIUS - 2.2;
  if (fromRoomId === 1) {
    return { x: -radius, y: EYE_HEIGHT, z: 0, yaw: 0 };
  }
  if (fromRoomId === 3) {
    return { x: radius, y: EYE_HEIGHT, z: 0, yaw: Math.PI };
  }
  return { x: 0, y: EYE_HEIGHT, z: -radius, yaw: 0 };
}

/**
 * Center of the current room, facing a photo wall.
 * Pitch aims slightly below artwork center so photos sit a bit above screen center.
 */
export function getRoomCenterViewPose(roomId){
  const room = getRoomDefinition(roomId);
  const hangY = 2.2;
  // Aim a little below photo center → photos appear slightly above mid-screen.
  const lookY = hangY - 0.18;
  const yaw = room.shape === "round"
    ? -Math.PI / 2 // face open arc between east/west doors
    : Math.PI;     // face north wall (no doorway in square rooms)

  const wallDistance = room.shape === "round"
    ? ROUND_ROOM_RADIUS - 0.25
    : (SQUARE_ROOM_SIZE / 2) - 0.25;
  const pitch = Math.atan2(lookY - EYE_HEIGHT, wallDistance);

  return {
    x: 0,
    y: EYE_HEIGHT,
    z: 0,
    yaw,
    pitch
  };
}

export function getWallInwardNormal(side){
  switch (side) {
    case "north": return { x: 0, y: 0, z: 1 };
    case "south": return { x: 0, y: 0, z: -1 };
    case "east": return { x: -1, y: 0, z: 0 };
    case "west": return { x: 1, y: 0, z: 0 };
    default: return { x: 0, y: 0, z: 1 };
  }
}

export function getRoundWallInwardNormal(angle = 0){
  return {
    x: -Math.sin(angle),
    y: 0,
    z: -Math.cos(angle)
  };
}

export function findDoorwayTarget(roomId, doorwayId){
  const room = getRoomDefinition(roomId);
  const doorway = room.doorways.find(item => item.id === doorwayId);
  return doorway?.targetRoomId || null;
}
