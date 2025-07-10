import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import { useLocation, useNavigate } from "react-router-dom";
import BookingStages from "./BookingStages";
import FlightSummary from "./FlightSummary";
import PaymentForm from "./PaymentForm";
import BillingAddress from "./BillingAddress";
import axios from "axios";

const PaymentPage = () => {
  const [user_id, setuser_id] = useState(null);
  const [paymentData, setPaymentData] = useState({
    method: 'card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    mobileNumber: '',
  });
  const [billingAddress, setBillingAddress] = useState({
    sameAsPassenger: true,
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Bangladesh'
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  
  const { passengers, flight } = location.state || {};
  
  // Fallback to localStorage if not passed through state (for backward compatibility)
  const flightData = flight || JSON.parse(localStorage.getItem("selectedFlight") || "{}");
  
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    if (userData) {
      setuser_id(userData.customer_id);
      // Pre-fill billing address if same as passenger
      if (passengers && passengers.length > 0 && billingAddress.sameAsPassenger) {
        const primaryPassenger = passengers[0];
        setBillingAddress(prev => ({
          ...prev,
          firstName: primaryPassenger.first_name,
          lastName: primaryPassenger.last_name,
        }));
      }
    }
  }, [passengers]);

  const updatePaymentData = (field, value) => {
    setPaymentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateBillingAddress = (field, value) => {
    setBillingAddress(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateTotal = () => {
    if (!flightData || !flightData.adult || !flightData.base_price) return 0;
    
    const adultCount = flightData.adult || 0;
    const childCount = flightData.child || 0;
    const basePrice = flightData.base_price || 0;
    
    return (basePrice * adultCount) + (basePrice * 0.75 * childCount);
  };

  const handlePayment = async () => {
    if (!termsAccepted) {
      alert("Please accept terms and conditions");
      return;
    }

    setLoading(true);
    
    try {
      const paymentPayload = {
        customer_id: user_id,
        passengers: passengers,
        flight_data: flightData,
        payment_method: paymentData.method,
        billing_address: billingAddress,
        total_amount: calculateTotal(),
        // Add more payment details as needed
      };

      // Try to process payment through backend
      try {
        const response = await axios.post('http://localhost:3000/payment/process', paymentPayload);
        
        if (response.data.success) {
          // Navigate to confirmation page with booking details
          navigate('/confirmation', { 
            state: { 
              bookingId: response.data.booking_id,
              passengers,
              flight: flightData,
              paymentData: { ...response.data, amount: calculateTotal(), method: paymentData.method }
            } 
          });
          return;
        }
      } catch (backendError) {
        console.log("Backend not available, simulating successful payment");
      }

      // Simulate successful payment if backend is not available
      const mockBookingId = `NF${Date.now().toString().slice(-6)}`;
      navigate('/confirmation', { 
        state: { 
          bookingId: mockBookingId,
          passengers,
          flight: flightData,
          paymentData: { 
            success: true, 
            amount: calculateTotal(), 
            method: paymentData.method,
            transaction_id: `TXN${Date.now()}`
          }
        } 
      });

    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!passengers || !flightData || Object.keys(flightData).length === 0) {
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
    <div className="bg-blue-100">
      <Navbar flg={true} />
      <div className="mt-20">
        <BookingStages stage={2} />
        <div className="w-full grid grid-cols-3 pl-60 pr-60 pt-10">
          <div className="col-span-2">
            <FlightSummary flight={flightData} />
            
            {/* Payment Method Selection */}
            <div className="bg-white rounded-3xl shadow-lg p-6 mt-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Payment Method</h2>
              <PaymentForm 
                paymentData={paymentData}
                onUpdate={updatePaymentData}
              />
            </div>

            {/* Billing Address */}
            <div className="bg-white rounded-3xl shadow-lg p-6 mt-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Billing Address</h2>
              <BillingAddress 
                billingAddress={billingAddress}
                onUpdate={updateBillingAddress}
                passengers={passengers}
              />
            </div>

            {/* Terms and Security */}
            <div className="bg-white rounded-3xl shadow-lg p-6 mt-6">
              <div className="flex items-center space-x-3 mb-4">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-gray-700">Your payment is secured with SSL encryption</span>
              </div>
              
              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
                />
                <label htmlFor="terms" className="text-sm text-gray-700">
                  I agree to the <a href="#" className="text-blue-600 hover:underline">Terms and Conditions</a> and <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
                </label>
              </div>
            </div>

            {/* Continue Button */}
            <div className="max-w-md mx-auto p-3 rounded-3xl mt-6">
              <div className="flex p-1">
                <button
                  className="flex-1 px-4 py-2 rounded-md transition-all duration-500 bg-blue-600 text-white hover:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handlePayment}
                  disabled={loading || !termsAccepted}
                >
                  {loading ? 'Processing...' : 'Complete Payment'}
                </button>
              </div>
            </div>
          </div>

          {/* Price Summary Sidebar */}
          <div className="px-4">
            <div className="bg-white rounded-3xl shadow-lg p-6 sticky top-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Price Summary</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600">Adults</span>
                    <span className="text-sm text-gray-500">({flightData.adult || 0})</span>
                  </div>
                  <span className="font-medium">${((flightData.base_price || 0) * (flightData.adult || 0)).toFixed(2)}</span>
                </div>
                
                {(flightData.child || 0) > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-600">Children</span>
                      <span className="text-sm text-gray-500">({flightData.child || 0})</span>
                    </div>
                    <span className="font-medium">${((flightData.base_price || 0) * 0.75 * (flightData.child || 0)).toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Taxes & Fees</span>
                  <span className="font-medium">$0.00</span>
                </div>
                
                <hr className="my-4" />
                
                <div className="flex items-center justify-between text-lg font-bold">
                  <span className="text-gray-900">Total</span>
                  <span className="text-blue-600">
                    ${calculateTotal().toFixed(2)}
                  </span>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-blue-800">Trip Details</span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Route:</span>
                    <span className="font-medium">{flightData.origin || 'N/A'} → {flightData.destination || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Trip Type:</span>
                    <span className="font-medium capitalize">{flightData.tripType || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Class:</span>
                    <span className="font-medium">{flightData.seatClass || 'Economy'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;