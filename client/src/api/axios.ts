import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// Add a request interceptor to include authentication token if available
instance.interceptors.request.use(
  (config) => {
    // Get user from localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);

        // Add user ID to query params for certain endpoints
        const url = config.url || '';

        // For customer vehicle endpoints, add custId if not already present
        if (url.startsWith('/api/customer/vehicles') && !url.includes('custId=') && config.method === 'get') {
          const separator = url.includes('?') ? '&' : '?';
          config.url = `${url}${separator}custId=${user.id}`;
        }

        // For customer appointment endpoints, add custId if not already present
        if (url.startsWith('/api/customer/appointments') && !url.includes('custId=') && config.method === 'get') {
          const separator = url.includes('?') ? '&' : '?';
          config.url = `${url}${separator}custId=${user.id}`;
        }

        // For POST requests to customer appointments, ensure the user ID is included
        if (url === '/api/customer/appointments' && config.method === 'post' && config.data) {
          try {
            const data = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
            if (!data.custId) {
              data.custId = user.id;
              config.data = JSON.stringify(data);
            }
          } catch (error) {
            console.error('Error processing POST request data:', error);
          }
        }

        // For staff appointment endpoints, add staffId if not already present
        if (url.startsWith('/api/staff/appointments') && !url.includes('staffId=') && config.method === 'get' && user.userType === 'staff') {
          const separator = url.includes('?') ? '&' : '?';
          config.url = `${url}${separator}staffId=${user.id}`;
        }

        // For staff schedule endpoints, add staffId if not already present
        if (url.startsWith('/api/staff/schedule') && !url.includes('staffId=') && config.method === 'get' && user.userType === 'staff') {
          const separator = url.includes('?') ? '&' : '?';
          config.url = `${url}${separator}staffId=${user.id}`;
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

export default instance;
