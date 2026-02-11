import React, { useEffect, useRef, useState } from 'react'
import Map, { Source, Layer, Popup } from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { isBusinessOpen } from '../../utils/timeUtils'
import './ExplorerMap.css'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || ''

const ExplorerMap = ({
  dashboardMode,
  businessMode,
  activityType,
  dayOfWeek,
  hour,
  businessesData,
  streetStallsData,
  propertiesData,
  networkData,
  pedestrianData,
  cyclingData,
  lightingSegments,
  lightingProjects,
  visibleLayers,
  onMapLoad
}) => {
  const mapRef = useRef()
  const [viewState, setViewState] = useState({
    longitude: 18.4241,
    latitude: -33.9249,
    zoom: 14,
    pitch: 0,
    bearing: 0
  })
  
  const [selectedFeature, setSelectedFeature] = useState(null)
  const [popupInfo, setPopupInfo] = useState(null)
  
  // Debug logging
  useEffect(() => {
    console.log('ExplorerMap render:', {
      dashboardMode,
      businessMode,
      hasBusinessesData: !!businessesData,
      businessCount: businessesData?.features?.length,
      visibleLayers
    })
  }, [dashboardMode, businessMode, businessesData, visibleLayers])
  
  // Filter businesses by open status
  const filteredBusinesses = businessesData?.features
    ? {
        type: 'FeatureCollection',
        features: businessesData.features.filter(f => 
          isBusinessOpen(f, dayOfWeek, hour)
        )
      }
    : null
  
  // Handle map click
  const handleMapClick = (event) => {
    const feature = event.features?.[0]
    if (feature) {
      setSelectedFeature(feature)
      setPopupInfo({
        longitude: event.lngLat.lng,
        latitude: event.lngLat.lat,
        feature: feature
      })
    }
  }
  
  useEffect(() => {
    if (mapRef.current && onMapLoad) {
      onMapLoad(mapRef.current)
    }
  }, [mapRef.current, onMapLoad])
  
  return (
    <div className="explorer-map">
      <Map
        ref={mapRef}
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle="mapbox://styles/mapbox/dark-v10"
        interactiveLayerIds={[
          'businesses-layer',
          'street-stalls-layer',
          'network-layer',
          'pedestrian-layer',
          'cycling-layer',
          'lighting-segments-layer'
        ]}
        onClick={handleMapClick}
      >
        {/* Business Dashboard Layers */}
        {dashboardMode === 'business' && (
          <>
            {/* Businesses Layer */}
            {visibleLayers.businesses && filteredBusinesses && (
              <Source
                id="businesses"
                type="geojson"
                data={filteredBusinesses}
              >
                <Layer
                  id="businesses-layer"
                  type="circle"
                  paint={{
                    'circle-radius': [
                      'interpolate',
                      ['linear'],
                      ['zoom'],
                      12, 4,
                      16, 8
                    ],
                    'circle-color': [
                      'case',
                      ['!=', ['get', 'rating'], null],
                      [
                        'interpolate',
                        ['linear'],
                        ['to-number', ['get', 'rating'], 0],
                        0, '#ef4444',
                        2.5, '#f59e0b',
                        4, '#84cc16',
                        5, '#22c55e'
                      ],
                      '#4caf50'
                    ],
                    'circle-opacity': 0.8,
                    'circle-stroke-width': 1,
                    'circle-stroke-color': '#ffffff'
                  }}
                />
              </Source>
            )}
            
            {/* Street Stalls Layer */}
            {visibleLayers.streetStalls && streetStallsData && (
              <Source
                id="street-stalls"
                type="geojson"
                data={streetStallsData}
              >
                <Layer
                  id="street-stalls-layer"
                  type="circle"
                  paint={{
                    'circle-radius': 6,
                    'circle-color': '#f59e0b',
                    'circle-opacity': 0.8,
                    'circle-stroke-width': 2,
                    'circle-stroke-color': '#ffffff'
                  }}
                />
              </Source>
            )}
            
            {/* Properties Layer */}
            {visibleLayers.properties && propertiesData && (
              <Source
                id="properties"
                type="geojson"
                data={propertiesData}
              >
                <Layer
                  id="properties-layer"
                  type="circle"
                  paint={{
                    'circle-radius': [
                      'interpolate',
                      ['linear'],
                      ['get', 'sale_price'],
                      0, 4,
                      10000000, 12
                    ],
                    'circle-color': '#8b5cf6',
                    'circle-opacity': 0.6,
                    'circle-stroke-width': 1,
                    'circle-stroke-color': '#ffffff'
                  }}
                />
              </Source>
            )}
          </>
        )}
        
        {/* Walkability Dashboard Layers */}
        {dashboardMode === 'walkability' && (
          <>
            {/* Network Connectivity Layer */}
            {visibleLayers.network && networkData && (
              <Source
                id="network"
                type="geojson"
                data={networkData}
              >
                <Layer
                  id="network-layer"
                  type="line"
                  paint={{
                    'line-color': [
                      'interpolate',
                      ['linear'],
                      ['coalesce', ['get', 'hillier_integration_400'], ['get', 'cc_hillier_400'], 0],
                      0, '#fee5d9',
                      50, '#fcae91',
                      100, '#fb6a4a',
                      150, '#de2d26',
                      200, '#a50f15'
                    ],
                    'line-width': 2,
                    'line-opacity': 0.6
                  }}
                />
              </Source>
            )}
            
            {/* Pedestrian Activity Layer */}
            {visibleLayers.pedestrianActivity && activityType === 'pedestrian' && pedestrianData && (
              <Source
                id="pedestrian"
                type="geojson"
                data={pedestrianData}
              >
                <Layer
                  id="pedestrian-layer"
                  type="line"
                  paint={{
                    'line-color': [
                      'interpolate',
                      ['linear'],
                      ['get', 'total_count'],
                      0, '#fee5d9',
                      50, '#fcae91',
                      100, '#fb6a4a',
                      200, '#de2d26',
                      300, '#a50f15'
                    ],
                    'line-width': [
                      'interpolate',
                      ['linear'],
                      ['get', 'total_count'],
                      0, 1,
                      100, 3,
                      300, 6
                    ],
                    'line-opacity': 0.8
                  }}
                />
              </Source>
            )}
            
            {/* Cycling Activity Layer */}
            {visibleLayers.cyclingActivity && activityType === 'cycling' && cyclingData && (
              <Source
                id="cycling"
                type="geojson"
                data={cyclingData}
              >
                <Layer
                  id="cycling-layer"
                  type="line"
                  paint={{
                    'line-color': [
                      'interpolate',
                      ['linear'],
                      ['get', 'total_count'],
                      0, '#dbeafe',
                      20, '#93c5fd',
                      50, '#3b82f6',
                      100, '#1d4ed8',
                      150, '#1e3a8a'
                    ],
                    'line-width': [
                      'interpolate',
                      ['linear'],
                      ['get', 'total_count'],
                      0, 1,
                      50, 3,
                      150, 6
                    ],
                    'line-opacity': 0.8
                  }}
                />
              </Source>
            )}
          </>
        )}
        
        {/* Lighting Dashboard Layers */}
        {dashboardMode === 'lighting' && (
          <>
            {/* Lighting Segments Layer */}
            {visibleLayers.lightingSegments && lightingSegments && (
              <Source
                id="lighting-segments"
                type="geojson"
                data={lightingSegments}
              >
                <Layer
                  id="lighting-segments-layer"
                  type="line"
                  paint={{
                    'line-color': [
                      'case',
                      ['==', ['get', 'mean_lux'], null],
                      '#4b5563',
                      [
                        'step',
                        ['get', 'mean_lux'],
                        '#991b1b',  // Dark: 0-10 lux
                        10, '#dc2626',  // Low: 10-30 lux
                        30, '#f59e0b',  // Moderate: 30-75 lux
                        75, '#10b981',  // Well Lit: 75-120 lux
                        120, '#3b82f6'  // Excellent: 120+ lux
                      ]
                    ],
                    'line-width': 5,
                    'line-opacity': 0.9
                  }}
                />
              </Source>
            )}
            
            {/* Lighting Projects Layer */}
            {visibleLayers.lightingProjects && lightingProjects && (
              <Source
                id="lighting-projects"
                type="geojson"
                data={lightingProjects}
              >
                <Layer
                  id="lighting-projects-layer"
                  type="circle"
                  paint={{
                    'circle-radius': 6,
                    'circle-color': '#fbbf24',
                    'circle-opacity': 0.8,
                    'circle-stroke-width': 2,
                    'circle-stroke-color': '#ffffff'
                  }}
                />
              </Source>
            )}
          </>
        )}
        
        {/* Popup */}
        {popupInfo && (
          <Popup
            longitude={popupInfo.longitude}
            latitude={popupInfo.latitude}
            anchor="bottom"
            onClose={() => setPopupInfo(null)}
            closeButton={true}
            closeOnClick={false}
          >
            <div className="map-popup">
              {dashboardMode === 'business' && popupInfo.feature.properties.name && (
                <>
                  <h3>{popupInfo.feature.properties.name}</h3>
                  {popupInfo.feature.properties.rating && (
                    <p><strong>Rating:</strong> {popupInfo.feature.properties.rating} ⭐</p>
                  )}
                  {popupInfo.feature.properties.primaryType && (
                    <p><strong>Type:</strong> {popupInfo.feature.properties.primaryType}</p>
                  )}
                </>
              )}
              
              {dashboardMode === 'walkability' && (
                <>
                  <h3>Street Segment</h3>
                  {popupInfo.feature.properties.total_count && (
                    <p><strong>Total Trips:</strong> {popupInfo.feature.properties.total_count}</p>
                  )}
                  {popupInfo.feature.properties.hillier_integration_400 && (
                    <p><strong>Integration:</strong> {popupInfo.feature.properties.hillier_integration_400.toFixed(2)}</p>
                  )}
                </>
              )}
              
              {dashboardMode === 'lighting' && (
                <>
                  <h3>{popupInfo.feature.properties.name || 'Street Segment'}</h3>
                  {popupInfo.feature.properties.mean_lux !== null && (
                    <>
                      <p><strong>Mean Lux:</strong> {popupInfo.feature.properties.mean_lux.toFixed(2)}</p>
                      <p><strong>Min Lux:</strong> {popupInfo.feature.properties.min_lux?.toFixed(2)}</p>
                      <p><strong>Max Lux:</strong> {popupInfo.feature.properties.max_lux?.toFixed(2)}</p>
                    </>
                  )}
                </>
              )}
            </div>
          </Popup>
        )}
      </Map>
    </div>
  )
}

export default ExplorerMap
