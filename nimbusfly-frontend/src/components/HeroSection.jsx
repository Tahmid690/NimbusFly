import { useState, useEffect } from 'react';

const HeroSection = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [currentText, setCurrentText] = useState(0);

    const welcomeTexts = [
        "Welcome to Your Next Adventure",
        "Discover Amazing Destinations",
        "Create Unforgettable Memories",
        "Explore the World with NimbusFly"
    ];

    useEffect(() => {
        setIsVisible(true);

        const interval = setInterval(() => {
            setCurrentText((prev) => (prev + 1) % welcomeTexts.length);
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative h-screen w-full overflow-hidden">

            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat transform scale-110 transition-transform duration-[20s] ease-out hover:scale-105"
                style={{
                    backgroundImage: `url('/bkg3p.jpg')`
                }}
            />

            <div className="absolute inset-0 bg-gradient-to-r from-teal-900/40 via-cyan-800/20 to-blue-900/40"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-teal-900/60 via-transparent to-cyan-500/20"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-cyan-600/10 to-blue-800/30"></div>


        </div>
    );
}

export default HeroSection;