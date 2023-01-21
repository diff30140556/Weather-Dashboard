const formEl = document.querySelector('.search-city-form');
const cityEl = document.querySelector('.city-input');
const stateEl = document.querySelector('.us-state-selector');
const searchBtnEL = document.querySelector('.search-btn');




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
    let baseUrl = 'http://api.openweathermap.org/geo/1.0/';
    let parameters = 'direct?q='+ city + ','+ state +',US&limit=10&appid=';
    let APIkey = 'ec7477b8bf25c30e53208ecbb6569748'
    let apiUrl = baseUrl + parameters + APIkey;

    fetch( apiUrl, {method:'get'} )
        .then((response => {
            if (response.ok){
                console.log(response)
                return response.json();
            }
        })).then((data => {
            console.log(data);
        }))
}

