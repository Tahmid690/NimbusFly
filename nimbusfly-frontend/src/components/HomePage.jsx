import AirportSearch from "./AirportSearch";
import FlightResults from "./FlightResults";
import Navbar from "./Navbar";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function HomePage() {


    return (
        <div>

            <div>
                <h1>Find your Perfect Flight</h1>
                <p>Search and Book easily</p>

                <AirportSearch/>
                

            </div>






        </div>


    )
}

export default HomePage
