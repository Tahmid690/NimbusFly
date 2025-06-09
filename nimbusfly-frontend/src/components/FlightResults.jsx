import { useSearchParams, useNavigate } from 'react-router-dom';
import { use, useEffect, useState } from 'react';
import Navbar from "./Navbar";
import { Plane, Search } from 'lucide-react';
import FlightCard from './FlightCard';
import AirportSearch from './AirportSearch'
import { over } from 'lodash';

const LoadingScreen = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center relative overflow-hidden">
            <div className="relative z-10 text-center">
                <div className="relative mb-8">
                    <div className="w-32 h-32 mx-auto relative">
                        <div className="absolute inset-0 border-4 border-white/20 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-transparent border-t-cyan-400 border-r-blue-400 rounded-full animate-spin"></div>
                        <div className="absolute inset-4 border-2 border-white/30 rounded-full animate-pulse"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="animate-bounce">
                                <Plane className="w-12 h-12 text-white" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mb-6">
                    <h2 className="text-3xl font-bold text-white mb-2 animate-pulse">
                        Searching flights...
                    </h2>
                    <div className="flex justify-center items-center space-x-1">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes plane {
                    0% { transform: translateX(-100px) translateY(10px); opacity: 0; }
                    50% { opacity: 1; }
                    100% { transform: translateX(calc(100vw + 100px)) translateY(-10px); opacity: 0; }
                }
                
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(5deg); }
                }
                
                @keyframes fade-in-out {
                    0%, 100% { opacity: 0.6; }
                    50% { opacity: 1; }
                }
                
                .animate-plane {
                    animation: plane 8s infinite linear;
                }
                
                .animate-float {
                    animation: float 4s ease-in-out infinite;
                }
                
                .animate-fade-in-out {
                    animation: fade-in-out 3s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};






