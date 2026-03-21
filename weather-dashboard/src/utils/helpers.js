import { format } from 'date-fns';

export function fmtTemp(val, unit = 'C') {
  if (val == null) return '—';
  const v = unit === 'F' ? (val * 9) / 5 + 32 : val;
  return `${Math.round(v)}°${unit}`;
}

export function fmtVal(val, decimals = 1, unit = '') {
  if (val == null || val === undefined) return '—';
  const rounded = typeof val === 'number' ? val.toFixed(decimals) : val;
  return `${rounded}${unit ? ' ' + unit : ''}`;
}

export function fmtTime(isoOrTime) {
  if (!isoOrTime) return '—';
  // Already HH:MM
  if (/^\d{2}:\d{2}$/.test(isoOrTime)) return isoOrTime;
  try {
    const d = new Date(isoOrTime);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' });
  } catch {
    return isoOrTime;
  }
}

export function fmtDateLabel(dateStr) {
  try {
    return format(new Date(dateStr + 'T00:00:00'), 'MMM d');
  } catch {
    return dateStr;
  }
}

export function windDirLabel(deg) {
  if (deg == null) return '—';
  const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
  return dirs[Math.round(deg / 22.5) % 16];
}

export function aqiColor(aqi) {
  if (!aqi && aqi !== 0) return '#546e7a';
  if (aqi <= 50)  return '#69ff47';
  if (aqi <= 100) return '#ffca28';
  if (aqi <= 150) return '#fb923c';
  return '#ff6b6b';
}

export function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}