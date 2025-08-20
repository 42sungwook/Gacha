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
import { usePlayerBodies } from '../hooks/usePlayerPositions'
import styled from 'styled-components'
import { theme } from '../styles'

const CAMERA_HEIGHT_OFFSET = 8
const DEFAULT_GRAVITY = -9.82
const MIN_GRAVITY = -20
const MAX_GRAVITY = -2
const GRAVITY_STEP = 0.1
const WEAK_GRAVITY = -2
const NORMAL_GRAVITY = -5
const EARTH_GRAVITY = -9.82
const STRONG_GRAVITY = -15
const GRAVITY_SLIDER_WIDTH = 200
const GRAVITY_SLIDER_HEIGHT = 6
const SLIDER_THUMB_SIZE = 18
const DEFAULT_PLAYER_COUNT = 50

interface GameMapProps {
  config: GameConfig
}

export function GameMap({ config }: GameMapProps) {
  const [raceStarted, setRaceStarted] = useState(false)
  const [cameraTrackingEnabled, setCameraTrackingEnabled] = useState(true)
  const [playersInput, setPlayersInput] = useState('')
  const [gravity, setGravity] = useState(DEFAULT_GRAVITY)
  const { finishedPlayers, onPlayerFinish, onPlayerOutOfBounds, resetRanking } =
    useFinishLineDetection()
  const [removedPlayerIds, setRemovedPlayerIds] = useState<Set<string>>(
    new Set()
  )
  const { addPlayerBody, getPlayerBodies } = usePlayerBodies()

  const handlePlayersChange = (newPlayersInput: string) => {
    setPlayersInput(newPlayersInput)

    if (!raceStarted) {
      resetRanking()
      setRemovedPlayerIds(new Set())
    }
  }

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
    : DEFAULT_PLAYER_COUNT

  const positions = getDefaultPositions(totalPlayerCount)
  const playerObjects: PlayerObjectWithPosition[] = parsePlayersInput(
    playersInput,
    positions
  )

  // 플레이어 시작 높이 계산 (첫 번째 플레이어의 높이를 기준으로)
  const playerStartHeight = positions.length > 0 ? positions[0].y : 50

  const handlePlayerFinish = (playerId: string) => {
    const player = playerObjects.find((p) => p.id === playerId)
    const removePlayer = (id: string) => {
      setRemovedPlayerIds((prev) => new Set(prev).add(id))
    }
    onPlayerFinish(playerId, player?.name || playerId, removePlayer)
  }

  const handlePlayerOutOfBounds = (playerId: string) => {
    const player = playerObjects.find((p) => p.id === playerId)
    const removePlayer = (id: string) => {
      setRemovedPlayerIds((prev) => new Set(prev).add(id))
    }
    onPlayerOutOfBounds(playerId, player?.name || playerId, removePlayer)
  }

  const activePlayers = playerObjects.filter((p) => !removedPlayerIds.has(p.id))
  const allPlayersFinished = raceStarted && activePlayers.length === 0

  const configWithGravityAndCamera = {
    ...config,
    physics: {
      ...config.physics,
      gravity: { x: 0, y: gravity, z: 0 }
    },
    camera: {
      ...config.camera,
      position: {
        ...config.camera.position,
        y: playerStartHeight + CAMERA_HEIGHT_OFFSET
      },
      target: !raceStarted && config.camera.target ? {
        ...config.camera.target,
        y: playerStartHeight
      } : config.camera.target
    }
  }

  return (
    <Container>
      <GameOverlay>
        <h3>{config.name}</h3>
        <p>{config.description}</p>

        {!raceStarted && (
          <>
            <GravityControl>
              <label>중력 설정: {gravity.toFixed(2)}</label>
              <GravitySlider
                type="range"
                min={MIN_GRAVITY.toString()}
                max={MAX_GRAVITY.toString()}
                step={GRAVITY_STEP.toString()}
                value={gravity}
                onChange={(e) => setGravity(parseFloat(e.target.value))}
              />
              <GravityPresets>
                <PresetButton onClick={() => setGravity(WEAK_GRAVITY)}>약함</PresetButton>
                <PresetButton onClick={() => setGravity(NORMAL_GRAVITY)}>보통</PresetButton>
                <PresetButton onClick={() => setGravity(EARTH_GRAVITY)}>
                  지구
                </PresetButton>
                <PresetButton onClick={() => setGravity(STRONG_GRAVITY)}>
                  강함
                </PresetButton>
              </GravityPresets>
            </GravityControl>
            <button onClick={startRace}>경주 시작!</button>
          </>
        )}
        {allPlayersFinished && (
          <button
            onClick={() => {
              resetRanking()
              setRemovedPlayerIds(new Set())
              setRaceStarted(false)
            }}
          >
            다시 시작
          </button>
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
            configWithGravityAndCamera.camera.position.x,
            configWithGravityAndCamera.camera.position.y,
            configWithGravityAndCamera.camera.position.z
          ]
        }}
      >
        <GameContent
          config={configWithGravityAndCamera}
          raceStarted={raceStarted}
          cameraTrackingEnabled={cameraTrackingEnabled}
          onPlayerFinish={handlePlayerFinish}
          onPlayerOutOfBounds={handlePlayerOutOfBounds}
          activePlayers={activePlayers}
          allPlayersFinished={allPlayersFinished}
          playerBodies={getPlayerBodies()}
          onBodyRef={addPlayerBody}
        />
      </Canvas>

      <RankingDisplay
        finishedPlayers={finishedPlayers}
        raceStarted={raceStarted}
      />

      <PlayerInput
        onPlayersChange={handlePlayersChange}
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

const GravityControl = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.md};

  label {
    font-size: 14px;
    color: ${theme.colors.white};
    font-weight: bold;
  }
`

const GravitySlider = styled.input`
  width: ${GRAVITY_SLIDER_WIDTH}px;
  height: ${GRAVITY_SLIDER_HEIGHT}px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.3);
  outline: none;

  &::-webkit-slider-thumb {
    appearance: none;
    width: ${SLIDER_THUMB_SIZE}px;
    height: ${SLIDER_THUMB_SIZE}px;
    border-radius: 50%;
    background: ${theme.colors.primary};
    cursor: pointer;
    border: 2px solid ${theme.colors.white};
  }

  &::-moz-range-thumb {
    width: ${SLIDER_THUMB_SIZE}px;
    height: ${SLIDER_THUMB_SIZE}px;
    border-radius: 50%;
    background: ${theme.colors.primary};
    cursor: pointer;
    border: 2px solid ${theme.colors.white};
  }
`

const GravityPresets = styled.div`
  display: flex;
  gap: ${theme.spacing.xs};
`

const PresetButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  color: ${theme.colors.white};
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.sm};
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
  }
`
