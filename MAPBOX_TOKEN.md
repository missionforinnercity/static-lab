# Mapbox Configuration

To use this dashboard, you need a Mapbox access token.

## Getting a Mapbox Token

1. Go to https://account.mapbox.com/
2. Sign up for a free account (or log in)
3. Go to your Account page
4. Create a new access token or copy your default public token

## Setting Up Your Token

Open `src/components/Map.jsx` and replace the placeholder:

```javascript
// Replace this line:
mapboxgl.accessToken = 'YOUR_MAPBOX_ACCESS_TOKEN'

// With your actual token:
mapboxgl.accessToken = 'pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6InlvdXJ0b2tlbiJ9.example'
```

The free tier includes:
- 50,000 map loads per month
- 100,000 requests to other APIs
- Perfect for development and small projects
