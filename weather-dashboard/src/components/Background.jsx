import { useEffect, useRef } from 'react';

export default function Background({ weatherClass = 'weather-cloudy', showRain = false }) {
  const bodyRef = useRef(document.body);

  useEffect(() => {
    const body = bodyRef.current;
    body.classList.remove('weather-sunny', 'weather-cloudy', 'weather-rainy', 'weather-stormy', 'weather-snowy');
    body.classList.add(weatherClass);
  }, [weatherClass]);

  return (
    <div id="bg-canvas" aria-hidden="true">
      {/* Stars */}
      {Array.from({ length: 60 }).map((_, i) => (
        <span
          key={i}
          className="star"
          style={{
            width:  `${Math.random() * 2 + 1}px`,
            height: `${Math.random() * 2 + 1}px`,
            top:    `${Math.random() * 100}%`,
            left:   `${Math.random() * 100}%`,
            '--dur':   `${2 + Math.random() * 4}s`,
            '--delay': `${-Math.random() * 4}s`,
            opacity: 0.2 + Math.random() * 0.5,
          }}
        />
      ))}

      {/* Clouds */}
      <div className="cloud cloud-1" />
      <div className="cloud cloud-2" />
      <div className="cloud cloud-3" />
      <div className="cloud cloud-4" />
      <div className="cloud cloud-5" />

      {/* Rain drops */}
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className={`rain-drop drop-${i + 1} ${showRain ? 'active' : ''}`} />
      ))}

      {/* Scan-line overlay */}
      <div className="scan-line absolute inset-0" />
    </div>
  );
}