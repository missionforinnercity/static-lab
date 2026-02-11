// Simplify the massive POI file by removing unnecessary properties
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const inputFile = path.join(__dirname, '../data/processed/business/POI_enriched_20260120_185944.geojson')
const outputFile = path.join(__dirname, '../data/processed/business/POI_simplified.geojson')

console.log('Reading POI data...')
const data = JSON.parse(fs.readFileSync(inputFile, 'utf8'))

console.log(`Original features: ${data.features.length}`)
console.log(`Original file size: ${(fs.statSync(inputFile).size / 1024 / 1024).toFixed(2)} MB`)

// Keep only essential properties
const simplified = {
  type: 'FeatureCollection',
  features: data.features.map(feature => ({
    type: 'Feature',
    geometry: feature.geometry,
    properties: {
      name: feature.properties.name || feature.properties.displayName,
      primaryType: feature.properties.primaryType,
      primaryTypeDisplayName: feature.properties.primaryTypeDisplayName,
      rating: feature.properties.rating,
      userRatingCount: feature.properties.userRatingCount,
      outdoorSeating: feature.properties.outdoorSeating,
      editorialSummary: typeof feature.properties.editorialSummary === 'string' 
        ? feature.properties.editorialSummary.slice(0, 150) 
        : feature.properties.editorialSummary
    }
  }))
}

console.log('Writing simplified data...')
fs.writeFileSync(outputFile, JSON.stringify(simplified))

const newSize = fs.statSync(outputFile).size
console.log(`New file size: ${(newSize / 1024 / 1024).toFixed(2)} MB`)
console.log(`Reduction: ${((1 - newSize / fs.statSync(inputFile).size) * 100).toFixed(1)}%`)
console.log(`✅ Simplified POI saved to: ${outputFile}`)
