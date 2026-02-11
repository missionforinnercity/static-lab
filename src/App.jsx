import React, { useState } from 'react'
import Map from './components/Map'
import ModeToggle from './components/ModeToggle'
import NarrativeTours from './components/NarrativeTours'
import DataExplorer from './components/DataExplorer'
import TemporalControls from './components/TemporalControls'
import './App.css'

function App() {
  const [mode, setMode] = useState('narrative') // 'narrative' or 'explorer'
  const [selectedTour, setSelectedTour] = useState(null)
  const [activeLayers, setActiveLayers] = useState({
    shade: false,
    lighting: false,
    walkability: false,
    business: false,
    publicArt: false
  })
  
  const [temporalState, setTemporalState] = useState({
    season: 'summer',
    timeOfDay: '1400',
    hour: 14,
    date: new Date('2025-12-15')
  })

  const [explorerFilters, setExplorerFilters] = useState({
    metric: 'betweenness',
    sortOrder: 'desc',
    limit: 10
  })

  return (
    <div className="app">
      <header className="app-header">
        <h1>Urban Experience Dashboard</h1>
        <ModeToggle mode={mode} onModeChange={setMode} />
      </header>

      <div className="app-content">
        {mode === 'narrative' ? (
          <>
            <aside className="sidebar">
              <NarrativeTours
                selectedTour={selectedTour}
                onTourSelect={setSelectedTour}
                onLayersChange={setActiveLayers}
                onTemporalChange={setTemporalState}
              />
              <TemporalControls
                state={temporalState}
                onChange={setTemporalState}
                mode={mode}
              />
            </aside>

            <main className="map-container">
              <Map
                mode={mode}
                activeLayers={activeLayers}
                temporalState={temporalState}
                explorerFilters={explorerFilters}
                selectedTour={selectedTour}
              />
            </main>
          </>
        ) : (
          <DataExplorer
            filters={explorerFilters}
            onFiltersChange={setExplorerFilters}
            activeLayers={activeLayers}
            onLayersChange={setActiveLayers}
          />
        )}
      </div>
    </div>
  )
}

export default App
