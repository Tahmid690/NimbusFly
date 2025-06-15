import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import { useLocation } from "react-router-dom";
import BookingStages from "./BookingStages";

import Passengerform from "./Passengerform";
import axios from "axios";
const BookingDetails = () => {
  const [user_id, setuser_id] = useState(null);
  const [savedpassenger,setsavedpassenger]=useState(null);
  const location = useLocation();
  console.log(location);
  const flight = location.state;
  console.log(flight);

  useEffect(() => {
    const det = JSON.parse(localStorage.getItem("userData"));
  //  console.log(str);

      console.log(det.customer_id);
      setuser_id(det.customer_id);

    const fetchsavedpass=async()=>{
      try{
      const response = await axios.get(`http://localhost:3000/passenger/customer/${det.customer_id}`);
      console.log("Fetch successful: ",response);
      setsavedpassenger(response.data.data);
      console.log(response.data.data);
      }catch(err){
        console.log("Error fetching passenger: ",err.response?.data||err.message)
      }
    }
    fetchsavedpass();
  }, []);
  const totalpassenger = flight.data.adult + flight.data.child;
  console.log("total: ", totalpassenger);
  const [passengers, setPassengers] = useState([]);
  useEffect(()=>{
     if(user_id){
     const newpass= Array(totalpassenger)
      .fill()
      .map(() => ({
        customer_id:user_id,
        title: "",
        first_name: "",
        last_name: "",
        date_of_birth: "",
        passport_number: "",
        nationality: "Afghanistan",
        selected_traveler: "",
        is_new: true,
      }))
      setPassengers(newpass);
     }

  },[user_id,totalpassenger]);


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

  const getnewpassenger =  () => {
    return passengers.filter(passenger => passenger.is_new);
  };
  const handlecontinue=async()=>{
    try{
      console.log(passengers);
      const newp=getnewpassenger();
      console.log(newp);
      const response=await axios.post('http://localhost:3000/passenger/add', {passengers:newp});
      console.log("Passengers added successfully: ",response.data);

    }catch(err){
      console.log("Err saving passenger, ",err.response?.data||err.message)
    }

  }

  return (
    <>
      <div className="bg-blue-100">
        <Navbar flg={true} />
        <div className="mt-20">
          <BookingStages stage={1} />
        </div>
        <div className="flex px-6 lg:px-8 mt-10 h-screen">
          <div className="w-3/5 flex-shrink-0 overflow-y-auto p-4 ml-30">
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

            <div className="max-w-md mx-auto  p-3 rounded-lg mt-4">
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

          <div className="w-2/5 flex-shrink-0 overflow-y-auto p-4 mr-30">
            {/* ticket summary */}
          </div>
        </div>
      </div>
    </>
  );
};

export default BookingDetails;
