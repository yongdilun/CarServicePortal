/**
 * Date and time utility functions for the application
 * Using Malaysia timezone (Asia/Kuala_Lumpur)
 */

// Malaysia timezone for date formatting
const MALAYSIA_TIMEZONE = 'Asia/Kuala_Lumpur';

/**
 * Format a date to a readable string with Malaysia timezone
 * @param date The date to format
 * @param options Formatting options
 * @returns Formatted date string
 */
export const formatDate = (date: Date, options: Intl.DateTimeFormatOptions = {}): string => {
  const defaultOptions: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    timeZone: MALAYSIA_TIMEZONE
  };
  
  return date.toLocaleDateString('en-MY', { ...defaultOptions, ...options });
};

/**
 * Format a time string (HH:MM:SS) to 12-hour format
 * @param timeString Time string in HH:MM:SS format
 * @returns Formatted time string (e.g., "2:30 PM")
 */
export const formatTime = (timeString?: string): string => {
  if (!timeString) return 'N/A';
  
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

/**
 * Get the current date in Malaysia timezone
 * @returns Current date in Malaysia timezone
 */
export const getCurrentDateMalaysia = (): Date => {
  const now = new Date();
  const malaysiaTime = new Date(now.toLocaleString('en-US', { timeZone: MALAYSIA_TIMEZONE }));
  return malaysiaTime;
};

/**
 * Format a date to YYYY-MM-DD format for input fields
 * @param date The date to format
 * @returns Date string in YYYY-MM-DD format
 */
export const formatDateForInput = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * Check if a date is today in Malaysia timezone
 * @param date The date to check
 * @returns True if the date is today
 */
export const isToday = (date: Date): boolean => {
  const today = getCurrentDateMalaysia();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
};

/**
 * Check if a date is in the past
 * @param date The date to check
 * @returns True if the date is in the past
 */
export const isPastDate = (date: Date): boolean => {
  const today = getCurrentDateMalaysia();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return date < today;
};

/**
 * Check if a date is in the future
 * @param date The date to check
 * @returns True if the date is in the future
 */
export const isFutureDate = (date: Date): boolean => {
  const today = getCurrentDateMalaysia();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return date > today;
};
