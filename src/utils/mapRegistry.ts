import type { MapRegistry } from '../types/mapRegistry'
import type { GameConfig } from '../types/gameConfig'

export interface PlayerBox {
  id: string
  name: string
  color: string
  mass: number
}

// Todo: maps 폴더에서 자동으로 모든 파일 import
import defaultMapConfig from '../maps/defaultMap.json'

const mapConfigs = {
  defaultMap: defaultMapConfig,
}

// 동적으로 mapRegistry 생성
const mapRegistry: MapRegistry = {}

for (const [fileName, config] of Object.entries(mapConfigs)) {
  const mapId = fileName.replace('Map', '').toLowerCase()
  const gameConfig = config as GameConfig
  
  mapRegistry[mapId] = {
    id: mapId,
    name: gameConfig.name || mapId,
    description: gameConfig.description || `${mapId} 맵`,
    config: gameConfig
  }
}

export const getMapList = () => Object.values(mapRegistry)

export const getMapById = (id: string) => mapRegistry[id]

// Todo: 플레이어 수 설정 ui 추가
export const getDefaultPlayers = () => [
  { id: '1', name: '플레이어 1', color: '#e74c3c', mass: 1 },
  { id: '2', name: '플레이어 2', color: '#3498db', mass: 1 },
  { id: '3', name: '플레이어 3', color: '#2ecc71', mass: 1 },
  { id: '4', name: '플레이어 4', color: '#f39c12', mass: 1 }
]

// Todo: 시작 위치 설정 추가
export const getDefaultPositions = () => [
  { x: -1.5, y: 15, z: -1.5 },
  { x: 1.5, y: 15, z: -1.5 },
  { x: -1.5, y: 15, z: 1.5 },
  { x: 1.5, y: 15, z: 1.5 }
]
