import { useState, useEffect, useCallback } from 'react';
import DatePicker from 'react-datepicker';
import { format } from 'date-fns';
import {
  fetchDayWeather, fetchDayAirQuality,
  getWeatherMeta, getAqiMeta, extractDayHourly
} from '../services/api';
import { fmtTemp, fmtVal, fmtTime, aqiColor } from '../utils/helpers';
import MetricCard from '../components/MetricCard';
import HourlyCharts from '../components/HourlyCharts';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorToast from '../components/ErrorToast';

export default function Page1({ location, onWeatherChange }) {
  const [selectedDate, setSelectedDate]   = useState(new Date());
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState(null);
  const [wxData, setWxData]               = useState(null);
  const [aqData, setAqData]               = useState(null);
  const [usedForecast, setUsedForecast]   = useState(true);

  const load = useCallback(async (date) => {
    if (!location) return;
    setLoading(true);
    setError(null);
    try {
      const [wx, aq] = await Promise.all([
        fetchDayWeather(location.lat, location.lon, date),
        fetchDayAirQuality(location.lat, location.lon, date),
      ]);
      setWxData(wx.data);
      setUsedForecast(wx.usedForecast);
      setAqData(aq);
      // Update background to match current weather
      if (onWeatherChange) {
        onWeatherChange(getWeatherMeta(wx.data?.current?.weathercode ?? wx.data?.daily?.weathercode?.[0]).bg
          .replace(/^/, 'weather-'));
      }
    } catch (e) {
      setError('Failed to load weather data. ' + (e?.message || ''));
    } finally {
      setLoading(false);
    }
  }, [location]);

  useEffect(() => { load(selectedDate); }, [location, load]);

  const handleDateChange = (date) => {
    if (!date) return;
    setSelectedDate(date);
    load(date);
  };

  /* ─ Derived values ─ */
  const daily  = wxData?.daily;
  const curr   = wxData?.current;  // only when forecast
  const aqCurr = aqData?.current;
  const dateStr = format(selectedDate, 'yyyy-MM-dd');

  // Extract hourly for the selected date (slice 0-23 of the returned arrays)
  const hourlyBase = wxData?.hourly;
  const aqHourly   = aqData?.hourly;

  const hourlyForDate = hourlyBase ? extractDayHourly(hourlyBase, dateStr) : null;

  // Merge air quality into hourly
  if (hourlyForDate && aqHourly) {
    const aqExtracted = extractDayHourly(aqHourly, dateStr);
    hourlyForDate.pm10  = aqExtracted.pm10;
    hourlyForDate.pm2_5 = aqExtracted.pm2_5;
  }

  const weatherMeta = getWeatherMeta(curr?.weathercode ?? daily?.weathercode?.[0]);
  const aqi         = aqCurr?.european_aqi ?? aqHourly?.european_aqi?.find(v => v != null);
  const aqiMeta     = getAqiMeta(aqi);

  // Current or daily fallback values
  const currentTemp     = curr?.temperature_2m ?? daily?.temperature_2m_max?.[0];
  const maxTemp         = daily?.temperature_2m_max?.[0];
  const minTemp         = daily?.temperature_2m_min?.[0];
  const precip          = curr?.precipitation       ?? daily?.precipitation_sum?.[0];
  const humidity        = curr?.relative_humidity_2m;
  const windMax         = daily?.wind_speed_10m_max?.[0];
  const uvIndex         = curr?.uv_index            ?? daily?.uv_index_max?.[0];
  const precipProbMax   = daily?.precipitation_probability_max?.[0];
  const sunrise         = daily?.sunrise?.[0];
  const sunset          = daily?.sunset?.[0];
  const pm10            = aqCurr?.pm10  ?? aqHourly?.pm10?.find(v => v != null);
  const pm25            = aqCurr?.pm2_5 ?? aqHourly?.pm2_5?.find(v => v != null);
  const co              = aqCurr?.carbon_monoxide    ?? aqHourly?.carbon_monoxide?.find(v => v != null);
  const no2             = aqCurr?.nitrogen_dioxide   ?? aqHourly?.nitrogen_dioxide?.find(v => v != null);
  const so2             = aqCurr?.sulphur_dioxide    ?? aqHourly?.sulphur_dioxide?.find(v => v != null);

  return (
    <div className="relative z-10 flex flex-col gap-6 px-4 sm:px-6 lg:px-8 py-6">

      {/* Date selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap">
        <span className="text-xs font-semibold tracking-widest uppercase text-[rgba(255,255,255,0.45)]" style={{ fontFamily: "'Exo 2',sans-serif" }}>
          Select Date
        </span>
        <DatePicker
          selected={selectedDate}
          onChange={handleDateChange}
          dateFormat="dd MMM yyyy"
          maxDate={new Date()}
          minDate={new Date('2020-01-01')}
          placeholderText="Pick a date"
          className="w-full sm:w-auto"
        />
        {daily?.time?.[0] && (
          <span className="text-xs text-[rgba(255,255,255,0.45)]" style={{ fontFamily: "'DM Mono',monospace" }}>
            {usedForecast ? '📡 Live Forecast' : '🗄 Archive Data'}
          </span>
        )}
      </div>

      {loading && <LoadingSpinner message="Fetching atmospheric data..." />}
      <ErrorToast message={error} onDismiss={() => setError(null)} />

      {wxData && !loading && (
        <>
          {/* Hero weather strip */}
          <div className="glass-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-6xl sm:text-7xl" style={{ filter: 'drop-shadow(0 0 16px rgba(212,168,67,0.4))' }}>
                {weatherMeta.icon}
              </span>
              <div>
                <h2 className="temp-hero text-5xl sm:text-6xl neon-text">
                  {fmtVal(currentTemp, 1)}
                  <span className="text-xl sm:text-2xl text-[rgba(255,255,255,0.45)] ml-1">°C</span>
                </h2>
                <p className="text-sm text-[rgba(255,255,255,0.92)] mt-1" style={{ fontFamily: "'Exo 2',sans-serif" }}>
                  {weatherMeta.label}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-1 text-right">
              <span className="text-xs text-[rgba(255,255,255,0.45)]" style={{ fontFamily: "'DM Mono',monospace" }}>
                {format(selectedDate, 'EEEE, dd MMM yyyy')}
              </span>
              {aqi != null && (
                <span className={`text-xs px-2 py-1 rounded-full border self-end ${aqiMeta.cls}`}
                  style={{ fontFamily: "'Exo 2',sans-serif", fontWeight: 700 }}>
                  AQI {aqi} — {aqiMeta.label}
                </span>
              )}
            </div>
          </div>

          {/* Weather metrics */}
          <div>
            <h3 className="text-xs font-semibold tracking-widest uppercase text-[rgba(255,255,255,0.45)] mb-3" style={{ fontFamily: "'Exo 2',sans-serif" }}>
              Weather Parameters
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              <MetricCard icon="🌡️" label="Max Temp"     value={fmtVal(maxTemp, 1)}  unit="°C" accent="#e8d4b8" />
              <MetricCard icon="🌡️" label="Min Temp"     value={fmtVal(minTemp, 1)}  unit="°C" accent="#d4c4a0" />
              <MetricCard icon="🌡️" label="Current Temp" value={fmtVal(currentTemp,1)} unit="°C" accent="#f0e6c8" />
              <MetricCard icon="🌧️" label="Precipitation" value={fmtVal(precip, 1)}  unit="mm" accent="#f5edda" />
              <MetricCard icon="🌅" label="Sunrise"       value={fmtTime(sunrise)}              accent="#f0e6c8" />
              <MetricCard icon="🌇" label="Sunset"        value={fmtTime(sunset)}                accent="#e8d4b8" />
              <MetricCard icon="💨" label="Max Wind"      value={fmtVal(windMax, 1)} unit="km/h" accent="#f5edda" />
              <MetricCard icon="💧" label="Humidity"      value={fmtVal(humidity, 0)} unit="%" accent="#f0e6c8" />
              <MetricCard icon="☀️" label="UV Index"      value={fmtVal(uvIndex, 1)}             accent="#f0e6c8" />
              <MetricCard icon="🌂" label="Precip Prob"   value={fmtVal(precipProbMax, 0)} unit="%" accent="#f5edda" />
            </div>
          </div>

          {/* Air Quality */}
          <div>
            <h3 className="text-xs font-semibold tracking-widest uppercase text-[rgba(255,255,255,0.45)] mb-3" style={{ fontFamily: "'Exo 2',sans-serif" }}>
              Air Quality
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              <div className="glass-card p-4 col-span-2 sm:col-span-1 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🌍</span>
                  <span className="text-xs font-semibold tracking-widest uppercase text-[rgba(255,255,255,0.45)]" style={{ fontFamily: "'Exo 2',sans-serif" }}>AQI (EU)</span>
                </div>
                <span className="metric-value text-3xl" style={{ color: aqiColor(aqi) }}>
                  {aqi != null ? aqi : '—'}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded border self-start ${aqiMeta.cls}`} style={{ fontFamily: "'Exo 2',sans-serif" }}>
                  {aqiMeta.label}
                </span>
              </div>
              <MetricCard icon="🟠" label="PM10"   value={fmtVal(pm10, 1)}  unit="µg/m³" accent="#e8d4b8" />
              <MetricCard icon="🟡" label="PM2.5"  value={fmtVal(pm25, 1)}  unit="µg/m³" accent="#f0e6c8" />
              <MetricCard icon="💨" label="CO"     value={fmtVal(co, 0)}    unit="µg/m³" accent="#d4c4a0" />
              <MetricCard icon="🔴" label="CO₂"    value="N/A"              sub="Not in API" accent="rgba(255,255,255,0.45)" />
              <MetricCard icon="🟤" label="NO₂"    value={fmtVal(no2, 1)}   unit="µg/m³" accent="#e8d4b8" />
              <MetricCard icon="🟣" label="SO₂"    value={fmtVal(so2, 1)}   unit="µg/m³" accent="#f5edda" />
            </div>
          </div>

          {/* Hourly Charts */}
          {hourlyForDate && (
            <div>
              <h3 className="text-xs font-semibold tracking-widest uppercase text-[rgba(255,255,255,0.45)] mb-3" style={{ fontFamily: "'Exo 2',sans-serif" }}>
                Hourly Data — {format(selectedDate, 'dd MMM yyyy')}
              </h3>
              <HourlyCharts hourly={hourlyForDate} />
            </div>
          )}
        </>
      )}
    </div>
  );
}