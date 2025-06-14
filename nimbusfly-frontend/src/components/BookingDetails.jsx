import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import { useLocation } from "react-router-dom";
import BookingStages from "./BookingStages";
import FlightSummary from "./FlightSummary";

const BookingDetails = () => {
    const location = useLocation();
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

        </>
    );

}

export default BookingDetails;