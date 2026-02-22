import React, { useEffect, useRef, useState } from 'react'
import './Weather.css'
import search_icon from '../assets/search.png'
import clear_icon from '../assets/clear.png'
import cloud_icon from '../assets/cloud.png'
import drizzle_icon from '../assets/drizzle.png'
import rain_icon from '../assets/rain.png'
import snow_icon from '../assets/snow.png'
import wind_icon from '../assets/wind.png'
import humidity_icon from '../assets/humidity.png'


const Weather = () => {

    const inputRef = useRef()
    const [weatherData, setWeatherData] = useState(null);
    // to change units
    const [unit, setUnit] = useState("metric")
    const [city, setCity] = useState("Manaus")
    const [localTime, setLocalTime] = useState("") 

    const allIcons = {
        "01d": clear_icon,
        "01n": clear_icon,
        "02d": cloud_icon,
        "02n": cloud_icon,
        "03d": cloud_icon,
        "03n": cloud_icon,
        "04d": drizzle_icon,
        "04n": drizzle_icon,
        "09d": rain_icon,
        "09n": rain_icon,
        "10d": rain_icon,
        "10n": rain_icon,
        "13d": snow_icon,
        "13n": snow_icon,
    }

    const search = async (city)=>{
        if(city === ""){
            alert("Enter City Name");
            return;
        }

        setCity(city);

        try {
            const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${unit}&appid=${import.meta.env.VITE_APP_ID}`;

            const response = await fetch(url);
            const data = await response.json();

            if(!response.ok){
                alert(data.message);
                return;
            }

            //get my own icons
            console.log(data);
            const icon = allIcons[data.weather[0].icon] || clear_icon;

            //detect if its night
            const currentTime = data.dt;
            const sunrise = data.sys.sunrise;
            const sunset = data.sys.sunset;

            const isNight = currentTime < sunrise || currentTime > sunset;

            setWeatherData({
                humidity: data.main.humidity,
                windSpeed: data.wind.speed,
                temperature: Math.floor(data.main.temp),
                // pressure:
                feelsLike: Math.floor(data.main.feels_like),
                location: data.name,
                icon: icon,
                condition: data.weather[0].main,
                isNight: isNight,
                timezone: data.timezone
            })

        } catch (error) {
            // error alert in case of api problems and etc
            setWeatherData(false);
            console.error("Error in fetching weather data")
        }
    }

    useEffect(()=>{
        search(city);
    }, [unit])

    useEffect(()=>{
        search("Manaus");
    },[])

    // real time clock
    useEffect(() => {

        if (!weatherData?.timezone) return

        const updateTime = () => {

            const now = new Date()

            const utc = now.getTime() + now.getTimezoneOffset() * 60000

            const cityTime = new Date(utc + weatherData.timezone * 1000)

            const formatted = cityTime.toLocaleString("en", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
            })

            setLocalTime(formatted)
        }

        updateTime()
        const interval = setInterval(updateTime, 1000)

        return () => clearInterval(interval)

    }, [weatherData])


  return (
    <div className={`weather 
        ${weatherData ? weatherData.condition.toLowerCase() : ""} 
        ${weatherData?.isNight ? "night" : "day"}
    `}>

        <h1 className="app-title">Weather App</h1>

        <div className='search-bar'>
            <input ref={inputRef} type='text' placeholder='Search'
            // press enter to search 
            onKeyDown={(e) => {
                if (e.key === "Enter") {
                search(inputRef.current.value);
                }
            }}></input>
            <img src={search_icon} alt="" onClick={()=>search(inputRef.current.value)}></img>

            {/* change unit button */}
            <button
            className={`unit-toggle ${unit === "metric" ? "left" : "right"}`}
            onClick={() => setUnit(unit === "metric" ? "imperial" : "metric")}
            aria-label="change temperature unit"
            >
            <div className="toggle-circle"></div>
            <span>°C</span>
            <span>°F</span>
            </button>

        </div>

        {weatherData?<>
        {/* if true: */}
        
        {/* temperature/feels like/location */}
        <img src={weatherData.icon} alt="" className='weather-icon'/>
         <p className='temperature'>
            {weatherData.temperature}°
            {unit === "metric" ? "C" : "F"}
        </p>
        <p>
            Feels like: {weatherData.feelsLike}°
            {unit === "metric" ? "C" : "F"}
        </p>
        <p className='location'>{weatherData.location}</p>

        <p className="local-time">{localTime}</p>

        {/* extra information/details */}
        <div className="weather-data">
            <div className="col">
                <img src={humidity_icon} alt="" />
                <div>
                    <p>{weatherData.humidity} %</p>
                    <span>Humidity</span>
                </div>
            </div>
            <div className="col">
                <img src={wind_icon} alt="" />
                <div>
                     <p>
                        {weatherData.windSpeed} {unit === "metric" ? "m/s" : "mph"}
                    </p>
                    <span>Wind Speed</span>
                </div>
            </div>
        </div>
        
        </>:<></>}

    </div>
  )
}

export default Weather