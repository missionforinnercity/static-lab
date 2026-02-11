import React from 'react'
import UnifiedDataExplorer from './explorer/UnifiedDataExplorer'
import './DataExplorer.css'

const DataExplorer = ({ filters, onFiltersChange, activeLayers, onLayersChange }) => {
  return (
    <div className="data-explorer">
      <UnifiedDataExplorer />
    </div>
  )
}

export default DataExplorer
