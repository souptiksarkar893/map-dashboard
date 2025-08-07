import React, { useState } from "react";
import "./Sidebar.css";

const Sidebar = ({
  dataSources,
  colorRules,
  polygons,
  onColorRuleChange,
  onPolygonEdit,
  onPolygonDelete,
}) => {
  const [activeDataSource, setActiveDataSource] = useState("openmeteo");
  const [showExamples, setShowExamples] = useState(false);

  const handleFieldChange = (dataSourceId, field) => {
    const currentRules = colorRules[dataSourceId];
    onColorRuleChange(dataSourceId, {
      ...currentRules,
      field: field,
    });
  };

  const handleRuleChange = (dataSourceId, ruleIndex, property, value) => {
    const currentRules = colorRules[dataSourceId];
    const updatedRules = [...currentRules.rules];
    updatedRules[ruleIndex] = {
      ...updatedRules[ruleIndex],
      [property]:
        property === "value" || property === "value2"
          ? parseFloat(value) || 0
          : value,
    };

    onColorRuleChange(dataSourceId, {
      ...currentRules,
      rules: updatedRules,
    });
  };

  const addRule = (dataSourceId) => {
    const currentRules = colorRules[dataSourceId];
    const newRule = {
      operator: ">=",
      value: 0,
      color: "#95a5a6",
    };

    onColorRuleChange(dataSourceId, {
      ...currentRules,
      rules: [...currentRules.rules, newRule],
    });
  };

  const removeRule = (dataSourceId, ruleIndex) => {
    const currentRules = colorRules[dataSourceId];
    const updatedRules = currentRules.rules.filter(
      (_, index) => index !== ruleIndex
    );

    onColorRuleChange(dataSourceId, {
      ...currentRules,
      rules: updatedRules,
    });
  };

  const getFieldUnit = (field) => {
    switch (field) {
      case "temperature_2m":
        return "°C";
      case "humidity_2m":
        return "%";
      case "precipitation":
        return "mm";
      case "surface_pressure":
        return "hPa";
      case "wind_speed_10m":
        return "m/s";
      default:
        return "";
    }
  };

  const getFieldLabel = (field) => {
    switch (field) {
      case "temperature_2m":
        return "Temperature";
      case "humidity_2m":
        return "Humidity";
      case "precipitation":
        return "Precipitation";
      case "surface_pressure":
        return "Surface Pressure";
      case "wind_speed_10m":
        return "Wind Speed";
      default:
        return field;
    }
  };

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
            {dataSources.map((source) => (
              <div
                key={source.id}
                className={`data-source-item ${
                  activeDataSource === source.id ? "active" : ""
                }`}
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
              <h4>Color Rules</h4>

              {activeDataSource && colorRules[activeDataSource] && (
                <>
                  <div className="form-group">
                    <label className="form-label">Operator</label>
                    <select className="form-control form-select">
                      <option>Less than</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Threshold (°C)</label>
                    <input
                      type="number"
                      className="form-control"
                      defaultValue="10"
                    />
                  </div>

                  <div className="color-rule-preview">
                    <div className="color-squares">
                      <div className="color-square blue"></div>
                      <div className="color-square blue"></div>
                    </div>
                    <button className="btn btn-link remove-btn">Remove</button>
                  </div>

                  <button className="btn btn-primary btn-sm add-rule-btn">
                    Add Rule
                  </button>
                </>
              )}
            </div>

            <div className="quick-guide">
              <h4>Quick Guide:</h4>
              <ul>
                <li>Click "Draw Area" to start drawing</li>
                <li>Click 3-12 points on the map</li>
                <li>Use timeline to explore different times</li>
                <li>Colors update automatically</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
