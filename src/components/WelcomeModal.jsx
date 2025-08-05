import React from 'react'
import './WelcomeModal.css'

const WelcomeModal = ({ onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Welcome to Interactive Map Dashboard!</h2>
          <button className="modal-close" onClick={onClose} title="Close">✕</button>
        </div>
        
        <div className="modal-body">
          <div className="welcome-intro">
            <p>
              This dashboard helps you visualize dynamic weather data on an interactive map 
              with powerful polygon drawing and timeline features.
            </p>
          </div>

          <div className="tutorial-steps">
            <h3>Quick Tutorial:</h3>
            
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h4>🗺️ Draw Polygons</h4>
                <p>Click "Start Drawing" button and then click on the map to create polygons (3-12 points).</p>
              </div>
            </div>

            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h4>📊 Select Data Source</h4>
                <p>Choose from weather data sources and configure color rules in the sidebar.</p>
              </div>
            </div>

            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h4>⏰ Adjust Timeline</h4>
                <p>Use the timeline slider to select specific times or ranges to see data changes.</p>
              </div>
            </div>

            <div className="step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h4>🎨 Visualize Data</h4>
                <p>Watch polygons change colors based on real-time weather data and your rules!</p>
              </div>
            </div>
          </div>

          <div className="features-grid">
            <div className="feature">
              <div className="feature-icon">🌡️</div>
              <h4>Real Weather Data</h4>
              <p>Live data from Open-Meteo API</p>
            </div>
            
            <div className="feature">
              <div className="feature-icon">🎯</div>
              <h4>Precise Control</h4>
              <p>Hourly resolution, 30-day window</p>
            </div>
            
            <div className="feature">
              <div className="feature-icon">💾</div>
              <h4>Auto-Save</h4>
              <p>Your work is saved automatically</p>
            </div>
            
            <div className="feature">
              <div className="feature-icon">📱</div>
              <h4>Mobile Friendly</h4>
              <p>Works on desktop and mobile</p>
            </div>
          </div>

          <div className="tips-section">
            <h3>💡 Pro Tips:</h3>
            <ul>
              <li>Use the <strong>Reset View</strong> button to return to the initial map position</li>
              <li>Set up <strong>color rules</strong> to automatically visualize data thresholds</li>
              <li>Try both <strong>single time</strong> and <strong>time range</strong> modes in the timeline</li>
              <li>Hover over polygons to see detailed data values</li>
              <li>Use the sidebar to manage and rename your polygons</li>
            </ul>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-primary btn-large" onClick={onClose}>
            🚀 Get Started
          </button>
          <p className="footer-note">
            This tutorial won't show again. You can find help in the sidebar anytime!
          </p>
        </div>
      </div>
    </div>
  )
}

export default WelcomeModal
