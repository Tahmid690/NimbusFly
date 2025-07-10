import React, { useEffect } from 'react';

const BillingAddress = ({ billingAddress, onUpdate, passengers }) => {
  const handleInputChange = (field, value) => {
    onUpdate(field, value);
  };

  const handleSameAsPassengerChange = (checked) => {
    onUpdate('sameAsPassenger', checked);
    
    if (checked && passengers && passengers.length > 0) {
      const primaryPassenger = passengers[0];
      onUpdate('firstName', primaryPassenger.first_name);
      onUpdate('lastName', primaryPassenger.last_name);
    } else if (!checked) {
      // Clear the form when unchecked
      onUpdate('firstName', '');
      onUpdate('lastName', '');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="sameAsPassenger"
          checked={billingAddress.sameAsPassenger}
          onChange={(e) => handleSameAsPassengerChange(e.target.checked)}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="sameAsPassenger" className="text-sm text-gray-700">
          Same as passenger details
        </label>
      </div>

      {!billingAddress.sameAsPassenger && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
              <input
                type="text"
                placeholder="Enter first name"
                value={billingAddress.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
              <input
                type="text"
                placeholder="Enter last name"
                value={billingAddress.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
            <input
              type="text"
              placeholder="Enter address"
              value={billingAddress.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:range-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
              <input
                type="text"
                placeholder="Enter city"
                value={billingAddress.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
              <input
                type="text"
                placeholder="Enter postal code"
                value={billingAddress.postalCode}
                onChange={(e) => handleInputChange('postalCode', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
            <select
              value={billingAddress.country}
              onChange={(e) => handleInputChange('country', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Bangladesh">Bangladesh</option>
              <option value="India">India</option>
              <option value="Pakistan">Pakistan</option>
              <option value="Nepal">Nepal</option>
              <option value="Sri Lanka">Sri Lanka</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      )}

      {billingAddress.sameAsPassenger && passengers && passengers.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-700 mb-2">Billing Address (Same as Passenger)</h4>
          <div className="text-sm text-gray-600">
            <p>{passengers[0].first_name} {passengers[0].last_name}</p>
            <p>{passengers[0].nationality}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingAddress;