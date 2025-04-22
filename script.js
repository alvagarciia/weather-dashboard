class WeatherInfo {
    constructor(city) {
        this.city = city;
        this.clockInterval = null;
    }

    update(city) {
        this.city = city;
        this.fetchData();
    }

    fetchData() {
        const url = `http://api.openweathermap.org/data/2.5/weather?q=${this.city}&APPID=fe387d7cc44ff11e3753cdc9d2c7e85b&units=metric`
        fetch(url)
            .then(res => res.json())
            .then(data => {
                this.cityName = data.name;
                this.timezoneOffset = data.timezone;
                this.dt = data.dt;

                this.date = this.getLocalDate(data.timezone);
                this.currentTemp = data.main.temp;
                this.feelsTemp = data.main.feels_like;
                this.weather = data.weather[0].main;
                this.sunriseTime = this.convertTime(data.sys.sunrise, data.timezone);
                this.sunsetTime = this.convertTime(data.sys.sunset, data.timezone);
                this.humidity = data.main.humidity;
                this.windSpeed = data.wind.speed;
                this.pressure = data.main.pressure;
                this.uv = 5;

                this.updateDOM();
                this.startClock();
            })
            .catch(err => console.error("Weather fetch failed:", err));
    }

    convertTime(unixTimestamp, timezoneOffset) {
        const date = new Date((unixTimestamp + timezoneOffset) * 1000);
        return date.toLocaleTimeString("en-US", {hour: '2-digit', minute: '2-digit', timeZone: 'UTC'});
    }
    
    getLocalTime() { 
        const nowUTC = Date.now(); // milliseconds
        const local = new Date(nowUTC + this.timezoneOffset * 1000);
        return local.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
    }

    startClock() {
        if (this.clockInterval) 
            clearInterval(this.clockInterval); // prevent stacking intervals
        this.clockInterval = setInterval(() => {
            document.getElementById("time").innerText = this.getLocalTime();
        }, 1000); // update every second
        // Set it immediately too:
        document.getElementById("time").innerText = this.getLocalTime();
    }

    getLocalDate(timezoneOffset) {
        const now = new Date();
        const local = new Date(now.getTime() + timezoneOffset * 1000);
        return local.toLocaleDateString("en-US", {weekday: 'long', month: 'short', day: 'numeric'});
    }

    updateDOM() {
        document.getElementById("city-name").innerText = this.cityName;
        document.getElementById("time").innerText = this.time;
        document.getElementById("date").innerText = this.date;
        document.getElementById("realTemp").innerText = `${Math.round(this.currentTemp)}°C`;
        document.getElementById("feelTemp").innerText = `${Math.round(this.feelsTemp)}°C`;
        document.getElementById("weather").innerHTML = this.weather;
        document.getElementById("sunriseTime").innerText = this.sunriseTime;
        document.getElementById("sunsetTime").innerText = this.sunsetTime;
        document.getElementById("humidity").innerText = `${this.humidity} %`;
        document.getElementById("windSpeed").innerText = `${Math.round(this.windSpeed)} km/h`;
        document.getElementById("pressure").innerText = `${this.pressure} hPa`;
        document.getElementById("uvIndex").innerText = this.uv;
    }
}

// let place = "London,uk"
// let place = "Beijing,chi"
let place = "Arkansas,us"
let weather = new WeatherInfo(place)
weather.fetchData()

let searchCity = "";

document.getElementById("searchInput").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      searchValue = document.getElementById("searchInput").value.trim();
      weather.update(searchValue);
    }
  });