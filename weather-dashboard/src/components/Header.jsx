import { Link, useLocation } from 'react-router-dom';
import { format } from 'date-fns';

export default function Header({ locationName = '' }) {
  const { pathname } = useLocation();

  return (
    <header className="relative z-20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 py-4 border-b border-[rgba(0,229,255,0.08)]">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <span className="text-2xl" aria-hidden>🌐</span>
        <div>
          <h1
            className="text-lg sm:text-xl font-bold tracking-widest uppercase"
            style={{ fontFamily: "'Orbitron', monospace", color: '#00e5ff' }}
          >
            AtmoSphere
          </h1>
          <p className="text-xs text-text-muted tracking-wide" style={{ fontFamily: "'Exo 2', sans-serif" }}>
            Weather Intelligence
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex items-center gap-1 sm:gap-2">
        <Link
          to="/"
          className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold tracking-wider uppercase transition-all rounded-t-lg
            ${pathname === '/' ? 'nav-active text-neon-cyan' : 'text-text-muted hover:text-text-primary'}`}
          style={{ fontFamily: "'Exo 2', sans-serif" }}
        >
          Daily
        </Link>
        <Link
          to="/historical"
          className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold tracking-wider uppercase transition-all rounded-t-lg
            ${pathname === '/historical' ? 'nav-active text-neon-cyan' : 'text-text-muted hover:text-text-primary'}`}
          style={{ fontFamily: "'Exo 2', sans-serif" }}
        >
          Historical
        </Link>
      </nav>

      {/* Location + time */}
      <div className="flex items-center gap-3 text-right">
        {locationName && (
          <span className="flex items-center gap-1 text-xs sm:text-sm text-neon-cyan" style={{ fontFamily: "'Exo 2', sans-serif" }}>
            <span>📍</span>
            <span className="max-w-35 truncate">{locationName}</span>
          </span>
        )}
        <span className="text-xs text-text-muted" style={{ fontFamily: "'DM Mono', monospace" }}>
          {format(new Date(), 'dd MMM HH:mm')}
        </span>
      </div>
    </header>
  );
}