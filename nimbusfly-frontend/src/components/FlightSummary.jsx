import React, { useEffect, useState } from 'react';
import { ChevronDown, Heart, Plane, Clock, Users, Luggage, Star, Wifi, Coffee, Search, Filter, SlidersHorizontal, MapPin, Calendar, CreditCard, Shield, Utensils, Monitor, Headphones, User, AlertCircle, CheckCircle, XCircle, Info, Zap, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FlightSummary = ({ flight }) => {
    const [showDetails, setShowDetails] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

    const navigate = useNavigate();
    const flightData = flight;

    const formatTime = (timeString) => {
        const date = new Date(timeString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

    const formatDate = (timeString) => {
        const date = new Date(timeString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
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

    const departureTime = formatTime(flightData.departure_time);
    const arrivalTime = formatTime(flightData.arrival_time);
    const departureDate = formatDate(flightData.departure_time);
    const arrivalDate = formatDate(flightData.arrival_time);
    const duration = calculateDuration(flightData.departure_time, flightData.arrival_time);

    const rt_departureTime = formatTime(flightData.return_departure_time);
    const rt_arrivalTime = formatTime(flightData.return_arrival_time);
    const rt_departureDate = formatDate(flightData.return_departure_time);
    const rt_arrivalDate = formatDate(flightData.return_arrival_time);
    const rt_duration = calculateDuration(flightData.return_departure_time, flightData.return_arrival_time);





    const tabs = [
        { id: 'overview', label: 'Overview', icon: Info },
        { id: 'Fare', label: 'Fare', icon: CreditCard },
        { id: 'baggage', label: 'Baggage', icon: Luggage },
        { id: 'policies', label: 'Policies', icon: Shield }
    ];


    return (
        <div className="group relative bg-white border border-sky-100 rounded-3xl mb-6 overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-sky-200/60 hover:border-sky-300 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-r from-sky-50/20 via-blue-50/10 to-cyan-50/20 opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none"></div>
            <div className="relative flex">
                <div className="flex-1 p-4 lg:p-6">
                    <div className="flex items-center space-x-3 lg:space-x-4 mb-4 lg:mb-5">

                        <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center  group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                            <img
                                src={flightData.logo_url}
                                alt="Logo"
                                className="max-w-8 max-h-8 lg:max-w-17 lg:max-h-10 object-contain"
                            />
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
                                    {flightData.origin || "JFK"}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">Departure</div>
                            </div>

                            <div className="flex-1 mx-4 lg:mx-6 relative">
                                <div className="absolute -top-11 left-1/2 transform -translate-x-1/2">
                                    <div className="bg-white border-2 border-sky-200 px-2  rounded-full shadow-lg">
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

                                <br />

                                <div className="absolute -bottom-4 lg:-bottom-5 left-1/2 transform -translate-x-1/2">
                                    <div className="text-xs text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                                        Direct Flight
                                    </div>
                                </div>
                            </div>

                            <div className="text-center">
                                <div className="text-xl lg:text-2xl font-bold text-gray-900 mb-1">{arrivalTime}</div>
                                <div className="text-xs lg:text-sm font-bold text-sky-700 bg-sky-100 px-2 lg:px-3 py-1 rounded-full">
                                    {flightData.destination}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">Arrival</div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>


            {(flightData.tripType === 'round-trip') && (
                <div className="flex-1 p-4 lg:p-6">
                    <div className="flex items-center space-x-3 lg:space-x-4 mb-4 lg:mb-5">
                        <img
                            src={flightData.logo_url}
                            alt="Logo"
                            className="max-w-8 max-h-8 lg:max-w-17 lg:max-h-10 object-contain"
                        />
                        <div className="flex-1">
                            <div className="font-bold text-gray-900 text-base lg:text-lg mb-1">{flightData.return_airline_name}</div>
                            <div className="text-xs lg:text-sm text-gray-600 flex items-center space-x-2">
                                <span className="font-medium">{flightData.return_flight_number}</span>
                                <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                                <span>{flightData.return_aircraft_name}</span>
                                <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                            </div>
                        </div>
                    </div>

                    <div className="relative mb-4 lg:mb-5">
                        <div className="flex items-center justify-between">
                            <div className="text-center">
                                <div className="text-xl lg:text-2xl font-bold text-gray-900 mb-1">{rt_departureTime}</div>
                                <div className="text-xs lg:text-sm font-bold text-sky-700 bg-sky-100 px-2 lg:px-3 py-1 rounded-full">
                                    {flightData.destination}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">Departure</div>
                            </div>

                            <div className="flex-1 mx-4 lg:mx-6 relative">
                                <div className="absolute -top-11 left-1/2 transform -translate-x-1/2">
                                    <div className="bg-white border-2 border-sky-200 px-2 rounded-full shadow-lg">
                                        <div className="text-xs lg:text-sm font-bold text-sky-700 flex items-center space-x-1">
                                            <Clock className="w-3 h-3" />
                                            <span>{rt_duration}</span>
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

                                <br />

                                <div className="absolute -bottom-4 lg:-bottom-5 left-1/2 transform -translate-x-1/2">
                                    <div className="text-xs text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                                        Direct Flight
                                    </div>
                                </div>
                            </div>

                            <div className="text-center">
                                <div className="text-xl lg:text-2xl font-bold text-gray-900 mb-1">{rt_arrivalTime}</div>
                                <div className="text-xs lg:text-sm font-bold text-sky-700 bg-sky-100 px-2 lg:px-3 py-1 rounded-full">
                                    {flightData.origin}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">Arrival</div>
                            </div>
                        </div>
                    </div>

                </div>



            )}

            <div className="border-t-2 border-sky-200/50 bg-gradient-to-r from-sky-50/40 to-blue-50/40 p-4 lg:p-6">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                        <div className="text-xs text-gray-500 mb-1">Total Price</div>
                        <div className="text-2xl lg:text-3xl font-bold text-gray-900">
                            ${flightData.price || '599'}
                        </div>
                        <div className="text-xs text-gray-500">
                            {flightData.tripType === 'round-trip' ? 'Round trip' : 'One way'} • All taxes included
                        </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                        <button
                            onClick={() => navigate('/booking-details', { state: { data: flightData } })}
                            className="bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 text-white px-6 lg:px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                        >
                            Select Flight
                        </button>
                        <div className="text-xs text-center text-gray-500">
                            Free cancellation
                        </div>
                    </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-sky-100">
                    <div className="flex items-center justify-between text-sm mb-3">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1 text-gray-600">
                                <Users className="w-4 h-4" />
                                <span>{flightData.passengers || 1} {flightData.passengers === 1 ? 'Adult' : 'Adults'}</span>
                            </div>
                            <div className="flex items-center space-x-1 text-gray-600">
                                <Luggage className="w-4 h-4" />
                                <span>Carry-on + {flightData.cabinClass || 'Economy'}</span>
                            </div>
                            <div className="flex items-center space-x-1 text-gray-600">
                                <MapPin className="w-4 h-4" />
                                <span>Seat selection available</span>
                            </div>
                        </div>
                        <div className="text-emerald-600 font-medium">
                            ✓ Refundable
                        </div>
                    </div>
                    
                    <div className="bg-white/70 rounded-xl p-3 border border-sky-100">
                        <div className="text-xs font-semibold text-gray-700 mb-2">Fare Breakdown</div>
                        <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Base fare ({flightData.passengers || 1} adult)</span>
                                <span className="font-medium">${Math.round((flightData.price || 599) * 0.8)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Taxes & fees</span>
                                <span className="font-medium">${Math.round((flightData.price || 599) * 0.2)}</span>
                            </div>
                            <div className="flex justify-between pt-1 border-t border-sky-100 font-semibold">
                                <span>Total</span>
                                <span>${flightData.price || '599'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FlightSummary;