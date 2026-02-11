import React, { useState, useEffect } from 'react'
import './LightingAnalytics.css'

const LightingAnalytics = ({
  segmentsData,
  projectsData,
  visibleLayers,
  onLayerToggle
}) => {
  const [stats, setStats] = useState(null)
  const [categoryStats, setCategoryStats] = useState(null)
  
  // Calculate lighting statistics
  useEffect(() => {
    if (segmentsData?.features) {
      const features = segmentsData.features
      
      // Filter segments with valid lux data
      const validSegments = features.filter(f => 
        f.properties.mean_lux !== null && 
        f.properties.mean_lux !== undefined
      )
      
      if (validSegments.length > 0) {
        const luxValues = validSegments.map(f => f.properties.mean_lux)
        const total = luxValues.reduce((sum, v) => sum + v, 0)
        const avg = total / luxValues.length
        const max = Math.max(...luxValues)
        const min = Math.min(...luxValues)
        
        // Categorize by lighting quality
        const categories = {
          dark: validSegments.filter(f => f.properties.mean_lux < 10).length,
          low: validSegments.filter(f => f.properties.mean_lux >= 10 && f.properties.mean_lux < 30).length,
          moderate: validSegments.filter(f => f.properties.mean_lux >= 30 && f.properties.mean_lux < 75).length,
          wellLit: validSegments.filter(f => f.properties.mean_lux >= 75 && f.properties.mean_lux < 120).length,
          excellent: validSegments.filter(f => f.properties.mean_lux >= 120).length
        }
        
        setStats({
          totalSegments: features.length,
          analyzedSegments: validSegments.length,
          avgLux: avg.toFixed(2),
          maxLux: max.toFixed(2),
          minLux: min.toFixed(2)
        })
        
        setCategoryStats(categories)
      }
    }
  }, [segmentsData])
  
  // Project statistics
  const [projectStats, setProjectStats] = useState(null)
  
  useEffect(() => {
    if (projectsData?.features) {
      setProjectStats({
        totalProjects: projectsData.features.length
      })
    }
  }, [projectsData])
  
  return (
    <div className="lighting-analytics">
      {/* Analytics Section */}
      <div className="analytics-section">
        <div className="section-header">
          <h3>Street Lighting Analysis</h3>
        </div>
        
        {stats && (
          <>
            <div className="stats-grid">
              <div className="stat-card primary">
                <div className="stat-value">{stats.avgLux}</div>
                <div className="stat-label">Avg Lux Level</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-value">{stats.maxLux}</div>
                <div className="stat-label">Max Lux</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-value">{stats.minLux}</div>
                <div className="stat-label">Min Lux</div>
              </div>
            </div>
            
            <div className="info-section">
              <div className="info-item">
                <span className="info-label">Analyzed Segments:</span>
                <span className="info-value">{stats.analyzedSegments} / {stats.totalSegments}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Coverage:</span>
                <span className="info-value">
                  {((stats.analyzedSegments / stats.totalSegments) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </>
        )}
        
        {/* Category Breakdown */}
        {categoryStats && (
          <div className="category-section">
            <h4>Lighting Quality Distribution</h4>
            <div className="category-list">
              <div className="category-item dark">
                <div className="category-header">
                  <span className="category-name">Dark / Poorly Lit</span>
                  <span className="category-count">{categoryStats.dark}</span>
                </div>
                <div className="category-description">&lt; 10 lux</div>
                <div className="category-bar">
                  <div 
                    className="category-bar-fill"
                    style={{ 
                      width: `${(categoryStats.dark / stats.analyzedSegments) * 100}%`,
                      background: '#991b1b'
                    }}
                  />
                </div>
              </div>
              
              <div className="category-item low">
                <div className="category-header">
                  <span className="category-name">Low Light</span>
                  <span className="category-count">{categoryStats.low}</span>
                </div>
                <div className="category-description">10 - 30 lux</div>
                <div className="category-bar">
                  <div 
                    className="category-bar-fill"
                    style={{ 
                      width: `${(categoryStats.low / stats.analyzedSegments) * 100}%`,
                      background: '#dc2626'
                    }}
                  />
                </div>
              </div>
              
              <div className="category-item moderate">
                <div className="category-header">
                  <span className="category-name">Moderate</span>
                  <span className="category-count">{categoryStats.moderate}</span>
                </div>
                <div className="category-description">30 - 75 lux</div>
                <div className="category-bar">
                  <div 
                    className="category-bar-fill"
                    style={{ 
                      width: `${(categoryStats.moderate / stats.analyzedSegments) * 100}%`,
                      background: '#f59e0b'
                    }}
                  />
                </div>
              </div>
              
              <div className="category-item well-lit">
                <div className="category-header">
                  <span className="category-name">Well Lit</span>
                  <span className="category-count">{categoryStats.wellLit}</span>
                </div>
                <div className="category-description">75 - 120 lux</div>
                <div className="category-bar">
                  <div 
                    className="category-bar-fill"
                    style={{ 
                      width: `${(categoryStats.wellLit / stats.analyzedSegments) * 100}%`,
                      background: '#10b981'
                    }}
                  />
                </div>
              </div>
              
              <div className="category-item excellent">
                <div className="category-header">
                  <span className="category-name">Excellent</span>
                  <span className="category-count">{categoryStats.excellent}</span>
                </div>
                <div className="category-description">&gt; 120 lux</div>
                <div className="category-bar">
                  <div 
                    className="category-bar-fill"
                    style={{ 
                      width: `${(categoryStats.excellent / stats.analyzedSegments) * 100}%`,
                      background: '#3b82f6'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Project Info */}
        {projectStats && (
          <div className="info-section">
            <div className="info-item">
              <span className="info-label">Lighting Projects:</span>
              <span className="info-value">{projectStats.totalProjects}</span>
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
              checked={visibleLayers.lightingSegments}
              onChange={() => onLayerToggle('lightingSegments')}
            />
            <span>Street Segments</span>
          </label>
          
          <label className="layer-toggle">
            <input
              type="checkbox"
              checked={visibleLayers.lightingProjects}
              onChange={() => onLayerToggle('lightingProjects')}
            />
            <span>Lighting Projects</span>
          </label>
          
          <label className="layer-toggle">
            <input
              type="checkbox"
              checked={visibleLayers.lightIntensity}
              onChange={() => onLayerToggle('lightIntensity')}
            />
            <span>Light Intensity Heatmap</span>
          </label>
        </div>
      </div>
      
      {/* Legend */}
      <div className="legend-section">
        <h4>Lighting Quality</h4>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-color" style={{ background: '#991b1b' }}></div>
            <span>Dark (&lt;10 lux)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ background: '#dc2626' }}></div>
            <span>Low (10-30)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ background: '#f59e0b' }}></div>
            <span>Moderate (30-75)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ background: '#10b981' }}></div>
            <span>Well Lit (75-120)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ background: '#3b82f6' }}></div>
            <span>Excellent (&gt;120)</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LightingAnalytics
