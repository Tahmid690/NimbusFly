import { useRef, useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';

const fetch_airport = async (query, selectedAirport, setResults, abortController) => {
    try {
        if (query) {
            let cd = "";
            if (selectedAirport) cd = selectedAirport.iata_code;
            const res = await fetch(`http://localhost:3000/airports/search_name?query=${query}&iata_code=${cd}`, { signal: abortController.signal });
            const data = await res.json();
            setResults(data);
        }
        else {
            setResults([]);
        }
    }
    catch (err) {
        if (err.name !== 'AbortError') {
            console.error("Error fetching airports:", err);
            setResults_origin([]);
        }
    }
};


const AirportList = ({ results, selectedAirport, handleSelect }) => {
    if (results.length === 0 || selectedAirport) return null;
    return (
        <ul>
            {
                results.map((airport) => (
                    <li
                        key={airport.airport_name}
                        onClick={() => handleSelect(airport)}
                    >
                        {airport.airport_name}({airport.iata_code}),{airport.city},{airport.country}
                    </li>
                ))
            }

        </ul>
    );

}




const SelectedAirport = ({ selectedAirport }) => {
    if (!selectedAirport) return null;
    return (
        <div className="bg-amber-100">
            <strong>{selectedAirport.airport_name} </strong>
            ({selectedAirport.iata_code}) <br />
            {selectedAirport.city},{selectedAirport.country}
        </div>
    );

}


const PassengerCounter = ({ adult, setAdult, child, setChild }) => {

    const [isOpen, setIsOpen] = useState(false);

    const dropdownRef = useRef(null);

    useEffect(() => {
        console.log(603);
        const handleClickOutside = (e) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);




    return (
        <div ref={dropdownRef}>
            <button
                className="bg-amber-100 rounded-md"
                onClick={() => setIsOpen(!isOpen)}
            >
                {adult} Adults, {child} Children
            </button>

            {isOpen && (
                <div>
                    <div>
                        <span>Adults:  </span>
                        <button
                            className="bg-white rounded-md px-2 py-1"
                            onClick={() => setAdult(Math.max(1, adult - 1))}
                        >
                            -
                        </button>
                        <span> {adult} </span>
                        <button
                            className="bg-white rounded-md px-2 py-1"
                            onClick={() => setAdult(adult + 1)}
                        >
                            +
                        </button>
                    </div>

                    <div>
                        <span>Children:  </span>
                        <button
                            className="bg-white rounded-md px-2 py-1"
                            onClick={() => setChild(Math.max(0, child - 1))}
                        >
                            -
                        </button>
                        <span> {child} </span>
                        <button
                            className="bg-white rounded-md px-2 py-1"
                            onClick={() => setChild(child + 1)}
                        >
                            +
                        </button>
                    </div>

                </div>
            )}





        </div>
    );
}




function AirportSearch() {
    const navigate = useNavigate();

    const [query_origin, setQuery_origin] = useState('');
    const [query_destination, setQuery_destination] = useState('');

    const [results_destination, setResults_destination] = useState([]);
    const [results_origin, setResults_origin] = useState([]);

    const [selectedAirport_origin, setSelectedAirport_origin] = useState(null);
    const [selectedAirport_destination, setSelectedAirport_destination] = useState(null);

    const [journeyDate, setJourneyDate] = useState(null);
    const [returnDate, setReturnDate] = useState(null);

    const [tripType, setTripType] = useState('one-way');

    const [adult, setAdult] = useState(1);
    const [child, setChild] = useState(0);




    useEffect(() => {
        const abortController = new AbortController();
        const fetch_data = setTimeout(() => {
            fetch_airport(query_origin, selectedAirport_destination, setResults_origin, abortController);
            fetch_airport(query_destination, selectedAirport_origin, setResults_destination, abortController);
        }, 5);
        return () => {
            clearTimeout(fetch_data);
            abortController.abort();
        }
    }, [query_origin, query_destination]);


    const getTodayDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };


    function handleInputChangeOrigin(e) {
        setQuery_origin(e.target.value);
        setSelectedAirport_origin(null);
    }

    function handleInputChangeDestination(e) {
        setQuery_destination(e.target.value);
        setSelectedAirport_destination(null);
    }

    const handleSelectOrigin = (airport) => {
        setSelectedAirport_origin(airport);
        setQuery_origin(`${airport.city} (${airport.iata_code})`);

        setResults_origin([]);
    };

    const handleSelectDestination = (airport) => {
        setSelectedAirport_destination(airport);
        setQuery_destination(`${airport.airport_name} (${airport.iata_code})`);
        setResults_destination([]);
    };

    const handleTripTypeChange = (type) => {
        setTripType(type);
        if (type === 'one-way') setReturnDate('');
    }

    function flightSearch() {
        if (!selectedAirport_origin) {
            alert('Please select an origin airport');
            return;
        }

        if (!selectedAirport_destination) {
            alert('Please select a destination airport');
            return;
        }

        if (!journeyDate) {
            alert('Please select a journey date');
            return;
        }

        if (tripType === 'round-trip' && !returnDate) {
            alert('Please select a return date for round trip');
            return;
        }

        const searchParams = new URLSearchParams({
            origin: selectedAirport_origin.iata_code,
            destination: selectedAirport_destination.iata_code,
            journeyDate: journeyDate,
            tripType: tripType,
            adults: adult.toString(),
            children: child.toString()
        });

        if (tripType === 'round-trip' && returnDate) {
            searchParams.append('returnDate', returnDate);
        }
        navigate(`/flight-results?${searchParams.toString()}`);

    }

    return (
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl pt-6 pb-6 pl-12 pr-12 max-w-6xl mx-auto border border-white/20">

            <div className="flex justify-between items-center">
                <div className="flex gap-2 mb-2">
                    <label className="flex items-center gap-1 cursor-pointer">
                        <input
                            type="radio"
                            name="tripType"
                            value="one-way"
                            checked={tripType === 'one-way'}
                            onChange={(e) => handleTripTypeChange(e.target.value)}
                            className="w-4 h-4 text-white accent-cyan-400"
                        />
                        <span className="font-medium text-white">One Way</span>
                    </label>
                    <br />
                    <label className="flex items-center gap-1 cursor-pointer">
                        <input
                            type="radio"
                            name="tripType"
                            value="round-trip"
                            checked={tripType === 'round-trip'}
                            onChange={(e) => handleTripTypeChange(e.target.value)}
                            className="w-4 h-4 text-white accent-cyan-400"
                        />
                        <span className="font-medium text-white">Round Trip</span>
                    </label>
                </div>

                <div>
                    <PassengerCounter
                        adult={adult}
                        setAdult={setAdult}
                        child={child}
                        setChild={setChild}
                        className="justify-end"
                    />
                </div>



            </div>

            <br />

            <div className="grid grid-cols-4 gap-8">
                <div className="w-full">
                    <label className="block text-white font-medium mb-2">From </label>
                    <input
                        type="text"
                        placeholder="Origin Airport"
                        value={query_origin}
                        onChange={handleInputChangeOrigin}
                        className="w-full px-3 py-3 rounded-lg bg-white/10 backdrop-blur-sm placeholder-white/70 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/60 focus:bg-white/20 hover:bg-white/20 transition-all duration-300 shadow-lg"
                    />

                    <AirportList
                        results={results_origin}
                        selectedAirport={selectedAirport_origin}
                        handleSelect={handleSelectOrigin}
                    />

                    <SelectedAirport
                        selectedAirport={selectedAirport_origin}
                    />
                </div>

                <div className="w-full">
                    <label className="block text-white font-medium mb-2">To </label>
                    <input
                        type="text"
                        placeholder="Destination Airport"
                        value={query_destination}
                        onChange={handleInputChangeDestination}
                        className="w-full px-3 py-3 rounded-lg bg-white/10 backdrop-blur-sm placeholder-white/70 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/60 focus:bg-white/20 hover:bg-white/20 transition-all duration-300 shadow-lg"
                    />

                    <AirportList
                        results={results_destination}
                        selectedAirport={selectedAirport_destination}
                        handleSelect={handleSelectDestination}
                    />

                    <SelectedAirport
                        selectedAirport={selectedAirport_destination}
                    />
                </div>

                <div className="w-full">
                    <label className="block text-white font-medium mb-2">Departure Date </label>
                    <input
                        type="date"
                        value={journeyDate}
                        onChange={(e) => setJourneyDate(e.target.value)}
                        max={returnDate || undefined}
                        className="w-full px-3 py-3 rounded-lg bg-white/10 backdrop-blur-sm placeholder-white/70 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/60 focus:bg-white/20 hover:bg-white/20 transition-all duration-300 shadow-lg"
                    />
                </div>


                <div className="w-full">
                    <label className="block text-white font-medium mb-2">Return Date </label>
                    <input
                        type="date"
                        value={returnDate}
                        onChange={(e) => { setReturnDate(e.target.value); setTripType("round-trip") }}
                        min={journeyDate || getTodayDate()}
                        className="w-full px-3 py-3 rounded-lg bg-white/10 backdrop-blur-sm placeholder-white/70 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/60 focus:bg-white/20 hover:bg-white/20 transition-all duration-300 shadow-lg"
                    />
                </div>


            </div>


            <br />
            <div className="flex justify-center items-center">
                <button
                    className="bg-white rounded-md"
                    onClick={flightSearch}
                >Search</button>
            </div>




        </div>
    )
}

export default AirportSearch