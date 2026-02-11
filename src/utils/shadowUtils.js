// Utility functions for handling shadow GeoTIFF data in Mapbox
import parseGeoraster from 'georaster';
import proj4 from 'proj4';

// Define common projections
// EPSG:32610 is UTM Zone 10N (common for San Francisco area)
// You may need to adjust this based on your data's actual CRS
proj4.defs('EPSG:32610', '+proj=utm +zone=10 +datum=WGS84 +units=m +no_defs');
proj4.defs('EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs');

/**
 * Creates a Mapbox image source from a GeoTIFF URL
 * Converts the GeoTIFF to a canvas with red-to-blue color mapping
 * Red = sunny areas (low shadow values)
 * Blue = shaded areas (high shadow values)
 * 
 * @param {string} url - URL to the GeoTIFF file
 * @returns {Promise<Object>} - Canvas image data and bounds for Mapbox
 */
export async function loadShadowGeoTIFF(url) {
  try {
    // Fetch the GeoTIFF file
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    
    // Parse the GeoTIFF using georaster
    const georaster = await parseGeoraster(arrayBuffer);
    
    console.log('GeoTIFF loaded:', {
      width: georaster.width,
      height: georaster.height,
      bounds: { xmin: georaster.xmin, xmax: georaster.xmax, ymin: georaster.ymin, ymax: georaster.ymax },
      numberOfRasters: georaster.numberOfRasters,
      pixelWidth: georaster.pixelWidth,
      pixelHeight: georaster.pixelHeight,
      projection: georaster.projection
    });
    
    // Extract the bounds from the GeoTIFF
    const { xmin, xmax, ymin, ymax } = georaster;
    
    // Check if we need to reproject (if coordinates are not in lat/lon range)
    let bounds;
    if (Math.abs(xmin) > 180 || Math.abs(xmax) > 180 || Math.abs(ymin) > 90 || Math.abs(ymax) > 90) {
      // Coordinates are projected, need to convert to WGS84
      console.log('Reprojecting from projected CRS to WGS84');
      
      // Try to get projection from georaster, otherwise assume UTM Zone 10N
      let sourceCRS = 'EPSG:32610'; // Default
      if (georaster.projection) {
        // If projection is a number, convert to EPSG string
        if (typeof georaster.projection === 'number') {
          sourceCRS = `EPSG:${georaster.projection}`;
        } else if (typeof georaster.projection === 'string') {
          sourceCRS = georaster.projection;
        }
      }
      
      console.log('Source CRS:', sourceCRS);
      
      // Define the projection if it's not already defined
      // EPSG:32734 is UTM Zone 34S
      if (sourceCRS === 'EPSG:32734' && !proj4.defs(sourceCRS)) {
        proj4.defs(sourceCRS, '+proj=utm +zone=34 +south +datum=WGS84 +units=m +no_defs');
      }
      
      const targetCRS = 'EPSG:4326';
      
      // Convert corners
      const topLeft = proj4(sourceCRS, targetCRS, [xmin, ymax]);
      const topRight = proj4(sourceCRS, targetCRS, [xmax, ymax]);
      const bottomRight = proj4(sourceCRS, targetCRS, [xmax, ymin]);
      const bottomLeft = proj4(sourceCRS, targetCRS, [xmin, ymin]);
      
      bounds = [
        topLeft,
        topRight,
        bottomRight,
        bottomLeft
      ];
    } else {
      // Already in lat/lon
      bounds = [
        [xmin, ymax],  // top-left
        [xmax, ymax],  // top-right
        [xmax, ymin],  // bottom-right
        [xmin, ymin]   // bottom-left
      ];
    }
    
    console.log('Calculated bounds (WGS84):', bounds);
    
    // Create a canvas to render the colored image
    const canvas = document.createElement('canvas');
    canvas.width = georaster.width;
    canvas.height = georaster.height;
    const ctx = canvas.getContext('2d');
    
    // Get the raster values (first band)
    const values = georaster.values[0];
    
    // Find min and max values for normalization
    let min = Infinity;
    let max = -Infinity;
    for (let i = 0; i < values.length; i++) {
      for (let j = 0; j < values[i].length; j++) {
        const val = values[i][j];
        if (val !== null && val !== undefined && val !== georaster.noDataValue) {
          min = Math.min(min, val);
          max = Math.max(max, val);
        }
      }
    }
    
    console.log('Shadow value range:', { min, max });
    console.log('Sample values - first pixel:', values[0][0], 'last pixel:', values[values.length-1][values[0].length-1]);
    
    // Create image data
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    
    // Fill the canvas with colored pixels
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const val = values[y][x];
        const idx = (y * canvas.width + x) * 4;
        
        if (val === null || val === undefined || val === georaster.noDataValue) {
          // No shadow data = Full sun = RED
          imageData.data[idx] = 255;      // R
          imageData.data[idx + 1] = 0;    // G
          imageData.data[idx + 2] = 0;    // B
          imageData.data[idx + 3] = 255;  // A (fully opaque)
        } else {
          // Normalize value to 0-1 range
          let normalized = (val - min) / (max - min);
          
          // In shadow data: 0 = no shade (full sun), 1 = complete shade
          // We want: red for sun (low values), blue for shade (high values)
          // So INVERT: 1 - normalized
          normalized = 1 - normalized;
          
          // Color mapping: 0 (shade/blue) to 1 (sunny/red)
          const color = getColorForShadowValue(normalized);
          
          imageData.data[idx] = color.r;
          imageData.data[idx + 1] = color.g;
          imageData.data[idx + 2] = color.b;
          imageData.data[idx + 3] = color.a;
        }
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    // Convert canvas to data URL for Mapbox
    const dataUrl = canvas.toDataURL('image/png');
    
    console.log('Shadow image created:', {
      width: canvas.width,
      height: canvas.height,
      dataUrlLength: dataUrl.length,
      bounds
    });
    
    return {
      canvas,
      dataUrl,
      bounds,
      width: canvas.width,
      height: canvas.height,
      statistics: {
        min,
        max
      }
    };
  } catch (error) {
    console.error('Error loading shadow GeoTIFF:', error);
    throw error;
  }
}

