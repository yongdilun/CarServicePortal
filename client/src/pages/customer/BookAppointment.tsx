import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  getAllOutlets,
  getAvailableTimeSlots,
  getAvailableTimeSlotsForOutlet,
  createAppointment,
  ServiceOutlet,
  TimeSlot,
  AppointmentFormData
} from '../../api/appointmentApi';
import { getAllServices, ServiceType } from '../../api/serviceApi';
import { getAllVehicles, Vehicle } from '../../api/vehicleApi';
import AppointmentConfirmation from '../../components/appointments/AppointmentConfirmation';

const BookAppointment: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const queryParams = new URLSearchParams(location.search);
  const preselectedServiceId = queryParams.get('serviceId');

  const [formData, setFormData] = useState<AppointmentFormData>({
    serviceId: preselectedServiceId ? parseInt(preselectedServiceId) : 0,
    outletId: 0,
    timeId: null,
    vehId: 0
  });

  // For default time slots that don't have a real timeId
  const [selectedTimeIndex, setSelectedTimeIndex] = useState<number | null>(null);

  const [services, setServices] = useState<ServiceType[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [outlets, setOutlets] = useState<ServiceOutlet[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [step, setStep] = useState(1); // 1 = form, 2 = confirmation

  // Selected objects for confirmation
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedOutlet, setSelectedOutlet] = useState<ServiceOutlet | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);

        // Fetch services
        const servicesData = await getAllServices();
        setServices(servicesData);

        // Fetch outlets
        const outletsData = await getAllOutlets();
        setOutlets(outletsData);

        // Fetch vehicles if user is logged in
        if (user) {
          const vehiclesData = await getAllVehicles(user.id);
          setVehicles(vehiclesData);
        }

        setError('');
      } catch (err: any) {
        setError('Failed to load data. ' + (err.response?.data?.error || err.message));
        console.error('Error fetching initial data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [user]);

  useEffect(() => {
    const fetchTimeSlots = async () => {
      if (!selectedDate) return;

      try {
        setLoading(true);
        const [year, month, day] = selectedDate.split('-').map(Number);

        let timeSlotsData: TimeSlot[] = [];

        // If an outlet is selected, get available time slots for that outlet
        if (formData.outletId) {
          // Use the new API that checks staff availability in the outlet
          timeSlotsData = await getAvailableTimeSlotsForOutlet(year, month, day, formData.outletId);
          console.log('Available time slots for outlet:', timeSlotsData);
        } else {
          // Otherwise, get all time slots for the date
          timeSlotsData = await getAvailableTimeSlots(year, month, day);
        }

        // If no time slots are returned and we're looking at a future date, create some default ones
        if (timeSlotsData.length === 0) {
          // Check if we're looking for today or future dates
          const selectedDateObj = new Date(year, month - 1, day);
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          if (selectedDateObj.getTime() >= today.getTime()) {
            // For today and future dates, use default time slots
            // These will be replaced by actual available slots when an outlet is selected
            const defaultTimeSlots: TimeSlot[] = [
              { timeId: 0, timeYear: year, timeQuarter: 2, timeMonth: month, timeDay: day, timeClocktime: '09:00:00' },
              { timeId: 0, timeYear: year, timeQuarter: 2, timeMonth: month, timeDay: day, timeClocktime: '10:00:00' },
              { timeId: 0, timeYear: year, timeQuarter: 2, timeMonth: month, timeDay: day, timeClocktime: '11:00:00' },
              { timeId: 0, timeYear: year, timeQuarter: 2, timeMonth: month, timeDay: day, timeClocktime: '13:00:00' }
            ];

            // Only show these default slots if no outlet is selected
            if (!formData.outletId) {
              setTimeSlots(defaultTimeSlots);
            } else {
              setTimeSlots([]);
            }
          } else {
            // For past dates, no time slots
            setTimeSlots([]);
          }
        } else {
          setTimeSlots(timeSlotsData);
        }

        setError('');
      } catch (err: any) {
        setError('Failed to load time slots. ' + (err.response?.data?.error || err.message));
        console.error('Error fetching time slots:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTimeSlots();
  }, [selectedDate, formData.outletId]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'timeSlot') {
      // Handle time slot selection
      const index = parseInt(value);
      setSelectedTimeIndex(index);

      // If it's a real time slot with an ID, set the timeId
      if (timeSlots[index] && timeSlots[index].timeId > 0) {
        setFormData(prev => ({
          ...prev,
          timeId: timeSlots[index].timeId
        }));
      } else {
        // For default time slots, set timeId to null and we'll use the timeSlot object later
        setFormData(prev => ({
          ...prev,
          timeId: null
        }));
      }
    } else if (name === 'outletId') {
      // When outlet changes, reset the time slot selection
      setSelectedTimeIndex(null);

      // Update the form data with the new outlet ID
      setFormData(prev => ({
        ...prev,
        outletId: parseInt(value),
        timeId: null // Reset timeId when outlet changes
      }));
    } else {
      // Handle other form fields
      setFormData(prev => ({
        ...prev,
        [name]: name === 'serviceId' || name === 'vehId'
          ? parseInt(value)
          : value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError('You must be logged in to book an appointment');
      return;
    }

    // Validate form
    if (!formData.serviceId || !formData.vehId) {
      setError('Please select a service and vehicle');
      return;
    }

    // Validate outlet selection
    if (!formData.outletId) {
      setError('Please select a service location');
      return;
    }

    // Validate time slot selection
    if (selectedTimeIndex === null) {
      setError('Please select an available time slot');
      return;
    }

    // Make sure the selected time slot exists in the current time slots array
    if (selectedTimeIndex >= timeSlots.length) {
      setError('The selected time slot is no longer available. Please select another time slot.');
      setSelectedTimeIndex(null);
      return;
    }

    // Find the selected objects for confirmation
    const service = services.find(s => s.serviceId === formData.serviceId) || null;
    const vehicle = vehicles.find(v => v.vehId === formData.vehId) || null;
    const outlet = outlets.find(o => o.outletId === formData.outletId) || null;
    const timeSlot = selectedTimeIndex !== null ? timeSlots[selectedTimeIndex] : null;

    setSelectedService(service);
    setSelectedVehicle(vehicle);
    setSelectedOutlet(outlet);
    setSelectedTimeSlot(timeSlot);

    // Move to confirmation step
    setStep(2);
  };

  const handleConfirmBooking = async () => {
    if (!user) {
      setError('You must be logged in to book an appointment');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Prepare the appointment data
      let appointmentData;

      // If we have a selected time slot
      if (selectedTimeSlot) {
        if (selectedTimeSlot.timeId > 0) {
          // If it's a real time slot with an ID, use the timeId
          appointmentData = {
            ...formData,
            custId: user.id,
            timeId: selectedTimeSlot.timeId
          };
        } else {
          // If it's a default time slot, send the full time slot object
          appointmentData = {
            ...formData,
            custId: user.id,
            timeId: null,
            timeSlot: selectedTimeSlot
          };
        }
      } else {
        // Fallback (should not happen due to validation)
        appointmentData = {
          ...formData,
          custId: user.id
        };
      }

      const response = await createAppointment(appointmentData);

      // Show success message with appointment ID
      setSuccess('Appointment booked successfully! Appointment ID: ' + response.id);

      // Reset form
      setFormData({
        serviceId: 0,
        outletId: 0,
        timeId: 0,
        vehId: 0
      });

      // Add a visual indicator that we're about to redirect
      const successMessage = document.querySelector('.bg-green-100');
      if (successMessage) {
        successMessage.innerHTML += '<p class="mt-2">Redirecting to your appointments page...</p>';
        successMessage.classList.add('animate-pulse-subtle');
      }

      // Redirect to appointments list after a delay
      setTimeout(() => {
        navigate('/customer/appointments');
      }, 3000);

    } catch (err: any) {
      setError('Failed to book appointment. ' + (err.response?.data?.error || err.message));
      console.error('Error booking appointment:', err);
      // Go back to form on error
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToForm = () => {
    setStep(1);
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Book Appointment</h1>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 transition-all duration-500">
          <div className="flex items-center">
            <svg className="w-6 h-6 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="font-medium">{success}</p>
          </div>
        </div>
      )}

      {step === 1 ? (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Service Selection */}
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="serviceId">
                  Service Type*
                </label>
                <select
                  id="serviceId"
                  name="serviceId"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={formData.serviceId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a service</option>
                  {services.map(service => (
                    <option key={service.serviceId} value={service.serviceId}>
                      {service.serviceType} - {service.serviceCategory}
                    </option>
                  ))}
                </select>
              </div>

              {/* Vehicle Selection */}
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="vehId">
                  Vehicle*
                </label>
                <select
                  id="vehId"
                  name="vehId"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={formData.vehId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a vehicle</option>
                  {vehicles.map(vehicle => (
                    <option key={vehicle.vehId} value={vehicle.vehId}>
                      {vehicle.vehYear} {vehicle.vehBrand} {vehicle.vehModel} ({vehicle.vehPlateno})
                    </option>
                  ))}
                </select>
                <div className="mt-2">
                  <Link
                    to="/customer/vehicles/add"
                    className="text-blue-500 hover:text-blue-700 text-sm"
                  >
                    + Add a new vehicle
                  </Link>
                </div>
              </div>

              {/* Service Outlet */}
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="outletId">
                  Service Location*
                </label>
                <select
                  id="outletId"
                  name="outletId"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={formData.outletId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a location</option>
                  {outlets.map(outlet => (
                    <option key={outlet.outletId} value={outlet.outletId}>
                      {outlet.outletName} - {outlet.outletCity}, {outlet.outletState}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Selection */}
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="appointmentDate">
                  Appointment Date*
                </label>
                <input
                  id="appointmentDate"
                  name="appointmentDate"
                  type="date"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
            </div>

            {/* Time Slots - Only show when an outlet is selected */}
            {formData.outletId > 0 ? (
              <div className="mt-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Available Time Slots*
                </label>
                {loading ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : timeSlots.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {timeSlots.map((slot, index) => (
                      <div key={`time-slot-${index}`} className="flex items-center">
                        <input
                          type="radio"
                          id={`time-slot-${index}`}
                          name="timeSlot"
                          value={index}
                          checked={selectedTimeIndex === index}
                          onChange={handleChange}
                          className="mr-2"
                          required
                        />
                        <label htmlFor={`time-slot-${index}`} className="text-gray-700">
                          {formatTime(slot.timeClocktime)}
                        </label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 mt-2 p-4 bg-gray-50 rounded border border-gray-200">
                    No available staff at this outlet for the selected date. Please try another date or outlet.
                  </p>
                )}
              </div>
            ) : (
              <div className="mt-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Available Time Slots*
                </label>
                <p className="text-gray-500 mt-2 p-4 bg-gray-50 rounded border border-gray-200">
                  Please select a service location to see available time slots.
                </p>
              </div>
            )}

            <div className="mt-8">
              <button
                type="submit"
                className={`text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full ${
                  !formData.serviceId || !formData.outletId || !formData.vehId || selectedTimeIndex === null || loading
                    ? 'bg-blue-300 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-700'
                }`}
                disabled={!formData.serviceId || !formData.outletId || !formData.vehId || selectedTimeIndex === null || loading}
              >
                Continue to Confirmation
              </button>
            </div>
          </form>
        </div>
      ) : (
        <AppointmentConfirmation
          formData={formData}
          selectedService={selectedService}
          selectedVehicle={selectedVehicle}
          selectedOutlet={selectedOutlet}
          selectedTimeSlot={selectedTimeSlot}
          selectedDate={selectedDate}
          onConfirm={handleConfirmBooking}
          onBack={handleBackToForm}
          loading={loading}
        />
      )}

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
};

export default BookAppointment;
