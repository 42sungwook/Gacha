import { usePlane } from '@react-three/cannon'

const Plane = () => {
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, -3, 0]
  }))
  return (
    <mesh ref={ref}>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial
        color="#cccccc"
        transparent
        opacity={0.3}
      />
    </mesh>
  )
}

export default Plane
