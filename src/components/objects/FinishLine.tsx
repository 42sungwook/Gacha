import { useBox } from '@react-three/cannon'
import type { FinishLineConfig } from '../../types/gameConfig'

export function FinishLine({ config }: { config: FinishLineConfig }) {
  const [ref] = useBox(() => ({
    mass: 0,
    position: [config.position.x, config.position.y, config.position.z],
    args: [config.size.x, config.size.y, config.size.z]
  }))

  return (
    <mesh ref={ref}>
      <boxGeometry args={[config.size.x, config.size.y, config.size.z]} />
      <meshStandardMaterial
        color={config.color || '#2ecc71'}
        roughness={0.1}
        metalness={0.2}
      />
    </mesh>
  )
}