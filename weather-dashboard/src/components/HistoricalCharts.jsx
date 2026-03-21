import { useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, ComposedChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ScatterChart, Scatter,
} from 'recharts';
import ZoomableChart from './ZoomableChart';
import { fmtDateLabel, windDirLabel } from '../utils/helpers';

const TT_STYLE = {
  background: 'rgba(10,15,26,0.95)',
  border: '1px solid rgba(0,229,255,0.15)',
  borderRadius: 8,
  color: '#e8f4f8',
  fontSize: 11,
  fontFamily: "'DM Mono', monospace",
};

const axisProps = {
  tick: { fill: '#546e7a', fontSize: 10, fontFamily: "'DM Mono',monospace" },
  axisLine: false, tickLine: false,
};
const gridProps = { stroke: 'rgba(255,255,255,0.04)', strokeDasharray: '3 3' };
const chartProps = { margin: { top: 8, right: 12, bottom: 4, left: 0 } };

/* Tick formatter — show every Nth label based on data length */
function tickFormatter(len) {
  const every = Math.max(1, Math.ceil(len / 30));
  let count = -1;
  return (_, i) => {
    count++;
    return count % every === 0 ? fmtDateLabel(_) : '';
  };
}

export default function HistoricalCharts({ weather, airQuality }) {
  const wx = weather?.daily;
  const aq = airQuality; // { dates, pm10, pm25 }

  const tempData = useMemo(() => {
    if (!wx?.time) return [];
    return wx.time.map((d, i) => ({
      date: d, label: fmtDateLabel(d),
      max:  wx.temperature_2m_max?.[i]  ?? null,
      min:  wx.temperature_2m_min?.[i]  ?? null,
      mean: wx.temperature_2m_mean?.[i] ?? null,
    }));
  }, [wx]);

  const sunData = useMemo(() => {
    if (!wx?.time) return [];
    return wx.time.map((d, i) => {
      const riseStr = wx.sunrise?.[i];
      const setStr  = wx.sunset?.[i];
      const toIST = (iso) => {
        if (!iso) return null;
        try {
          const dt = new Date(iso);
          const hrs = dt.toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' });
          const [h, m] = hrs.split(':').map(Number);
          return +(h + m / 60).toFixed(2);
        } catch { return null; }
      };
      return { date: d, label: fmtDateLabel(d), sunrise: toIST(riseStr), sunset: toIST(setStr) };
    });
  }, [wx]);

  const precipData = useMemo(() => {
    if (!wx?.time) return [];
    return wx.time.map((d, i) => ({ date: d, label: fmtDateLabel(d), precip: wx.precipitation_sum?.[i] ?? null }));
  }, [wx]);

  const windData = useMemo(() => {
    if (!wx?.time) return [];
    return wx.time.map((d, i) => ({
      date: d, label: fmtDateLabel(d),
      speed: wx.wind_speed_10m_max?.[i] ?? null,
      dir:   wx.wind_direction_10m_dominant?.[i] ?? null,
      dirLabel: windDirLabel(wx.wind_direction_10m_dominant?.[i]),
    }));
  }, [wx]);

  const aqData = useMemo(() => {
    if (!aq?.dates) return [];
    return aq.dates.map((d, i) => ({
      date: d, label: fmtDateLabel(d),
      pm10: aq.pm10?.[i] ?? null,
      pm25: aq.pm25?.[i] ?? null,
    }));
  }, [aq]);

  const len = tempData.length;
  const bw = Math.max(2, Math.floor(600 / len)); // bar width hint

  if (!len) return null;

  const xTick = { ...axisProps.tick };
  const fmtX = tickFormatter(len);

  return (
    <div className="flex flex-col gap-5">

      {/* Temperature: Mean / Max / Min */}
      <ZoomableChart title="Temperature — Mean / Max / Min" dataLength={len} baseWidthPer={28} accent="#00e5ff">
        {(w, h) => (
          <ComposedChart width={w} height={h} data={tempData} {...chartProps}>
            <defs>
              <linearGradient id="tempRange" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00e5ff" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#00e5ff" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="label" {...axisProps} tick={xTick} />
            <YAxis {...axisProps} unit="°C" width={38} />
            <Tooltip contentStyle={TT_STYLE} formatter={(v, n) => [`${v}°C`, n]} />
            <Legend wrapperStyle={{ color: '#546e7a', fontSize: 11 }} />
            <Area type="monotone" dataKey="max" name="Max" fill="url(#tempRange)" stroke="#ff6b6b" strokeWidth={1.5} dot={false} />
            <Line type="monotone" dataKey="mean" name="Mean" stroke="#00e5ff" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="min" name="Min" stroke="#b388ff" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
          </ComposedChart>
        )}
      </ZoomableChart>

      {/* Sunrise & Sunset in IST */}
      <ZoomableChart title="Sunrise & Sunset (IST)" dataLength={len} baseWidthPer={28} accent="#ffca28">
        {(w, h) => (
          <ComposedChart width={w} height={h} data={sunData} {...chartProps}>
            <defs>
              <linearGradient id="sunGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ffca28" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#ffca28" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="label" {...axisProps} tick={xTick} />
            <YAxis {...axisProps} domain={[4, 21]} tickFormatter={v => `${Math.floor(v)}:${String(Math.round((v % 1) * 60)).padStart(2, '0')}`} width={44} />
            <Tooltip contentStyle={TT_STYLE} formatter={(v, n) => {
              const h = Math.floor(v), m = Math.round((v % 1) * 60);
              return [`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')} IST`, n];
            }} />
            <Legend wrapperStyle={{ color: '#546e7a', fontSize: 11 }} />
            <Area type="monotone" dataKey="sunset" name="Sunset" fill="url(#sunGrad)" stroke="#ffca28" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="sunrise" name="Sunrise" stroke="#fb923c" strokeWidth={2} dot={false} />
          </ComposedChart>
        )}
      </ZoomableChart>

      {/* Precipitation */}
      <ZoomableChart title="Precipitation (Daily Sum)" dataLength={len} baseWidthPer={28} accent="#f48fb1">
        {(w, h) => (
          <BarChart width={w} height={h} data={precipData} {...chartProps} barSize={Math.max(2, bw)}>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="label" {...axisProps} tick={xTick} />
            <YAxis {...axisProps} unit=" mm" width={44} />
            <Tooltip contentStyle={TT_STYLE} formatter={v => [`${v} mm`, 'Precip']} />
            <Bar dataKey="precip" name="Precipitation" fill="#f48fb1" fillOpacity={0.7} radius={[2, 2, 0, 0]} />
          </BarChart>
        )}
      </ZoomableChart>

      {/* Wind Speed + Dominant Direction */}
      <ZoomableChart title="Max Wind Speed & Dominant Direction" dataLength={len} baseWidthPer={28} accent="#69ff47">
        {(w, h) => (
          <ComposedChart width={w} height={h} data={windData} {...chartProps}>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="label" {...axisProps} tick={xTick} />
            <YAxis yAxisId="speed" {...axisProps} unit=" km/h" width={50} />
            <YAxis yAxisId="dir" orientation="right" {...axisProps} unit="°" domain={[0, 360]} width={40} />
            <Tooltip contentStyle={TT_STYLE} formatter={(v, n) => n === 'Direction' ? [`${v}° (${windDirLabel(v)})`, n] : [`${v} km/h`, n]} />
            <Legend wrapperStyle={{ color: '#546e7a', fontSize: 11 }} />
            <Bar yAxisId="speed" dataKey="speed" name="Wind Speed" fill="#69ff47" fillOpacity={0.55} radius={[2, 2, 0, 0]} />
            <Line yAxisId="dir" type="monotone" dataKey="dir" name="Direction" stroke="#b388ff" strokeWidth={1.5} dot={false} strokeDasharray="3 3" />
          </ComposedChart>
        )}
      </ZoomableChart>

      {/* PM10 + PM2.5 */}
      {aqData.length > 0 && (
        <ZoomableChart title="Air Quality — PM10 & PM2.5" dataLength={aqData.length} baseWidthPer={28} accent="#ff6b6b">
          {(w, h) => (
            <LineChart width={w} height={h} data={aqData} {...chartProps}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="label" {...axisProps} tick={xTick} />
              <YAxis {...axisProps} unit=" µg" width={46} />
              <Tooltip contentStyle={TT_STYLE} formatter={(v, n) => [`${v} µg/m³`, n]} />
              <Legend wrapperStyle={{ color: '#546e7a', fontSize: 11 }} />
              <Line type="monotone" dataKey="pm10" name="PM10"  stroke="#ff6b6b" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="pm25" name="PM2.5" stroke="#ffca28" strokeWidth={2} dot={false} strokeDasharray="4 2" />
            </LineChart>
          )}
        </ZoomableChart>
      )}

    </div>
  );
}