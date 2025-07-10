import React from 'react';
import { useNavigate } from 'react-router-dom';

const TestConfirmation = () => {
  const navigate = useNavigate();

  const handleTestConfirmation = () => {
    // Mock data for testing
    const mockState = {
      bookingDetails: {
        bookingReference: 'NF' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        totalAmount: 15000,
        paymentMethod: 'credit_card'
      },
      flight: {
        id: 1,
        flight_number: 'NF001',
        airline: 'NimbusFly',
        origin: 'DAC',
        destination: 'CTG',
        departure_time: '10:30',
        arrival_time: '14:15',
        departure_date: new Date().toISOString().split('T')[0],
        duration: '3h 45m',
        price: 12000,
        seatClass: 'Economy',
        adult: 1,
        child: 0,
        infant: 0
      },
      passengers: [
        {
          title: 'Mr.',
          first_name: 'John',
          last_name: 'Doe',
          email: 'john.doe@email.com',
          phone: '+8801234567890',
          passport_number: 'AB1234567',
          date_of_birth: '1990-01-01',
          nationality: 'Bangladeshi'
        }
      ],
      paymentData: {
        method: 'credit_card',
        cardNumber: '**** **** **** 1234',
        amount: 15000,
        transactionId: 'TXN' + Date.now()
      }
    };

    navigate('/confirmation', { state: mockState });
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Test Confirmation Page</h1>
        <p className="text-gray-600 mb-6">
          Click the button below to navigate to the confirmation page with mock booking data.
        </p>
        
        <button
          onClick={handleTestConfirmation}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Test Confirmation Page
        </button>
      </div>
    </div>
  );
};

export default TestConfirmation;
