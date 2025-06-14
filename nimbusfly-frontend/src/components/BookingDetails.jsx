import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import { useLocation } from "react-router-dom";
import BookingStages from "./BookingStages";
import FlightSummary from "./FlightSummary";

const BookingDetails = () => {
    const location = useLocation();
    console.log(location);
    const flight = location.state;
    console.log("Booking Page",flight);

    return (
        <>
            <Navbar flg={true} />
            <div className="mt-20">
                <BookingStages stage={1}/>
                <div className="w-full grid grid-cols-3 pl-60 pr-60 pt-10">
                    <div className="col-span-2">
                        <FlightSummary flight={flight.data}/>
                    </div>
                    <div className=" bg-blue-200">
                        
                        {/* <FlightSummary flight={flight.data}/> */}
                    </div>
                    

                </div>
                
            </div>
            <div className="flex px-6 lg:px-8 mt-10 h-screen">
                <div className="w-3/4 flex-shrink-0 overflow-y-auto p-4 ml-30">
                  {/* flight details and passenger form */}

                </div>

                <div className="w-1/4 flex-shrink-0 overflow-y-auto p-4 mr-30">
                    {/* ticket summary */}

                </div>


            </div>

        </>
    );

}

export default BookingDetails;