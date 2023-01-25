const formEl = document.querySelector('.search-city-form');
const cityEl = document.querySelector('.city-input');
const stateEl = document.querySelector('.us-state-selector');
const currentWeatherEl = document.querySelector('.current-weather');
const forecastEl = document.querySelector('.forecast');
const recordsEl = document.querySelector('.history-list');

let APIkey = 'ec7477b8bf25c30e53208ecbb6569748';
let city = '';
let searchHistory = JSON.parse(localStorage.getItem('records')) || [];

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
            if (data.length === 0){
                console.log('wrong')
            }else{
                console.log(data);
                let lat = data[0].lat;
                let lon = data[0].lon;
                getWeatherForecast(lat, lon);
                saveHistoryToLocal(city, state);
            }
            cityEl.value=''
            stateEl[0].selected = true;
        }))
}

function saveHistoryToLocal(city, state) {
    console.log(city, state)
    let recordObj = {
        cityName: city,
        stateName: state
    }

    searchHistory.filter( (element, index) => {
        if (element.cityName === city) {
            searchHistory.splice(index, 1)
        }
    })

    searchHistory.push(recordObj);
    localStorage.setItem('records', JSON.stringify(searchHistory));
    renderRecords();
}

function renderRecords() {
    let recordsStr = ''
    for (let i = 0; i < searchHistory.length; i++){
        recordsStr += `<li><button class="btn" data-state="`+ searchHistory[i].stateName +`">`+ searchHistory[i].cityName +`</button></li>`
    }
    recordsEl.innerHTML = recordsStr;
}

recordsEl.addEventListener('click', function(e) {
    console.log(e.target.nodeName)
    if (e.target.nodeName !== 'BUTTON'){
        return;
    }
    let recordsCity = e.target.textContent;
    let recordsState = e.target.dataset.state;

    getCoordinates(recordsCity, recordsState)
})

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
            renderForecast(data);
        }))
}

function getDateByUNIXtimestamp(UNIXtimestamp) {
    let time = new Date(UNIXtimestamp * 1000);
    let month = time.getMonth() + 1;
    let date = time.getDate();
    let year = time.getFullYear().toString().slice(-2);

    return month + '/' + date + '/' + year;
}

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

function renderCurrentWeather(currentData){
    city = currentData.name;
    let currentDateString = getDateByUNIXtimestamp(currentData.dt);
    let currentWeatherDetail = getWeatherDetail(currentData);

    currentWeatherEl.innerHTML = 
    `<h2>`+ city + `(` + currentDateString +`)<span><img src="`+ currentWeatherDetail.weatherIconUrl +`" alt="weather-icon"></span></h2>
    <p>Temp: `+ currentWeatherDetail.fahrenheit +` &#8457</p>
    <p>Wind: `+ currentWeatherDetail.windSpeed +` MPH</p>
    <p>Humidity: `+ currentWeatherDetail.humidity +` %</p>`;
}

function renderForecast(forecastData) {
    let forecastList = '';

    let fiveDaysForecast = forecastData.list.filter( element =>{
        return element.dt_txt.includes('00:00:00');
    });

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

function init(){
    renderRecords();
}

init()