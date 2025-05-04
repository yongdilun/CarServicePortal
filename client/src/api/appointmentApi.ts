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
export const getCustomerAppointments = async (custId?: number): Promise<Appointment[]> => {
  try {
    // The custId will be automatically added by the axios interceptor if not provided
    const url = custId ? `/api/customer/appointments?custId=${custId}` : '/api/customer/appointments';
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching customer appointments:', error);
    // Return empty array on error to prevent UI crashes
    return [];
  }
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
  try {
    // Default values for cost and duration based on service type
    // In a real app, these would be calculated based on the service
    const appointmentData = {
      ...appointment,
      appointmentCost: 89.99,
      appointmentDuration: 60
      // staffId is set to 9999 (unassigned) on the server side
    };

    console.log('Creating appointment with data:', appointmentData);

    const response = await axios.post('/api/customer/appointments', appointmentData);
    console.log('Appointment created successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error creating appointment:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    throw error;
  }
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
  try {
    // Ensure staffId is a number
    const data = {
      ...confirmationData,
      staffId: confirmationData.staffId ? Number(confirmationData.staffId) : undefined
    };

    console.log(`Confirming appointment ${id} with data:`, data);
    const response = await axios.put(`/api/staff/appointments/${id}/confirm`, data);
    console.log('Confirmation response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error in confirmAppointment API call:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    throw error; // Re-throw to be handled by the component
  }
};
