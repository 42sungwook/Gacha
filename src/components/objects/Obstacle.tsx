import { useRef } from 'react'
import { useBox, useCylinder } from '@react-three/cannon'
import { useFrame } from '@react-three/fiber'
import type { Api } from '@react-three/cannon'
import type { Mesh } from 'three'
import type { ObstacleConfig } from '../../types/gameConfig'

export function Obstacle({ config }: { config: ObstacleConfig }) {
  const apiRef = useRef<Api<Mesh>[1] | null>(null)
  
  const rotation: [number, number, number] = config.rotation
    ? [config.rotation.x, config.rotation.y, config.rotation.z]
    : [0, 0, 0]

  useFrame(() => {
    if (apiRef.current && config.rotationSpeed) {
      apiRef.current.angularVelocity.set(
        config.rotationSpeed.x,
        config.rotationSpeed.y,
        config.rotationSpeed.z
      )
    }
  })

  if (config.type === 'box') {
    const [ref, api] = useBox(() => ({
      mass: config.rotationSpeed ? 1 : (config.mass ?? 0),
      type: config.rotationSpeed ? ('Kinematic' as const) : ('Static' as const),
      position: [config.position.x, config.position.y, config.position.z],
      args: [config.size.x, config.size.y, config.size.z],
      rotation
    }))

    apiRef.current = api

    return (
      <mesh ref={ref}>
        <boxGeometry args={[config.size.x, config.size.y, config.size.z]} />
        <meshStandardMaterial color={config.color || '#e67e22'} />
      </mesh>
    )
  }

  if (config.type === 'cylinder') {
    const [ref, api] = useCylinder(() => ({
      mass: config.rotationSpeed ? 1 : (config.mass || 0), // 회전하는 경우 질량 설정
      type: config.rotationSpeed ? 'Kinematic' : 'Static', // 회전하는 경우 Kinematic
      position: [config.position.x, config.position.y, config.position.z],
      args: [config.size.x, config.size.x, config.size.y, 8],
      rotation
    }))

    // API 저장
    apiRef.current = api

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
    const [ref, api] = useBox(() => ({
      mass: config.rotationSpeed ? 1 : (config.mass || 0), // 회전하는 경우 질량 설정
      type: config.rotationSpeed ? 'Kinematic' : 'Static', // 회전하는 경우 Kinematic
      position: [config.position.x, config.position.y, config.position.z],
      args: [config.size.x, config.size.y, config.size.z],
      rotation
    }))

    // API 저장
    apiRef.current = api

    return (
      <mesh ref={ref}>
        <sphereGeometry args={[config.size.x / 2]} />
        <meshStandardMaterial color={config.color || '#f39c12'} />
      </mesh>
    )
  }

  return null
}