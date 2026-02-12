export enum GameState {
  MENU,
  PLAYING,
  GAME_OVER,
  WON
}

export enum Difficulty {
  EASY = 'INTERN',
  NORMAL = 'MANAGER',
  HARD = 'CMO'
}

export enum Direction {
  UP,
  DOWN,
  LEFT,
  RIGHT,
  NONE
}

export interface Position {
  x: number;
  y: number;
}

export interface Entity {
  pos: Position;
  dir: Direction;
  nextDir: Direction;
  speed: number;
  color: string;
}

export interface Ghost extends Entity {
  id: number;
  type: 'CFO' | 'AUDITOR' | 'TAX' | 'COMPLIANCE';
  scatterTarget: Position;
  mode: 'CHASE' | 'SCATTER' | 'FRIGHTENED';
}
