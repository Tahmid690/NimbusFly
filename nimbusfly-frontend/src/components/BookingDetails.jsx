import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import { useLocation } from "react-router-dom";
import BookingStages from "./BookingStages";


const BookingDetails = () => {
    const location = useLocation();
    console.log(location);
    const flight = location.state;
    console.log(flight);

    return (
        <>
            <Navbar flg={true} />
            <div className="mt-20">
                <BookingStages stage={1}/>
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