import { useRef, useCallback } from 'react'
import type { Api } from '@react-three/cannon'
import type { Triplet } from '@pmndrs/cannon-worker-api'
import type { Mesh } from 'three'
import type { Vector3 } from '../types/gameConfig'

interface PlayerData {
  id: string
  api: Api<Mesh>[1]
  currentPosition: Vector3
}

export function usePlayerBodies() {
  const playerBodiesRef = useRef<PlayerData[]>([])

  const addPlayerBody = useCallback((id: string, api: Api<Mesh>[1]) => {
    const existingIndex = playerBodiesRef.current.findIndex((p) => p.id === id)
    const newPlayerData: PlayerData = {
      id,
      api,
      currentPosition: { x: 0, y: 0, z: 0 }
    }

    if (existingIndex >= 0) {
      playerBodiesRef.current[existingIndex] = newPlayerData
    } else {
      playerBodiesRef.current.push(newPlayerData)
    }

    // 실시간 위치 구독
    if (api.position) {
      api.position.subscribe((position: Triplet) => {
        const playerData = playerBodiesRef.current.find((p) => p.id === id)
        if (playerData) {
          playerData.currentPosition = {
            x: position[0],
            y: position[1],
            z: position[2]
          }
        }
      })
    }
  }, [])

  const getPlayerBodies = useCallback(() => {
    return playerBodiesRef.current
  }, [])

  return {
    addPlayerBody,
    getPlayerBodies
  }
}

export type { PlayerData }
