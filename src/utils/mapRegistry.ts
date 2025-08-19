import type { MapRegistry } from '../types/mapRegistry'
import type { GameConfig, Vector3 } from '../types/gameConfig'

export interface PlayerObjectWithPosition {
  id: string
  name: string
  color: string
  mass: number
  position: Vector3
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


// 동적으로 시작 위치 생성 (최대 100개까지)
export const getDefaultPositions = (count?: number): Vector3[] => {
  const maxCount = count || 100
  const positions: Vector3[] = []
  const gridSize = Math.ceil(Math.sqrt(maxCount))
  const spacing = 1.5
  const startY = 15

  for (let i = 0; i < maxCount; i++) {
    const row = Math.floor(i / gridSize)
    const col = i % gridSize
    
    // 중앙을 기준으로 배치
    const offsetX = (col - (gridSize - 1) / 2) * spacing
    const offsetZ = (row - (gridSize - 1) / 2) * spacing
    
    positions.push({
      x: offsetX,
      y: startY + Math.random() * 0.5, // 약간의 높이 변화
      z: offsetZ
    })
  }

  return positions
}
