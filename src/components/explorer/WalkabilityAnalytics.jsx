import React, { useState, useEffect } from 'react'
import './WalkabilityAnalytics.css'

const WalkabilityAnalytics = ({
  activityType,
  onActivityChange,
  networkData,
  pedestrianData,
  cyclingData,
  visibleLayers,
  onLayerToggle
}) => {
  const [stats, setStats] = useState(null)
  
  // Calculate statistics from current activity data
  useEffect(() => {
    const currentData = activityType === 'pedestrian' ? pedestrianData : cyclingData
    
    if (currentData?.features) {
      const features = currentData.features
      const values = features
        .map(f => f.properties.total_count || 0)
        .filter(v => v > 0)
      
      if (values.length > 0) {
        const total = values.reduce((sum, v) => sum + v, 0)
        const avg = total / values.length
        const max = Math.max(...values)
        const min = Math.min(...values)
        
        setStats({
          totalSegments: features.length,
          activeSegments: values.length,
          totalTrips: total,
          avgTrips: Math.round(avg),
          maxTrips: max,
          minTrips: min
        })
      }
    }
  }, [activityType, pedestrianData, cyclingData])
  
  // Calculate network statistics
  const [networkStats, setNetworkStats] = useState(null)
  
  useEffect(() => {
    if (networkData?.features) {
      const features = networkData.features
      const integrationValues = features
        .map(f => f.properties.hillier_integration_400 || f.properties.cc_hillier_400 || 0)
        .filter(v => v > 0)
      
      if (integrationValues.length > 0) {
        const avg = integrationValues.reduce((sum, v) => sum + v, 0) / integrationValues.length
        const max = Math.max(...integrationValues)
        const min = Math.min(...integrationValues)
        
        setNetworkStats({
          totalSegments: features.length,
          avgIntegration: avg.toFixed(2),
          maxIntegration: max.toFixed(2),
          minIntegration: min.toFixed(2)
        })
      }
    }
  }, [networkData])
  
  return (
    <div className="walkability-analytics">
      {/* Activity Type Selector */}
      <div className="activity-selector">
        <button
          className={`activity-btn ${activityType === 'pedestrian' ? 'active' : ''}`}
          onClick={() => onActivityChange('pedestrian')}
        >
          <span className="activity-icon">🚶</span>
          <span className="activity-label">Pedestrian</span>
        </button>
        
        <button
          className={`activity-btn ${activityType === 'cycling' ? 'active' : ''}`}
          onClick={() => onActivityChange('cycling')}
        >
          <span className="activity-icon">🚴</span>
          <span className="activity-label">Cycling</span>
        </button>
      </div>
      
      {/* Analytics Section */}
      <div className="analytics-section">
        <div className="section-header">
          <h3>{activityType === 'pedestrian' ? 'Pedestrian' : 'Cycling'} Activity</h3>
        </div>
        
        {stats && (
          <>
            <div className="stats-grid">
              <div className="stat-card primary">
                <div className="stat-value">{stats.totalTrips.toLocaleString()}</div>
                <div className="stat-label">Total Trips</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-value">{stats.avgTrips}</div>
                <div className="stat-label">Avg per Segment</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-value">{stats.maxTrips.toLocaleString()}</div>
                <div className="stat-label">Max Trips</div>
              </div>
            </div>
            
            <div className="info-section">
              <div className="info-item">
                <span className="info-label">Active Segments:</span>
                <span className="info-value">{stats.activeSegments} / {stats.totalSegments}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Coverage:</span>
                <span className="info-value">
                  {((stats.activeSegments / stats.totalSegments) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </>
        )}
        
        {/* Network Connectivity */}
        {networkStats && (
          <div className="network-section">
            <h4>Network Connectivity</h4>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">{networkStats.avgIntegration}</div>
                <div className="stat-label">Avg Integration</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-value">{networkStats.maxIntegration}</div>
                <div className="stat-label">Max Integration</div>
              </div>
            </div>
            
            <div className="info-section">
              <p className="info-text">
                Integration measures how well-connected each street segment is to the rest of the network. 
                Higher values indicate more central, accessible locations.
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Layer Controls */}
      <div className="layer-controls">
        <h4>Visible Layers</h4>
        <div className="layer-toggles">
          <label className="layer-toggle">
            <input
              type="checkbox"
              checked={visibleLayers.network}
              onChange={() => onLayerToggle('network')}
            />
            <span>Network Connectivity</span>
          </label>
          
          <label className="layer-toggle">
            <input
              type="checkbox"
              checked={visibleLayers.pedestrianActivity}
              onChange={() => onLayerToggle('pedestrianActivity')}
            />
            <span>Pedestrian Activity</span>
          </label>
          
          <label className="layer-toggle">
            <input
              type="checkbox"
              checked={visibleLayers.cyclingActivity}
              onChange={() => onLayerToggle('cyclingActivity')}
            />
            <span>Cycling Activity</span>
          </label>
        </div>
      </div>
      
      {/* Legend */}
      <div className="legend-section">
        <h4>Activity Level</h4>
        <div className="legend-gradient">
          <div className="gradient-bar"></div>
          <div className="gradient-labels">
            <span>Low</span>
            <span>High</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WalkabilityAnalytics
