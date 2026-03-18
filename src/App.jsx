import React, { useState, useCallback, lazy, Suspense } from 'react'
import ModeToggle from './components/ModeToggle'
import './App.css'

const Map = lazy(() => import('./components/Map'))
const NarrativeDistricts = lazy(() => import('./components/NarrativeDistricts'))
const DistrictStatsPanel = lazy(() => import('./components/DistrictStatsPanel'))
const DistrictCompare = lazy(() => import('./components/DistrictCompare'))
const WalkabilityPanel = lazy(() => import('./components/WalkabilityPanel'))
const StreetCompare = lazy(() => import('./components/StreetCompare'))
const DataExplorer = lazy(() => import('./components/DataExplorer'))
const WardExplorer = lazy(() => import('./components/WardExplorer'))

function App() {
  const [showLanding, setShowLanding] = useState(true)
  const [mode, setMode] = useState('narrative') // 'narrative' | 'explorer'
  const [narrativeTab, setNarrativeTab] = useState('districts') // 'districts' | 'walkability'
  const [activeLayers, setActiveLayers] = useState({
    shade: false,
    lighting: false,
    walkability: false,
    business: false,
    publicArt: false
  })

  const [explorerFilters, setExplorerFilters] = useState({
    metric: 'betweenness',
    sortOrder: 'desc',
    limit: 10
  })

  // District Narrative Engine state
  const [selectedDistrictId,      setSelectedDistrictId]      = useState(null)
  const [selectedDistrictFeature, setSelectedDistrictFeature] = useState(null)
  const [districtGeoJSON,         setDistrictGeoJSON]         = useState(null)
  const [districtBounds,          setDistrictBounds]          = useState(null)

  // Walkability Index state
  const [walkabilityData, setWalkabilityData] = useState(null)
  const [compareSegments, setCompareSegments] = useState([])
  const [focusedSegment,  setFocusedSegment]  = useState(null)

  // District comparison state
  const [compareDistricts, setCompareDistricts] = useState([])

  const handleDistrictSelect = useCallback((districtId, feature, bounds, fc) => {
    setSelectedDistrictId(districtId)
    setSelectedDistrictFeature(feature)
    setDistrictBounds(bounds)
    if (fc) setDistrictGeoJSON(fc)
  }, [])

  const handleDistrictClick = useCallback((feat) => {
    setSelectedDistrictFeature(feat)
    setSelectedDistrictId(feat.properties.districtId)
    setCompareDistricts(prev => {
      const key = f => f.properties.clusterId
      const exists = prev.findIndex(d => key(d) === key(feat))
      if (exists >= 0) return prev.filter((_, i) => i !== exists)
      if (prev.length >= 2) return [prev[1], feat]
      return [...prev, feat]
    })
  }, [])

  // Switch narrative tab — clear stale map data from previous tab
  const handleNarrativeTab = useCallback((tab) => {
    setNarrativeTab(tab)
    if (tab === 'districts') {
      setWalkabilityData(null)
      setCompareSegments([])
    }
    if (tab === 'walkability') {
      // Don't clear districtGeoJSON — the district click handler (and compare)
      // depend on it being present when the user navigates back to this tab.
      setSelectedDistrictFeature(null)
      setSelectedDistrictId(null)
      setCompareDistricts([])
    }
  }, [])

  const handleSegmentClick = useCallback((segment) => {
    setFocusedSegment(segment)
    setCompareSegments(prev => {
      const key = seg => `${seg.properties.street_name}|${seg.properties.min_lux}`
      const exists = prev.findIndex(s => key(s) === key(segment))
      if (exists >= 0) return prev.filter((_, i) => i !== exists)
      if (prev.length >= 2) return [prev[1], segment]
      return [...prev, segment]
    })
  }, [])

  if (showLanding) {
    return (
      <Suspense fallback={<div className="app-loading-screen">Loading neighbourhood view...</div>}>
        <WardExplorer onEnterDashboard={() => setShowLanding(false)} />
      </Suspense>
    )
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-brand">
          <div className="app-brand-mark" />
          <div>
            <h1 className="app-brand-title">Mission Urban Lab</h1>
            <p className="app-brand-sub">District intelligence · Cape Town Metro</p>
          </div>
        </div>
        <ModeToggle mode={mode} onModeChange={setMode} />
        <div className="app-header-actions">
          <button className="app-back-btn" onClick={() => setShowLanding(true)}>
            ← Neighbourhood View
          </button>
        </div>
      </header>

      <div className="app-content">
        {mode === 'narrative' ? (
          <>
            <aside className="sidebar sidebar--dark">

              {/* Narrative sub-tab switcher */}
              <div className="narrative-tabs">
                <button
                  className={`narrative-tab ${narrativeTab === 'districts' ? 'narrative-tab--active' : ''}`}
                  onClick={() => handleNarrativeTab('districts')}
                >
                  District Explorer
                </button>
                <button
                  className={`narrative-tab ${narrativeTab === 'walkability' ? 'narrative-tab--active' : ''}`}
                  onClick={() => handleNarrativeTab('walkability')}
                >
                  Walkability
                </button>
              </div>

              {narrativeTab === 'districts' ? (
                <Suspense fallback={<div className="app-panel-loading">Loading district explorer...</div>}>
                  <NarrativeDistricts
                    selectedDistrictId={selectedDistrictId}
                    onDistrictSelect={handleDistrictSelect}
                    onLayersChange={setActiveLayers}
                  />
                </Suspense>
              ) : (
                <Suspense fallback={<div className="app-panel-loading">Loading walkability tools...</div>}>
                  <WalkabilityPanel
                    onWalkabilityChange={setWalkabilityData}
                    compareCount={compareSegments.length}
                    onSegmentClick={handleSegmentClick}
                  />
                </Suspense>
              )}
            </aside>

            <main className="map-container">
              <Suspense fallback={<div className="app-map-loading">Loading map...</div>}>
                <Map
                  mode={mode}
                  activeLayers={activeLayers}
                  temporalState={{ season: 'summer', timeOfDay: '1400', hour: 14 }}
                  explorerFilters={explorerFilters}
                  selectedTour={null}
                  districtGeoJSON={districtGeoJSON}
                  selectedDistrictId={selectedDistrictId}
                  districtBounds={districtBounds}
                  onDistrictClick={handleDistrictClick}
                  compareDistricts={compareDistricts}
                  showDistricts={narrativeTab === 'districts'}
                  walkabilityData={walkabilityData}
                  onSegmentClick={handleSegmentClick}
                  compareSegments={compareSegments}
                  focusedSegment={focusedSegment}
                />
                {narrativeTab === 'districts' && (
                  <DistrictStatsPanel
                    feature={selectedDistrictFeature}
                    onClose={() => setSelectedDistrictFeature(null)}
                  />
                )}
                {narrativeTab === 'districts' && compareDistricts.length > 0 && (
                  <DistrictCompare
                    districts={compareDistricts}
                    onClose={() => setCompareDistricts([])}
                    onClear={() => setCompareDistricts([])}
                  />
                )}
                {narrativeTab === 'walkability' && compareSegments.length > 0 && (
                  <StreetCompare
                    segments={compareSegments}
                    onClose={() => setCompareSegments([])}
                    onClear={() => setCompareSegments([])}
                  />
                )}
              </Suspense>
            </main>
          </>
        ) : (
          <Suspense fallback={<div className="app-loading-screen">Loading data explorer...</div>}>
            <DataExplorer
              filters={explorerFilters}
              onFiltersChange={setExplorerFilters}
              activeLayers={activeLayers}
              onLayersChange={setActiveLayers}
            />
          </Suspense>
        )}
      </div>
    </div>
  )
}

export default App
