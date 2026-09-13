import axios from 'axios';


const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});


axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {

    if (error.response?.data) {
      return Promise.reject(error.response.data);
    }

    return Promise.reject({
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: 'Unable to connect to the server. Please check your internet connection.',
      },
    });
  }
);

export default axiosClient;