function FlightResults() {

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [overLay, setOverLay] = useState(false);
    const [flights, setFlights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [selectedOption, setSelectedOption] = useState('Cheapest');
    const options = ['Cheapest', 'Fastest', 'Earliest'];

    const [originCity, setOriginCity] = useState('');
    const [destinationCity, setDestinationCity] = useState('');

    const [Origin_Airport,setOrigin_Airport] = useState('');
    const [Dest_Airport,setDest_Airport] =useState('');



    const [searchData, setSearchData] = useState({
        origin: searchParams.get('origin'),
        destination: searchParams.get('destination'),
        journeyDate: searchParams.get('journeyDate'),
        returnDate: searchParams.get('returnDate'),
        tripType: searchParams.get('tripType'),
        adults: parseInt(searchParams.get('adults')) || 1,
        children: parseInt(searchParams.get('children')) || 0,
        seatClass: searchParams.get('seatClass'),
        orderType: selectedOption
    });





    const fetchFlights = async () => {
        try {
            setLoading(true);
            const apiUrl = `http://localhost:3000/flights/search?${searchParams.toString() + `&orderType=${selectedOption}`}`;
            const response = await fetch(apiUrl);
            const data = await response.json();


            const oct = await fetch(`http://localhost:3000/airports/city?iata=${searchData.origin}`);
            const pct = await oct.json();
            setOriginCity(pct);
            const dct = await fetch(`http://localhost:3000/airports/city?iata=${searchData.destination}`);
            const qct = await dct.json();
            setDestinationCity(qct);

            const oap = await (await fetch(`http://localhost:3000/airports/iata?iata_code=`+searchData.origin)).json();
            setOrigin_Airport(oap[0]);
            const dap = await ((await fetch(`http://localhost:3000/airports/iata?iata_code=`+searchData.destination)).json());
            setDest_Airport(dap[0]);
            
            // console.log(Origin_Airport[0]);
            // console.log(Dest_Airport[0]);

            setFlights(data.data);
            setLoading(false);

        } catch (err) {
            setError('Failed to fetch flights');
            setLoading(false);
            console.error('Error fetching flights:', err);
        }
    };


    useEffect(() => {
        
        fetchFlights();
    }, []);
    
    useEffect(() => {
        setSearchData(prev => ({
            ...prev,
            orderType: selectedOption
        }));
        fetchFlights();
        // console.log(selectedOption);
    }, [selectedOption]);


    const jrnydate = new Date(searchData.journeyDate);

    const formattedDateJour = jrnydate.toLocaleDateString('en-US', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });


    // console.log(flights);
    
    console.log(Origin_Airport);




    if (loading) {
        return (
            <div>
                <LoadingScreen />
            </div>
        );
    }



    return (
        <div>
            <Navbar
                flg={true}
            />

            {
                overLay && (
                    <div className='fixed inset-0 bg-black/70 z-50 flex justify-center '
                        onClick={() => setOverLay(false)}
                    >
                        <div
                            className='mt-25 mb-160'
                            onClick={(e) => e.stopPropagation()}
                        >
                            <AirportSearch 
                                origin_select={Origin_Airport}
                                dest_select={Dest_Airport}
                                journey_date={searchData.journeyDate}
                                return_date={searchData.returnDate}
                                trip_type={searchData.tripType}
                                adulT={searchData.adults}
                                chilD={searchData.children}
                                seat_class={searchData.seatClass}
                            />
                        </div>
                    </div>

                )
            }

            <div className='grid grid-cols-7 gap-4 px-6 lg:px-8 mt-20'>
                <div className='col-span-2 bg-white p-4 h-500 ml-30'>
                    {/* Eikhane Filter Thakbe */}

                </div>

                <div className='col-span-5 p-4 h-500 mr-30'>
                    {/* Eikhne Flight Details Thakbe */}
                    <div className='flex flex-col gap-5'>
                        <div className='bg-gradient-to-r from-blue-400 to-blue-500 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300'>
                            <div className='flex items-center justify-between'>
                                <div className='flex-1'>
                                    <div className='text-white font-semibold text-xl mb-2'>
                                        {originCity.data} ({searchData.origin}) → {destinationCity.data} ({searchData.destination})
                                    </div>
                                    <div className='text-blue-100 text-sm'>
                                        <span>{formattedDateJour}</span>
                                        <span className='mx-3 text-blue-200'>|</span>
                                        <span>{searchData.adults + searchData.children} passenger(s)</span>
                                        <span className='mx-3 text-blue-200'>|</span>
                                        <span>{searchData.seatClass}</span>
                                    </div>
                                </div>

                                <div className='ml-6'>
                                    <button className='bg-white/20 hover:bg-white/30 text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 backdrop-blur-sm border border-white/20'
                                        onClick={() => setOverLay(!overLay)}
                                    >
                                        <span>Change search</span>
                                        <Search className='w-4 h-4' />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className='bg-white rounded-2xl border border-blue-200 p-1 shadow-lg hover:shadow-xl transition-shadow duration-300'>
                            <div className='flex bg-blue-50/50 rounded-xl p-1'>
                                {options.map((option, index) => (
                                    <button
                                        key={option}
                                        onClick={() => setSelectedOption(option)}
                                        className={`
                flex-1 py-3 px-6 font-medium text-center transition-all duration-300 rounded-lg
                ${selectedOption === option
                                                ? 'bg-blue-500 text-white shadow-md transform scale-[0.98]'
                                                : 'bg-transparent text-gray-600 hover:bg-white/80 hover:text-blue-600'
                                            }
              `}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className='space-y-4'>
                            {flights.map((flight, index) => (
                                <FlightCard
                                    key={index}
                                    flight={flight}
                                    origin={searchData.origin}
                                    destination={searchData.destination}
                                    adult={searchData.adults}
                                    child={searchData.children}
                                />
                            ))}
                        </div>


                    </div>


                </div>

            </div>
        </div>
    );
}

export default FlightResults;