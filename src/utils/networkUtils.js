// Network Analysis Utility Functions

/**
 * Network metric categories for organization
 */
export const METRIC_CATEGORIES = {
  ACCESSIBILITY: 'accessibility',
  CONNECTIVITY: 'connectivity',
  MOVEMENT: 'movement',
  ANGULAR: 'angular'
};

/**
 * Complete mapping of network metric labels with human-readable names and descriptions
 */
export const NETWORK_METRIC_LABELS = {
  // Closeness/Accessibility metrics
  cc_harmonic_400: {
    short: 'Closeness (Local)',
    full: 'Harmonic Closeness (400m)',
    description: 'How central this location is within 400m; higher values mean easier to reach nearby destinations',
    category: METRIC_CATEGORIES.ACCESSIBILITY,
    radius: 400,
    type: 'distance'
  },
  cc_harmonic_800: {
    short: 'Closeness (Neighborhood)',
    full: 'Harmonic Closeness (800m)',
    description: 'How central this location is within 800m; higher values mean easier to reach neighborhood destinations',
    category: METRIC_CATEGORIES.ACCESSIBILITY,
    radius: 800,
    type: 'distance'
  },
  cc_harmonic_400_ang: {
    short: 'Angular Closeness (Local)',
    full: 'Angular Harmonic Closeness (400m)',
    description: 'Closeness based on turns rather than distance; higher values mean fewer turns to reach nearby places',
    category: METRIC_CATEGORIES.ANGULAR,
    radius: 400,
    type: 'angular'
  },
  cc_harmonic_800_ang: {
    short: 'Angular Closeness (Neighborhood)',
    full: 'Angular Harmonic Closeness (800m)',
    description: 'Closeness based on turns rather than distance within 800m',
    category: METRIC_CATEGORIES.ANGULAR,
    radius: 800,
    type: 'angular'
  },
  
  // Integration metrics (Hillier)
  cc_hillier_400: {
    short: 'Integration (Local)',
    full: 'Spatial Integration (400m)',
    description: 'How well-integrated this location is into the street network; higher values mean more integrated',
    category: METRIC_CATEGORIES.ACCESSIBILITY,
    radius: 400,
    type: 'distance'
  },
  cc_hillier_800: {
    short: 'Integration (Neighborhood)',
    full: 'Spatial Integration (800m)',
    description: 'Network integration at neighborhood scale; higher values indicate better overall accessibility',
    category: METRIC_CATEGORIES.ACCESSIBILITY,
    radius: 800,
    type: 'distance'
  },
  cc_hillier_400_ang: {
    short: 'Angular Integration (Local)',
    full: 'Angular Spatial Integration (400m)',
    description: 'Network integration based on directional changes rather than distance',
    category: METRIC_CATEGORIES.ANGULAR,
    radius: 400,
    type: 'angular'
  },
  cc_hillier_800_ang: {
    short: 'Angular Integration (Neighborhood)',
    full: 'Angular Spatial Integration (800m)',
    description: 'Angular network integration at neighborhood scale',
    category: METRIC_CATEGORIES.ANGULAR,
    radius: 800,
    type: 'angular'
  },
  
  // Farness metrics (inverse of closeness)
  cc_farness_400: {
    short: 'Total Distance (Local)',
    full: 'Network Farness (400m)',
    description: 'Sum of distances to all reachable nodes; lower values mean more central location',
    category: METRIC_CATEGORIES.ACCESSIBILITY,
    radius: 400,
    type: 'distance',
    inverted: true
  },
  cc_farness_800: {
    short: 'Total Distance (Neighborhood)',
    full: 'Network Farness (800m)',
    description: 'Sum of distances to all nodes within 800m; lower is better',
    category: METRIC_CATEGORIES.ACCESSIBILITY,
    radius: 800,
    type: 'distance',
    inverted: true
  },
  cc_farness_400_ang: {
    short: 'Angular Distance (Local)',
    full: 'Angular Farness (400m)',
    description: 'Sum of angular changes to reach all nearby nodes; lower values mean simpler navigation',
    category: METRIC_CATEGORIES.ANGULAR,
    radius: 400,
    type: 'angular',
    inverted: true
  },
  cc_farness_800_ang: {
    short: 'Angular Distance (Neighborhood)',
    full: 'Angular Farness (800m)',
    description: 'Sum of angular changes within 800m; lower is better',
    category: METRIC_CATEGORIES.ANGULAR,
    radius: 800,
    type: 'angular',
    inverted: true
  },
  
  // Betweenness metrics (through-movement)
  cc_betweenness_400: {
    short: 'Through-Movement (Local)',
    full: 'Betweenness Centrality (400m)',
    description: 'How often routes pass through this location; higher values mean more through-traffic potential',
    category: METRIC_CATEGORIES.MOVEMENT,
    radius: 400,
    type: 'distance'
  },
  cc_betweenness_800: {
    short: 'Through-Movement (Neighborhood)',
    full: 'Betweenness Centrality (800m)',
    description: 'Through-traffic potential at neighborhood scale; higher values indicate key route locations',
    category: METRIC_CATEGORIES.MOVEMENT,
    radius: 800,
    type: 'distance'
  },
  cc_betweenness_400_ang: {
    short: 'Angular Through-Movement (Local)',
    full: 'Angular Betweenness (400m)',
    description: 'Through-movement based on turn angles; higher values mean more direct routes pass through',
    category: METRIC_CATEGORIES.ANGULAR,
    radius: 400,
    type: 'angular'
  },
  cc_betweenness_800_ang: {
    short: 'Angular Through-Movement (Neighborhood)',
    full: 'Angular Betweenness (800m)',
    description: 'Angular through-movement potential within 800m',
    category: METRIC_CATEGORIES.ANGULAR,
    radius: 800,
    type: 'angular'
  },
  
  // Beta-weighted betweenness
  cc_betweenness_beta_400: {
    short: 'Weighted Through-Movement (Local)',
    full: 'Beta-Weighted Betweenness (400m)',
    description: 'Distance-weighted through-movement; accounts for both route frequency and distance',
    category: METRIC_CATEGORIES.MOVEMENT,
    radius: 400,
    type: 'distance'
  },
  cc_betweenness_beta_800: {
    short: 'Weighted Through-Movement (Neighborhood)',
    full: 'Beta-Weighted Betweenness (800m)',
    description: 'Distance-weighted through-movement at neighborhood scale',
    category: METRIC_CATEGORIES.MOVEMENT,
    radius: 800,
    type: 'distance'
  },
  cc_beta_400: {
    short: 'Beta Index (Local)',
    full: 'Network Beta Index (400m)',
    description: 'Ratio of edges to nodes; higher values indicate better-connected network',
    category: METRIC_CATEGORIES.CONNECTIVITY,
    radius: 400,
    type: 'distance'
  },
  cc_beta_800: {
    short: 'Beta Index (Neighborhood)',
    full: 'Network Beta Index (800m)',
    description: 'Edge-to-node ratio at neighborhood scale; measures network redundancy',
    category: METRIC_CATEGORIES.CONNECTIVITY,
    radius: 800,
    type: 'distance'
  },
  
  // Density metrics
  cc_density_400: {
    short: 'Node Density (Local)',
    full: 'Intersection Density (400m)',
    description: 'Number of reachable intersections; higher values mean more complex street network',
    category: METRIC_CATEGORIES.CONNECTIVITY,
    radius: 400,
    type: 'distance'
  },
  cc_density_800: {
    short: 'Node Density (Neighborhood)',
    full: 'Intersection Density (800m)',
    description: 'Number of reachable intersections within 800m',
    category: METRIC_CATEGORIES.CONNECTIVITY,
    radius: 800,
    type: 'distance'
  },
  cc_density_400_ang: {
    short: 'Angular Density (Local)',
    full: 'Angular Network Density (400m)',
    description: 'Density measured by angular changes; indicates route complexity',
    category: METRIC_CATEGORIES.ANGULAR,
    radius: 400,
    type: 'angular'
  },
  cc_density_800_ang: {
    short: 'Angular Density (Neighborhood)',
    full: 'Angular Network Density (800m)',
    description: 'Angular density at neighborhood scale',
    category: METRIC_CATEGORIES.ANGULAR,
    radius: 800,
    type: 'angular'
  },
  
  // Cycles metrics
  cc_cycles_400: {
    short: 'Network Cycles (Local)',
    full: 'Alternative Routes (400m)',
    description: 'Number of circular paths; more cycles mean more route choices and resilience',
    category: METRIC_CATEGORIES.CONNECTIVITY,
    radius: 400,
    type: 'distance'
  },
  cc_cycles_800: {
    short: 'Network Cycles (Neighborhood)',
    full: 'Alternative Routes (800m)',
    description: 'Number of circular paths within 800m; indicates network redundancy',
    category: METRIC_CATEGORIES.CONNECTIVITY,
    radius: 800,
    type: 'distance'
  }
};

