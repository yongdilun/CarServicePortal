import axios from './axios';

export interface StaffMember {
  staffId: number;
  staffName: string;
  staffRole: string;
  staffPhone: string;
  outletId: number;
}

export interface StaffAppointment {
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

  // Relationships
  customer?: {
    custId: number;
    custName: string;
    custEmail: string;
    custPhone: string;
  };
  service?: {
    serviceId: number;
    serviceType: string;
    serviceDescription: string;
    serviceCost: number;
  };
  outlet?: {
    outletId: number;
    outletName: string;
    outletAddress: string;
    outletPhone: string;
  };
  timeSlot?: {
    timeId: number;
    timeClocktime: string;
    timeYear: number;
    timeMonth: number;
    timeDay: number;
  };
  vehicle?: {
    vehId: number;
    vehPlateno: string;
    vehModel: string;
    vehBrand: string;
    vehType: string;
    vehYear: number;
  };
}

// Get all staff appointments
export const getStaffAppointments = async (staffId?: number): Promise<StaffAppointment[]> => {
  try {
    // The staffId will be automatically added by the axios interceptor if not provided
    const url = staffId ? `/api/staff/appointments?staffId=${staffId}` : '/api/staff/appointments';
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching staff appointments:', error);
    // Return empty array on error to prevent UI crashes
    return [];
  }
};

// Get staff appointment details
export const getStaffAppointmentDetails = async (id: number): Promise<StaffAppointment> => {
  console.log(`Fetching appointment details for ID ${id}`);

  // Try direct API call first (no path prefix)
  try {
    console.log(`Trying direct API call to /api/appointments/${id}`);
    const directResponse = await axios.get(`/api/appointments/${id}`);
    console.log('Direct API response:', directResponse.data);
    return directResponse.data;
  } catch (directError: any) {
    console.log('Direct API call failed, trying staff endpoint...');

    // Try the staff endpoint
    try {
      const staffResponse = await axios.get(`/api/staff/appointments/${id}`);
      console.log('Staff endpoint response:', staffResponse.data);
      return staffResponse.data;
    } catch (staffError: any) {
      console.error(`Error fetching from staff endpoint for ID ${id}:`, staffError);
      console.error('Staff error response:', staffError.response?.data);
      console.error('Staff error status:', staffError.response?.status);

      // If staff endpoint fails, try the customer endpoint
      console.log('Staff endpoint failed, trying customer endpoint...');
      try {
        const customerResponse = await axios.get(`/api/customer/appointments/${id}`);
        console.log('Customer endpoint response:', customerResponse.data);
        return customerResponse.data;
      } catch (customerError: any) {
        console.error('Customer endpoint also failed:', customerError);

        // Last resort - try without the API prefix
        console.log('Trying without API prefix...');
        try {
          const noApiResponse = await axios.get(`/staff/appointments/${id}`);
          console.log('No API prefix response:', noApiResponse.data);
          return noApiResponse.data;
        } catch (noApiError: any) {
          console.error('All endpoints failed. Last error:', noApiError);
          throw noApiError;
        }
      }
    }
  }
};

// Update appointment status
export const updateAppointmentStatus = async (
  id: number,
  status: string
): Promise<{ id: number; status: string; message: string }> => {
  try {
    const response = await axios.put(`/api/staff/appointments/${id}/status`, { status });
    return response.data;
  } catch (error) {
    console.error(`Error updating appointment status for ID ${id}:`, error);
    throw error;
  }
};

