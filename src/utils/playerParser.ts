import type { PlayerObjectWithPosition } from './mapRegistry'

const colors = [
  '#ff6b6b',
  '#4ecdc4',
  '#45b7d1',
  '#f9ca24',
  '#6c5ce7',
  '#fd79a8',
  '#00b894',
  '#e17055',
  '#a29bfe',
  '#fdcb6e',
  '#e84393',
  '#00cec9',
  '#fd79a8',
  '#2d3436',
  '#636e72'
]

export function parsePlayersInput(
  input: string,
  positions: { x: number; y: number; z: number }[]
): PlayerObjectWithPosition[] {
  if (!input.trim()) {
    return []
  }

  const players: PlayerObjectWithPosition[] = []
  const entries = input
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)

  let colorIndex = 0
  let positionIndex = 0

  for (const entry of entries) {
    const match = entry.match(/^(.+)\*(\d+)$/)

    if (match) {
      const [, name, countStr] = match
      const count = parseInt(countStr, 10)

      if (count > 0 && count <= 50) {
        for (let i = 0; i < count; i++) {
          if (positionIndex >= positions.length) {
            break
          }

          players.push({
            id: `${name}-${i + 1}`,
            name: `${name}#${i + 1}`,
            position: positions[positionIndex],
            mass: Math.random() * 1.5 + 0.5,
            color: colors[colorIndex % colors.length]
          })

          positionIndex++
        }
        colorIndex++
      }
    }
  }

  return players
}

export function validatePlayersInput(input: string): {
  isValid: boolean
  error?: string
} {
  if (!input.trim()) {
    return { isValid: false, error: '플레이어를 입력해주세요.' }
  }

  const entries = input
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
  let totalCount = 0

  for (const entry of entries) {
    const match = entry.match(/^(.+)\*(\d+)$/)

    if (!match) {
      return {
        isValid: false,
        error: `잘못된 형식: "${entry}". 이름*개수 형식으로 입력해주세요.`
      }
    }

    const [, name, countStr] = match
    const count = parseInt(countStr, 10)

    if (name.trim().length === 0) {
      return { isValid: false, error: '이름이 비어있습니다.' }
    }

    if (isNaN(count) || count <= 0) {
      return {
        isValid: false,
        error: `개수는 1 이상의 숫자여야 합니다: "${entry}"`
      }
    }

    if (count > 50) {
      return {
        isValid: false,
        error: `한 플레이어당 최대 50개까지 가능합니다: "${entry}"`
      }
    }

    totalCount += count
  }

  if (totalCount > 100) {
    return {
      isValid: false,
      error: `총 플레이어 수가 100개를 초과합니다. (현재: ${totalCount}개)`
    }
  }

  return { isValid: true }
}