/**
 * Get metrics grouped by category
 */
export function getMetricsByCategory() {
  const grouped = {
    [METRIC_CATEGORIES.ACCESSIBILITY]: [],
    [METRIC_CATEGORIES.CONNECTIVITY]: [],
    [METRIC_CATEGORIES.MOVEMENT]: [],
    [METRIC_CATEGORIES.ANGULAR]: []
  };
  
  Object.entries(NETWORK_METRIC_LABELS).forEach(([key, value]) => {
    grouped[value.category].push({ key, ...value });
  });
  
  return grouped;
}

/**
 * Get metrics filtered by radius
 */
export function getMetricsByRadius(radius) {
  return Object.entries(NETWORK_METRIC_LABELS)
    .filter(([_, value]) => value.radius === radius)
    .reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});
}

/**
 * Get metrics filtered by type (distance or angular)
 */
export function getMetricsByType(type) {
  return Object.entries(NETWORK_METRIC_LABELS)
    .filter(([_, value]) => value.type === type)
    .reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});
}

/**
 * Get primary metrics for quick selection (most commonly used)
 */
export function getPrimaryMetrics() {
  return [
    'cc_harmonic_400',
    'cc_harmonic_800',
    'cc_betweenness_400',
    'cc_betweenness_800',
    'cc_hillier_400',
    'cc_hillier_800',
    'cc_density_400',
    'cc_density_800'
  ];
}

