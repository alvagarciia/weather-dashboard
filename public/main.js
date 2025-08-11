function showLoading() {
    document.getElementById("loading-overlay").style.display = "flex";
}

function hideLoading() {
    document.getElementById("loading-overlay").style.display = "none";
}

class WeatherInfo {
    constructor(cityInput) {
        this.cityInput = cityInput;
        this.latInput = null;
        this.lonInput = null;
        this.clockInterval = null;
        this.nextDaysIconCode = [];
        this.iconCUrl = [];
        this.nextDaysTemp = [];
        this.nextDaysDate = [];

        this.nextHoursTime = [];
        this.nextHoursIconCode = [];
        this.iconDUrl = [];
        this.nextHoursTemp = [];
        this.isInitialLoad = true; // Track if this is the first load
    }

    update(cityInput) {
        this.cityInput = cityInput;
        this.fetchData();
    }

    async fetchData() {
        console.log("fetching!")
        
        // Only show loading overlay on initial page load
        if (this.isInitialLoad) {
            showLoading();
        }

        let urls = []
        if(this.cityInput) {
            urls = [`http://api.openweathermap.org/data/2.5/weather?q=${this.cityInput}&APPID=fe387d7cc44ff11e3753cdc9d2c7e85b&units=metric`,`https://api.openweathermap.org/data/2.5/forecast?q=${this.cityInput}&appid=fe387d7cc44ff11e3753cdc9d2c7e85b&units=metric`]
        }
        else {
            urls = [`http://api.openweathermap.org/data/2.5/weather?lat=${this.latInput}&lon=${this.lonInput}&APPID=fe387d7cc44ff11e3753cdc9d2c7e85b&units=metric`, `https://api.openweathermap.org/data/2.5/forecast?lat=${this.latInput}&lon=${this.lonInput}&appid=fe387d7cc44ff11e3753cdc9d2c7e85b&units=metric`]
        }

        try {
            // Use Promise.all to wait for both API calls to complete
            const [weatherResponse, forecastResponse] = await Promise.all([
                fetch(urls[0]).then(res => res.json()),
                fetch(urls[1]).then(res => res.json())
            ]);

            // Process weather data
            this.cityName = weatherResponse.name;
            this.timezoneOffset = weatherResponse.timezone;
            this.dt = weatherResponse.dt;

            this.date = this.getLocalDate(weatherResponse.timezone);
            this.currentTemp = weatherResponse.main.temp;
            this.feelsTemp = weatherResponse.main.feels_like;
            this.iconCode = weatherResponse.weather[0].icon;
            this.iconUrl = `https://openweathermap.org/img/wn/${this.iconCode}@4x.png`;
            this.weather = weatherResponse.weather[0].main;
            this.sunriseTime = this.convertTime(weatherResponse.sys.sunrise, weatherResponse.timezone);
            this.sunsetTime = this.convertTime(weatherResponse.sys.sunset, weatherResponse.timezone);
            this.humidity = weatherResponse.main.humidity;
            this.windSpeed = weatherResponse.wind.speed;
            this.pressure = weatherResponse.main.pressure;
            this.uv = 5;

            // Process forecast data
            let hourOffset = this.timezoneOffset / -3600;
            let hour = (hourOffset + 12) % 24;
            if(hour % 3 == 1)
                hour -= 1;
            else if(hour % 3 == 2)
                hour += 1;
            let time = hour.toString() + ":00:00"
            const noonForecasts = forecastResponse.list.filter(item => item.dt_txt.includes(time)).slice(0, 5);
            
            for (let i = 0; i < noonForecasts.length; i++) {
                const forecast = noonForecasts[i];
                this.nextDaysIconCode[i] = forecast.weather[0].icon;
                this.iconCUrl[i] = `https://openweathermap.org/img/wn/${this.nextDaysIconCode[i]}.png`;
                this.nextDaysTemp[i] = forecast.main.temp;
                this.nextDaysDate[i] = this.formatDate(forecast.dt_txt);
            }

            for (let i = 0; i < 5; i++) {
                this.nextHoursTime[i] = this.convertTimeB(forecastResponse.list[i].dt, this.timezoneOffset);
                this.nextHoursIconCode[i] = forecastResponse.list[i].weather[0].icon;
                this.iconDUrl[i] = `https://openweathermap.org/img/wn/${this.nextHoursIconCode[i]}@4x.png`;
                this.nextHoursTemp[i] = forecastResponse.list[i].main.temp;
            }
            this.nextHoursWeather = forecastResponse.list[0].weather[0].description;

            // Start clock and update DOM
            this.startClock();
            this.updateDOM();
            this.updateDOM2();

            // Hide loading overlay only if it was shown (initial load)
            if (this.isInitialLoad) {
                // Use requestAnimationFrame to ensure DOM updates are rendered
                requestAnimationFrame(() => {
                    hideLoading();
                });
                // Mark that initial load is complete
                this.isInitialLoad = false;
            }

        } catch (err) {
            console.error("Error fetching weather data:", err);
            // Hide loading even on error, but only if it was shown
            if (this.isInitialLoad) {
                requestAnimationFrame(() => {
                    hideLoading();
                });
                this.isInitialLoad = false;
            }
        }
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

    getCurrentLocation() {
        if(navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.latInput = position.coords.latitude;
                    this.lonInput = position.coords.longitude;
                    this.update(null);
                },
                (error) => {
                    console.error("Error getting location:", error);
                }
            )
        }
        else
            alert("Geolocation is not supported by this browser.");
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


    async magic() {
        const prompt = `It's currently ${this.currentTemp}°C and ${this.weather}. Also, the time is ${this.getLocalTime()}, and we are in ${this.cityName}.`;

        //const prompt = `It's currently ${this.currentTemp}°C and ${this.weather}, and in less than 3 hours it'll be ${this.nextHoursTemp[0]}°C and ${this.nextHoursWeather}. Also, time is ${this.getLocalTime()}, and we are in ${this.cityName}. Suggest a fun activity either indoor or outdoors if appropriate for the time. Answer in 300 characters or less.`;
    
        try {
            const response = await fetch('/get-activity', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt }),
            });
    
            if (!response.ok) {
                throw new Error('Failed to fetch AI suggestion');
            }
    
            const data = await response.json();
            const aiSuggestion = data.suggestion;
    
            // Update the response div with the AI's suggestion
            document.getElementById("response").innerText = aiSuggestion;
        } catch (err) {
            console.error("Error fetching AI response:", err);
            document.getElementById("response").innerText = "Sorry, couldn't fetch a suggestion.";
        }
    }
}

// Initialize Weather
// let place = "sydney,aus"
// const weather = new WeatherInfo(null)
// weather.getCurrentLocation();
const weather = new WeatherInfo('sydney,aus')
window.weather = weather;
weather.fetchData();

// For search Bar
let searchCity = "";
const searchBar = document.getElementById("searchInput");
searchBar.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      searchCity = searchBar.value.trim();
      searchBar.value = ""
      weather.update(searchCity);
    }
});
