const formEl = document.querySelector('.search-city-form');
const cityEl = document.querySelector('.city-input');
const stateEl = document.querySelector('.us-state-selector');
const currentWeatherEl = document.querySelector('.current-weather');
const forecastEl = document.querySelector('.forecast');

// const searchBtnEL = document.querySelector('.search-btn');
let APIkey = 'ec7477b8bf25c30e53208ecbb6569748';

formEl.addEventListener('submit', getCityStateName);

function getCityStateName(e) {
    e.preventDefault();
    let cityName = cityEl.value;
    let stateName = stateEl.value;
    console.log(cityName)
    console.log(stateName)
    
    getCoordinates(cityName,stateName);
}

function getCoordinates(city,state) {
    let geocodingBaseUrl = 'https://api.openweathermap.org/geo/1.0/direct';
    let geocodingParameters = '?q='+ city + ','+ state +',US&limit=10&appid=';
    let geocodingAPIurl = geocodingBaseUrl + geocodingParameters + APIkey;

    fetch( geocodingAPIurl, {method: 'get'} )
        .then((response => {
            if (response.ok){
                console.log(response)
                return response.json();
            }
        })).then((data => {
            console.log(data);
            let lat = data[0].lat;
            let lon = data[0].lon;
            
            getWeatherForecast(lat, lon);
        }))
}

function getWeatherForecast(lat, lon) {
    let forecastBaseUrl = 'https://api.openweathermap.org/data/2.5/forecast';
    let weatherBaseUrl = 'https://api.openweathermap.org/data/2.5/weather';
    let forecastParameters = '?lat=' + lat + '&lon=' + lon + '&appid=';
    let forecastAPIurl = forecastBaseUrl + forecastParameters + APIkey;
    let weatherAPIurl = weatherBaseUrl + forecastParameters + APIkey;
    
    fetch( weatherAPIurl, {method: 'get'})
        .then((response) => {
            if (response.ok){
                return response.json();
            }
        }).then((data => {
            renderCurrentWeather(data);
        }))

    fetch( forecastAPIurl, {method: 'get'})
        .then((response) => {
            if (response.ok){
                return response.json();
            }
        }).then((data => {
            console.log(data);
        }))
}

function renderCurrentWeather(currentData){
    console.log(currentData);

    let UNIXtimestamp = currentData.dt;
    let time = new Date(UNIXtimestamp * 1000);
    let year = time.getFullYear();
    let month = time.getMonth() + 1;
    let date = time.getDate();
    let currentDateString = '('+ month + '/' + date + '/' + year +')';

    let city = currentData.name;
    let tempKelvin = currentData.main.temp;
    let fahrenheit = ((tempKelvin - 273) * 1.8 + 32).toFixed(1);
    let celsius = (tempKelvin - 273).toFixed(1);
    let windSpeed = currentData.wind.speed;
    let humidity = currentData.main.humidity;
    let weatherIconCode = currentData.weather[0].icon;
    let weatherIconUrl = 'https://openweathermap.org/img/wn/'+ weatherIconCode +'@2x.png';

    currentWeatherEl.innerHTML = 
    `<h2>`+ city +` `+ currentDateString +`<span><img src="`+ weatherIconUrl +`" alt="weather-icon"></span></h2>
    <p>Temp: `+ celsius +` &#8451 / `+ fahrenheit +` &#8457</p>
    <p>Wind: `+ windSpeed +` MPH</p>
    <p>Humidity: `+ humidity +` %</p>`;

}