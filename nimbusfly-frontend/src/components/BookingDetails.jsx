import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import { useLocation } from "react-router-dom";
import BookingStages from "./BookingStages";


const BookingDetails = () => {
    const location = useLocation();
    const flight = location.state;
    console.log(flight);

    return (
        <>
            <Navbar flg={true} />
            <div className="mt-20">
                <BookingStages stage={1}/>
            </div>

        </>
    );

}

export default BookingDetails;