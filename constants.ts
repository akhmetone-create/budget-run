import { Direction, Position } from './types';

// 1 = Wall (Building), 0 = Budget (Dot), 2 = Viral Post (Power Pellet), 3 = Empty
// 21x21 Grid optimized for mobile portrait ratio
export const LEVEL_MAP = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,2,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,2,1,1],
  [1,0,1,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,1,0,1],
  [1,0,1,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,1,0,1],
  [1,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,1],
  [1,1,1,1,1,0,1,1,1,3,1,3,1,1,1,0,1,1,1,1,1],
  [1,1,1,1,1,0,1,3,3,3,3,3,3,3,1,0,1,1,1,1,1],
  [1,0,0,0,0,0,1,3,1,1,3,1,1,3,1,0,0,0,0,0,1],
  [1,1,1,1,1,0,1,3,1,3,3,3,1,3,1,0,1,1,1,1,1],
  [1,1,1,1,1,0,1,3,1,1,1,1,1,3,1,0,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,1,0,1],
  [1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
  [1,1,1,0,1,0,1,0,1,1,1,1,1,0,1,0,1,0,1,1,1],
  [1,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,1],
  [1,0,1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1,0,1],
  [1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

export const COLORS = {
  // City Map
  WALL_BASE: '#0f172a', // Dark slate building
  WALL_TOP: '#1e293b',
  WALL_NEON: '#8b5cf6', // Purple Neon outline
  BG: '#050505',        // Asphalt black
  
  // Items
  BUDGET_DOT: '#fbbf24', // Gold coin
  VIRAL_PELLET: '#00F0FF', // Cyan energy
  
  // Player (Marketer)
  MARKETER_SKIN: '#fca5a5', // Peach
  MARKETER_GLASSES: '#000000',
  
  // Financiers (Ghosts)
  SUIT_NAVY: '#1e3a8a',
  SUIT_GREY: '#374151',
  SUIT_BLACK: '#171717',
  TIE_RED: '#ef4444',
  TIE_BLUE: '#3b82f6',
  TIE_GREEN: '#22c55e',
  TIE_PURPLE: '#a855f7'
};

export const INITIAL_PLAYER_POS: Position = { x: 10, y: 15 };
export const GHOST_HOUSE_POS: Position = { x: 10, y: 9 };
export const TILE_SIZE = 32;