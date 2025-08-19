import { useState, useCallback } from 'react'

export interface FinishedPlayer {
  id: string
  finishTime: number
  rank: number
}

export function useFinishLineDetection() {
  const [finishedPlayers, setFinishedPlayers] = useState<FinishedPlayer[]>([])
  const [removedPlayers, setRemovedPlayers] = useState<Set<string>>(new Set())

  const onPlayerFinish = useCallback((playerId: string, onRemovePlayer?: (playerId: string) => void) => {
    setFinishedPlayers(prev => {
      if (prev.some(p => p.id === playerId)) {
        return prev
      }
      
      const finishTime = Date.now()
      const rank = prev.length + 1
      const newFinishedPlayer: FinishedPlayer = {
        id: playerId,
        finishTime,
        rank
      }
      
      setRemovedPlayers(prevRemoved => new Set(prevRemoved).add(playerId))
      
      if (onRemovePlayer) {
        onRemovePlayer(playerId)
      }
      
      return [...prev, newFinishedPlayer]
    })
  }, [])

  const resetRanking = useCallback(() => {
    setFinishedPlayers([])
    setRemovedPlayers(new Set())
  }, [])

  const isPlayerRemoved = useCallback((playerId: string) => {
    return removedPlayers.has(playerId)
  }, [removedPlayers])

  return {
    finishedPlayers,
    onPlayerFinish,
    resetRanking,
    isPlayerRemoved
  }
}