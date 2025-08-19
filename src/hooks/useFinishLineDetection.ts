import { useState, useCallback } from 'react'

export interface FinishedPlayer {
  id: string
  name: string
  finishTime: number
  rank: number
}

export function useFinishLineDetection() {
  const [finishedPlayers, setFinishedPlayers] = useState<FinishedPlayer[]>([])

  const onPlayerFinish = useCallback((playerId: string, playerName: string, onRemovePlayer?: (playerId: string) => void) => {
    setFinishedPlayers(prev => {
      if (prev.some(p => p.id === playerId)) {
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
  }, [])

  const resetRanking = useCallback(() => {
    setFinishedPlayers([])
  }, [])

  return {
    finishedPlayers,
    onPlayerFinish,
    resetRanking
  }
}