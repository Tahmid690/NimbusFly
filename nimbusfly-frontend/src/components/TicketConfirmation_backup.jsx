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
        setQrCodeUrl('');
      }
    };

    if (bookingDetails.bookingReference) {
      generateQRCode();
    }
  }, [bookingDetails, flight, passengers]);

  // Download boarding pass as PDF with high resolution and rounded corners
  const downloadBoardingPass = async () => {
    setIsDownloading(true);
    try {
      const element = boardingPassRef.current;
      
      if (!element) {
        throw new Error('Boarding pass element not found');
      }

      console.log('Starting high-resolution PDF generation...');

      // Make element visible and positioned properly for capture
      element.style.position = 'static';
      element.style.left = 'auto';
      element.style.top = 'auto';
      element.style.zIndex = '1000';
      element.style.visibility = 'visible';
      element.style.transform = 'scale(1)';
      
      // Wait for rendering and any animations to complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Create high-resolution canvas with improved settings
      const canvas = await html2canvas(element, {
        scale: 4, // Increased scale for better resolution
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: 900,
        height: 400,
        imageTimeout: 15000,
        removeContainer: false,
        foreignObjectRendering: true,
        onclone: (clonedDoc) => {
          // Ensure fonts are loaded in the cloned document
          const clonedElement = clonedDoc.querySelector('[data-boarding-pass]');
          if (clonedElement) {
            clonedElement.style.fontFamily = 'Arial, sans-serif';
          }
        }
      });
      
      console.log('High-resolution canvas created:', canvas.width, 'x', canvas.height);
      
      // Hide element again
      element.style.position = 'fixed';
      element.style.left = '-9999px';
      element.style.visibility = 'hidden';
      element.style.zIndex = '-1';
      
      // Create a new canvas for rounded corners processing
      const roundedCanvas = document.createElement('canvas');
      const ctx = roundedCanvas.getContext('2d');
      
      roundedCanvas.width = canvas.width;
      roundedCanvas.height = canvas.height;
      
      // Draw rounded rectangle with high-quality settings
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      const cornerRadius = 64; // Scaled up for high-resolution
      
      // Create clipping path for rounded corners
      ctx.beginPath();
      ctx.moveTo(cornerRadius, 0);
      ctx.lineTo(roundedCanvas.width - cornerRadius, 0);
      ctx.quadraticCurveTo(roundedCanvas.width, 0, roundedCanvas.width, cornerRadius);
      ctx.lineTo(roundedCanvas.width, roundedCanvas.height - cornerRadius);
      ctx.quadraticCurveTo(roundedCanvas.width, roundedCanvas.height, roundedCanvas.width - cornerRadius, roundedCanvas.height);
      ctx.lineTo(cornerRadius, roundedCanvas.height);
      ctx.quadraticCurveTo(0, roundedCanvas.height, 0, roundedCanvas.height - cornerRadius);
      ctx.lineTo(0, cornerRadius);
      ctx.quadraticCurveTo(0, 0, cornerRadius, 0);
      ctx.closePath();
      ctx.clip();
      
      // Draw the original canvas onto the rounded canvas
      ctx.drawImage(canvas, 0, 0);
      
      // Convert to high-quality PNG
      const imgData = roundedCanvas.toDataURL('image/png', 1.0);
      
      // Create PDF with optimized settings
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
        compress: true,
        precision: 2
      });
      
      // Calculate dimensions for better fit and quality
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = 280; // Slightly larger for better quality
      const imgHeight = (roundedCanvas.height * imgWidth) / roundedCanvas.width;
      
      // Center the image on the page
      const x = (pageWidth - imgWidth) / 2;
      const y = (pageHeight - imgHeight) / 2;
      
      // Add image with high compression settings
      pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight, '', 'FAST');
      
      // Save with descriptive filename
      const filename = `NimbusFly-BoardingPass-${bookingDetails.bookingReference}-${new Date().toISOString().slice(0, 10)}.pdf`;
      pdf.save(filename);
      
      console.log('High-resolution PDF with rounded corners saved successfully!');
      
      // Clean up
      roundedCanvas.remove();
      
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
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
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
                      {flight?.departure_time || '10:30'}
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
                      {flight?.arrival_time || '14:15'}
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
                  <p className="text-lg font-bold text-red-600 m-0">A12</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg text-center border border-blue-200">
                  <p className="text-xs text-blue-800 uppercase m-0 mb-1 font-bold tracking-wide">
                    Gate
                  </p>
                  <p className="text-lg font-bold text-blue-600 m-0">B7</p>
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
                  <p className="text-lg font-bold text-yellow-600 m-0">T1</p>
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
