# 🌐 AtmoSphere — Weather Intelligence Dashboard

> A responsive, real-time weather dashboard built with React + Vite, powered by the Open-Meteo API. Auto-detects your location via GPS and displays live weather data, air quality metrics, hourly charts, and up to 2 years of historical trends.

**🔗 Live Demo:** [weather-insight-dashboard.vercel.app](https://weather-insight-dashboard.vercel.app)

---
**📁 Repository:** [github.com/Sufalthakre18/weather-insight-dashboard](https://github.com/Sufalthakre18/weather-insight-dashboard)

---

## ✨ Features

### 📅 Page 1 — Daily Weather
- **Auto GPS detection** on page load — instantly fetches weather for your location
- **Date picker** — select any past or future date; automatically switches between Forecast and Archive API
- **10 Weather Parameters** displayed as individual metric cards:
  - Temperature: Min, Max, Current
  - Precipitation, Relative Humidity, UV Index
  - Sunrise & Sunset times
  - Maximum Wind Speed, Precipitation Probability Max
- **7 Air Quality Metrics:**
  - European AQI (color-coded: Good / Moderate / Unhealthy)
  - PM10, PM2.5, Carbon Monoxide (CO), Nitrogen Dioxide (NO₂), Sulphur Dioxide (SO₂)
  - CO₂ — not provided by Open-Meteo API (shown as N/A)
- **6 Hourly Charts** — individually zoomable + horizontally scrollable:
  - Temperature (°C / °F toggle)
  - Relative Humidity
  - Precipitation
  - Visibility
  - Wind Speed (10m)
  - PM10 & PM2.5 (combined)

### 📊 Page 2 — Historical Data (up to 2 Years)
- Date range picker with quick presets: **7d / 30d / 90d / 180d / 365d**
- Maximum 730-day (2-year) range enforced with validation
- **5 Historical Charts** — all zoomable + scrollable:
  - Temperature — Mean, Max & Min
  - Sunrise & Sunset (displayed in IST)
  - Precipitation (daily sum)
  - Max Wind Speed + Dominant Wind Direction
  - PM10 & PM2.5 air quality trends

### 🎨 UI/UX
- Weather-reactive animated background — clouds, rain, and gradient change with live conditions
- Glassmorphism cards with low blur — background gradient shows through
- Fully responsive — mobile, tablet, desktop
- Fonts: **Orbitron** (data) · **Exo 2** (UI) · **DM Mono** (numbers)

---

## 🛠 Tech Stack

| Package | Version | Purpose |
|---|---|---|
| React | 19 | UI Framework |
| Vite | 8 | Build tool |
| Tailwind CSS | v4 | Styling |
| Recharts | 3.x | Interactive charts |
| Axios | 1.x | API requests |
| date-fns | 4.x | Date formatting |
| react-datepicker | 9.x | Calendar UI |
| react-router-dom | 7.x | Client-side routing |

**Data Source:** [Open-Meteo API](https://open-meteo.com) — completely free, no API key required.

---

## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/Sufalthakre18/weather-insight-dashboard.git
cd weather-insight-dashboard

# Install dependencies
npm install

# Start development server
npm run dev
# → http://localhost:5173

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 📁 Project Structure

```
weather-insight-dashboard/
├── index.html
├── package.json
├── vite.config.js
├── README.md
└── src/
    ├── main.jsx
    ├── App.jsx                       # Root — routing + weather state
    ├── index.css                     # Tailwind v4 + global styles + animations
    ├── services/
    │   └── api.js                    # All Open-Meteo API calls
    ├── hooks/
    │   └── useGeolocation.js         # Browser GPS hook with fallback
    ├── utils/
    │   └── helpers.js                # Formatting utilities
    ├── components/
    │   ├── Background.jsx            # Weather-reactive animated background
    │   ├── Header.jsx                # Navigation + location display
    │   ├── MetricCard.jsx            # Individual weather value card
    │   ├── ZoomableChart.jsx         # Scroll + zoom wrapper for all charts
    │   ├── HourlyCharts.jsx          # 6 hourly charts (Page 1)
    │   ├── HistoricalCharts.jsx      # 5 historical charts (Page 2)
    │   ├── LoadingSpinner.jsx        # Loading state
    │   └── ErrorToast.jsx            # Error notifications
    └── pages/
        ├── Page1.jsx                 # Daily weather view
        └── Page2.jsx                 # Historical date range view
```

---

## 🌐 API Reference

| API | URL | Used For |
|---|---|---|
| Forecast | `https://api.open-meteo.com/v1/forecast` | Today & future weather |
| Archive | `https://archive-api.open-meteo.com/v1/archive` | Past date weather |
| Air Quality | `https://air-quality-api.open-meteo.com/v1/air-quality` | Pollutants & AQI |

**Performance approach:**
- All API calls use `Promise.all()` for parallel fetching
- Forecast/AQ timeout: `5000ms` · Historical timeout: `5000ms`
- Smart API routing — automatically switches between Forecast and Archive based on selected date

---

## 📝 Notes

- **CO₂** is not available in the Open-Meteo Air Quality API — displayed as N/A
- **Historical Air Quality** uses noon-sampled hourly values (12:00 UTC) since Open-Meteo does not provide daily PM aggregates
- **Sunrise/Sunset** in Page 2 historical charts is displayed in IST (Asia/Kolkata timezone)
- GPS falls back to **New Delhi** if location permission is denied

---

## 👨‍💻 Author

**Sufal Thakre**
GitHub: [@Sufalthakre18](https://github.com/Sufalthakre18)


