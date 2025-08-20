import { OrbitControls } from '@react-three/drei'
import { Physics } from '@react-three/cannon'
import { Player, Wall, Obstacle, FinishLine } from './objects'
import type { GameConfig } from '../types/gameConfig'
import { useCameraTracking } from '../hooks/useCameraTracking'
import { usePlayerBodies } from '../hooks/usePlayerPositions'
import { useOutOfBoundsDetection } from '../hooks/useOutOfBoundsDetection'
import type { PlayerObjectWithPosition } from '../utils/mapRegistry'

interface GameContentProps {
  config: GameConfig
  raceStarted: boolean
  cameraTrackingEnabled: boolean
  onPlayerFinish?: (playerId: string) => void
  onPlayerOutOfBounds?: (playerId: string) => void
  activePlayers: PlayerObjectWithPosition[]
  allPlayersFinished: boolean
}

export function GameContent({
  config,
  raceStarted,
  cameraTrackingEnabled,
  onPlayerFinish,
  onPlayerOutOfBounds,
  activePlayers,
  allPlayersFinished
}: GameContentProps) {
  const { addPlayerBody, getPlayerBodies } = usePlayerBodies()

  useCameraTracking({
    playerBodies: getPlayerBodies(),
    activePlayers,
    config,
    raceStarted,
    enabled: cameraTrackingEnabled && !allPlayersFinished
  })

  useOutOfBoundsDetection({
    playerBodies: getPlayerBodies(),
    config,
    onPlayerOutOfBounds: onPlayerOutOfBounds || (() => {}),
    enabled: raceStarted && !allPlayersFinished
  })

  return (
    <>
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
        enabled={!raceStarted || !cameraTrackingEnabled || allPlayersFinished}
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
        gravity={
          raceStarted
            ? [
                config.physics.gravity.x,
                config.physics.gravity.y,
                config.physics.gravity.z
              ]
            : [0, 0, 0]
        }
      >
        <FinishLine
          config={config.finishLine}
          onPlayerFinish={onPlayerFinish}
        />

        {config.walls.map((wall) => (
          <Wall
            key={wall.id}
            config={wall}
          />
        ))}

        {config.obstacles.map((obstacle) => (
          <Obstacle
            key={obstacle.id}
            config={obstacle}
          />
        ))}

        {activePlayers.map((playerBox) => (
          <Player
            key={playerBox.id}
            config={{
              id: playerBox.id,
              position: playerBox.position,
              mass: playerBox.mass,
              color: playerBox.color,
              size: { x: 1, y: 1, z: 1 }
            }}
            onBodyRef={addPlayerBody}
          />
        ))}
      </Physics>
    </>
  )
}
