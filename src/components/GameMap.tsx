import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/cannon'
import { OrbitControls } from '@react-three/drei'
import { Player, Wall, Obstacle, FinishLine } from './objects'
import type { GameConfig } from '../types/gameConfig'
import { getDefaultPlayers, getDefaultPositions } from '../utils/mapRegistry'
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

  const playerBoxes = players.map((player, index) => ({
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
        <OrbitControls
          target={
            config.camera.target
              ? [
                  config.camera.target.x,
                  config.camera.target.y,
                  config.camera.target.z
                ]
              : [0, 0, 0]
          }
        />

        <ambientLight intensity={1.2} />
        <directionalLight
          position={[10, 15, 10]}
          intensity={1.5}
          castShadow
        />
        <pointLight
          position={[-10, 10, -10]}
          intensity={0.8}
        />
        <pointLight
          position={[10, 10, 10]}
          intensity={0.8}
        />

        <Physics
          gravity={[
            config.physics.gravity.x,
            config.physics.gravity.y,
            config.physics.gravity.z
          ]}
        >
          {/* 결승선 (물리 바닥 역할) */}
          <FinishLine config={config.finishLine} />

          {/* 벽들 */}
          {config.walls.map((wall) => (
            <Wall
              key={wall.id}
              config={wall}
            />
          ))}

          {/* 장애물들 */}
          {config.obstacles.map((obstacle) => (
            <Obstacle
              key={obstacle.id}
              config={obstacle}
            />
          ))}

          {/* 경주 박스들 */}
          {raceStarted &&
            playerBoxes.map((playerBox) => (
              <Player
                key={playerBox.id}
                config={{
                  id: playerBox.id,
                  position: playerBox.position,
                  mass: playerBox.mass,
                  color: playerBox.color,
                  size: { x: 1, y: 1, z: 1 }
                }}
              />
            ))}
        </Physics>
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
