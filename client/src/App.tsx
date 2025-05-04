import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Auth pages
import CustomerLogin from './pages/auth/CustomerLogin';
import StaffLogin from './pages/auth/StaffLogin';
import CustomerSignup from './pages/auth/CustomerSignup';
import StaffSignup from './pages/auth/StaffSignup';

// Dashboard pages
import CustomerDashboard from './pages/customer/Dashboard';
import StaffDashboard from './pages/staff/Dashboard';

// Customer pages
import VehicleList from './pages/customer/VehicleList';
import AddVehicle from './pages/customer/AddVehicle';
import EditVehicle from './pages/customer/EditVehicle';
import CustomerServiceList from './pages/customer/ServiceList';
import AppointmentList from './pages/customer/AppointmentList';
import BookAppointment from './pages/customer/BookAppointment';
import CustomerAppointmentDetails from './pages/customer/AppointmentDetails';
import CustomerProfile from './pages/customer/Profile';

// Staff pages
import ServiceManagement from './pages/staff/ServiceManagement';
import AddService from './pages/staff/AddService';
import EditService from './pages/staff/EditService';
import StaffAppointments from './pages/staff/AppointmentList';
import StaffAppointmentDetails from './pages/staff/AppointmentDetails';
import StaffProfile from './pages/staff/Profile';
import TimeSchedule from './pages/staff/TimeSchedule';
import Reports from './pages/staff/Reports';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />

        {/* Auth Routes */}
        <Route path="login/customer" element={<CustomerLogin />} />
        <Route path="login/staff" element={<StaffLogin />} />
        <Route path="register/customer" element={<CustomerSignup />} />
        <Route path="register/staff" element={<StaffSignup />} />

        {/* Customer Routes */}
        <Route path="customer/dashboard" element={<CustomerDashboard />} />
        <Route path="customer/vehicles" element={<VehicleList />} />
        <Route path="customer/vehicles/add" element={<AddVehicle />} />
        <Route path="customer/vehicles/:id/edit" element={<EditVehicle />} />
        <Route path="customer/services" element={<CustomerServiceList />} />
        <Route path="customer/appointments" element={<AppointmentList />} />
        <Route path="customer/appointments/book" element={<BookAppointment />} />
        <Route path="customer/appointments/:id" element={<CustomerAppointmentDetails />} />
        <Route path="customer/profile" element={<CustomerProfile />} />

        {/* Staff Routes */}
        <Route path="staff/dashboard" element={<StaffDashboard />} />
        <Route path="staff/services" element={<ServiceManagement />} />
        <Route path="staff/services/add" element={<AddService />} />
        <Route path="staff/services/:id/edit" element={<EditService />} />
        <Route path="staff/appointments" element={<StaffAppointments />} />
        <Route path="staff/appointments/:id" element={<StaffAppointmentDetails />} />
        <Route path="staff/schedule" element={<TimeSchedule />} />
        <Route path="staff/reports" element={<Reports />} />
        <Route path="staff/profile" element={<StaffProfile />} />
      </Route>
    </Routes>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
