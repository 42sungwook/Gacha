import { useSphere, type Api } from '@react-three/cannon'
import * as THREE from 'three'
import { forwardRef, useEffect } from 'react'
import type { PlayerConfig } from '../../types/gameConfig'

interface PlayerProps {
  config: PlayerConfig
  onBodyRef?: (id: string, api: Api<THREE.Mesh>[1]) => void
}

export const Player = forwardRef<THREE.Mesh, PlayerProps>(
  ({ config, onBodyRef }, forwardedRef) => {
    // size에서 반지름 계산 (가장 작은 값의 절반 사용)
    const size = config.size || { x: 1, y: 1, z: 1 }
    const radius = Math.min(size.x, size.y, size.z) / 2

    const [ref, api] = useSphere<THREE.Mesh>(() => ({
      mass: config.mass,
      position: [config.position.x, config.position.y, config.position.z],
      args: [radius]
    }))

    // API 객체를 상위 컴포넌트로 전달
    useEffect(() => {
      if (onBodyRef && api) {
        onBodyRef(config.id, api)
      }
    }, [config.id, api, onBodyRef])

    // forwardedRef와 cannon ref 모두 적용
    const setRefs = (node: THREE.Mesh | null) => {
      if (typeof forwardedRef === 'function') {
        forwardedRef(node)
      } else if (forwardedRef) {
        forwardedRef.current = node
      }

      if (ref.current !== node) {
        ;(ref as any).current = node
      }
    }

    return (
      <mesh ref={setRefs}>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial
          color={config.color}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>
    )
  }
)