// Get staff schedule
export const getStaffSchedule = async (
  staffId?: number,
  date?: string
): Promise<StaffAppointment[]> => {
  try {
    const params: Record<string, any> = {};
    if (staffId) params.staffId = staffId;
    if (date) params.date = date;

    const response = await axios.get('/api/staff/appointments/schedule', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching staff schedule:', error);
    // Return empty array on error to prevent UI crashes
    return [];
  }
};

// Get staff by outlet
export const getStaffByOutlet = async (outletId: number): Promise<StaffMember[]> => {
  try {
    const response = await axios.get(`/api/staff/outlet/${outletId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching staff for outlet ID ${outletId}:`, error);
    // Return empty array on error to prevent UI crashes
    return [];
  }
};

// Service Management
export interface Service {
  serviceId: number;
  serviceType: string;
  serviceDesc?: string;
  serviceDescription?: string; // Alternative field name
  serviceCategory?: string;
  serviceCost?: number;
  serviceDuration?: number;
}

// Get all services
export const getAllServices = async (): Promise<Service[]> => {
  try {
    // Use the correct endpoint for services
    const response = await axios.get('/api/services');
    return response.data;
  } catch (error) {
    console.error('Error fetching services:', error);
    // Return empty array on error to prevent UI crashes
    return [];
  }
};

// Get service by ID
export const getServiceById = async (id: number): Promise<Service> => {
  try {
    // Use the correct endpoint for services
    const response = await axios.get(`/api/services/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching service details for ID ${id}:`, error);
    throw error;
  }
};

// Create new service
export const createService = async (service: Omit<Service, 'serviceId'>): Promise<Service> => {
  try {
    // Use the correct endpoint for services
    const response = await axios.post('/api/services', service);
    return response.data;
  } catch (error) {
    console.error('Error creating service:', error);
    throw error;
  }
};

// Update service
export const updateService = async (id: number, service: Partial<Service>): Promise<Service> => {
  try {
    // Use the correct endpoint for services
    const response = await axios.put(`/api/services/${id}`, service);
    return response.data;
  } catch (error) {
    console.error(`Error updating service ID ${id}:`, error);
    throw error;
  }
};

// Delete service
export const deleteService = async (id: number): Promise<void> => {
  try {
    // Use the correct endpoint for services
    await axios.delete(`/api/services/${id}`);
  } catch (error) {
    console.error(`Error deleting service ID ${id}:`, error);
    throw error;
  }
};

// Reports
export interface ServicePopularity {
  serviceType: string;
  count: number;
}

export interface BusyPeriodsAnalysis {
  busyDays: Record<string, number>;
  busyHours: Record<string, number>;
}

export interface StaffPerformance {
  staffId: number;
  staffName: string;
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  completionRate: number;
}

export interface RevenueReport {
  totalRevenue: number;
  revenueByService: Record<string, number>;
  revenueByMonth: Record<string, number>;
}

// Get popular service types
export const getPopularServiceTypes = async (
  startDate?: string,
  endDate?: string
): Promise<ServicePopularity[]> => {
  try {
    let url = '/api/reports/popular-services';

    // Add date range parameters if provided
    if (startDate && endDate) {
      url += `?startDate=${startDate}&endDate=${endDate}`;
    }

    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching popular services:', error);
    return [];
  }
};

// Get busy periods analysis
export const getBusyPeriodsAnalysis = async (
  startDate?: string,
  endDate?: string
): Promise<BusyPeriodsAnalysis> => {
  try {
    let url = '/api/reports/busy-periods';

    // Add date range parameters if provided
    if (startDate && endDate) {
      url += `?startDate=${startDate}&endDate=${endDate}`;
    }

    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching busy periods analysis:', error);
    return { busyDays: {}, busyHours: {} };
  }
};

// Get staff performance metrics
export const getStaffPerformanceMetrics = async (
  startDate?: string,
  endDate?: string
): Promise<StaffPerformance[]> => {
  try {
    let url = '/api/reports/staff/performance';

    // Add date range parameters if provided
    if (startDate && endDate) {
      url += `?startDate=${startDate}&endDate=${endDate}`;
    }

    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching staff performance metrics:', error);
    return [];
  }
};

// Get revenue reporting
export const getRevenueReporting = async (
  startDate?: string,
  endDate?: string
): Promise<RevenueReport> => {
  try {
    let url = '/api/reports/revenue';

    // Add date range parameters if provided
    if (startDate && endDate) {
      url += `?startDate=${startDate}&endDate=${endDate}`;
    }

    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching revenue report:', error);
    return { totalRevenue: 0, revenueByService: {}, revenueByMonth: {} };
  }
};

export default {
  // Appointment management
  getStaffAppointments,
  getStaffAppointmentDetails,
  updateAppointmentStatus,
  getStaffSchedule,
  getStaffByOutlet,

  // Service management
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,

  // Reports
  getPopularServiceTypes,
  getBusyPeriodsAnalysis,
  getStaffPerformanceMetrics,
  getRevenueReporting
};
