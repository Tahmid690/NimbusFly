import AirportSearch from "./AirportSearch";
import FlightResults from "./FlightResults";
import HeroSection from "./HeroSection";
import Navbar from "./Navbar";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function HomePage() {


    return (
        <div>
            <Navbar/>
            <div>
                <HeroSection/>
                <div className="hidden absolute top-150 left-200">
                    <AirportSearch/>
                </div>
                
            </div>
        </div>


    )
}

export default HomePage
