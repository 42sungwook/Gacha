import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { GameContent } from './GameContent'
import type { GameConfig } from '../types/gameConfig'
import { getDefaultPlayers, getDefaultPositions, type PlayerObjectWithPosition } from '../utils/mapRegistry'
import styled from 'styled-components'
import { theme } from '../styles'

interface GameMapProps {
  config: GameConfig
}

export function GameMap({ config }: GameMapProps) {
  const [raceStarted, setRaceStarted] = useState(false)

  const startRace = () => {
    setRaceStarted(true)
  }

  const players = getDefaultPlayers()
  const positions = getDefaultPositions()

  const playerObjects: PlayerObjectWithPosition[] = players.map((player, index) => ({
    ...player,
    position: positions[index]
  }))

  return (
    <Container>
      <GameOverlay>
        <h3>{config.name}</h3>
        <p>{config.description}</p>

        {!raceStarted && <button onClick={startRace}>경주 시작!</button>}
      </GameOverlay>

      <Canvas
        camera={{
          position: [
            config.camera.position.x,
            config.camera.position.y,
            config.camera.position.z
          ]
        }}
      >
        <GameContent 
          config={config} 
          raceStarted={raceStarted} 
          playerObjects={playerObjects} 
        />
      </Canvas>
    </Container>
  )
}

export const Container = styled.div`
  width: 100vw;
  height: 100vh;
  position: relative;
`

const GameOverlay = styled.div`
  position: absolute;
  top: ${theme.spacing.xl};
  left: ${theme.spacing.xl};
  z-index: ${theme.zIndex.overlay};
  background: rgba(0, 0, 0, 0.7);
  color: ${theme.colors.white};
  padding: ${theme.spacing.xl};
  border-radius: ${theme.borderRadius.lg};
  font-family: Arial, sans-serif;
`
