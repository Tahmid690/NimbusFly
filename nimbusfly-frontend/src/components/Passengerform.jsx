import React, { useState } from 'react';
import { ChevronUp, ChevronDown, X, Search } from 'lucide-react';

const PassengerForm = ({ index,update,adult,passengerData,savedtraveller }) => {


  const [isExpanded, setIsExpanded] = useState(true);
  const [travelerDropdownOpen, setTravelerDropdownOpen] = useState(false);
  const [travelerSearchTerm, setTravelerSearchTerm] = useState('');
  const [selected,setselected]=useState(true);
  const handleInputChange = (field, value) => {
    update(index,field,value);
  };

  const savedTravelers =savedtraveller||[]

  const filteredTravelers = savedTravelers.filter(traveler =>
    String(traveler.name).toLowerCase().includes(travelerSearchTerm.toLowerCase())
  );

  const handleTravelerSearch = (value) => {
    setTravelerSearchTerm(value);
    setTravelerDropdownOpen(true);
    handleInputChange('selected_traveler', value);
  };

  const handletoggle = () => {
  setselected((prev) => {
    const newVal = !prev;
    update(index, 'is_new', newVal);
    return newVal;
  });
};


  const handleTravelerSelect = (traveler) => {
    setTravelerSearchTerm(traveler.name);
    setTravelerDropdownOpen(false);
    handleInputChange('selected_traveler', traveler.name);
    handleInputChange('first_name', traveler.first_name);
    handleInputChange('last_name', traveler.last_name);
    const formattedDob = traveler.date_of_birth 
    ? traveler.date_of_birth.split('T')[0] 
    : '';
    handleInputChange('date_of_birth', formattedDob);
    handleInputChange('passport_number', traveler.passport_number);
    handleInputChange('nationality', traveler.nationality);
  //  ontraveller(index,traveler);
  };


const nationalities = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda',
  'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan',
  'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan',
  'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi',
  'Cabo Verde', 'Cambodia', 'Cameroon', 'Canada', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia',
  'Comoros', 'Congo (Congo-Brazzaville)', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czechia',
  'Democratic Republic of the Congo', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic',
  'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia',
  'Fiji', 'Finland', 'France',
  'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana',
  'Haiti', 'Honduras', 'Hungary',
  'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy',
  'Jamaica', 'Japan', 'Jordan',
  'Kazakhstan', 'Kenya', 'Kiribati', 'Kuwait', 'Kyrgyzstan',
  'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg',
  'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania',
  'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar',
  'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea',
  'North Macedonia', 'Norway',
  'Oman',
  'Pakistan', 'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland',
  'Portugal',
  'Qatar',
  'Romania', 'Russia', 'Rwanda',
  'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino',
  'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore',
  'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'South Korea', 'South Sudan', 'Spain',
  'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria',
  'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia',
  'Turkey', 'Turkmenistan', 'Tuvalu',
  'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan',
  'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam',
  'Yemen',
  'Zambia', 'Zimbabwe'
];


  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-200 mb-4">
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 rounded-t-lg transition-colors duration-200"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
            {index+1}
          </div>
          <div>
            <span className="text-lg font-semibold text-gray-900">Passenger {index+1}</span>
            {adult? <span className="ml-2 text-blue-600 font-medium">Adult</span>:<span className="ml-2 text-blue-600 font-medium">Child</span>}
            <span className="ml-2 text-gray-500">Primary Contact</span>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400 transition-all duration-300" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400 transition-all duration-300" />
        )}
      </div>

      {/* Form Content with Smooth Transition */}
      <div 
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pb-6 transform transition-transform duration-300">
          {/* Searchable Traveler List Dropdown */}
          <div className="mb-6 relative">
            <label className="block text-sm text-gray-600 mb-2">
              Select from 'Traveler List'
            </label>
            <div className="relative">
              <input
                type="text"
                value={travelerSearchTerm}
                onChange={(e) => handleTravelerSearch(e.target.value)}
                onFocus={() => setTravelerDropdownOpen(true)}
                className="w-full p-3 pl-10 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
                placeholder="Search or select traveler..."
                required
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              
              {/* Dropdown Menu */}
              {travelerDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  {filteredTravelers.length > 0 ? (
                    <>
                      {filteredTravelers.map((traveler) => (
                        <div
                          key={traveler.id}
                          onClick={() => handleTravelerSelect(traveler)}
                          className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-150"
                        >
                          <div className="font-medium text-gray-900">{traveler.name}</div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="px-4 py-3 text-gray-500 text-sm">
                      {travelerSearchTerm ? 'No travelers found' : 'No saved travelers'}
                    </div>
                  )}
                  
                  {/* Close dropdown option */}
                  <div
                    onClick={() => setTravelerDropdownOpen(false)}
                    className="px-4 py-2 text-center text-sm text-blue-600 hover:bg-blue-50 cursor-pointer border-t border-gray-100"
                  >
                    Close
                  </div>
                </div>
              )}
            </div>
            
            {/* Click outside to close dropdown */}
            {travelerDropdownOpen && (
              <div
                className="fixed inset-0 z-5"
                onClick={() => setTravelerDropdownOpen(false)}
              />
            )}
          </div>

          {/* Personal Details Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Personal Details</h3>
            <p className="text-sm text-gray-500 mb-4">As mentioned on your passport or government approved IDs</p>

            {/* Title Selection */}
          {
            adult?
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Title</label>
              <div className="flex gap-2">
                {['MR.', 'MS.', 'MRS.'].map((title) => (
                  <button
                    key={title}
                    type="button"
                    onClick={() => handleInputChange('title', title)}
                    className={`px-4 py-2 border rounded-md text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                      passengerData.title === title
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-blue-300'
                    }`}
                  >
                    {title}
                  </button>
                ))}
              </div>
            </div>:
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Title</label>
              <div className="flex gap-2">
                {['MASTER.', 'MISS.'].map((title) => (
                  <button
                    key={title}
                    type="button"
                    onClick={() => handleInputChange('title', title)}
                    className={`px-4 py-2 border rounded-md text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                      passengerData.title === title
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-blue-300'
                    }`}
                  >
                    {title}
                  </button>
                ))}
              </div>
            </div>
           }
            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Given Name / First Name
                </label>
                <input
                  type="text"
                  value={passengerData.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
                  placeholder="Enter first name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={passengerData.last_name}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
                  placeholder="Enter last name"
                  required
                />
              </div>
            </div>

            {/* Date of Birth and Passport */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={passengerData.date_of_birth}
                  onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Passport Number
                </label>
                <input
                  type="text"
                  value={passengerData.passport_number}
                  onChange={(e) => handleInputChange('passport_number', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
                  placeholder="Enter passport number"
                  required
                />
              </div>
            </div>

            {/* Nationality */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nationality
              </label>
              <div className="relative">
                <select
                  value={passengerData.nationality}
                  onChange={(e) => handleInputChange('nationality', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none transition-all duration-200 hover:border-blue-300"
                >
                  {nationalities.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <X className="w-4 h-4 text-gray-400 transition-transform duration-200" />
                </div>
              </div>
            </div>
          </div>

          {/* Save to Traveler List */}
          <div className="flex items-center">
            <input
              type="checkbox"
              
              onChange={()=>handletoggle()}
              checked={selected}
              id={`save-traveler-${index}`}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 transition-all duration-200"
              required
            />
            <label htmlFor={`save-traveler-${index}`} className="ml-2 text-sm text-blue-600 cursor-pointer hover:text-blue-700 transition-colors duration-200">
              Save this to my traveler list.
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};


export default PassengerForm;