import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import { useLocation, useNavigate } from "react-router-dom";
import BookingStages from "./BookingStages";
import FlightSummary from "./FlightSummary";
import PaymentForm from "./PaymentForm";
import BillingAddress from "./BillingAddress";
import axios from "axios";
import { CheckCircle, Shield, CreditCard, Users, AlertCircle, Loader2 } from "lucide-react";

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
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  
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
    
    const adultPrice = basePrice * adultCount;
    const childPrice = basePrice * 0.75 * childCount;
    const subtotal = adultPrice + childPrice;
    
    // Add platform fee (5% of subtotal or minimum $15)
    const platformFee = Math.max(subtotal * 0.05, 15);
    
    return subtotal + platformFee;
  };

  const getPlatformFee = () => {
    if (!flightData || !flightData.adult || !flightData.base_price) return 0;
    
    const subtotal = getSubtotal();
    return Math.max(subtotal * 0.05, 15);
  };

  const getSubtotal = () => {
    if (!flightData || !flightData.adult || !flightData.base_price) return 0;
    
    const adultCount = flightData.adult || 0;
    const childCount = flightData.child || 0;
    const basePrice = flightData.base_price || 0;
    
    return (basePrice * adultCount) + (basePrice * 0.75 * childCount);
  };

  const validatePaymentData = () => {
    const errors = {};
    
    if (!termsAccepted) {
      errors.terms = "Please accept terms and conditions";
    }
    
    if (paymentData.method === 'card') {
      if (!paymentData.cardNumber || paymentData.cardNumber.length < 16) {
        errors.cardNumber = "Please enter a valid card number";
      }
      if (!paymentData.expiryDate || paymentData.expiryDate.length < 5) {
        errors.expiryDate = "Please enter a valid expiry date";
      }
      if (!paymentData.cvv || paymentData.cvv.length < 3) {
        errors.cvv = "Please enter a valid CVV";
      }
      if (!paymentData.cardholderName) {
        errors.cardholderName = "Please enter cardholder name";
      }
    }
    
    if (paymentData.method === 'mobile' && !paymentData.mobileNumber) {
      errors.mobileNumber = "Please enter mobile number";
    }
    
    if (!billingAddress.sameAsPassenger) {
      if (!billingAddress.firstName) errors.firstName = "First name is required";
      if (!billingAddress.lastName) errors.lastName = "Last name is required";
      if (!billingAddress.address) errors.address = "Address is required";
      if (!billingAddress.city) errors.city = "City is required";
      if (!billingAddress.postalCode) errors.postalCode = "Postal code is required";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePayment = async () => {
    setError(null);
    
    if (!validatePaymentData()) {
      setError("Please fix the errors below and try again.");
      return;
    }

    setLoading(true);
    console.log(flightData);
    try {
      // Comprehensive payment payload that matches backend API schema
      // console.log(flightData)
      const paymentPayload = {
        customer_id: user_id,
        passengers: passengers.map(passenger => ({
          first_name: passenger.first_name,
          last_name: passenger.last_name,
          date_of_birth: passenger.date_of_birth,
          passport_number: passenger.passport_number,
          nationality: passenger.nationality,
          title: passenger.title || 'Mr'
        })),
        flight_data: {
          ...flightData,
          flight_id: flightData.flight_id, // Optional - will be extracted if not provided
          flight_number: flightData.flight_number,
          origin: flightData.origin,
          destination: flightData.destination,
          departure_time: flightData.departure_time,
          arrival_time: flightData.arrival_time,
          seat_class: flightData.seatClass || 'Economy',
          adult_count: flightData.adult,
          child_count: flightData.child,
          base_price: flightData.base_price,
          trip_type: flightData.tripType === 'round-trip' ? 'ROUND-WAY' : 'ONE-WAY',
          aircraft_id: flightData.aircraft_id // Optional - will be extracted if not provided
        },
        payment_method: paymentData.method === 'card' ? 
          `${paymentData.cardholderName} (****${paymentData.cardNumber.slice(-4)})` : 
          `Mobile Banking (${paymentData.mobileNumber})`,
        billing_address: billingAddress.sameAsPassenger ? {
          same_as_passenger: true,
          first_name: passengers[0]?.first_name,
          last_name: passengers[0]?.last_name
        } : {
          same_as_passenger: false,
          ...billingAddress
        },
        total_amount: calculateTotal()
      };
      
      // Process payment and create booking through backend
      try {
        const response = await axios.post('http://localhost:3000/payments/process', paymentPayload);
        
        if (response.data.success) {
          // Navigate to confirmation page with complete booking details
          navigate('/confirmation', { 
            state: { 
              bookingId: response.data.booking_id,
              transactionId: response.data.transaction_id,
              passengers,
              flight: flightData,
              tripType: flightData.tripType, // Pass the trip type
              tickets: response.data.tickets || [],
              paymentData: {
                ...response.data,
                amount: calculateTotal(),
                method: paymentData.method,
                payment_date: new Date().toISOString(),
                status: 'PAID'
              }
            } 
          });
          return;
        } else {
          throw new Error(response.data.message || 'Payment processing failed');
        }
      } catch (backendError) {
        console.error("Backend error:", backendError);
        
        // If backend is not available, show error instead of simulating
        if (backendError.code === 'ECONNREFUSED' || backendError.message.includes('Network Error')) {
          setError('Unable to connect to payment server. Please try again later.');
        } else {
          setError(backendError.response?.data?.message || 'Payment processing failed. Please try again.');
        }
        return;
      }

    } catch (error) {
      console.error("Payment error:", error);
      setError(error.message || "Payment failed. Please try again.");
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Navbar flg={true} />
      <div className="mt-20">
        <BookingStages stage={2} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
            {/* Enhanced Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <div>
                    <h3 className="text-sm font-medium text-red-800">Payment Error</h3>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            <FlightSummary flight={flightData} />
            
            {/* Enhanced Payment Method Selection */}
            <div className="bg-white rounded-3xl shadow-lg border border-blue-100 p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Payment Method</h2>
                  <p className="text-sm text-gray-600">Choose your preferred payment option</p>
                </div>
              </div>
              <PaymentForm 
                paymentData={paymentData}
                onUpdate={updatePaymentData}
                validationErrors={validationErrors}
              />
            </div>

            {/* Enhanced Billing Address */}
            <div className="bg-white rounded-3xl shadow-lg border border-blue-100 p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-green-100 rounded-xl">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Billing Address</h2>
                  <p className="text-sm text-gray-600">Billing information for your purchase</p>
                </div>
              </div>
              <BillingAddress 
                billingAddress={billingAddress}
                onUpdate={updateBillingAddress}
                passengers={passengers}
                validationErrors={validationErrors}
              />
            </div>

            {/* Enhanced Terms and Security */}
            <div className="bg-white rounded-3xl shadow-lg border border-blue-100 p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-emerald-100 rounded-xl">
                  <Shield className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Security & Terms</h2>
                  <p className="text-sm text-gray-600">Your information is protected</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <div>
                    <span className="text-sm font-semibold text-emerald-800">256-bit SSL Encryption</span>
                    <p className="text-xs text-emerald-700 mt-1">Your payment and personal information are fully encrypted and secure</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-700 leading-5">
                    I agree to the <a href="#" className="text-blue-600 hover:underline font-medium">Terms and Conditions</a> and <a href="#" className="text-blue-600 hover:underline font-medium">Privacy Policy</a>. I understand that my booking is subject to the airline's terms and conditions.
                  </label>
                </div>
                
                {validationErrors.terms && (
                  <p className="text-red-600 text-sm mt-2">{validationErrors.terms}</p>
                )}
              </div>
            </div>

            {/* Enhanced Continue Button */}
            <div className="bottom-0 bg-white border-t border-gray-200 p-6 rounded-t-3xl shadow-lg">
              <div className="max-w-md mx-auto">
                <button
                  className="w-full flex items-center justify-center space-x-3 px-6 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  onClick={handlePayment}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="font-semibold">Processing Payment...</span>
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5" />
                      <span className="font-semibold">Complete Secure Payment</span>
                    </>
                  )}
                </button>
                <p className="text-xs text-gray-500 text-center mt-3">
                  By clicking "Complete Payment", you agree to our terms and your card will be charged ${calculateTotal().toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Enhanced Price Summary Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-lg border border-blue-100 p-6 sticky top-6 hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
              <div className="flex items-center space-x-3 mb-6 pt-2">
                <div className="p-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Price Summary</h3>
                  <p className="text-sm text-gray-500">Booking breakdown</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <span className="text-gray-800 font-semibold">Adults</span>
                        <span className="text-sm text-gray-500 bg-blue-100 px-2 py-1 rounded-full ml-2">×{flightData.adult || 0}</span>
                      </div>
                    </div>
                    <span className="font-bold text-gray-900">${((flightData.base_price || 0) * (flightData.adult || 0)).toFixed(2)}</span>
                  </div>
                  
                  {(flightData.child || 0) > 0 && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Users className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <span className="text-gray-800 font-semibold">Children</span>
                          <span className="text-sm text-gray-500 bg-green-100 px-2 py-1 rounded-full ml-2">×{flightData.child || 0}</span>
                          <span className="text-xs text-gray-500 block">25% discount applied</span>
                        </div>
                      </div>
                      <span className="font-bold text-gray-900">${((flightData.base_price || 0) * 0.75 * (flightData.child || 0)).toFixed(2)}</span>
                    </div>
                  )}
                </div>
                
                <div className="border-t border-gray-200 pt-4 space-y-3">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-700 font-medium">Subtotal</span>
                    <span className="font-semibold text-gray-900">${getSubtotal().toFixed(2)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-700 font-medium">Platform Fee</span>
                      <div className="group relative">
                        <svg className="w-4 h-4 text-gray-400 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                          5% of subtotal (min $15)
                        </div>
                      </div>
                    </div>
                    <span className="font-semibold text-gray-900">${getPlatformFee().toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <span className="text-lg font-bold text-gray-900">Total Amount</span>
                        <p className="text-sm text-gray-600">All fees included</p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-blue-600">
                      ${calculateTotal().toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="p-1 bg-blue-500 rounded-full">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm font-bold text-blue-800">Trip Details</span>
                </div>
                <div className="text-sm text-gray-700 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Route:</span>
                    <span className="font-semibold text-blue-800">{flightData.origin || 'N/A'} → {flightData.destination || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Trip Type:</span>
                    <span className="font-semibold text-blue-800 capitalize">{flightData.tripType || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Class:</span>
                    <span className="font-semibold text-blue-800">{flightData.seatClass || 'Economy'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Passengers:</span>
                    <span className="font-semibold text-blue-800">{(flightData.adult || 0) + (flightData.child || 0)} total</span>
                  </div>
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