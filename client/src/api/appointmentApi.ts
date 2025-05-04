import axios from '../api/axios';

export interface TimeSlot {
  timeId: number;
  timeYear: number;
  timeQuarter: number;
  timeMonth: number;
  timeDay: number;
  timeClocktime: string;
}

export interface ServiceOutlet {
  outletId: number;
  outletName: string;
  outletAddress: string;
  outletCity: string;
  outletState: string;
  outletPostalCode: string;
}

export interface Appointment {
  appointmentId: number;
  custId: number;
  serviceId: number;
  outletId: number;
  timeId: number;
  vehId: number;
  staffId: number;
  appointmentCost: number;
  appointmentDuration: number;
  appointmentStatus: string;
  estimatedFinishTime?: string;

  // Relationships (optional, only present in detailed view)
  customer?: any;
  service?: any;
  outlet?: ServiceOutlet;
  timeSlot?: TimeSlot;
  vehicle?: any;
  staff?: any;
}

export interface AppointmentFormData {
  serviceId: number;
  outletId: number;
  timeId: number | null;
  vehId: number;
  timeSlot?: TimeSlot;
}

// Get all outlets
export const getAllOutlets = async (): Promise<ServiceOutlet[]> => {
  const response = await axios.get('/api/public/outlets');
  return response.data;
};

// Get available time slots
export const getAvailableTimeSlots = async (
  year: number,
  month: number,
  day: number
): Promise<TimeSlot[]> => {
  const response = await axios.get(`/api/public/timeslots?year=${year}&month=${month}&day=${day}`);
  return response.data;
};

// Get available time slots for a specific outlet
export const getAvailableTimeSlotsForOutlet = async (
  year: number,
  month: number,
  day: number,
  outletId: number
): Promise<TimeSlot[]> => {
  const response = await axios.get('/api/public/available-timeslots', {
    params: { year, month, day, outletId }
  });
  return response.data;
};

// Get customer appointments
export const getCustomerAppointments = async (custId: number): Promise<Appointment[]> => {
  const response = await axios.get(`/api/customer/appointments?custId=${custId}`);
  return response.data;
};

// Get appointment details
export const getAppointmentDetails = async (id: number): Promise<Appointment> => {
  const response = await axios.get(`/api/customer/appointments/${id}`);
  return response.data;
};

// Create appointment
export const createAppointment = async (
  appointment: AppointmentFormData & { custId: number }
): Promise<{ id: number; status: string; message: string }> => {
  // Default values for cost and duration based on service type
  // In a real app, these would be calculated based on the service
  const appointmentData = {
    ...appointment,
    appointmentCost: 89.99,
    appointmentDuration: 60
    // staffId is set to 9999 (unassigned) on the server side
  };

  const response = await axios.post('/api/customer/appointments', appointmentData);
  return response.data;
};

// Cancel appointment
export const cancelAppointment = async (id: number): Promise<{ message: string }> => {
  const response = await axios.put(`/api/customer/appointments/${id}/status`, { status: 'CANCELLED' });
  return response.data;
};

// Confirm appointment (staff only)
export interface AppointmentConfirmationData {
  staffId?: number;
  estimatedFinishTime?: string;
}

export const confirmAppointment = async (
  id: number,
  confirmationData: AppointmentConfirmationData
): Promise<{ id: number; status: string; message: string }> => {
  const response = await axios.put(`/api/staff/appointments/${id}/confirm`, confirmationData);
  return response.data;
};
