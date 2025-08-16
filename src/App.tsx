import { useState } from 'react'
import './App.css'
import { GameMap } from './components/GameMap'
import { MapSelector } from './components/MapSelector'
import { getMapById } from './utils/mapRegistry'

const App = () => {
  const [selectedMapId, setSelectedMapId] = useState('default')
  const selectedMap = getMapById(selectedMapId)

  return (
    <div style={{ position: 'relative' }}>
      <MapSelector
        selectedMapId={selectedMapId}
        onMapSelect={setSelectedMapId}
      />
      <GameMap config={selectedMap.config} />
    </div>
  )
}

export default App
