import React from 'react';

const BookingStages = ({ stage = 1 }) => {
  const stages = [
    { id: 1, title: "Booking Details" },
    { id: 2, title: "Payment & Review" },
    { id: 3, title: "Confirmation" },
  ];

  return (
    <div className="w-full bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          

          <div className="flex items-center w-full">
            {stages.map((stageItem, index) => {
              const isActive = stageItem.id === stage;
              const isCompleted = stageItem.id < stage;
              const isUpcoming = stageItem.id > stage;
              
              return (
                <React.Fragment key={stageItem.id}>
                  <div className="flex items-center justify-center space-x-3 flex-1">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                      transition-all duration-200
                      ${isCompleted 
                        ? 'bg-green-500 text-white' 
                        : isActive
                        ? 'bg-blue-700 text-white'
                        : 'bg-gray-200 text-gray-500'
                      }
                    `}>
                      {isCompleted ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        stageItem.id
                      )}
                    </div>

                    <span className={`
                      text-sm font-medium transition-colors duration-200
                      ${isActive 
                        ? 'text-blue-700 font-semibold' 
                        : isCompleted
                        ? 'text-gray-700'
                        : 'text-gray-400'
                      }
                    `}>
                      {stageItem.title}
                    </span>
                  </div>

                  {index < stages.length - 1 && (
                    <div className="flex-1 h-0.5 bg-gray-200 relative mx-4">
                      <div 
                        className={`
                          absolute left-0 top-0 h-full transition-all duration-300
                          ${stageItem.id < stage ? 'w-full bg-green-500' : 'w-0 bg-blue-700'}
                        `}
                      />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
};

export default BookingStages;