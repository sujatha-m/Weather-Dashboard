let APIKey = '166a433c57516f51dfab1f7edaed8413'; //Key for WeatherAPI calls

let cityName = ''; //city name entered by user in the search input

//check if history has any entry in local storage from last run
let cityHistory = JSON.parse(window.localStorage.getItem('history')) || []

//if history has entries, call showWeatherInfo to display the last city's data
if (cityHistory.length > 0) {
  showWeatherInfo(cityHistory[cityHistory.length - 1]);
}

//process history rendering for each city in the list
for (let i = 0; i < cityHistory.length; i++) {
  addToHistory(cityHistory[i]);
}

InitWeatherPage();

//Main trigger that sets up the search button click with showWeatherInfo function
function InitWeatherPage() {
  document
    .getElementById('searchButton')
    .addEventListener('click', function (event) {
      event.preventDefault();
      cityName = document.getElementById("search-value").value;
      document.getElementById("search-value").value = "";

      showWeatherInfo(cityName);
    })
}

//Main function that handles overall WeatherInfo data processing and display for a city
function showWeatherInfo(cityName) {
  getCurrentWeather(cityName);
  getForecast(cityName);
}

//wrapper function to be used in assignment of onlick attribute to list item (below)
function wrapper() {
  showWeatherInfo(this.textContent);
}

//function that renders history by adding each city as list item per row
//the onlick attribute of each city from the list is set to call showWeatherInfo for that city
function addToHistory(name) {
  let li = document.createElement("li");
  li.setAttribute("class", "list-group-item list-group-item-action");
  li.textContent = name;
  li.onclick = wrapper;
  document.getElementById('history').appendChild(li);
}

//function that handles getting the UVIndex data from WeatherAPI,process recieved data and 
//append data to the box for display
function getUVIndex(box, lat, lon) {
  // Here we run our AJAX call to the OpenWeatherMap forecast UV url API
  let UVURL = "https://api.openweathermap.org/data/2.5/uvi/forecast?appid=" + APIKey + '&lat=' + lat + '&lon=' + lon;

  fetch(UVURL)
    .then(function (response) {
      return response.json()
    })
    .then(function (data) {

      let UVIdex = document.createElement("p");
      UVIdex.textContent = "UV Index :";
      let button = document.createElement("span");
      button.textContent = data[0].value;
      //button.setAttribute("class"," ")
      UVIdex.appendChild(button);
      if (data[0].value < 3) {
        button.setAttribute("class", "badge badge-success")
      } else if (data[0].value < 7) {
        button.setAttribute("class", "badge badge-warning")
      } else {
        button.setAttribute("class", "badge badge-danger")
      }
      box.appendChild(UVIdex);

    });
}

//function that handles getting the current date weather info for a city from OpenWeather API.
//it processes the received data and sets up Temperature,Humidity,windspeed and UV index
//information to be displayed on the page
function getCurrentWeather(cityName) {
  let queryURL =
    'https://api.openweathermap.org/data/2.5/weather?q=' + cityName + '&appid=' + APIKey;

  // Here we run our AJAX call to the OpenWeatherMap API
  fetch(queryURL)
    .then(function (response) {
      if (response.ok) {
        // Decode the JSON response.body
        return response.json()
      }
      throw new Error("Invalid cityName passed to getCurrentWeather");
    })

    // We store all of the retrieved data inside of an object called "data"
    // NOTE: we could name the variable for the function parameter anything
    // that makes sense for our application. It does not need to be called data.
    .then(function (data) {
      // create history link for this search

      if (cityHistory.indexOf(cityName) === -1) {
        cityHistory.push(cityName);
        window.localStorage.setItem('history', JSON.stringify(cityHistory));
        addToHistory(cityName);
      }
      // Log the queryURL
      console.log(queryURL)
      // Log the object retreived from the API
      console.log(data)
      document.getElementById("today").innerHTML = "";
      let box = document.createElement("div");
      box.setAttribute("class", "bg-light m-4 p-4");

      let DateEl = document.createElement("h3");
      DateEl.textContent = (data.name + ' (' + new Date().toLocaleDateString() + ')');

      box.appendChild(DateEl);
      let temp = document.createElement("p");
      let tempC = data.main.temp - 273.15;
      let tempF = tempC * (9 / 5) + 32;
      temp.textContent = "Temperature:" + tempF.toFixed(1) + "°F";
      box.appendChild(temp);
      let humid = document.createElement("p");
      humid.textContent = "Humidity :" + data.main.humidity + "%";
      box.appendChild(humid);
      let windSp = document.createElement("p");
      windSp.textContent = "Wind Speed :" + data.wind.speed + "MPH";
      box.appendChild(windSp);
      let lat = data.coord.lat;
      let lon = data.coord.lon;

      getUVIndex(box, lat, lon);

      let img = document.createElement("img");
      img.setAttribute("src", 'https://openweathermap.org/img/w/' + data.weather[0].icon + '.png');
      DateEl.appendChild(img);
      document.getElementById("today").appendChild(box);
    })
    .catch(function (error) {
      console.error(error.message)
    });
}

//function that handles getting the 5 day weather forecast info for a city from OpenWeather API.
//it processes the received data and sets up Temperature and Humidity
//information to be displayed on the page
function getForecast(cityName) {
  let queryURL1 = "http://api.openweathermap.org/data/2.5/forecast/daily?q=" + cityName + '&appid=' + APIKey + '&units=metric';

  fetch(queryURL1)
    .then(function (response) {
      if (response.ok) {
        // Decode the JSON response.body
        return response.json()
      }
      throw new Error("Invalid cityName passed to getForecast");
    })
    .then(function (data) {
      // Log the queryURL
      console.log(queryURL1)
      // Log the object retreived from the API
      console.log(data)
      document.getElementById("forecast").innerHTML = "";
      let heading = document.getElementById("heading");
      heading.textContent = "5-Day Forecast:";
      heading.setAttribute("class", "h3 ml-3");

      for (let i = 1; i <= 5; i++) {

        let box = document.createElement("div");
        box.setAttribute("class", " card bg-primary col-md-2 card-body text-white m-4 p-2");
        let DateEl = document.createElement("h5");
        let newdate = new Date(data.list[i].dt * 1000);
        DateEl.textContent = newdate.toLocaleDateString();
        box.appendChild(DateEl);
        let img = document.createElement("img");
        img.setAttribute("src", 'https://openweathermap.org/img/w/' + data.list[i].weather[0].icon + '.png');
        img.setAttribute("class", "w-50 ");
        box.appendChild(img);
        let temp = document.createElement("p");
        let tmp = data.list[i].temp.day;
        let fmp = tmp * (9 / 5) + 32;
        temp.textContent = "Temp :" + fmp.toFixed(1) + "°F";
        box.appendChild(temp);
        let humid = document.createElement("p");
        humid.textContent = "Humidity :" + data.list[i].humidity + "%";
        box.appendChild(humid);
        document.getElementById("forecast").appendChild(box);
      }
    })
    .catch(function (error) {
      console.error(error.message)
    });
}