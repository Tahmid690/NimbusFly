import { useState } from "react";
import { ChevronDown,ChevronUp } from "lucide-react";
export default function Flightscedule(){
    const [isexpand,setexpand]=useState(true);
    return (
        <div className="max-w-md mx-auto bg-gray-800 rounded-lg mt-4">
            <div
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-700 transition-colors"
            onClick={()=>setexpand(!isexpand)}
            >
                <h3 className="text-white font-medium text-lg">Flight Schedules</h3>
                 {
                    isexpand?(<ChevronUp className="w-5 h-5 text-grey-400"/>):(<ChevronDown className="w-5 h-5 text-grey-400"/>)
                 }
            </div>

            <div className={`collapse-transition ${isexpand?"max-h-96 opacity-100":"max-h-0 opacity-0"}`}>

              <div className="flex p-1">
                <button className="flex-1 px-4 py-2  bg-blue-600 text-white rounded-md hover:bg-blue-700">Departure</button>
                <button className="flex-1 px-4 py-2  bg-blue-600 text-white rounded-md hover:bg-blue-700">Arrival</button>
              </div>

            </div>
         
        </div>
    )
}