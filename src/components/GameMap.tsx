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
  const [cameraTrackingEnabled, setCameraTrackingEnabled] = useState(true)

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
        
        {raceStarted && (
          <ToggleButton 
            onClick={() => setCameraTrackingEnabled(!cameraTrackingEnabled)}
            isActive={cameraTrackingEnabled}
          >
            카메라 추적: {cameraTrackingEnabled ? 'ON' : 'OFF'}
          </ToggleButton>
        )}
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
          cameraTrackingEnabled={cameraTrackingEnabled}
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

interface ToggleButtonProps {
  isActive: boolean;
}

const ToggleButton = styled.button<ToggleButtonProps>`
  background: ${props => props.isActive ? theme.colors.primary : 'rgba(255, 255, 255, 0.2)'};
  color: ${theme.colors.white};
  border: 2px solid ${theme.colors.primary};
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.md};
  cursor: pointer;
  font-family: Arial, sans-serif;
  font-weight: bold;
  margin-top: ${theme.spacing.md};
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.isActive ? theme.colors.primaryHover : 'rgba(255, 255, 255, 0.3)'};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`