/**
 * Get color for a normalized shadow value (0-1)
 * 0 = sunny (red), 1 = shaded (blue)
 * Uses a gradient from red -> yellow -> cyan -> blue
 */
function getColorForShadowValue(normalized) {
  // Simple, clear gradient: Blue (shade) -> Green -> Yellow -> Red (sunny)
  // normalized: 0 = full shade, 1 = full sun
  
  let r, g, b;
  
  if (normalized < 0.33) {
    // Deep shade: Blue to cyan (0 to 0.33)
    const t = normalized / 0.33;
    r = 0;
    g = Math.round(150 * t);
    b = 255;
  } else if (normalized < 0.66) {
    // Partial shade: Cyan to yellow (0.33 to 0.66)
    const t = (normalized - 0.33) / 0.33;
    r = Math.round(255 * t);
    g = Math.round(150 + 105 * t);
    b = Math.round(255 * (1 - t));
  } else {
    // Sunny: Yellow to red (0.66 to 1)
    const t = (normalized - 0.66) / 0.34;
    r = 255;
    g = Math.round(255 * (1 - t));
    b = 0;
  }
  
  return {
    r,
    g,
    b,
    a: 255
  };
}

/**
 * Alternative color schemes for shadow visualization
 */
export const COLOR_SCHEMES = {
  RED_BLUE: 'red_blue', // Default: red = sun, blue = shade
  HEAT: 'heat',         // Heat map style
  GRAYSCALE: 'grayscale' // Simple grayscale
};

/**
 * Get color for different schemes
 */
export function getColorForScheme(normalized, scheme = COLOR_SCHEMES.RED_BLUE) {
  let r, g, b;
  
  switch (scheme) {
    case COLOR_SCHEMES.HEAT:
      // Heat map: black -> red -> yellow -> white
      if (normalized < 0.33) {
        const t = normalized * 3;
        r = Math.round(255 * t);
        g = 0;
        b = 0;
      } else if (normalized < 0.66) {
        const t = (normalized - 0.33) * 3;
        r = 255;
        g = Math.round(255 * t);
        b = 0;
      } else {
        const t = (normalized - 0.66) * 3;
        r = 255;
        g = 255;
        b = Math.round(255 * t);
      }
      break;
      
    case COLOR_SCHEMES.GRAYSCALE:
      // Simple grayscale
      const gray = Math.round(255 * normalized);
      r = gray;
      g = gray;
      b = gray;
      break;
      
    default: // RED_BLUE
      if (normalized < 0.5) {
        const t = normalized * 2;
        r = Math.round(255 * (1 - t));
        g = Math.round(255 * t);
        b = Math.round(255 * t);
      } else {
        const t = (normalized - 0.5) * 2;
        r = 0;
        g = Math.round(255 * (1 - t));
        b = 255;
      }
  }
  
  return { r, g, b, a: 200 };
}

/**
 * Utility to check if shadow data is valid
 */
export function isShadowDataValid(shadowData) {
  return shadowData && 
         shadowData.downloadUrl && 
         shadowData.statistics &&
         typeof shadowData.statistics.shadow_coverage_pct === 'number';
}
