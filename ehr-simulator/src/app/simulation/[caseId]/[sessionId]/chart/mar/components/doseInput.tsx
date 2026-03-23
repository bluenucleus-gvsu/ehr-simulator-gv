import { Input } from '@/components/ui/input';
import React, { useState, useEffect } from 'react';

interface DoseInputProps {
  dose: number;
  onDoseChange: (newDose: number) => void;
  isOverdose: boolean;
}

// Component to parse numerical dose from string input
export const DoseInput = ({ dose, onDoseChange, isOverdose }: DoseInputProps) => {
  const [inputValue, setInputValue] = useState<string>(dose ? dose.toString() : '');

  useEffect(() => {
    const parsedInput = Number(inputValue);
    if (!isNaN(parsedInput) && parsedInput !== dose) {
      setInputValue(dose.toString());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dose]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const regex = /^[0-9]*\.?[0-9]*$/;

    if (value === '' || regex.test(value)) {
      setInputValue(value);

      // Handle edge cases like empty string or a lone "." before casting
      if (value === '' || value === '.') {
        onDoseChange(0);
      } else {
        onDoseChange(Number(value));
      }
    }
  };

  return (
    <Input
      type="text"
      className={`text-sm w-16 border px-3 py-2 rounded-r-none shadow-xs ${isOverdose ? "ring-2 ring-red-700 focus-visible:ring-red-700 focus-visible:ring-2" : "focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:border-gray-200"} `}
      value={inputValue}
      onChange={handleChange}
      placeholder="0.0"
    />
  );
};