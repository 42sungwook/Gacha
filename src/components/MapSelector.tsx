import styled from 'styled-components'
import { theme } from '../styles/theme'
import { getMapList } from '../utils/mapRegistry'

interface MapSelectorProps {
  selectedMapId: string
  onMapSelect: (mapId: string) => void
}

export function MapSelector({ selectedMapId, onMapSelect }: MapSelectorProps) {
  const maps = getMapList()

  return (
    <SelectorContainer>
      <SelectorTitle>맵 선택</SelectorTitle>
      {maps.map((map) => (
        <MapOption
          key={map.id}
          isSelected={selectedMapId === map.id}
          onClick={() => onMapSelect(map.id)}
        >
          <div>{map.name}</div>
          <MapInfo>🚧 {map.config.obstacles.length}개 장애물</MapInfo>
        </MapOption>
      ))}
    </SelectorContainer>
  )
}

const SelectorContainer = styled.div`
  position: absolute;
  top: ${theme.spacing.xl};
  right: ${theme.spacing.xl};
  z-index: ${theme.zIndex.overlay};
  background: rgba(0, 0, 0, 0.8);
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.md};
  min-width: 200px;
`

const SelectorTitle = styled.h4`
  color: ${theme.colors.white};
  margin: 0 0 ${theme.spacing.sm} 0;
  font-size: ${theme.fontSize.sm};
`

const MapOption = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'isSelected'
})<{ isSelected: boolean }>`
  padding: ${theme.spacing.sm};
  margin: ${theme.spacing.xs} 0;
  background: ${({ isSelected }) =>
    isSelected ? theme.colors.primary : 'rgba(255, 255, 255, 0.1)'};
  color: ${theme.colors.white};
  border-radius: ${theme.borderRadius.sm};
  cursor: pointer;
  font-size: ${theme.fontSize.xs};
  transition: all 0.2s ease;

  &:hover {
    background: ${({ isSelected }) =>
      isSelected ? theme.colors.primary : 'rgba(255, 255, 255, 0.2)'};
  }
`

const MapInfo = styled.div`
  font-size: ${theme.fontSize.xs};
  color: rgba(255, 255, 255, 0.7);
  margin-top: ${theme.spacing.xs};
`
