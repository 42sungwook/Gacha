import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { theme } from '../styles'

interface PlayerInputProps {
  onPlayersChange: (players: string) => void
  disabled?: boolean
}

const STORAGE_KEY = 'gacha-players-input'
const DEFAULT_PLAYERS = 'Mike*5,Steve*5,Hellen*5'

export function PlayerInput({ onPlayersChange, disabled }: PlayerInputProps) {
  // localStorage에서 불러오기, 없으면 기본값 사용
  const [playersText, setPlayersText] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved || DEFAULT_PLAYERS
  })

  // 초기값을 부모에게 전달
  useEffect(() => {
    onPlayersChange(playersText)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPlayersText(value)
    onPlayersChange(value)
  }

  const handleBlur = () => {
    // blur 시 localStorage에 저장
    localStorage.setItem(STORAGE_KEY, playersText)
  }

  return (
    <InputContainer>
      <InputLabel>플레이어 설정</InputLabel>
      <PlayerInputField
        type="text"
        value={playersText}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="Mike*5,Steve*5,Hellen*5"
        disabled={disabled}
      />
      <InputHint>이름*개수,이름*개수 형식으로 입력</InputHint>
    </InputContainer>
  )
}

const InputContainer = styled.div`
  position: absolute;
  bottom: ${theme.spacing.xl};
  left: ${theme.spacing.xl};
  z-index: ${theme.zIndex.overlay};
  background: rgba(0, 0, 0, 0.8);
  color: ${theme.colors.white};
  padding: ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.lg};
  font-family: Arial, sans-serif;
  min-width: 300px;
`

const InputLabel = styled.label`
  display: block;
  margin-bottom: ${theme.spacing.sm};
  font-size: ${theme.fontSize.sm};
  font-weight: bold;
  color: ${theme.colors.winner};
`

const PlayerInputField = styled.input`
  width: 90%;
  padding: ${theme.spacing.sm};
  border: 2px solid ${theme.colors.primary};
  border-radius: ${theme.borderRadius.sm};
  background: rgba(255, 255, 255, 0.1);
  color: ${theme.colors.white};
  font-family: Arial, sans-serif;
  font-size: ${theme.fontSize.sm};

  &::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }

  &:focus {
    outline: none;
    border-color: ${theme.colors.primaryHover};
    box-shadow: 0 0 0 2px rgba(46, 204, 113, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

const InputHint = styled.div`
  margin-top: ${theme.spacing.xs};
  font-size: ${theme.fontSize.xs};
  color: rgba(255, 255, 255, 0.7);
`
