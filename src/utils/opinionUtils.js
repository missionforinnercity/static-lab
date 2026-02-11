/**
 * Opinion categorization utilities for improvement suggestions
 */

// Theme definitions with colors and keywords
export const OPINION_THEMES = {
  GREENERY: {
    name: 'Greenery & Plants',
    color: '#22c55e', // Green
    keywords: ['plant', 'green', 'tree', 'flower', 'garden', 'vegetation', 'nature', 'foliage']
  },
  SEATING: {
    name: 'Seating & Benches',
    color: '#eab308', // Yellow
    keywords: ['seat', 'bench', 'chair', 'outdoor seating', 'sitting', 'rest area']
  },
  SECURITY: {
    name: 'Security & Safety',
    color: '#ef4444', // Red
    keywords: ['security', 'safety', 'crime', 'police', 'ccid', 'surveillance', 'patrol', 'visible', 'safe']
  },
  CLEANLINESS: {
    name: 'Cleanliness & Maintenance',
    color: '#3b82f6', // Blue
    keywords: ['clean', 'paint', 'wall', 'litter', 'bin', 'trash', 'garbage', 'maintain', 'tidy', 'wash']
  },
  LIGHTING: {
    name: 'Lighting',
    color: '#f59e0b', // Orange
    keywords: ['light', 'lighting', 'lamp', 'illuminate', 'bright', 'dark', 'street light']
  },
  SIGNAGE: {
    name: 'Signage & Wayfinding',
    color: '#a855f7', // Purple
    keywords: ['sign', 'signage', 'wayfinding', 'direction', 'map', 'visible', 'advertis', 'display', 'trading hours']
  },
  SOCIAL_ISSUES: {
    name: 'Social Issues',
    color: '#ec4899', // Pink
    keywords: ['homeless', 'prostitut', 'beggar', 'drug', 'harassment', 'brothel', 'loiter', 'naked']
  },
  ECONOMIC: {
    name: 'Economic & Business',
    color: '#14b8a6', // Teal
    keywords: ['rent', 'cost', 'customer', 'business', 'permit', 'trading', 'competition', 'price', 'tourist']
  },
  INFRASTRUCTURE: {
    name: 'Infrastructure',
    color: '#6366f1', // Indigo
    keywords: ['parking', 'road', 'pavement', 'structure', 'street furniture', 'sidewalk']
  }
};

// Grey color for null/no data
export const NULL_THEME = {
  name: 'No Data',
  color: '#9ca3af', // Grey
  keywords: []
};

/**
 * Categorize an opinion text into a theme
 * @param {string} opinionText - The opinion text to categorize
 * @returns {Object} - Theme object with name and color
 */
export function categorizeOpinion(opinionText) {
  // Check for null, undefined, empty string, or common "no data" responses
  if (!opinionText || 
      opinionText.trim() === '' || 
      opinionText.toLowerCase() === 'null' ||
      opinionText.toLowerCase() === 'n/a' ||
      opinionText.toLowerCase() === 'none' ||
      opinionText.toLowerCase() === 'no') {
    return NULL_THEME;
  }
  
  const text = opinionText.toLowerCase();
  const scores = {};
  
  // Score each theme based on keyword matches
  Object.keys(OPINION_THEMES).forEach(themeKey => {
    const theme = OPINION_THEMES[themeKey];
    let score = 0;
    
    theme.keywords.forEach(keyword => {
      // Use word boundary matching for better accuracy
      // Match partial words (e.g., 'plant' matches 'planting', 'plants')
      const regex = new RegExp('\\b' + keyword, 'gi');
      const matches = text.match(regex);
      if (matches) {
        score += matches.length;
      }
    });
    
    scores[themeKey] = score;
  });
  
  // Find theme with highest score
  let maxScore = 0;
  let dominantTheme = NULL_THEME;
  
  Object.keys(scores).forEach(themeKey => {
    if (scores[themeKey] > maxScore) {
      maxScore = scores[themeKey];
      dominantTheme = OPINION_THEMES[themeKey];
    }
  });
  
  // If no keywords matched, return null theme
  if (maxScore === 0) {
    return NULL_THEME;
  }
  
  return dominantTheme;
}

/**
 * Get categorized opinion data for visualization
 * @param {Array} businesses - Array of business features
 * @param {string} opinionField - Either 'improve_one_thing' or 'stake_big_change'
 * @returns {Object} - GeoJSON with categorized businesses
 */
export function getCategorizedOpinionData(businesses, opinionField) {
  if (!businesses || businesses.length === 0) {
    return { type: 'FeatureCollection', features: [] };
  }
  
  const categorizedFeatures = businesses.map(business => {
    const opinionText = business.properties[opinionField];
    const theme = categorizeOpinion(opinionText);
    
    return {
      ...business,
      properties: {
        ...business.properties,
        _theme: theme.name,
        _themeColor: theme.color,
        _opinionText: opinionText || 'No data'
      }
    };
  });
  
  return {
    type: 'FeatureCollection',
    features: categorizedFeatures
  };
}

/**
 * Get statistics about opinion themes
 * @param {Array} businesses - Array of business features
 * @param {string} opinionField - Either 'improve_one_thing' or 'stake_big_change'
 * @returns {Object} - Statistics object with theme counts
 */
export function getOpinionStats(businesses, opinionField) {
  if (!businesses || businesses.length === 0) {
    return { 
      totalCategorized: 0, 
      nullOpinions: 0,
      byTheme: {} 
    };
  }
  
  const themeCounts = {};
  let totalCategorized = 0;
  let nullOpinions = 0;
  
  // Initialize counts for each theme (excluding NULL_THEME)
  Object.keys(OPINION_THEMES).forEach(themeKey => {
    themeCounts[themeKey] = 0;
  });
  
  // Count themes
  businesses.forEach(business => {
    const opinionText = business.properties[opinionField];
    const theme = categorizeOpinion(opinionText);
    
    if (theme === NULL_THEME) {
      nullOpinions++;
    } else {
      totalCategorized++;
      // Find the theme key that matches this theme
      const themeKey = Object.keys(OPINION_THEMES).find(
        key => OPINION_THEMES[key].name === theme.name
      );
      if (themeKey) {
        themeCounts[themeKey]++;
      }
    }
  });
  
  return {
    totalCategorized,
    nullOpinions,
    byTheme: themeCounts
  };
}
