import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function CustomDatePicker({ selectedDate, onChange, placeholder }) {
  return (
    <div style={{ width: '100%' }}>
      <DatePicker
        selected={selectedDate}
        onChange={onChange}
        minDate={new Date()}
        dateFormat="dd/MM/yyyy"
        placeholderText={placeholder || "Select a date"}
        className="custom-react-datepicker-input"
        wrapperClassName="datepicker-full-width"
      />
      <style>{`
        .datepicker-full-width {
          width: 100%;
          display: block;
        }
        .custom-react-datepicker-input {
          width: 100%;
          padding: 10px;
          border-radius: 5px;
          border: 1px solid #ccc;
          box-sizing: border-box;
          font-family: inherit;
          font-size: 14px;
          outline: none;
        }
        .custom-react-datepicker-input:focus {
          border-color: #01796F;
          box-shadow: 0 0 0 2px rgba(1, 121, 111, 0.2);
        }
      `}</style>
    </div>
  );
}