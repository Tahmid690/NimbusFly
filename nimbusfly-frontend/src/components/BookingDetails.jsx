import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import { useLocation } from "react-router-dom";
import BookingStages from "./BookingStages";
import FlightSummary from "./FlightSummary";
import Passengerform from "./Passengerform";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { CreditCard, Users } from "lucide-react";
import { useToast } from './AdminDashboard/components/UI/Toast';

const API_BASE = import.meta.env.VITE_API_URL;
const BookingDetails = () => {
  const  toast  = useToast();
  const [user_id, setuser_id] = useState(null);
  const [savedpassenger, setsavedpassenger] = useState(null);
  const location = useLocation();
  console.log(location);
  const flight = location.state;
  console.log("Booking Page", flight);
  const navigate=useNavigate();
  useEffect(() => {
    const det = JSON.parse(localStorage.getItem("userData"));
    //  console.log(str);

    console.log(det.customer_id);
    setuser_id(det.customer_id);

    const fetchsavedpass = async () => {
      try {
        const response = await axios.get(`${API_BASE}/passenger/customer/${det.customer_id}`);
        console.log("Fetch successful: ", response);
        setsavedpassenger(response.data.data);
        console.log(response.data.data);
      } catch (err) {
        console.log("Error fetching passenger: ", err.response?.data || err.message)
      }
    }
    fetchsavedpass();
  }, []);
  const totalpassenger = flight.data.adult + flight.data.child;
  console.log("total: ", totalpassenger);
  const [passengers, setPassengers] = useState([]);
  useEffect(() => {
    if (user_id) {
      const newpass = Array(totalpassenger)
        .fill()
        .map(() => ({
          customer_id: user_id,
          title: "",
          first_name: "",
          last_name: "",
          date_of_birth: "",
          passport_number: "",
          nationality: "Bangladesh",
          selected_traveler: "",
          is_new: true,
        }))
      setPassengers(newpass);
    }

  }, [user_id, totalpassenger]);


  const updatepassenger = (index, field, value) => {
    setPassengers((prev) =>
      prev.map((passenger, i) =>
        i === index ? { ...passenger, [field]: value } : passenger
      )
    );
  };

  const handletravellerselection = async (index, traveller) => {
    setPassengers((prev) =>
      prev.map((passenger, i) =>
        i === index ? { ...traveller, is_new: false } : passenger
      )
    );
  };

  const getnewpassenger = () => {
    return passengers.filter(passenger => passenger.is_new);
  };
  // const handlecontinue = async () => {
  //   try {
  //     console.log(passengers);
  //     const newp = getnewpassenger();
  //     console.log(newp);


  
  //     navigate('/payment',{state:{passengers, flight: flight.data}});

  //   } catch (err) {
  //     console.log("Err saving passenger, ", err.response?.data || err.message)
  //   }

  // }

  const handlecontinue = async () => {
    try {
      console.log(passengers);
      
      if (!passengers || passengers.length === 0) {
        throw new Error("No passengers found");
      }
      
      passengers.forEach((passenger, index) => {
        Object.entries(passenger).forEach(([key, value]) => {
          if (value === null || value === undefined || value === '') {
            if(key!=='title' || key!=='selected_traveler') throw new Error(`Passenger ${index + 1}: ${key} cannot be null or empty`);
          }
        });
      });
      
      const newp = getnewpassenger();
      console.log(newp);

      navigate('/payment', {
        state: {
          passengers, 
          flight: flight.data
        }
      });

    } catch (err) {
      console.log("Err saving passenger, ", err.response?.data || err.message);
      // alert(err.message);
      toast.error(err.message);
    }
}

  return (
    <>
      <div className="bg-blue-100">
        <Navbar flg={true} />
        <div className="mt-20">
          <BookingStages stage={1} />
          <div className="w-full grid grid-cols-3 pl-60 pr-60 pt-10">
            <div className="col-span-2">
              <FlightSummary flight={flight.data} />

              <div className="w-full flex-shrink-0 overflow-y-auto">
                {/* flight details and passenger form */}

                {/* passenger form */}
                {passengers.map((passenger, index) => {
                  return (
                    <div>
                      <Passengerform
                        index={index}
                        update={updatepassenger}
                        adult={index >= flight.data.adult ? 0 : 1}
                        passengerData={passenger}
                        savedtraveller={savedpassenger}
                      />
                    </div>
                  );
                })}

                <div className="max-w-md mx-auto  p-3 rounded-3xl mt-4">
                  <div className="flex p-1">
                    <button
                      className="flex-1 px-4 py-2 rounded-md transition-all duration-500  bg-blue-600 text-white hover:bg-blue-900"
                      onClick={handlecontinue}
                    >
                      Continue
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-4">
              <div className="bg-white rounded-3xl shadow-lg border border-blue-100 p-6 sticky top-6 hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
                <div className="flex items-center space-x-3 mb-6 pt-2">
                  <div className="p-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl">
                    <CreditCard className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Price Summary</h3>
                    <p className="text-sm text-gray-500">Booking breakdown</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <span className="text-gray-800 font-semibold">Adults</span>
                          <span className="text-sm text-gray-500 bg-blue-100 px-2 py-1 rounded-full ml-2">×{flight.data.adult}</span>
                        </div>
                      </div>
                      <span className="font-bold text-gray-900">${(flight.data.base_price * flight.data.adult).toFixed(2)}</span>
                    </div>
                    
                    {flight.data.child > 0 && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <Users className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <span className="text-gray-800 font-semibold">Children</span>
                            <span className="text-sm text-gray-500 bg-green-100 px-2 py-1 rounded-full ml-2">×{flight.data.child}</span>
                            <span className="text-xs text-gray-500 block">25% discount applied</span>
                          </div>
                        </div>
                        <span className="font-bold text-gray-900">${(flight.data.base_price * 0.75 * flight.data.child).toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4 space-y-3">
                    <div className="flex items-center justify-between py-2">
                      <span className="text-gray-700 font-medium">Subtotal</span>
                      <span className="font-semibold text-gray-900">${(flight.data.base_price * flight.data.adult + flight.data.base_price * 0.75 * flight.data.child).toFixed(2)}</span>
                    </div>
                    
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-700 font-medium">Platform Fee</span>
                        <div className="group relative">
                          <svg className="w-4 h-4 text-gray-400 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                            5% of subtotal (min $15)
                          </div>
                        </div>
                      </div>
                      <span className="font-semibold text-gray-900">${Math.max((flight.data.base_price * flight.data.adult + flight.data.base_price * 0.75 * flight.data.child) * 0.05, 15).toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <span className="text-lg font-bold text-gray-900">Total Amount</span>
                          <p className="text-sm text-gray-600">All fees included</p>
                        </div>
                      </div>
                      <span className="text-2xl font-bold text-blue-600">
                        ${(
                          flight.data.base_price * flight.data.adult + 
                          flight.data.base_price * 0.75 * flight.data.child + 
                          Math.max((flight.data.base_price * flight.data.adult + flight.data.base_price * 0.75 * flight.data.child) * 0.05, 15)
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="p-1 bg-blue-500 rounded-full">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-sm font-bold text-blue-800">Trip Details</span>
                  </div>
                  <div className="text-sm text-gray-700 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Route:</span>
                      <span className="font-semibold text-blue-800">{flight.data.origin} → {flight.data.destination}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Trip Type:</span>
                      <span className="font-semibold text-blue-800 capitalize">{flight.data.tripType}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Class:</span>
                      <span className="font-semibold text-blue-800">{flight.data.seatClass || 'Economy'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Passengers:</span>
                      <span className="font-semibold text-blue-800">{flight.data.adult + flight.data.child} total</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>


          </div>

        </div>
        <div className="flex px-6 lg:px-8 mt-10 h-screen">

        </div>
      </div>
    </>
  );
};

export default BookingDetails;
