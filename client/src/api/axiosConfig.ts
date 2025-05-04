import axios from 'axios';

// Create axios instance with base URL
const axiosInstance = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for API calls
axiosInstance.interceptors.request.use(
  (config) => {
    // Get user from localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);

        // Check if the request URL matches the user type
        const url = config.url || '';

        // Prevent staff from accessing customer endpoints and vice versa
        if (user.userType === 'staff' && url.startsWith('/customer')) {
          // Cancel the request and throw an error
          throw new Error('Unauthorized: Staff cannot access customer endpoints');
        }

        if (user.userType === 'customer' && url.startsWith('/staff')) {
          // Cancel the request and throw an error
          throw new Error('Unauthorized: Customer cannot access staff endpoints');
        }

        // Add authorization header if token exists
        if (user.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
      } catch (error) {
        console.error('Error processing request interceptor:', error);
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      console.error('Unauthorized access:', error.response.data);

      // Get user from localStorage
      const userStr = localStorage.getItem('user');
      let userType = 'customer'; // Default to customer login

      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          userType = user.userType || 'customer';

          // Clear user data
          localStorage.removeItem('user');

          // Show alert to user
          alert('Your session has expired. Please log in again.');
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      }

      // Redirect to appropriate login page
      window.location.href = `/login/${userType}`;
    }

    // Handle 403 Forbidden errors
    if (error.response && error.response.status === 403) {
      console.error('Access forbidden:', error.response.data);

      // Show alert to user
      alert('You do not have permission to access this resource.');

      // Get user from localStorage
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          // Redirect to appropriate dashboard
          window.location.href = `/${user.userType}/dashboard`;
        } catch (e) {
          console.error('Error parsing user data:', e);
          // Fallback to home page
          window.location.href = '/';
        }
      } else {
        // Fallback to home page
        window.location.href = '/';
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
