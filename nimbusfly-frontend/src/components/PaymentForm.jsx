import React from 'react';
import MultiCardCheckoutLogo from '../assets/MultiCardCheckoutLogo.png';
import bkash from '../assets/bkash.png';
import nagad from '../assets/nagad.png';
import rocket from '../assets/rocket.png';


const PaymentForm = ({ paymentData, onUpdate, validationErrors = {} }) => {
  const handleMethodChange = (method) => {
    onUpdate('method', method);
  };

  const handleInputChange = (field, value) => {
    onUpdate(field, value);
  };

  // Format card number with spaces every 4 digits
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  // Format expiry date with slash
  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    handleInputChange('cardNumber', formatted);
  };

  const handleExpiryDateChange = (e) => {
    const formatted = formatExpiryDate(e.target.value);
    handleInputChange('expiryDate', formatted);
  };

  return (
    <div className="space-y-6">
      {/* Payment Method Selection */}
      <div className="space-y-4">
        {/* Credit/Debit Card Option */}
        <div 
          className={`relative border-2 rounded-xl p-5 cursor-pointer transition-all duration-300 ${
            paymentData.method === 'card' 
              ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md' 
              : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
          }`}
          onClick={() => handleMethodChange('card')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${paymentData.method === 'card' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                <svg className={`w-5 h-5 ${paymentData.method === 'card' ? 'text-blue-600' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div>
                <span className="font-semibold text-gray-900">Credit/Debit Card</span>
                <p className="text-sm text-gray-500">Secure payment with your card</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex space-x-3">
                {/* Professional Card Logos */}
                <img src={MultiCardCheckoutLogo} alt="Payment Methods" className="h-8" />
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                paymentData.method === 'card' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
              }`}>
                {paymentData.method === 'card' && <div className="w-2 h-2 bg-white rounded-full"></div>}
              </div>
            </div>
          </div>
          {paymentData.method === 'card' && (
            <div className="absolute top-2 right-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            </div>
          )}
        </div>

        
        {/* Mobile Banking Option */}
        <div 
          className={`relative border-2 rounded-xl p-5 cursor-pointer transition-all duration-300 ${
            paymentData.method === 'mobile' 
              ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md' 
              : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
          }`}
          onClick={() => handleMethodChange('mobile')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${paymentData.method === 'mobile' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                <svg className={`w-5 h-5 ${paymentData.method === 'mobile' ? 'text-blue-600' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <span className="font-semibold text-gray-900">Mobile Banking</span>
                <p className="text-sm text-gray-500">bKash, Nagad, Rocket & more</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex space-x-2">
                {/* Professional Mobile Banking Logos */}
                <img src={bkash} alt="bKash" className="w-12 h-8 object-contain" />
                <img src={nagad} alt="Nagad" className="w-12 h-8 object-contain" />
                <img src={rocket} alt="Rocket" className="w-10 h-8 object-contain" />
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                paymentData.method === 'mobile' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
              }`}>
                {paymentData.method === 'mobile' && <div className="w-2 h-2 bg-white rounded-full"></div>}
              </div>
            </div>
          </div>
          {paymentData.method === 'mobile' && (
            <div className="absolute top-2 right-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Card Details Form */}
      {paymentData.method === 'card' && (
        <div className="space-y-6 border-t border-gray-200 pt-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
            <div className="flex items-center space-x-2 mb-2">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-sm font-semibold text-blue-800">Secure Card Information</span>
            </div>
            <p className="text-xs text-blue-600">Your card details are encrypted and secure</p>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Card Number</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={paymentData.cardNumber}
                  onChange={handleCardNumberChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 bg-white shadow-sm ${
                    validationErrors.cardNumber ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  maxLength="19"
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                  <svg className="w-8 h-5" viewBox="0 0 32 20" fill="none">
                    <rect width="32" height="20" rx="4" fill="#f3f4f6"/>
                    <text x="16" y="12" textAnchor="middle" fontSize="6" fill="#9ca3af" fontWeight="600">CARD</text>
                  </svg>
                </div>
              </div>
              {validationErrors.cardNumber && (
                <p className="text-red-600 text-sm mt-2">{validationErrors.cardNumber}</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Expiry Date</label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  value={paymentData.expiryDate}
                  onChange={handleExpiryDateChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 bg-white shadow-sm ${
                    validationErrors.expiryDate ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  maxLength="5"
                />
                {validationErrors.expiryDate && (
                  <p className="text-red-600 text-sm mt-2">{validationErrors.expiryDate}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">CVV</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="123"
                    value={paymentData.cvv}
                    onChange={(e) => handleInputChange('cvv', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 bg-white shadow-sm ${
                      validationErrors.cvv ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    maxLength="4"
                  />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                {validationErrors.cvv && (
                  <p className="text-red-600 text-sm mt-2">{validationErrors.cvv}</p>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Cardholder Name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={paymentData.cardholderName}
                onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 bg-white shadow-sm ${
                  validationErrors.cardholderName ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              {validationErrors.cardholderName && (
                <p className="text-red-600 text-sm mt-2">{validationErrors.cardholderName}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Mobile Banking Details Form */}
      {paymentData.method === 'mobile' && (
        <div className="space-y-6 border-t border-gray-200 pt-6">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
            <div className="flex items-center space-x-2 mb-2">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-semibold text-green-800">Mobile Banking Payment</span>
            </div>
            <p className="text-xs text-green-600">You'll be redirected to complete your mobile banking payment</p>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Mobile Number</label>
            <input
              type="text"
              placeholder="01XXXXXXXXX"
              value={paymentData.mobileNumber || ''}
              onChange={(e) => onUpdate('mobileNumber', e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 bg-white shadow-sm ${
                validationErrors.mobileNumber ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
              }`}
              maxLength="11"
            />
            {validationErrors.mobileNumber && (
              <p className="text-red-600 text-sm mt-2">{validationErrors.mobileNumber}</p>
            )}
          </div>
          
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <div className="flex items-center space-x-2 mb-2">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-semibold text-blue-800">Payment Instructions</span>
            </div>
            <ul className="text-xs text-blue-600 space-y-1">
              <li>• You'll receive an SMS with payment instructions</li>
              <li>• Follow the prompts to complete your payment</li>
              <li>• Your booking will be confirmed once payment is successful</li>
            </ul>
          </div>
        </div>
      )}

    </div>
  );
};

export default PaymentForm;