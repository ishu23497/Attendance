import axios from 'axios';

// Use Vite environment variable for base URL or fallback to localhost
// IMPORTANT: Ensure VITE_API_URL does NOT have a trailing slash in .env
// Example .env: VITE_API_URL=http://localhost:5000/api
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
    const user = JSON.parse(localStorage.getItem('userInfo'));
    if (user && user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
});

export default api;
