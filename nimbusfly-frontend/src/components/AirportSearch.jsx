import { useRef, useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { Users } from 'lucide-react';
import { Car } from "lucide-react";

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
        <ul className="absolute z-50 bg-white/98 backdrop-blur-lg rounded-xl shadow-2xl mt-2 max-h-52 overflow-y-auto max-w-2xl border border-white/40 scrollbar-thin scrollbar-thumb-gray-300">
            {
                results.map((airport) => (
                    <li
                        key={airport.airport_name}
                        onClick={() => handleSelect(airport)}
                        className="px-5 py-4 hover:bg-blue-50 cursor-pointer text-gray-800 border-b border-gray-50 last:border-b-0 transition-colors duration-200"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-bold text-gray-900 text-sm">{airport.airport_name}</div>
                                <div className="text-gray-500 text-xs mt-1 flex items-center">
                                    <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium mr-2">{airport.iata_code}</span>
                                    {airport.city}, {airport.country}
                                </div>
                            </div>

                        </div>
                    </li>
                ))
            }
        </ul>
    );

}




const SelectedAirport = ({ selectedAirport }) => {
    if (!selectedAirport) return null;
    return (
        <div className="mt-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg shadow-sm">
            <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                    <div className="font-bold text-green-800 text-sm">{selectedAirport.airport_name}</div>
                    <div className="text-green-600 text-xs mt-1 flex items-center gap-2">
                        <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-medium">{selectedAirport.iata_code}</span>
                        <span>{selectedAirport.city}, {selectedAirport.country}</span>
                    </div>
                </div>
            </div>
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
        <div ref={dropdownRef} className="relative w-full" >

            <button
                className="w-full text-sm px-25 py-1 rounded-lg bg-white/10 backdrop-blur-sm placeholder-white/70 text-white border border-white/30  hover:bg-white/20 transition-all duration-300 shadow-lg font-bold text-shadow-lg"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Users className="inline w-6 h-6 text-blue-600" /> {adult} Adult, {child} Child
                <svg className={`inline w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <ul className="absolute z-50 left-0 right-0 bg-white rounded-xl shadow-2xl mt-2 border border-gray-200 divide-y divide-gray-100 overflow-hidden">
                    <li className="">
                        <div className="flex items-center justify-between px-4 py-4">
                            <div>
                                Adult
                            </div>
                            <div className="flex items-center gap-3">
                                <div>
                                    <button
                                        className="w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-colors duration-200 font-bold text-lg"
                                        onClick={() => setAdult(adult + 1)}
                                    >
                                        +
                                    </button>
                                </div>
                                <div className="min-w-[2rem] text-center font-semibold text-gray-700">{adult}</div>
                                <div>
                                    <button
                                        className="w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-colors duration-200 font-bold text-lg"
                                        onClick={() => setAdult(Math.max(1, adult - 1))}
                                    >
                                        −
                                    </button>
                                </div>
                            </div>
                        </div>
                    </li>

                    <li className="">
                        <div className="flex items-center justify-between px-4 py-4">
                            <div>
                                Child
                            </div>
                            <div className="flex items-center gap-3">
                                <div>
                                    <button
                                        className="w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-colors duration-200 font-bold text-lg"
                                        onClick={() => setChild(child + 1)}
                                    >
                                        +
                                    </button>
                                </div>
                                <div className="min-w-[2rem] text-center font-semibold text-gray-700">{child}</div>
                                <div>
                                    <button
                                        className="w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-colors duration-200 font-bold text-lg"
                                        onClick={() => setChild(Math.max(0, child - 1))}
                                    >
                                        −
                                    </button>
                                </div>
                            </div>
                        </div>
                    </li>

                </ul>

            )}





        </div>
    );
}


const SeatClass = ({ seatClass, setSeatClass }) => {

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
        <div ref={dropdownRef} className="relative w-full" >

            <button
                className="w-full text-sm px-25 py-1 rounded-lg bg-white/10 backdrop-blur-sm placeholder-white/70 text-white border border-white/30  hover:bg-white/20 transition-all duration-300 shadow-lg font-bold text-shadow-lg "
                onClick={() => setIsOpen(!isOpen)}
            >
                <svg className="inline w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 12V8c0-1.1.9-2 2-2h8c1.1 0 2 .9 2 2v4h2c1.1 0 2 .9 2 2v2c0 .55-.45 1-1 1s-1-.45-1-1v-2h-2v4c0 .55-.45 1-1 1H7c-.55 0-1-.45-1-1v-4H4v2c0 .55-.45 1-1 1s-1-.45-1-1v-2c0-1.1.9-2 2-2h2z" />
                </svg> {seatClass} Class
                <svg className={`inline w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <ul className="absolute z-50 left-0 right-0 bg-white rounded-xl shadow-2xl mt-2 border border-gray-200 divide-y divide-gray-100 overflow-hidden">
                    <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors" onClick={() => { setSeatClass('Economy'); setIsOpen(!isOpen) }}>
                        Economy Class
                    </li>
                    <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors" onClick={() => { setSeatClass('Business'); setIsOpen(!isOpen) }}>
                        Business Class
                    </li>

                </ul>
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

    const [seatClass, setSeatClass] = useState('Economy');


    const [errors, setErrors] = useState({
        origin: false,
        destination: false,
        journeyDate: false,
        returnDate: false
    });




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
        setErrors(prev => ({...prev, origin: false}));
        setQuery_origin(e.target.value);
        setSelectedAirport_origin(null);
    }

    function handleInputChangeDestination(e) {
        setErrors(prev => ({...prev, destination: false}));
        setQuery_destination(e.target.value);
        setSelectedAirport_destination(null);
    }

    const handleSelectOrigin = (airport) => {
        setSelectedAirport_origin(airport);
        setQuery_origin(`${airport.city},${airport.country} (${airport.iata_code})`);

        setResults_origin([]);
    };

    const handleSelectDestination = (airport) => {
        setSelectedAirport_destination(airport);
        setQuery_destination(`${airport.city},${airport.country} (${airport.iata_code})`);
        setResults_destination([]);
    };

    const handleTripTypeChange = (type) => {
        setTripType(type);
        if (type === 'one-way') setReturnDate('');
    }

    function flightSearch() {

        const newErrors = {
            origin: !selectedAirport_origin,
            destination: !selectedAirport_destination,
            journeyDate: !journeyDate,
            returnDate: tripType === 'round-trip' && !returnDate
        };

        setErrors(newErrors);
        if (Object.values(newErrors).some(error => error)) {
            return;
        }

        

        const searchParams = new URLSearchParams({
            origin: selectedAirport_origin.iata_code,
            destination: selectedAirport_destination.iata_code,
            journeyDate: journeyDate,
            tripType: tripType,
            adults: adult.toString(),
            children: child.toString(),
            seatClass: seatClass
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


                <div className="grid grid-cols-2 gap-5">
                    <SeatClass
                        seatClass={seatClass}
                        setSeatClass={setSeatClass}
                    />
                    <PassengerCounter
                        adult={adult}
                        setAdult={setAdult}
                        child={child}
                        setChild={setChild}
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
                        className={`w-full px-3 py-3 rounded-lg backdrop-blur-sm placeholder-white/70 text-white border transition-all duration-300 shadow-lg focus:outline-none focus:ring-2 hover:bg-white/20 ${selectedAirport_origin ? 'bg-green-500/20 border-green-400 font-bold' : 'bg-white/10 border-white/30'} ${errors.origin ? 'border-red-500 bg-red-500/20 focus:ring-red-300' : 'focus:ring-white/50 focus:border-white/60 focus:bg-white/20'}`}
                    />

                    <AirportList
                        results={results_origin}
                        selectedAirport={selectedAirport_origin}
                        handleSelect={handleSelectOrigin}
                    />

                    {/* <SelectedAirport
                        selectedAirport={selectedAirport_origin}
                    /> */}
                </div>

                <div className="w-full">
                    <label className="block text-white font-medium mb-2">To </label>
                    <input
                        type="text"
                        placeholder="Destination Airport"
                        value={query_destination}
                        onChange={handleInputChangeDestination}
                        className={`w-full px-3 py-3 rounded-lg backdrop-blur-sm placeholder-white/70 text-white border transition-all duration-300 shadow-lg focus:outline-none focus:ring-2 hover:bg-white/20 ${selectedAirport_destination ? 'bg-green-500/20 border-green-400 font-bold' : 'bg-white/10 border-white/30'} ${errors.destination ? 'border-red-500 bg-red-500/20 focus:ring-red-300' : 'focus:ring-white/50 focus:border-white/60 focus:bg-white/20'}`}
                    />

                    <AirportList
                        results={results_destination}
                        selectedAirport={selectedAirport_destination}
                        handleSelect={handleSelectDestination}
                    />

                    {/* <SelectedAirport
                        selectedAirport={selectedAirport_destination}
                    /> */}
                </div>

                <div className="w-full">
                    <label className="block text-white font-medium mb-2">Departure Date </label>
                    <input
                        type="date"
                        placeholder="Select date"
                        value={journeyDate}
                        onChange={(e) =>{ setJourneyDate(e.target.value); setErrors(prev => ({...prev, journeyDate: false}));} }
                        max={returnDate || undefined}
                        className={`w-full px-3 py-3 rounded-lg bg-white/10 backdrop-blur-sm placeholder-white/70 text-white border transition-all duration-300 shadow-lg focus:outline-none focus:ring-2 hover:bg-white/20 ${errors.journeyDate ? 'border-red-500 bg-red-500/20 focus:ring-red-300' : 'border-white/30 focus:ring-white/50 focus:border-white/60 focus:bg-white/20'}`}
                    />
                </div>


                <div className="w-full">
                    <label className="block text-white font-medium mb-2">Return Date </label>
                    <input
                        type="date"
                        value={returnDate}
                        onChange={(e) => { setReturnDate(e.target.value); setTripType("round-trip"); setErrors(prev => ({...prev, returnDate: false})); }}
                        min={journeyDate || getTodayDate()}
                        className={`w-full px-3 py-3 rounded-lg bg-white/10 backdrop-blur-sm placeholder-white/70 text-white border transition-all duration-300 shadow-lg focus:outline-none focus:ring-2 hover:bg-white/20 ${errors.returnDate ? 'border-red-500 bg-red-500/20 focus:ring-red-300' : 'border-white/30 focus:ring-white/50 focus:border-white/60 focus:bg-white/20'}`}
                    />
                </div>


            </div>


            <br />
            <div className="flex justify-center items-center">
                <button className="relative overflow-hidden px-8 py-3 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 text-white font-bold text-sm rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 group focus:outline-none focus:ring-4 focus:ring-blue-300/50
                "
                    onClick={flightSearch}
                >
                    <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                    <span className="relative flex items-center space-x-2">
                        <span>Search</span>
                    </span>
                </button>
            </div>




        </div>
    )
}

export default AirportSearch