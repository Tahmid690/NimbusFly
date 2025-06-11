import { useEffect, useState } from 'react';
import Navbar from "./Navbar";
import { Plane, Search } from 'lucide-react';
import FlightCard from './FlightCard';
import AirportSearch from './AirportSearch'
import { useSearchParams, useNavigate } from 'react-router-dom';
import PriceRange from './Bookingfilter/Pricerange';
import Flightscedule from './Bookingfilter/Flightschedule';
import Airlinefilter from './Bookingfilter/Airlinefilter';
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

const NoResults = ({ totalFlights, filteredCount }) => (
    <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
        <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <Plane className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No flights found</h3>
        <p className="text-gray-600 mb-4">
            No flights match your current price filter.
        </p>
        <p className="text-sm text-gray-500">
            Showing 0 of {totalFlights} available flights
        </p>
    </div>
);

function FlightResults() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const [overLay, setOverLay] = useState(false);
    const [allflights, setAllFlights] = useState([]);
    const [flights, setFlights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtering, setFiltering] = useState(false);
    const [error, setError] = useState(null);

    const [selectedOption, setSelectedOption] = useState('Cheapest');
    const options = ['Cheapest', 'Fastest', 'Earliest'];

    const [originCity, setOriginCity] = useState('');
    const [destinationCity, setDestinationCity] = useState('');

    const [Origin_Airport, setOrigin_Airport] = useState('');
    const [Dest_Airport, setDest_Airport] = useState('');

    const [originportid,setoriginportid]=useState(0);
    const [desportid,setdesportid]=useState(0);

    const [filteredFlights, setFilteredFlights] = useState([]);
    const [rangeprice, setrange] = useState([0, 10000]);
    const [rangeValues, setRangeValues] = useState([0, 1000000]);
    const [timefilterdep1,settimefilterdep1]=useState(null);
    const [timefilterdep2,settimefilterdep2]=useState(null);
    const [timefilterarr1,settimefilterarr1]=useState(null);
    const [timefilterarr2,settimefilterarr2]=useState(null);
    // Initialize searchData directly from searchParams
    const [searchData, setSearchData] = useState({
        origin: searchParams.get('origin') || '',
        destination: searchParams.get('destination') || '',
        journeyDate: searchParams.get('journeyDate') || '',
        returnDate: searchParams.get('returnDate') || '',
        tripType: searchParams.get('tripType') || '',
        adults: parseInt(searchParams.get('adults')) || 1,
        children: parseInt(searchParams.get('children')) || 0,
        seatClass: searchParams.get('seatClass') || '',
        orderType: selectedOption
    });

    const fetchFlights = async () => {
        try {
            setLoading(true);
            setOverLay(false);
            // Get current search parameters
            const currentSearchData = {
                origin: searchParams.get('origin'),
                destination: searchParams.get('destination'),
                journeyDate: searchParams.get('journeyDate'),
                returnDate: searchParams.get('returnDate'),
                tripType: searchParams.get('tripType'),
                adults: parseInt(searchParams.get('adults')) || 1,
                children: parseInt(searchParams.get('children')) || 0,
                seatClass: searchParams.get('seatClass'),
                orderType: selectedOption
            };

            setSearchData(currentSearchData);

            console.log('Search params:', searchParams.toString());
            
            const apiUrl = `http://localhost:3000/flights/search?${searchParams.toString()}&orderType=${selectedOption}`;
            const response = await fetch(apiUrl);
            const data = await response.json();

            // Fetch city and airport information
            const oct = await fetch(`http://localhost:3000/airports/city?iata=${currentSearchData.origin}`);
            const pct = await oct.json();
            setOriginCity(pct);
            
            const dct = await fetch(`http://localhost:3000/airports/city?iata=${currentSearchData.destination}`);
            const qct = await dct.json();
            setDestinationCity(qct);
            // console.log(qct);
            const oap = await (await fetch(`http://localhost:3000/airports/iata?iata_code=${currentSearchData.origin}`)).json();
            setOrigin_Airport(oap[0]);
            setoriginportid(oap[0].airport_id);
            
            const dap = await (await fetch(`http://localhost:3000/airports/iata?iata_code=${currentSearchData.destination}`)).json();
            setDest_Airport(dap[0]);
            setdesportid(dap[0].airport_id);
                //                  console.log(oap[0].airport_id);
                 //       console.log(dap[0].airport_id);

            // Set up price filtering
            const prices = (data.data).map(f => parseFloat(f.total_ticket_price));
            const min = Math.min(...prices);
            const max = Math.max(...prices);

            setrange([min, max]);
            setRangeValues([min, max]);
            setFilteredFlights(data.data);
            setAllFlights(data.data);
            setFlights(data.data);
            setLoading(false);

        } catch (err) {
            setError('Failed to fetch flights');
            setLoading(false);
            console.error('Error fetching flights:', err);
        }
    };

    useEffect(() => {
        if (searchParams.get('origin') && searchParams.get('destination')) {
            fetchFlights();
        }
    }, [searchParams,selectedOption]); 


    useEffect(() => {
        console.log(allflights);
        
        const updt_flights = async () => {
            const actualMin = Math.min(rangeValues[0], rangeValues[1]);
            const actualMax = Math.max(rangeValues[0], rangeValues[1]);
            const crs = [Math.round(actualMin), Math.round(actualMax)];
            console.log(crs);
            console.log(rangeprice);
            if (allflights.length === 0 || JSON.stringify(crs) === JSON.stringify(rangeprice)) return;
            // console.log("Bujhlm na");
            setFiltering(true);
            await new Promise(resolve => setTimeout(resolve, 200));
            
            let filtered = allflights.filter(f => {
               if(!(parseFloat(f.total_ticket_price) >= crs[0] && parseFloat(f.total_ticket_price) <= crs[1]))return false;
               const oriport=f.origin_airport_id;
               const desport=f.destination_airport_id;

              if(searchData.tripType==='one-way'){
                   if(timefilterdep1){
                const time=new Date(f.departure_time).getHours();
                const [start,end]=convertslot(timefilterdep1.slot);
                if(!(time>=start&&time<end))return false;
               }
                if(timefilterarr1){
                const time=new Date(f.arrival_time).getHours();
                const [start,end]=convertslot(timefilterarr1.slot);
                if(!(time>=start&&time<end))return false;
               }
               return true;
              }

              else{
                 const dept=new Date(f.departure_time).getHours();
                 const arrt=new Date(f.arrival_time).getHours();
                 const rdept=new Date(f.return_departure_time).getHours();
                 const rarrt=new Date(f.return_arrival_time).getHours();
                 if(timefilterdep1){
                    const [start,end]=convertslot(timefilterdep1.slot);
                    if(!(dept>=start&&dept<end))return false;
                 }
                 if(timefilterdep2){
                     const [start,end]=convertslot(timefilterdep2.slot);
                    if(!(rdept>=start&&rdept<end))return false;
                 }
                 if(timefilterarr1){
                    const [start,end]=convertslot(timefilterarr1.slot);
                    if(!(arrt>=start&&arrt<end))return false;
                 }
                  if(timefilterarr2){
                    const [start,end]=convertslot(timefilterarr2.slot);
                    if(!(rarrt>=start&&rarrt<end))return false;
                 }
                 
                return true;

              }
               
        });
            
            if (JSON.stringify(filtered) !== JSON.stringify(flights)) {
                setFlights(filtered);
            }

            
            
            setFiltering(false);
        }
        updt_flights();
    }, [rangeValues, allflights,timefilterdep1,timefilterdep2,timefilterarr1,timefilterarr2]);

    const convertslot=(label)=>{
        const [st,en,period]=label.split(/[- ]/);
        let start=parseInt(st);
        let end=parseInt(en);
        if(period=='AM'){
           if(start===6)start=18;
           if(end===12)end=0;
        }
        else if(period==='PM'&&end!==12){
            end+=12;
        }
        return [start,end];
    }

    const jrnydate = new Date(searchData.journeyDate);
    const formattedDateJour = jrnydate.toLocaleDateString('en-US', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });

    const handleRangeChange = (newval) => {
        setrange(newval);
    };

    if (loading) {
        return (
            <div>
                <LoadingScreen />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="bg-white rounded-lg p-8 shadow-lg">
                    <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
                    <p className="text-gray-600">{error}</p>
                    <button 
                        onClick={() => navigate('/')} 
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Go Back to Search
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Navbar flg={true} />

            {overLay && (
                <div className='fixed inset-0 bg-black/70 z-50 flex justify-center'
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
            )}

            <div className='grid grid-cols-7 px-6 lg:px-8 mt-20'>

                {/* ******filter */}
                <div className='col-span-2 p-4 ml-30'>
                    <div className='col-span-2 p-4 h-fit rounded shadow'>
                        <PriceRange
                            minprice={rangeprice[0]}
                            maxprice={rangeprice[1]}
                            rangeValues={rangeValues}
                            setRangeValues={setRangeValues}
                        />
                        <Flightscedule
                        origin={originCity.data}
                        destination={destinationCity.data}
                        origin_port={originportid}
                        des_port={desportid}
                        trip_type={searchData.tripType}
                        ontimechangedes1={settimefilterdep1} 
                        ontimechangedes2={settimefilterdep2}
                        ontimechangearr1={settimefilterarr1}
                        ontimechangearr2={settimefilterarr2}                     
                        />

                        <Airlinefilter/>
                    </div>
                </div>

                <div className='col-span-5 p-4 h-500 mr-30'>
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

                        <div className='space-y-4 relative'>
                            {filtering && (
                                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
                                    <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-xl shadow-lg border border-blue-200">
                                        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                        <span className="text-gray-700 font-medium">Filtering flights...</span>
                                    </div>
                                </div>
                            )}
                            
                            <div className={`transition-all duration-300 ${filtering ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                                {flights.length === 0 && !filtering ? (
                                    <NoResults totalFlights={allflights.length} filteredCount={flights.length} />
                                ) : (
                                    flights.map((flight, index) => (
                                        <div 
                                            key={`${flight.id}-${index}`} 
                                            className="transform transition-all duration-300 hover:scale-[1.02]"
                                            style={{
                                                animationDelay: `${index * 50}ms`,
                                                animation: filtering ? 'none' : 'fadeInUp 0.3s ease-out forwards'
                                            }}
                                        >
                                            <FlightCard
                                                flight={flight}
                                                origin={searchData.origin}
                                                destination={searchData.destination}
                                                adult={searchData.adults}
                                                child={searchData.children}
                                                Origin_Airport={Origin_Airport}
                                                Dest_Airport={Dest_Airport}
                                                tripType={searchData.tripType}
                                            />
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
}

export default FlightResults;