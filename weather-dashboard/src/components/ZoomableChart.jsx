import { useState, useRef } from 'react';

export default function ZoomableChart({ title, children, dataLength, baseWidthPer = 32, minWidth = 500, height = 260, accent = '#d4a843' }) {
  const [zoom, setZoom] = useState(1);
  const wrapperRef = useRef(null);
  const chartWidth = Math.max(minWidth, dataLength * baseWidthPer * zoom);

  const handleZoomIn  = () => setZoom(z => Math.min(+(z * 1.5).toFixed(2), 6));
  const handleZoomOut = () => setZoom(z => Math.max(+(z / 1.5).toFixed(2), 0.4));
  const handleReset   = () => setZoom(1);

  return (
    <div className="glass-card p-4 flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {title && (
          <h3
            className="text-xs font-semibold tracking-widest uppercase"
            style={{ color: accent, fontFamily: "'Exo 2', sans-serif" }}
          >
            {title}
          </h3>
        )}
        <div className="flex items-center gap-1 ml-auto">
          <button
            onClick={handleZoomOut}
            className="w-7 h-7 flex items-center justify-center rounded text-xs font-bold transition-all hover:scale-110"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#e8c97a' }}
            title="Zoom out"
          >−</button>
          <button
            onClick={handleReset}
            className="px-2 h-7 flex items-center justify-center rounded text-xs transition-all hover:scale-110"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.35)' }}
            title="Reset zoom"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            onClick={handleZoomIn}
            className="w-7 h-7 flex items-center justify-center rounded text-xs font-bold transition-all hover:scale-110"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#e8c97a' }}
            title="Zoom in"
          >+</button>
        </div>
      </div>

      <div className="chart-scroll-wrapper" ref={wrapperRef}>
        <div style={{ width: chartWidth, minWidth: '100%' }}>
          {children(chartWidth, height)}
        </div>
      </div>
    </div>
  );
}