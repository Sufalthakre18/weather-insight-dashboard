import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense } from 'react';
import Background from './components/Background';
import Header from './components/Header';
import LoadingSpinner from './components/LoadingSpinner';
import Page1 from './pages/Page1';
import Page2 from './pages/Page2';
import useGeolocation from './hooks/useGeolocation';

export default function App() {
  const { location, loading: geoLoading } = useGeolocation();

  return (
    <BrowserRouter>
      <Background
        weatherClass="weather-cloudy"
        showRain={false}
      />

      <div className="relative z-10 min-h-screen flex flex-col">
        <Header locationName={location?.name} />

        <main className="flex-1 max-w-screen-2xl w-full mx-auto">
          {geoLoading ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <LoadingSpinner message="Detecting your location..." />
            </div>
          ) : (
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/"           element={<Page1 location={location} />} />
                <Route path="/historical" element={<Page2 location={location} />} />
              </Routes>
            </Suspense>
          )}
        </main>

        <footer className="text-center py-4 text-xs text-[#2a3540] border-t border-[rgba(255,255,255,0.04)]" style={{ fontFamily: "'DM Mono',monospace" }}>
          AtmoSphere — Powered by Open-Meteo API · {new Date().getFullYear()}
        </footer>
      </div>
    </BrowserRouter>
  );
}