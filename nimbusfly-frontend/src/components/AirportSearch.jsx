import { useEffect, useState } from "react";

function AirportSearch(){
    const [queryo,setQueryo] = useState('');
    const [queryd,setQueryd] = useState('');

    const [resultsd,setResultsd] = useState([]);
    const [resultso,setResultso] = useState([]);
    
    const [selectedAirporto, setSelectedAirporto] = useState(null); 
    const [selectedAirportd, setSelectedAirportd] = useState(null); 

    useEffect(()=>{

        if(!queryo){
            setResultso([]);
            return;
        }
        const abortController = new AbortController();
        // console.log(queryo);
        const fetch_data = setTimeout(()=>{
            const fetch_airport = async () =>{
                try{
                    let cd="";
                    if(selectedAirportd) cd=selectedAirportd.iata_code;
                    const res = await fetch(`http://localhost:3000/airports/search_name?query=${queryo}&iata_code=${cd}`,{ signal: abortController.signal });
                    const data = await res.json();
                    setResultso(data);
                }
                catch(err){
                    if (err.name !== 'AbortError') { 
                    console.error("Error fetching airports:", err);
                    setResultso([]);
                }
                }
            };
            fetch_airport();
            
        },5);

        

        return ()=> {
            clearTimeout(fetch_data);
            abortController.abort();
        }
        

    },[queryo,queryd]);

    useEffect(()=>{
        if(!queryd){
            setResultsd([]);
            return;
        }
        const abortController = new AbortController();
        
        const fetch_data = setTimeout(()=>{
            const fetch_airport = async () =>{
                try{
                    let cd="";
                    if(selectedAirporto) cd=selectedAirporto.iata_code;
                    const res = await fetch(`http://localhost:3000/airports/search_name?query=${queryd}&iata_code=${cd}`,{ signal: abortController.signal });
                    const data = await res.json();
                    setResultsd(data);
                }
                catch(err){
                    if (err.name !== 'AbortError') { 
                        console.error("Error fetching destination airports:", err);
                        setResultsd([]);
                    }
                }
            };
            fetch_airport();
        },5);

        return ()=> {
            clearTimeout(fetch_data);
            abortController.abort();
        }
    },[queryd,queryo]);



    function handleInputChangeo(e) {
        setQueryo(e.target.value);
        setSelectedAirporto(null); 
    }

    function handleInputChanged(e) {
        setQueryd(e.target.value);
        setSelectedAirportd(null); 
    }

    const handleSelecto = (airport) => {
        setSelectedAirporto(airport);
        setQueryo(`${airport.airport_name} (${airport.iata_code}) (${airport.city}) (${airport.country})`);
        setResultso([]);
    };

    const handleSelectd = (airport) => {
        setSelectedAirportd(airport);
        setQueryd(`${airport.airport_name} (${airport.iata_code})`);
        setResultsd([]);
    };

    return(
        <div className="text-center">
            <input
                type="text"
                placeholder="Origin Airport" 
                value={queryo}
                onChange={handleInputChangeo}
                className="bg-blue-200 text-red-600" 
            />
            
           

            {   
                
                resultso.length>0 && !selectedAirporto && (

                    <ul>
                        {
                            resultso.map((airport)=>(
                                
                                    <li
                                        key={airport.airport_name}
                                        onClick={()=> handleSelecto(airport)}
                                    >
                                        {airport.airport_name}({airport.iata_code})
                                    </li>
                                
                            ))
                        }
                    </ul>

                )
            }
            {
                selectedAirporto && (
                    <div className="bg-amber-100">
                        <strong>Selected Airport:</strong><br />
                        Name: {selectedAirporto.airport_name}<br />
                        Code: {selectedAirporto.iata_code}
                    </div>
                )
            }

            <br/>
            
            <input
                type="text"
                placeholder="Destination Airport" 
                value={queryd}
                onChange={handleInputChanged}
                className="bg-blue-200 text-red-600" 
            />

            {   
                
                resultsd.length>0 && !selectedAirportd && (

                    <ul>
                        {
                            resultsd.map((airport)=>(
                                
                                    <li
                                        key={airport.airport_name}
                                        onClick={()=> handleSelectd(airport)}
                                    >
                                        {airport.airport_name}({airport.iata_code})
                                    </li>
                                
                            ))
                        }
                    </ul>

                )
            }
            {
                selectedAirportd && (
                    <div className="bg-amber-100">
                        <strong>Selected Airport:</strong><br />
                        Name: {selectedAirportd.airport_name}<br />
                        Code: {selectedAirportd.iata_code}
                    </div>
                )
            }

        </div>
    )
}

export default AirportSearch