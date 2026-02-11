import React, { useState, useEffect } from 'react'
import './WalkabilityAnalytics.css'

const NETWORK_METRICS = [
  { id: 'betweenness_400', label: 'Betweenness 400m', field: 'cc_betweenness_400' },
  { id: 'betweenness_800', label: 'Betweenness 800m', field: 'cc_betweenness_800' },
  { id: 'betweenness_beta_400', label: 'Beta Betweenness 400m', field: 'cc_betweenness_beta_400' },
  { id: 'betweenness_beta_800', label: 'Beta Betweenness 800m', field: 'cc_betweenness_beta_800' },
  { id: 'harmonic_400', label: 'Closeness 400m', field: 'cc_harmonic_400' },
  { id: 'harmonic_800', label: 'Closeness 800m', field: 'cc_harmonic_800' }
]

const WalkabilityAnalytics = ({
  walkabilityMode,
  onWalkabilityModeChange,
  networkMetric,
  onNetworkMetricChange,
  pedestrianData,
  cyclingData,
  networkData
}) => {
  const [stats, setStats] = useState(null)
  
  // Calculate statistics based on current mode
  useEffect(() => {
    if (walkabilityMode === 'pedestrian' && pedestrianData?.features) {
      const features = pedestrianData.features
      const tripCounts = features.map(f => f.properties.total_trip_count || 0)
      const total = tripCounts.reduce((sum, v) => sum + v, 0)
      const validTrips = tripCounts.filter(v => v > 0)
      
      setStats({
        totalSegments: features.length,
        totalTrips: total.toLocaleString(),
        avgTripsPerSegment: features.length > 0 ? Math.round(total / features.length) : 0,
        maxTrips: tripCounts.length > 0 ? Math.max(...tripCounts) : 0,
        minTrips: validTrips.length > 0 ? Math.min(...validTrips) : 0
      })
    } else if (walkabilityMode === 'cycling' && cyclingData?.features) {
      const features = cyclingData.features
      const tripCounts = features.map(f => f.properties.total_trip_count || 0)
      const total = tripCounts.reduce((sum, v) => sum + v, 0)
      const validTrips = tripCounts.filter(v => v > 0)
      
      setStats({
        totalSegments: features.length,
        totalTrips: total.toLocaleString(),
        avgTripsPerSegment: features.length > 0 ? Math.round(total / features.length) : 0,
        maxTrips: tripCounts.length > 0 ? Math.max(...tripCounts) : 0,
        minTrips: validTrips.length > 0 ? Math.min(...validTrips) : 0
      })
    } else if (walkabilityMode === 'network' && networkData?.features) {
      const features = networkData.features
      const currentMetric = NETWORK_METRICS.find(m => m.id === networkMetric)
      const fieldName = currentMetric?.field || 'cc_betweenness_800'
      
      const values = features.map(f => f.properties[fieldName] || 0)
      
      const isHarmonic = fieldName.includes('harmonic')
      
      setStats({
        totalSegments: features.length,
        metricName: currentMetric?.label || 'Betweenness 800m',
        avgValue: isHarmonic 
          ? (values.reduce((sum, v) => sum + v, 0) / features.length).toFixed(3)
          : Math.round(values.reduce((sum, v) => sum + v, 0) / features.length),
        maxValue: isHarmonic
          ? Math.max(...values).toFixed(3)
          : Math.round(Math.max(...values)),
        minValue: isHarmonic
          ? Math.min(...values.filter(v => v > 0)).toFixed(3)
          : Math.round(Math.min(...values.filter(v => v > 0)))
      })
    }
  }, [walkabilityMode, pedestrianData, cyclingData, networkData, networkMetric])
  
  return (
    <div className="walkability-analytics">
      <div className="analytics-header">
        <h2>Walkability & Cycling</h2>
        <p className="header-subtitle">Street network usage patterns</p>
      </div>
      
      {/* Mode Selector */}
      <div className="mode-selector">
        <label className="mode-radio">
          <input
            type="radio"
            name="walkability-mode"
            value="pedestrian"
            checked={walkabilityMode === 'pedestrian'}
            onChange={(e) => onWalkabilityModeChange(e.target.value)}
          />
          <span className="radio-label">🚶 Pedestrian Routes</span>
        </label>
        
        <label className="mode-radio">
          <input
            type="radio"
            name="walkability-mode"
            value="cycling"
            checked={walkabilityMode === 'cycling'}
            onChange={(e) => onWalkabilityModeChange(e.target.value)}
          />
          <span className="radio-label">🚴 Cycling Routes</span>
        </label>
        
        <label className="mode-radio">
          <input
            type="radio"
            name="walkability-mode"
            value="network"
            checked={walkabilityMode === 'network'}
            onChange={(e) => onWalkabilityModeChange(e.target.value)}
          />
          <span className="radio-label">🔗 Network Analysis</span>
        </label>
      </div>
      
      {/* Pedestrian Mode */}
      {walkabilityMode === 'pedestrian' && (
        <div className="mode-content">
          <h3>Pedestrian Activity</h3>
          <p className="mode-description">
            Walking routes colored by trip frequency - from low usage (light blue) to high usage (dark blue)
          </p>
          
          {stats && (
            <>
              <div className="stats-summary">
                <div className="stat-item">
                  <span className="stat-value">{stats.totalTrips}</span>
                  <span className="stat-label">Total Trips</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{stats.avgTripsPerSegment ?? 0}</span>
                  <span className="stat-label">Avg/Segment</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{(stats.maxTrips ?? 0).toLocaleString()}</span>
                  <span className="stat-label">Max Trips</span>
                </div>
              </div>
              
              <div className="details-section">
                <div className="detail-row">
                  <span className="detail-label">Total Segments:</span>
                  <span className="detail-value">{stats.totalSegments ?? 0}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Min Trips:</span>
                  <span className="detail-value">{stats.minTrips ?? 0}</span>
                </div>
              </div>
            </>
          )}
          
          {/* Legend */}
          <div className="legend-section">
            <h4>Trip Frequency</h4>
            <div className="color-gradient">
              <div className="gradient-bar pedestrian"></div>
              <div className="gradient-labels">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Cycling Mode */}
      {walkabilityMode === 'cycling' && (
        <div className="mode-content">
          <h3>Cycling Activity</h3>
          <p className="mode-description">
            Cycling routes colored by trip frequency - from low usage (light green) to high usage (dark green)
          </p>
          
          {stats && (
            <>
              <div className="stats-summary">
                <div className="stat-item">
                  <span className="stat-value">{stats.totalTrips}</span>
                  <span className="stat-label">Total Trips</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{stats.avgTripsPerSegment ?? 0}</span>
                  <span className="stat-label">Avg/Segment</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{(stats.maxTrips ?? 0).toLocaleString()}</span>
                  <span className="stat-label">Max Trips</span>
                </div>
              </div>
              
              <div className="details-section">
                <div className="detail-row">
                  <span className="detail-label">Total Segments:</span>
                  <span className="detail-value">{stats.totalSegments ?? 0}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Min Trips:</span>
                  <span className="detail-value">{stats.minTrips ?? 0}</span>
                </div>
              </div>
            </>
          )}
          
          {/* Legend */}
          <div className="legend-section">
            <h4>Trip Frequency</h4>
            <div className="color-gradient">
              <div className="gradient-bar cycling"></div>
              <div className="gradient-labels">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Network Analysis Mode */}
      {walkabilityMode === 'network' && (
        <div className="mode-content">
          <h3>Network Analysis</h3>
          <p className="mode-description">
            Network centrality metrics show how streets connect the urban fabric
          </p>
          
          {/* Metric Selector */}
          <div className="metric-selector">
            <label className="metric-label">Select Metric:</label>
            <select 
              className="metric-dropdown"
              value={networkMetric}
              onChange={(e) => onNetworkMetricChange(e.target.value)}
            >
              {NETWORK_METRICS.map(metric => (
                <option key={metric.id} value={metric.id}>
                  {metric.label}
                </option>
              ))}
            </select>
          </div>
          
          {stats && (
            <>
              <div className="stats-summary">
                <div className="stat-item">
                  <span className="stat-value">{stats.avgValue}</span>
                  <span className="stat-label">Average</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{stats.maxValue}</span>
                  <span className="stat-label">Maximum</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{stats.minValue}</span>
                  <span className="stat-label">Minimum</span>
                </div>
              </div>
              
              <div className="details-section">
                <div className="detail-row">
                  <span className="detail-label">Metric:</span>
                  <span className="detail-value">{stats.metricName}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Total Segments:</span>
                  <span className="detail-value">{stats.totalSegments}</span>
                </div>
              </div>
              
              <div className="info-box">
                {networkMetric.includes('betweenness') && (
                  <>
                    <strong>Betweenness Centrality:</strong> Measures how many shortest paths pass through each street. 
                    High values indicate critical connectors in the network.
                  </>
                )}
                {networkMetric.includes('harmonic') && (
                  <>
                    <strong>Closeness Centrality:</strong> Measures how close each street is to all other streets in the network. 
                    Higher values indicate more central, accessible locations.
                  </>
                )}
              </div>
            </>
          )}
          
          {/* Legend */}
          <div className="legend-section">
            <h4>Betweenness Centrality</h4>
            <div className="color-gradient">
              <div className="gradient-bar network"></div>
              <div className="gradient-labels">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default WalkabilityAnalytics
