export default function MetricCard({ icon, label, value, unit, accent = '#f0e6c8', sub }) {
  return (
    <div className="glass-card p-4 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="text-xl" aria-hidden>{icon}</span>
        <span
          className="text-xs font-semibold tracking-widest uppercase text-[rgba(255,255,255,0.45)]"
          style={{ fontFamily: "'Exo 2', sans-serif" }}
        >
          {label}
        </span>
      </div>
      <div className="flex items-end gap-1 mt-1">
        <span
          className="metric-value text-2xl sm:text-3xl leading-none"
          style={{ color: accent }}
        >
          {value ?? '—'}
        </span>
        {unit && (
          <span className="text-xs text-[rgba(255,255,255,0.45)] mb-1" style={{ fontFamily: "'DM Mono', monospace" }}>
            {unit}
          </span>
        )}
      </div>
      {sub && (
        <p className="text-xs text-[rgba(255,255,255,0.45)] mt-1" style={{ fontFamily: "'Exo 2', sans-serif" }}>
          {sub}
        </p>
      )}
    </div>
  );
}