import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/guards/ProtectedRoute';
import GuestRoute from './components/guards/GuestRoute';
import HomeRoute from './components/guards/HomeRoute';

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
          <Route index element={
            <HomeRoute>
              <Home />
            </HomeRoute>
          } />

        {/* Auth Routes - Only accessible to guests */}
        <Route path="login/customer" element={
          <GuestRoute>
            <CustomerLogin />
          </GuestRoute>
        } />
        <Route path="login/staff" element={
          <GuestRoute>
            <StaffLogin />
          </GuestRoute>
        } />
        <Route path="register/customer" element={
          <GuestRoute>
            <CustomerSignup />
          </GuestRoute>
        } />
        <Route path="register/staff" element={
          <GuestRoute>
            <StaffSignup />
          </GuestRoute>
        } />

        {/* Customer Routes - Only accessible to customers */}
        <Route path="customer/dashboard" element={
          <ProtectedRoute userType="customer">
            <CustomerDashboard />
          </ProtectedRoute>
        } />
        <Route path="customer/vehicles" element={
          <ProtectedRoute userType="customer">
            <VehicleList />
          </ProtectedRoute>
        } />
        <Route path="customer/vehicles/add" element={
          <ProtectedRoute userType="customer">
            <AddVehicle />
          </ProtectedRoute>
        } />
        <Route path="customer/vehicles/:id/edit" element={
          <ProtectedRoute userType="customer">
            <EditVehicle />
          </ProtectedRoute>
        } />
        <Route path="customer/services" element={
          <ProtectedRoute userType="customer">
            <CustomerServiceList />
          </ProtectedRoute>
        } />
        <Route path="customer/appointments" element={
          <ProtectedRoute userType="customer">
            <AppointmentList />
          </ProtectedRoute>
        } />
        <Route path="customer/appointments/book" element={
          <ProtectedRoute userType="customer">
            <BookAppointment />
          </ProtectedRoute>
        } />
        <Route path="customer/appointments/:id" element={
          <ProtectedRoute userType="customer">
            <CustomerAppointmentDetails />
          </ProtectedRoute>
        } />
        <Route path="customer/profile" element={
          <ProtectedRoute userType="customer">
            <CustomerProfile />
          </ProtectedRoute>
        } />

        {/* Staff Routes - Only accessible to staff */}
        <Route path="staff/dashboard" element={
          <ProtectedRoute userType="staff">
            <StaffDashboard />
          </ProtectedRoute>
        } />
        <Route path="staff/services" element={
          <ProtectedRoute userType="staff">
            <ServiceManagement />
          </ProtectedRoute>
        } />
        <Route path="staff/services/add" element={
          <ProtectedRoute userType="staff">
            <AddService />
          </ProtectedRoute>
        } />
        <Route path="staff/services/:id/edit" element={
          <ProtectedRoute userType="staff">
            <EditService />
          </ProtectedRoute>
        } />
        <Route path="staff/appointments" element={
          <ProtectedRoute userType="staff">
            <StaffAppointments />
          </ProtectedRoute>
        } />
        <Route path="staff/appointments/:id" element={
          <ProtectedRoute userType="staff">
            <StaffAppointmentDetails />
          </ProtectedRoute>
        } />
        <Route path="staff/schedule" element={
          <ProtectedRoute userType="staff">
            <TimeSchedule />
          </ProtectedRoute>
        } />
        <Route path="staff/reports" element={
          <ProtectedRoute userType="staff">
            <Reports />
          </ProtectedRoute>
        } />
        <Route path="staff/profile" element={
          <ProtectedRoute userType="staff">
            <StaffProfile />
          </ProtectedRoute>
        } />
      </Route>
    </Routes>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
