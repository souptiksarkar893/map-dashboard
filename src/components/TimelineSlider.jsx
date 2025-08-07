import React, { useState, useEffect, useMemo } from 'react'
import { Range } from 'react-range'
import './TimelineSlider.css'

const TimelineSlider = ({ onTimeChange, onTimeRangeChange }) => {
  const [isRangeMode, setIsRangeMode] = useState(false)
  const [timeValues, setTimeValues] = useState([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [animationSpeed, setAnimationSpeed] = useState(1000) // milliseconds between steps
  
  // Create time window: 15 days before and after current date
  const baseDate = useMemo(() => {
    const now = new Date()
    // Set to current date at midnight
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
  }, [])
  const startDate = useMemo(() => {
    const date = new Date(baseDate)
    date.setDate(date.getDate() - 15)
    return date
  }, [baseDate])
  const endDate = useMemo(() => {
    const date = new Date(baseDate)
    date.setDate(date.getDate() + 15)
    return date
  }, [baseDate])
  
  // Generate hourly timestamps
  const timeStamps = useMemo(() => {
    const stamps = []
    for (let d = new Date(startDate); d <= endDate; d.setHours(d.getHours() + 1)) {
      stamps.push(new Date(d))
    }
    return stamps
  }, [startDate, endDate])
  
  const minTime = 0
  const maxTime = timeStamps.length - 1
  const currentTimeIndex = useMemo(() => 
    timeStamps.findIndex(t => 
      Math.abs(t - baseDate) < 60 * 60 * 1000 // Within 1 hour of base date
    ), [timeStamps, baseDate])

  useEffect(() => {
    if (isRangeMode) {
      setTimeValues([Math.max(0, currentTimeIndex - 24), Math.min(maxTime, currentTimeIndex + 24)])
    } else {
      setTimeValues([currentTimeIndex])
    }
  }, [isRangeMode, currentTimeIndex, maxTime])

  useEffect(() => {
    if (timeValues.length > 0) {
      if (isRangeMode && timeValues.length === 2) {
        const startTime = timeStamps[timeValues[0]]
        const endTime = timeStamps[timeValues[1]]
        onTimeRangeChange([startTime, endTime])
      } else if (!isRangeMode && timeValues.length === 1) {
        const time = timeStamps[timeValues[0]]
        onTimeChange(time)
      }
    }
  }, [timeValues, isRangeMode, timeStamps, onTimeChange, onTimeRangeChange])

  // Animation effect
  useEffect(() => {
    let interval = null
    if (isPlaying) {
      interval = setInterval(() => {
        setTimeValues(prevValues => {
          if (isRangeMode && prevValues.length === 2) {
            const [start, end] = prevValues
            const range = end - start
            const newStart = start + 1
            const newEnd = end + 1
            
            // If we reach the end, loop back to the beginning
            if (newEnd >= maxTime) {
              return [0, range]
            }
            return [newStart, newEnd]
          } else if (!isRangeMode && prevValues.length === 1) {
            const current = prevValues[0]
            // If we reach the end, loop back to the beginning
            if (current >= maxTime) {
              return [0]
            }
            return [current + 1]
          }
          return prevValues
        })
      }, animationSpeed)
    } else if (!isPlaying && interval) {
      clearInterval(interval)
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isPlaying, animationSpeed, isRangeMode, maxTime])

  const formatDateTime = (date) => {
    const istDate = new Date(date.getTime() + (5.5 * 60 * 60 * 1000))
    return istDate.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata'
    }) + ' IST'
  }

  const formatDateTimeShort = (date) => {
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const getSelectedTimeText = () => {
    if (isRangeMode && timeValues.length === 2) {
      const startTime = timeStamps[timeValues[0]]
      const endTime = timeStamps[timeValues[1]]
      return `${formatDateTime(startTime)} to ${formatDateTime(endTime)}`
    } else if (timeValues.length === 1) {
      const time = timeStamps[timeValues[0]]
      return formatDateTime(time)
    }
    return ''
  }

  const jumpToNow = () => {
    if (isRangeMode) {
      setTimeValues([Math.max(0, currentTimeIndex - 12), Math.min(maxTime, currentTimeIndex + 12)])
    } else {
      setTimeValues([currentTimeIndex])
    }
  }

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleSpeedChange = (speed) => {
    setAnimationSpeed(speed)
  }

  return (
    <div className="timeline-slider">
      <div className="timeline-controls-expanded">
        <div className="mode-toggle-expanded">
          <button
            className={`btn btn-expanded ${!isRangeMode ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setIsRangeMode(false)}
            title="Single time selection mode"
          >
            📍 Single Time
          </button>
          <button
            className={`btn btn-expanded ${isRangeMode ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setIsRangeMode(true)}
            title="Time range selection mode"
          >
            📊 Time Range
          </button>
        </div>
        
        <div className="action-buttons-expanded">
          <button
            className={`btn btn-play btn-expanded ${isPlaying ? 'btn-playing' : ''}`}
            onClick={togglePlayPause}
            title={isPlaying ? "Pause timeline animation" : "Play timeline animation"}
          >
            {isPlaying ? '⏸️ Pause' : '▶️ Play'} Animation
          </button>
          <div className="speed-controls">
            <select 
              value={animationSpeed} 
              onChange={(e) => handleSpeedChange(Number(e.target.value))}
              className="speed-selector"
              title="Animation speed"
            >
              <option value={2000}>0.5x</option>
              <option value={1000}>1x</option>
              <option value={500}>2x</option>
              <option value={250}>4x</option>
            </select>
          </div>
          <button
            className="btn btn-now btn-expanded"
            onClick={jumpToNow}
            title={`Jump to current time (${baseDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })})`}
          >
            🕐 Jump to Now
          </button>
        </div>
      </div>
      
      <div className="selected-time-display">
        <strong>Selected:</strong> {getSelectedTimeText()}
      </div>

      <div className="timeline-container">
        <div className="timeline-labels">
          <span className="timeline-label-start">
            {formatDateTimeShort(timeStamps[0])}
          </span>
          <span className="timeline-label-center">
            {baseDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} (Today)
          </span>
          <span className="timeline-label-end">
            {formatDateTimeShort(timeStamps[timeStamps.length - 1])}
          </span>
        </div>

        <div className="range-container">
          <Range
            step={1}
            min={minTime}
            max={maxTime}
            values={timeValues}
            onChange={(values) => setTimeValues(values)}
            renderTrack={({ props, children }) => {
              const { key, ...restProps } = props
              return (
                <div
                  key={key}
                  {...restProps}
                  className="range-track"
                >
                  {children}
                </div>
              )
            }}
            renderThumb={({ props, index }) => {
              const { key, ...restProps } = props
              return (
                <div
                  key={key}
                  {...restProps}
                  className={`range-thumb ${isRangeMode && index === 1 ? 'range-thumb-end' : ''}`}
                >
                  <div className="thumb-tooltip">
                    {formatDateTimeShort(timeStamps[timeValues[index]])}
                  </div>
                </div>
              )
            }}
          />
        </div>

        <div className="timeline-ticks">
          {timeStamps.map((time, index) => {
            if (index % 24 === 0) {
              return (
                <div
                  key={index}
                  className="timeline-tick"
                  style={{ left: `${(index / maxTime) * 100}%` }}
                >
                  <div className="tick-mark"></div>
                  <div className="tick-label">
                    {time.toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
              )
            }
            return null
          })}
        </div>
      </div>

      <div className="timeline-help">
        💡 <strong>Tip:</strong> Drag the handle to select a specific time, or use the buttons above
      </div>
    </div>
  )
}

export default TimelineSlider
