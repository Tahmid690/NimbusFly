import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import BookingStages from './BookingStages';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';

const TicketConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const boardingPassRef = useRef();
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Get booking data from navigation state
  const { bookingId, passengers, flight, paymentData } = location.state || {};
  
  // Generate booking reference and other details
  const [bookingDetails] = useState({
    bookingReference: bookingId || `NF${Date.now().toString().slice(-6)}`,
    confirmationNumber: `NF${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
    bookingDate: new Date().toLocaleDateString(),
    totalAmount: paymentData?.amount || calculateTotal(),
    paymentMethod: paymentData?.method || 'Card',
    status: 'Confirmed'
  });

  // Enhanced airline logo handler
  const getAirlineLogo = () => {
    if (flight?.logo_url) {
      return flight.logo_url;
    }
    
    // Fallback logic for common airlines based on airline name
    const airlineName = flight?.airline_name?.toLowerCase();
    if (airlineName?.includes('american')) return '/aa.jpeg';
    if (airlineName?.includes('british')) return '/ba.png';
    if (airlineName?.includes('biman')) return '/bba.png';
    if (airlineName?.includes('us bangla')) return '/usba.png';
    if (airlineName?.includes('saudi')) return '/saa.png';
    if (airlineName?.includes('novoair')) return '/na.png';
    
    // Default to NimbusFly logo
    return '/nimbusfly_logo.png';
  };

  // Get airline brand colors for theming
  const getAirlineColors = () => {
    const airlineName = flight?.airline_name?.toLowerCase() || '';
    
    if (airlineName.includes('american')) return { primary: '#003366', secondary: '#FF0000', accent: '#C5282F' };
    if (airlineName.includes('british')) return { primary: '#075AAA', secondary: '#E31837', accent: '#003087' };
    if (airlineName.includes('biman')) return { primary: '#006A4E', secondary: '#FF0000', accent: '#228B22' };
    if (airlineName.includes('us bangla')) return { primary: '#FF6600', secondary: '#003366', accent: '#FF9900' };
    if (airlineName.includes('saudi')) return { primary: '#006C35', secondary: '#FFFFFF', accent: '#00B04F' };
    if (airlineName.includes('novoair')) return { primary: '#E60000', secondary: '#000080', accent: '#FF3333' };
    
    // Default NimbusFly colors
    return { primary: '#1e40af', secondary: '#3b82f6', accent: '#60a5fa' };
  };

  function calculateTotal() {
    if (!flight || !flight.adult || !flight.base_price) return 0;
    const adultCount = flight.adult || 0;
    const childCount = flight.child || 0;
    const basePrice = flight.base_price || 0;
    return (basePrice * adultCount) + (basePrice * 0.75 * childCount);
  }

  // Generate QR code for boarding pass
  useEffect(() => {
    const generateQRCode = async () => {
      try {
        const qrData = JSON.stringify({
          booking: bookingDetails.bookingReference,
          confirmation: bookingDetails.confirmationNumber,
          flight: flight?.flight_number || 'NF001',
          passenger: (passengers?.[0]?.first_name || 'John') + ' ' + (passengers?.[0]?.last_name || 'Doe'),
          seat: 'A12' // This would come from seat selection
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
        // Set a fallback QR code or leave empty
        setQrCodeUrl('');
      }
    };

    if (bookingDetails.bookingReference) {
      generateQRCode();
    }
  }, [bookingDetails, flight, passengers]);

  // Download boarding pass as PDF
  const downloadBoardingPass = async () => {
    setIsDownloading(true);
    try {
      const element = boardingPassRef.current;
      
      if (!element) {
        throw new Error('Boarding pass element not found');
      }

      console.log('Starting PDF generation...');

      // Make element visible and positioned properly
      element.style.position = 'static';
      element.style.left = 'auto';
      element.style.top = 'auto';
      element.style.zIndex = '1';
      element.style.visibility = 'visible';
      
      // Wait a moment for rendering
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const canvas = await html2canvas(element, {
        scale: 2.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: 900,
        height: 400
      });
      
      console.log('Canvas created:', canvas.width, 'x', canvas.height);
      
      // Hide element again
      element.style.position = 'fixed';
      element.style.left = '-9999px';
      element.style.visibility = 'hidden';
      
      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF('l', 'mm', 'a4');
      
      // Calculate dimensions to fit A4 landscape better
      const imgWidth = 270;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const x = (297 - imgWidth) / 2; // Center horizontally
      const y = (210 - imgHeight) / 2; // Center vertically
      
      pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
      pdf.save(`boarding-pass-${bookingDetails.bookingReference}.pdf`);
      
      console.log('PDF saved successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(`Error generating boarding pass: ${error.message}. Please try again.`);
    } finally {
      setIsDownloading(false);
    }
  };

  // Redirect if no booking data
  if (!passengers || !flight) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700">No booking data found</h2>
          <button 
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go to Home
          </button>
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
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                  <div className="text-center">
                    <p className="text-sm text-gray-500">From</p>
                    <p className="text-xl font-bold text-gray-900">{flight.origin}</p>
                    <p className="text-sm text-gray-600">{flight.departure_time || '10:30 AM'}</p>
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
                    <p className="text-xl font-bold text-gray-900">{flight.destination}</p>
                    <p className="text-sm text-gray-600">{flight.arrival_time || '2:15 PM'}</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Flight Number</p>
                    <p className="font-semibold">{flight.flight_number || 'NF001'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Aircraft</p>
                    <p className="font-semibold">{flight.aircraft || 'Boeing 737'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Class</p>
                    <p className="font-semibold">{flight.seatClass || 'Economy'}</p>
                  </div>
                </div>
              </div>

              {/* Passenger Details */}
              <div className="bg-white rounded-3xl shadow-lg p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Passenger Details</h2>
                <div className="space-y-4">
                  {passengers.map((passenger, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
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
                          <p className="text-sm text-gray-500">
                            {index >= flight.adult ? 'Child' : 'Adult'} • Seat: {`${String.fromCharCode(65 + (index % 6))}${12 + index}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Passport</p>
                        <p className="font-semibold">{passenger.passport_number}</p>
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
                      onClick={() => navigate('/')}
                      className="w-full text-left p-3 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          style={{
            position: 'fixed',
            left: '-9999px',
            width: '900px',
            height: '400px',
            backgroundColor: 'white',
            overflow: 'hidden',
            zIndex: -1,
            visibility: 'hidden',
            fontFamily: 'Arial, sans-serif',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)'
          }}
        >
          {/* Main boarding pass container */}
          <div style={{
            width: '100%',
            height: '100%',
            backgroundColor: 'white',
            display: 'flex',
            border: '3px solid #1e40af',
            borderRadius: '16px',
            overflow: 'hidden',
            position: 'relative'
          }}>
            
            {/* Airline brand accent bar */}
            <div style={{
              position: 'absolute',
              top: '0',
              left: '0',
              right: '0',
              height: '6px',
              background: `linear-gradient(90deg, ${getAirlineColors().primary} 0%, ${getAirlineColors().secondary} 50%, ${getAirlineColors().accent} 100%)`
            }}></div>
            
            {/* Left section - Main boarding pass */}
            <div style={{
              flex: '2.2',
              padding: '28px',
              backgroundColor: 'white',
              borderRight: '3px dashed #cbd5e1',
              position: 'relative'
            }}>
              
              {/* Header with enhanced airline logo and branding */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px',
                paddingBottom: '16px',
                borderBottom: '2px solid #e2e8f0'
              }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px',
                    border: '2px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '16px'
                  }}>
                    <img 
                      src={getAirlineLogo()} 
                      alt="Airline Logo"
                      style={{
                        width: '48px',
                        height: '48px',
                        objectFit: 'contain'
                      }}
                    />
                  </div>
                  <div>
                    <h1 style={{
                      fontSize: '24px',
                      fontWeight: 'bold',
                      color: getAirlineColors().primary,
                      margin: '0',
                      lineHeight: '1.2'
                    }}>{flight?.airline_name || 'NimbusFly'}</h1>
                    <p style={{
                      fontSize: '12px',
                      color: '#64748b',
                      margin: '2px 0 0 0',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      fontWeight: '600'
                    }}>Boarding Pass</p>
                  </div>
                </div>
                <div style={{
                  textAlign: 'right',
                  background: `linear-gradient(135deg, ${getAirlineColors().primary}, ${getAirlineColors().secondary})`,
                  padding: '12px 16px',
                  borderRadius: '12px',
                  color: 'white'
                }}>
                  <p style={{
                    fontSize: '10px',
                    margin: '0',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    opacity: '0.9'
                  }}>Booking Ref</p>
                  <p style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    margin: '4px 0 0 0',
                    letterSpacing: '1px'
                  }}>{bookingDetails.bookingReference}</p>
                </div>
              </div>

              {/* Enhanced passenger and flight details */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '20px',
                marginBottom: '24px'
              }}>
                <div>
                  <p style={{
                    fontSize: '11px',
                    color: '#64748b',
                    textTransform: 'uppercase',
                    margin: '0 0 6px 0',
                    letterSpacing: '0.5px',
                    fontWeight: '600'
                  }}>Passenger</p>
                  <p style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#1e293b',
                    margin: '0',
                    lineHeight: '1.2'
                  }}>{passengers?.[0]?.first_name || 'John'} {passengers?.[0]?.last_name || 'Doe'}</p>
                </div>
                <div>
                  <p style={{
                    fontSize: '11px',
                    color: '#64748b',
                    textTransform: 'uppercase',
                    margin: '0 0 6px 0',
                    letterSpacing: '0.5px',
                    fontWeight: '600'
                  }}>Flight</p>
                  <p style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#1e293b',
                    margin: '0'
                  }}>{flight?.flight_number || 'NF001'}</p>
                </div>
                <div>
                  <p style={{
                    fontSize: '11px',
                    color: '#64748b',
                    textTransform: 'uppercase',
                    margin: '0 0 6px 0',
                    letterSpacing: '0.5px',
                    fontWeight: '600'
                  }}>Date</p>
                  <p style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#1e293b',
                    margin: '0'
                  }}>{new Date().toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  })}</p>
                </div>
              </div>

              {/* Premium route information with enhanced design */}
              <div style={{
                background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                borderRadius: '16px',
                padding: '24px',
                marginBottom: '24px',
                border: '2px solid #cbd5e1',
                position: 'relative'
              }}>
                {/* Route accent decoration */}
                <div style={{
                  position: 'absolute',
                  top: '0',
                  left: '0',
                  right: '0',
                  height: '4px',
                  background: `linear-gradient(90deg, ${getAirlineColors().primary}, ${getAirlineColors().secondary}, ${getAirlineColors().accent})`,
                  borderRadius: '16px 16px 0 0'
                }}></div>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ textAlign: 'center', flex: '1' }}>
                    <p style={{
                      fontSize: '11px',
                      color: '#475569',
                      textTransform: 'uppercase',
                      margin: '0 0 8px 0',
                      letterSpacing: '0.5px',
                      fontWeight: '600'
                    }}>From</p>
                    <p style={{
                      fontSize: '32px',
                      fontWeight: 'bold',
                      color: getAirlineColors().primary,
                      margin: '0',
                      lineHeight: '1',
                      letterSpacing: '-1px'
                    }}>{flight?.origin || 'DAC'}</p>
                    <p style={{
                      fontSize: '14px',
                      color: '#334155',
                      margin: '6px 0 0 0',
                      fontWeight: '600'
                    }}>{flight?.departure_time || '10:30'}</p>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    flex: '1',
                    margin: '0 20px'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '8px'
                    }}>
                      <div style={{
                        width: '50px',
                        height: '2px',
                        background: `linear-gradient(90deg, ${getAirlineColors().secondary}, ${getAirlineColors().accent})`
                      }}></div>
                      <div style={{
                        width: '28px',
                        height: '28px',
                        background: `linear-gradient(135deg, ${getAirlineColors().primary}, ${getAirlineColors().secondary})`,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 6px',
                        boxShadow: `0 4px 12px ${getAirlineColors().secondary}40`
                      }}>
                        <span style={{
                          color: 'white',
                          fontSize: '14px',
                          fontWeight: 'bold'
                        }}>✈</span>
                      </div>
                      <div style={{
                        width: '50px',
                        height: '2px',
                        background: `linear-gradient(90deg, ${getAirlineColors().accent}, ${getAirlineColors().secondary})`
                      }}></div>
                    </div>
                    <p style={{
                      fontSize: '11px',
                      color: '#64748b',
                      margin: '0',
                      textAlign: 'center',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>Direct Flight</p>
                  </div>
                  
                  <div style={{ textAlign: 'center', flex: '1' }}>
                    <p style={{
                      fontSize: '11px',
                      color: '#475569',
                      textTransform: 'uppercase',
                      margin: '0 0 8px 0',
                      letterSpacing: '0.5px',
                      fontWeight: '600'
                    }}>To</p>
                    <p style={{
                      fontSize: '32px',
                      fontWeight: 'bold',
                      color: getAirlineColors().primary,
                      margin: '0',
                      lineHeight: '1',
                      letterSpacing: '-1px'
                    }}>{flight?.destination || 'CTG'}</p>
                    <p style={{
                      fontSize: '14px',
                      color: '#334155',
                      margin: '6px 0 0 0',
                      fontWeight: '600'
                    }}>{flight?.arrival_time || '14:15'}</p>
                  </div>
                </div>
              </div>

              {/* Enhanced flight details grid with premium styling */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr 1fr',
                gap: '16px'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #fef2f2, #fee2e2)',
                  padding: '12px',
                  borderRadius: '12px',
                  textAlign: 'center',
                  border: '2px solid #fecaca',
                  position: 'relative'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '0',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '20px',
                    height: '3px',
                    backgroundColor: '#dc2626',
                    borderRadius: '0 0 3px 3px'
                  }}></div>
                  <p style={{
                    fontSize: '11px',
                    color: '#991b1b',
                    textTransform: 'uppercase',
                    margin: '0 0 4px 0',
                    fontWeight: 'bold',
                    letterSpacing: '0.5px'
                  }}>Seat</p>
                  <p style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: '#dc2626',
                    margin: '0'
                  }}>A12</p>
                </div>
                <div style={{
                  background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
                  padding: '12px',
                  borderRadius: '12px',
                  textAlign: 'center',
                  border: '2px solid #bfdbfe',
                  position: 'relative'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '0',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '20px',
                    height: '3px',
                    backgroundColor: '#2563eb',
                    borderRadius: '0 0 3px 3px'
                  }}></div>
                  <p style={{
                    fontSize: '11px',
                    color: '#1e40af',
                    textTransform: 'uppercase',
                    margin: '0 0 4px 0',
                    fontWeight: 'bold',
                    letterSpacing: '0.5px'
                  }}>Gate</p>
                  <p style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: '#2563eb',
                    margin: '0'
                  }}>B7</p>
                </div>
                <div style={{
                  background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                  padding: '12px',
                  borderRadius: '12px',
                  textAlign: 'center',
                  border: '2px solid #bbf7d0',
                  position: 'relative'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '0',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '20px',
                    height: '3px',
                    backgroundColor: '#16a34a',
                    borderRadius: '0 0 3px 3px'
                  }}></div>
                  <p style={{
                    fontSize: '11px',
                    color: '#166534',
                    textTransform: 'uppercase',
                    margin: '0 0 4px 0',
                    fontWeight: 'bold',
                    letterSpacing: '0.5px'
                  }}>Class</p>
                  <p style={{
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: '#15803d',
                    margin: '0'
                  }}>{flight?.seatClass || 'Economy'}</p>
                </div>
                <div style={{
                  background: 'linear-gradient(135deg, #fefce8, #fef3c7)',
                  padding: '12px',
                  borderRadius: '12px',
                  textAlign: 'center',
                  border: '2px solid #fed7aa',
                  position: 'relative'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '0',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '20px',
                    height: '3px',
                    backgroundColor: '#d97706',
                    borderRadius: '0 0 3px 3px'
                  }}></div>
                  <p style={{
                    fontSize: '11px',
                    color: '#a16207',
                    textTransform: 'uppercase',
                    margin: '0 0 4px 0',
                    fontWeight: 'bold',
                    letterSpacing: '0.5px'
                  }}>Terminal</p>
                  <p style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: '#ca8a04',
                    margin: '0'
                  }}>T1</p>
                </div>
              </div>

              {/* Premium decorative elements */}
              <div style={{
                position: 'absolute',
                top: '0',
                right: '0',
                width: '120px',
                height: '120px',
                background: 'radial-gradient(circle, rgba(30, 64, 175, 0.08) 0%, rgba(59, 130, 246, 0.05) 50%, transparent 70%)',
                borderRadius: '0 0 0 120px'
              }}></div>
              
              {/* Boarding time reminder */}
              <div style={{
                position: 'absolute',
                bottom: '16px',
                left: '28px',
                right: '28px',
                backgroundColor: '#fef3c7',
                border: '1px solid #f59e0b',
                borderRadius: '8px',
                padding: '8px 12px',
                textAlign: 'center'
              }}>
                <p style={{
                  fontSize: '10px',
                  color: '#92400e',
                  margin: '0',
                  fontWeight: '600'
                }}>Boarding starts 30 minutes before departure</p>
              </div>
            </div>
            
            {/* Right section - Enhanced Stub */}
            <div style={{
              flex: '0.8',
              padding: '28px 20px',
              background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'center',
              textAlign: 'center',
              borderLeft: '3px dashed #cbd5e1',
              position: 'relative'
            }}>
              
              {/* Enhanced airline logo section */}
              <div>
                <div style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  border: '2px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '12px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)'
                }}>
                  <img 
                    src={getAirlineLogo()} 
                    alt="Airline Logo"
                    style={{
                      width: '40px',
                      height: '40px',
                      objectFit: 'contain'
                    }}
                  />
                </div>
                <p style={{
                  fontSize: '11px',
                  color: '#64748b',
                  margin: '0 0 20px 0',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  fontWeight: '600'
                }}>Boarding Pass</p>
              </div>

              {/* Enhanced QR Code section */}
              <div style={{ marginBottom: '20px' }}>
                {qrCodeUrl ? (
                  <div style={{
                    padding: '8px',
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    border: '2px solid #e2e8f0',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)'
                  }}>
                    <img src={qrCodeUrl} alt="QR Code" style={{
                      width: '72px',
                      height: '72px',
                      display: 'block'
                    }} />
                  </div>
                ) : (
                  <div style={{
                    width: '72px',
                    height: '72px',
                    backgroundColor: '#e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '12px',
                    border: '2px solid #cbd5e1'
                  }}>
                    <span style={{ 
                      fontSize: '12px',
                      color: '#64748b',
                      fontWeight: '600'
                    }}>QR</span>
                  </div>
                )}
              </div>

              {/* Enhanced Barcode section */}
              <div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '1px',
                  marginBottom: '10px',
                  padding: '8px',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0'
                }}>
                  {Array.from({length: 14}).map((_, i) => (
                    <div 
                      key={i} 
                      style={{
                        width: '2px',
                        backgroundColor: '#1e293b',
                        height: `${14 + (i % 4) * 3}px`
                      }}
                    ></div>
                  ))}
                </div>
                <p style={{
                  fontSize: '9px',
                  fontFamily: 'monospace',
                  color: '#64748b',
                  margin: '0',
                  letterSpacing: '1px',
                  fontWeight: '600'
                }}>{bookingDetails.confirmationNumber}</p>
              </div>

              {/* Flight info on stub */}
              <div style={{ marginTop: '20px' }}>
                <p style={{
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: '#1e293b',
                  margin: '0 0 4px 0'
                }}>{flight?.origin || 'DAC'} → {flight?.destination || 'CTG'}</p>
                <p style={{
                  fontSize: '11px',
                  color: '#64748b',
                  margin: '0',
                  fontWeight: '600'
                }}>{flight?.flight_number || 'NF001'}</p>
              </div>
              
              {/* Decorative accent */}
              <div style={{
                position: 'absolute',
                bottom: '0',
                left: '0',
                right: '0',
                height: '4px',
                background: `linear-gradient(90deg, ${getAirlineColors().primary}, ${getAirlineColors().secondary}, ${getAirlineColors().accent})`
              }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketConfirmation;
