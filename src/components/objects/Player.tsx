import { useSphere } from '@react-three/cannon'
import * as THREE from 'three'
import type { PlayerConfig } from '../../types/gameConfig'

export function Player({ config }: { config: PlayerConfig }) {
  // size에서 반지름 계산 (가장 작은 값의 절반 사용)
  const size = config.size || { x: 1, y: 1, z: 1 }
  const radius = Math.min(size.x, size.y, size.z) / 2

  const [ref] = useSphere<THREE.Mesh>(() => ({
    mass: config.mass,
    position: [config.position.x, config.position.y, config.position.z],
    args: [radius]
  }))

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[radius, 32, 32]} />
      <meshStandardMaterial
        color={config.color}
        roughness={0.3}
        metalness={0.1}
      />
    </mesh>
  )
}