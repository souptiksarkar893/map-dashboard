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
          </div>
        </div>

        {/* Color Rules Section */}
        {activeDataSource && colorRules[activeDataSource] && (
          <div className="card">
            <div className="card-header">
              <div className="section-icon">🎨</div>
              <h3>Visualization</h3>
            </div>
            <div className="card-body">
              <div className="subsection">
                <h4>Color Rules</h4>
              
              <div className="form-group">
                <label className="form-label">Data Field</label>
                <select
                  className="form-control form-select"
                  value={colorRules[activeDataSource].field}
                  onChange={(e) => handleFieldChange(activeDataSource, e.target.value)}
                >
                  {dataSources.find(s => s.id === activeDataSource)?.fields.map(field => (
                    <option key={field} value={field}>
                      {getFieldLabel(field)} ({getFieldUnit(field)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="color-rules-list">
                {colorRules[activeDataSource].rules.map((rule, index) => (
                  <div key={index} className="color-rule-item">
                    <div className="rule-condition">
                      <select
                        className="form-control form-select rule-operator"
                        value={rule.operator}
                        onChange={(e) => handleRuleChange(activeDataSource, index, 'operator', e.target.value)}
                      >
                        <option value="<">Less than (&lt;)</option>
                        <option value="<=">Less than or equal (≤)</option>
                        <option value=">=">Greater than or equal (≥)</option>
                        <option value=">">Greater than (&gt;)</option>
                        <option value="=">Equal (=)</option>
                      </select>
                      
                      <input
                        type="number"
                        className="form-control rule-value"
                        value={rule.value}
                        onChange={(e) => handleRuleChange(activeDataSource, index, 'value', e.target.value)}
                        step="0.1"
                      />
                      
                      {rule.operator2 && (
                        <>
                          <span className="rule-and">AND</span>
                          <select
                            className="form-control form-select rule-operator"
                            value={rule.operator2}
                            onChange={(e) => handleRuleChange(activeDataSource, index, 'operator2', e.target.value)}
                          >
                            <option value="<">Less than (&lt;)</option>
                            <option value="<=">Less than or equal (≤)</option>
                            <option value=">=">Greater than or equal (≥)</option>
                            <option value=">">Greater than (&gt;)</option>
                          </select>
                          
                          <input
                            type="number"
                            className="form-control rule-value"
                            value={rule.value2}
                            onChange={(e) => handleRuleChange(activeDataSource, index, 'value2', e.target.value)}
                            step="0.1"
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
                      <span className="color-preview" style={{ backgroundColor: rule.color }}></span>
                    </div>
                    
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => removeRule(activeDataSource, index)}
                      title="Remove this rule"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => addRule(activeDataSource)}
                >
                  + Add Rule
                </button>
              </div>

              <div className="examples-section">
                <button
                  className="btn btn-link"
                  onClick={() => setShowExamples(!showExamples)}
                >
                  {showExamples ? '▼' : '▶'} Example Rules
                </button>
                
                {showExamples && (
                  <div className="examples-content">
                    <div className="alert alert-info">
                      <strong>Example Color Rules:</strong>
                      <ul>
                        <li>&lt; 10°C → Red (Cold)</li>
                        <li>≥ 10°C AND &lt; 25°C → Blue (Moderate)</li>
                        <li>≥ 25°C → Green (Warm)</li>
                      </ul>
                      <p>💡 Customize colors based on your data analysis needs!</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Polygons List Section */}
        <div className="card">
          <div className="card-header">
            <h3>Polygons ({polygons.length})</h3>
          </div>
          <div className="card-body">
            {polygons.length === 0 ? (
              <div className="empty-state">
                <p>No polygons created yet.</p>
                <small>Use the "Start Drawing" button on the map to create your first polygon!</small>
              </div>
            ) : (
              <div className="polygons-list">
                {polygons.map((polygon) => (
                  <div key={polygon.id} className="polygon-item">
                    <div className="polygon-info">
                      <strong>{polygon.name}</strong>
                      <small>Source: {polygon.dataSource}</small>
                      <small>Points: {polygon.coordinates?.length || 0}</small>
                    </div>
                    <div className="polygon-actions">
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => {
                          const newName = prompt('Enter new name:', polygon.name)
                          if (newName && newName.trim()) {
                            onPolygonEdit(polygon.id, { name: newName.trim() })
                          }
                        }}
                        title="Rename polygon"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => {
                          if (window.confirm(`Delete "${polygon.name}"?`)) {
                            onPolygonDelete(polygon.id)
                          }
                        }}
                        title="Delete polygon"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Help Section */}
        <div className="card">
          <div className="card-header">
            <h3>Quick Help</h3>
          </div>
          <div className="card-body">
            <div className="help-content">
              <div className="help-item">
                <strong>🗺️ Drawing Polygons:</strong>
                <p>Click "Start Drawing" then click on the map to add points (3-12 points).</p>
              </div>
              <div className="help-item">
                <strong>🎨 Color Rules:</strong>
                <p>Set thresholds to automatically color polygons based on data values.</p>
              </div>
              <div className="help-item">
                <strong>⏰ Timeline:</strong>
                <p>Use the slider to select specific times or ranges for data analysis.</p>
              </div>
              <div className="help-item">
                <strong>💾 Auto-Save:</strong>
                <p>Your polygons and settings are automatically saved locally.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
