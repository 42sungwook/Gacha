import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { GameContent } from './GameContent'
import { RankingDisplay } from './RankingDisplay'
import { PlayerInput } from './PlayerInput'
import type { GameConfig } from '../types/gameConfig'
import {
  getDefaultPositions,
  type PlayerObjectWithPosition
} from '../utils/mapRegistry'
import { parsePlayersInput, validatePlayersInput } from '../utils/playerParser'
import { useFinishLineDetection } from '../hooks/useFinishLineDetection'
import styled from 'styled-components'
import { theme } from '../styles'

interface GameMapProps {
  config: GameConfig
}

export function GameMap({ config }: GameMapProps) {
  const [raceStarted, setRaceStarted] = useState(false)
  const [cameraTrackingEnabled, setCameraTrackingEnabled] = useState(true)
  const [playersInput, setPlayersInput] = useState('성욱*5,동현*5,하은*5')
  const { finishedPlayers, onPlayerFinish, resetRanking } =
    useFinishLineDetection()
  const [removedPlayerIds, setRemovedPlayerIds] = useState<Set<string>>(
    new Set()
  )

  const startRace = () => {
    const validation = validatePlayersInput(playersInput)
    if (!validation.isValid) {
      alert(validation.error)
      return
    }

    resetRanking()
    setRemovedPlayerIds(new Set())
    setRaceStarted(true)
  }

  // 입력된 플레이어 수에 맞춰 위치 생성
  const validation = validatePlayersInput(playersInput)
  const totalPlayerCount = validation.isValid
    ? playersInput.split(',').reduce((sum, entry) => {
        const match = entry.trim().match(/^(.+)\*(\d+)$/)
        return sum + (match ? parseInt(match[2], 10) : 0)
      }, 0)
    : 50

  const positions = getDefaultPositions(totalPlayerCount)
  const playerObjects: PlayerObjectWithPosition[] = parsePlayersInput(
    playersInput,
    positions
  )

  const handlePlayerFinish = (playerId: string) => {
    const player = playerObjects.find((p) => p.id === playerId)
    const removePlayer = (id: string) => {
      setRemovedPlayerIds((prev) => new Set(prev).add(id))
    }
    onPlayerFinish(playerId, player?.name || playerId, removePlayer)
  }

  const activePlayers = playerObjects.filter((p) => !removedPlayerIds.has(p.id))
  const allPlayersFinished = raceStarted && activePlayers.length === 0

  return (
    <Container>
      <GameOverlay>
        <h3>{config.name}</h3>
        <p>{config.description}</p>

        {!raceStarted && <button onClick={startRace}>경주 시작!</button>}
        {allPlayersFinished && (
          <button onClick={() => setRaceStarted(false)}>다시 시작</button>
        )}

        {raceStarted && !allPlayersFinished && (
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
          cameraTrackingEnabled={cameraTrackingEnabled}
          onPlayerFinish={handlePlayerFinish}
          activePlayers={activePlayers}
        />
      </Canvas>

      <RankingDisplay
        finishedPlayers={finishedPlayers}
        raceStarted={raceStarted}
      />

      <PlayerInput
        onPlayersChange={setPlayersInput}
        disabled={raceStarted}
      />
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
  isActive: boolean
}

const ToggleButton = styled.button<ToggleButtonProps>`
  background: ${(props) =>
    props.isActive ? theme.colors.primary : 'rgba(255, 255, 255, 0.2)'};
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
    background: ${(props) =>
      props.isActive ? theme.colors.primaryHover : 'rgba(255, 255, 255, 0.3)'};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`
