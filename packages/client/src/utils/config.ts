export const PIXEL_ART_ASSETS_SCALING = 2;

export const config = {
  DEBUG: false,

  MOBILE_MAX_WIDTH: 900,

  PIXEL_ART_ASSETS_SCALING,

  TILE_SIZE: {
    x: 48,
    y: 24,
    z: 16
  },

  UNIT_SPRITE_SIZE: {
    width: 64,
    height: 64
  },

  UNIT_ANCHOR: {
    x: 0.5,
    y: 1
  },

  UNIT_HITBOX: {
    offset: 16,
    height: 48,
    width: 32
  },

  UNIT_MOVEMENT_BOUNCE_HEIGHT: 0.6,
  UNIT_MOVEMENT_BOUNCE_DURATION: 0.3,

  TILE_SPRITE_SIZE: {
    width: 48,
    height: 40
  },

  CAMERA: {
    MIN_ZOOM: 2,
    MAX_ZOOM: 4,
    INITIAL_ZOOM: 3,
    INITIAL_MOBILE_ZOOM: 2,
    PADDING: 48
  },

  ISO_TILES_ROTATION_SPEED: 0.5
};
