import axios from 'axios';
import { format, isToday, isFuture, startOfDay } from 'date-fns';

const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const ARCHIVE_URL  = 'https://archive-api.open-meteo.com/v1/archive';
const AQ_URL       = 'https://air-quality-api.open-meteo.com/v1/air-quality';

function isTodayOrFuture(date) {
  const d = startOfDay(date);
  return isToday(d) || isFuture(d);
}

/* ── Page 1: Single-date weather + hourly ── */
export async function fetchDayWeather(lat, lon, date) {
  const dateStr = format(date, 'yyyy-MM-dd');
  const useForecast = isTodayOrFuture(date);
  const baseUrl = useForecast ? FORECAST_URL : ARCHIVE_URL;

  const params = {
    latitude: lat,
    longitude: lon,
    start_date: dateStr,
    end_date: dateStr,
    daily: [
      'temperature_2m_max', 'temperature_2m_min', 'precipitation_sum',
      'sunrise', 'sunset', 'wind_speed_10m_max', 'precipitation_probability_max',
      'uv_index_max', 'weathercode', 'wind_direction_10m_dominant'
    ].join(','),
    hourly: [
      'temperature_2m', 'relative_humidity_2m', 'precipitation',
      'visibility', 'wind_speed_10m', 'weathercode', 'uv_index'
    ].join(','),
    timezone: 'auto',
  };

  if (useForecast) {
    params.current = [
      'temperature_2m', 'relative_humidity_2m', 'wind_speed_10m',
      'weathercode', 'precipitation', 'uv_index', 'apparent_temperature'
    ].join(',');
  }

  const response = await axios.get(baseUrl, { params, timeout: 3000 });
  return { data: response.data, usedForecast: useForecast };
}

/* ── Page 1: Air quality for a single date ── */
export async function fetchDayAirQuality(lat, lon, date) {
  const dateStr = format(date, 'yyyy-MM-dd');
  const useForecast = isTodayOrFuture(date);

  const params = {
    latitude: lat,
    longitude: lon,
    start_date: dateStr,
    end_date: dateStr,
    hourly: ['pm10', 'pm2_5', 'carbon_monoxide', 'nitrogen_dioxide', 'sulphur_dioxide', 'european_aqi'].join(','),
    timezone: 'auto',
  };

  if (useForecast) {
    params.current = ['pm10', 'pm2_5', 'carbon_monoxide', 'nitrogen_dioxide', 'sulphur_dioxide', 'european_aqi'].join(',');
  }

  const response = await axios.get(AQ_URL, { params, timeout: 3000 });
  return response.data;
}

/* ── Page 2: Historical daily weather ── */
export async function fetchHistoricalWeather(lat, lon, startDate, endDate) {
  const params = {
    latitude: lat,
    longitude: lon,
    start_date: format(startDate, 'yyyy-MM-dd'),
    end_date: format(endDate, 'yyyy-MM-dd'),
    daily: [
      'temperature_2m_max', 'temperature_2m_min', 'temperature_2m_mean',
      'precipitation_sum', 'wind_speed_10m_max', 'wind_direction_10m_dominant',
      'sunrise', 'sunset'
    ].join(','),
    timezone: 'auto',
  };

  const response = await axios.get(ARCHIVE_URL, { params, timeout: 5000 });
  return response.data;
}

/* ── Page 2: Historical air quality (daily mean from hourly noon values) ── */
export async function fetchHistoricalAirQuality(lat, lon, startDate, endDate) {
  // Fetch hourly data; we'll sample noon (12:00) values client-side for daily representation
  const params = {
    latitude: lat,
    longitude: lon,
    start_date: format(startDate, 'yyyy-MM-dd'),
    end_date: format(endDate, 'yyyy-MM-dd'),
    hourly: 'pm10,pm2_5',
    timezone: 'UTC',
  };

  const response = await axios.get(AQ_URL, { params, timeout: 5000 });
  return response.data;
}

/* ── Helpers ── */
export function getWeatherMeta(code) {
  const c = Number(code);
  if (c === 0)                          return { label: 'Clear Sky',         icon: '☀️',  bg: 'sunny' };
  if (c >= 1  && c <= 3)                return { label: 'Partly Cloudy',     icon: '⛅',  bg: 'cloudy' };
  if (c >= 45 && c <= 48)               return { label: 'Foggy',             icon: '🌫️', bg: 'cloudy' };
  if (c >= 51 && c <= 55)               return { label: 'Drizzle',           icon: '🌦️', bg: 'rainy' };
  if (c >= 61 && c <= 65)               return { label: 'Rain',              icon: '🌧️', bg: 'rainy' };
  if (c >= 71 && c <= 77)               return { label: 'Snow',              icon: '❄️',  bg: 'snowy' };
  if (c >= 80 && c <= 82)               return { label: 'Rain Showers',      icon: '🌧️', bg: 'rainy' };
  if (c >= 85 && c <= 86)               return { label: 'Snow Showers',      icon: '🌨️', bg: 'snowy' };
  if (c >= 95 && c <= 99)               return { label: 'Thunderstorm',      icon: '⛈️', bg: 'stormy' };
  return { label: 'Unknown', icon: '🌡️', bg: 'cloudy' };
}

export function getAqiMeta(aqi) {
  if (!aqi && aqi !== 0) return { label: 'N/A', cls: '' };
  if (aqi <= 50)   return { label: 'Good',      cls: 'aqi-good' };
  if (aqi <= 100)  return { label: 'Moderate',  cls: 'aqi-moderate' };
  return { label: 'Unhealthy', cls: 'aqi-unhealthy' };
}

/* Extract hourly data for a specific date from full hourly arrays */
export function extractDayHourly(hourlyData, dateStr) {
  const indices = hourlyData.time
    .map((t, i) => (t.startsWith(dateStr) ? i : -1))
    .filter(i => i !== -1);

  const result = {};
  for (const key of Object.keys(hourlyData)) {
    if (key === 'time') {
      result.time = indices.map(i => hourlyData.time[i].substring(11, 16)); // HH:MM
    } else {
      result[key] = indices.map(i => hourlyData[key][i]);
    }
  }
  return result;
}

/* Sample hourly → daily (take noon = index 12 of each day block of 24) */
export function hourlyToDaily(hourlyAQ) {
  // API returns { hourly: { time, pm10, pm2_5 } } — unwrap if needed
  const hourly = hourlyAQ?.hourly ?? hourlyAQ;
  const times  = hourly?.time;
  const pm10   = hourly?.pm10;
  const pm25   = hourly?.pm2_5;

  if (!times?.length) return { dates: [], pm10: [], pm25: [] };

  const daily = { dates: [], pm10: [], pm25: [] };
  for (let i = 12; i < times.length; i += 24) {
    daily.dates.push(times[i].slice(0, 10));
    daily.pm10.push(pm10?.[i] ?? null);
    daily.pm25.push(pm25?.[i] ?? null);
  }
  return daily;
}