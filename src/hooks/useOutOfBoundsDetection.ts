import { useEffect, useRef } from 'react'
import type { GameConfig } from '../types/gameConfig'
import type { PlayerData } from './usePlayerPositions'

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
        const minY = config.finishLine.position.y - 20 // 결승선보다 20 아래까지 허용
        const maxY = boundaries.height + 50 // 맵 높이보다 50 위까지 허용

        // 경계 체크
        const isOutOfBounds = 
          currentPosition.x < -halfWidth - 5 ||
          currentPosition.x > halfWidth + 5 ||
          currentPosition.z < -halfDepth - 5 ||
          currentPosition.z > halfDepth + 5 ||
          currentPosition.y < minY ||
          currentPosition.y > maxY

        if (isOutOfBounds) {
          checkedPlayersRef.current.add(id)
          onPlayerOutOfBounds(id)
        }
      })
    }, 1000) // 1초마다 체크

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