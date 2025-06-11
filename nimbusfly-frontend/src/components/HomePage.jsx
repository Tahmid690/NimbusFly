import AirportSearch from "./AirportSearch";
import HeroSection from "./HeroSection";
import Navbar from "./Navbar";
import {useAuth} from './Authnication/AuthContext';

function HomePage() {
    
    return (
        <div>
            <Navbar
                flg={false}
            />
            <div className="relative">
                <HeroSection />
                <div className="absolute inset-x-0 top-160 transform -translate-y-1/2 z-10 px-4">
                    <div className="max-w-6xl mx-auto">
                        <AirportSearch />
                    </div>
                </div>
            </div>


        </div>


    )
}

export default HomePage
