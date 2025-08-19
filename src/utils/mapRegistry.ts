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
  defaultMap: defaultMapConfig
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

// 맵에서 최고 장애물 높이를 계산하는 함수
const getMapMaxHeight = (config: GameConfig): number => {
  let maxHeight = 0

  // 모든 장애물의 높이를 확인
  config.obstacles.forEach((obstacle) => {
    const obstacleTop = obstacle.position.y + (obstacle.size?.y || 1) / 2
    maxHeight = Math.max(maxHeight, obstacleTop)
  })

  return maxHeight
}

// 동적으로 시작 위치 생성 (최대 100개까지) - 맵 높이 자동 분석
export const getDefaultPositions = (count?: number): Vector3[] => {
  const maxCount = count || 100
  const positions: Vector3[] = []
  const gridSize = Math.ceil(Math.sqrt(maxCount))
  const spacing = 1.5

  // 현재 사용되는 기본 맵 설정에서 최고 높이 계산
  const defaultConfig = mapConfigs.defaultMap as GameConfig
  const mapMaxHeight = getMapMaxHeight(defaultConfig)
  const startY = mapMaxHeight + 10 // 최고 장애물보다 10 높은 위치에서 시작

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
