import { useState, useCallback } from 'react'

export interface FinishedPlayer {
  id: string
  name: string
  finishTime: number
  rank: number
  isOutOfBounds?: boolean
}

export function useFinishLineDetection() {
  const [finishedPlayers, setFinishedPlayers] = useState<FinishedPlayer[]>([])
  const [outOfBoundsPlayers, setOutOfBoundsPlayers] = useState<
    FinishedPlayer[]
  >([])

  const onPlayerFinish = useCallback(
    (
      playerId: string,
      playerName: string,
      onRemovePlayer?: (playerId: string) => void
    ) => {
      setFinishedPlayers((prev) => {
        if (prev.some((p) => p.id === playerId)) {
          return prev
        }

        const finishTime = Date.now()
        const rank = prev.length + 1
        const newFinishedPlayer: FinishedPlayer = {
          id: playerId,
          name: playerName,
          finishTime,
          rank
        }

        if (onRemovePlayer) {
          onRemovePlayer(playerId)
        }

        return [...prev, newFinishedPlayer]
      })
    },
    []
  )

  const onPlayerOutOfBounds = useCallback(
    (
      playerId: string,
      playerName: string,
      onRemovePlayer?: (playerId: string) => void
    ) => {
      setOutOfBoundsPlayers((prev) => {
        if (prev.some((p) => p.id === playerId)) {
          return prev
        }

        const finishTime = Date.now()
        const newOutOfBoundsPlayer: FinishedPlayer = {
          id: playerId,
          name: playerName,
          finishTime,
          rank: 0, // 장외는 순위 없음
          isOutOfBounds: true
        }

        if (onRemovePlayer) {
          onRemovePlayer(playerId)
        }

        return [...prev, newOutOfBoundsPlayer]
      })
    },
    []
  )

  const resetRanking = useCallback(() => {
    setFinishedPlayers([])
    setOutOfBoundsPlayers([])
  }, [])

  const allFinishedPlayers = [...finishedPlayers, ...outOfBoundsPlayers]

  return {
    finishedPlayers: allFinishedPlayers,
    onPlayerFinish,
    onPlayerOutOfBounds,
    resetRanking
  }
}
