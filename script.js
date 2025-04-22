class WeatherInfo {
    constructor(city, time, date, currentTemp, feelsTemp, sunrise, sunset, weather, humidity, wind, pressure, uv) {
      this.city = city;
      this.time = time;
      this.date = date;
      this.currentTemp = currentTemp;
      this.feelsTemp = feelsTemp;
      this.sunrise = sunrise;
      this.sunset = sunset;
      this.weather = weather;
      this.humidity = humidity;
      this.wind = wind;
      this.pressure = pressure;
      this.uv = uv;
    }

    updateDOM() {
        document.getElementById("city-name").innerText = this.city;
        document.getElementById("time").innerText = this.time;
        document.getElementById("realTemp").innerText = `${this.currentTemp}°C`;
        document.getElementById("feelTemp").innerText = `${this.feelsTemp}°C`;
        document.getElementById("sunriseTime").innerText = `${this.sunriseTime} AM`;
        document.getElementById("sunsetTime").innerText = `${this.sunsetTime} PM`;
        document.getElementById("weather").innerHTML = this.weather;
        document.getElementById("humidity").innerText = `${this.humidity} %`;
        document.getElementById("windSpeed").innerText = `${this.windSpeed} km/h`;
        document.getElementById("pressure").innerText = `${this.pressure} hPa`;
        document.getElementById("uvIndex").innerText = this.uvIndex;
    }
}

const weather = new WeatherInfo("Fayetteville","13:03", "Wednesday, 23 Apr", 24, 22, "06:03", "06:53", "Sunny", 40, 2, 997, 8)
weather.updateDOM()

