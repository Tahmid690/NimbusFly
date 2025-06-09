import { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

export default function PriceRange({minprice,maxprice,onrangechange}) {
  // Configurable slider settings
  const sliderMin = minprice;
  const sliderMax = maxprice;
  const sliderStep = 1;
  

  const [rangeValues, setRangeValues] = useState([minprice, maxprice]);

  const [isExpanded, setIsExpanded] = useState(false);


  const handleRangeChange = (index, value) => {
    const newValue = parseFloat(value);
    const newRangeValues = [...rangeValues];
    newRangeValues[index] = newValue;
    onrangechange(newRangeValues);
    setRangeValues(newRangeValues);
  };

  const actualMin = Math.min(rangeValues[0], rangeValues[1]);
  const actualMax = Math.max(rangeValues[0], rangeValues[1]);

  const valueToPercentage = (value) => {
    return ((value - sliderMin) / (sliderMax - sliderMin)) * 100;
  };

  // Convert percentage to value
  const percentageToValue = (percentage) => {
    return sliderMin + (percentage / 100) * (sliderMax - sliderMin);
  };

  // Handle track click to move nearest thumb
  const handleTrackClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickPercentage = (clickX / rect.width) * 100;
    const clickValue = percentageToValue(clickPercentage);
    
    // Find which thumb is closer to the click
    const distanceToThumb0 = Math.abs(clickValue - rangeValues[0]);
    const distanceToThumb1 = Math.abs(clickValue - rangeValues[1]);
    
    // Move the closer thumb to the clicked position
    if (distanceToThumb0 <= distanceToThumb1) {
      setRangeValues([clickValue, rangeValues[1]]);
    } else {
      setRangeValues([rangeValues[0], clickValue]);
    }
  };

  const formatCurrency = (value) => {
    return `৳ ${Math.round(value).toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8 rounded">
      <style>{`
        .range-slider {
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
          pointer-events: none;
          position: absolute;
          width: 100%;
          height: 2px;
          top: 50%;
          transform: translateY(-50%);
        }

        .range-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          pointer-events: all;
          position: relative;
          z-index: 10;
        }

        .range-slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          pointer-events: all;
          position: relative;
          z-index: 10;
          -moz-appearance: none;
        }

        .range-slider::-webkit-slider-track {
          background: transparent;
          height: 2px;
        }

        .range-slider::-moz-range-track {
          background: transparent;
          height: 2px;
          border: none;
        }

        .range-slider:focus {
          outline: none;
        }

        .collapse-transition {
          transition: all 0.3s ease-in-out;
          overflow: hidden;
        }
      `}</style>

      <div className="max-w-md mx-auto bg-gray-800 rounded-lg">
        {/* Header with toggle */}
        <div 
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-700 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <h3 className="text-white font-medium text-lg">Price Range</h3>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>

        {/* Collapsible content */}
        <div className={`collapse-transition ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="px-4 pb-4 space-y-4">
            {/* Description text */}
            <p className="text-gray-300 text-sm">
              Starts from {formatCurrency(sliderMin)} - {formatCurrency(sliderMax)} against your search. Price is a subject to change.
            </p>

            {/* Slider container */}
            <div className="relative h-8 flex items-center">
              <div 
                className="absolute w-full h-1 bg-gray-600 rounded-lg cursor-pointer"
                onClick={handleTrackClick}
              ></div>
              <div 
                className="absolute h-1 bg-blue-500 rounded-lg pointer-events-none" 
                style={{ 
                  left: `${valueToPercentage(actualMin)}%`, 
                  width: `${valueToPercentage(actualMax) - valueToPercentage(actualMin)}%` 
                }}
              ></div>
              <input 
                type="range" 
                min={sliderMin} 
                max={sliderMax}
                step={sliderStep}
                value={rangeValues[0]} 
                onChange={(e) => handleRangeChange(0, e.target.value)} 
                className="range-slider" 
                style={{ zIndex: rangeValues[0] > rangeValues[1] ? 12 : 10 }}
              />
              <input 
                type="range" 
                min={sliderMin} 
                max={sliderMax}
                step={sliderStep}
                value={rangeValues[1]} 
                onChange={(e) => handleRangeChange(1, e.target.value)} 
                className="range-slider" 
                style={{ zIndex: rangeValues[1] > rangeValues[0] ? 12 : 10 }}
              />
            </div>

            {/* Price display */}
            <div className="text-center">
              <span className="text-gray-300 font-medium">
                BDT {Math.round(actualMin).toLocaleString()} - BDT {Math.round(actualMax).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}