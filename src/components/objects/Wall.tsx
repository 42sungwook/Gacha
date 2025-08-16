import { useBox } from '@react-three/cannon'
import type { WallConfig } from '../../types/gameConfig'

export function Wall({ config }: { config: WallConfig }) {
  const [ref] = useBox(() => ({
    mass: 0,
    position: [config.position.x, config.position.y, config.position.z],
    args: [config.size.x, config.size.y, config.size.z],
    rotation: config.rotation
      ? [config.rotation.x, config.rotation.y, config.rotation.z]
      : [0, 0, 0]
  }))

  return (
    <mesh ref={ref}>
      <boxGeometry args={[config.size.x, config.size.y, config.size.z]} />
      <meshStandardMaterial
        color={config.color || ''}
        transparent
        opacity={config.color ? 0.7 : 0.1}
      />
    </mesh>
  )
}