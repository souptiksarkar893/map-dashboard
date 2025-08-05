import React, { useState, useRef, useEffect } from 'react'
import { MapContainer, TileLayer, Polygon, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './MapComponent.css'
import { fetchWeatherData } from '../utils/api'

// Fix leaflet default markers
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const DrawingComponent = ({ onPolygonCreate, isDrawing, setIsDrawing }) => {
  const [currentPoints, setCurrentPoints] = useState([])

  useMapEvents({
    click: (e) => {
      if (!isDrawing) return
      
      // Check if the click originated from a button or control element
      if (e.originalEvent && (
        e.originalEvent.target.tagName === 'BUTTON' ||
        e.originalEvent.target.closest('.drawing-controls') ||
        e.originalEvent.target.closest('button')
      )) {
        return
      }

      const newPoint = [e.latlng.lat, e.latlng.lng]
      const updatedPoints = [...currentPoints, newPoint]
      
      if (updatedPoints.length >= 3 && updatedPoints.length <= 12) {
        setCurrentPoints(updatedPoints)
      } else if (updatedPoints.length > 12) {
        alert('Maximum 12 points allowed for a polygon')
        return
      } else {
        setCurrentPoints(updatedPoints)
      }
    }
  })

  const finishDrawing = () => {
    console.log('Finish drawing called with', currentPoints.length, 'points')
    
    if (currentPoints.length >= 3) {
      console.log('Creating polygon with points:', currentPoints)
      onPolygonCreate({
        coordinates: currentPoints,
        bounds: L.polygon(currentPoints).getBounds()
      })
      setCurrentPoints([])
      setIsDrawing(false)
    } else {
      alert('Please add at least 3 points to create a polygon')
    }
  }

  const cancelDrawing = () => {
    console.log('Cancel drawing called')
    setCurrentPoints([])
    setIsDrawing(false)
  }

  if (isDrawing && currentPoints.length > 0) {
    return (
      <>
        <Polygon
          positions={currentPoints}
          pathOptions={{
            color: '#e74c3c',
            fillColor: '#e74c3c',
            fillOpacity: 0.3,
            weight: 2,
            dashArray: '5, 5'
          }}
        />
        {currentPoints.length >= 3 && (
          <div className="drawing-controls">
            <button
              className="btn btn-success"
              onClick={finishDrawing}
              title="Finish drawing polygon"
            >
              ✓ Finish Polygon ({currentPoints.length} points)
            </button>
            <button
              className="btn btn-danger"
              onClick={cancelDrawing}
              title="Cancel drawing"
            >
              ✕ Cancel
            </button>
          </div>
        )}
      </>
    )
  }

  return null
}

const MapResetButton = () => {
  const map = useMap()
  
  const resetView = () => {
    map.setView([20.5937, 78.9629], 5) // Center of India
  }

  return (
    <div className="map-controls">
      <button
        className="btn btn-secondary map-reset-btn"
        onClick={resetView}
        title="Reset map to initial view"
      >
        🏠 Reset View
      </button>
    </div>
  )
}

const PolygonRenderer = ({ polygon, colorRules, selectedTime, timeRange, onEdit, onDelete }) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [color, setColor] = useState('#95a5a6')

  useEffect(() => {
    const fetchData = async () => {
      if (!polygon.coordinates || polygon.coordinates.length === 0) return

      setLoading(true)
      try {
        // Calculate centroid for API call
        const lats = polygon.coordinates.map(coord => coord[0])
        const lngs = polygon.coordinates.map(coord => coord[1])
        const centerLat = lats.reduce((a, b) => a + b) / lats.length
        const centerLng = lngs.reduce((a, b) => a + b) / lngs.length

        const weatherData = await fetchWeatherData(centerLat, centerLng, selectedTime, timeRange)
        setData(weatherData)

        // Apply color rules
        if (weatherData && colorRules[polygon.dataSource]) {
          const rules = colorRules[polygon.dataSource]
          const fieldValue = weatherData[rules.field]
          
          if (fieldValue !== undefined) {
            const matchedRule = rules.rules.find(rule => {
              if (rule.operator2) {
                // Range rule (e.g., >= 10 and < 25)
                return evaluateCondition(fieldValue, rule.operator, rule.value) &&
                       evaluateCondition(fieldValue, rule.operator2, rule.value2)
              } else {
                // Single condition rule
                return evaluateCondition(fieldValue, rule.operator, rule.value)
              }
            })
            
            if (matchedRule) {
              setColor(matchedRule.color)
            }
          }
        }
      } catch (error) {
        console.error('Error fetching weather data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [polygon, selectedTime, timeRange, colorRules])

  const evaluateCondition = (value, operator, threshold) => {
    switch (operator) {
      case '<': return value < threshold
      case '<=': return value <= threshold
      case '>': return value > threshold
      case '>=': return value >= threshold
      case '=': return value === threshold
      default: return false
    }
  }

  const handleEdit = () => {
    const newName = prompt('Enter new name for polygon:', polygon.name)
    if (newName && newName.trim()) {
      onEdit(polygon.id, { name: newName.trim() })
    }
  }

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${polygon.name}"?`)) {
      onDelete(polygon.id)
    }
  }

  const getDisplayValue = () => {
    if (loading) return 'Loading...'
    if (!data) return 'No data'
    
    const rules = colorRules[polygon.dataSource]
    if (rules && data[rules.field] !== undefined) {
      const unit = rules.field === 'temperature_2m' ? '°C' : 
                   rules.field === 'humidity_2m' ? '%' : 
                   rules.field === 'precipitation' ? 'mm' : ''
      return `${data[rules.field]}${unit}`
    }
    return 'No data'
  }

  return (
    <Polygon
      positions={polygon.coordinates}
      pathOptions={{
        color: color,
        fillColor: color,
        fillOpacity: 0.6,
        weight: 2
      }}
      eventHandlers={{
        mouseover: (e) => {
          e.target.setStyle({ weight: 4 })
        },
        mouseout: (e) => {
          e.target.setStyle({ weight: 2 })
        }
      }}
    >
      <div className="polygon-popup">
        <div className="popup-header">
          <h4>{polygon.name}</h4>
          <div className="popup-actions">
            <button
              className="btn-icon"
              onClick={handleEdit}
              title="Edit polygon name"
            >
              ✏️
            </button>
            <button
              className="btn-icon"
              onClick={handleDelete}
              title="Delete polygon"
            >
              🗑️
            </button>
          </div>
        </div>
        <div className="popup-data">
          <strong>Value:</strong> {getDisplayValue()}
        </div>
        <div className="popup-source">
          <small>Source: {polygon.dataSource}</small>
        </div>
      </div>
    </Polygon>
  )
}

const MapComponent = ({ 
  polygons, 
  selectedTime, 
  timeRange, 
  colorRules, 
  onPolygonCreate, 
  onPolygonEdit, 
  onPolygonDelete 
}) => {
  const [isDrawing, setIsDrawing] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)
  const mapRef = useRef()
  const instructionTimerRef = useRef()

  // Auto-dismiss instructions after 5 seconds
  useEffect(() => {
    if (isDrawing && showInstructions) {
      instructionTimerRef.current = setTimeout(() => {
        setShowInstructions(false)
      }, 5000) // 5 seconds
    }
    
    return () => {
      if (instructionTimerRef.current) {
        clearTimeout(instructionTimerRef.current)
      }
    }
  }, [isDrawing, showInstructions])

  const startDrawing = () => {
    setIsDrawing(true)
    setShowInstructions(true)
  }

  const closeInstructions = () => {
    setShowInstructions(false)
    if (instructionTimerRef.current) {
      clearTimeout(instructionTimerRef.current)
    }
  }

  return (
    <div className="map-component">
      <div className="map-toolbar">
        <button
          className={`btn ${isDrawing ? 'btn-danger' : 'btn-primary'}`}
          onClick={startDrawing}
          disabled={isDrawing}
          title={isDrawing ? 'Drawing in progress...' : 'Click to start drawing a polygon'}
        >
          {isDrawing ? '✏️ Drawing...' : '📐 Draw Area'}
        </button>
      </div>

      <div className="leaflet-container">
        <MapContainer
          center={[20.5937, 78.9629]} // Center of India
          zoom={5}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapResetButton />
          
          <DrawingComponent
            onPolygonCreate={onPolygonCreate}
            isDrawing={isDrawing}
            setIsDrawing={setIsDrawing}
          />
          
          {polygons.map((polygon) => (
            <PolygonRenderer
              key={polygon.id}
              polygon={polygon}
              colorRules={colorRules}
              selectedTime={selectedTime}
              timeRange={timeRange}
              onEdit={onPolygonEdit}
              onDelete={onPolygonDelete}
            />
          ))}
        </MapContainer>
      </div>

      {isDrawing && showInstructions && (
        <div className="drawing-instructions">
          <div className="alert alert-info">
            <button 
              className="close-btn"
              onClick={closeInstructions}
              title="Close instructions"
            >
              ✕
            </button>
            <strong>Drawing Mode Active</strong><br />
            Click on the map to add points (3-12 points required).<br />
            Right-click or use the finish button when ready.
          </div>
        </div>
      )}
    </div>
  )
}

export default MapComponent
