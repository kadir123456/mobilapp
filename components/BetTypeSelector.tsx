
import React from 'react';
import type { BetType } from '../types';
import { BET_TYPES } from '../constants';

interface BetTypeSelectorProps {
  selectedBetType: BetType | null;
  onSelectBetType: (betType: BetType) => void;
  disabled: boolean;
}

const BetTypeSelector: React.FC<BetTypeSelectorProps> = ({ selectedBetType, onSelectBetType, disabled }) => {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 gap-3 transition-opacity duration-300 ${disabled ? 'opacity-50 cursor-not-allowed' : 'opacity-100'}`}>
      {BET_TYPES.map((type) => (
        <button
          key={type.id}
          onClick={() => !disabled && onSelectBetType(type.id)}
          disabled={disabled}
          title={type.description}
          className={`p-4 rounded-lg text-center transition-all duration-200 transform hover:scale-105
            ${selectedBetType === type.id
              ? 'bg-green-500 text-white font-bold shadow-lg ring-2 ring-green-300'
              : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
            }`}
        >
          <span className="block text-md font-semibold">{type.name}</span>
        </button>
      ))}
    </div>
  );
};

export default BetTypeSelector;
