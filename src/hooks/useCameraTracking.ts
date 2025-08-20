import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3 } from 'three'
import type { GameConfig } from '../types/gameConfig'
import type { PlayerData } from './usePlayerPositions'
import type { PlayerObjectWithPosition } from '../utils/mapRegistry'

const CAMERA_HEIGHT_OFFSET = 8
const CAMERA_DISTANCE_OFFSET = 12
const CAMERA_LERP_FACTOR = 0.03

interface UseCameraTrackingProps {
  playerBodies: PlayerData[]
  activePlayers: PlayerObjectWithPosition[]
  config: GameConfig
  raceStarted: boolean
  enabled: boolean
}

export function useCameraTracking({ 
  playerBodies, 
  activePlayers,
  config, 
  raceStarted,
  enabled 
}: UseCameraTrackingProps) {
  const { camera } = useThree()
  const targetPositionRef = useRef(new Vector3())
  const currentPositionRef = useRef(new Vector3())
  const targetLookAtRef = useRef(new Vector3())
  const currentLookAtRef = useRef(new Vector3())
  
  // 경주 시작 상태 변화 감지
  useEffect(() => {
    if (raceStarted) {
      // 경주가 시작되면 현재 카메라 위치에서 시작
      currentPositionRef.current.copy(camera.position)
      targetPositionRef.current.copy(camera.position)
      
      // lookAt도 현재 상태에서 시작
      const currentTarget = config.camera.target 
        ? new Vector3(config.camera.target.x, config.camera.target.y, config.camera.target.z)
        : new Vector3(0, 0, 0)
      
      currentLookAtRef.current.copy(currentTarget)
      targetLookAtRef.current.copy(currentTarget)
    }
  }, [raceStarted, camera, config.camera.target])

  // 초기 카메라 위치 설정
  useEffect(() => {
    if (!raceStarted) {
      const initialPos = new Vector3(
        config.camera.position.x,
        config.camera.position.y,
        config.camera.position.z
      )
      
      camera.position.copy(initialPos)
      currentPositionRef.current.copy(initialPos)
      targetPositionRef.current.copy(initialPos)
    }
  }, [camera, config.camera.position, raceStarted])

  // 가장 낮은 위치에 있는 활성 플레이어 찾기 (가장 아래에 있는 플레이어)
  const findLowestPlayer = (): PlayerData | null => {
    if (playerBodies.length === 0 || activePlayers.length === 0) return null
    
    // 활성 플레이어의 ID 집합 생성
    const activePlayerIds = new Set(activePlayers.map(p => p.id))
    
    // 활성 플레이어들 중에서만 검색
    const activePlayerBodies = playerBodies.filter(playerData => 
      activePlayerIds.has(playerData.id)
    )
    
    if (activePlayerBodies.length === 0) return null
    
    let lowestPlayer = activePlayerBodies[0]
    let minY = Infinity
    
    for (const playerData of activePlayerBodies) {
      const y = playerData.currentPosition.y
      if (y < minY) {
        minY = y
        lowestPlayer = playerData
      }
    }
    
    return lowestPlayer
  }

  useFrame(() => {
    if (!raceStarted || playerBodies.length === 0 || activePlayers.length === 0 || !enabled) {
      // 경주가 시작되지 않았거나 활성 플레이어가 없거나 카메라 추적이 비활성화되면 초기 카메라 설정 유지
      return
    }
    
    const lowestPlayer = findLowestPlayer()
    if (!lowestPlayer) return
    
    // 가장 아래에 있는 플레이어의 현재 위치
    const playerPos = lowestPlayer.currentPosition
    
    // 카메라 목표 위치 설정 (플레이어를 따라다니면서 약간 뒤쪽에서)
    const targetX = playerPos.x
    const targetY = playerPos.y + CAMERA_HEIGHT_OFFSET
    const targetZ = playerPos.z + CAMERA_DISTANCE_OFFSET
    
    targetPositionRef.current.set(targetX, targetY, targetZ)
    targetLookAtRef.current.set(playerPos.x, playerPos.y, playerPos.z)
    
    // 부드러운 카메라 이동 (더 부드러운 lerp 사용)
    const lerpFactor = CAMERA_LERP_FACTOR
    currentPositionRef.current.lerp(targetPositionRef.current, lerpFactor)
    currentLookAtRef.current.lerp(targetLookAtRef.current, lerpFactor)
    
    // 카메라 위치 업데이트
    camera.position.copy(currentPositionRef.current)
    
    // 카메라가 플레이어를 부드럽게 바라보도록 설정
    camera.lookAt(currentLookAtRef.current)
  })

  return {
    targetPosition: targetPositionRef.current,
    currentPosition: currentPositionRef.current
  }
}