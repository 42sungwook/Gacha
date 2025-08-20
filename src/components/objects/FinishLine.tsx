import { useBox, type CollideBeginEvent } from '@react-three/cannon'
import type { FinishLineConfig } from '../../types/gameConfig'

interface FinishLineProps {
  config: FinishLineConfig
  onPlayerFinish?: (playerId: string) => void
}

export function FinishLine({ config, onPlayerFinish }: FinishLineProps) {
  const [ref] = useBox(() => ({
    mass: 0,
    position: [config.position.x, config.position.y, config.position.z],
    args: [config.size.x, config.size.y, config.size.z],
    onCollideBegin: (e: CollideBeginEvent) => {
      const otherBody = e.body
      const target = e.target
      const playerId = otherBody?.userData?.playerId || target?.userData?.playerId
      
      if (playerId && onPlayerFinish) {
        onPlayerFinish(playerId)
      }
    }
  }))

  return (
    <mesh ref={ref}>
      <boxGeometry args={[config.size.x, config.size.y, config.size.z]} />
      <meshStandardMaterial
        color={config.color || '#2ecc71'}
        roughness={0.1}
        metalness={0.2}
        transparent
        opacity={0.7}
      />
    </mesh>
  )
}