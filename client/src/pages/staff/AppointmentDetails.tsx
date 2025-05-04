import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import { Appointment, confirmAppointment, AppointmentConfirmationData } from '../../api/appointmentApi';
import TimePicker from '../../components/common/TimePicker';
import { ConfirmationDialog } from '../../components/ui';

const StaffAppointmentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState('');

  // Confirmation form state
  const [showConfirmationForm, setShowConfirmationForm] = useState(false);

  // Confirmation dialog state
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingStatusUpdate, setPendingStatusUpdate] = useState<string | null>(null);
  const [confirmationData, setConfirmationData] = useState<AppointmentConfirmationData>({
    estimatedFinishTime: '',
    staffId: undefined
  });
  const [staffList, setStaffList] = useState<any[]>([]);

  useEffect(() => {
    const fetchAppointmentDetails = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const response = await axios.get(`/api/staff/appointments/${id}`);
        setAppointment(response.data);

        // If the appointment is pending, fetch staff members from the same outlet
        if (response.data.appointmentStatus === 'PENDING') {
          const outletId = response.data.outletId;
          const staffResponse = await axios.get(`/api/staff/outlet/${outletId}`);
          setStaffList(staffResponse.data);
        }

        setError('');
      } catch (err: any) {
        setError('Failed to load appointment details. ' + (err.response?.data?.error || err.message));
        console.error('Error fetching appointment details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointmentDetails();
  }, [id]);

  const handleUpdateStatus = async (newStatus: string) => {
    if (!appointment) return;

    // If cancelling or rejecting, show confirmation dialog
    if (newStatus === 'CANCELLED') {
      setPendingStatusUpdate(newStatus);
      setShowConfirmDialog(true);
      return;
    }

    // Otherwise, proceed with the update
    await updateAppointmentStatus(newStatus);
  };

  const updateAppointmentStatus = async (newStatus: string) => {
    if (!appointment) return;

    try {
      setLoading(true);
      await axios.put(`/api/staff/appointments/${appointment.appointmentId}/status`, { status: newStatus });

      // Update the appointment status in the local state
      setAppointment({
        ...appointment,
        appointmentStatus: newStatus
      });

      setUpdateSuccess(`Appointment status updated to ${newStatus}`);
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

  const handleConfirmationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setConfirmationData(prev => ({
      ...prev,
      [name]: name === 'staffId' ? parseInt(value) : value
    }));
  };

  // Handle time picker changes
  const handleTimeChange = (time: string) => {
    setConfirmationData(prev => ({
      ...prev,
      estimatedFinishTime: time
    }));
  };

  const handleConfirmAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointment) return;

    try {
      setLoading(true);
      const response = await confirmAppointment(appointment.appointmentId, confirmationData);

      // Update the appointment in the local state
      setAppointment({
        ...appointment,
        appointmentStatus: 'SCHEDULED',
        estimatedFinishTime: confirmationData.estimatedFinishTime
      });

      setUpdateSuccess('Appointment confirmed successfully');
      setShowConfirmationForm(false);
      setTimeout(() => setUpdateSuccess(''), 3000);
    } catch (err: any) {
      setError('Failed to confirm appointment. ' + (err.response?.data?.error || err.message));
      console.error('Error confirming appointment:', err);
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Appointment Details</h1>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Appointment Details</h1>
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
        </div>
        <div className="mt-8">
          <Link
            to="/staff/appointments"
            className="text-blue-500 hover:underline"
          >
            &larr; Back to Appointments
          </Link>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Appointment Details</h1>
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <p className="text-gray-600">Appointment not found.</p>
        </div>
        <div className="mt-8">
          <Link
            to="/staff/appointments"
            className="text-blue-500 hover:underline"
          >
            &larr; Back to Appointments
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Appointment Details</h1>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showConfirmDialog}
        title={pendingStatusUpdate === 'CANCELLED' ?
          (appointment?.appointmentStatus === 'PENDING' ? "Reject Appointment" : "Cancel Appointment") :
          "Update Status"}
        message={pendingStatusUpdate === 'CANCELLED' ?
          (appointment?.appointmentStatus === 'PENDING' ?
            "Are you sure you want to reject this appointment? This action cannot be undone." :
            "Are you sure you want to cancel this appointment? This action cannot be undone.") :
          "Are you sure you want to update the status of this appointment?"}
        confirmText={pendingStatusUpdate === 'CANCELLED' ?
          (appointment?.appointmentStatus === 'PENDING' ? "Yes, Reject Appointment" : "Yes, Cancel Appointment") :
          "Yes, Update Status"}
        cancelText="No, Keep Current Status"
        onConfirm={() => pendingStatusUpdate && updateAppointmentStatus(pendingStatusUpdate)}
        onCancel={() => {
          setShowConfirmDialog(false);
          setPendingStatusUpdate(null);
        }}
        type="danger"
      />

      {updateSuccess && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6">
          <p>{updateSuccess}</p>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">
                {appointment.service?.serviceType || 'Service'}
              </h2>
              <p className="text-gray-600">
                Appointment #{appointment.appointmentId}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(appointment.appointmentStatus)}`}>
              {appointment.appointmentStatus}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Appointment Details</h3>
              <div className="bg-gray-50 p-4 rounded">
                <p className="mb-2">
                  <span className="font-medium">Date:</span> {formatDate(appointment)}
                </p>
                <p className="mb-2">
                  <span className="font-medium">Time:</span> {formatTime(appointment.timeSlot?.timeClocktime)}
                </p>
                {appointment.estimatedFinishTime && (
                  <p className="mb-2">
                    <span className="font-medium">Estimated Finish Time:</span> {formatTime(appointment.estimatedFinishTime)}
                  </p>
                )}
                <p className="mb-2">
                  <span className="font-medium">Duration:</span> {appointment.appointmentDuration} minutes
                </p>
                <p>
                  <span className="font-medium">Cost:</span> ${appointment.appointmentCost.toFixed(2)}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Customer Information</h3>
              <div className="bg-gray-50 p-4 rounded">
                <p className="mb-2">
                  <span className="font-medium">Name:</span> {appointment.customer?.custName || 'N/A'}
                </p>
                <p className="mb-2">
                  <span className="font-medium">Phone:</span> {appointment.customer?.custPhone || 'N/A'}
                </p>
                <p>
                  <span className="font-medium">Email:</span> {appointment.customer?.custEmail || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Vehicle Information</h3>
              <div className="bg-gray-50 p-4 rounded">
                <p className="mb-2">
                  <span className="font-medium">Vehicle:</span> {appointment.vehicle ? `${appointment.vehicle.vehYear} ${appointment.vehicle.vehBrand} ${appointment.vehicle.vehModel}` : 'N/A'}
                </p>
                <p className="mb-2">
                  <span className="font-medium">Plate Number:</span> {appointment.vehicle?.vehPlateno || 'N/A'}
                </p>
                <p>
                  <span className="font-medium">Type:</span> {appointment.vehicle?.vehType || 'N/A'}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Service Information</h3>
              <div className="bg-gray-50 p-4 rounded">
                <p className="mb-2">
                  <span className="font-medium">Service Type:</span> {appointment.service?.serviceType || 'N/A'}
                </p>
                <p className="mb-2">
                  <span className="font-medium">Category:</span> {appointment.service?.serviceCategory || 'N/A'}
                </p>
                <p>
                  <span className="font-medium">Description:</span> {appointment.service?.serviceDesc || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Service Location</h3>
            <div className="bg-gray-50 p-4 rounded">
              <p className="mb-2">
                <span className="font-medium">Name:</span> {appointment.outlet?.outletName || 'N/A'}
              </p>
              <p className="mb-2">
                <span className="font-medium">Address:</span> {appointment.outlet?.outletAddress || 'N/A'}
              </p>
              <p>
                <span className="font-medium">City:</span> {appointment.outlet?.outletCity || 'N/A'}, {appointment.outlet?.outletState || 'N/A'} {appointment.outlet?.outletPostalCode || 'N/A'}
              </p>
            </div>
          </div>

          {/* Status Update Buttons */}
          {appointment.appointmentStatus !== 'COMPLETED' && appointment.appointmentStatus !== 'CANCELLED' && (
            <div className="bg-gray-50 p-4 rounded mb-6">
              <h3 className="text-lg font-semibold mb-3">Update Appointment Status</h3>

              {appointment.appointmentStatus === 'PENDING' ? (
                <>
                  {!showConfirmationForm ? (
                    <button
                      onClick={() => setShowConfirmationForm(true)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                      disabled={loading}
                    >
                      Confirm Appointment
                    </button>
                  ) : (
                    <form onSubmit={handleConfirmAppointment} className="mt-4">
                      <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="staffId">
                          Assign Staff Member
                        </label>
                        <select
                          id="staffId"
                          name="staffId"
                          value={confirmationData.staffId || ''}
                          onChange={handleConfirmationChange}
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          required
                        >
                          <option value="">Select a staff member</option>
                          {staffList.filter(staff => staff.staffId !== 9999).map(staff => (
                            <option key={staff.staffId} value={staff.staffId}>
                              {staff.staffName} - {staff.staffRole}
                            </option>
                          ))}
                        </select>
                        <p className="text-sm text-gray-500 mt-1">
                          Select the staff member who will handle this appointment
                        </p>
                      </div>

                      <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="estimatedFinishTime">
                          Estimated Finish Time
                        </label>
                        <TimePicker
                          id="estimatedFinishTime"
                          name="estimatedFinishTime"
                          value={confirmationData.estimatedFinishTime || ''}
                          onChange={handleTimeChange}
                          required
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          Enter the estimated time when the service will be completed
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <button
                          type="submit"
                          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                          disabled={loading}
                        >
                          {loading ? 'Confirming...' : 'Confirm'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowConfirmationForm(false)}
                          className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
                          disabled={loading}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="mt-4">
                    <button
                      onClick={() => handleUpdateStatus('CANCELLED')}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                      disabled={loading}
                    >
                      Reject Appointment
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {appointment.appointmentStatus === 'SCHEDULED' && (
                    <button
                      onClick={() => handleUpdateStatus('IN_PROGRESS')}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
                      disabled={loading}
                    >
                      Start Service
                    </button>
                  )}

                  {appointment.appointmentStatus === 'IN_PROGRESS' && (
                    <button
                      onClick={() => handleUpdateStatus('COMPLETED')}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                      disabled={loading}
                    >
                      Mark as Completed
                    </button>
                  )}

                  {(appointment.appointmentStatus === 'SCHEDULED' || appointment.appointmentStatus === 'IN_PROGRESS') && (
                    <button
                      onClick={() => handleUpdateStatus('CANCELLED')}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                      disabled={loading}
                    >
                      Cancel Appointment
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="mt-8">
            <Link
              to="/staff/appointments"
              className="text-blue-500 hover:underline"
            >
              &larr; Back to Appointments
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffAppointmentDetails;
