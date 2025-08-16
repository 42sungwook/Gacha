import './App.css'

import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/cannon'
import { Box, Plane } from './components'

const App = () => {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas camera={{ position: [0, 5, 10] }}>
        <ambientLight intensity={Math.PI / 2} />
        <Physics gravity={[0, -9.82, 0]}>
          <Box
            position={[-1, 15, 0]}
            mass={0.5}
            color="#ff6b6b"
          />
          <Box
            position={[0, 10, 0]}
            mass={1}
            color="#4ecdc4"
          />
          <Box
            position={[1, 12, 0]}
            mass={2}
            color="#45b7d1"
          />
          <Box
            position={[0.5, 18, 0]}
            mass={5}
            color="#96ceb4"
          />
          <Plane />
        </Physics>
      </Canvas>
    </div>
  )
}

export default App
