import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const timeSlots = [
  { label: "00-06 AM", icon: "🌅" },
  { label: "06-12 PM", icon: "☀️" },
  { label: "12-06 PM", icon: "🌤️" },
  { label: "06-12 AM", icon: "🌙" },
];

export default function Flightscedule({ origin, destination, origin_port,des_port,trip_type,ontimechangedes1,ontimechangedes2,ontimechangearr1,ontimechangearr2 }) {
  const [isexpand, setexpand] = useState(true);
  const [depart, setdepart] = useState(true);
  const [trip, settrip] = useState(false);
  const [dept,setdept]=useState([false,false,false,false]);
  const [arrt,setarrt]=useState([false,false,false,false]);
  const [rdept,setrdept]=useState([false,false,false,false]);
  const [rarrt,setrarrt]=useState([false,false,false,false]);
  useEffect(() => {
    settrip(trip_type === "round-trip");
  }, []);
const handledept = (i) => {
  setdept(prev => prev.map((val, index) => index === i ? !val : false));
};
   const handlerdept=async(i)=>{
     setrdept(prev=>prev.map((val,idx)=>idx==i?!val:false));
  }
   const handlearrt=async(i)=>{
     setarrt(prev=>prev.map((val,idx)=>idx==i?!val:false));
  }
   const handlerarrt=async(i)=>{
     setrarrt(prev=>prev.map((val,idx)=>idx==i?!val:false));
  }
  return (
    <div className="max-w-md mx-auto bg-gradient-to-br from-sky-50 to-blue-100 p-3 rounded-lg mt-4">
      <style>{`
        .collapse-transition {
          transition: all 0.3s ease-in-out;
          overflow: hidden;
        }
      `}</style>

      <div
        className="flex items-center justify-between p-6 cursor-pointer hover:bg-white/20 transition-all duration-200 rounded-t-2xl group"
        onClick={() => setexpand(!isexpand)}
      >
        <h3 className="text-slate-900 font-semibold text-xl flex items-center gap-2">
          <div className="w-2 h-2 bg-gradient-to-r from-sky-400 to-blue-500 rounded-full"></div>
          Flight Schedules
        </h3>
        <div className="p-2 rounded-full group-hover:bg-sky-200 transition-colors">
          {isexpand ? (
            <ChevronUp className="w-5 h-5 text-sky-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-sky-600" />
          )}
        </div>
      </div>

      {/* Move ALL content inside the collapsible container */}
      <div
        className={`collapse-transition ${
          isexpand ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {/* Departure/Arrival buttons */}
        <div className="flex p-1">
          <button
            className={`flex-1 px-4 py-2 rounded-md transition-all duration-500 ${
              depart
                ? "bg-blue-500 text-white"
                : "bg-white-300 text-black-800 hover:bg-white/70"
            }`}
            onClick={() => {
              setdepart(true);
            }}
          >
            Departure
          </button>
          <button
            className={`flex-1 px-4 py-2 rounded-md transition-all duration-500 ${
              !depart
                ? "bg-blue-500 text-white"
                : "bg-white-300 text-black-800 hover:bg-white/70"
            }`}
            onClick={() => setdepart(false)}
          >
            Arrival
          </button>
        </div>

        {/* Time slots content */}
        {depart ? (
          <div>
            <p className="font-medium font-semibold text-sm text-slate-700 mb-2">
              Departure {origin}: Anytime
            </p>
            <div className="grid grid-cols-2 gap-2">
              {timeSlots.map((slot, i) => (
                
                <button
                  key={i}
                  
                  onClick={() => {
                  ontimechangedes1(dept[i]?null:{ type: 'departure', port: origin_port, slot: slot.label });
                  handledept(i); // 
                  }}

  
                   className={`flex items-center justify-center gap-2 transitio  py-2 px-3 rounded-md shadow text-sm ${dept[i]?'bg-blue-500 text-white': 'bg-gray-100 hover:bg-blue-100'}`}
                >
                  <span>{slot.icon}</span> {slot.label}
                </button>
              ))}
            </div>
            {trip ? (
              <div>
                <p className="font-medium font-semibold text-sm text-slate-700 mb-2">
                  Departure {destination}: Anytime
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {timeSlots.map((slot, i) => (
                    <button
                      key={i}
                    onClick={() => {
                     ontimechangedes2(rdept[i]?null:{ type: 'departure', port: origin_port, slot: slot.label });
                     handlerdept(i); // 
                    }}
                     className={`flex items-center justify-center gap-2 transition  py-2 px-3 rounded-md shadow text-sm ${rdept[i]?'bg-blue-500 text-white': 'bg-gray-100 hover:bg-blue-100'}`}
                    >
                      <span>{slot.icon}</span> {slot.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <div>
            <p className="font-medium font-semibold text-sm text-slate-700 mb-2">
              Arrival {destination}: Anytime
            </p>
            <div className="grid grid-cols-2 gap-2">
              {timeSlots.map((slot, i) => (
                <button
                  key={i}
                  onClick={()=>{
                    ontimechangearr1(arrt[i]?null:{type:'arrival',port:des_port,slot:slot.label});
                    handlearrt(i);
                  }}
                   className={`flex items-center justify-center gap-2 transitio  py-2 px-3 rounded-md shadow text-sm ${arrt[i]?'bg-blue-500 text-white': 'bg-gray-100 hover:bg-blue-100'}`}
                >
                  <span>{slot.icon}</span> {slot.label}
                </button>
              ))}
            </div>
            {trip ? (
              <div>
                <p className="font-medium font-semibold text-sm text-slate-700 mb-2">
                  Arrival {origin}: Anytime
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {timeSlots.map((slot, i) => (
                    <button
                      key={i}
                      onClick={()=>{ontimechangearr2(rarrt[i]?null:{type:'arrival',port:origin_port,slot:slot.label});
                      handlerarrt(i);
                    }}
                       className={`flex items-center justify-center gap-2 transition  py-2 px-3 rounded-md shadow text-sm ${rarrt[i]?'bg-blue-500 text-white': 'bg-gray-100 hover:bg-blue-100'}`}
                    >
                      <span>{slot.icon}</span> {slot.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
