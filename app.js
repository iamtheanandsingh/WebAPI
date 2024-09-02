const API_KEY = 'ad11c23c133dc8ff3ca9ae491419f746';

const searchButton = document.getElementById('search-button');
const locationButton = document.getElementById('location-button');
const cityInput = document.getElementById('city-input');
const datePicker = document.getElementById('date-picker');
const forecastTableBody = document.querySelector('#forecast-table tbody');

searchButton.addEventListener('click', () => {
    const city = cityInput.value.trim();
    const date = datePicker.value;
    if (city) {
        getWeatherData(city, date);
    }
});

locationButton.addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const date = datePicker.value;
            getWeatherDataByCoords(position.coords.latitude, position.coords.longitude, date);
        }, () => {
            alert('Unable to retrieve your location.');
        });
    } else {
        alert('Geolocation is not supported by your browser.');
    }
});

async function getWeatherData(city, date) {
    try {
        const currentWeather = await fetchCurrentWeather(city);
        const forecastWeather = await fetchForecastWeather(city, date);
        displayCurrentWeather(currentWeather);
        displayForecastWeather(forecastWeather, date);
    } catch (error) {
        alert('Error fetching weather data. Please try again.');
        console.error(error);
    }
}

async function getWeatherDataByCoords(lat, lon, date) {
    try {
        const currentWeather = await fetchCurrentWeatherByCoords(lat, lon);
        const forecastWeather = await fetchForecastWeatherByCoords(lat, lon, date);
        displayCurrentWeather(currentWeather);
        displayForecastWeather(forecastWeather, date);
    } catch (error) {
        alert('Error fetching weather data. Please try again.');
        console.error(error);
    }
}

async function fetchCurrentWeather(city) {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
    if (!response.ok) {
        throw new Error('Current weather data not available');
    }
    return await response.json();
}

async function fetchForecastWeather(city, date) {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`);
    if (!response.ok) {
        throw new Error('Forecast weather data not available');
    }
    const data = await response.json();
    return filterForecastByDate(data, date);
}

async function fetchCurrentWeatherByCoords(lat, lon) {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
    if (!response.ok) {
        throw new Error('Current weather data not available');
    }
    return await response.json();
}

async function fetchForecastWeatherByCoords(lat, lon, date) {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
    if (!response.ok) {
        throw new Error('Forecast weather data not available');
    }
    const data = await response.json();
    return filterForecastByDate(data, date);
}

function filterForecastByDate(data, date) {
    const selectedDate = new Date(date || Date.now());
    const endDate = new Date(selectedDate);
    endDate.setDate(selectedDate.getDate() + 5);

    const dailyData = {};

    data.list.forEach(item => {
        const itemDate = new Date(item.dt_txt.split(' ')[0]);
        if (itemDate >= selectedDate && itemDate <= endDate && (!dailyData[itemDate] || item.dt_txt.includes('12:00:00'))) {
            dailyData[itemDate] = item;
        }
    });

    return Object.values(dailyData);
}

function displayCurrentWeather(data) {
    document.querySelector('.weather-section').innerHTML = `
        <h2>Current Weather in ${data.name}, ${data.sys.country}</h2>
        <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png" alt="${data.weather[0].description}">
        <p><strong>Temperature:</strong> ${data.main.temp} °C</p>
        <p><strong>Weather:</strong> ${data.weather[0].main} - ${data.weather[0].description}</p>
        <p><strong>Humidity:</strong> ${data.main.humidity}%</p>
        <p><strong>Wind Speed:</strong> ${data.wind.speed} m/s</p>
    `;
}

function displayForecastWeather(data, date) {
    forecastTableBody.innerHTML = '';

    data.forEach(item => {
        const formattedDate = new Date(item.dt_txt).toLocaleDateString();
        const iconUrl = `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`;
        const description = item.weather[0].description;
        const temp = item.main.temp.toFixed(1);
        const humidity = item.main.humidity;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formattedDate}</td>
            <td><img src="${iconUrl}" alt="${description}"></td>
            <td>${description}</td>
            <td>${temp} °C</td>
            <td>${humidity}%</td>
        `;
        forecastTableBody.appendChild(row);
    });
}