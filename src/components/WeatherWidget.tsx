import { useEffect, useState } from 'react';

type Weather = { temp: number; emoji: string; label: string };

const codeToCondition = (code: number): { emoji: string; label: string } =>
  code === 0   ? { emoji: '☀️', label: 'Klart' }
  : code <= 3  ? { emoji: '⛅', label: 'Delvist skyet' }
  : code <= 48 ? { emoji: '🌫️', label: 'Tåge' }
  : code <= 67 ? { emoji: '🌧️', label: 'Regn' }
  : code <= 77 ? { emoji: '❄️', label: 'Sne' }
  : code <= 82 ? { emoji: '🌦️', label: 'Byger' }
  : { emoji: '⛈️', label: 'Tordenvejr' };

export default function WeatherWidget() {
  const [weather, setWeather] = useState<Weather | null>(null);

  useEffect(() => {
    fetch('https://api.open-meteo.com/v1/forecast?latitude=55.6761&longitude=12.5683&current=temperature_2m,weather_code&timezone=Europe%2FCopenhagen')
      .then(r => r.json())
      .then(data => {
        const code: number = data.current.weather_code;
        const temp = Math.round(data.current.temperature_2m);
        setWeather({ temp, ...codeToCondition(code) });
      })
      .catch(() => {});
  }, []);

  if (!weather) return <span className="muted">—</span>;

  return (
    <div className="weather-body">
      <span className="weather-emoji">{weather.emoji}</span>
      <span className="weather-temp">{weather.temp}°</span>
      <span className="weather-label">{weather.label}</span>
    </div>
  );
}
