import * as THREE from 'three'
import { useState } from 'react'
import type { ThreeElements } from '@react-three/fiber'
import { useSphere } from '@react-three/cannon'

const Sphere = ({
  position,
  mass = 1,
  color = '#2f74c0',
  radius = Math.pow(mass, 1 / 3) * 0.5,
  ...meshProps
}: {
  position: [number, number, number]
  mass?: number
  color?: string
  radius?: number
} & ThreeElements['mesh']) => {
  const [hovered, setHover] = useState(false)

  const [ref] = useSphere<THREE.Mesh>(() => ({
    mass,
    position,
    args: [radius]
  }))

  return (
    <mesh
      ref={ref}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
      {...meshProps}
    >
      <sphereGeometry args={[radius, 32, 32]} />
      <meshStandardMaterial color={hovered ? 'hotpink' : color} />
    </mesh>
  )
}

export default Sphere
