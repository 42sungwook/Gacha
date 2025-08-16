import * as THREE from 'three'
import { useState } from 'react'
import type { ThreeElements } from '@react-three/fiber'
import { useBox } from '@react-three/cannon'

const Box = ({
  position,
  mass = 1,
  color = '#2f74c0',
  scale = Math.pow(mass, 1 / 3),
  ...meshProps
}: {
  position: [number, number, number]
  mass?: number
  color?: string
  scale?: number
} & ThreeElements['mesh']) => {
  const [hovered, setHover] = useState(false)

  const [ref] = useBox<THREE.Mesh>(() => ({
    mass,
    position,
    args: [scale, scale, scale]
  }))

  return (
    <mesh
      ref={ref}
      scale={scale}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
      {...meshProps}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? 'hotpink' : color} />
    </mesh>
  )
}

export default Box
