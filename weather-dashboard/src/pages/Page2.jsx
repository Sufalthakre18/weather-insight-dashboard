import { useState, useCallback } from 'react';
import DatePicker from 'react-datepicker';
import { subYears, differenceInCalendarDays, format } from 'date-fns';
import { fetchHistoricalWeather, fetchHistoricalAirQuality, hourlyToDaily } from '../services/api';
import HistoricalCharts from '../components/HistoricalCharts';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorToast from '../components/ErrorToast';

const MAX_DAYS = 730; 

export default function Page2({ location }) {
  const today = new Date();
  const [startDate, setStartDate] = useState(subYears(today, 1));
  const [endDate,   setEndDate]   = useState(new Date(today.setDate(today.getDate() - 1))); // yesterday (archive)
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);
  const [wxData,    setWxData]    = useState(null);
  const [aqData,    setAqData]    = useState(null);
  const [rangeInfo, setRangeInfo] = useState('');

  const load = useCallback(async () => {
    if (!location || !startDate || !endDate) return;

    const days = differenceInCalendarDays(endDate, startDate);
    if (days < 1) { 
        setError('End date must be after start date.');
        return;
    }
    if (days > MAX_DAYS) { 
        setError('Maximum date range is 2 years (730 days).'); 
        return; 
    }

    setLoading(true);
    setError(null);
    setRangeInfo('');

    try {
      const [wx, aqRaw] = await Promise.all([
        fetchHistoricalWeather(location.lat, location.lon, startDate, endDate),
        fetchHistoricalAirQuality(location.lat, location.lon, startDate, endDate).catch(() => null),
      ]);
      setWxData(wx);
      setAqData(aqRaw ? hourlyToDaily(aqRaw) : null);
      setRangeInfo(`${days + 1} days · ${format(startDate, 'dd MMM yyyy')} → ${format(endDate, 'dd MMM yyyy')}`);
    } catch (e) {
      setError('Failed to load historical data. ' + (e?.message || ''));
    } finally {
      setLoading(false);
    }
  }, [location, startDate, endDate]);

  const handleStartChange = (date) => {
    if (!date) return;
    setStartDate(date);
    // Auto-clamp end date if range exceeded
    if (endDate && differenceInCalendarDays(endDate, date) > MAX_DAYS) {
      setEndDate(subYears(endDate, 0)); 
    }
  };

  const handleEndChange = (date) => {
    if (!date) return;
    setEndDate(date);
  };

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  return (
    <div className="relative z-10 flex flex-col gap-6 px-4 sm:px-6 lg:px-8 py-6">

      {/* Range controls */}
      <div className="glass-card p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">📅</span>
          <h2 className="text-sm font-bold tracking-widest uppercase" style={{ color: '#00e5ff', fontFamily: "'Exo 2',sans-serif" }}>
            Historical Date Range
          </h2>
          <span className="text-xs text-text-muted ml-auto" style={{ fontFamily: "'DM Mono',monospace" }}>
            Max 2 years
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end flex-wrap">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-text-muted tracking-wider uppercase" style={{ fontFamily: "'Exo 2',sans-serif" }}>
              Start Date
            </span>
            <DatePicker
              selected={startDate}
              onChange={handleStartChange}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              maxDate={yesterday}
              minDate={new Date('2015-01-01')}
              dateFormat="dd MMM yyyy"
            />
          </div>

          <div className="flex items-center self-end pb-2 text-text-muted text-sm">→</div>

          <div className="flex flex-col gap-1">
            <span className="text-xs text-text-muted tracking-wider uppercase" style={{ fontFamily: "'Exo 2',sans-serif" }}>
              End Date
            </span>
            <DatePicker
              selected={endDate}
              onChange={handleEndChange}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              maxDate={yesterday}
              dateFormat="dd MMM yyyy"
            />
          </div>

          <button
            onClick={load}
            disabled={loading || !location}
            className="px-6 py-2.5 rounded-xl font-bold text-sm tracking-wider uppercase transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'rgba(0,229,255,0.15)',
              border: '1px solid rgba(0,229,255,0.35)',
              color: '#00e5ff',
              fontFamily: "'Exo 2',sans-serif",
            }}
          >
            {loading ? 'Loading…' : 'Fetch Data'}
          </button>
        </div>

        {rangeInfo && (
          <p className="text-xs text-neon-green" style={{ fontFamily: "'DM Mono',monospace" }}>
            ✓ {rangeInfo}
          </p>
        )}

        {startDate && endDate && (
          <div className="flex gap-3 mt-1 flex-wrap">
            {[7, 30, 90, 180, 365].map(d => (
              <button
                key={d}
                onClick={() => {
                  const end = new Date(yesterday);
                  const start = new Date(end);
                  start.setDate(start.getDate() - d + 1);
                  setStartDate(start);
                  setEndDate(end);
                }}
                className="text-xs px-3 py-1 rounded-full transition-all hover:scale-105"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#546e7a', fontFamily: "'Exo 2',sans-serif" }}
              >
                {d}d
              </button>
            ))}
          </div>
        )}
      </div>

      {loading && <LoadingSpinner message="Fetching historical records..." />}
      <ErrorToast message={error} onDismiss={() => setError(null)} />

      {wxData && !loading && (
        <>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-widest uppercase text-text-muted" style={{ fontFamily: "'Exo 2',sans-serif" }}>
              Historical Charts
            </span>
            <span className="text-xs text-neon-cyan ml-1" style={{ fontFamily: "'DM Mono',monospace" }}>
              {rangeInfo}
            </span>
            <span className="text-xs text-text-muted ml-2" style={{ fontFamily: "'DM Mono',monospace" }}>
              — Scroll & zoom each chart
            </span>
          </div>
          <HistoricalCharts weather={wxData} airQuality={aqData} />
        </>
      )}

      {!wxData && !loading && (
        <div className="glass-card p-12 flex flex-col items-center gap-4 text-center">
          <span className="text-5xl opacity-40">📊</span>
          <p className="text-text-muted text-sm" style={{ fontFamily: "'Exo 2',sans-serif" }}>
            Select a date range above and click <strong className="text-neon-cyan">Fetch Data</strong> to load historical charts
          </p>
        </div>
      )}
    </div>
  );
}