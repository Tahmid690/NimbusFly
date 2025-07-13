import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import BookingStages from './BookingStages';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';
import axios from 'axios';

const TicketConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const boardingPassRef = useRef();
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Get booking data from navigation state
  const { bookingId, passengers, flight, paymentData, tripType, regenerateTicket } = location.state || {};
  
  // Fetch booking data when regenerating ticket
  useEffect(() => {
    console.log('TicketConfirmation useEffect triggered');
    console.log('regenerateTicket:', regenerateTicket);
    console.log('bookingId:', bookingId);
    
    if (regenerateTicket && bookingId) {
      const fetchBookingData = async () => {
        try {
          console.log('Fetching booking data for ID:', bookingId);
          setLoading(true);
          const response = await axios.get(`http://localhost:3000/bookings/${bookingId}/details`);
          console.log('Booking API response:', response.data);
          
          if (response.data.success) {
            setBookingData(response.data.data);
            console.log('Set booking data:', response.data.data);
          } else {
            console.error('API returned unsuccessful response:', response.data);
            alert('Failed to load booking data: ' + (response.data.message || 'Unknown error'));
          }
        } catch (error) {
          console.error('Error fetching booking data:', error);
          alert('Failed to load booking data. Returning to dashboard.');
          navigate('/dashboard');
        } finally {
          setLoading(false);
        }
      };
      fetchBookingData();
    }
  }, [regenerateTicket, bookingId, navigate]);

  // Format date consistently
  const formatDate = (dateString) => {
    if (!dateString) return new Date().toLocaleDateString();
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Helper functions to get data from either source
  const getPassengers = () => {
    if (regenerateTicket && bookingData?.tickets) {
      // Convert ticket data to passenger format - group by passenger but collect all seat info
      const passengerMap = new Map();
      bookingData.tickets.forEach(ticket => {
        const passengerKey = `${ticket.passenger_first_name}_${ticket.passenger_last_name}`;
        if (!passengerMap.has(passengerKey)) {
          passengerMap.set(passengerKey, {
            first_name: ticket.passenger_first_name,
            last_name: ticket.passenger_last_name,
            passport_number: ticket.passport_number,
            nationality: ticket.nationality,
            date_of_birth: ticket.date_of_birth,
            seats: [] // Array to store all seat assignments for this passenger
          });
        }
        // Add seat information for this flight
        const passenger = passengerMap.get(passengerKey);
        passenger.seats.push({
          seat_number: ticket.seat_number,
          seat_class: ticket.seat_class,
          flight_number: ticket.flight_number,
          departure_time: ticket.departure_time
        });
      });
      const result = Array.from(passengerMap.values());
      console.log('getPassengers (regenerated):', result);
      return result;
    }
    console.log('getPassengers (original):', passengers || []);
    return passengers || [];
  };

  const getFlights = () => {
    if (regenerateTicket && bookingData?.tickets) {
      // Group tickets by flight to create flight objects
      const flightMap = new Map();
      
      bookingData.tickets.forEach(ticket => {
        const flightKey = ticket.flight_number;
        if (!flightMap.has(flightKey)) {
          flightMap.set(flightKey, {
            ...ticket,
            flight_number: ticket.flight_number,
            airline_name: ticket.airline_name,
            departure_time: ticket.departure_time,
            arrival_time: ticket.arrival_time,
            origin: ticket.origin_airport,
            destination: ticket.destination_airport,
            origin_code: ticket.origin_code,
            destination_code: ticket.destination_code,
            aircraft_model: ticket.aircraft_model
          });
        }
      });
      
      const result = Array.from(flightMap.values());
      console.log('getFlights (regenerated):', result);
      return result;
    }
    console.log('getFlights (original):', flight ? [flight] : []);
    return flight ? [flight] : [];
  };

  const getTripType = () => {
    if (regenerateTicket && bookingData?.booking) {
      return bookingData.booking.trip_type;
    }
    return tripType || 'one-way';
  };

  // Generate booking reference and other details
  const getBookingDetails = () => {
    return {
      bookingReference: bookingId || (regenerateTicket && bookingData?.booking?.booking_id) || `NF${Date.now().toString().slice(-6)}`,
      confirmationNumber: `NF${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      bookingDate: regenerateTicket && bookingData?.booking?.booking_date 
        ? formatDate(bookingData.booking.booking_date) 
        : new Date().toLocaleDateString(),
      totalAmount: paymentData?.amount || 
                   (regenerateTicket && bookingData?.booking?.total_amount ? parseFloat(bookingData.booking.total_amount) : 0) || 
                   calculateTotal(),
      paymentMethod: paymentData?.method || 'Card',
      status: regenerateTicket && bookingData?.booking?.payment_status 
        ? bookingData.booking.payment_status 
        : 'Confirmed'
    };
  };

  const bookingDetails = getBookingDetails();

  // Airline logo handler - uses logo_url from database
  const getAirlineLogo = () => {
    const currentFlights = getFlights();
    const currentFlight = currentFlights[0];
    
    // Use logo_url from the database if available
    if (currentFlight?.logo_url) {
      return currentFlight.logo_url;
    }
    
    // Default to NimbusFly logo if no logo_url is provided
    return '/nimbusfly_logo.png';
  };

  // Get airline brand colors for theming
  const getAirlineColors = () => {
    // Default NimbusFly colors
    return { primary: '#1e40af', secondary: '#3b82f6', accent: '#60a5fa' };
  };

  function calculateTotal() {
    const currentFlights = getFlights();
    const currentFlight = currentFlights[0];
    
    if (!currentFlight || !currentFlight.adult || !currentFlight.base_price) return 0;
    const adultCount = currentFlight.adult || 0;
    const childCount = currentFlight.child || 0;
    const basePrice = currentFlight.base_price || 0;
    return (basePrice * adultCount) + (basePrice * 0.75 * childCount);
  }

  // Generate realistic gate number based on flight number
  const generateGate = (flightNumber) => {
    if (!flightNumber) return 'A1';
    const gates = ['A', 'B', 'C', 'D', 'E'];
    const gateIndex = flightNumber.slice(-1).charCodeAt(0) % gates.length;
    const gateNumber = (flightNumber.slice(-1).charCodeAt(0) % 20) + 1;
    return `${gates[gateIndex]}${gateNumber}`;
  };

  // Generate terminal based on airline or flight
  const generateTerminal = (airline, flightNumber) => {
    if (!airline && !flightNumber) return 'T1';
    const airlineName = airline?.toLowerCase() || flightNumber?.substring(0, 2)?.toLowerCase() || '';
    if (airlineName.includes('us') || airlineName.includes('american')) return 'T1';
    if (airlineName.includes('british') || airlineName.includes('biman')) return 'T2';
    if (airlineName.includes('saudi') || airlineName.includes('novoair')) return 'T3';
    return 'T1';
  };

  // Generate boarding time (30 minutes before departure)
  const generateBoardingTime = (departureTime) => {
    if (!departureTime) return '09:30';
    try {
      const depTime = new Date(`2024-01-01T${departureTime}`);
      const boardingTime = new Date(depTime.getTime() - 30 * 60 * 1000);
      return boardingTime.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false 
      });
    } catch {
      return '09:30';
    }
  };

  // Format time consistently
  const formatTime = (timeString) => {
    if (!timeString) return null;
    try {
      // Handle both ISO strings and time-only strings
      let dateObj;
      if (timeString.includes('T') || timeString.includes('-')) {
        dateObj = new Date(timeString);
      } else {
        dateObj = new Date(`2024-01-01T${timeString}`);
      }
      return dateObj.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false 
      });
    } catch {
      return timeString;
    }
  };

  // Format flight date from departure time
  const formatFlightDate = (timeString) => {
    if (!timeString) return new Date().toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
    try {
      const dateObj = new Date(timeString);
      return dateObj.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return new Date().toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    }
  };

  // Generate seat assignment for specific passenger
  const generateSeatAssignment = (passengerIndex, seatClass) => {
    const isBusinessClass = seatClass === 'Business' || seatClass === 'business';
    
    if (isBusinessClass) {
      // Business class: rows 1-5, seats A-D
      const row = Math.floor(passengerIndex / 4) + 1;
      const seatLetter = String.fromCharCode(65 + (passengerIndex % 4)); // A-D
      return `${row}${seatLetter}`;
    } else {
      // Economy class: rows 6+, seats A-F
      const row = Math.floor(passengerIndex / 6) + 6;
      const seatLetter = String.fromCharCode(65 + (passengerIndex % 6)); // A-F
      return `${row}${seatLetter}`;
    }
  };

  // Generate QR code for boarding pass (for first passenger, first flight - shown in UI)
  useEffect(() => {
    const generateQRCode = async () => {
      try {
        const currentFlights = getFlights();
        const currentPassengers = getPassengers();
        const qrData = JSON.stringify({
          booking: bookingDetails.bookingReference,
          confirmation: bookingDetails.confirmationNumber,
          flight: currentFlights[0]?.flight_number || 'NF001',
          passenger: (currentPassengers[0]?.first_name || 'John') + ' ' + (currentPassengers[0]?.last_name || 'Doe'),
          seat: generateSeatAssignment(0, currentPassengers[0]?.seat_class || 'Economy')
        });
        const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
          width: 80,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        setQrCodeUrl(qrCodeDataUrl);
      } catch (error) {
        console.error('Error generating QR code:', error);
        setQrCodeUrl('');
      }
    };

    if (bookingDetails.bookingReference) {
      generateQRCode();
    }
  }, [bookingDetails.bookingReference, bookingData, regenerateTicket]);

  // Helper function to generate QR code for specific passenger and flight
  const generateQRCodeForPassenger = async (passenger, currentFlight, seatAssignment) => {
    try {
      const qrData = JSON.stringify({
        booking: bookingDetails.bookingReference,
        confirmation: bookingDetails.confirmationNumber,
        flight: currentFlight.flight_number || 'NF001',
        passenger: `${passenger.first_name} ${passenger.last_name}`,
        seat: seatAssignment,
        isReturn: currentFlight.isReturn || false
      });
      const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
        width: 80,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      return qrCodeDataUrl;
    } catch (error) {
      console.error('Error generating QR code:', error);
      return '';
    }
  };

  // Alternative approach - Create boarding pass in a visible container
// Replace your downloadBoardingPass function with this:
// Replace the downloadBoardingPass function with this improved version
const downloadBoardingPass = async () => {
  setIsDownloading(true);
  try {
    console.log('Starting boarding pass generation...');
    console.log('Regenerate ticket:', regenerateTicket);
    console.log('Booking data:', bookingData);
    console.log('Passengers:', getPassengers());
    console.log('Flights:', getFlights());
    
    const pdf = new jsPDF('landscape', 'mm', 'a4');
    
    // Get flights data from either source
    const currentFlights = getFlights();
    const currentPassengers = getPassengers();
    const currentTripType = getTripType();
    
    if (currentFlights.length === 0 || currentPassengers.length === 0) {
      alert('No flight or passenger data available for ticket generation.');
      setIsDownloading(false);
      return;
    }
    
    // Generate passes for all passengers and all flights (outbound + return if round trip)
    const flights = [];
    
    if (regenerateTicket && bookingData?.tickets && currentFlights.length > 0) {
      // For regenerated tickets, use actual flight data from booking
      currentFlights.forEach((flight, index) => {
        flights.push({
          ...flight,
          isReturn: index > 0 // First flight is outbound, subsequent are return
        });
      });
    } else {
      // Original logic for new bookings
      if (currentFlights.length > 0) {
        const mainFlight = currentFlights[0];
        
        // Add outbound flight
        flights.push({
          ...mainFlight,
          isReturn: false,
          departure_time: mainFlight.departure_time,
          arrival_time: mainFlight.arrival_time,
          flight_number: mainFlight.flight_number,
          origin: mainFlight.origin,
          destination: mainFlight.destination
        });
        
        // Only add return flight if this is explicitly a round-trip booking
        const hasReturnFlight = currentTripType === 'round-trip' && 
            mainFlight.return_departure_time && 
            mainFlight.return_arrival_time && 
            mainFlight.return_flight_number &&
            mainFlight.return_departure_time !== mainFlight.departure_time &&
            mainFlight.return_arrival_time !== mainFlight.arrival_time &&
            mainFlight.return_flight_number !== mainFlight.flight_number;
        
        if (hasReturnFlight) {
          flights.push({
            ...mainFlight,
            isReturn: true,
            departure_time: mainFlight.return_departure_time,
            arrival_time: mainFlight.return_arrival_time,
            flight_number: mainFlight.return_flight_number,
            origin: mainFlight.destination, // Return trip origin is the original destination
            destination: mainFlight.origin   // Return trip destination is the original origin
          });
        }
      }
    }

    // Generate a boarding pass for each passenger for each flight
    for (let flightIndex = 0; flightIndex < flights.length; flightIndex++) {
      const currentFlight = flights[flightIndex];
      
      for (let passengerIndex = 0; passengerIndex < currentPassengers.length; passengerIndex++) {
        const passenger = currentPassengers[passengerIndex];
        const isNewPage = !(flightIndex === 0 && passengerIndex === 0);
        
        if (isNewPage) {
          pdf.addPage();
        }
        
        // Create a temporary container for this specific boarding pass
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'fixed';
        tempContainer.style.top = '-9999px';
        tempContainer.style.left = '0';
        tempContainer.style.width = '900px';
        tempContainer.style.height = '600px';
        tempContainer.style.backgroundColor = 'white';
        tempContainer.style.fontFamily = 'Arial, sans-serif';
        tempContainer.style.zIndex = '9999';
        
        // Create the boarding pass HTML
        const airlineLogo = getAirlineLogo();
        
        // Generate seat assignment
        const seatClass = passenger.seat_class || currentFlight.seatClass || currentFlight.seat_class || 'Economy';
        const seatAssignment = passenger.seat_number || generateSeatAssignment(passengerIndex, seatClass);
        
        // Generate QR code for this specific passenger and flight
        const passengerQRCode = await generateQRCodeForPassenger(passenger, currentFlight, seatAssignment);
        
        // Generate proper barcode pattern
        const generateBarcode = () => {
          const patterns = [3, 1, 2, 1, 3, 2, 1, 2, 3, 1, 2, 3, 1, 2, 1, 3, 2, 1, 3, 2];
          return patterns.map((height, i) => 
            `<div style="width: ${i % 2 === 0 ? '3px' : '1px'}; height: ${8 + height * 2}px; background: #000; display: inline-block;"></div>`
          ).join('');
        };
    
        tempContainer.innerHTML = `
      <div style="width: 100%; height: 100%; background: white; display: flex; border-radius: 12px; overflow: hidden; position: relative; box-shadow: 0 8px 32px rgba(0,0,0,0.12); border: 1px solid #e5e7eb;">
        
        <!-- Left section - Main boarding pass -->
        <div style="flex: 2.2; padding: 32px; background: white; border-right: 2px dashed #cbd5e1; position: relative;">
          
          <!-- Header -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #e5e7eb;">
            <div style="display: flex; align-items: center;">
              <div style="width: 56px; height: 56px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: center; margin-right: 16px;">
                <img src="${airlineLogo}" alt="Airline Logo" style="width: 44px; height: 44px; object-fit: contain;" onerror="this.style.display='none'" />
              </div>
              <div>
                <h1 style="font-size: 24px; font-weight: 700; margin: 0 0 4px 0; line-height: 1.2; color: #1e293b; letter-spacing: -0.5px;">
                  ${flight?.airline_name || 'NimbusFly'}
                </h1>
                <p style="font-size: 11px; color: #64748b; margin: 0; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                  Boarding Pass
                </p>
              </div>
            </div>
            <div style="text-align: right; color: white; padding: 12px 16px; border-radius: 8px; background: #1e293b; min-width: 120px;">
              <p style="font-size: 10px; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.8;">${currentFlight.isReturn ? 'Return Flight' : 'Outbound Flight'}</p>
              <p style="font-size: 16px; font-weight: 700; margin: 0; letter-spacing: 1px; font-family: 'Courier New', monospace;">${bookingDetails.bookingReference}</p>
            </div>
          </div>

          <!-- Passenger and flight details -->
          <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 24px; margin-bottom: 28px;">
            <div>
              <p style="font-size: 10px; color: #64748b; text-transform: uppercase; margin: 0 0 6px 0; letter-spacing: 0.5px; font-weight: 600;">
                Passenger Name
              </p>
              <p style="font-size: 16px; font-weight: 700; color: #1e293b; margin: 0; line-height: 1.2; text-transform: uppercase; letter-spacing: 0.5px;">
                ${passenger.first_name} ${passenger.last_name}
              </p>
            </div>
            <div>
              <p style="font-size: 10px; color: #64748b; text-transform: uppercase; margin: 0 0 6px 0; letter-spacing: 0.5px; font-weight: 600;">
                Flight
              </p>
              <p style="font-size: 16px; font-weight: 700; color: #1e293b; margin: 0; font-family: 'Courier New', monospace;">
                ${currentFlight.flight_number || 'NF001'}
              </p>
            </div>
            <div>
              <p style="font-size: 10px; color: #64748b; text-transform: uppercase; margin: 0 0 6px 0; letter-spacing: 0.5px; font-weight: 600;">
                Date
              </p>
              <p style="font-size: 16px; font-weight: 700; color: #1e293b; margin: 0;">
                ${formatFlightDate(currentFlight.departure_time)}
              </p>
            </div>
          </div>

          <!-- Route information -->
          <div style="background: #f8fafc; border-radius: 12px; padding: 28px; margin-bottom: 28px; border: 1px solid #e2e8f0; position: relative;">
            
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div style="text-align: center; flex: 1;">
                <p style="font-size: 11px; color: #64748b; text-transform: uppercase; margin: 0 0 8px 0; letter-spacing: 0.5px; font-weight: 600;">
                  From
                </p>
                <p style="font-size: 36px; font-weight: 800; margin: 0 0 6px 0; line-height: 1; color: #1e293b; letter-spacing: -1px;">
                  ${currentFlight.origin || 'DAC'}
                </p>
                <p style="font-size: 14px; color: #475569; margin: 0; font-weight: 600; font-family: 'Courier New', monospace;">
                  ${formatTime(currentFlight.departure_time) || '10:30'}
                </p>
              </div>
              
              <div style="display: flex; flex-direction: column; align-items: center; flex: 1; margin: 0 32px;">
                <div style="display: flex; align-items: center; margin-bottom: 8px;">
                  <div style="width: 50px; height: 2px; background: #cbd5e1;"></div>
                  <div style="width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 8px; color: white; font-size: 14px; font-weight: bold; background: #1e293b; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    ✈
                  </div>
                  <div style="width: 50px; height: 2px; background: #cbd5e1;"></div>
                </div>
                <p style="font-size: 10px; color: #64748b; margin: 0; text-align: center; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                  Direct Flight
                </p>
              </div>
              
              <div style="text-align: center; flex: 1;">
                <p style="font-size: 11px; color: #64748b; text-transform: uppercase; margin: 0 0 8px 0; letter-spacing: 0.5px; font-weight: 600;">
                  To
                </p>
                <p style="font-size: 36px; font-weight: 800; margin: 0 0 6px 0; line-height: 1; color: #1e293b; letter-spacing: -1px;">
                  ${currentFlight.destination || 'CTG'}
                </p>
                <p style="font-size: 14px; color: #475569; margin: 0; font-weight: 600; font-family: 'Courier New', monospace;">
                  ${formatTime(currentFlight.arrival_time) || '14:15'}
                </p>
              </div>
            </div>
          </div>

          <!-- Flight details grid -->
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 20px;">
            <div style="background: white; padding: 16px; border-radius: 8px; text-align: center; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <p style="font-size: 10px; color: #64748b; text-transform: uppercase; margin: 0 0 6px 0; font-weight: 600; letter-spacing: 0.5px;">
                Seat
              </p>
              <p style="font-size: 20px; font-weight: 800; color: #1e293b; margin: 0; font-family: 'Courier New', monospace;">${seatAssignment}</p>
            </div>
            <div style="background: white; padding: 16px; border-radius: 8px; text-align: center; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <p style="font-size: 10px; color: #64748b; text-transform: uppercase; margin: 0 0 6px 0; font-weight: 600; letter-spacing: 0.5px;">
                Gate
              </p>
              <p style="font-size: 20px; font-weight: 800; color: #1e293b; margin: 0; font-family: 'Courier New', monospace;">${generateGate(currentFlight.flight_number)}</p>
            </div>
            <div style="background: white; padding: 16px; border-radius: 8px; text-align: center; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <p style="font-size: 10px; color: #64748b; text-transform: uppercase; margin: 0 0 6px 0; font-weight: 600; letter-spacing: 0.5px;">
                Class
              </p>
              <p style="font-size: 12px; font-weight: 700; color: #1e293b; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">
                ${currentFlight.seatClass || 'Economy'}
              </p>
            </div>
            <div style="background: white; padding: 16px; border-radius: 8px; text-align: center; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <p style="font-size: 10px; color: #64748b; text-transform: uppercase; margin: 0 0 6px 0; font-weight: 600; letter-spacing: 0.5px;">
                Terminal
              </p>
              <p style="font-size: 20px; font-weight: 800; color: #1e293b; margin: 0; font-family: 'Courier New', monospace;">${generateTerminal(currentFlight.airline_name, currentFlight.flight_number)}</p>
            </div>
          </div>

          <!-- Bottom info -->
          <div style="border-top: 1px solid #e5e7eb; padding-top: 16px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <p style="font-size: 10px; color: #64748b; text-transform: uppercase; margin: 0 0 4px 0; letter-spacing: 0.5px; font-weight: 600;">
                Boarding Time
              </p>
              <p style="font-size: 14px; font-weight: 700; color: #1e293b; margin: 0; font-family: 'Courier New', monospace;">
                ${generateBoardingTime(formatTime(currentFlight.departure_time))}
              </p>
            </div>
            <div>
              <p style="font-size: 10px; color: #64748b; text-transform: uppercase; margin: 0 0 4px 0; letter-spacing: 0.5px; font-weight: 600;">
                Sequence Number
              </p>
              <p style="font-size: 14px; font-weight: 700; color: #1e293b; margin: 0; font-family: 'Courier New', monospace;">
                ${Math.floor(Math.random() * 900) + 100}
              </p>
            </div>
          </div>

        </div>
        
        <!-- Right section - Stub -->
        <div style="flex: 0.8; padding: 32px 24px; background: #f8fafc; display: flex; flex-direction: column; justify-content: space-between; align-items: center; text-align: center; position: relative; border-left: 2px dashed #cbd5e1;">
          
          <!-- Header -->
          <div style="width: 100%;">
            <div style="width: 48px; height: 48px; background: white; border-radius: 8px; border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px auto; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <img src="${airlineLogo}" alt="Airline Logo" style="width: 36px; height: 36px; object-fit: contain;" onerror="this.style.display='none'" />
            </div>
            <p style="font-size: 10px; color: #64748b; margin: 0; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">
              ${currentFlight.airline_name || 'NimbusFly'}
            </p>
          </div>

          <!-- QR Code -->
          <div style="margin: 20px 0;">
            <div style="padding: 12px; background: white; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              ${passengerQRCode ? 
                `<img src="${passengerQRCode}" alt="QR Code" style="width: 80px; height: 80px; display: block;" />` :
                `<div style="width: 80px; height: 80px; background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 4px; display: flex; align-items: center; justify-content: center; position: relative;">
                  <span style="font-size: 10px; color: #64748b;">QR</span>
                </div>`
              }
            </div>
          </div>

          <!-- Barcode -->
          <div style="margin: 20px 0;">
            <div style="display: flex; justify-content: center; align-items: end; gap: 1px; margin-bottom: 8px; padding: 8px; background: white; border-radius: 4px; border: 1px solid #e2e8f0; height: 32px;">
              ${generateBarcode()}
            </div>
            <p style="font-size: 10px; font-family: 'Courier New', monospace; color: #64748b; margin: 0; letter-spacing: 0.5px; font-weight: 600;">
              ${bookingDetails.confirmationNumber}
            </p>
          </div>

          <!-- Flight info -->
          <div style="width: 100%; border-top: 1px solid #e2e8f0; padding-top: 16px;">
            <p style="font-size: 14px; font-weight: 700; color: #1e293b; margin: 0 0 4px 0; font-family: 'Courier New', monospace;">
              ${currentFlight.origin || 'DAC'} → ${currentFlight.destination || 'CTG'}
            </p>
            <p style="font-size: 12px; color: #64748b; margin: 0; font-weight: 600; font-family: 'Courier New', monospace;">
              ${currentFlight.flight_number || 'NF001'}
            </p>
            <p style="font-size: 10px; color: #64748b; margin: 4px 0 0 0; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
              Keep This Coupon
            </p>
          </div>
        </div>
      </div>
        `;
        
        // Add to DOM
        document.body.appendChild(tempContainer);
        
        // Wait for any images to load
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Generate canvas
        const canvas = await html2canvas(tempContainer, {
          scale: 2,
          useCORS: true,
          allowTaint: false,
          backgroundColor: '#ffffff',
          width: 900,
          height: 600,
          scrollX: 0,
          scrollY: 0
        });
        
        document.body.removeChild(tempContainer);
        
        const imgData = canvas.toDataURL('image/png', 1.0);
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        
        const aspectRatio = canvas.width / canvas.height;
        let imgWidth = Math.min(280, pageWidth - 20); 
        let imgHeight = imgWidth / aspectRatio;
        
        if (imgHeight > pageHeight - 20) {
          imgHeight = pageHeight - 20;
          imgWidth = imgHeight * aspectRatio;
        }
        
        const x = (pageWidth - imgWidth) / 2;
        const y = (pageHeight - imgHeight) / 2;
        
        pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
      }
    }
    
    // Save the PDF with all boarding passes
    const passengerCount = currentPassengers.length;
    const flightCount = flights.length;
    const fileName = `BoardingPasses-${bookingDetails.bookingReference}-${passengerCount}PAX-${flightCount}Flights.pdf`;
    pdf.save(fileName);
    
  } catch (error) {
    console.error('Error generating boarding pass:', error);
    alert('Failed to generate boarding pass. Please try again.');
  } finally {
    setIsDownloading(false);
  }
};
  // Redirect if no booking data (check both original and regenerated data)
  const hasValidData = () => {
    if (regenerateTicket) {
      const hasData = bookingData && bookingData.tickets && bookingData.tickets.length > 0;
      console.log('hasValidData (regenerate):', hasData, 'bookingData:', bookingData);
      return hasData;
    }
    const hasData = passengers && flight;
    console.log('hasValidData (original):', hasData, 'passengers:', passengers, 'flight:', flight);
    return hasData;
  };

  if (!loading && !hasValidData()) {
    console.log('Redirecting due to no valid data. Loading:', loading, 'hasValidData:', hasValidData());
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700">No booking data found</h2>
          <p className="text-gray-500 mt-2">
            {regenerateTicket ? 
              `Regenerating ticket for booking ${bookingId}. Booking data: ${bookingData ? 'loaded' : 'not loaded'}` :
              'No original booking data provided'
            }
          </p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Show loading state when regenerating ticket
  if (loading) {
    return (
      <div className="bg-blue-100 min-h-screen">
        <Navbar flg={true} />
        <div className="pt-20 pb-12 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 text-lg">Loading your ticket...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-100 min-h-screen">
      <Navbar flg={true} />
      <div className="pt-20 pb-12">
        <BookingStages stage={3} />
        
        {/* Success Header */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 mt-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
            <p className="text-gray-600">Your flight has been successfully booked</p>
            <p className="text-lg font-semibold text-blue-600 mt-2">
              Confirmation Number: {bookingDetails.confirmationNumber}
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Booking Summary */}
              <div className="bg-white rounded-3xl shadow-lg p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Booking Summary</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Booking Reference</p>
                    <p className="font-semibold">{bookingDetails.bookingReference}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Booking Date</p>
                    <p className="font-semibold">{bookingDetails.bookingDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="font-semibold text-green-600">{bookingDetails.status}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Paid</p>
                    <p className="font-semibold">${bookingDetails.totalAmount.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Flight Details */}
              <div className="bg-white rounded-3xl shadow-lg p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Flight Details</h2>
                {(() => {
                  const currentFlights = getFlights();
                  const currentFlight = currentFlights[0];
                  
                  if (!currentFlight) {
                    return <div className="text-center text-gray-500">No flight information available</div>;
                  }
                  
                  return (
                    <>
                      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                        <div className="text-center">
                          <p className="text-sm text-gray-500">From</p>
                          <p className="text-xl font-bold text-gray-900">{currentFlight.origin || currentFlight.origin_airport}</p>
                          <p className="text-sm text-gray-600">{formatTime(currentFlight.departure_time) || '10:30'}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-px bg-gray-300"></div>
                          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                          <div className="w-8 h-px bg-gray-300"></div>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-500">To</p>
                          <p className="text-xl font-bold text-gray-900">{currentFlight.destination || currentFlight.destination_airport}</p>
                          <p className="text-sm text-gray-600">{formatTime(currentFlight.arrival_time) || '14:15'}</p>
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Flight Number</p>
                          <p className="font-semibold">{currentFlight.flight_number || 'NF001'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Aircraft</p>
                          <p className="font-semibold">{currentFlight.aircraft_name || currentFlight.aircraft_model || currentFlight.aircraft || 'Boeing 737'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Class</p>
                          <p className="font-semibold">{currentFlight.seatClass || 'Economy'}</p>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Passenger Details */}
              <div className="bg-white rounded-3xl shadow-lg p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Passenger Details</h2>
                <div className="space-y-4">
                  {getPassengers().map((passenger, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-semibold">
                              {passenger.title} {passenger.first_name} {passenger.last_name}
                            </p>
                            <p className="text-sm text-gray-500">Adult</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Passport</p>
                          <p className="font-semibold">{passenger.passport_number || 'N/A'}</p>
                        </div>
                      </div>
                      
                      {/* Seat Information */}
                      <div className="mt-3 ml-14">
                        {regenerateTicket && passenger.seats ? (
                          // Show all seat assignments for regenerated tickets
                          <div className="space-y-2">
                            {passenger.seats.map((seat, seatIndex) => (
                              <div key={seatIndex} className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-200">
                                <div className="flex items-center space-x-3">
                                  <span className="text-sm font-medium text-gray-700">
                                    Flight {seat.flight_number}:
                                  </span>
                                  <span className="text-sm font-semibold text-blue-600">
                                    Seat {seat.seat_number}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    ({seat.seat_class})
                                  </span>
                                </div>
                                <span className="text-xs text-gray-400">
                                  {formatTime(seat.departure_time)}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          // Show single seat assignment for new bookings
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">Seat:</span>
                            <span className="text-sm font-semibold text-blue-600">
                              {passenger.seat_number || generateSeatAssignment(index, passenger.seat_class || getFlights()[0]?.seatClass || 'Economy')}
                            </span>
                            <span className="text-xs text-gray-500">
                              ({passenger.seat_class || getFlights()[0]?.seatClass || 'Economy'})
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Important Information */}
              <div className="bg-white rounded-3xl shadow-lg p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Important Information</h2>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-yellow-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div>
                      <p className="font-semibold text-gray-900">Check-in Requirements</p>
                      <p className="text-sm text-gray-600">Please arrive at the airport at least 2 hours before domestic flights and 3 hours before international flights.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div>
                      <p className="font-semibold text-gray-900">Documents Required</p>
                      <p className="text-sm text-gray-600">Bring a valid government-issued photo ID and your passport for international flights.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <p className="font-semibold text-gray-900">Online Check-in</p>
                      <p className="text-sm text-gray-600">Check-in online 24 hours before departure to save time at the airport.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="space-y-6">
                {/* Download Actions */}
                <div className="bg-white rounded-3xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Your Boarding Pass</h3>
                  <div className="space-y-4">
                    <button
                      onClick={downloadBoardingPass}
                      disabled={isDownloading}
                      className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {isDownloading ? (
                        <>
                          <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Generating PDF...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span>Download Boarding Pass</span>
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => window.print()}
                      className="w-full flex items-center justify-center space-x-2 bg-gray-600 text-white py-3 px-4 rounded-xl hover:bg-gray-700 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                      <span>Print Confirmation</span>
                    </button>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-3xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button className="w-full text-left p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
                      <div className="flex items-center space-x-3">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                        <div>
                          <p className="font-semibold text-gray-900">Manage Booking</p>
                          <p className="text-xs text-gray-500">Change seats, add services</p>
                        </div>
                      </div>
                    </button>
                    
                    <button className="w-full text-left p-3 bg-green-50 rounded-xl hover:bg-green-100 transition-colors">
                      <div className="flex items-center space-x-3">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <p className="font-semibold text-gray-900">Online Check-in</p>
                          <p className="text-xs text-gray-500">Available 24h before flight</p>
                        </div>
                      </div>
                    </button>
                    
                    <button 
                      onClick={() => navigate('/dashboard')}
                      className="w-full text-left p-3 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5v6m4-6v6m4-6v6" />
                        </svg>
                        <div>
                          <p className="font-semibold text-gray-900">Go to Dashboard</p>
                          <p className="text-xs text-gray-500">View all your bookings</p>
                        </div>
                      </div>
                    </button>
                    
                    <button 
                      onClick={() => navigate('/')}
                      className="w-full text-left p-3 bg-green-50 rounded-xl hover:bg-green-100 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        <div>
                          <p className="font-semibold text-gray-900">Book Another Flight</p>
                          <p className="text-xs text-gray-500">Search new destinations</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Contact Support */}
                <div className="bg-white rounded-3xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Need Help?</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 text-sm">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span>+880-1234-567890</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span>support@nimbusfly.com</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hidden Boarding Pass for PDF Generation */}
        <div 
          ref={boardingPassRef} 
          data-boarding-pass
          className="fixed -left-[9999px] w-[900px] h-[400px] bg-white overflow-hidden z-[-1] invisible rounded-2xl border-2 border-gray-200"
          style={{
            fontFamily: 'Arial, sans-serif',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)'
          }}
        >
          <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-50 flex rounded-2xl overflow-hidden relative">
            
            {/* Top accent bar */}
            <div 
              className="absolute top-0 left-0 right-0 h-1"
              style={{
                background: `linear-gradient(90deg, ${getAirlineColors().primary}, ${getAirlineColors().secondary}, ${getAirlineColors().accent})`
              }}
            />
            
            {/* Left section - Main boarding pass */}
            <div className="flex-[2.2] p-6 bg-white border-r-2 border-dashed border-gray-300 relative">
              
              {/* Header */}
              <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center mr-3">
                    <img 
                      src={getAirlineLogo()} 
                      alt="Airline Logo"
                      className="w-10 h-10 object-contain"
                    />
                  </div>
                  <div>
                    <h1 
                      className="text-xl font-bold m-0 leading-tight"
                      style={{ color: getAirlineColors().primary }}
                    >
                      {flight?.airline_name || 'NimbusFly'}
                    </h1>
                    <p className="text-xs text-gray-500 m-0 uppercase tracking-wide font-semibold">
                      Boarding Pass
                    </p>
                  </div>
                </div>
                <div 
                  className="text-right text-white py-2 px-3 rounded-lg"
                  style={{
                    background: `linear-gradient(135deg, ${getAirlineColors().primary}, ${getAirlineColors().secondary})`
                  }}
                >
                  <p className="text-xs m-0 uppercase tracking-wide opacity-90">Booking Ref</p>
                  <p className="text-sm font-bold m-0 tracking-wide">{bookingDetails.bookingReference}</p>
                </div>
              </div>

              {/* Passenger and flight details */}
              <div className="grid grid-cols-3 gap-4 mb-5">
                <div>
                  <p className="text-xs text-gray-500 uppercase m-0 mb-1 tracking-wide font-semibold">
                    Passenger
                  </p>
                  <p className="text-sm font-bold text-gray-900 m-0 leading-tight">
                    {passengers?.[0]?.first_name || 'John'} {passengers?.[0]?.last_name || 'Doe'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase m-0 mb-1 tracking-wide font-semibold">
                    Flight
                  </p>
                  <p className="text-sm font-bold text-gray-900 m-0">
                    {flight?.flight_number || 'NF001'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase m-0 mb-1 tracking-wide font-semibold">
                    Date
                  </p>
                  <p className="text-sm font-bold text-gray-900 m-0">
                    {formatFlightDate(flight?.departure_time)}
                  </p>
                </div>
              </div>

              {/* Route information */}
              <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl p-5 mb-5 border border-gray-300 relative">
                <div 
                  className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
                  style={{
                    background: `linear-gradient(90deg, ${getAirlineColors().primary}, ${getAirlineColors().secondary}, ${getAirlineColors().accent})`
                  }}
                />
                
                <div className="flex justify-between items-center">
                  <div className="text-center flex-1">
                    <p className="text-xs text-gray-600 uppercase m-0 mb-1 tracking-wide font-semibold">
                      From
                    </p>
                    <p 
                      className="text-2xl font-bold m-0 leading-none"
                      style={{ color: getAirlineColors().primary }}
                    >
                      {flight?.origin || 'DAC'}
                    </p>
                    <p className="text-xs text-gray-700 m-0 mt-1 font-semibold">
                      {formatTime(flight?.departure_time) || '10:30'}
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-center flex-1 mx-4">
                    <div className="flex items-center mb-2">
                      <div 
                        className="w-10 h-0.5"
                        style={{
                          background: `linear-gradient(90deg, ${getAirlineColors().secondary}, ${getAirlineColors().accent})`
                        }}
                      />
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center mx-1 text-white text-xs font-bold"
                        style={{
                          background: `linear-gradient(135deg, ${getAirlineColors().primary}, ${getAirlineColors().secondary})`
                        }}
                      >
                        ✈
                      </div>
                      <div 
                        className="w-10 h-0.5"
                        style={{
                          background: `linear-gradient(90deg, ${getAirlineColors().accent}, ${getAirlineColors().secondary})`
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 m-0 text-center font-semibold uppercase tracking-wide">
                      Direct Flight
                    </p>
                  </div>
                  
                  <div className="text-center flex-1">
                    <p className="text-xs text-gray-600 uppercase m-0 mb-1 tracking-wide font-semibold">
                      To
                    </p>
                    <p 
                      className="text-2xl font-bold m-0 leading-none"
                      style={{ color: getAirlineColors().primary }}
                    >
                      {flight?.destination || 'CTG'}
                    </p>
                    <p className="text-xs text-gray-700 m-0 mt-1 font-semibold">
                      {formatTime(flight?.arrival_time) || '14:15'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Flight details grid */}
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-gradient-to-br from-red-50 to-red-100 p-3 rounded-lg text-center border border-red-200">
                  <p className="text-xs text-red-800 uppercase m-0 mb-1 font-bold tracking-wide">
                    Seat
                  </p>
                  <p className="text-lg font-bold text-red-600 m-0">{generateSeatAssignment(0, flight?.seatClass || 'Economy')}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg text-center border border-blue-200">
                  <p className="text-xs text-blue-800 uppercase m-0 mb-1 font-bold tracking-wide">
                    Gate
                  </p>
                  <p className="text-lg font-bold text-blue-600 m-0">{generateGate(flight?.flight_number)}</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg text-center border border-green-200">
                  <p className="text-xs text-green-800 uppercase m-0 mb-1 font-bold tracking-wide">
                    Class
                  </p>
                  <p className="text-xs font-bold text-green-600 m-0">
                    {flight?.seatClass || 'Economy'}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-3 rounded-lg text-center border border-yellow-200">
                  <p className="text-xs text-yellow-800 uppercase m-0 mb-1 font-bold tracking-wide">
                    Terminal
                  </p>
                  <p className="text-lg font-bold text-yellow-600 m-0">{generateTerminal(flight?.airline_name, flight?.flight_number)}</p>
                </div>
              </div>

              {/* Boarding reminder */}
              <div className="absolute bottom-3 left-6 right-6 bg-yellow-100 border border-yellow-400 rounded-lg p-2 text-center">
                <p className="text-xs text-yellow-800 m-0 font-semibold">
                  Boarding starts 30 minutes before departure
                </p>
              </div>
            </div>
            
            {/* Right section - Stub */}
            <div className="flex-[0.8] p-6 bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col justify-between items-center text-center border-l-2 border-dashed border-gray-300 relative">
              
              {/* Airline logo */}
              <div>
                <div className="w-10 h-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center mb-2 shadow-sm">
                  <img 
                    src={getAirlineLogo()} 
                    alt="Airline Logo"
                    className="w-8 h-8 object-contain"
                  />
                </div>
                <p className="text-xs text-gray-500 m-0 mb-4 uppercase tracking-wide font-semibold">
                  Boarding Pass
                </p>
              </div>

              {/* QR Code */}
              <div className="mb-4">
                {qrCodeUrl ? (
                  <div className="p-2 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <img src={qrCodeUrl} alt="QR Code" className="w-16 h-16 block" />
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-gray-200 flex items-center justify-center rounded-lg border border-gray-300">
                    <span className="text-xs text-gray-500 font-semibold">QR</span>
                  </div>
                )}
              </div>

              {/* Barcode */}
              <div>
                <div className="flex justify-center gap-px mb-2 p-2 bg-white rounded border border-gray-200">
                  {Array.from({length: 12}).map((_, i) => (
                    <div 
                      key={i} 
                      className="w-0.5 bg-gray-800"
                      style={{ height: `${12 + (i % 3) * 2}px` }}
                    />
                  ))}
                </div>
                <p className="text-xs font-mono text-gray-500 m-0 tracking-wide font-semibold">
                  {bookingDetails.confirmationNumber}
                </p>
              </div>

              {/* Flight info */}
              <div className="mt-4">
                <p className="text-xs font-bold text-gray-900 m-0 mb-1">
                  {flight?.origin || 'DAC'} → {flight?.destination || 'CTG'}
                </p>
                <p className="text-xs text-gray-500 m-0 font-semibold">
                  {flight?.flight_number || 'NF001'}
                </p>
              </div>
              
              {/* Bottom accent */}
              <div 
                className="absolute bottom-0 left-0 right-0 h-1"
                style={{
                  background: `linear-gradient(90deg, ${getAirlineColors().primary}, ${getAirlineColors().secondary}, ${getAirlineColors().accent})`
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketConfirmation;
