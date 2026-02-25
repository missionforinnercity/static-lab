/**
 * StreetViewSnippet — reusable Street View thumbnail + explore link.
 * Expects a GeoJSON feature with a LineString or MultiLineString geometry.
 */
import React from 'react'
import './StreetViewSnippet.css'

export function getSegmentCentroid (geometry) {
  let allCoords = []
  if (geometry.type === 'MultiLineString') {
    geometry.coordinates.forEach(line => allCoords.push(...line))
  } else if (geometry.type === 'LineString') {
    allCoords = geometry.coordinates
  } else {
    return { lat: 0, lng: 0 }
  }
  const mid = allCoords[Math.floor(allCoords.length / 2)]
  return { lat: mid[1], lng: mid[0] }
}

export function StreetViewSnippet ({ feature, onClose, compact = false }) {
  const { lat, lng } = getSegmentCentroid(feature.geometry)
  const apiKey       = import.meta.env.VITE_GOOGLE_MAPS_KEY
  const name         = (feature.properties.street_name || 'Unknown Street').toLowerCase()
  const imgH         = compact ? 120 : 160
  const imgSize      = compact ? '280x120' : '320x170'

  const imgSrc     = apiKey
    ? `https://maps.googleapis.com/maps/api/streetview?size=${imgSize}&location=${lat},${lng}&fov=90&heading=0&pitch=5&key=${apiKey}`
    : null
  const exploreUrl = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`

  return (
    <div className={`sv-snippet ${compact ? 'sv-snippet--compact' : ''}`}>
      <div className="sv-snippet-header">
        <span className="sv-snippet-name">{name}</span>
        {onClose && (
          <button className="sv-snippet-close" onClick={onClose} title="Close">&times;</button>
        )}
      </div>

      {imgSrc ? (
        <img
          className="sv-snippet-img"
          style={{ height: imgH }}
          src={imgSrc}
          alt={`Street View of ${name}`}
          onError={e => {
            e.currentTarget.style.display = 'none'
            e.currentTarget.nextSibling.style.display = 'flex'
          }}
        />
      ) : null}

      {/* Coordinate placeholder — shown when no API key, or on img error */}
      <div
        className="sv-snippet-placeholder"
        style={{ display: imgSrc ? 'none' : 'flex', height: imgH }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
          <circle cx="12" cy="9" r="2.5"/>
        </svg>
        <span className="sv-snippet-coords">{lat.toFixed(5)}, {lng.toFixed(5)}</span>
        <span className="sv-snippet-hint">segment centroid</span>
      </div>

      <a
        href={exploreUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="sv-snippet-explore"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
        Open in Street View
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: 'auto' }}>
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
          <polyline points="15 3 21 3 21 9"/>
          <line x1="10" y1="14" x2="21" y2="3"/>
        </svg>
      </a>
    </div>
  )
}