/**
 * Calculate statistics for a given metric across all features
 */
export function calculateMetricStatistics(features, metricKey) {
  if (!features || features.length === 0) {
    return null;
  }
  
  const values = features
    .map(f => f.properties[metricKey])
    .filter(v => v !== null && v !== undefined && !isNaN(v));
  
  if (values.length === 0) {
    return null;
  }
  
  // Sort values for median calculation
  const sorted = [...values].sort((a, b) => a - b);
  
  const sum = values.reduce((acc, val) => acc + val, 0);
  const mean = sum / values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const median = sorted.length % 2 === 0
    ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
    : sorted[Math.floor(sorted.length / 2)];
  
  // Calculate standard deviation
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
  const avgSquaredDiff = squaredDiffs.reduce((acc, val) => acc + val, 0) / values.length;
  const stdDev = Math.sqrt(avgSquaredDiff);
  
  return {
    count: values.length,
    min,
    max,
    mean,
    median,
    stdDev,
    range: max - min
  };
}

/**
 * Format metric value for display
 */
export function formatMetricValue(value, metricKey) {
  if (value === null || value === undefined || isNaN(value)) {
    return 'N/A';
  }
  
  const metric = NETWORK_METRIC_LABELS[metricKey];
  
  // For counts (cycles, density), show as integer
  if (metricKey.includes('cycles') || metricKey.includes('density')) {
    return Math.round(value).toLocaleString();
  }
  
  // For other metrics, show 2 decimal places
  return value.toFixed(2);
}

/**
 * Get color interpolation for a metric value
 * Returns a color from red (low) -> yellow (medium) -> green (high)
 * For inverted metrics (farness), reverses the scale
 */
export function getMetricColor(value, stats, metricKey) {
  if (!stats || value === null || value === undefined || isNaN(value)) {
    return '#999999';
  }
  
  const metric = NETWORK_METRIC_LABELS[metricKey];
  const isInverted = metric?.inverted || false;
  
  // Normalize value to 0-1 range
  let normalized = (value - stats.min) / (stats.max - stats.min);
  
  // Invert if needed (for farness metrics where lower is better)
  if (isInverted) {
    normalized = 1 - normalized;
  }
  
  // Clamp to 0-1
  normalized = Math.max(0, Math.min(1, normalized));
  
  // Interpolate between red -> yellow -> green
  if (normalized < 0.5) {
    // Red to yellow
    const t = normalized * 2;
    const r = 239; // #ef4444 red
    const g = Math.round(68 + (234 - 68) * t); // Interpolate to #eab308 yellow
    const b = Math.round(68 + (8 - 68) * t);
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    // Yellow to green
    const t = (normalized - 0.5) * 2;
    const r = Math.round(234 - (234 - 0) * t); // Interpolate to #00ff41 green
    const g = Math.round(179 + (255 - 179) * t);
    const b = Math.round(8 + (65 - 8) * t);
    return `rgb(${r}, ${g}, ${b})`;
  }
}

/**
 * Get metrics for comparison between two POIs
 */
export function compareMetrics(feature1, feature2, metricKeys) {
  const comparison = [];
  
  metricKeys.forEach(key => {
    const value1 = feature1.properties[key];
    const value2 = feature2.properties[key];
    const metric = NETWORK_METRIC_LABELS[key];
    
    if (value1 !== null && value1 !== undefined && value2 !== null && value2 !== undefined) {
      const diff = value1 - value2;
      const percentDiff = value2 !== 0 ? ((diff / value2) * 100) : 0;
      
      comparison.push({
        key,
        label: metric.short,
        value1,
        value2,
        diff,
        percentDiff,
        winner: diff > 0 ? 1 : (diff < 0 ? 2 : 0)
      });
    }
  });
  
  return comparison;
}

/**
 * Rank features by a specific metric
 */
export function rankFeaturesByMetric(features, metricKey) {
  if (!features || features.length === 0) {
    return [];
  }
  
  const metric = NETWORK_METRIC_LABELS[metricKey];
  const isInverted = metric?.inverted || false;
  
  return features
    .filter(f => f.properties[metricKey] !== null && f.properties[metricKey] !== undefined)
    .sort((a, b) => {
      const valA = a.properties[metricKey];
      const valB = b.properties[metricKey];
      return isInverted ? valA - valB : valB - valA;
    })
    .map((f, index) => ({
      feature: f,
      rank: index + 1,
      value: f.properties[metricKey]
    }));
}
