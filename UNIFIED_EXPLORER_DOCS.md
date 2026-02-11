# Unified Data Explorer - Implementation Summary

## Overview
The Unified Data Explorer is a comprehensive dashboard that integrates three separate analytical tools into one cohesive interface within the static-lab-dash project. This allows users to explore business analytics, walkability metrics, and street lighting data all in one place.

## Architecture

### Component Structure
```
src/components/explorer/
├── UnifiedDataExplorer.jsx      # Main container component
├── UnifiedDataExplorer.css      # Main styles
├── BusinessAnalytics.jsx        # Business dashboard sidebar
├── BusinessAnalytics.css        # Business styles
├── WalkabilityAnalytics.jsx     # Walkability dashboard sidebar
├── WalkabilityAnalytics.css     # Walkability styles
├── LightingAnalytics.jsx        # Lighting dashboard sidebar
├── LightingAnalytics.css        # Lighting styles
├── ExplorerMap.jsx              # Unified map with all layers
└── ExplorerMap.css              # Map styles
```

### Data Flow
1. **UnifiedDataExplorer** - Top-level component managing:
   - Dashboard mode selection (Business, Walkability, Lighting)
   - Data loading for all three dashboards
   - Layer visibility state
   - Communication between analytics panels and map

2. **Analytics Components** - Each provides:
   - Mode-specific controls and filters
   - Statistics and visualizations
   - Layer toggles for their respective data

3. **ExplorerMap** - Renders all map layers:
   - Business: POIs, street stalls, properties
   - Walkability: Network connectivity, pedestrian/cycling activity
   - Lighting: Street segments with lux values, lighting projects

## Features by Dashboard

### Business Analytics (🏪)
**7 Sub-modes:**
1. **Business Liveliness** - Real-time business activity
   - Time-of-day controls (day of week + hour)
   - Open/closed statistics
   - Category-based filtering
   
2. **Public Opinions** - Survey responses
   - Categorized by theme
   - Response statistics
   
3. **Review Ratings** - Business ratings analysis
   
4. **Amenities** - Facility and service filters
   
5. **Categories** - Business type analysis
   
6. **Network Analysis** - Location connectivity
   
7. **Property Sales** - Real estate transactions

**Data Sources:**
- `/public/data/business/POI_enriched_20260120_185944.geojson`
- `/public/data/business/streetStalls.geojson`
- `/public/data/business/properties_consolidated.geojson`
- `/public/data/business/survey_data.geojson`

### Walkability Analytics (🚶)
**Features:**
- Activity type toggle (Pedestrian/Cycling)
- Trip count statistics
- Network connectivity visualization
- Integration metrics (Hillier 400m radius)

**Data Sources:**
- `/public/data/walkabilty/network_connectivity.geojson`
- `/public/data/walkabilty/pedestrian_month_all.geojson`
- `/public/data/walkabilty/cycling_month_all.geojson`

### Lighting Analytics (💡)
**Features:**
- Lux level statistics (mean, min, max)
- Quality categorization:
  - Dark/Poorly Lit (< 10 lux)
  - Low Light (10-30 lux)
  - Moderate (30-75 lux)
  - Well Lit (75-120 lux)
  - Excellent (> 120 lux)
- Lighting project locations

**Data Sources:**
- `/public/data/lighting/road_segments_lighting_kpis.geojson`
- `/public/data/lighting/lighting.geojson`
- `/public/data/lighting/light_intensity.tif.aux.xml`

## Integration with Main App

The unified explorer is accessed through the existing DataExplorer component:
```jsx
// src/components/DataExplorer.jsx
import UnifiedDataExplorer from './explorer/UnifiedDataExplorer'

const DataExplorer = () => {
  return (
    <div className="data-explorer">
      <UnifiedDataExplorer />
    </div>
  )
}
```

When users switch from "Narrative Tours" to "Data Explorer" mode in the main app, they now get access to all three dashboards in one unified interface.

## Utility Functions

All utility functions from Business-Dash have been copied to `/src/utils/`:
- `timeUtils.js` - Business hours and time formatting
- `opinionUtils.js` - Opinion categorization and analysis
- `propertyUtils.js` - Property transaction processing
- `networkUtils.js` - Network metric calculations

## Map Layer Management

The ExplorerMap component conditionally renders layers based on:
1. **Dashboard Mode** - Only shows relevant layers for current dashboard
2. **Layer Visibility** - User-controlled toggles in analytics panels
3. **Data Availability** - Layers only render when data is loaded

### Layer IDs by Dashboard:
**Business:**
- `businesses-layer` - Business POIs (circles, color by rating)
- `street-stalls-layer` - Street vendors (orange circles)
- `properties-layer` - Property sales (purple circles, size by price)

**Walkability:**
- `network-layer` - Road network (lines, color by integration)
- `pedestrian-layer` - Pedestrian activity (lines, color/width by trip count)
- `cycling-layer` - Cycling activity (blue gradient by trip count)

**Lighting:**
- `lighting-segments-layer` - Street segments (lines, color by lux level)
- `lighting-projects-layer` - Lighting installations (yellow circles)

## Styling

The unified explorer uses a consistent dark theme with green accents:
- Background: `#0a0f0d`
- Panels: `#1a1f1d`
- Borders: `#2a3f2d`
- Primary: `#4caf50` (green)
- Text: `#e8f5e9` (light), `#a5d6a7` (muted)

## Next Steps for Narrative Integration

The narrative tours will use this data explorer as their foundation:
1. Narratives can activate specific dashboard modes
2. Narratives can control time settings (for business liveliness)
3. Narratives can highlight specific features on the map
4. Narratives can guide users through multi-layered insights

## Usage

To run the dashboard:
```bash
cd /home/anees/mission_projects/static-lab-dash
npm run dev
```

Then navigate to Data Explorer mode in the app to see the unified dashboard.

## Dependencies
- `react` - Component framework
- `react-map-gl` - Mapbox GL wrapper for React
- `mapbox-gl` - Mapbox maps
- All other dependencies already in package.json

## File Locations
- Main component: `/src/components/explorer/UnifiedDataExplorer.jsx`
- Analytics panels: `/src/components/explorer/[Business|Walkability|Lighting]Analytics.jsx`
- Map component: `/src/components/explorer/ExplorerMap.jsx`
- Utilities: `/src/utils/`
- Data: `/public/data/[business|walkabilty|lighting]/`
