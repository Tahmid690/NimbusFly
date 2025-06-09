import React, { useEffect, useState } from 'react';
import { ChevronDown, Heart, Plane, Clock, Users, Luggage, Star, Wifi, Coffee, Search, Filter, SlidersHorizontal } from 'lucide-react';


const FlightCard = ({ flight, origin, destination ,adult,child}) => {

    const formatTime = (timeString) => {
        const date = new Date(timeString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

    const calculateDuration = (departure, arrival) => {
        const dep = new Date(departure);
        const arr = new Date(arrival);
        const diffMs = Math.abs(arr - dep);
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        if (hours === 0) return `${minutes}m`;
        if (minutes === 0) return `${hours}h`;
        return `${hours}h ${minutes}m`;
    };


    const flightData = flight;
    const departureTime = formatTime(flightData.departure_time);
    const arrivalTime = formatTime(flightData.arrival_time);
    const duration = calculateDuration(flightData.departure_time, flightData.arrival_time);
    const price = parseFloat(flightData.base_price)*parseInt(adult)+parseFloat(flightData.base_price)*parseInt(child)*0.75;

    return (
        <div className="group relative bg-white border border-sky-100 rounded-3xl mb-3 overflow-hidden hover:shadow-xl hover:shadow-sky-200/50 hover:border-sky-200 transition-all duration-500 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-r from-sky-50/0 via-blue-50/0 to-cyan-50/0 group-hover:from-sky-50/60 group-hover:via-blue-50/40 group-hover:to-cyan-50/60 transition-all duration-700 pointer-events-none"></div>
            <div className="relative flex">
                <div className="flex-1 p-4 lg:p-6">
                    <div className="flex items-center space-x-3 lg:space-x-4 mb-4 lg:mb-5">
                        <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center text-white font-bold text-xs lg:text-sm shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                            LG
                        </div>
                        <div className="flex-1">
                            <div className="font-bold text-gray-900 text-base lg:text-lg mb-1">{flightData.airline_name}</div>
                            <div className="text-xs lg:text-sm text-gray-600 flex items-center space-x-2">
                                <span className="font-medium">{flightData.flight_number}</span>
                                <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                                <span>{flightData.aircraft_name}</span>
                                <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                            </div>
                        </div>
                    </div>

                    <div className="relative mb-4 lg:mb-5">
                        <div className="flex items-center justify-between">
                            <div className="text-center">
                                <div className="text-xl lg:text-2xl font-bold text-gray-900 mb-1">{departureTime}</div>
                                <div className="text-xs lg:text-sm font-bold text-sky-700 bg-sky-100 px-2 lg:px-3 py-1 rounded-full">
                                    {origin || "JFK"}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">Departure</div>
                            </div>


                            <div className="flex-1 mx-4 lg:mx-6 relative">
                                <div className="absolute -top-14 left-1/2 transform -translate-x-1/2">
                                    <div className="bg-white border-2 border-sky-200 px-2 py-1 rounded-full shadow-lg">
                                        <div className="text-xs lg:text-sm font-bold text-sky-700 flex items-center space-x-1">
                                            <Clock className="w-3 h-3" />
                                            <span>{duration}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="relative flex items-center">
                                    <div className="h-0.5 lg:h-1 bg-gradient-to-r from-sky-200 via-sky-400 to-sky-200 flex-1 rounded-full shadow-sm"></div>

                                    <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 group-hover:scale-125 transition-all duration-700">
                                        <div className={`w-6 h-6 lg:w-8 lg:h-8 bg-gradient-to-br from-sky-500 to-blue-700 rounded-full flex items-center justify-center shadow-xl ring-2 ring-white`}>
                                            <Plane className="w-2.5 h-2.5 lg:w-3.5 lg:h-3.5 text-white transform rotate-90" />
                                        </div>
                                    </div>
                                </div>

                                
                                <br/>

                                <div className="absolute -bottom-4 lg:-bottom-5 left-1/2 transform -translate-x-1/2">
                                    <div className="text-xs text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                                        Direct Flight
                                    </div>
                                </div>
                            </div>

                            <div className="text-center">
                                <div className="text-xl lg:text-2xl font-bold text-gray-900 mb-1">{arrivalTime}</div>
                                <div className="text-xs lg:text-sm font-bold text-sky-700 bg-sky-100 px-2 lg:px-3 py-1 rounded-full">
                                    {destination || "LAX"}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">Arrival</div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 lg:gap-3 text-xs lg:text-sm">
                        <div className="flex items-center space-x-1 lg:space-x-2 text-gray-700 bg-gray-50 px-2 py-1 rounded-full">
                            <Luggage className="w-3 h-3 text-sky-600" />
                            <span className="font-medium">{flightData.baggage_limit}kg</span>
                        </div>
                        <div className="flex items-center space-x-1 lg:space-x-2 text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                            <span className="font-medium">Refundable</span>
                        </div>
                        <div className="flex items-center space-x-1 lg:space-x-2 text-amber-700 bg-amber-50 px-2 py-1 rounded-full">
                            <Coffee className="w-3 h-3 text-amber-600" />
                            <span className="font-medium">Meals</span>
                        </div>
                    </div>
                </div>

                <div className="w-52 lg:w-64 bg-gradient-to-br from-sky-50/80 to-blue-50/80 border-l border-sky-100 flex flex-col justify-between p-4 lg:p-6 group-hover:from-sky-100/90 group-hover:to-blue-100/90 transition-all duration-500">
                    <div className="text-center">
                        <div className="mt-4 lg:mt-6">
                            <div className="text-xs text-sky-600 uppercase tracking-wider font-bold mb-1 lg:mb-2">
                                Total Price
                            </div>
                            <div className="text-xl lg:text-3xl font-black text-gray-900 mb-1">
                                ${Math.round(price).toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-600 font-medium">
                                Includes taxes & fees
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2 lg:space-y-3 mt-4">
                        <button className={`w-full bg-gradient-to-r from-sky-500 to-blue-700 text-white py-2.5 lg:py-3 rounded-xl font-bold text-sm lg:text-base shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 flex items-center justify-center space-x-2 group/btn`}>
                            <span>Select Flight</span>
                            <div className="w-4 h-4 lg:w-5 lg:h-5 bg-white/20 rounded-full flex items-center justify-center group-hover/btn:bg-white/30 transition-colors duration-200">
                                <ChevronDown className="w-2.5 h-2.5 lg:w-3 lg:h-3 transform -rotate-90 group-hover/btn:translate-x-0.5 transition-transform duration-200" />
                            </div>
                        </button>

                        <button className="w-full text-sky-700 hover:text-sky-900 py-2 text-xs lg:text-sm font-bold flex items-center justify-center space-x-2 hover:bg-white/70 rounded-lg transition-all duration-200 border border-sky-200 hover:border-sky-300">
                            <span>View Details</span>
                            <ChevronDown className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FlightCard;