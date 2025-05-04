import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { getCurrentDateMalaysia, formatDateForInput, isToday, formatDate, formatTime } from '../../utils/dateUtils';

interface Appointment {
  appointmentId: number;
  customer: {
    custName: string;
  };
  service: {
    serviceType: string;
  };
  timeSlot: {
    timeClocktime: string;
  };
  appointmentStatus: string;
  appointmentDuration: number;
  estimatedFinishTime: string;
  vehicle?: {
    vehBrand: string;
    vehModel: string;
  };
}

const TimeSchedule: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // Initialize with today's date, regardless of time
  const [selectedDate, setSelectedDate] = useState<string>(formatDateForInput(getCurrentDateMalaysia()));
  const [currentTime, setCurrentTime] = useState<Date>(getCurrentDateMalaysia());

  // Business hours (8 AM to 6 PM) - extended for better visibility
  const businessHours = Array.from({ length: 11 }, (_, i) => i + 8);

  // Update current time every minute with Malaysia timezone
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getCurrentDateMalaysia());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // Import the staffApi dynamically to avoid circular dependencies
        const { getStaffSchedule } = await import('../../api/staffApi');

        // Use the staffApi to get the schedule
        const appointments = await getStaffSchedule(user.id, selectedDate);

        // Sort appointments by time
        const sortedAppointments = appointments.sort((a: Appointment, b: Appointment) => {
          return a.timeSlot.timeClocktime.localeCompare(b.timeSlot.timeClocktime);
        });

        setAppointments(sortedAppointments);
        setError('');
      } catch (err: any) {
        setError('Failed to load appointments. ' + (err.response?.data?.error || err.message));
        console.error('Error fetching appointments:', err);
        // Set empty appointments array to prevent UI from breaking
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [user, selectedDate]);

  // Format time for display (e.g., "09:00:00" -> "9:00 AM")
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Calculate appointment position and height in the schedule
  const getAppointmentStyle = (appointment: Appointment) => {
    // Parse start time
    const [startHours, startMinutes] = appointment.timeSlot.timeClocktime.split(':').map(Number);
    const startTimeInMinutes = startHours * 60 + startMinutes;

    // Calculate end time
    let endTimeInMinutes;

    if (appointment.estimatedFinishTime) {
      // If we have an estimated finish time, use that
      const [endHours, endMinutes] = appointment.estimatedFinishTime.split(':').map(Number);
      endTimeInMinutes = endHours * 60 + endMinutes;

      // Handle case where finish time is on the next day
      if (endTimeInMinutes < startTimeInMinutes) {
        endTimeInMinutes += 24 * 60; // Add 24 hours in minutes
      }
    } else {
      // Otherwise use the appointment duration
      endTimeInMinutes = startTimeInMinutes + (appointment.appointmentDuration || 60); // Default to 1 hour if no duration
    }

    // Business hours in minutes (8 AM to 6 PM = 8*60 to 18*60)
    const businessStartMinutes = 8 * 60;
    const businessEndMinutes = 18 * 60;
    const totalBusinessMinutes = businessEndMinutes - businessStartMinutes;

    // Calculate the total height of the schedule in pixels
    // Each hour is 128px (h-32 = 8rem = 128px)
    const hourHeight = 128;
    const totalScheduleHeight = hourHeight * businessHours.length;

    // Calculate position in pixels from the top
    const minutesFromStart = startTimeInMinutes - businessStartMinutes;
    const pixelsFromTop = (minutesFromStart / 60) * hourHeight;

    // Calculate height in pixels
    const durationInHours = (endTimeInMinutes - startTimeInMinutes) / 60;
    const heightInPixels = durationInHours * hourHeight;

    // Convert to percentages for positioning
    const startPercentage = (pixelsFromTop / totalScheduleHeight) * 100;
    const heightPercentage = (heightInPixels / totalScheduleHeight) * 100;

    // Ensure minimum height for visibility (at least 15 minutes)
    const minHeightPixels = (15 / 60) * hourHeight;
    const minHeightPercentage = (minHeightPixels / totalScheduleHeight) * 100;
    const adjustedHeightPercentage = Math.max(heightPercentage, minHeightPercentage);

    // Ensure the appointment doesn't extend beyond the schedule
    const maxHeight = 100 - startPercentage;
    const clampedHeight = Math.min(adjustedHeightPercentage, maxHeight);

    // Find overlapping appointments
    const overlappingAppointments = appointments.filter(a => {
      if (a.appointmentId === appointment.appointmentId) return false;

      const [aStartHours, aStartMinutes] = a.timeSlot.timeClocktime.split(':').map(Number);
      const aStartTimeInMinutes = aStartHours * 60 + aStartMinutes;

      let aEndTimeInMinutes;
      if (a.estimatedFinishTime) {
        const [aEndHours, aEndMinutes] = a.estimatedFinishTime.split(':').map(Number);
        aEndTimeInMinutes = aEndHours * 60 + aEndMinutes;
        if (aEndTimeInMinutes < aStartTimeInMinutes) {
          aEndTimeInMinutes += 24 * 60;
        }
      } else {
        aEndTimeInMinutes = aStartTimeInMinutes + a.appointmentDuration;
      }

      // Check if appointments overlap
      return (
        (startTimeInMinutes >= aStartTimeInMinutes && startTimeInMinutes < aEndTimeInMinutes) ||
        (endTimeInMinutes > aStartTimeInMinutes && endTimeInMinutes <= aEndTimeInMinutes) ||
        (startTimeInMinutes <= aStartTimeInMinutes && endTimeInMinutes >= aEndTimeInMinutes)
      );
    });

    // Calculate width and left position based on overlapping appointments
    const totalOverlapping = overlappingAppointments.length + 1; // +1 for current appointment
    const appointmentIndex = overlappingAppointments
      .filter(a => {
        const [aStartHours, aStartMinutes] = a.timeSlot.timeClocktime.split(':').map(Number);
        const aStartTimeInMinutes = aStartHours * 60 + aStartMinutes;
        return aStartTimeInMinutes < startTimeInMinutes;
      }).length;

    const width = totalOverlapping > 1 ? 90 / totalOverlapping : 90;
    const left = totalOverlapping > 1 ? 5 + (appointmentIndex * width) : 5;

    return {
      top: `${startPercentage}%`,
      height: `${clampedHeight}%`,
      position: 'absolute' as 'absolute',
      width: `${width}%`,
      left: `${left}%`,
      backgroundColor: getStatusColor(appointment.appointmentStatus),
      borderRadius: '6px',
      padding: '8px',
      overflow: 'hidden',
      color: '#fff',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      zIndex: 10,
      border: '1px solid rgba(255,255,255,0.2)',
      transition: 'all 0.2s ease'
    };
  };

  // Get color based on appointment status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'rgba(59, 130, 246, 0.9)'; // blue-500 with transparency
      case 'IN_PROGRESS':
        return 'rgba(245, 158, 11, 0.9)'; // amber-500 with transparency
      case 'COMPLETED':
        return 'rgba(16, 185, 129, 0.9)'; // emerald-500 with transparency
      case 'CANCELLED':
        return 'rgba(239, 68, 68, 0.9)'; // red-500 with transparency
      default:
        return 'rgba(107, 114, 128, 0.9)'; // gray-500 with transparency
    }
  };

  // Get status badge style
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS':
        return 'bg-amber-100 text-amber-800';
      case 'COMPLETED':
        return 'bg-emerald-100 text-emerald-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Navigate to previous day
  const goToPreviousDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() - 1);
    setSelectedDate(formatDateForInput(date));
  };

  // Navigate to next day
  const goToNextDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + 1);
    setSelectedDate(formatDateForInput(date));
  };

  // Check if selected date is today (using imported isToday function)
  const isTodaySelected = () => {
    return isToday(new Date(selectedDate));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Time Schedule</h1>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
        </div>
      )}

      {/* Date Navigation */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <button
              onClick={goToPreviousDay}
              className="bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 py-2 px-4 rounded inline-flex items-center transition-colors"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>

            <button
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-300 py-2 px-4 rounded inline-flex items-center transition-colors"
            >
              Today
            </button>

            <button
              onClick={goToNextDay}
              className="bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 py-2 px-4 rounded inline-flex items-center transition-colors"
            >
              Next
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="text-center flex items-center">
            <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h2 className="text-xl font-semibold text-gray-800">
              {formatDate(new Date(selectedDate))}
              {isTodaySelected() && <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">Today</span>}
            </h2>
          </div>

          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
          {/* Schedule Header */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 border-b">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-blue-800">
                    {appointments.length} {appointments.length === 1 ? 'Appointment' : 'Appointments'} Scheduled
                  </h3>
                  <p className="text-xs text-blue-600">
                    {isTodaySelected() ? 'Today' : formatDate(new Date(selectedDate))}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded text-sm flex items-center"
                  onClick={() => setSelectedDate(formatDateForInput(getCurrentDateMalaysia()))}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Today
                </button>
                <Link
                  to="/staff/appointments/book"
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded text-sm flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  New Appointment
                </Link>
              </div>
            </div>
          </div>

          {/* Schedule Grid */}
          <div className="flex">
            {/* Time Column */}
            <div className="w-20 border-r bg-gray-50">
              {businessHours.map(hour => (
                <div key={hour} className="h-32 border-b flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">
                    {hour % 12 || 12} {hour >= 12 ? 'PM' : 'AM'}
                  </span>
                </div>
              ))}
            </div>

            {/* Appointments Column */}
            <div className="flex-1 relative">
              {/* Hour Grid Lines */}
              {businessHours.map(hour => (
                <div key={hour} className="h-32 border-b relative">
                  {/* Hour label (right side) */}
                  <div className="absolute right-2 top-0 text-xs text-gray-400">
                    {hour % 12 || 12}:00 {hour >= 12 ? 'PM' : 'AM'}
                  </div>

                  {/* 15-minute markers */}
                  <div className="absolute w-full h-px bg-gray-100" style={{ top: '25%' }}>
                    <div className="absolute right-2 -top-2 text-xs text-gray-400">:15</div>
                  </div>

                  {/* Half-hour marker */}
                  <div className="absolute w-full h-px bg-gray-200" style={{ top: '50%' }}>
                    <div className="absolute right-2 -top-2 text-xs text-gray-400">:30</div>
                  </div>

                  {/* 45-minute markers */}
                  <div className="absolute w-full h-px bg-gray-100" style={{ top: '75%' }}>
                    <div className="absolute right-2 -top-2 text-xs text-gray-400">:45</div>
                  </div>
                </div>
              ))}

              {/* Current time indicator - only show for today */}
              {isTodaySelected() && (
                <div
                  className="absolute w-full h-0.5 bg-red-500 z-20 flex items-center"
                  style={{
                    top: (() => {
                      const currentHour = currentTime.getHours();
                      const currentMinute = currentTime.getMinutes();
                      const currentTimeInMinutes = currentHour * 60 + currentMinute;
                      const businessStartMinutes = 8 * 60;

                      // If current time is before business hours, position at top
                      if (currentTimeInMinutes < businessStartMinutes) {
                        return '0%';
                      }

                      // If current time is after business hours, position at bottom
                      const businessEndMinutes = 18 * 60;
                      if (currentTimeInMinutes > businessEndMinutes) {
                        return '100%';
                      }

                      // Calculate position based on current time
                      const hourHeight = 128; // h-32 = 8rem = 128px
                      const totalScheduleHeight = hourHeight * businessHours.length;
                      const minutesFromStart = currentTimeInMinutes - businessStartMinutes;
                      const pixelsFromTop = (minutesFromStart / 60) * hourHeight;
                      return `${(pixelsFromTop / totalScheduleHeight) * 100}%`;
                    })(),
                    left: 0
                  }}
                >
                  <div className="absolute -left-1 w-2 h-2 rounded-full bg-red-500"></div>
                  <div className="absolute -right-1 w-2 h-2 rounded-full bg-red-500"></div>
                </div>
              )}

              {/* Appointments */}
              {appointments.map(appointment => (
                <div
                  key={appointment.appointmentId}
                  style={getAppointmentStyle(appointment)}
                  className="cursor-pointer hover:opacity-95 hover:shadow-lg transition-all transform hover:-translate-y-0.5 group"
                  onClick={() => navigate(`/staff/appointments/${appointment.appointmentId}`)}
                >
                  {/* Time indicator dots */}
                  <div className="absolute -left-1 top-0 w-2 h-2 rounded-full bg-white"></div>
                  <div className="absolute -right-1 top-0 w-2 h-2 rounded-full bg-white"></div>

                  <div className="flex justify-between items-center">
                    <div className="font-semibold text-sm truncate">
                      {formatTime(appointment.timeSlot.timeClocktime)}
                      {appointment.estimatedFinishTime &&
                        <span> - {formatTime(appointment.estimatedFinishTime)}</span>
                      }
                    </div>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${getStatusBadge(appointment.appointmentStatus)}`}>
                      {appointment.appointmentStatus}
                    </span>
                  </div>

                  <div className="text-sm font-medium truncate mt-1 flex items-center">
                    <svg className="w-3 h-3 mr-1 text-white text-opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {appointment.customer.custName}
                  </div>

                  <div className="text-xs truncate flex items-center">
                    <svg className="w-3 h-3 mr-1 text-white text-opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    {appointment.service.serviceType}
                  </div>

                  {appointment.vehicle && (
                    <div className="text-xs truncate text-white text-opacity-90 flex items-center">
                      <svg className="w-3 h-3 mr-1 text-white text-opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 4H5a2 2 0 00-2 2v12a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2z" />
                      </svg>
                      {appointment.vehicle.vehBrand} {appointment.vehicle.vehModel}
                    </div>
                  )}

                  {appointment.appointmentDuration > 0 && !appointment.estimatedFinishTime && (
                    <div className="text-xs mt-1 bg-white bg-opacity-20 px-1.5 py-0.5 rounded-full inline-flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {Math.floor(appointment.appointmentDuration / 60)}h {appointment.appointmentDuration % 60}m
                    </div>
                  )}

                  {/* Quick action buttons - visible on hover */}
                  <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center items-center">
                    <button className="w-6 h-6 rounded-full bg-white text-gray-800 mb-1 flex items-center justify-center hover:bg-gray-200" title="View details">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {appointments.length === 0 && (
            <div className="p-12 text-center text-gray-500 bg-gray-50">
              <div className="bg-white rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center shadow-md">
                <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Appointments Scheduled</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">There are no appointments scheduled for {isTodaySelected() ? 'today' : formatDate(new Date(selectedDate))}.</p>
              <div className="flex justify-center space-x-4">
                <Link
                  to="/staff/appointments/book"
                  className="inline-flex items-center bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors shadow-sm"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Book New Appointment
                </Link>
                <button
                  onClick={() => setSelectedDate(formatDateForInput(getCurrentDateMalaysia()))}
                  className={`inline-flex items-center ${isTodaySelected() ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'} px-4 py-2 rounded-md transition-colors shadow-sm`}
                  disabled={isTodaySelected()}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  View Today
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 flex justify-between">
        <Link
          to="/staff/dashboard"
          className="text-blue-500 hover:underline"
        >
          &larr; Back to Dashboard
        </Link>

        <Link
          to="/staff/appointments"
          className="text-blue-500 hover:underline"
        >
          View All Appointments &rarr;
        </Link>
      </div>
    </div>
  );
};

export default TimeSchedule;
