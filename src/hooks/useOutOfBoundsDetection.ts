import { useEffect, useRef } from 'react'
import type { GameConfig } from '../types/gameConfig'
import type { PlayerData } from './usePlayerPositions'

const BOUNDARY_BUFFER = 5
const MIN_Y_OFFSET = -20
const MAX_Y_OFFSET = 50
const CHECK_INTERVAL = 1000

interface UseOutOfBoundsDetectionProps {
  playerBodies: PlayerData[]
  config: GameConfig
  onPlayerOutOfBounds: (playerId: string) => void
  enabled: boolean
}

export function useOutOfBoundsDetection({
  playerBodies,
  config,
  onPlayerOutOfBounds,
  enabled
}: UseOutOfBoundsDetectionProps) {
  const checkedPlayersRef = useRef(new Set<string>())

  useEffect(() => {
    if (!enabled) {
      checkedPlayersRef.current.clear()
      return
    }

    const checkInterval = setInterval(() => {
      playerBodies.forEach((playerData) => {
        const { id, currentPosition } = playerData
        
        // 이미 체크된 플레이어는 건너뛰기
        if (checkedPlayersRef.current.has(id)) {
          return
        }

        // 맵 경계 계산
        const boundaries = config.gameArea.boundaries
        const halfWidth = boundaries.width / 2
        const halfDepth = boundaries.depth / 2
        const minY = config.finishLine.position.y + MIN_Y_OFFSET
        const maxY = boundaries.height + MAX_Y_OFFSET

        // 경계 체크
        const isOutOfBounds = 
          currentPosition.x < -halfWidth - BOUNDARY_BUFFER ||
          currentPosition.x > halfWidth + BOUNDARY_BUFFER ||
          currentPosition.z < -halfDepth - BOUNDARY_BUFFER ||
          currentPosition.z > halfDepth + BOUNDARY_BUFFER ||
          currentPosition.y < minY ||
          currentPosition.y > maxY

        if (isOutOfBounds) {
          checkedPlayersRef.current.add(id)
          onPlayerOutOfBounds(id)
        }
      })
    }, CHECK_INTERVAL)

    return () => {
      clearInterval(checkInterval)
    }
  }, [playerBodies, config, onPlayerOutOfBounds, enabled])

  // 게임 재시작 시 체크된 플레이어 목록 초기화
  const resetCheckedPlayers = () => {
    checkedPlayersRef.current.clear()
  }

  return { resetCheckedPlayers }
}