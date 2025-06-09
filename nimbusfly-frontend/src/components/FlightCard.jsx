import React, { useEffect, useState } from 'react';
import { ChevronDown, Heart, Plane, Clock, Users, Luggage, Star, Wifi, Coffee, Search, Filter, SlidersHorizontal, MapPin, Calendar, CreditCard, Shield, Utensils, Monitor, Headphones, User, AlertCircle, CheckCircle, XCircle, Info, Zap, Award } from 'lucide-react';

const FlightCard = ({ flight, origin, destination, adult, child, Origin_Airport, Dest_Airport, tripType }) => {
    const [showDetails, setShowDetails] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');


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

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <div className={tripType==='round-trip' && (`grid grid-cols-2`)}>
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl p-4 border border-sky-100">
                            <h4 className="font-bold text-gray-900 text-sm mb-4 flex items-center space-x-2">
                                <Clock className="w-4 h-4 text-sky-600" />
                                <span>{tripType==='round-trip' && (`Outbound `)}Flight Timeline</span>
                            </h4>
                            <div className="relative">
                                <div className="absolute left-4 top-8 bottom-8 w-0.5 bg-gradient-to-b from-sky-400 to-blue-500"></div>

                                <div className="space-y-6">
                                    <div className="flex items-start space-x-4">
                                        <div className="w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                                            <Plane className="w-3 h-3 transform -rotate-45" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-semibold text-gray-900">Departure</div>
                                            <div className="text-sm text-gray-600">{departureTime} • {departureDate}</div>
                                            <div className="text-sm text-sky-700 font-medium">{origin} - {Origin_Airport.airport_name}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-4">
                                        <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                                            <CheckCircle className="w-3 h-3" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-semibold text-gray-900">Arrival</div>
                                            <div className="text-sm text-gray-600">{arrivalTime} • {arrivalDate}</div>
                                            <div className="text-sm text-emerald-700 font-medium">{destination} - {Dest_Airport.airport_name}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {(tripType==='round-trip') && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl p-4 border border-sky-100">
                            <h4 className="font-bold text-gray-900 text-sm mb-4 flex items-center space-x-2">
                                <Clock className="w-4 h-4 text-sky-600" />
                                <span>Return Flight Timeline</span>
                            </h4>
                            <div className="relative">
                                <div className="absolute left-4 top-8 bottom-8 w-0.5 bg-gradient-to-b from-sky-400 to-blue-500"></div>

                                <div className="space-y-6">
                                    <div className="flex items-start space-x-4">
                                        <div className="w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                                            <Plane className="w-3 h-3 transform -rotate-45" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-semibold text-gray-900">Departure</div>
                                            <div className="text-sm text-gray-600">{rt_departureTime} • {rt_departureDate}</div>
                                            <div className="text-sm text-sky-700 font-medium">{destination} - {Dest_Airport.airport_name}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-4">
                                        <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                                            <CheckCircle className="w-3 h-3" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-semibold text-gray-900">Arrival</div>
                                            <div className="text-sm text-gray-600">{rt_arrivalTime} • {rt_arrivalDate}</div>
                                            <div className="text-sm text-emerald-700 font-medium">{origin} - {Origin_Airport.airport_name}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    )}
                    </div>
                );

            case 'Fare':
                const basePrice = flightData.base_price || 0;
                const adultCount = adult || 1;
                const childCount = child || 0;

                const adultFare = (basePrice * adultCount);
                const childFare = (basePrice * childCount * 0.75);
                const subtotal = adultFare + childFare;
                const grandTotal = subtotal;

                return (
                    <div className="space-y-6">


                        {/* Passenger Fare Details */}
                        <div className="bg-white rounded-xl p-5 border border-sky-100 shadow-sm">
                            <h4 className="font-bold text-gray-900 mb-4 flex items-center space-x-2">
                                <Users className="w-5 h-5 text-sky-600" />
                                <span>Passenger Breakdown</span>
                            </h4>

                            <div className="space-y-4">
                                {/* Adults */}
                                {adultCount > 0 && (
                                    <div className="group hover:bg-sky-25 transition-colors duration-200 rounded-lg">
                                        <div className="flex items-center justify-between p-4 bg-sky-50 rounded-lg border border-sky-100 group-hover:border-sky-200 group-hover:shadow-sm transition-all duration-200">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                                                    <User className="w-6 h-6 text-white" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-sky-900 text-base">
                                                        Adult{adultCount > 1 ? 's' : ''}
                                                        <span className="ml-2 px-2 py-0.5 bg-sky-200 text-sky-800 rounded-full text-xs font-medium">
                                                            {adultCount}
                                                        </span>
                                                    </div>
                                                    <div className="text-sm text-sky-600 font-medium mt-1">
                                                        ${basePrice.toLocaleString()} × {adultCount} passenger{adultCount > 1 ? 's' : ''}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xl font-black text-sky-800">${adultFare.toFixed(2)}</div>
                                                <div className="text-xs text-sky-600 font-medium">Base fare</div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Children */}
                                {childCount > 0 && (
                                    <div className="group hover:bg-amber-25 transition-colors duration-200 rounded-lg">
                                        <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-100 group-hover:border-amber-200 group-hover:shadow-sm transition-all duration-200">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                                                    <User className="w-6 h-6 text-white" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-amber-900 text-base flex items-center space-x-2">
                                                        <span>Child{childCount > 1 ? 'ren' : ''}</span>
                                                        <span className="px-2 py-0.5 bg-amber-200 text-amber-800 rounded-full text-xs font-medium">
                                                            {childCount}
                                                        </span>
                                                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                                                            25% OFF
                                                        </span>
                                                    </div>
                                                    <div className="text-sm text-amber-600 font-medium mt-1">
                                                        ${basePrice.toLocaleString()} × {childCount} × 0.75 (discount)
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xl font-black text-amber-800">${childFare.toFixed(2)}</div>
                                                <div className="text-xs text-amber-600 font-medium">Discounted fare</div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                            </div>
                        </div>

                        {/* Final Total */}
                        <div className="bg-gradient-to-r from-sky-600 to-blue-700 rounded-xl p-6 border border-sky-200 shadow-lg">
                            <div className="flex items-center justify-between">
                                <div className="text-white">
                                    <div className="text-lg font-bold mb-1">Total Amount</div>
                                    <div className="text-sky-100 text-sm">
                                        {adultCount + childCount} passenger{adultCount + childCount !== 1 ? 's' : ''} • All fees included
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-black text-white mb-1">
                                        ${grandTotal.toFixed(2)}
                                    </div>
                                    <div className="text-sky-100 text-xs font-medium uppercase tracking-wider">
                                        Final Price
                                    </div>
                                </div>
                            </div>
                        </div>


                    </div>
                );
            case 'baggage':
                return (
                    <div className="space-y-6">
                        {/* Baggage Allowance */}
                        <div className="bg-white rounded-xl p-4 border border-sky-100">
                            <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                                <Luggage className="w-4 h-4 text-sky-600" />
                                <span>Baggage Allowance</span>
                            </h4>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                                            <CheckCircle className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-emerald-900">Carry-on Bag</div>
                                            <div className="text-sm text-emerald-600">55 x 40 x 20 cm</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-emerald-800">Included</div>
                                        <div className="text-xs text-emerald-600">up to 7kg</div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                                            <Luggage className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-emerald-900">Checked Baggage</div>
                                            <div className="text-sm text-emerald-600">Standard size</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-emerald-800">Included</div>
                                        <div className="text-xs text-emerald-600">{flightData.baggage_limit}kg</div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-100">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                                            <AlertCircle className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-amber-900">Extra Baggage</div>
                                            <div className="text-sm text-amber-600">Additional fees apply</div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>

                    </div>
                );

            case 'policies':
                return (
                    <div className="space-y-6">
                        {/* Booking Policies */}
                        <div className="bg-white rounded-xl p-4 border border-sky-100">
                            <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                                <Shield className="w-4 h-4 text-sky-600" />
                                <span>Booking Policies</span>
                            </h4>

                            <div className="space-y-3">
                                <div className="flex items-start space-x-3 p-3 bg-emerald-50 rounded-lg">
                                    <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <div className="font-medium text-emerald-900">Free Cancellation</div>
                                        <div className="text-sm text-emerald-700">Cancel up to 24 hours before departure for full refund</div>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3 p-3 bg-emerald-50 rounded-lg">
                                    <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <div className="font-medium text-emerald-900">Date Change</div>
                                        <div className="text-sm text-emerald-700">Change dates up to 2 hours before departure</div>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3 p-3 bg-amber-50 rounded-lg">
                                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <div className="font-medium text-amber-900">Name Change</div>
                                        <div className="text-sm text-amber-700">$150 fee applies for passenger name changes</div>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <div className="font-medium text-red-900">No-Show Policy</div>
                                        <div className="text-sm text-red-700">No refund for missed flights without prior notice</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="group relative bg-white border border-sky-100 rounded-3xl mb-3 overflow-hidden hover:shadow-xl hover:shadow-sky-200/50 hover:border-sky-200 transition-all duration-500 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-r from-sky-50/0 via-blue-50/0 to-cyan-50/0  transition-all duration-700 pointer-events-none"></div>
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
                                    {destination}
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


                {(tripType === 'round-trip') && (<div className="flex items-center justify-center py-4">
                    <div className="flex flex-col items-center">
                        <div className="w-px h-10 bg-blue-300"></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full my-1"></div>
                        <div className="w-px h-10 bg-blue-300"></div>
                    </div>
                </div>)}

                {/* Return Marker */}
                {(tripType === 'round-trip') && (
                    <div className="flex-1 p-4 lg:p-6">
                        <div className="flex items-center space-x-3 lg:space-x-4 mb-4 lg:mb-5">
                            <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center text-white font-bold text-xs lg:text-sm shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                                LG
                            </div>
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
                                        {destination}
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
                                        {origin}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">Arrival</div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 lg:gap-3 text-xs lg:text-sm">
                            <div className="flex items-center space-x-1 lg:space-x-2 text-gray-700 bg-gray-50 px-2 py-1 rounded-full">
                                <Luggage className="w-3 h-3 text-sky-600" />
                                <span className="font-medium">{flightData.return_baggage_limit}kg</span>
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



                )}

                <div className="w-52 lg:w-64 bg-gradient-to-br from-sky-50/80 to-blue-50/80 border-l border-sky-100 flex flex-col justify-between p-4 lg:p-6 group-hover:from-sky-100/90 group-hover:to-blue-100/90 transition-all duration-500">
                    <div className="text-center">
                        <div className="mt-4 lg:mt-6">
                            <div className="text-xs text-sky-600 uppercase tracking-wider font-bold mb-1 lg:mb-2">
                                Total Price
                            </div>
                            <div className="text-xl lg:text-3xl font-black text-gray-900 mb-1">
                                ${flightData.total_ticket_price}
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

                        <button
                            onClick={() => setShowDetails(!showDetails)}
                            className="w-full text-sky-700 hover:text-sky-900 py-2 text-xs lg:text-sm font-bold flex items-center justify-center space-x-2 hover:bg-white/70 rounded-lg transition-all duration-200 border border-sky-200 hover:border-sky-300"
                        >
                            <span>View Details</span>
                            <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${showDetails ? 'rotate-180' : ''}`} />
                        </button>
                    </div>
                </div>
            </div>

            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${showDetails ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="border-t border-sky-100 bg-gradient-to-r from-sky-50/30 to-blue-50/30">
                    <div className="px-4 lg:px-6 pt-4 lg:pt-6">
                        <div className="flex space-x-1 bg-white/60 p-1 rounded-xl border border-sky-100">
                            {tabs.map((tab) => {
                                const IconComponent = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex-1 flex items-center justify-center space-x-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === tab.id
                                            ? 'bg-white text-sky-700 shadow-md border border-sky-200'
                                            : 'text-gray-600 hover:text-sky-600 hover:bg-white/50'
                                            }`}
                                    >
                                        <IconComponent className="w-4 h-4" />
                                        <span className="hidden sm:inline">{tab.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    <div className="p-4 lg:p-6">
                        {renderTabContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FlightCard;