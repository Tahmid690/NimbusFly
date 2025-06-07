import { useState } from "react";
import AirportSearch from "./AirportSearch";
import HeroSection from "./HeroSection";
import Navbar from "./Navbar";
import LoginOverlay from "./LoginOverlay"

function HomePage() {

    const [overlay, setOverlay] = useState(false)

    return (
        <div>
            <Navbar
                overlay={overlay}
                setOverlay={setOverlay}
            />
            {
                overlay && (
                    <LoginOverlay
                        overlay={overlay}
                        setOverlay={setOverlay}
                    />
                )
            }
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
