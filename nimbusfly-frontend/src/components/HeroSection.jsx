import { useState, useEffect } from 'react';

const HeroSection = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [currentText, setCurrentText] = useState(0);

    const texts = [
        "Welcome to Your Next Adventure",
        "Discover Amazing Destinations",
        "Create Unforgettable Memories",
        "Explore the World with NimbusFly"
    ];

    const [currentTextIndex, setCurrentTextIndex] = useState(0);
    const [displayText, setDisplayText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [showCursor, setShowCursor] = useState(true);
    const [isPaused, setIsPaused] = useState(false);


    const typeSpeed = 100;
    const deleteSpeed = 50;
    const pauseDuration = 2000;

    useEffect(() => {
        const currentFullText = texts[currentTextIndex];
        
        if (isPaused) {
            const pauseTimeout = setTimeout(() => {
                setIsPaused(false);
                setIsDeleting(true);
            }, pauseDuration);
            return () => clearTimeout(pauseTimeout);
        }

        const timeout = setTimeout(() => {
            if (!isDeleting) {
                if (displayText.length < currentFullText.length) {
                    setDisplayText(currentFullText.slice(0, displayText.length + 1));
                } else {
                    setIsPaused(true);
                }
            } else {
                if (displayText.length > 0) {
                    setDisplayText(displayText.slice(0, -1));
                } else {
                    setIsDeleting(false);
                    setCurrentTextIndex((prev) => (prev + 1) % texts.length);
                }
            }
        }, isDeleting ? deleteSpeed : typeSpeed);
        return () => clearTimeout(timeout);
    }, [displayText, isDeleting, currentTextIndex, isPaused]);

    useEffect(() => {
        const cursorInterval = setInterval(() => {
            setShowCursor(prev => !prev);
        }, 500);
        return () => clearInterval(cursorInterval);
    }, []);



    

    return (
        <div className="relative h-screen w-full overflow-hidden">

            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat transform scale-110 transition-transform duration-[20s] ease-out hover:scale-105"
                style={{
                    backgroundImage: `url('/bkg3c.jpg')`
                }}
            />
            
            {/* <div className="absolute inset-0 bg-gradient-to-r from-blue-950/50 via-slate-800/30 to-sky-900/50"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-sky-500/20"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-blue-600/10 to-slate-800/40"></div> */}

            <div className="absolute inset-0 bg-gradient-to-r from-teal-900/40 via-cyan-800/20 to-blue-900/40"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-teal-900/60 via-transparent to-cyan-500/20"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-cyan-600/10 to-blue-800/30"></div>

            <div className="mb-8 pt-50">
                <h1 className="text-3xl md:text-5xl lg:text-7xl font-black leading-tight min-h-[150px] flex items-center justify-center">
                    <span className="text-white text-shadow-lg drop-shadow-[0_0_30px_rgba(59,130,246,0.4)]">
                        {displayText}
                    </span>
                    <span className={`inline-block w-1 h-20 bg-white ml-2 transition-opacity duration-100 ${showCursor ? 'opacity-100' : 'opacity-0'}`}></span>
                </h1>
                <p className="flex text-xl md:text-2xl lg:text-3xl font-medium text-white/90 drop-shadow-lg mb-12 animate-fade-in items-center justify-center text-shadow-lg">
                    Soar Above the Clouds to Amazing Destinations
                </p>
            </div>
        </div>
    );
}

export default HeroSection;