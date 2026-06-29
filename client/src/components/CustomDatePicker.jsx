import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './CustomDatePicker.css';

const THEME_PRIMARY = '#01796F';

export function parseDisplayDate(str) {
  if (!str) return null;
  const match = str.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  const date = new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]));
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDisplayDate(date) {
  if (!date) return '';
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export function parseIsoDate(str) {
  if (!str) return null;
  const parts = str.split('-');
  if (parts.length !== 3) return null;
  const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatIsoDate(date) {
  if (!date) return '';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function parseMonthValue(str) {
  if (!str) return null;
  const parts = str.split('-');
  if (parts.length !== 2) return null;
  const date = new Date(Number(parts[0]), Number(parts[1]) - 1, 1);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatMonthValue(date) {
  if (!date) return '';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export default function CustomDatePicker({
  selectedDate,
  onChange,
  placeholder,
  minDate,
  maxDate,
  picker = 'date',
  hasError = false,
  className = '',
  id,
  disabled = false,
  isClearable = false,
}) {
  const isMonthPicker = picker === 'month';

  return (
    <DatePicker
      id={id}
      selected={selectedDate}
      onChange={onChange}
      minDate={minDate}
      maxDate={maxDate}
      disabled={disabled}
      isClearable={isClearable}
      dateFormat={isMonthPicker ? 'MM/yyyy' : 'dd/MM/yyyy'}
      showMonthYearPicker={isMonthPicker}
      placeholderText={placeholder || (isMonthPicker ? 'mm/yyyy' : 'dd/mm/yyyy')}
      className={`custom-react-datepicker-input ${hasError ? 'has-error' : ''} ${className}`.trim()}
      wrapperClassName="datepicker-full-width"
      calendarClassName="jobsmarket-datepicker"
      popperPlacement="bottom-start"
      showPopperArrow={false}
    />
  );
}

export { THEME_PRIMARY };
