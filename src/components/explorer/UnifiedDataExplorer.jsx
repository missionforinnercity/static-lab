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
  const [businessMode, setBusinessMode] = useState('liveliness') // 'liveliness', 'opinions', 'ratings', 'amenities', 'categories', 'property'
  const [dayOfWeek, setDayOfWeek] = useState(new Date().getDay())
  const [hour, setHour] = useState(new Date().getHours())
  const [businessesData, setBusinessesData] = useState(null)
  const [streetStallsData, setStreetStallsData] = useState(null)
  const [propertiesData, setPropertiesData] = useState(null)
  const [surveyData, setSurveyData] = useState(null)
  
  // Opinion mode state
  const [opinionSource, setOpinionSource] = useState('both') // 'formal', 'informal', 'both'
  
  // Amenities filters state
  const [amenitiesFilters, setAmenitiesFilters] = useState({
    allowsDogs: false,
    servesBeer: false,
    servesWine: false,
    servesCoffee: false,
    outdoorSeating: false,
    liveMusic: false
  })
  
  // Categories filters state
  const [categoriesFilters, setCategoriesFilters] = useState({
    restaurant: false,
    cafe: false,
    art_gallery: false,
    bar: false,
    store: false,
    lodging: false
  })
  
  // Walkability dashboard state
  const [walkabilityMode, setWalkabilityMode] = useState('pedestrian') // 'pedestrian', 'cycling', 'network'
  const [networkMetric, setNetworkMetric] = useState('betweenness_800') // betweenness metric to display
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
        
        // Process properties data to calculate transfer_count and total_value
        const processedProperties = {
          ...properties,
          features: properties.features.map(feature => {
            const transactions = feature.properties.properties || []
            
            // Count transactions with valid sale prices
            const transfer_count = transactions.filter(t => {
              const price = t.sale_price
              return price && price !== 'DONATION' && price !== 'CRST' && price.startsWith('R')
            }).length
            
            // Calculate total value by parsing sale_price strings like "R 1 000 000"
            const total_value = transactions.reduce((sum, t) => {
              const price = t.sale_price
              if (price && price !== 'DONATION' && price !== 'CRST' && price.startsWith('R')) {
                // Remove "R " and all spaces, then parse to number
                const numericValue = parseFloat(price.replace('R ', '').replace(/\s/g, ''))
                return sum + (isNaN(numericValue) ? 0 : numericValue)
              }
              return sum
            }, 0)
            
            return {
              ...feature,
              properties: {
                ...feature.properties,
                transfer_count,
                total_value
              }
            }
          })
        }
        
        console.log('Business data loaded:', {
          businesses: businesses.features?.length,
          stalls: stalls.features?.length,
          properties: properties.features?.length,
          survey: survey.features?.length
        })
        
        console.log('Sample processed property:', processedProperties.features[0]?.properties)
        
        setBusinessesData(businesses)
        setStreetStallsData(stalls)
        setPropertiesData(processedProperties)
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
        // Load network data from shade dataset (has betweenness centrality)
        const shadeFile = '/data/shade/winter/2025-06-21_0800.geojson'
        
        const [network, pedestrian, cycling] = await Promise.all([
          fetch(shadeFile).then(r => r.json()),
          fetch('/data/walkabilty/processed/pedestrian_month_all.geojson').then(r => r.json()),
          fetch('/data/walkabilty/processed/cycling_month_all.geojson').then(r => r.json())
        ])
        
        console.log('Walkability data loaded:', {
          network: network.features?.length,
          pedestrian: pedestrian.features?.length,
          cycling: cycling.features?.length
        })
        
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
              businessMode={businessMode}
              onModeChange={setBusinessMode}
              dayOfWeek={dayOfWeek}
              hour={hour}
              onDayChange={setDayOfWeek}
              onHourChange={setHour}
              businessesData={businessesData}
              streetStallsData={streetStallsData}
              propertiesData={propertiesData}
              surveyData={surveyData}
              opinionSource={opinionSource}
              onOpinionSourceChange={setOpinionSource}
              amenitiesFilters={amenitiesFilters}
              onAmenitiesFiltersChange={setAmenitiesFilters}
              categoriesFilters={categoriesFilters}
              onCategoriesFiltersChange={setCategoriesFilters}
            />
          )}
          
          {dashboardMode === 'walkability' && (
            <WalkabilityAnalytics
              walkabilityMode={walkabilityMode}
              onWalkabilityModeChange={setWalkabilityMode}
              networkMetric={networkMetric}
              onNetworkMetricChange={setNetworkMetric}
              pedestrianData={pedestrianData}
              cyclingData={cyclingData}
              networkData={networkData}
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
            walkabilityMode={walkabilityMode}
            networkMetric={networkMetric}
            dayOfWeek={dayOfWeek}
            hour={hour}
            businessesData={businessesData}
            streetStallsData={streetStallsData}
            surveyData={surveyData}
            propertiesData={propertiesData}
            networkData={networkData}
            pedestrianData={pedestrianData}
            cyclingData={cyclingData}
            lightingSegments={lightingSegments}
            lightingProjects={lightingProjects}
            visibleLayers={visibleLayers}
            onMapLoad={setMap}
            opinionSource={opinionSource}
            amenitiesFilters={amenitiesFilters}
            categoriesFilters={categoriesFilters}
          />
        </main>
      </div>
    </div>
  )
}

export default UnifiedDataExplorer
