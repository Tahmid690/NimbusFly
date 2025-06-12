import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

function Airlinefilter({airlines,handleselect}) {
  const [isexpand, setexpand] = useState(true);
  const [selectedairline, setselectedairline] = useState(new Set());
  const airline=airlines;
  console.log(airline);
  const handletoggle=(name)=>{
   const newline=new Set(selectedairline);
   if(newline.has(name)){newline.delete(name),handleselect(name,0);}
   else {newline.add(name),handleselect(name,1);}
   setselectedairline(newline);
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
       {airline.map((name,i)=>(
       <div>
        <label key={name}>
          
           <input type="checkbox" className="w-4 h-4" onChange={()=>handletoggle(name)}/>
           
           <span className={`ml-2 text-lg ${selectedairline.has(name)?'text-sm text-blue-600 font-bold':'text-sm text-slate-700'}`}>{name}</span>
        </label>
        </div>
       ))}

      </div>
    </div>
  );
}

export default Airlinefilter;
