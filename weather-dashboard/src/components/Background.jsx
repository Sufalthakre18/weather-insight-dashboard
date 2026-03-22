import { useEffect } from 'react';

const WEATHER_CONFIG = {
  'weather-sunny':  { clouds: 1, cloudOpacity: 0.22, showRain: false, stars: 30 },
  'weather-cloudy': { clouds: 5, cloudOpacity: 0.55, showRain: false, stars: 12 },
  'weather-rainy':  { clouds: 5, cloudOpacity: 0.70, showRain: true,  stars: 3  },
  'weather-stormy': { clouds: 5, cloudOpacity: 0.80, showRain: true,  stars: 0  },
  'weather-snowy':  { clouds: 4, cloudOpacity: 0.60, showRain: false, stars: 8  },
};

const CLOUD_DEFS = [
  { cls: 'cloud-1', top: '8%',  delay: '0s'  },
  { cls: 'cloud-2', top: '22%', delay: '-12s' },
  { cls: 'cloud-3', top: '45%', delay: '-22s' },
  { cls: 'cloud-4', top: '65%', delay: '-6s'  },
  { cls: 'cloud-5', top: '80%', delay: '-18s' },
];

export default function Background({ weatherClass = 'weather-cloudy' }) {
  useEffect(() => {
    document.body.classList.remove(
      'weather-sunny','weather-cloudy','weather-rainy','weather-stormy','weather-snowy'
    );
    document.body.classList.add(weatherClass);
  }, [weatherClass]);

  const cfg = WEATHER_CONFIG[weatherClass] ?? WEATHER_CONFIG['weather-cloudy'];

  return (
    <div id="bg-canvas" aria-hidden="true">
      {Array.from({ length: cfg.stars }).map((_, i) => (
        <span
          key={i}
          className="star"
          style={{
            width: (Math.random() * 2 + 1) + 'px',
            height: (Math.random() * 2 + 1) + 'px',
            top: (Math.random() * 60) + '%',
            left: (Math.random() * 100) + '%',
            '--dur': (2 + Math.random() * 4) + 's',
            '--delay': (-Math.random() * 4) + 's',
          }}
        />
      ))}

      {CLOUD_DEFS.slice(0, cfg.clouds).map((c, i) => (
        <div
          key={i}
          className={'cloud ' + c.cls}
          style={{ opacity: cfg.cloudOpacity, animationDelay: c.delay, top: c.top }}
        />
      ))}

      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className={'rain-drop drop-' + (i + 1) + (cfg.showRain ? ' active' : '')}
        />
      ))}

      <div className="scan-line absolute inset-0" />
    </div>
  );
}