import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from '../../api/axios';
import { Appointment } from '../../api/appointmentApi';

interface User {
  id: number;
  name: string;
  role: string;
  userType: string;
}

const StaffDashboard: React.FC = () => {
  const { user } = useAuth();
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [pendingAppointments, setPendingAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const response = await axios.get(`/api/staff/appointments?staffId=${user.id}`);
        const appointments = response.data;

        // Filter today's appointments
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayAppts = appointments.filter((appointment: Appointment) => {
          if (!appointment.timeSlot) return false;

          const { timeYear, timeMonth, timeDay } = appointment.timeSlot;
          const appointmentDate = new Date(timeYear, timeMonth - 1, timeDay);
          appointmentDate.setHours(0, 0, 0, 0);

          return appointmentDate.getTime() === today.getTime() &&
                 appointment.appointmentStatus !== 'CANCELLED' &&
                 appointment.appointmentStatus !== 'COMPLETED';
        });

        // Filter upcoming appointments (future dates, not cancelled)
        const upcomingAppts = appointments.filter((appointment: Appointment) => {
          if (!appointment.timeSlot) return false;

          const { timeYear, timeMonth, timeDay } = appointment.timeSlot;
          const appointmentDate = new Date(timeYear, timeMonth - 1, timeDay);
          appointmentDate.setHours(0, 0, 0, 0);

          return appointmentDate > today &&
                 appointment.appointmentStatus === 'SCHEDULED';
        });

        // Filter pending appointments (waiting for confirmation)
        const pendingAppts = appointments.filter((appointment: Appointment) => {
          return appointment.appointmentStatus === 'PENDING';
        });

        setTodayAppointments(todayAppts);
        setUpcomingAppointments(upcomingAppts);
        setPendingAppointments(pendingAppts);
        setError('');
      } catch (err: any) {
        setError('Failed to load appointments. ' + (err.response?.data?.error || err.message));
        console.error('Error fetching appointments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [user]);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
          <p>Please log in to view your dashboard.</p>
          <Link to="/login/staff" className="text-blue-500 hover:underline">Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 animate-fade-in">Staff Dashboard</h1>

      <div className="bg-white shadow-md rounded-lg p-6 mb-6 transition-all duration-300 hover:shadow-lg animate-fade-in-up">
        <div className="flex items-center">
          <div className="user-avatar w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold mr-4 animate-pulse-subtle">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-1 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Welcome, {user.name}!</h2>
            <p className="text-gray-600">Role: {user.role}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 animate-fade-in">
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white shadow-md rounded-lg p-6 transition-all duration-300 hover:shadow-lg hover:translate-y-[-5px] animate-fade-in-up animation-delay-300">
          <div className="flex items-center mb-3">
            <svg className="w-6 h-6 mr-2 text-blue-500 animate-pulse-subtle" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-semibold">Appointments</h3>
          </div>
          <p className="text-gray-600 mb-4">View and manage service appointments.</p>
          <Link
            to="/staff/appointments"
            className="enhanced-blue-btn px-4 py-2 rounded inline-block transition-all duration-300"
          >
            View Appointments
          </Link>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 transition-all duration-300 hover:shadow-lg hover:translate-y-[-5px] animate-fade-in-up animation-delay-600">
          <div className="flex items-center mb-3">
            <svg className="w-6 h-6 mr-2 text-blue-500 animate-pulse-subtle" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h3 className="text-lg font-semibold">Service Management</h3>
          </div>
          <p className="text-gray-600 mb-4">Manage service types and categories.</p>
          <div className="flex space-x-4">
            <Link
              to="/staff/services"
              className="enhanced-blue-btn px-4 py-2 rounded inline-block transition-all duration-300"
            >
              Manage Services
            </Link>
            <Link
              to="/staff/services/add"
              className="enhanced-green-btn px-4 py-2 rounded inline-block transition-all duration-300"
            >
              Add Service
            </Link>
          </div>
        </div>
      </div>

      {pendingAppointments.length > 0 && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-8 border-l-4 border-purple-500 transition-all duration-300 hover:shadow-lg animate-fade-in-up animation-delay-900">
          <div className="flex items-center mb-3">
            <svg className="w-6 h-6 mr-2 text-purple-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold">Pending Appointments</h3>
          </div>
          <p className="text-gray-600 mb-4">
            These appointments require your confirmation before they are scheduled.
          </p>
          {loading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-purple-50 to-indigo-50">
                    <th className="py-2 px-3 text-left">Date</th>
                    <th className="py-2 px-3 text-left">Time</th>
                    <th className="py-2 px-3 text-left">Customer</th>
                    <th className="py-2 px-3 text-left">Service</th>
                    <th className="py-2 px-3 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingAppointments.map((appointment, index) => (
                    <tr
                      key={appointment.appointmentId}
                      className={`border-t hover:bg-purple-50 transition-all duration-300 animate-fade-in-up`}
                      style={{ animationDelay: `${(index + 1) * 100}ms` }}
                    >
                      <td className="py-2 px-3">
                        {appointment.timeSlot ?
                          new Date(
                            appointment.timeSlot.timeYear,
                            appointment.timeSlot.timeMonth - 1,
                            appointment.timeSlot.timeDay
                          ).toLocaleDateString([], {month: 'short', day: 'numeric'})
                          : 'N/A'}
                      </td>
                      <td className="py-2 px-3">
                        {appointment.timeSlot ?
                          new Date(`2000-01-01T${appointment.timeSlot.timeClocktime}`).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                          : 'N/A'}
                      </td>
                      <td className="py-2 px-3">{appointment.customer?.custName || 'N/A'}</td>
                      <td className="py-2 px-3">{appointment.service?.serviceType || 'N/A'}</td>
                      <td className="py-2 px-3">
                        <Link
                          to={`/staff/appointments/${appointment.appointmentId}`}
                          className="enhanced-purple-btn px-3 py-1 rounded text-sm transition-all duration-300"
                        >
                          Confirm
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="mt-4">
            <Link
              to="/staff/appointments?filter=pending"
              className="text-purple-500 hover:text-purple-700 text-sm flex items-center transition-all duration-300 hover:translate-x-1"
            >
              View all pending appointments
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white shadow-md rounded-lg p-6 transition-all duration-300 hover:shadow-lg hover:translate-y-[-5px] animate-fade-in-up animation-delay-1200">
          <div className="flex items-center mb-3">
            <svg className="w-6 h-6 mr-2 text-blue-500 animate-pulse-subtle" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold">Time Schedule</h3>
          </div>
          <p className="text-gray-600 mb-4">View your appointments in a visual timeline. See your daily schedule and manage your time efficiently.</p>
          <Link
            to="/staff/schedule"
            className="enhanced-blue-btn px-4 py-2 rounded inline-block transition-all duration-300"
          >
            View Schedule
          </Link>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 transition-all duration-300 hover:shadow-lg animate-fade-in-up animation-delay-1500">
          <div className="flex items-center mb-3">
            <svg className="w-6 h-6 mr-2 text-blue-500 animate-pulse-subtle" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-semibold">Upcoming Appointments</h3>
          </div>
          {loading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : upcomingAppointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-gray-500 animate-fade-in">
              <svg className="w-12 h-12 mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-600">No upcoming appointments scheduled.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
                    <th className="py-2 px-3 text-left">Date</th>
                    <th className="py-2 px-3 text-left">Customer</th>
                    <th className="py-2 px-3 text-left">Service</th>
                    <th className="py-2 px-3 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingAppointments.slice(0, 5).map((appointment, index) => (
                    <tr
                      key={appointment.appointmentId}
                      className="border-t hover:bg-blue-50 transition-all duration-300 animate-fade-in-up"
                      style={{ animationDelay: `${(index + 1) * 100}ms` }}
                    >
                      <td className="py-2 px-3">
                        {appointment.timeSlot ?
                          new Date(
                            appointment.timeSlot.timeYear,
                            appointment.timeSlot.timeMonth - 1,
                            appointment.timeSlot.timeDay
                          ).toLocaleDateString([], {month: 'short', day: 'numeric'})
                          : 'N/A'}
                      </td>
                      <td className="py-2 px-3">{appointment.customer?.custName || 'N/A'}</td>
                      <td className="py-2 px-3">{appointment.service?.serviceType || 'N/A'}</td>
                      <td className="py-2 px-3">
                        <Link
                          to={`/staff/appointments/${appointment.appointmentId}`}
                          className="text-blue-500 hover:text-blue-700 transition-all duration-300 flex items-center"
                        >
                          View
                          <svg className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="mt-4">
            <Link
              to="/staff/appointments?filter=upcoming"
              className="text-blue-500 hover:text-blue-700 text-sm flex items-center transition-all duration-300 hover:translate-x-1"
            >
              View all upcoming appointments
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
