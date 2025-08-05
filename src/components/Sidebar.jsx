import React, { useState } from 'react'
import './Sidebar.css'

const Sidebar = ({ 
  dataSources, 
  colorRules, 
  polygons, 
  onColorRuleChange, 
  onPolygonEdit, 
  onPolygonDelete 
}) => {
  const [activeDataSource, setActiveDataSource] = useState('openmeteo')
  const [showExamples, setShowExamples] = useState(false)

  const handleFieldChange = (dataSourceId, field) => {
    const currentRules = colorRules[dataSourceId]
    onColorRuleChange(dataSourceId, {
      ...currentRules,
      field: field
    })
  }

  const handleRuleChange = (dataSourceId, ruleIndex, property, value) => {
    const currentRules = colorRules[dataSourceId]
    const updatedRules = [...currentRules.rules]
    updatedRules[ruleIndex] = {
      ...updatedRules[ruleIndex],
      [property]: property === 'value' || property === 'value2' ? parseFloat(value) || 0 : value
    }
    
    onColorRuleChange(dataSourceId, {
      ...currentRules,
      rules: updatedRules
    })
  }

  const addRule = (dataSourceId) => {
    const currentRules = colorRules[dataSourceId]
    const newRule = {
      operator: '>=',
      value: 0,
      color: '#95a5a6'
    }
    
    onColorRuleChange(dataSourceId, {
      ...currentRules,
      rules: [...currentRules.rules, newRule]
    })
  }

  const removeRule = (dataSourceId, ruleIndex) => {
    const currentRules = colorRules[dataSourceId]
    const updatedRules = currentRules.rules.filter((_, index) => index !== ruleIndex)
    
    onColorRuleChange(dataSourceId, {
      ...currentRules,
      rules: updatedRules
    })
  }

  const getFieldUnit = (field) => {
    switch (field) {
      case 'temperature_2m': return '°C'
      case 'humidity_2m': return '%'
      case 'precipitation': return 'mm'
      case 'surface_pressure': return 'hPa'
      case 'wind_speed_10m': return 'm/s'
      default: return ''
    }
  }

  const getFieldLabel = (field) => {
    switch (field) {
      case 'temperature_2m': return 'Temperature'
      case 'humidity_2m': return 'Humidity'
      case 'precipitation': return 'Precipitation'
      case 'surface_pressure': return 'Surface Pressure'
      case 'wind_speed_10m': return 'Wind Speed'
      default: return field
    }
  }

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="header-content">
          <div className="header-icon">⚙️</div>
          <div className="header-text">
            <h2>Dashboard Controls</h2>
            <p>Manage your data visualization settings and areas</p>
          </div>
        </div>
      </div>

      <div className="sidebar-content">
        {/* Data Sources Section */}
        <div className="card">
          <div className="card-header">
            <div className="section-icon">🟢</div>
            <h3>Data Source</h3>
          </div>
          <div className="card-body">
            {dataSources.map(source => (
              <div 
                key={source.id} 
                className={`data-source-item ${activeDataSource === source.id ? 'active' : ''}`}
                onClick={() => setActiveDataSource(source.id)}
              >
                <div className="source-info">
                  <div className="source-title">
                    <strong>{source.name}</strong>
                    <span className="source-badge">Real-time weather data</span>
                  </div>
                  <div className="source-status">
                    <span className="status-indicator connected">●</span>
                    <small>Status: Connected</small>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Visualization Section */}
        <div className="card">
          <div className="card-header">
            <div className="section-icon">🎨</div>
            <h3>Visualization</h3>
          </div>
          <div className="card-body">
            <div className="subsection">
              <h4>Color Rules for {activeDataSource && dataSources.find(s => s.id === activeDataSource)?.name}</h4>
              
              {activeDataSource && colorRules[activeDataSource] && (
                <>
                  <div className="form-group">
                    <label className="form-label">Data Field</label>
                    <select 
                      className="form-control form-select"
                      value={colorRules[activeDataSource].field}
                      onChange={(e) => handleFieldChange(activeDataSource, e.target.value)}
                    >
                      {dataSources.find(s => s.id === activeDataSource)?.fields.map(field => (
                        <option key={field} value={field}>
                          {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="color-rules-list">
                    {colorRules[activeDataSource].rules.map((rule, index) => (
                      <div key={index} className="color-rule-item">
                        <div className="rule-condition">
                          <select 
                            className="form-control rule-operator"
                            value={rule.operator}
                            onChange={(e) => handleRuleChange(activeDataSource, index, 'operator', e.target.value)}
                          >
                            <option value="<">Less than</option>
                            <option value="<=">Less than or equal</option>
                            <option value=">=">Greater than or equal</option>
                            <option value=">">Greater than</option>
                          </select>
                          
                          <input 
                            type="number"
                            className="form-control rule-value"
                            value={rule.value}
                            onChange={(e) => handleRuleChange(activeDataSource, index, 'value', e.target.value)}
                          />

                          {rule.operator2 && (
                            <>
                              <span className="rule-and">AND</span>
                              <select 
                                className="form-control rule-operator"
                                value={rule.operator2}
                                onChange={(e) => handleRuleChange(activeDataSource, index, 'operator2', e.target.value)}
                              >
                                <option value="<">Less than</option>
                                <option value="<=">Less than or equal</option>
                                <option value=">=">Greater than or equal</option>
                                <option value=">">Greater than</option>
                              </select>
                              
                              <input 
                                type="number"
                                className="form-control rule-value"
                                value={rule.value2}
                                onChange={(e) => handleRuleChange(activeDataSource, index, 'value2', e.target.value)}
                              />
                            </>
                          )}
                        </div>
                        
                        <div className="rule-color">
                          <input 
                            type="color"
                            className="color-picker"
                            value={rule.color}
                            onChange={(e) => handleRuleChange(activeDataSource, index, 'color', e.target.value)}
                          />
                          <button 
                            className="btn btn-link remove-btn"
                            onClick={() => removeRule(activeDataSource, index)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <button 
                    className="btn btn-primary btn-sm add-rule-btn"
                    onClick={() => addRule(activeDataSource)}
                  >
                    Add Rule
                  </button>

                  <div className="examples-section">
                    <button 
                      className="btn btn-link"
                      onClick={() => setShowExamples(!showExamples)}
                    >
                      {showExamples ? 'Hide' : 'Show'} Examples
                    </button>
                    
                    {showExamples && (
                      <div className="examples-content">
                        <p><strong>Temperature Examples:</strong></p>
                        <ul>
                          <li>&lt; 10°C = Cold (Blue)</li>
                          <li>10-25°C = Moderate (Green)</li>
                          <li>&gt; 25°C = Hot (Red)</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Drawn Areas Section */}
        <div className="card">
          <div className="card-header">
            <div className="section-icon">📍</div>
            <h3>Drawn Areas ({polygons.length})</h3>
          </div>
          <div className="card-body">
            {polygons.length > 0 ? (
              <div className="polygons-list">
                {polygons.map(polygon => (
                  <div key={polygon.id} className="polygon-item">
                    <div className="polygon-info">
                      <strong>{polygon.name}</strong>
                      <small>Data Source: {polygon.dataSource}</small>
                      <small>Points: {polygon.coordinates.length}</small>
                      {polygon.data && (
                        <small>
                          Avg Temp: {polygon.data.temperature_2m?.toFixed(1)}°C
                        </small>
                      )}
                    </div>
                    <div className="polygon-actions">
                      <button 
                        className="btn btn-link btn-sm"
                        onClick={() => onPolygonEdit(polygon.id, { 
                          name: prompt('Enter new name:', polygon.name) || polygon.name 
                        })}
                      >
                        Rename
                      </button>
                      <button 
                        className="btn btn-link btn-sm remove-btn"
                        onClick={() => onPolygonDelete(polygon.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No areas drawn yet</p>
                <small>Use the drawing tool on the map to create areas for data visualization</small>
              </div>
            )}
          </div>
        </div>

        {/* Help Section */}
        <div className="card">
          <div className="card-header">
            <div className="section-icon">❓</div>
            <h3>Quick Guide</h3>
          </div>
          <div className="card-body">
            <div className="help-content">
              <div className="help-item">
                <strong>Drawing Areas:</strong>
                <p>Click the drawing tool on the map, then click to place points. Double-click to finish.</p>
              </div>
              <div className="help-item">
                <strong>Timeline Control:</strong>
                <p>Use the slider to explore data at different times. Switch between single time and range modes.</p>
              </div>
              <div className="help-item">
                <strong>Color Rules:</strong>
                <p>Set thresholds to automatically color your areas based on data values.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
