import React, { useState, useEffect } from 'react'
import MapComponent from './components/MapComponent'
import TimelineSlider from './components/TimelineSlider'
import Sidebar from './components/Sidebar'
import WelcomeModal from './components/WelcomeModal'
import './App.css'

function App() {
  const [polygons, setPolygons] = useState([])
  const [selectedTime, setSelectedTime] = useState(new Date())
  const [timeRange, setTimeRange] = useState(null)
  const [dataSources] = useState([
    {
      id: 'openmeteo',
      name: 'Open-Meteo Weather',
      fields: ['temperature_2m', 'humidity_2m', 'precipitation'],
      active: true
    }
  ])
  const [colorRules, setColorRules] = useState({
    openmeteo: {
      field: 'temperature_2m',
      rules: [
        { operator: '<', value: 10, color: '#ff4444' },
        { operator: '>=', value: 10, operator2: '<', value2: 25, color: '#4444ff' },
        { operator: '>=', value: 25, color: '#44ff44' }
      ]
    }
  })
  const [showWelcome, setShowWelcome] = useState(() => {
    return !localStorage.getItem('dashboard-visited')
  })

  useEffect(() => {
    // Load saved state from localStorage
    const savedPolygons = localStorage.getItem('dashboard-polygons')
    const savedColorRules = localStorage.getItem('dashboard-color-rules')
    
    if (savedPolygons) {
      setPolygons(JSON.parse(savedPolygons))
    }
    if (savedColorRules) {
      setColorRules(JSON.parse(savedColorRules))
    }
  }, [])

  useEffect(() => {
    // Save state to localStorage
    localStorage.setItem('dashboard-polygons', JSON.stringify(polygons))
    localStorage.setItem('dashboard-color-rules', JSON.stringify(colorRules))
  }, [polygons, colorRules])

  const handlePolygonCreate = (polygon) => {
    const newPolygon = {
      ...polygon,
      id: Date.now().toString(),
      dataSource: 'openmeteo',
      name: `Polygon ${polygons.length + 1}`,
      data: null
    }
    setPolygons([...polygons, newPolygon])
  }

  const handlePolygonDelete = (polygonId) => {
    setPolygons(polygons.filter(p => p.id !== polygonId))
  }

  const handlePolygonEdit = (polygonId, updates) => {
    setPolygons(polygons.map(p => 
      p.id === polygonId ? { ...p, ...updates } : p
    ))
  }

  const handleTimeChange = (time) => {
    setSelectedTime(time)
    setTimeRange(null)
  }

  const handleTimeRangeChange = (range) => {
    setTimeRange(range)
    setSelectedTime(null)
  }

  const handleColorRuleChange = (dataSourceId, rules) => {
    setColorRules({
      ...colorRules,
      [dataSourceId]: rules
    })
  }

  const closeWelcome = () => {
    setShowWelcome(false)
    localStorage.setItem('dashboard-visited', 'true')
  }

  return (
    <div className="app">
      {showWelcome && <WelcomeModal onClose={closeWelcome} />}
      
      <div className="app-body">
        <Sidebar
          dataSources={dataSources}
          colorRules={colorRules}
          polygons={polygons}
          onColorRuleChange={handleColorRuleChange}
          onPolygonEdit={handlePolygonEdit}
          onPolygonDelete={handlePolygonDelete}
        />
        
        <div className="main-content">
          <div className="timeline-header">
            <div className="timeline-controls-wrapper">
              <TimelineSlider
                selectedTime={selectedTime}
                timeRange={timeRange}
                onTimeChange={handleTimeChange}
                onTimeRangeChange={handleTimeRangeChange}
              />
            </div>
          </div>
          
          <div className="map-container">
            <MapComponent
              polygons={polygons}
              selectedTime={selectedTime}
              timeRange={timeRange}
              colorRules={colorRules}
              onPolygonCreate={handlePolygonCreate}
              onPolygonEdit={handlePolygonEdit}
              onPolygonDelete={handlePolygonDelete}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
