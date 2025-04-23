class WeatherInfo {
    constructor(city) {
        this.city = city;
        this.clockInterval = null;
        this.nextDaysIconCode = [];
        this.iconCUrl = [];
        this.nextDaysTemp = [];
        this.nextDaysDate = [];

        this.nextHoursTime = [];
        this.nextHoursIconCode = [];
        this.iconDUrl = [];
        this.nextHoursTemp = [];
    }

    update(city) {
        this.city = city;
        this.fetchData();
    }

    fetchData() {
        const url = `http://api.openweathermap.org/data/2.5/weather?q=${this.city}&APPID=fe387d7cc44ff11e3753cdc9d2c7e85b&units=metric`;
        const url2 = `https://api.openweathermap.org/data/2.5/forecast?q=${this.city}&appid=fe387d7cc44ff11e3753cdc9d2c7e85b&units=metric`;
        fetch(url)
            .then(res => res.json())
            .then(data => {
                this.cityName = data.name;
                this.timezoneOffset = data.timezone;
                this.dt = data.dt;

                this.date = this.getLocalDate(data.timezone);
                this.currentTemp = data.main.temp;
                this.feelsTemp = data.main.feels_like;
                this.iconCode = data.weather[0].icon;
                this.iconUrl = `https://openweathermap.org/img/wn/${this.iconCode}@4x.png`;
                this.weather = data.weather[0].main;
                this.sunriseTime = this.convertTime(data.sys.sunrise, data.timezone);
                this.sunsetTime = this.convertTime(data.sys.sunset, data.timezone);
                this.humidity = data.main.humidity;
                this.windSpeed = data.wind.speed;
                this.pressure = data.main.pressure;
                this.uv = 5;

                this.startClock();
                this.updateDOM();
            })
            .catch(err => console.error("Weather fetch failed:", err));

        fetch(url2)
            .then(res => res.json())
            .then(data => {            
                const noonForecasts = data.list.filter(item => item.dt_txt.includes("12:00:00")).slice(0, 5);
                
                for (let i = 0; i < noonForecasts.length; i++) {
                    const forecast = noonForecasts[i];
                    this.nextDaysIconCode[i] = forecast.weather[0].icon;
                    this.iconCUrl[i] = `https://openweathermap.org/img/wn/${this.nextDaysIconCode[i]}.png`;
                    this.nextDaysTemp[i] = forecast.main.temp;
                    this.nextDaysDate[i] = this.formatDate(forecast.dt_txt);
                }
                

                for (let i = 0; i < 5; i++) {
                    this.nextHoursTime[i] = this.convertTimeB(data.list[i].dt, this.timezoneOffset); // if needed
                    this.nextHoursIconCode[i] = data.list[i].weather[0].icon;
                    this.iconDUrl[i] = `https://openweathermap.org/img/wn/${this.nextHoursIconCode[i]}@4x.png`;
                    this.nextHoursTemp[i] = data.list[i].main.temp;
                }
                this.updateDOM2();
              })
            .catch(err => console.error("Forecast fetch failed:", err));
    }

    // ex: 07:00 PM
    convertTime(unixTimestamp, timezoneOffset) {
        const date = new Date((unixTimestamp + timezoneOffset) * 1000);
        return date.toLocaleTimeString("en-US", {hour: '2-digit', minute: '2-digit', timeZone: 'UTC'});
    }
    
    // ex: 19:00
    convertTimeB(unixTimestamp, timezoneOffset) {
        const date = new Date((unixTimestamp + timezoneOffset) * 1000);
        return date.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC'});
    }

    getLocalTime() { 
        const nowUTC = Date.now(); // milliseconds
        const local = new Date(nowUTC + this.timezoneOffset * 1000);
        return local.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' });
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

    formatDate(dt_txt) {
        const date = new Date(dt_txt);
        return new Intl.DateTimeFormat('en-US', { weekday: 'long', day: 'numeric', month: 'short'}).format(date);
    }

    updateDOM() {
        document.getElementById("city-name").innerText = this.cityName;
        document.getElementById("date").innerText = this.date;

        document.getElementById("realTemp").innerText = `${Math.round(this.currentTemp)}°C`;
        document.getElementById("feelTemp").innerText = `${Math.round(this.feelsTemp)}°C`;
        document.getElementById("sunriseTime").innerText = this.sunriseTime;
        document.getElementById("sunsetTime").innerText = this.sunsetTime;
        document.getElementById("weatherIcon").src = this.iconUrl;
        document.getElementById("weather").innerHTML = this.weather;
        document.getElementById("humidity").innerText = `${this.humidity} %`;
        document.getElementById("windSpeed").innerText = `${Math.round(this.windSpeed)} km/h`;
        document.getElementById("pressure").innerText = `${this.pressure} hPa`;
        document.getElementById("uvIndex").innerText = this.uv;
    }
    updateDOM2() {
        document.getElementById("wIconC1").src = this.iconCUrl[0];
        document.getElementById("wIconC2").src = this.iconCUrl[1];
        document.getElementById("wIconC3").src = this.iconCUrl[2];
        document.getElementById("wIconC4").src = this.iconCUrl[3];
        document.getElementById("wIconC5").src = this.iconCUrl[4];
        document.getElementById("tempC1").innerText = `${Math.round(this.nextDaysTemp[0])}°C`;
        document.getElementById("tempC2").innerText = `${Math.round(this.nextDaysTemp[1])}°C`;
        document.getElementById("tempC3").innerText = `${Math.round(this.nextDaysTemp[2])}°C`;
        document.getElementById("tempC4").innerText = `${Math.round(this.nextDaysTemp[3])}°C`;
        document.getElementById("tempC5").innerText = `${Math.round(this.nextDaysTemp[4])}°C`;
        document.getElementById("dateC1").innerText = this.nextDaysDate[0];
        document.getElementById("dateC2").innerText = this.nextDaysDate[1];
        document.getElementById("dateC3").innerText = this.nextDaysDate[2];
        document.getElementById("dateC4").innerText = this.nextDaysDate[3];
        document.getElementById("dateC5").innerText = this.nextDaysDate[4];
        document.getElementById("timeD1").innerText = this.nextHoursTime[0];
        document.getElementById("timeD2").innerText = this.nextHoursTime[1];
        document.getElementById("timeD3").innerText = this.nextHoursTime[2];
        document.getElementById("timeD4").innerText = this.nextHoursTime[3];
        document.getElementById("timeD5").innerText = this.nextHoursTime[4];
        document.getElementById("wIconD1").src = this.iconDUrl[0];
        document.getElementById("wIconD2").src = this.iconDUrl[1];
        document.getElementById("wIconD3").src = this.iconDUrl[2];
        document.getElementById("wIconD4").src = this.iconDUrl[3];
        document.getElementById("wIconD5").src = this.iconDUrl[4];
        document.getElementById("tempD1").innerText = `${Math.round(this.nextHoursTemp[0])}°C`;
        document.getElementById("tempD2").innerText = `${Math.round(this.nextHoursTemp[1])}°C`;
        document.getElementById("tempD3").innerText = `${Math.round(this.nextHoursTemp[2])}°C`;
        document.getElementById("tempD4").innerText = `${Math.round(this.nextHoursTemp[3])}°C`;
        document.getElementById("tempD5").innerText = `${Math.round(this.nextHoursTemp[4])}°C`;

    }
}


let place = "Arkansas,us"
const weather = new WeatherInfo(place)
weather.fetchData()

let searchCity = "";

document.getElementById("searchInput").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      searchValue = document.getElementById("searchInput").value.trim();
      weather.update(searchValue);
    }
  });