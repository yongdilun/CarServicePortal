import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getCustomerAppointments, cancelAppointment, Appointment } from '../../api/appointmentApi';
import { ConfirmationDialog, ActionMenu } from '../../components/ui';

const AppointmentList: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelSuccess, setCancelSuccess] = useState('');
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<number | null>(null);

  // Helper function to check if an appointment is in the past
  const isPast = (appointment: Appointment) => {
    if (!appointment.timeSlot) return false;

    const { timeYear, timeMonth, timeDay, timeClocktime } = appointment.timeSlot;
    const appointmentDateTime = new Date(timeYear, timeMonth - 1, timeDay);

    // Add the time component
    if (timeClocktime) {
      const [hours, minutes] = timeClocktime.split(':').map(Number);
      appointmentDateTime.setHours(hours, minutes);
    } else {
      // If no time specified, set to end of day to avoid marking future appointments as past
      appointmentDateTime.setHours(23, 59, 59);
    }

    const now = new Date();
    return appointmentDateTime < now;
  };

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const data = await getCustomerAppointments(user.id);

        // Sort appointments:
        // - Current/upcoming appointments: Sort by time (earliest on top)
        // - Past appointments: Sort by date and time (latest on top)
        const sortedAppointments = [...data].sort((a, b) => {
          // If both appointments have time slots
          if (a.timeSlot && b.timeSlot) {
            const aDate = new Date(a.timeSlot.timeYear, a.timeSlot.timeMonth - 1, a.timeSlot.timeDay);
            const bDate = new Date(b.timeSlot.timeYear, b.timeSlot.timeMonth - 1, b.timeSlot.timeDay);

            // Add time component
            if (a.timeSlot.timeClocktime) {
              const [hours, minutes] = a.timeSlot.timeClocktime.split(':').map(Number);
              aDate.setHours(hours, minutes);
            }

            if (b.timeSlot.timeClocktime) {
              const [hours, minutes] = b.timeSlot.timeClocktime.split(':').map(Number);
              bDate.setHours(hours, minutes);
            }

            const aIsPast = isPast(a);
            const bIsPast = isPast(b);

            // If one is past and one is upcoming, put upcoming first
            if (aIsPast && !bIsPast) return 1;
            if (!aIsPast && bIsPast) return -1;

            // If both are past, sort by most recent first
            if (aIsPast && bIsPast) {
              return bDate.getTime() - aDate.getTime();
            }

            // If both are upcoming, sort by earliest first
            return aDate.getTime() - bDate.getTime();
          }

          // If only one has a time slot, prioritize the one with a time slot
          if (a.timeSlot && !b.timeSlot) return -1;
          if (!a.timeSlot && b.timeSlot) return 1;

          // If neither has a time slot, sort by ID
          return a.appointmentId - b.appointmentId;
        });

        setAppointments(sortedAppointments);
        setError('');
      } catch (err: any) {
        setError('Failed to load appointments. ' + (err.response?.data?.error || err.message));
        console.error('Error fetching appointments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [user]);

  const handleCancelAppointment = (appointmentId: number) => {
    // Show the confirmation dialog
    setAppointmentToCancel(appointmentId);
    setShowCancelDialog(true);
  };

  const confirmCancelAppointment = async () => {
    if (!appointmentToCancel) return;

    try {
      setLoading(true);
      await cancelAppointment(appointmentToCancel);

      // Update the appointment status in the local state
      setAppointments(appointments.map(appointment =>
        appointment.appointmentId === appointmentToCancel
          ? { ...appointment, appointmentStatus: 'CANCELLED' }
          : appointment
      ));

      setCancelSuccess('Appointment cancelled successfully');
      setTimeout(() => setCancelSuccess(''), 3000);
    } catch (err: any) {
      setError('Failed to cancel appointment. ' + (err.response?.data?.error || err.message));
      console.error('Error cancelling appointment:', err);
    } finally {
      setLoading(false);
      setShowCancelDialog(false);
      setAppointmentToCancel(null);
    }
  };

  const formatDate = (appointment: Appointment) => {
    if (!appointment.timeSlot) return 'N/A';

    const { timeYear, timeMonth, timeDay } = appointment.timeSlot;
    const date = new Date(timeYear, timeMonth - 1, timeDay);

    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };

    return date.toLocaleDateString('en-US', options);
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return 'N/A';

    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Appointments</h1>
        <Link
          to="/customer/appointments/book"
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
        >
          Book Appointment
        </Link>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showCancelDialog}
        title="Cancel Appointment"
        message="Are you sure you want to cancel this appointment? This action cannot be undone."
        confirmText="Yes, Cancel Appointment"
        cancelText="No, Keep Appointment"
        onConfirm={confirmCancelAppointment}
        onCancel={() => {
          setShowCancelDialog(false);
          setAppointmentToCancel(null);
        }}
        type="danger"
      />

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
        </div>
      )}

      {cancelSuccess && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6">
          <p>{cancelSuccess}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : appointments.length === 0 ? (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6 text-center">
          <p className="text-gray-600 mb-4">
            You don't have any appointments yet.
          </p>
          <Link
            to="/customer/appointments/book"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded inline-block"
          >
            Book Your First Appointment
          </Link>
        </div>
      ) : (
        <div>
          {/* Upcoming Appointments */}
          <h2 className="text-xl font-semibold mb-4">Upcoming Appointments</h2>
          <div className="overflow-x-auto mb-8">
            <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 text-left">ID</th>
                  <th className="py-3 px-4 text-left">Service</th>
                  <th className="py-3 px-4 text-left">Date</th>
                  <th className="py-3 px-4 text-left">Time</th>
                  <th className="py-3 px-4 text-left">Location</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments
                  .filter(appointment => !isPast(appointment))
                  .map(appointment => (
                    <tr key={appointment.appointmentId} className="border-t hover:bg-gray-50">
                      <td className="py-3 px-4">{appointment.appointmentId}</td>
                      <td className="py-3 px-4">{appointment.service?.serviceType || 'N/A'}</td>
                      <td className="py-3 px-4">{formatDate(appointment)}</td>
                      <td className="py-3 px-4">{formatTime(appointment.timeSlot?.timeClocktime)}</td>
                      <td className="py-3 px-4">{appointment.outlet?.outletName || 'N/A'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(appointment.appointmentStatus)}`}>
                          {appointment.appointmentStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <ActionMenu
                          label="Actions"
                          size="sm"
                          variant="primary"
                          actions={[
                            {
                              label: "View Details",
                              onClick: () => window.location.href = `/customer/appointments/${appointment.appointmentId}`,
                              icon: (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              ),
                              color: "blue" as "blue"
                            },
                            ...(appointment.appointmentStatus === 'SCHEDULED' ? [
                              {
                                label: "Cancel Appointment",
                                onClick: () => handleCancelAppointment(appointment.appointmentId),
                                icon: (
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                ),
                                color: "red" as "red",
                                disabled: loading
                              }
                            ] : [])
                          ]}
                        />
                      </td>
                    </tr>
                  ))}
                {appointments.filter(appointment => !isPast(appointment)).length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-4 text-center text-gray-500">
                      No upcoming appointments. <Link to="/customer/appointments/book" className="text-blue-500 hover:underline">Book an appointment</Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Past Appointments */}
          <h2 className="text-xl font-semibold mb-4">Past Appointments</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 text-left">ID</th>
                  <th className="py-3 px-4 text-left">Service</th>
                  <th className="py-3 px-4 text-left">Date</th>
                  <th className="py-3 px-4 text-left">Time</th>
                  <th className="py-3 px-4 text-left">Location</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments
                  .filter(appointment => isPast(appointment))
                  .map(appointment => (
                    <tr key={appointment.appointmentId} className="border-t hover:bg-gray-50">
                      <td className="py-3 px-4">{appointment.appointmentId}</td>
                      <td className="py-3 px-4">{appointment.service?.serviceType || 'N/A'}</td>
                      <td className="py-3 px-4">{formatDate(appointment)}</td>
                      <td className="py-3 px-4">{formatTime(appointment.timeSlot?.timeClocktime)}</td>
                      <td className="py-3 px-4">{appointment.outlet?.outletName || 'N/A'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(appointment.appointmentStatus)}`}>
                          {appointment.appointmentStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <ActionMenu
                          label="Actions"
                          size="sm"
                          variant="primary"
                          actions={[
                            {
                              label: "View Details",
                              onClick: () => window.location.href = `/customer/appointments/${appointment.appointmentId}`,
                              icon: (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              ),
                              color: "blue" as "blue"
                            }
                          ]}
                        />
                      </td>
                    </tr>
                  ))}
                {appointments.filter(appointment => isPast(appointment)).length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-4 text-center text-gray-500">
                      No past appointments.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-8">
        <Link
          to="/customer/dashboard"
          className="text-blue-500 hover:underline"
        >
          &larr; Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default AppointmentList;
