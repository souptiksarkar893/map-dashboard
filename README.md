# Interactive Map Dashboard

A powerful, user-friendly dashboard for visualizing dynamic weather data on interactive maps with polygon drawing capabilities and timeline controls.

## 🌟 Features

### Core Functionality
- **Interactive Map**: Based on Leaflet with smooth pan/zoom controls
- **Polygon Drawing**: Create custom regions with 3-12 points
- **Timeline Control**: Hourly resolution across 30-day window (±15 days from current date)
- **Real-time Data**: Weather data from Open-Meteo API
- **Color Visualization**: Dynamic polygon coloring based on data thresholds
- **Responsive Design**: Works seamlessly on desktop and mobile

### Advanced Features
- **Dual Timeline Modes**: Single time or range selection
- **Auto-save**: Persistent storage using localStorage
- **Fallback Data**: Continues working even if API is unavailable
- **User Guidance**: Welcome modal and contextual tooltips
- **Data Caching**: Optimized API usage with intelligent caching

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager

### Installation

1. **Clone or download the project**
   ```bash
   cd dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000` (or the port shown in terminal)

### Build for Production
```bash
npm run build
npm run preview
```

## 📖 User Guide

### Getting Started
1. **Welcome Modal**: First-time users see an interactive tutorial
2. **Timeline Setup**: Use the slider to select time or time ranges
3. **Draw Polygons**: Click "Start Drawing" and click on map to create regions
4. **Configure Colors**: Set up thresholds in the sidebar for data visualization
5. **Analyze Data**: Watch polygons change colors based on weather conditions

### Timeline Controls
- **Single Time Mode**: Select specific hour for point-in-time analysis
- **Range Mode**: Select time windows for trend analysis
- **Quick Navigation**: "Now" button jumps to current time
- **Visual Indicators**: Current time highlighted on timeline

### Polygon Management
- **Drawing**: 3-12 points per polygon, visual feedback during creation
- **Editing**: Rename polygons, delete with confirmation
- **Data Binding**: Each polygon fetches data for its geographic center
- **Visual Feedback**: Hover effects and loading states

### Data Sources & Color Rules
- **Open-Meteo API**: Temperature, humidity, precipitation, wind, pressure
- **Threshold Rules**: Flexible operators (>, <, >=, <=, =)
- **Range Rules**: Complex conditions (e.g., >=10 AND <25)
- **Color Coding**: Custom colors for each threshold range

## 🔧 Technical Details

### Architecture
- **Frontend**: React 18 with Vite build system
- **Mapping**: Leaflet with react-leaflet integration
- **Styling**: CSS modules with responsive design
- **State Management**: React hooks (useState, useEffect)
- **Data Fetching**: Axios with caching and fallback strategies

### API Integration
- **Primary**: Open-Meteo Historical Weather API
- **Endpoint**: `https://archive-api.open-meteo.com/v1/archive`
- **Parameters**: Latitude, longitude, date range, hourly data fields
- **Fallback**: Simulated data when API unavailable
- **Caching**: 5-minute cache with automatic cleanup

### Data Fields Available
- `temperature_2m`: Temperature at 2 meters (°C)
- `relative_humidity_2m`: Relative humidity (%)
- `precipitation`: Precipitation amount (mm)
- `surface_pressure`: Surface pressure (hPa)
- `wind_speed_10m`: Wind speed at 10 meters (m/s)

### Browser Support
- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## 🎨 Customization

### Color Schemes
Modify color rules in the sidebar or update default colors in `App.jsx`:
```javascript
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
```

### Map Configuration
Update initial map settings in `MapComponent.jsx`:
```javascript
<MapContainer
  center={[20.5937, 78.9629]} // Your preferred center
  zoom={5}                    // Initial zoom level
  // ... other props
>
```

### Timeline Range
Modify the date range in `TimelineSlider.jsx`:
```javascript
const baseDate = new Date('2025-08-05T00:00:00')
const startDate = new Date(baseDate)
startDate.setDate(startDate.getDate() - 15) // Days before
const endDate = new Date(baseDate)
endDate.setDate(endDate.getDate() + 15)     // Days after
```

## 🔍 Troubleshooting

### Common Issues

**Map not loading**
- Check internet connection
- Verify Leaflet CSS is loaded in index.html
- Check browser console for errors

**API data not showing**
- Open browser dev tools and check Network tab
- Verify Open-Meteo API is accessible
- Fallback data should appear if API fails

**Polygons not saving**
- Check browser localStorage support
- Clear browser cache if issues persist
- Check console for localStorage errors

**Mobile responsiveness issues**
- Use latest mobile browser version
- Check viewport meta tag in index.html
- Test in device-specific dev tools

### Performance Optimization
- **Large datasets**: Use time ranges instead of individual hours
- **Many polygons**: Limit to recommended 10-15 active polygons
- **Slow loading**: Enable data caching in browser settings

## 📱 Mobile Usage

The dashboard is fully responsive and supports:
- Touch gestures for map navigation
- Finger drawing for polygons
- Optimized sidebar layout
- Touch-friendly timeline controls
- Mobile-optimized modal dialogs

## 🔒 Privacy & Data

- **No user data collection**: All data stays in your browser
- **Local storage only**: Settings saved locally, not transmitted
- **API calls**: Only weather data requests to Open-Meteo
- **No tracking**: No analytics or tracking scripts

## 🛠️ Development

### Project Structure
```
src/
├── components/
│   ├── MapComponent.jsx     # Main map with Leaflet
│   ├── TimelineSlider.jsx   # Time selection controls
│   ├── Sidebar.jsx          # Data sources and settings
│   └── WelcomeModal.jsx     # First-time user tutorial
├── utils/
│   └── api.js               # API integration and caching
├── App.jsx                  # Main application component
├── App.css                  # Global styles
└── index.css                # Base styles and reset
```

### Adding New Data Sources
1. Update `dataSources` array in `App.jsx`
2. Add API integration in `utils/api.js`
3. Configure color rules in `Sidebar.jsx`
4. Test with polygon creation and timeline changes

### Contributing Guidelines
- Follow existing code style and patterns
- Add comments for complex logic
- Test on multiple devices and browsers
- Update README for new features

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

For questions, issues, or feature requests:
1. Check this README for solutions
2. Review browser console for error messages
3. Test with different browsers or devices
4. Check Open-Meteo API status if data issues occur

## 🙏 Acknowledgments

- **Open-Meteo**: Free weather data API
- **Leaflet**: Open-source mapping library
- **React**: UI framework
- **Vite**: Fast build tool
- **OpenStreetMap**: Map tile provider

---

**Built with ❤️ for interactive data visualization**+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
