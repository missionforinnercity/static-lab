import React from 'react'
import './ModeToggle.css'

const ModeToggle = ({ mode, onModeChange }) => {
  return (
    <div className="mode-toggle">
      <button
        className={`mode-button ${mode === 'narrative' ? 'active' : ''}`}
        onClick={() => onModeChange('narrative')}
      >
        <span className="icon">📖</span>
        Narrative Tours
      </button>
      <button
        className={`mode-button ${mode === 'explorer' ? 'active' : ''}`}
        onClick={() => onModeChange('explorer')}
      >
        <span className="icon">🔍</span>
        Data Explorer
      </button>
    </div>
  )
}

export default ModeToggle
