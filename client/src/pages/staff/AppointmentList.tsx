import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from '../../api/axios';
import { Appointment } from '../../api/appointmentApi';
import { ActionMenu, ConfirmationDialog } from '../../components/ui';

const StaffAppointments: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialFilter = queryParams.get('filter') || 'all';

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState(initialFilter); // all, today, upcoming, completed, cancelled, in-progress
  const [updateSuccess, setUpdateSuccess] = useState('');

  // Confirmation dialog state
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingStatusUpdate, setPendingStatusUpdate] = useState<{appointmentId: number, status: string} | null>(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // First try to get appointments for this specific staff
        let response;
        try {
          response = await axios.get(`/api/staff/appointments?staffId=${user.id}`);
        } catch (staffError) {
          console.warn('Could not fetch staff-specific appointments, falling back to all appointments', staffError);

          // If that fails, try to get all appointments (fallback)
          response = await axios.get('/api/staff/appointments');
        }

        // Process the data
        if (response && response.data) {
          console.log('Fetched appointments:', response.data);
          setAppointments(response.data);
          setError('');
        } else {
          throw new Error('No appointment data received');
        }
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
  }, [user]);

  const handleUpdateStatus = (appointmentId: number, newStatus: string) => {
    // If cancelling, show confirmation dialog
    if (newStatus === 'CANCELLED') {
      setPendingStatusUpdate({ appointmentId, status: newStatus });
      setShowConfirmDialog(true);
      return;
    }

    // Otherwise, proceed with the update
    updateAppointmentStatus(appointmentId, newStatus);
  };

  const updateAppointmentStatus = async (appointmentId: number, newStatus: string) => {
    try {
      setLoading(true);
      await axios.put(`/api/staff/appointments/${appointmentId}/status`, { status: newStatus });

      // Update the appointment status in the local state
      setAppointments(appointments.map(appointment =>
        appointment.appointmentId === appointmentId
          ? { ...appointment, appointmentStatus: newStatus }
          : appointment
      ));

      setUpdateSuccess(`Appointment #${appointmentId} status updated to ${newStatus}`);
      setTimeout(() => setUpdateSuccess(''), 3000);
    } catch (err: any) {
      setError('Failed to update appointment status. ' + (err.response?.data?.error || err.message));
      console.error('Error updating appointment status:', err);
    } finally {
      setLoading(false);
      setShowConfirmDialog(false);
      setPendingStatusUpdate(null);
    }
  };

  const formatDate = (appointment: Appointment) => {
    if (!appointment.timeSlot) return 'N/A';

    const { timeYear, timeMonth, timeDay } = appointment.timeSlot;
    const date = new Date(timeYear, timeMonth - 1, timeDay);

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
      case 'PENDING':
        return 'bg-purple-100 text-purple-800';
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

  const isToday = (appointment: Appointment) => {
    if (!appointment.timeSlot) return false;

    const { timeYear, timeMonth, timeDay } = appointment.timeSlot;
    const appointmentDate = new Date(timeYear, timeMonth - 1, timeDay);
    const today = new Date();

    return appointmentDate.getDate() === today.getDate() &&
      appointmentDate.getMonth() === today.getMonth() &&
      appointmentDate.getFullYear() === today.getFullYear();
  };

  const isUpcoming = (appointment: Appointment) => {
    if (!appointment.timeSlot) return false;

    const { timeYear, timeMonth, timeDay } = appointment.timeSlot;
    const appointmentDate = new Date(timeYear, timeMonth - 1, timeDay);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return appointmentDate > today;
  };

  // Helper function to check if an appointment is in the past
  const isPast = (appointment: Appointment) => {
    if (!appointment.timeSlot) return false;

    const { timeYear, timeMonth, timeDay, timeClocktime } = appointment.timeSlot;
    const appointmentDateTime = new Date(timeYear, timeMonth - 1, timeDay);

    // Add the time component
    if (timeClocktime) {
      const [hours, minutes] = timeClocktime.split(':').map(Number);
      appointmentDateTime.setHours(hours, minutes);
    }

    const now = new Date();
    return appointmentDateTime < now;
  };

  // Filter appointments based on selected filter
  const filteredAppointments = appointments.filter(appointment => {
    switch (filter) {
      case 'today':
        return isToday(appointment);
      case 'upcoming':
        return isUpcoming(appointment) && appointment.appointmentStatus === 'SCHEDULED';
      case 'completed':
        return appointment.appointmentStatus === 'COMPLETED';
      case 'cancelled':
        return appointment.appointmentStatus === 'CANCELLED';
      case 'in-progress':
        return appointment.appointmentStatus === 'IN_PROGRESS';
      case 'pending':
        return appointment.appointmentStatus === 'PENDING';
      case 'past':
        return isPast(appointment);
      default:
        return true;
    }
  });

  // Sort appointments:
  // - Current/upcoming appointments: Sort by time (earliest on top)
  // - Past appointments: Sort by date and time (latest on top)
  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Appointment Management</h1>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showConfirmDialog}
        title="Cancel Appointment"
        message="Are you sure you want to cancel this appointment? This action cannot be undone."
        confirmText="Yes, Cancel Appointment"
        cancelText="No, Keep Appointment"
        onConfirm={() => pendingStatusUpdate && updateAppointmentStatus(pendingStatusUpdate.appointmentId, pendingStatusUpdate.status)}
        onCancel={() => {
          setShowConfirmDialog(false);
          setPendingStatusUpdate(null);
        }}
        type="danger"
      />

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
        </div>
      )}

      {updateSuccess && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6">
          <p>{updateSuccess}</p>
        </div>
      )}

      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full ${
              filter === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('today')}
            className={`px-4 py-2 rounded-full ${
              filter === 'today'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-full ${
              filter === 'pending'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-4 py-2 rounded-full ${
              filter === 'upcoming'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter('in-progress')}
            className={`px-4 py-2 rounded-full ${
              filter === 'in-progress'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            In Progress
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-full ${
              filter === 'completed'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setFilter('cancelled')}
            className={`px-4 py-2 rounded-full ${
              filter === 'cancelled'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            Cancelled
          </button>
          <button
            onClick={() => setFilter('past')}
            className={`px-4 py-2 rounded-full ${
              filter === 'past'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            Past
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6 text-center">
          <p className="text-gray-600 mb-4">
            No appointments found for the selected filter.
          </p>
        </div>
      ) : filter !== 'all' && filter !== 'past' ? (
        // When a specific filter (except 'all' and 'past') is selected, show the appointments in a single table
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left">ID</th>
                <th className="py-3 px-4 text-left">Customer</th>
                <th className="py-3 px-4 text-left">Service</th>
                <th className="py-3 px-4 text-left">Vehicle</th>
                <th className="py-3 px-4 text-left">Date</th>
                <th className="py-3 px-4 text-left">Time</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedAppointments.map(appointment => (
                <tr key={appointment.appointmentId} className="border-t hover:bg-gray-50">
                  <td className="py-3 px-4">{appointment.appointmentId}</td>
                  <td className="py-3 px-4">{appointment.customer?.custName || 'N/A'}</td>
                  <td className="py-3 px-4">{appointment.service?.serviceType || 'N/A'}</td>
                  <td className="py-3 px-4">{appointment.vehicle ? `${appointment.vehicle.vehBrand} ${appointment.vehicle.vehModel}` : 'N/A'}</td>
                  <td className="py-3 px-4">{formatDate(appointment)}</td>
                  <td className="py-3 px-4">{formatTime(appointment.timeSlot?.timeClocktime)}</td>
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
                          onClick: () => window.location.href = `/staff/appointments/${appointment.appointmentId}`,
                          icon: (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          ),
                          color: "blue"
                        },
                        ...(appointment.appointmentStatus === 'PENDING' ? [
                          {
                            label: "Confirm Appointment",
                            onClick: () => window.location.href = `/staff/appointments/${appointment.appointmentId}`,
                            icon: (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ),
                            color: "purple"
                          }
                        ] : []),
                        ...(appointment.appointmentStatus === 'SCHEDULED' ? [
                          {
                            label: "Start Service",
                            onClick: () => handleUpdateStatus(appointment.appointmentId, 'IN_PROGRESS'),
                            icon: (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            ),
                            color: "yellow",
                            disabled: loading
                          }
                        ] : []),
                        ...(appointment.appointmentStatus === 'IN_PROGRESS' ? [
                          {
                            label: "Complete Service",
                            onClick: () => handleUpdateStatus(appointment.appointmentId, 'COMPLETED'),
                            icon: (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            ),
                            color: "green",
                            disabled: loading
                          }
                        ] : []),
                        ...((appointment.appointmentStatus === 'SCHEDULED' || appointment.appointmentStatus === 'IN_PROGRESS') ? [
                          {
                            label: "Cancel Appointment",
                            onClick: () => handleUpdateStatus(appointment.appointmentId, 'CANCELLED'),
                            icon: (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            ),
                            color: "red",
                            disabled: loading
                          }
                        ] : [])
                      ]}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : filter === 'past' ? (
        // When "Past" filter is selected, show only past appointments
        <div>
          <h2 className="text-xl font-semibold mb-4">Past Appointments</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 text-left">ID</th>
                  <th className="py-3 px-4 text-left">Customer</th>
                  <th className="py-3 px-4 text-left">Service</th>
                  <th className="py-3 px-4 text-left">Vehicle</th>
                  <th className="py-3 px-4 text-left">Date</th>
                  <th className="py-3 px-4 text-left">Time</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedAppointments.map(appointment => (
                  <tr key={appointment.appointmentId} className="border-t hover:bg-gray-50">
                    <td className="py-3 px-4">{appointment.appointmentId}</td>
                    <td className="py-3 px-4">{appointment.customer?.custName || 'N/A'}</td>
                    <td className="py-3 px-4">{appointment.service?.serviceType || 'N/A'}</td>
                    <td className="py-3 px-4">{appointment.vehicle ? `${appointment.vehicle.vehBrand} ${appointment.vehicle.vehModel}` : 'N/A'}</td>
                    <td className="py-3 px-4">{formatDate(appointment)}</td>
                    <td className="py-3 px-4">{formatTime(appointment.timeSlot?.timeClocktime)}</td>
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
                            onClick: () => window.location.href = `/staff/appointments/${appointment.appointmentId}`,
                            icon: (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            ),
                            color: "blue"
                          }
                        ]}
                      />
                    </td>
                  </tr>
                ))}
                {sortedAppointments.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-4 text-center text-gray-500">
                      No past appointments found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        // When "All" filter is selected, show all appointments in a single table
        <div>
          <h2 className="text-xl font-semibold mb-4">All Appointments</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 text-left">ID</th>
                  <th className="py-3 px-4 text-left">Customer</th>
                  <th className="py-3 px-4 text-left">Service</th>
                  <th className="py-3 px-4 text-left">Vehicle</th>
                  <th className="py-3 px-4 text-left">Date</th>
                  <th className="py-3 px-4 text-left">Time</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedAppointments.map(appointment => (
                  <tr key={appointment.appointmentId} className="border-t hover:bg-gray-50">
                    <td className="py-3 px-4">{appointment.appointmentId}</td>
                    <td className="py-3 px-4">{appointment.customer?.custName || 'N/A'}</td>
                    <td className="py-3 px-4">{appointment.service?.serviceType || 'N/A'}</td>
                    <td className="py-3 px-4">{appointment.vehicle ? `${appointment.vehicle.vehBrand} ${appointment.vehicle.vehModel}` : 'N/A'}</td>
                    <td className="py-3 px-4">{formatDate(appointment)}</td>
                    <td className="py-3 px-4">{formatTime(appointment.timeSlot?.timeClocktime)}</td>
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
                            onClick: () => window.location.href = `/staff/appointments/${appointment.appointmentId}`,
                            icon: (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            ),
                            color: "blue"
                          },
                          ...(appointment.appointmentStatus === 'PENDING' ? [
                            {
                              label: "Confirm Appointment",
                              onClick: () => window.location.href = `/staff/appointments/${appointment.appointmentId}`,
                              icon: (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              ),
                              color: "purple"
                            }
                          ] : []),
                          ...(appointment.appointmentStatus === 'SCHEDULED' && !isPast(appointment) ? [
                            {
                              label: "Start Service",
                              onClick: () => handleUpdateStatus(appointment.appointmentId, 'IN_PROGRESS'),
                              icon: (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              ),
                              color: "yellow",
                              disabled: loading
                            }
                          ] : []),
                          ...(appointment.appointmentStatus === 'IN_PROGRESS' ? [
                            {
                              label: "Complete Service",
                              onClick: () => handleUpdateStatus(appointment.appointmentId, 'COMPLETED'),
                              icon: (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              ),
                              color: "green",
                              disabled: loading
                            }
                          ] : []),
                          ...((appointment.appointmentStatus === 'SCHEDULED' || appointment.appointmentStatus === 'IN_PROGRESS') && !isPast(appointment) ? [
                            {
                              label: "Cancel Appointment",
                              onClick: () => handleUpdateStatus(appointment.appointmentId, 'CANCELLED'),
                              icon: (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              ),
                              color: "red",
                              disabled: loading
                            }
                          ] : [])
                        ]}
                      />
                    </td>
                  </tr>
                ))}
                {sortedAppointments.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-4 text-center text-gray-500">
                      No appointments found.
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
          to="/staff/dashboard"
          className="text-blue-500 hover:underline"
        >
          &larr; Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default StaffAppointments;
