// store elements in variables
const formEl = document.querySelector('.search-city-form');
const cityEl = document.querySelector('.city-input');
const resultEl = document.querySelector('.result');
const stateEl = document.querySelector('.us-state-selector');
const currentWeatherEl = document.querySelector('.current-weather');
const forecastEl = document.querySelector('.forecast');
const recordsEl = document.querySelector('.history-list');

// declare variables
let APIkey = 'ec7477b8bf25c30e53208ecbb6569748';
let searchHistory = JSON.parse(localStorage.getItem('records')) || [];

// get city name function
function getCityStateName(e) {
    e.preventDefault();

    let cityName = cityEl.value;
    let stateName = stateEl.value;
    getCoordinates(cityName,stateName);
    loadingAnimate();
}

// Loading animation
function loadingAnimate() {
    currentWeatherEl.innerHTML = 
    `<div class="loader">
    <div class="loader-wheel"></div>
    <div class="loader-text"></div>
    </div>`
}

// get a city's coordinates
function getCoordinates(cityName,stateName) {
    // expand the result area
    resultEl.classList.add('expand');
    // chaining the parameters with API url
    let geocodingBaseUrl = 'https://api.openweathermap.org/geo/1.0/direct';
    let geocodingParameters = '?q='+ cityName + ','+ stateName +',US&limit=10&appid=';
    let geocodingAPIurl = geocodingBaseUrl + geocodingParameters + APIkey;

    // fetching data from the API
    fetch( geocodingAPIurl, {method: 'get'} )
        .then((response => {
            if (response.ok){
                return response.json();
            }
        })).then((data => {
            // if there's no data, user entered the nonexistent city
            if (data.length === 0){
                canNotFound();
            }else{
                let lat = data[0].lat;
                let lon = data[0].lon;
                let city = data[0].name;
                getWeatherForecast(lat, lon);
                saveHistoryToLocal(city, stateName);
            }
            // reset the searching area
            cityEl.value=''
            stateEl[0].selected = true;
        }))
}

// render the message when a city can't be found
function canNotFound() {
    currentWeatherEl.innerHTML = 
    `<h2 class="alert">Sorry, City not found. <br>
    Please check the name or state and give it a try!</h2>`
}

// save the search history to local storage
function saveHistoryToLocal(city, state) {
    let recordObj = {
        cityName: city,
        stateName: state
    }
    // if there's an existing same record, remove it from the old history
    searchHistory.map( (element, index) => {
        if (element.cityName === city) {
            searchHistory.splice(index, 1)
            }
        })
    // the maximum history is 5 , otherwise remove the oldest history
    if ( searchHistory.length === 5){
        searchHistory.splice(0, 1);
    }
    // push the new history to local storage and render to the browser
    searchHistory.push(recordObj);
    localStorage.setItem('records', JSON.stringify(searchHistory));
    renderRecords();
}

// render search history function
function renderRecords() {
    let recordsStr = ''
    for (let i = 0; i < searchHistory.length; i++){
        recordsStr += `<li><button class="btn" data-state="`+ searchHistory[i].stateName +`">`+ searchHistory[i].cityName +`</button></li>`
    }
    recordsEl.innerHTML = recordsStr;
}

// get weather's information from current weather API and forecast weather API
function getWeatherForecast(lat, lon) {
    // parameters is generic
    let parameters = '?lat=' + lat + '&lon=' + lon + '&appid=';
    // forecast weather API url
    let forecastBaseUrl = 'https://api.openweathermap.org/data/2.5/forecast';
    let forecastAPIurl = forecastBaseUrl + parameters + APIkey;
    // current weather API url
    let weatherBaseUrl = 'https://api.openweathermap.org/data/2.5/weather';
    let weatherAPIurl = weatherBaseUrl + parameters + APIkey;

    // fetching data from current weather API
    fetch( weatherAPIurl, {method: 'get'})
    .then((response) => {
        if (response.ok){
            return response.json();
        }
    }).then((data => {
        renderCurrentWeather(data);
    }))
    
    // fetching data from forecast weather API
    fetch( forecastAPIurl, {method: 'get'})
        .then((response) => {
            if (response.ok){
                return response.json();
            }
        }).then((data => {
            renderForecast(data);
        }))
}

// calculate the time by UNIX timestamp then return
function getDateByUNIXtimestamp(UNIXtimestamp) {
    let time = new Date(UNIXtimestamp * 1000);
    let month = time.getMonth() + 1;
    let date = time.getDate();
    let year = time.getFullYear().toString().slice(-2);

    return month + '/' + date + '/' + year;
}

// function to return the weather's detail information
function getWeatherDetail(data) {
    let tempKelvin = data.main.temp;
    let weatherIconCode = data.weather[0].icon;
    
    return {
        tempKelvin: data.main.temp,
        fahrenheit: ((tempKelvin - 273) * 1.8 + 32).toFixed(1),
        windSpeed: data.wind.speed,
        humidity: data.main.humidity,
        weatherIconUrl: 'https://openweathermap.org/img/wn/'+ weatherIconCode +'@2x.png'
    }
}

// render current weather info on the browser
function renderCurrentWeather(currentData){
    let city = currentData.name;
    let currentDateString = getDateByUNIXtimestamp(currentData.dt);
    let currentWeatherDetail = getWeatherDetail(currentData);
    
    currentWeatherEl.innerHTML = 
    `<h2>`+ city + ` (` + currentDateString +`)<span><img src="`+ currentWeatherDetail.weatherIconUrl +`" alt="weather-icon"></span></h2>
    <p>Temp: `+ currentWeatherDetail.fahrenheit +` &#8457</p>
    <p>Wind: `+ currentWeatherDetail.windSpeed +` MPH</p>
    <p>Humidity: `+ currentWeatherDetail.humidity +` %</p>
    <hr/>`;
}

// render forecast weather info on the browser
function renderForecast(forecastData) {
    let forecastList = '';
    // return a new array of each day's forecast
    let fiveDaysForecast = forecastData.list.filter( element =>{
        return element.dt_txt.includes('00:00:00');
    });

    // chaining the forecast list
    for (let i = 0; i < fiveDaysForecast.length; i++ ){
        let forecastDateString = getDateByUNIXtimestamp(fiveDaysForecast[i].dt);
        let forecastWeatherDetail = getWeatherDetail(fiveDaysForecast[i])

        forecastList += 
        `<li>
            <h3>`+ forecastDateString +`</h3>
            <div class="weather-icon"><img src="`+ forecastWeatherDetail.weatherIconUrl +`" alt="weather-icon"></div>
            <p>Temp: `+ forecastWeatherDetail.fahrenheit +` &#8457</p>
            <p>Wind: `+ forecastWeatherDetail.windSpeed +` MPH</p>
            <p>Humidity: `+ forecastWeatherDetail.humidity +` %</p>
        </li>`
    }
    
    forecastEl.innerHTML = 
    `<h2>5-Day Forecast</h2>
    <ul class="forecast-list">`+ forecastList +`</ul>`
}

// trigger the function only when the button got clicked
function clickHistory(e) {
    if (e.target.nodeName !== 'BUTTON'){
        return;
    }

    let recordsCity = e.target.textContent;
    let recordsState = e.target.dataset.state;
    getCoordinates(recordsCity, recordsState)
    loadingAnimate();
}

// add eventlistener to the searching form and history button
formEl.addEventListener('submit', getCityStateName);
recordsEl.addEventListener('click', clickHistory)

// initial function, render the search result if there's any
function init(){
    renderRecords();
}

// fire initial function
init()