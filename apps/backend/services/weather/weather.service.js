const axios = require('axios');

class WeatherService {
  constructor() {
    this.apiKey = process.env.OPENWEATHER_KEY;
    this.baseUrl = 'https://api.openweathermap.org/data/2.5';
  }

  async getCurrentWeather(lat, lon) {
    const response = await axios.get(`${this.baseUrl}/weather`, {
      params: { lat, lon, appid: this.apiKey, units: 'metric', lang: 'th' },
    });

    return {
      temp: response.data.main.temp,
      humidity: response.data.main.humidity,
      rainfall: response.data.rain?.['1h'] || 0,
      description: response.data.weather[0].description,
    };
  }

  async get7DayForecast(lat, lon) {
    const response = await axios.get(`${this.baseUrl}/forecast`, {
      params: { lat, lon, appid: this.apiKey, units: 'metric', lang: 'th' },
    });

    return response.data.list.slice(0, 7).map(item => ({
      date: new Date(item.dt * 1000),
      temp: item.main.temp,
      rainfall: item.rain?.['3h'] || 0,
      description: item.weather[0].description,
    }));
  }
}

module.exports = WeatherService;
