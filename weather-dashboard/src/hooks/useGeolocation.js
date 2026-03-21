import { useState, useEffect } from 'react';

export default function useGeolocation() {
  const [location, setLocation] = useState(null);
  const [error, setError]       = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported by this browser.');
      setLoading(false);
      setLocation({ lat: 28.6139, lon: 77.2090, name: 'New Delhi' });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        let name = 'Your Location';
        try {
          const r = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
          );
          if (r.ok) {
            const d = await r.json();
            name = d.city || d.locality || d.principalSubdivision || 'Your Location';
          }
        } catch (e) {
            console.error("Reverse geocode failed", e);
        }
        setLocation({ lat, lon, name });
        setLoading(false);
      },
      () => {
        // Permission denied — fallback to New Delhi
        setLocation({ lat: 28.6139, lon: 77.2090, name: 'New Delhi' });
        setLoading(false);
      },
      { timeout: 8000, maximumAge: 60000 }
    );
  }, []);

  return { location, error, loading };
}