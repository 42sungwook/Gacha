import { useBox, useCylinder } from '@react-three/cannon'
import type { ObstacleConfig } from '../../types/gameConfig'

export function Obstacle({ config }: { config: ObstacleConfig }) {
  const rotation: [number, number, number] = config.rotation
    ? [config.rotation.x, config.rotation.y, config.rotation.z]
    : [0, 0, 0]

  if (config.type === 'box') {
    const [ref] = useBox(() => ({
      mass: config.mass || 0,
      position: [config.position.x, config.position.y, config.position.z],
      args: [config.size.x, config.size.y, config.size.z],
      rotation
    }))

    return (
      <mesh ref={ref}>
        <boxGeometry args={[config.size.x, config.size.y, config.size.z]} />
        <meshStandardMaterial color={config.color || '#e67e22'} />
      </mesh>
    )
  }

  if (config.type === 'cylinder') {
    const [ref] = useCylinder(() => ({
      mass: config.mass || 0,
      position: [config.position.x, config.position.y, config.position.z],
      args: [config.size.x, config.size.x, config.size.y, 8],
      rotation
    }))

    return (
      <mesh ref={ref}>
        <cylinderGeometry
          args={[config.size.x, config.size.x, config.size.y, 8]}
        />
        <meshStandardMaterial color={config.color || '#e74c3c'} />
      </mesh>
    )
  }

  if (config.type === 'sphere') {
    const [ref] = useBox(() => ({
      mass: config.mass || 0,
      position: [config.position.x, config.position.y, config.position.z],
      args: [config.size.x, config.size.y, config.size.z],
      rotation
    }))

    return (
      <mesh ref={ref}>
        <sphereGeometry args={[config.size.x / 2]} />
        <meshStandardMaterial color={config.color || '#f39c12'} />
      </mesh>
    )
  }

  return null
}