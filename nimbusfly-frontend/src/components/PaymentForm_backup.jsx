import React from 'react';

const PaymentForm = ({ paymentData, onUpdate }) => {
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
                {/* Visa Logo */}
                <div className="w-12 h-8 bg-white rounded border border-gray-200 flex items-center justify-center shadow-sm">
                  <svg width="24" height="8" viewBox="0 0 24 8" fill="none">
                    <path d="M8.76 6.8L10.36 1.2H11.76L10.16 6.8H8.76ZM6.36 1.2L4.84 5.24L4.64 4.16L4.04 1.56C3.96 1.24 3.68 1.2 3.44 1.2H0.24L0.2 1.36C0.88 1.52 1.84 1.84 2.44 2.28L3.76 6.8H5.24L7.84 1.2H6.36ZM21.16 6.8H22.52L21.24 1.2H19.96C19.72 1.2 19.52 1.32 19.44 1.52L17.04 6.8H18.52L18.88 5.88H20.72L20.96 6.8ZM19.32 4.64L20.08 2.8L20.44 4.64H19.32ZM16.68 3.8C16.68 2.96 15.96 2.4 14.72 2.4C13.44 2.4 12.52 3.04 12.52 3.96C12.52 4.64 13.08 5.08 13.96 5.32C14.84 5.56 15.16 5.76 15.16 6.08C15.16 6.56 14.6 6.8 14.08 6.8C13.32 6.8 12.92 6.52 12.92 6.52L12.64 7.52S13.08 7.8 14.08 7.8C15.52 7.8 16.4 7.16 16.4 6.2C16.4 5.48 15.8 5.04 14.88 4.8C14.08 4.56 13.72 4.36 13.72 4C13.72 3.64 14.12 3.36 14.92 3.36C15.52 3.36 15.96 3.56 15.96 3.56L16.24 2.6S15.76 2.4 14.92 2.4C13.56 2.4 12.72 3.04 12.72 3.96" fill="#1A1F71"/>
                  </svg>
                </div>
                
                {/* Mastercard Logo */}
                <div className="w-12 h-8 bg-white rounded border border-gray-200 flex items-center justify-center shadow-sm">
                  <svg width="24" height="15" viewBox="0 0 24 15" fill="none">
                    <circle cx="9" cy="7.5" r="7" fill="#EB001B"/>
                    <circle cx="15" cy="7.5" r="7" fill="#F79E1B"/>
                    <path d="M12 3.5C13.5 4.8 14.5 6.5 14.5 8.5C14.5 10.5 13.5 12.2 12 13.5C10.5 12.2 9.5 10.5 9.5 8.5C9.5 6.5 10.5 4.8 12 3.5Z" fill="#FF5F00"/>
                  </svg>
                </div>
                
                {/* American Express Logo */}
                <div className="w-12 h-8 bg-white rounded border border-gray-200 flex items-center justify-center shadow-sm">
                  <svg width="24" height="8" viewBox="0 0 24 8" fill="none">
                    <rect width="24" height="8" rx="1" fill="#006FCF"/>
                    <text x="12" y="5.5" textAnchor="middle" fontSize="4" fill="white" fontWeight="bold">AMEX</text>
                  </svg>
                </div>
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

        {/* PayPal Option */}
        <div 
          className={`relative border-2 rounded-xl p-5 cursor-pointer transition-all duration-300 ${
            paymentData.method === 'paypal' 
              ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md' 
              : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
          }`}
          onClick={() => handleMethodChange('paypal')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${paymentData.method === 'paypal' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                <svg className={`w-6 h-6 ${paymentData.method === 'paypal' ? 'text-blue-600' : 'text-gray-600'}`} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a1.96 1.96 0 0 0-.09-.232c-.952 4.737-4.125 6.332-8.036 6.332h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106-.32 2.027a.641.641 0 0 0 .633.74h3.527c.46 0 .852-.335.926-.771l.038-.247.730-4.624.047-.267c.074-.436.466-.771.926-.771h.584c3.583 0 6.388-1.456 7.207-5.665.342-1.755.166-3.22-.697-4.35a3.669 3.669 0 0 0-.611-.478z"/>
                </svg>
              </div>
              <div>
                <span className="font-semibold text-gray-900">PayPal</span>
                <p className="text-sm text-gray-500">Quick & secure PayPal checkout</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-16 h-8 bg-white rounded border border-gray-200 flex items-center justify-center shadow-sm">
                <svg width="40" height="10" viewBox="0 0 40 10" fill="none">
                  <path d="M12.017 0l.28 3.015h1.626c.761 0 1.347.202 1.759.605.412.403.618.964.618 1.683 0 .721-.206 1.282-.618 1.686-.412.403-.998.605-1.759.605h-1.626L12.017 10H9.281l.891-10h1.845z" fill="#253B80"/>
                  <path d="M19.174 3.628c-.72 0-1.347.202-1.88.605-.532.404-.799.964-.799 1.683 0 .72.267 1.28.799 1.684.533.403 1.16.605 1.88.605s1.347-.202 1.88-.605c.532-.404.799-.964.799-1.684 0-.719-.267-1.279-.799-1.683-.533-.403-1.16-.605-1.88-.605z" fill="#179BD7"/>
                  <path d="M26.045 3.628c-.72 0-1.347.202-1.88.605-.532.404-.799.964-.799 1.683 0 .72.267 1.28.799 1.684.533.403 1.16.605 1.88.605s1.347-.202 1.88-.605c.532-.404.799-.964.799-1.684 0-.719-.267-1.279-.799-1.683-.533-.403-1.16-.605-1.88-.605z" fill="#253B80"/>
                </svg>
              </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              paymentData.method === 'paypal' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
            }`}>
              {paymentData.method === 'paypal' && <div className="w-2 h-2 bg-white rounded-full"></div>}
            </div>
          </div>
          {paymentData.method === 'paypal' && (
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
              <div className="flex space-x-3">
                {/* Professional Mobile Banking Logos */}
                {/* bKash Logo */}
                <div className="w-12 h-8 bg-white rounded border border-gray-200 flex items-center justify-center shadow-sm">
                  <svg width="24" height="8" viewBox="0 0 24 8" fill="none">
                    <rect width="24" height="8" rx="2" fill="#E2136E"/>
                    <text x="12" y="5.5" textAnchor="middle" fontSize="3.5" fill="white" fontWeight="bold">bKash</text>
                  </svg>
                </div>
                
                {/* Nagad Logo */}
                <div className="w-12 h-8 bg-white rounded border border-gray-200 flex items-center justify-center shadow-sm">
                  <svg width="24" height="8" viewBox="0 0 24 8" fill="none">
                    <rect width="24" height="8" rx="2" fill="#F47722"/>
                    <text x="12" y="5.5" textAnchor="middle" fontSize="3.5" fill="white" fontWeight="bold">Nagad</text>
                  </svg>
                </div>
                
                {/* Rocket Logo */}
                <div className="w-12 h-8 bg-white rounded border border-gray-200 flex items-center justify-center shadow-sm">
                  <svg width="24" height="8" viewBox="0 0 24 8" fill="none">
                    <rect width="24" height="8" rx="2" fill="#8E44AD"/>
                    <text x="12" y="5.5" textAnchor="middle" fontSize="3.2" fill="white" fontWeight="bold">Rocket</text>
                  </svg>
                </div>
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                  maxLength="19"
                />
                <div className="absolute right-3 top-3">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Expiry Date</label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  value={paymentData.expiryDate}
                  onChange={handleExpiryDateChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                  maxLength="5"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">CVV</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="123"
                    value={paymentData.cvv}
                    onChange={(e) => handleInputChange('cvv', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                    maxLength="4"
                  />
                  <div className="absolute right-3 top-3">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Cardholder Name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={paymentData.cardholderName}
                onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Mobile Banking Details */}
      {paymentData.method === 'mobile' && (
        <div className="space-y-6 border-t border-gray-200 pt-6">
          <div className="bg-gradient-to-r from-pink-50 to-orange-50 rounded-xl p-4 border border-pink-100">
            <div className="flex items-center space-x-2 mb-2">
              <svg className="w-4 h-4 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-semibold text-pink-800">Mobile Banking Payment</span>
            </div>
            <p className="text-xs text-pink-600">Choose your preferred mobile banking service</p>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Mobile Number</label>
            <div className="relative">
              <input
                type="text"
                placeholder="01712345678"
                value={paymentData.mobileNumber}
                onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
              />
              <div className="absolute right-3 top-3">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-xl border border-yellow-200">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-yellow-800 mb-1">Payment Process</p>
                <p className="text-xs text-yellow-700">You will be redirected to your selected mobile banking app to complete the payment securely.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced PayPal Info */}
      {paymentData.method === 'paypal' && (
        <div className="border-t border-gray-200 pt-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h8.418c2.508 0 4.514.893 5.535 2.459 1.014 1.554 1.049 3.566-.093 5.533-.564.97-1.365 1.74-2.356 2.266C16.455 11.235 14.8 11.562 12.9 11.562H9.608c-.45 0-.852.308-.958.734l-1.572 6.3z"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Secure PayPal Checkout</h3>
              <p className="text-sm text-blue-700 mb-4">You will be redirected to PayPal to complete your payment securely using your PayPal account or any card linked to PayPal.</p>
              <div className="flex items-center justify-center space-x-4 text-xs text-blue-600">
                <div className="flex items-center space-x-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span>Secure</span>
                </div>
                <div className="flex items-center space-x-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Buyer Protection</span>
                </div>
                <div className="flex items-center space-x-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Fast Checkout</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentForm;