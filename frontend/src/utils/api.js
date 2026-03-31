import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
    console.error("FATAL ERROR: VITE_API_URL is not defined. Check your .env file.");
}

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

const getUserFromStorage = () => {
    try {
        const userStr = localStorage.getItem('userInfo');
        return userStr ? JSON.parse(userStr) : null;
    } catch {
        return null;
    }
};

const setUserToStorage = (user) => {
    localStorage.setItem('userInfo', JSON.stringify(user));
};

const clearUserFromStorage = () => {
    localStorage.removeItem('userInfo');
    localStorage.removeItem('lastActivity');
};

api.interceptors.request.use(
    (config) => {
        const user = getUserFromStorage();
        if (user?.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const user = getUserFromStorage();

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (error.response?.data?.code === 'TOKEN_EXPIRED') {
                if (isRefreshing) {
                    return new Promise((resolve, reject) => {
                        failedQueue.push({ resolve, reject });
                    })
                        .then((token) => {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                            return api(originalRequest);
                        })
                        .catch((err) => Promise.reject(err));
                }

                originalRequest._retry = true;
                isRefreshing = true;

                try {
                    const { data } = await api.post('/auth/refresh');

                    const updatedUser = {
                        ...user,
                        token: data.token,
                        expiresIn: data.expiresIn
                    };
                    setUserToStorage(updatedUser);

                    processQueue(null, data.token);
                    originalRequest.headers.Authorization = `Bearer ${data.token}`;

                    return api(originalRequest);
                } catch (refreshError) {
                    processQueue(refreshError, null);
                    clearUserFromStorage();
                    window.location.href = '/';
                    return Promise.reject(refreshError);
                } finally {
                    isRefreshing = false;
                }
            }

            clearUserFromStorage();
            window.location.href = '/';
        }

        return Promise.reject(error);
    }
);

export const refreshToken = async () => {
    try {
        const { data } = await api.post('/auth/refresh');
        const user = getUserFromStorage();
        if (user) {
            setUserToStorage({ ...user, token: data.token });
        }
        return data;
    } catch (error) {
        clearUserFromStorage();
        window.location.href = '/';
        throw error;
    }
};

export const logout = async () => {
    try {
        await api.post('/auth/logout');
    } catch (error) {
        console.error('Logout API error:', error);
    } finally {
        clearUserFromStorage();
    }
};

export const getMe = async () => {
    try {
        const { data } = await api.get('/auth/me');
        return data;
    } catch (error) {
        throw error;
    }
};

export default api;
