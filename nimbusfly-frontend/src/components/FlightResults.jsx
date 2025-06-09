import { useSearchParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Navbar from "./Navbar";
import { Clock, Plane, Users, Calendar } from 'lucide-react';
import PriceRange from './Bookingfilter/Pricerange';
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


const fetchFlights = async () => {
    try {
        setLoading(false);

        const apiUrl = `http://localhost:3000/flights/search?${searchParams.toString()}`;

        const response = await fetch(apiUrl);
        const data = await response.json();

        setFlights(data);
        setfilteredflight(data);
        setLoading(false);
    } catch (err) {
        setError('Failed to fetch flights');
        setLoading(false);
        console.error('Error fetching flights:', err);
    }
};


function FlightResults() {

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [flights, setFlights] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filteredflight,setfilteredflight]=useState([])
   
    const searchData = {
        origin: searchParams.get('origin'),
        destination: searchParams.get('destination'),
        journeyDate: searchParams.get('journeyDate'),
        returnDate: searchParams.get('returnDate'),
        tripType: searchParams.get('tripType'),
        adults: parseInt(searchParams.get('adults')) || 1,
        children: parseInt(searchParams.get('children')) || 0,
        seatClass: searchParams.get('seatClass')
    };


    useEffect(() => {
        fetchFlights();
    }, []);






    if (loading) {
        return (
            <div>
                <LoadingScreen />
            </div>
        );
    }


   const prices=flights.map(flight=>flight.price);
   const minprice=Math.min(...prices);
   const maxprice=Math.max(...prices);
   const [rangeprice,setrange]=useState([minprice,maxprice]);
   const handleRangeChange=(newval)=>{
           setrange(newval);
   }
   useEffect(()=>{
    const [mn,mx]=rangeprice;
    const filteredflight=flights.filter(f=>f.price>=mn&&f.price<=mx);
   },[rangeprice,flights])
    
    return (
        <div>
            <Navbar
                flg={true}
            />

            <div className='grid grid-cols-7 gap-4 px-6 lg:px-8 mt-20'>
                <div className='col-span-2 bg-red-600 p-4 h-500 ml-30'>
                    {/* Eikhane Filter Thakbe */}

                    <PriceRange
                    // minprice={minprice}
                    // maxprice={maxprice}
                    // onpricechange={handleRangeChange}
                    
                    />

                </div>

                <div className='col-span-5 bg-teal-400 p-4 h-500 mr-30'>
                    {/* Eikhne Flight Details Thakbe */}
                    <div className='flex flex-col gap-4'>
                        <div className='bg-teal-500 h-50'></div>
                        <div className='bg-teal-500 h-50'></div>
                        <div className='bg-teal-500 h-200'></div>
                    </div>

                </div>

            </div>
        </div>
    );
}

export default FlightResults;