export interface Vector3 {
  x: number
  y: number
  z: number
}

export interface PlayerConfig {
  id: string
  position: Vector3
  mass: number
  color: string
  size?: Vector3
}

export interface WallConfig {
  id: string
  position: Vector3
  size: Vector3
  color?: string
  rotation?: Vector3
}

export interface ObstacleConfig {
  id: string
  type: 'box' | 'sphere' | 'cylinder' | 'ramp' | 'funnel'
  position: Vector3
  size: Vector3
  rotation?: Vector3
  color?: string
  mass?: number
  rotationSpeed?: Vector3 // 각 축별 회전 속도 (초당 라디안)
}

export interface FinishLineConfig {
  position: Vector3
  size: Vector3
  color?: string
}

export interface GameAreaConfig {
  boundaries: {
    width: number
    height: number
    depth: number
    wallHeight: number
  }
  floor: {
    position: Vector3
    color?: string
  }
}

export interface GameBoxConfig {
  id: string
  position: Vector3
  mass: number
  color: string
  size: Vector3
}

export interface GameConfig {
  name: string
  description?: string
  gameArea: GameAreaConfig
  boxes: GameBoxConfig[]
  walls: WallConfig[]
  obstacles: ObstacleConfig[]
  finishLine: FinishLineConfig
  physics: {
    gravity: Vector3
  }
  camera: {
    position: Vector3
    target?: Vector3
  }
}
