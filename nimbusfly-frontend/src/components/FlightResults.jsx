import { useSearchParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Navbar from "./Navbar";


function FlightResults() {
    

    return (
        <div>
            <Navbar 
                flg={true}
            />            

            <div className='grid grid-cols-7 gap-4 px-6 lg:px-8'>
                <div className='col-span-2 bg-red-600 p-4 h-500 ml-30'>
                    {/* Eikhane Filter Thakbe */}

                </div>

                <div className='col-span-5 bg-teal-400 p-4 h-500 mr-30'>
                    {/* Eikhne Flight Details Thakbe */}

                </div>

            </div>
        </div>
    );
}

export default FlightResults;