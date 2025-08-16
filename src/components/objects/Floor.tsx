import { usePlane } from '@react-three/cannon'
import type { Vector3 } from '../../types/gameConfig'

export function Floor({
  position,
  color = '#cccccc'
}: {
  position: Vector3
  color?: string
}) {
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [position.x, position.y, position.z]
  }))

  return (
    <mesh ref={ref}>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial color={color} />
    </mesh>
  )
}