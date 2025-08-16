import type { GameConfig } from './gameConfig'

export interface MapInfo {
  id: string
  name: string
  description: string
  thumbnail?: string
  config: GameConfig
}

export interface MapRegistry {
  [key: string]: MapInfo
}