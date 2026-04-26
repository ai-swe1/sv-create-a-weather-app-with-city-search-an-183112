const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'static')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Simple placeholder for weather search – replace with real API call as needed
app.get('/api/weather/search', async (req, res) => {
  const city = req.query.city;
  if (!city) {
    return res.status(400).json({ error: 'city query param required' });
  }
  try {
    // Example using OpenWeatherMap – replace API_KEY with your own in production
    const apiKey = process.env.OPENWEATHER_API_KEY || 'YOUR_API_KEY';
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`);
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch weather data' });
    }
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 7‑day forecast endpoint – expects latitude and longitude
app.get('/api/weather/forecast', async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) {
    return res.status(400).json({ error: 'lat and lon query params required' });
  }
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY || 'YOUR_API_KEY';
    const response = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly,alerts&units=metric&appid=${apiKey}`);
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch forecast data' });
    }
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Fallback for SPA – serve index.html for any unknown route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'static', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});