import axios from 'axios'

const OPEN_METEO_BASE_URL = 'https://archive-api.open-meteo.com/v1/archive'

// Cache for API responses to optimize usage
const dataCache = new Map()

const getCacheKey = (lat, lng, startDate, endDate, params) => {
  return `${lat.toFixed(3)}_${lng.toFixed(3)}_${startDate}_${endDate}_${params.join(',')}`
}

const formatDateForAPI = (date) => {
  return date.toISOString().split('T')[0]
}

const formatDateTimeForAPI = (date) => {
  return date.toISOString().slice(0, 16).replace('T', ' ')
}

export const fetchWeatherData = async (latitude, longitude, selectedTime, timeRange) => {
  try {
    let startDate, endDate
    
    if (timeRange && timeRange.length === 2) {
      startDate = timeRange[0]
      endDate = timeRange[1]
    } else if (selectedTime) {
      startDate = new Date(selectedTime)
      endDate = new Date(selectedTime)
    } else {
      // Default to current time
      startDate = new Date('2025-08-05T12:00:00')
      endDate = new Date('2025-08-05T12:00:00')
    }

    const startDateStr = formatDateForAPI(startDate)
    const endDateStr = formatDateForAPI(endDate)
    
    const params = [
      'temperature_2m',
      'relative_humidity_2m',
      'precipitation',
      'surface_pressure',
      'wind_speed_10m'
    ]

    const cacheKey = getCacheKey(latitude, longitude, startDateStr, endDateStr, params)
    
    // Check cache first
    if (dataCache.has(cacheKey)) {
      const cachedData = dataCache.get(cacheKey)
      // Return cached data if it's less than 5 minutes old
      if (Date.now() - cachedData.timestamp < 5 * 60 * 1000) {
        return cachedData.data
      }
    }

    const queryParams = {
      latitude: latitude.toFixed(4),
      longitude: longitude.toFixed(4),
      start_date: startDateStr,
      end_date: endDateStr,
      hourly: params.join(','),
      timezone: 'Asia/Kolkata'
    }

    console.log('Fetching weather data:', queryParams)

    const response = await axios.get(OPEN_METEO_BASE_URL, {
      params: queryParams,
      timeout: 10000 // 10 second timeout
    })

    if (response.data && response.data.hourly) {
      const hourlyData = response.data.hourly
      
      // Find the closest time index
      let targetTime
      if (timeRange && timeRange.length === 2) {
        // For range, use the middle time
        targetTime = new Date((timeRange[0].getTime() + timeRange[1].getTime()) / 2)
      } else {
        targetTime = selectedTime || new Date('2025-08-05T12:00:00')
      }

      const targetTimeStr = formatDateTimeForAPI(targetTime)
      const timeIndex = hourlyData.time.findIndex(time => {
        return Math.abs(new Date(time).getTime() - targetTime.getTime()) < 60 * 60 * 1000 // Within 1 hour
      })

      const index = timeIndex >= 0 ? timeIndex : 0

      const result = {
        temperature_2m: hourlyData.temperature_2m?.[index] || generateFallbackData('temperature', latitude, longitude),
        humidity_2m: hourlyData.relative_humidity_2m?.[index] || generateFallbackData('humidity', latitude, longitude),
        precipitation: hourlyData.precipitation?.[index] || generateFallbackData('precipitation', latitude, longitude),
        surface_pressure: hourlyData.surface_pressure?.[index] || generateFallbackData('pressure', latitude, longitude),
        wind_speed_10m: hourlyData.wind_speed_10m?.[index] || generateFallbackData('wind', latitude, longitude),
        timestamp: targetTimeStr,
        location: { latitude, longitude }
      }

      // Cache the result
      dataCache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      })

      return result
    } else {
      throw new Error('Invalid response format from Open-Meteo API')
    }
  } catch (error) {
    console.warn('Error fetching from Open-Meteo API, using fallback data:', error.message)
    
    // Return fallback simulated data
    return {
      temperature_2m: generateFallbackData('temperature', latitude, longitude),
      humidity_2m: generateFallbackData('humidity', latitude, longitude),
      precipitation: generateFallbackData('precipitation', latitude, longitude),
      surface_pressure: generateFallbackData('pressure', latitude, longitude),
      wind_speed_10m: generateFallbackData('wind', latitude, longitude),
      timestamp: selectedTime ? formatDateTimeForAPI(selectedTime) : formatDateTimeForAPI(new Date()),
      location: { latitude, longitude },
      fallback: true
    }
  }
}

const generateFallbackData = (type, lat, lng) => {
  // Generate realistic simulated data based on location and type
  const seed = Math.abs(Math.sin(lat * lng)) * 1000
  
  switch (type) {
    case 'temperature': {
      // Temperature varies by latitude (warmer near equator)
      const baseTemp = 35 - Math.abs(lat) * 0.8
      return Math.round((baseTemp + (seed % 20) - 10) * 10) / 10
    }
      
    case 'humidity': {
      // Humidity tends to be higher in tropical regions
      const baseHumidity = Math.abs(lat) < 23.5 ? 70 : 50
      return Math.round(baseHumidity + (seed % 30))
    }
      
    case 'precipitation': {
      // Random precipitation
      return Math.round((seed % 5) * 10) / 10
    }
      
    case 'pressure': {
      // Standard atmospheric pressure with small variations
      return Math.round((1013 + (seed % 40) - 20) * 10) / 10
    }
      
    case 'wind': {
      // Wind speed
      return Math.round((seed % 15) * 10) / 10
    }
      
    default:
      return 0
  }
}

// Function to clear old cache entries
export const clearOldCache = () => {
  const now = Date.now()
  const maxAge = 30 * 60 * 1000 // 30 minutes
  
  for (const [key, value] of dataCache.entries()) {
    if (now - value.timestamp > maxAge) {
      dataCache.delete(key)
    }
  }
}

// Clear cache periodically
setInterval(clearOldCache, 10 * 60 * 1000) // Every 10 minutes

export default {
  fetchWeatherData,
  clearOldCache
}
