import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getAppointmentDetails, cancelAppointment, Appointment } from '../../api/appointmentApi';
import { ConfirmationDialog } from '../../components/ui';

const AppointmentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelSuccess, setCancelSuccess] = useState('');
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  useEffect(() => {
    const fetchAppointmentDetails = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const data = await getAppointmentDetails(parseInt(id));
        setAppointment(data);
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

  const handleCancelAppointment = async () => {
    if (!appointment) return;

    // Show the confirmation dialog
    setShowCancelDialog(true);
  };

  const confirmCancelAppointment = async () => {
    if (!appointment) return;

    try {
      setLoading(true);
      await cancelAppointment(appointment.appointmentId);

      // Update the appointment status in the local state
      setAppointment({
        ...appointment,
        appointmentStatus: 'CANCELLED'
      });

      setCancelSuccess('Appointment cancelled successfully');
      setTimeout(() => setCancelSuccess(''), 3000);
    } catch (err: any) {
      setError('Failed to cancel appointment. ' + (err.response?.data?.error || err.message));
      console.error('Error cancelling appointment:', err);
    } finally {
      setLoading(false);
      setShowCancelDialog(false);
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
            to="/customer/appointments"
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
            to="/customer/appointments"
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
        isOpen={showCancelDialog}
        title="Cancel Appointment"
        message="Are you sure you want to cancel this appointment? This action cannot be undone."
        confirmText="Yes, Cancel Appointment"
        cancelText="No, Keep Appointment"
        onConfirm={confirmCancelAppointment}
        onCancel={() => setShowCancelDialog(false)}
        type="danger"
      />

      {cancelSuccess && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6">
          <p>{cancelSuccess}</p>
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
              <div className="space-y-2">
                <p className="text-gray-700">
                  <span className="font-medium">Date:</span> {formatDate(appointment)}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Time:</span> {formatTime(appointment.timeSlot?.timeClocktime)}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Duration:</span> {appointment.appointmentDuration} minutes
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Cost:</span> ${appointment.appointmentCost.toFixed(2)}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Service Location</h3>
              <div className="space-y-2">
                <p className="text-gray-700">
                  <span className="font-medium">Name:</span> {appointment.outlet?.outletName || 'N/A'}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Address:</span> {appointment.outlet?.outletAddress || 'N/A'}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">City:</span> {appointment.outlet?.outletCity || 'N/A'}, {appointment.outlet?.outletState || 'N/A'} {appointment.outlet?.outletPostalCode || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Vehicle Information</h3>
              <div className="space-y-2">
                <p className="text-gray-700">
                  <span className="font-medium">Vehicle:</span> {appointment.vehicle ? `${appointment.vehicle.vehYear} ${appointment.vehicle.vehBrand} ${appointment.vehicle.vehModel}` : 'N/A'}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Plate Number:</span> {appointment.vehicle?.vehPlateno || 'N/A'}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Type:</span> {appointment.vehicle?.vehType || 'N/A'}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Service Information</h3>
              <div className="space-y-2">
                <p className="text-gray-700">
                  <span className="font-medium">Service Type:</span> {appointment.service?.serviceType || 'N/A'}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Category:</span> {appointment.service?.serviceCategory || 'N/A'}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Description:</span> {appointment.service?.serviceDesc || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mt-8">
            <Link
              to="/customer/appointments"
              className="text-blue-500 hover:underline"
            >
              &larr; Back to Appointments
            </Link>

            {appointment.appointmentStatus === 'SCHEDULED' && (
              <button
                onClick={handleCancelAppointment}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                disabled={loading}
              >
                Cancel Appointment
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetails;
