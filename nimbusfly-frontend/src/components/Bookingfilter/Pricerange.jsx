import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

export default function PriceRange({
  minprice = 0,
  maxprice = 1000,
  rangeValues = [100, 800],
  setRangeValues,
}) {
  const sliderMin = minprice;
  const sliderMax = maxprice;
  const sliderStep = 1;

  const [isExpanded, setIsExpanded] = useState(false);

  const [localRangeValues, setLocalRangeValues] = useState(rangeValues);
  const currentRangeValues = setRangeValues ? rangeValues : localRangeValues;
  const updateRangeValues = setRangeValues || setLocalRangeValues;

  const actualMin = Math.min(currentRangeValues[0], currentRangeValues[1]);
  const actualMax = Math.max(currentRangeValues[0], currentRangeValues[1]);

  const handleRangeChange = (index, value) => {
    const newValue = parseFloat(value);
    const newRangeValues = [...currentRangeValues];

    if (index === 0) {
      newRangeValues[0] = Math.min(newValue, currentRangeValues[1]);
    } else {
      newRangeValues[1] = Math.max(newValue, currentRangeValues[0]);
    }

    updateRangeValues(newRangeValues);
  };

  const valueToPercentage = (value) => {
    return ((value - sliderMin) / (sliderMax - sliderMin)) * 100;
  };

  const percentageToValue = (percentage) => {
    return sliderMin + (percentage / 100) * (sliderMax - sliderMin);
  };

  const handleTrackClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickPercentage = (clickX / rect.width) * 100;
    const clickValue = percentageToValue(clickPercentage);

    const distanceToThumb0 = Math.abs(clickValue - currentRangeValues[0]);
    const distanceToThumb1 = Math.abs(clickValue - currentRangeValues[1]);

    if (distanceToThumb0 <= distanceToThumb1) {
      const newValue = Math.min(clickValue, currentRangeValues[1]);
      updateRangeValues([newValue, currentRangeValues[1]]);
    } else {
      const newValue = Math.max(clickValue, currentRangeValues[0]);
      updateRangeValues([currentRangeValues[0], newValue]);
    }
  };

  const formatCurrency = (value) => {
    return `৳ ${Math.round(value).toLocaleString()}`;
  };

  return (
    <div className="max-w-md mx-auto bg-gradient-to-br from-sky-50 to-blue-100 p-3">
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
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #0ea5e9, #0284c7);
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(14, 165, 233, 0.4), 0 2px 4px rgba(0,0,0,0.1);
          pointer-events: all;
          position: relative;
          z-index: 10;
          transition: all 0.2s ease;
        }

        .range-slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 16px rgba(14, 165, 233, 0.5), 0 4px 8px rgba(0,0,0,0.15);
        }

        .range-slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #0ea5e9, #0284c7);
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(14, 165, 233, 0.4), 0 2px 4px rgba(0,0,0,0.1);
          pointer-events: all;
          position: relative;
          z-index: 10;
          -moz-appearance: none;
          transition: all 0.2s ease;
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
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
        }

        .glass-effect {
          backdrop-filter: blur(10px);
          background: rgba(255, 255, 255, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
      `}</style>

      <div className="max-w-md mx-auto glass-effect rounded-2xl shadow-xl border border-white/20">
        {/* Header with toggle */}
        <div
          className="flex items-center justify-between p-6 cursor-pointer hover:bg-white/20 transition-all duration-200 rounded-t-2xl group"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <h3 className="text-slate-700 font-semibold text-xl flex items-center gap-2">
            <div className="w-2 h-2 bg-gradient-to-r from-sky-400 to-blue-500 rounded-full"></div>
            Price Range
          </h3>
          <div className="p-2 rounded-full group-hover:bg-sky-100 transition-colors">
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-sky-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-sky-600" />
            )}
          </div>
        </div>

        {/* Collapsible content */}
        <div
          className={`collapse-transition ${
            isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="px-6 pb-6 space-y-6">
            {/* Description text */}
            <div className="bg-gradient-to-r from-sky-50 to-blue-50 p-4 rounded-xl border border-sky-100">
              <p className="text-slate-600 text-sm leading-relaxed">
                Starts from {formatCurrency(sliderMin)} -{" "}
                {formatCurrency(sliderMax)} against your search.
                <span className="block text-xs text-sky-600 mt-1 font-medium">
                  Price is subject to change
                </span>
              </p>
            </div>

            {/* Slider container */}
            <div className="relative h-12 flex items-center px-2">
              <div
                className="absolute w-full h-2 bg-gradient-to-r from-slate-200 to-slate-300 rounded-full cursor-pointer shadow-inner"
                onClick={handleTrackClick}
              ></div>
              <div
                className="absolute h-2 bg-gradient-to-r from-sky-400 via-sky-500 to-blue-500 rounded-full pointer-events-none shadow-lg"
                style={{
                  left: `${valueToPercentage(actualMin)}%`,
                  width: `${
                    valueToPercentage(actualMax) - valueToPercentage(actualMin)
                  }%`,
                }}
              ></div>
              <input
                type="range"
                min={sliderMin}
                max={sliderMax}
                step={sliderStep}
                value={currentRangeValues[0]}
                onChange={(e) => handleRangeChange(0, e.target.value)}
                className="range-slider"
                style={{
                  zIndex:
                    currentRangeValues[0] > currentRangeValues[1] ? 12 : 10,
                }}
              />
              <input
                type="range"
                min={sliderMin}
                max={sliderMax}
                step={sliderStep}
                value={currentRangeValues[1]}
                onChange={(e) => handleRangeChange(1, e.target.value)}
                className="range-slider"
                style={{
                  zIndex:
                    currentRangeValues[1] > currentRangeValues[0] ? 12 : 10,
                }}
              />
            </div>

            {/* Price display */}
            <div className="text-center bg-white rounded-xl p-4 shadow-sm border border-sky-100">
              <div className="text-xs text-sky-600 font-medium mb-1">
                Selected Range
              </div>
              <span className="text-slate-700 font-bold text-lg bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
                BDT {Math.round(actualMin).toLocaleString()} - BDT{" "}
                {Math.round(actualMax).toLocaleString()}
              </span>
            </div>

            {/* Min/Max labels */}
            <div className="flex justify-between text-xs text-slate-500 px-2">
              <span className="bg-white px-2 py-1 rounded-md shadow-sm border border-sky-100">
                Min: {formatCurrency(sliderMin)}
              </span>
              <span className="bg-white px-2 py-1 rounded-md shadow-sm border border-sky-100">
                Max: {formatCurrency(sliderMax)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
