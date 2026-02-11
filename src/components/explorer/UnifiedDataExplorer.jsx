import React, { useState, useEffect } from 'react'
import ExplorerMap from './ExplorerMap'
import BusinessAnalytics from './BusinessAnalytics'
import WalkabilityAnalytics from './WalkabilityAnalytics'
import LightingAnalytics from './LightingAnalytics'
import './UnifiedDataExplorer.css'

const DASHBOARD_MODES = [
  { id: 'business', label: 'Business Analytics', icon: '🏪' },
  { id: 'walkability', label: 'Walkability & Cycling', icon: '🚶' },
  { id: 'lighting', label: 'Street Lighting', icon: '💡' }
]

const UnifiedDataExplorer = () => {
  const [dashboardMode, setDashboardMode] = useState('business')
  const [map, setMap] = useState(null)
  
  // Business dashboard state
  const [businessMode, setBusinessMode] = useState('liveliness') // 'liveliness', 'opinions', 'ratings', 'amenities', 'categories', 'network', 'property'
  const [dayOfWeek, setDayOfWeek] = useState(new Date().getDay())
  const [hour, setHour] = useState(new Date().getHours())
  const [businessesData, setBusinessesData] = useState(null)
  const [streetStallsData, setStreetStallsData] = useState(null)
  const [propertiesData, setPropertiesData] = useState(null)
  const [surveyData, setSurveyData] = useState(null)
  
  // Walkability dashboard state
  const [activityType, setActivityType] = useState('pedestrian') // 'pedestrian' or 'cycling'
  const [networkData, setNetworkData] = useState(null)
  const [pedestrianData, setPedestrianData] = useState(null)
  const [cyclingData, setCyclingData] = useState(null)
  
  // Lighting dashboard state
  const [lightingSegments, setLightingSegments] = useState(null)
  const [lightingProjects, setLightingProjects] = useState(null)
  const [lightIntensityRaster, setLightIntensityRaster] = useState(null)
  
  // Layer visibility
  const [visibleLayers, setVisibleLayers] = useState({
    // Business layers
    businesses: true,
    streetStalls: false,
    properties: false,
    // Walkability layers
    network: true,
    pedestrianActivity: false,
    cyclingActivity: false,
    // Lighting layers
    lightingSegments: false,
    lightingProjects: false,
    lightIntensity: false
  })
  
  // Load business data
  useEffect(() => {
    const loadBusinessData = async () => {
      try {
        const [businesses, stalls, properties, survey] = await Promise.all([
          fetch('/data/business/POI_enriched_20260120_185944.geojson').then(r => r.json()),
          fetch('/data/business/streetStalls.geojson').then(r => r.json()),
          fetch('/data/business/properties_consolidated.geojson').then(r => r.json()),
          fetch('/data/business/survey_data.geojson').then(r => r.json())
        ])
        
        console.log('Business data loaded:', {
          businesses: businesses.features?.length,
          stalls: stalls.features?.length,
          properties: properties.features?.length,
          survey: survey.features?.length
        })
        
        setBusinessesData(businesses)
        setStreetStallsData(stalls)
        setPropertiesData(properties)
        setSurveyData(survey)
      } catch (error) {
        console.error('Error loading business data:', error)
      }
    }
    
    if (dashboardMode === 'business') {
      loadBusinessData()
    }
  }, [dashboardMode])
  
  // Load walkability data
  useEffect(() => {
    const loadWalkabilityData = async () => {
      try {
        const [network, pedestrian, cycling] = await Promise.all([
          fetch('/data/walkabilty/processed/network_connectivity.geojson').then(r => r.json()),
          fetch('/data/walkabilty/processed/pedestrian_month_all.geojson').then(r => r.json()),
          fetch('/data/walkabilty/processed/cycling_month_all.geojson').then(r => r.json())
        ])
        
        setNetworkData(network)
        setPedestrianData(pedestrian)
        setCyclingData(cycling)
      } catch (error) {
        console.error('Error loading walkability data:', error)
      }
    }
    
    if (dashboardMode === 'walkability') {
      loadWalkabilityData()
    }
  }, [dashboardMode])
  
  // Load lighting data
  useEffect(() => {
    const loadLightingData = async () => {
      try {
        const [segments, projects] = await Promise.all([
          fetch('/data/lighting/road_segments_lighting_kpis.geojson').then(r => r.json()),
          fetch('/data/lighting/lighting.geojson').then(r => r.json())
        ])
        
        setLightingSegments(segments)
        setLightingProjects(projects)
        // Light intensity raster will be loaded separately in the map component
      } catch (error) {
        console.error('Error loading lighting data:', error)
      }
    }
    
    if (dashboardMode === 'lighting') {
      loadLightingData()
    }
  }, [dashboardMode])
  
  const toggleLayer = (layerId) => {
    setVisibleLayers(prev => ({
      ...prev,
      [layerId]: !prev[layerId]
    }))
  }
  
  return (
    <div className="unified-data-explorer">
      <div className="explorer-header">
        <h2>Data Explorer</h2>
        <div className="dashboard-mode-selector">
          {DASHBOARD_MODES.map(mode => (
            <button
              key={mode.id}
              className={`mode-btn ${dashboardMode === mode.id ? 'active' : ''}`}
              onClick={() => setDashboardMode(mode.id)}
            >
              <span className="mode-icon">{mode.icon}</span>
              <span className="mode-label">{mode.label}</span>
            </button>
          ))}
        </div>
      </div>
      
      <div className="explorer-content">
        <aside className="explorer-sidebar">
          {dashboardMode === 'business' && (
            <BusinessAnalytics
              mode={businessMode}
              onModeChange={setBusinessMode}
              dayOfWeek={dayOfWeek}
              hour={hour}
              onDayChange={setDayOfWeek}
              onHourChange={setHour}
              businessesData={businessesData}
              streetStallsData={streetStallsData}
              propertiesData={propertiesData}
              surveyData={surveyData}
              visibleLayers={visibleLayers}
              onLayerToggle={toggleLayer}
            />
          )}
          
          {dashboardMode === 'walkability' && (
            <WalkabilityAnalytics
              activityType={activityType}
              onActivityChange={setActivityType}
              networkData={networkData}
              pedestrianData={pedestrianData}
              cyclingData={cyclingData}
              visibleLayers={visibleLayers}
              onLayerToggle={toggleLayer}
            />
          )}
          
          {dashboardMode === 'lighting' && (
            <LightingAnalytics
              segmentsData={lightingSegments}
              projectsData={lightingProjects}
              visibleLayers={visibleLayers}
              onLayerToggle={toggleLayer}
            />
          )}
        </aside>
        
        <main className="explorer-map-container">
          <ExplorerMap
            dashboardMode={dashboardMode}
            businessMode={businessMode}
            activityType={activityType}
            dayOfWeek={dayOfWeek}
            hour={hour}
            businessesData={businessesData}
            streetStallsData={streetStallsData}
            propertiesData={propertiesData}
            networkData={networkData}
            pedestrianData={pedestrianData}
            cyclingData={cyclingData}
            lightingSegments={lightingSegments}
            lightingProjects={lightingProjects}
            visibleLayers={visibleLayers}
            onMapLoad={setMap}
          />
        </main>
      </div>
    </div>
  )
}

export default UnifiedDataExplorer
