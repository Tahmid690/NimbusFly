import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import { useLocation } from "react-router-dom";
import BookingStages from "./BookingStages";
import FlightSummary from "./FlightSummary";
import Passengerform from "./Passengerform";
import axios from "axios";
const BookingDetails = () => {
  const [user_id, setuser_id] = useState(null);
  const [savedpassenger, setsavedpassenger] = useState(null);
  const location = useLocation();
  console.log(location);
  const flight = location.state;
  console.log("Booking Page", flight);

  useEffect(() => {
    const det = JSON.parse(localStorage.getItem("userData"));
    //  console.log(str);

    console.log(det.customer_id);
    setuser_id(det.customer_id);

    const fetchsavedpass = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/passenger/customer/${det.customer_id}`);
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
  const handlecontinue = async () => {
    try {
      console.log(passengers);
      const newp = getnewpassenger();
      console.log(newp);
      const response = await axios.post('http://localhost:3000/passenger/add', { passengers: newp });
      console.log("Passengers added successfully: ", response.data);

    } catch (err) {
      console.log("Err saving passenger, ", err.response?.data || err.message)
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
                        ontraveller={handletravellerselection}
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
              <div className="bg-white rounded-3xl shadow-lg p-6 sticky top-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Price Summary</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-600">Adults</span>
                      <span className="text-sm text-gray-500">({flight.data.adult})</span>
                    </div>
                    <span className="font-medium">${(flight.data.base_price * flight.data.adult).toFixed(2)}</span>
                  </div>
                  
                  {flight.data.child > 0 && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-600">Children</span>
                        <span className="text-sm text-gray-500">({flight.data.child})</span>
                      </div>
                      <span className="font-medium">${(flight.data.base_price * 0.75 * flight.data.child).toFixed(2)}</span>
                    </div>
                  )}
                  
                  
                  <hr className="my-4" />
                  
                  <div className="flex items-center justify-between text-lg font-bold">
                    <span className="text-gray-900">Total</span>
                    <span className="text-blue-600">
                      ${(
                        flight.data.base_price * flight.data.adult + 
                        flight.data.base_price * 0.75 * flight.data.child
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium text-blue-800">Trip Details</span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Route:</span>
                      <span className="font-medium">{flight.data.origin} → {flight.data.destination}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Trip Type:</span>
                      <span className="font-medium capitalize">{flight.data.tripType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Class:</span>
                      <span className="font-medium">{flight.data.seatClass || 'Economy'}</span>
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
