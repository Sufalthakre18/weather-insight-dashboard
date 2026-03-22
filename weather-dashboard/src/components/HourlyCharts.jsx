import { useState, useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, ComposedChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,  
} from 'recharts';
import ZoomableChart from './ZoomableChart';

const TT_STYLE = {
  background: 'rgba(14,12,17,0.95)',
  border: '1px solid rgba(212,168,67,0.2)',
  borderRadius: 8,
  color: '#f0ead8',
  fontSize: 12,
  fontFamily: "'DM Mono', monospace",
};

export default function HourlyCharts({ hourly }) {
  const [tempUnit, setTempUnit] = useState('C');

  const data = useMemo(() => {
    if (!hourly?.time) return [];
    return hourly.time.map((t, i) => ({
      time: t,
      temp: hourly.temperature_2m?.[i] ?? null,
      tempF: hourly.temperature_2m?.[i] != null
        ? +(hourly.temperature_2m[i] * 9 / 5 + 32).toFixed(1)
        : null,
      humidity: hourly.relative_humidity_2m?.[i] ?? null,
      precip: hourly.precipitation?.[i] ?? null,
      visibility: hourly.visibility?.[i] != null
        ? +(hourly.visibility[i] / 1000).toFixed(2)
        : null,
      wind: hourly.wind_speed_10m?.[i] ?? null,
      pm10: hourly.pm10?.[i] ?? null,
      pm25: hourly.pm2_5?.[i] ?? null,
    }));
  }, [hourly]);

  if (!data.length) return null;

  const chartProps = { margin: { top: 8, right: 12, bottom: 4, left: 0 } };
  const axisProps  = { tick: { fill: '#4a4035', fontSize: 11, fontFamily: "'DM Mono',monospace" }, axisLine: false, tickLine: false };
  const gridProps  = { stroke: 'rgba(255,255,255,0.04)', strokeDasharray: '3 3' };

  return (
    <div className="flex flex-col gap-4">

      {/* Temperature */}
      <ZoomableChart title="Temperature" dataLength={data.length} accent="#d4a843">
        {(w, h) => (
          <div>
            <div className="flex justify-end mb-2 px-2">
              <button
                onClick={() => setTempUnit(u => u === 'C' ? 'F' : 'C')}
                className="text-xs px-3 py-1 rounded-full font-bold transition-all hover:scale-105"
                style={{ background: 'rgba(212,168,67,0.12)', border: '1px solid rgba(212,168,67,0.3)', color: '#d4a843', fontFamily: "'Exo 2',sans-serif" }}
              >
                °{tempUnit} → °{tempUnit === 'C' ? 'F' : 'C'}
              </button>
            </div>
            <LineChart width={w} height={h} data={data} {...chartProps}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="time" {...axisProps} />
              <YAxis {...axisProps} unit={`°${tempUnit}`} width={40} />
              <Tooltip contentStyle={TT_STYLE} formatter={v => [`${v}°${tempUnit}`, 'Temp']} />
              <Line type="monotone" dataKey={tempUnit === 'C' ? 'temp' : 'tempF'} stroke="#d4a843" strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: '#d4a843' }} />
            </LineChart>
          </div>
        )}
      </ZoomableChart>

      {/* Relative Humidity */}
      <ZoomableChart title="Relative Humidity" dataLength={data.length} accent="#e8c97a">
        {(w, h) => (
          <ComposedChart width={w} height={h} data={data} {...chartProps}>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="time" {...axisProps} />
            <YAxis {...axisProps} unit="%" domain={[0, 100]} width={38} />
            <Tooltip contentStyle={TT_STYLE} formatter={v => [`${v}%`, 'Humidity']} />
            <defs>
              <linearGradient id="humGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#e8c97a" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#e8c97a" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="humidity" fill="url(#humGrad)" stroke="#e8c97a" strokeWidth={2} dot={false} />
          </ComposedChart>
        )}
      </ZoomableChart>

      {/* Precipitation */}
      <ZoomableChart title="Precipitation" dataLength={data.length} accent="#e8c97a">
        {(w, h) => (
          <BarChart width={w} height={h} data={data} {...chartProps} barSize={Math.max(4, Math.floor(w / data.length) - 2)}>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="time" {...axisProps} />
            <YAxis {...axisProps} unit=" mm" width={42} />
            <Tooltip contentStyle={TT_STYLE} formatter={v => [`${v} mm`, 'Precip']} />
            <Bar dataKey="precip" fill="#e8c97a" fillOpacity={0.7} radius={[3, 3, 0, 0]} />
          </BarChart>
        )}
      </ZoomableChart>

      {/* Visibility */}
      <ZoomableChart title="Visibility" dataLength={data.length} accent="#a07830">
        {(w, h) => (
          <LineChart width={w} height={h} data={data} {...chartProps}>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="time" {...axisProps} />
            <YAxis {...axisProps} unit=" km" width={42} />
            <Tooltip contentStyle={TT_STYLE} formatter={v => [`${v} km`, 'Visibility']} />
            <Line type="monotone" dataKey="visibility" stroke="#a07830" strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: '#a07830' }} />
          </LineChart>
        )}
      </ZoomableChart>

      {/* Wind Speed */}
      <ZoomableChart title="Wind Speed (10m)" dataLength={data.length} accent="#d4a843">
        {(w, h) => (
          <ComposedChart width={w} height={h} data={data} {...chartProps}>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="time" {...axisProps} />
            <YAxis {...axisProps} unit=" km/h" width={50} />
            <Tooltip contentStyle={TT_STYLE} formatter={v => [`${v} km/h`, 'Wind']} />
            <defs>
              <linearGradient id="windGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d4a843" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#d4a843" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="wind" fill="url(#windGrad)" stroke="#d4a843" strokeWidth={2} dot={false} />
          </ComposedChart>
        )}
      </ZoomableChart>

      {/* PM10 + PM2.5 Combined */}
      <ZoomableChart title="PM10 & PM2.5 Air Quality" dataLength={data.length} accent="#c4845a">
        {(w, h) => (
          <LineChart width={w} height={h} data={data} {...chartProps}>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="time" {...axisProps} />
            <YAxis {...axisProps} unit=" µg" width={44} />
            <Tooltip contentStyle={TT_STYLE} formatter={(v, n) => [`${v} µg/m³`, n]} />
            <Legend wrapperStyle={{ color: '#4a4035', fontSize: 11 }} />
            <Line type="monotone" dataKey="pm10" name="PM10"  stroke="#c4845a" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            <Line type="monotone" dataKey="pm25" name="PM2.5" stroke="#d4a843" strokeWidth={2} dot={false} activeDot={{ r: 4 }} strokeDasharray="4 2" />
          </LineChart>
        )}
      </ZoomableChart>

    </div>
  );
}