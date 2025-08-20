import { useSphere, type Api } from '@react-three/cannon'
import * as THREE from 'three'
import { forwardRef, useEffect, useRef } from 'react'
import { Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import type { PlayerConfig } from '../../types/gameConfig'

const TEXT_HEIGHT_OFFSET = 0.3

interface PlayerProps {
  config: PlayerConfig
  onBodyRef?: (id: string, api: Api<THREE.Mesh>[1]) => void
  name?: string
}

export const Player = forwardRef<THREE.Mesh, PlayerProps>(
  ({ config, onBodyRef, name }, forwardedRef) => {
    const radius =
      Math.min(config.size?.x || 1, config.size?.y || 1, config.size?.z || 1) /
      2
    const textRef = useRef<THREE.Mesh>(null)
    const isMountedRef = useRef(true)

    const [ref, api] = useSphere<THREE.Mesh>(() => ({
      mass: config.mass,
      position: [config.position.x, config.position.y, config.position.z],
      args: [radius],
      userData: { playerId: config.id }
    }))

    useEffect(() => {
      isMountedRef.current = true
      return () => {
        isMountedRef.current = false
      }
    }, [])
    useFrame(({ camera }) => {
      if (!isMountedRef.current || !textRef.current || !ref.current) return

      try {
        const worldPosition = new THREE.Vector3()
        ref.current.getWorldPosition(worldPosition)

        textRef.current.position.set(
          worldPosition.x,
          worldPosition.y + radius + TEXT_HEIGHT_OFFSET,
          worldPosition.z
        )

        textRef.current.lookAt(camera.position)
        textRef.current.rotation.x = 0
        textRef.current.rotation.z = 0
      } catch (error) {
        // 에러 무시
      }
    })

    useEffect(() => {
      if (ref.current) {
        ref.current.userData = { playerId: config.id }
      }
    }, [config.id])

    useEffect(() => {
      if (onBodyRef && api) {
        onBodyRef(config.id, api)
      }
    }, [config.id, api, onBodyRef])

    const setRefs = (node: THREE.Mesh | null) => {
      if (typeof forwardedRef === 'function') {
        forwardedRef(node)
      } else if (forwardedRef) {
        forwardedRef.current = node
      }

      if (ref.current !== node) {
        const refWithCurrent = ref as React.MutableRefObject<THREE.Mesh | null>
        refWithCurrent.current = node
      }
    }

    return (
      <>
        <mesh ref={setRefs}>
          <sphereGeometry args={[radius, 32, 32]} />
          <meshStandardMaterial
            color={config.color}
            roughness={0.3}
            metalness={0.1}
          />
        </mesh>

        {name && (
          <Text
            ref={textRef}
            position={[
              config.position.x,
              config.position.y + radius + TEXT_HEIGHT_OFFSET,
              config.position.z
            ]}
            fontSize={0.3}
            color="white"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.03}
            outlineColor="black"
          >
            {name}
          </Text>
        )}
      </>
    )
  }
)
