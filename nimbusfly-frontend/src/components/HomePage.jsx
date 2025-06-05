import AirportSearch from "./AirportSearch";
import FlightResults from "./FlightResults";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function HomePage() {


    return (
        <div>
            <header className="bg-blue-300">
                <div>
                    NimbusFly
                </div>
                <div className="items-center">
                    <a href="/">Home </a>
                    <a herf="/">Bookings </a>
                    <a herf="/">Travel Guides </a>
                    <a href="/">About Us </a>
                    <a href="/login"><button>Login/Register</button></a>
                </div>
            </header>

            <div className="bg-blue-500">
                <h1>Find your Perfect Flight</h1>
                <p>Search and Book easily</p>

                <Routes>
                    <Route path="/" element={<AirportSearch />} />
                    <Route path="/flight-results" element={<FlightResults />} />
                </Routes>

            </div>






        </div>


    )
}

export default HomePage
