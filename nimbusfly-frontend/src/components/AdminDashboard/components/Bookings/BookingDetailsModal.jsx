import React, { useState, useEffect } from 'react';
import { X, User, Phone, Mail, MapPin, Calendar, Clock, Plane, Users, CreditCard, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import axios from 'axios';

const BookingDetailsModal = ({ booking, isOpen, onClose, onStatusUpdate }) => {
  const [bookingDetails, setBookingDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (isOpen && booking) {
      fetchBookingDetails();
    }
  }, [isOpen, booking]);

  const fetchBookingDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching booking details for ID:', booking.booking_id);
      const response = await axios.get(`http://localhost:3000/admin/admin/booking/${booking.booking_id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
      });
      
      console.log('Booking details response:', response.data);
      
      if (response.data.success) {
        console.log(response.data.data);
        setBookingDetails(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch booking details');
      }
    } catch (err) {
      console.error('Error fetching booking details:', err);
      setError(err.response?.data?.message || 'Error fetching booking details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PAID': return 'text-green-600 bg-green-100';
      case 'CANCELLED': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PAID': return <CheckCircle className="w-4 h-4" />;
      case 'CANCELLED': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4 pt-20">
      <div className="bg-white/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[calc(100vh-15rem)] overflow-y-auto my-4">
        {/* Header */}
        <div className=" top-0 bg-white/80 backdrop-blur-xl border-b border-white/20 p-6 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Booking Details</h2>
            <p className="text-gray-600">Booking ID: {booking?.booking_id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading booking details...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          {bookingDetails && (
            <div className="space-y-6">
              {/* Booking Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/60 backdrop-blur-sm border border-white/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Booking Information
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Booking Date:</span>
                      <span className="font-medium">{formatDate(bookingDetails.booking.booking_date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Trip Type:</span>
                      <span className="font-medium">{bookingDetails.booking.trip_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="font-medium text-green-600">{formatCurrency(bookingDetails.booking.total_amount)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(bookingDetails.booking.payment_status)}`}>
                        {getStatusIcon(bookingDetails.booking.payment_status)}
                        <span className="ml-1 capitalize">{bookingDetails.booking.payment_status}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/60 backdrop-blur-sm border border-white/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Customer Information
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-gray-500 mr-2" />
                      <span>{bookingDetails.booking.customer_name}</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 text-gray-500 mr-2" />
                      <span>{bookingDetails.booking.customer_email}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 text-gray-500 mr-2" />
                      <span>{bookingDetails.booking.customer_phone}</span>
                    </div>
                    {bookingDetails.booking.customer_address && (
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-gray-500 mr-2" />
                        <span>{bookingDetails.booking.customer_address}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>



              {/* Flight Details */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Plane className="w-5 h-5 mr-2" />
                  Flight Details
                </h3>
                <div className="space-y-4">
                  {bookingDetails.tickets.map((ticket, index) => (
                    <div key={index} className="bg-white/60 backdrop-blur-sm border border-white/30 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Flight {ticket.flight_number}</h4>
                          <div className="space-y-1 text-sm">
                            <p><span className="text-gray-600">Route:</span> {ticket.origin_code} → {ticket.destination_code}</p>
                            <p><span className="text-gray-600">Departure:</span> {formatDate(ticket.departure_time)}</p>
                            <p><span className="text-gray-600">Arrival:</span> {formatDate(ticket.arrival_time)}</p>
                            <p><span className="text-gray-600">Aircraft:</span> {ticket.aircraft_model}</p>
                            <p><span className="text-gray-600">Airline:</span> {ticket.airline_name}</p>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Passenger & Seat</h4>
                          <div className="space-y-1 text-sm">
                            <p><span className="text-gray-600">Passenger:</span> {ticket.passenger_first_name} {ticket.passenger_last_name}</p>
                            <p><span className="text-gray-600">Seat:</span> {ticket.seat_number} ({ticket.seat_class})</p>
                            <p><span className="text-gray-600">Nationality:</span> {ticket.nationality}</p>
                            <p><span className="text-gray-600">Passport:</span> {ticket.passport_number}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment History */}
              {bookingDetails.payments && bookingDetails.payments.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Payment History
                  </h3>
                  <div className="space-y-2">
                    {bookingDetails.payments.map((payment, index) => (
                      <div key={index} className="bg-white/60 backdrop-blur-sm border border-white/30 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{formatCurrency(bookingDetails.booking.total_amount)}</p>
                            <p className="text-sm text-gray-600">
                              {payment.payment_method} • {formatDate(payment.payment_date)}
                            </p>
                            <p className="text-xs text-gray-500">Transaction ID: {payment.transaction_id}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            payment.status === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {payment.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsModal;