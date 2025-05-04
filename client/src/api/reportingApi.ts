import axios from './axios';
import { Appointment } from './appointmentApi';

// Get customer service history
export const getCustomerServiceHistory = async (customerId: number): Promise<Appointment[]> => {
  const response = await axios.get(`/api/reports/customer/${customerId}/history`);
  return response.data;
};

// Get popular service types
export interface ServicePopularity {
  serviceType: string;
  count: number;
}

export const getPopularServiceTypes = async (
  startDate?: string,
  endDate?: string
): Promise<ServicePopularity[]> => {
  let url = '/api/reports/services/popular';
  
  // Add date range parameters if provided
  if (startDate && endDate) {
    url += `?startDate=${startDate}&endDate=${endDate}`;
  }
  
  const response = await axios.get(url);
  return response.data;
};

// Get busy periods analysis
export interface BusyPeriodsAnalysis {
  byDayOfWeek: Record<string, number>;
  byHourOfDay: Record<number, number>;
  byMonth: Record<string, number>;
}

export const getBusyPeriodsAnalysis = async (
  startDate?: string,
  endDate?: string
): Promise<BusyPeriodsAnalysis> => {
  let url = '/api/reports/busy-periods';
  
  // Add date range parameters if provided
  if (startDate && endDate) {
    url += `?startDate=${startDate}&endDate=${endDate}`;
  }
  
  const response = await axios.get(url);
  return response.data;
};

// Get staff performance metrics
export interface StaffPerformance {
  staffId: number;
  staffName: string;
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  completionRate: number;
}

export const getStaffPerformanceMetrics = async (
  startDate?: string,
  endDate?: string
): Promise<StaffPerformance[]> => {
  let url = '/api/reports/staff/performance';
  
  // Add date range parameters if provided
  if (startDate && endDate) {
    url += `?startDate=${startDate}&endDate=${endDate}`;
  }
  
  const response = await axios.get(url);
  return response.data;
};

// Get revenue reporting
export interface RevenueReport {
  totalRevenue: number;
  revenueByService: Record<string, number>;
  revenueByMonth: Record<string, number>;
}

export const getRevenueReporting = async (
  startDate?: string,
  endDate?: string
): Promise<RevenueReport> => {
  let url = '/api/reports/revenue';
  
  // Add date range parameters if provided
  if (startDate && endDate) {
    url += `?startDate=${startDate}&endDate=${endDate}`;
  }
  
  const response = await axios.get(url);
  return response.data;
};
