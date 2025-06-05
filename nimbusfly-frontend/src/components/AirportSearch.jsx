import { useRef, useEffect, useState } from "react";

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
        <div>
            <button
                className="bg-amber-100 rounded-md"
                onClick={() => setIsOpen(!isOpen)}
            >
                {adult} Adults, {child} Children
            </button>

            {isOpen && (
                <div ref={dropdownRef}>
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
        setQuery_origin(`${airport.airport_name} (${airport.iata_code}) (${airport.city}) (${airport.country})`);
        setResults_origin([]);
    };

    const handleSelectDestination = (airport) => {
        setSelectedAirport_destination(airport);
        setQuery_destination(`${airport.airport_name} (${airport.iata_code})`);
        setResults_destination([]);
    };

    const handleTripTypeChange = (type) => {
        setTripType(type);
    }

    function flightSearch() {

    }

    return (
        <div className="text-center">

            <div>
                <div>
                    <label>
                        <input
                            type="radio"
                            name="tripType"
                            value="one-way"
                            checked={tripType === 'one-way'}
                            onChange={(e) => handleTripTypeChange(e.target.value)}
                        />
                        One Way
                    </label>
                    <br />
                    <label>
                        <input
                            type="radio"
                            name="tripType"
                            value="round-trip"
                            checked={tripType === 'round-trip'}
                            onChange={(e) => handleTripTypeChange(e.target.value)}
                        />
                        Round Trip
                    </label>
                </div>
            </div>

            <br />

            <input
                type="text"
                placeholder="Origin Airport"
                value={query_origin}
                onChange={handleInputChangeOrigin}
                className="bg-blue-200 text-blue-900 rounded-md"
            />
            <br />

            <AirportList
                results={results_origin}
                selectedAirport={selectedAirport_origin}
                handleSelect={handleSelectOrigin}
            />

            <SelectedAirport
                selectedAirport={selectedAirport_origin}
            />
            <br />
            <input
                type="text"
                placeholder="Destination Airport"
                value={query_destination}
                onChange={handleInputChangeDestination}
                className="bg-blue-200 text-blue-900 rounded-md"
            />
            <br />

            <AirportList
                results={results_destination}
                selectedAirport={selectedAirport_destination}
                handleSelect={handleSelectDestination}
            />

            <SelectedAirport
                selectedAirport={selectedAirport_destination}
            />

            <br />
            <input
                type="date"
                value={journeyDate}
                onChange={(e) => setJourneyDate(e.target.value)}
                className="bg-blue-200 text-blue-900"
            />
            <br />
            {
                tripType === 'round-trip' && (
                    <input
                        type="date"
                        value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                        className="bg-blue-200 text-blue-900"
                    />
                )
            }
            <br />
            <PassengerCounter
                adult={adult}
                setAdult={setAdult}
                child={child}
                setChild={setChild}
            />
            <br />
            <button
                className="bg-white rounded-md"
                onClick={flightSearch}
            >Search</button>



        </div>
    )
}

export default AirportSearch