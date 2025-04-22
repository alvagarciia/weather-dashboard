// Initialize & declare Variables
let city = "Fayetteville"
let time = "13:03"
let date = "Wednesday, 23 Apr"

let currentTemp = 24
let feelsTemp = 22
let sunriseTime = "06:03"
let sunsetTime = "06:53"
let weather = "Sunny"
let humidity = 40
let windSpeed = 2
let pressure = 997
let uvIndex = 8 

// Update HTML elements
document.getElementById("city-name").innerText = city;
document.getElementById("time").innerText = time;
document.getElementById("date").innerText = date;

document.getElementById("realTemp").innerText = `${currentTemp}°C`;
document.getElementById("feelTemp").innerText = `${feelsTemp}°C`;
document.getElementById("sunriseTime").innerText = `${sunriseTime} AM`;
document.getElementById("sunsetTime").innerText = `${sunsetTime} PM`;
document.getElementById("weather").innerHTML = weather;
document.getElementById("humidity").innerText = `${humidity} %`;
document.getElementById("windSpeed").innerText = `${windSpeed} km/h`;
document.getElementById("pressure").innerText = `${pressure} hPa`;
document.getElementById("uvIndex").innerText = uvIndex;

