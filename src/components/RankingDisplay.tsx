import styled from 'styled-components'
import { theme } from '../styles'
import type { FinishedPlayer } from '../hooks/useFinishLineDetection'

interface RankingDisplayProps {
  finishedPlayers: FinishedPlayer[]
  raceStarted: boolean
}

export function RankingDisplay({
  finishedPlayers,
  raceStarted
}: RankingDisplayProps) {
  if (!raceStarted || finishedPlayers.length === 0) {
    return null
  }

  return (
    <RankingContainer>
      <RankingTitle>순위</RankingTitle>
      {finishedPlayers.map((player) => (
        <RankingItem
          key={player.id}
          rank={player.rank}
        >
          <RankBadge rank={player.rank}>{player.rank}</RankBadge>
          <PlayerName>{player.name}</PlayerName>
        </RankingItem>
      ))}
    </RankingContainer>
  )
}

const RankingContainer = styled.div`
  position: absolute;
  top: 150px;
  right: ${theme.spacing.xl};
  z-index: ${theme.zIndex.overlay};
  background: rgba(0, 0, 0, 0.8);
  color: ${theme.colors.white};
  padding: ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.lg};
  min-width: 200px;
  max-height: 80vh;
  overflow-y: auto;
  font-family: Arial, sans-serif;
`

const RankingTitle = styled.h3`
  margin: 0 0 ${theme.spacing.md} 0;
  font-size: ${theme.fontSize.lg};
  text-align: center;
  color: ${theme.colors.winner};
  text-shadow: ${theme.shadows.text};
`

interface RankingItemProps {
  rank: number
}

const RankingItem = styled.div<RankingItemProps>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.sm} 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);

  &:last-child {
    border-bottom: none;
  }

  animation: slideIn 0.3s ease-out;

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
`

interface RankBadgeProps {
  rank: number
}

const getRankColor = (rank: number) => {
  switch (rank) {
    case 1:
      return '#FFD700' // Gold
    case 2:
      return '#C0C0C0' // Silver
    case 3:
      return '#CD7F32' // Bronze
    default:
      return theme.colors.gray
  }
}

const RankBadge = styled.div<RankBadgeProps>`
  width: 30px;
  height: 30px;
  border-radius: ${theme.borderRadius.round};
  background: ${(props) => getRankColor(props.rank)};
  color: ${theme.colors.black};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: ${theme.fontSize.sm};
  box-shadow: ${theme.shadows.md};
`

const PlayerName = styled.span`
  font-size: ${theme.fontSize.md};
  font-weight: 500;
`
