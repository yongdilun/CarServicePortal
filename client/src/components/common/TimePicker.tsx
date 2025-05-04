import React, { useState, useEffect } from 'react';

interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
  name: string;
  id: string;
  required?: boolean;
  className?: string;
}

const TimePicker: React.FC<TimePickerProps> = ({
  value,
  onChange,
  name,
  id,
  required = false,
  className = ''
}) => {
  const [hours, setHours] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(0);

  // Parse the input value when it changes
  useEffect(() => {
    if (value) {
      const [hoursStr, minutesStr] = value.split(':');
      setHours(parseInt(hoursStr, 10));
      setMinutes(parseInt(minutesStr, 10));
    }
  }, [value]);

  // Format the time as HH:MM
  const formatTime = (h: number, m: number): string => {
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  // Handle direct input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
  };

  // Increment/decrement hours
  const adjustHours = (increment: boolean) => {
    let newHours = hours;
    if (increment) {
      newHours = (hours + 1) % 24;
    } else {
      newHours = (hours - 1 + 24) % 24;
    }
    setHours(newHours);
    onChange(formatTime(newHours, minutes));
  };

  // Increment/decrement minutes
  const adjustMinutes = (increment: boolean) => {
    let newMinutes = minutes;
    if (increment) {
      newMinutes = (minutes + 5) % 60;
    } else {
      newMinutes = (minutes - 5 + 60) % 60;
    }
    setMinutes(newMinutes);
    onChange(formatTime(hours, newMinutes));
  };

  return (
    <div className="flex items-center">
      <div className="relative flex-1">
        <input
          type="time"
          id={id}
          name={name}
          value={value}
          onChange={handleInputChange}
          className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${className}`}
          required={required}
        />
      </div>
      
      <div className="flex flex-col ml-2">
        <div className="flex">
          <button
            type="button"
            onClick={() => adjustHours(true)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-1 px-2 rounded-l text-xs"
          >
            H+
          </button>
          <button
            type="button"
            onClick={() => adjustMinutes(true)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-1 px-2 rounded-r text-xs"
          >
            M+
          </button>
        </div>
        <div className="flex mt-1">
          <button
            type="button"
            onClick={() => adjustHours(false)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-1 px-2 rounded-l text-xs"
          >
            H-
          </button>
          <button
            type="button"
            onClick={() => adjustMinutes(false)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-1 px-2 rounded-r text-xs"
          >
            M-
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimePicker;
