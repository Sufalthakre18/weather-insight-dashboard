export default function LoadingSpinner({ message = 'Fetching data...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <div className="relative w-14 h-14">
        <div
          className="absolute inset-0 rounded-full border-2 border-transparent animate-spin"
          style={{ borderTopColor: '#00e5ff', borderRightColor: 'rgba(0,229,255,0.3)' }}
        />
        <div
          className="absolute inset-2 rounded-full border-2 border-transparent animate-spin"
          style={{ borderTopColor: '#69ff47', animationDirection: 'reverse', animationDuration: '0.8s' }}
        />
        <div className="absolute inset-0 flex items-center justify-center text-lg">🌡️</div>
      </div>
      <p className="text-text-muted text-sm tracking-widest uppercase animate-pulse" style={{ fontFamily: "'Exo 2', sans-serif" }}>
        {message}
      </p>
    </div>
  );
}