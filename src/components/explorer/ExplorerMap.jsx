import React, { useEffect, useRef, useState } from 'react'
import Map, { Source, Layer, Popup } from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { isBusinessOpen } from '../../utils/timeUtils'
import './ExplorerMap.css'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || ''

const ExplorerMap = ({
  dashboardMode,
  businessMode,
  walkabilityMode,
  networkMetric,
  dayOfWeek,
  hour,
  businessesData,
  streetStallsData,
  surveyData,
  propertiesData,
  networkData,
  pedestrianData,
  cyclingData,
  lightingSegments,
  lightingProjects,
  visibleLayers,
  onMapLoad,
  opinionSource,
  amenitiesFilters,
  categoriesFilters
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
          'businesses-points-layer',
          'businesses-ratings-layer',
          'businesses-amenities-layer',
          'businesses-categories-layer',
          'survey-opinions-layer',
          'stalls-opinions-layer',
          'properties-sales-layer',
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
            {/* Business Liveliness - Heatmap */}
            {businessMode === 'liveliness' && filteredBusinesses && (
              <Source
                id="businesses-heatmap"
                type="geojson"
                data={filteredBusinesses}
              >
                <Layer
                  id="businesses-heatmap-layer"
                  type="heatmap"
                  paint={{
                    'heatmap-weight': 1,
                    'heatmap-intensity': [
                      'interpolate',
                      ['linear'],
                      ['zoom'],
                      0, 1,
                      15, 3
                    ],
                    'heatmap-color': [
                      'interpolate',
                      ['linear'],
                      ['heatmap-density'],
                      0, 'rgba(33, 102, 172, 0)',
                      0.2, 'rgb(103, 169, 207)',
                      0.4, 'rgb(209, 229, 240)',
                      0.6, 'rgb(253, 219, 199)',
                      0.8, 'rgb(239, 138, 98)',
                      1, 'rgb(178, 24, 43)'
                    ],
                    'heatmap-radius': [
                      'interpolate',
                      ['linear'],
                      ['zoom'],
                      0, 2,
                      15, 20
                    ],
                    'heatmap-opacity': 0.8
                  }}
                />
                {/* Points layer for clicking */}
                <Layer
                  id="businesses-points-layer"
                  type="circle"
                  minzoom={14}
                  paint={{
                    'circle-radius': 3,
                    'circle-color': '#000000',
                    'circle-opacity': 0.5,
                    'circle-stroke-width': 1,
                    'circle-stroke-color': '#ffffff'
                  }}
                />
              </Source>
            )}
            
            {/* Vendor Opinions - Consented vendors only */}
            {businessMode === 'opinions' && (
              <>
                {(opinionSource === 'formal' || opinionSource === 'both') && surveyData && (() => {
                  const consentedSurvey = {
                    type: 'FeatureCollection',
                    features: surveyData.features.filter(f => f.properties.stake_consent === 1 || f.properties.stake_consent === '1')
                  }
                  return consentedSurvey.features.length > 0 && (
                    <Source
                      id="survey-opinions"
                      type="geojson"
                      data={consentedSurvey}
                    >
                      <Layer
                        id="survey-opinions-layer"
                        type="circle"
                        paint={{
                          'circle-radius': 8,
                          'circle-color': [
                            'case',
                            ['==', ['get', 'stake_challenges/crime'], '1.0'], '#ef4444', // Crime - Red
                            ['==', ['get', 'stake_challenges/crime'], 1], '#ef4444',
                            ['==', ['get', 'stake_challenges/competition'], '1.0'], '#f97316', // Competition - Orange
                            ['==', ['get', 'stake_challenges/competition'], 1], '#f97316',
                            ['==', ['get', 'stake_challenges/rent'], '1.0'], '#8b5cf6', // Rent - Purple
                            ['==', ['get', 'stake_challenges/rent'], 1], '#8b5cf6',
                            ['==', ['get', 'stake_challenges/low_customers'], '1.0'], '#eab308', // Low Customers - Yellow
                            ['==', ['get', 'stake_challenges/low_customers'], 1], '#eab308',
                            ['==', ['get', 'stake_challenges/litter'], '1.0'], '#22c55e', // Litter - Green
                            ['==', ['get', 'stake_challenges/litter'], 1], '#22c55e',
                            ['==', ['get', 'stake_challenges/permits'], '1.0'], '#ec4899', // Permits - Pink
                            ['==', ['get', 'stake_challenges/permits'], 1], '#ec4899',
                            ['==', ['get', 'stake_challenges/other'], '1.0'], '#6b7280', // Other - Gray
                            ['==', ['get', 'stake_challenges/other'], 1], '#6b7280',
                            '#3b82f6' // Default - Blue (infrastructure/parking)
                          ],
                          'circle-opacity': 0.8,
                          'circle-stroke-width': 2,
                          'circle-stroke-color': '#ffffff'
                        }}
                      />
                    </Source>
                  )
                })()}
                
                {(opinionSource === 'informal' || opinionSource === 'both') && streetStallsData && (() => {
                  const consentedStalls = {
                    type: 'FeatureCollection',
                    features: streetStallsData.features.filter(f => f.properties.stake_consent === 'yes')
                  }
                  return consentedStalls.features.length > 0 && (
                    <Source
                      id="stalls-opinions"
                      type="geojson"
                      data={consentedStalls}
                    >
                      <Layer
                        id="stalls-opinions-layer"
                        type="circle"
                        paint={{
                          'circle-radius': 8,
                          'circle-color': [
                            'case',
                            ['==', ['get', 'stake_challenges/crime'], '1.0'], '#ef4444', // Crime - Red
                            ['==', ['get', 'stake_challenges/crime'], 1], '#ef4444',
                            ['==', ['get', 'stake_challenges/competition'], '1.0'], '#f97316', // Competition - Orange
                            ['==', ['get', 'stake_challenges/competition'], 1], '#f97316',
                            ['==', ['get', 'stake_challenges/rent'], '1.0'], '#8b5cf6', // Rent - Purple
                            ['==', ['get', 'stake_challenges/rent'], 1], '#8b5cf6',
                            ['==', ['get', 'stake_challenges/low_customers'], '1.0'], '#eab308', // Low Customers - Yellow
                            ['==', ['get', 'stake_challenges/low_customers'], 1], '#eab308',
                            ['==', ['get', 'stake_challenges/litter'], '1.0'], '#22c55e', // Litter - Green
                            ['==', ['get', 'stake_challenges/litter'], 1], '#22c55e',
                            ['==', ['get', 'stake_challenges/permits'], '1.0'], '#ec4899', // Permits - Pink
                            ['==', ['get', 'stake_challenges/permits'], 1], '#ec4899',
                            ['==', ['get', 'stake_challenges/other'], '1.0'], '#6b7280', // Other - Gray
                            ['==', ['get', 'stake_challenges/other'], 1], '#6b7280',
                            '#3b82f6' // Default - Blue (infrastructure/parking)
                          ],
                          'circle-opacity': 0.8,
                          'circle-stroke-width': 2,
                          'circle-stroke-color': '#ffffff'
                        }}
                      />
                    </Source>
                  )
                })()}
              </>
            )}
            
            {/* Review Ratings - Bubble chart */}
            {businessMode === 'ratings' && businessesData && (
              <Source
                id="businesses-ratings"
                type="geojson"
                data={businessesData}
              >
                <Layer
                  id="businesses-ratings-layer"
                  type="circle"
                  paint={{
                    'circle-radius': [
                      'interpolate',
                      ['linear'],
                      ['coalesce', ['get', 'userRatingCount'], 0],
                      0, 4,
                      10, 8,
                      50, 12,
                      100, 16,
                      500, 24
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
                        3.5, '#84cc16',
                        4.5, '#22c55e',
                        5, '#16a34a'
                      ],
                      '#6b7280'
                    ],
                    'circle-opacity': 0.7,
                    'circle-stroke-width': 2,
                    'circle-stroke-color': '#ffffff'
                  }}
                />
              </Source>
            )}
            
            {/* Amenities Mode */}
            {businessMode === 'amenities' && businessesData && (() => {
              // Filter businesses based on selected amenities
              const hasActiveFilters = Object.values(amenitiesFilters || {}).some(v => v)
              const filtered = hasActiveFilters ? {
                type: 'FeatureCollection',
                features: businessesData.features.filter(f => {
                  const props = f.properties
                  if (amenitiesFilters.allowsDogs && !props.allowsDogs) return false
                  if (amenitiesFilters.servesBeer && !props.servesBeer && !props.servesWine) return false
                  if (amenitiesFilters.servesCoffee && !props.servesCoffee) return false
                  if (amenitiesFilters.outdoorSeating && !props.outdoorSeating) return false
                  if (amenitiesFilters.liveMusic && !props.liveMusic) return false
                  return true
                })
              } : businessesData
              
              return (
                <Source
                  id="businesses-amenities"
                  type="geojson"
                  data={filtered}
                >
                  <Layer
                    id="businesses-amenities-layer"
                    type="circle"
                    paint={{
                      'circle-radius': 6,
                      'circle-color': '#4caf50',
                      'circle-opacity': 0.8,
                      'circle-stroke-width': 1,
                      'circle-stroke-color': '#ffffff'
                    }}
                  />
                </Source>
              )
            })()}
            
            {/* Categories Mode */}
            {businessMode === 'categories' && businessesData && (() => {
              // Filter businesses based on selected categories
              const hasActiveFilters = Object.values(categoriesFilters || {}).some(v => v)
              const filtered = hasActiveFilters ? {
                type: 'FeatureCollection',
                features: businessesData.features.filter(f => {
                  const primaryType = f.properties.primaryType || ''
                  if (categoriesFilters.restaurant && primaryType.includes('restaurant')) return true
                  if (categoriesFilters.cafe && primaryType.includes('cafe')) return true
                  if (categoriesFilters.art_gallery && primaryType.includes('art_gallery')) return true
                  if (categoriesFilters.bar && (primaryType.includes('bar') || primaryType.includes('night_club'))) return true
                  if (categoriesFilters.store && (primaryType.includes('store') || primaryType.includes('shop'))) return true
                  if (categoriesFilters.lodging && primaryType.includes('lodging')) return true
                  return !hasActiveFilters
                })
              } : businessesData
              
              return (
                <Source
                  id="businesses-categories"
                  type="geojson"
                  data={filtered}
                >
                  <Layer
                    id="businesses-categories-layer"
                    type="circle"
                    paint={{
                      'circle-radius': 6,
                      'circle-color': [
                        'match',
                        ['get', 'primaryType'],
                        'restaurant', '#ef4444',
                        'cafe', '#f59e0b',
                        'bar', '#8b5cf6',
                        'art_gallery', '#ec4899',
                        'store', '#3b82f6',
                        'lodging', '#14b8a6',
                        '#4caf50'
                      ],
                      'circle-opacity': 0.8,
                      'circle-stroke-width': 1,
                      'circle-stroke-color': '#ffffff'
                    }}
                  />
                </Source>
              )
            })()}
            
            {/* Property Sales - Bubble chart */}
            {businessMode === 'property' && propertiesData && (
              <Source
                id="properties-sales"
                type="geojson"
                data={propertiesData}
              >
                <Layer
                  id="properties-sales-layer"
                  type="circle"
                  paint={{
                    'circle-radius': [
                      'interpolate',
                      ['linear'],
                      ['coalesce', ['get', 'transfer_count'], 1],
                      1, 8,
                      3, 14,
                      5, 20,
                      10, 28,
                      15, 36,
                      20, 44
                    ],
                    'circle-color': [
                      'interpolate',
                      ['linear'],
                      ['coalesce', ['get', 'total_value'], 0],
                      0, '#dbeafe',
                      1000000, '#93c5fd',
                      5000000, '#60a5fa',
                      10000000, '#3b82f6',
                      20000000, '#2563eb',
                      50000000, '#1d4ed8',
                      100000000, '#1e40af'
                    ],
                    'circle-opacity': 0.75,
                    'circle-stroke-width': 2,
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
            {/* Pedestrian Routes */}
            {walkabilityMode === 'pedestrian' && pedestrianData && (
              <Source
                id="pedestrian-routes"
                type="geojson"
                data={pedestrianData}
              >
                <Layer
                  id="pedestrian-routes-layer"
                  type="line"
                  paint={{
                    'line-color': [
                      'interpolate',
                      ['linear'],
                      ['coalesce', ['get', 'total_trip_count'], 0],
                      0, '#dbeafe',
                      50, '#93c5fd',
                      100, '#60a5fa',
                      200, '#3b82f6',
                      400, '#2563eb',
                      800, '#1d4ed8',
                      1500, '#1e40af'
                    ],
                    'line-width': [
                      'interpolate',
                      ['linear'],
                      ['zoom'],
                      13, 2,
                      16, 4,
                      18, 6
                    ],
                    'line-opacity': 0.8
                  }}
                />
              </Source>
            )}
            
            {/* Cycling Routes */}
            {walkabilityMode === 'cycling' && cyclingData && (
              <Source
                id="cycling-routes"
                type="geojson"
                data={cyclingData}
              >
                <Layer
                  id="cycling-routes-layer"
                  type="line"
                  paint={{
                    'line-color': [
                      'interpolate',
                      ['linear'],
                      ['coalesce', ['get', 'total_trip_count'], 0],
                      0, '#d1fae5',
                      50, '#6ee7b7',
                      100, '#34d399',
                      200, '#10b981',
                      400, '#059669',
                      800, '#047857',
                      1500, '#065f46'
                    ],
                    'line-width': [
                      'interpolate',
                      ['linear'],
                      ['zoom'],
                      13, 2,
                      16, 4,
                      18, 6
                    ],
                    'line-opacity': 0.8
                  }}
                />
              </Source>
            )}
            
            {/* Network Analysis - Betweenness Centrality */}
            {walkabilityMode === 'network' && networkData && (() => {
              // Get field name based on selected metric
              const metricConfig = {
                betweenness_400: { field: 'cc_betweenness_400', scale: [0, 20, 50, 100, 200, 500, 1000] },
                betweenness_800: { field: 'cc_betweenness_800', scale: [0, 100, 500, 1000, 2000, 5000, 10000] },
                betweenness_beta_400: { field: 'cc_betweenness_beta_400', scale: [0, 1, 2, 5, 10, 20, 50] },
                betweenness_beta_800: { field: 'cc_betweenness_beta_800', scale: [0, 10, 20, 50, 100, 200, 500] },
                harmonic_400: { field: 'cc_harmonic_400', scale: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6] },
                harmonic_800: { field: 'cc_harmonic_800', scale: [0, 0.2, 0.4, 0.6, 0.8, 1.0, 1.2] }
              }
              
              const config = metricConfig[networkMetric] || metricConfig.betweenness_800
              
              return (
                <Source
                  id="network-betweenness"
                  type="geojson"
                  data={networkData}
                >
                  <Layer
                    id="network-betweenness-layer"
                    type="line"
                    paint={{
                      'line-color': [
                        'interpolate',
                        ['linear'],
                        ['coalesce', ['get', config.field], 0],
                        config.scale[0], '#fef3c7',
                        config.scale[1], '#fde047',
                        config.scale[2], '#facc15',
                        config.scale[3], '#eab308',
                        config.scale[4], '#ca8a04',
                        config.scale[5], '#a16207',
                        config.scale[6], '#854d0e'
                      ],
                      'line-width': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        13, 2,
                        16, 4,
                        18, 6
                      ],
                      'line-opacity': 0.8
                    }}
                  />
                </Source>
              )
            })()}
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
              {dashboardMode === 'business' && (
                <>
                  {/* Business Liveliness Mode */}
                  {businessMode === 'liveliness' && (
                    <>
                      <h3>{popupInfo.feature.properties.displayName?.text || popupInfo.feature.properties.name || 'Business'}</h3>
                      {popupInfo.feature.properties.primaryType && (
                        <p><strong>Type:</strong> {popupInfo.feature.properties.primaryType.replace(/_/g, ' ')}</p>
                      )}
                      {popupInfo.feature.properties.regularOpeningHours?.weekdayDescriptions && (
                        <div style={{ marginTop: '0.5rem' }}>
                          <strong>Opening Hours:</strong>
                          <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                            {popupInfo.feature.properties.regularOpeningHours.weekdayDescriptions.map((desc, i) => (
                              <div key={i}>{desc}</div>
                            ))}
                          </div>
                        </div>
                      )}
                      {popupInfo.feature.properties.currentlyOpen !== undefined && (
                        <p style={{ marginTop: '0.5rem', color: popupInfo.feature.properties.currentlyOpen ? '#4caf50' : '#ef4444' }}>
                          <strong>{popupInfo.feature.properties.currentlyOpen ? '🟢 Open Now' : '🔴 Closed'}</strong>
                        </p>
                      )}
                    </>
                  )}
                  
                  {/* Vendor Opinions Mode */}
                  {businessMode === 'opinions' && (
                    <>
                      <h3>{popupInfo.feature.properties.displayName?.text || popupInfo.feature.properties.business_name || 'Vendor'}</h3>
                      {popupInfo.feature.properties.stake_big_change && (
                        <p><strong>Main Challenge:</strong> {popupInfo.feature.properties.stake_big_change}</p>
                      )}
                      {popupInfo.feature.properties.stake_consent === 'yes' && (
                        <p style={{ fontSize: '0.75rem', color: '#4caf50' }}>✓ Consented to interview</p>
                      )}
                    </>
                  )}
                  
                  {/* Review Ratings Mode */}
                  {businessMode === 'ratings' && (
                    <>
                      <h3>{popupInfo.feature.properties.displayName?.text || 'Business'}</h3>
                      {popupInfo.feature.properties.rating && (
                        <p><strong>Rating:</strong> {popupInfo.feature.properties.rating} ⭐</p>
                      )}
                      {popupInfo.feature.properties.userRatingCount && (
                        <p><strong>Reviews:</strong> {popupInfo.feature.properties.userRatingCount}</p>
                      )}
                      {popupInfo.feature.properties.primaryType && (
                        <p><strong>Type:</strong> {popupInfo.feature.properties.primaryType.replace(/_/g, ' ')}</p>
                      )}
                    </>
                  )}
                  
                  {/* Amenities Mode */}
                  {businessMode === 'amenities' && (
                    <>
                      <h3>{popupInfo.feature.properties.displayName?.text || 'Business'}</h3>
                      <div style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>
                        {popupInfo.feature.properties.allowsDogs && <p>🐕 Dog Friendly</p>}
                        {popupInfo.feature.properties.servesBeer && <p>🍺 Serves Beer</p>}
                        {popupInfo.feature.properties.servesWine && <p>🍷 Serves Wine</p>}
                        {popupInfo.feature.properties.servesCoffee && <p>☕ Serves Coffee</p>}
                        {popupInfo.feature.properties.outdoorSeating && <p>🌳 Outdoor Seating</p>}
                        {popupInfo.feature.properties.liveMusic && <p>🎵 Live Music</p>}
                      </div>
                    </>
                  )}
                  
                  {/* Categories Mode */}
                  {businessMode === 'categories' && (
                    <>
                      <h3>{popupInfo.feature.properties.displayName?.text || 'Business'}</h3>
                      {popupInfo.feature.properties.primaryType && (
                        <p><strong>Category:</strong> {popupInfo.feature.properties.primaryType.replace(/_/g, ' ')}</p>
                      )}
                      {popupInfo.feature.properties.rating && (
                        <p><strong>Rating:</strong> {popupInfo.feature.properties.rating} ⭐</p>
                      )}
                    </>
                  )}
                  
                  {/* Property Sales Mode */}
                  {businessMode === 'property' && (
                    <>
                      <h3>Property Sale</h3>
                      {popupInfo.feature.properties.address && (
                        <p><strong>Address:</strong> {popupInfo.feature.properties.address}</p>
                      )}
                      {popupInfo.feature.properties.property_category && (
                        <p><strong>Category:</strong> {popupInfo.feature.properties.property_category}</p>
                      )}
                      {popupInfo.feature.properties.transfer_count && (
                        <p><strong>Number of Transfers:</strong> {popupInfo.feature.properties.transfer_count}</p>
                      )}
                      {popupInfo.feature.properties.total_value && (
                        <p><strong>Total Value:</strong> R{(popupInfo.feature.properties.total_value / 1000000).toFixed(2)}M</p>
                      )}
                      {popupInfo.feature.properties.avg_price && (
                        <p><strong>Average Price:</strong> R{(popupInfo.feature.properties.avg_price / 1000000).toFixed(2)}M</p>
                      )}
                      {popupInfo.feature.properties.property_type && (
                        <p><strong>Type:</strong> {popupInfo.feature.properties.property_type}</p>
                      )}
                    </>
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
