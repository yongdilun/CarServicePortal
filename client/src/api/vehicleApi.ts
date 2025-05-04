import axios from '../api/axios';

export interface Vehicle {
  vehId: number;
  vehPlateno: string;
  vehModel: string;
  vehBrand: string;
  vehType: string;
  vehYear: number;
  custId: number;
}

export interface VehicleFormData {
  vehPlateno: string;
  vehModel: string;
  vehBrand: string;
  vehType: string;
  vehYear: number;
  custId?: number;
}

// Get all vehicles for a customer
export const getAllVehicles = async (custId?: number): Promise<Vehicle[]> => {
  // The custId will be automatically added by the axios interceptor if not provided
  const url = custId ? `/api/customer/vehicles?custId=${custId}` : '/api/customer/vehicles';
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    // Return empty array on error to prevent UI crashes
    return [];
  }
};

// Get vehicle by ID
export const getVehicleById = async (id: number): Promise<Vehicle> => {
  const response = await axios.get(`/api/customer/vehicles/${id}`);
  return response.data;
};

// Add a new vehicle
export const addVehicle = async (vehicle: VehicleFormData): Promise<{ id: number; message: string }> => {
  const response = await axios.post('/api/customer/vehicles', vehicle);
  return response.data;
};

// Update a vehicle
export const updateVehicle = async (id: number, vehicle: VehicleFormData): Promise<{ id: number; message: string }> => {
  const response = await axios.put(`/api/customer/vehicles/${id}`, vehicle);
  return response.data;
};

// Delete a vehicle
export const deleteVehicle = async (id: number): Promise<{ message: string }> => {
  const response = await axios.delete(`/api/customer/vehicles/${id}`);
  return response.data;
};
