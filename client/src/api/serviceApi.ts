import axios from '../api/axios';

export interface ServiceType {
  serviceId: number;
  serviceType: string;
  serviceDesc: string;
  serviceCategory: string;
}

export const getAllServices = async (): Promise<ServiceType[]> => {
  const response = await axios.get('/api/services');
  return response.data;
};

export const getServiceById = async (id: number): Promise<ServiceType> => {
  const response = await axios.get(`/api/services/${id}`);
  return response.data;
};

export const getServicesByCategory = async (category: string): Promise<ServiceType[]> => {
  const response = await axios.get(`/api/services/category/${category}`);
  return response.data;
};

export const addService = async (service: Omit<ServiceType, 'serviceId'>): Promise<{ id: number; message: string }> => {
  const response = await axios.post('/api/services', service);
  return response.data;
};

export const updateService = async (id: number, service: Omit<ServiceType, 'serviceId'>): Promise<{ id: number; message: string }> => {
  const response = await axios.put(`/api/services/${id}`, { ...service, serviceId: id });
  return response.data;
};

export const deleteService = async (id: number): Promise<{ message: string }> => {
  const response = await axios.delete(`/api/services/${id}`);
  return response.data;
};
