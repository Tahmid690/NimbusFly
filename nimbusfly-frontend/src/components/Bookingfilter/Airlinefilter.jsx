import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const timeSlots = [
  { label: "00-06 AM", icon: "🌅" },
  { label: "06-12 PM", icon: "☀️" },
  { label: "12-06 PM", icon: "🌤️" },
  { label: "06-12 AM", icon: "🌙" },
];

export default function Flightscedule({ origin, destination, trip_type,ontimechange }) {
  const [isexpand, setexpand] = useState(true);
  const [depart, setdepart] = useState(true);
  const [trip, settrip] = useState(false);

  useEffect(() => {
    settrip(trip_type === "round-trip");
  }, []);

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
           Airlines
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

        {/* Time slots content */}
      </div>
    </div>
  );
}
