import axios from 'axios';

// Access the API URL from Vite environment variables
// Ensure VITE_API_URL is set in your .env file
const API_URL = import.meta.env.VITE_API_URL;

// Safe check: Log error if VITE_API_URL is missing
if (!API_URL) {
    console.error("FATAL ERROR: VITE_API_URL is not defined. Checks your .env file.");
}

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add the auth token if available
api.interceptors.request.use((config) => {
    const user = JSON.parse(localStorage.getItem('userInfo'));
    if (user && user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;
