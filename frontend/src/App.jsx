import React, { useEffect, useRef, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import EmployeeList from './pages/EmployeeList';
import AddEmployee from './pages/AddEmployee';
import Reports from './pages/Reports';
import Leaves from './pages/Leaves';
import CalendarPage from './pages/CalendarPage';
import { logout as apiLogout, refreshToken } from './utils/api';

const INACTIVITY_TIMEOUT = 30 * 60 * 1000;
const TOKEN_REFRESH_INTERVAL = 14 * 60 * 1000;

const getUserFromStorage = () => {
    try {
        const userStr = localStorage.getItem('userInfo');
        return userStr ? JSON.parse(userStr) : null;
    } catch {
        return null;
    }
};

const setLastActivity = () => {
    localStorage.setItem('lastActivity', Date.now().toString());
};

const getLastActivity = () => {
    const lastActivity = localStorage.getItem('lastActivity');
    return lastActivity ? parseInt(lastActivity, 10) : Date.now();
};

const ProtectedRoute = ({ children, allowedRole }) => {
    const user = getUserFromStorage();
    
    if (!user) {
        return <Navigate to="/" replace />;
    }

    if (allowedRole && user.role !== allowedRole) {
        return <Navigate to={user.role === 'admin' ? '/admin' : '/employee'} replace />;
    }

    return children;
};

const App = () => {
    inactivityTimerRef = useRef(null);
    tokenRefreshRef = useRef(null);

    const handleLogout = useCallback(() => {
        if (inactivityTimerRef.current) {
            clearTimeout(inactivityTimerRef.current);
        }
        if (tokenRefreshRef.current) {
            clearInterval(tokenRefreshRef.current);
        }
        apiLogout();
        window.location.href = '/';
    }, []);

    const resetInactivityTimer = useCallback(() => {
        if (inactivityTimerRef.current) {
            clearTimeout(inactivityTimerRef.current);
        }
        setLastActivity();
        inactivityTimerRef.current = setTimeout(() => {
            handleLogout();
        }, INACTIVITY_TIMEOUT);
    }, [handleLogout]);

    const startTokenRefresh = useCallback(() => {
        if (tokenRefreshRef.current) {
            clearInterval(tokenRefreshRef.current);
        }
        tokenRefreshRef.current = setInterval(async () => {
            try {
                await refreshToken();
            } catch (error) {
                console.error('Token refresh failed:', error);
            }
        }, TOKEN_REFRESH_INTERVAL * 1000);
    }, []);

    useEffect(() => {
        const user = getUserFromStorage();
        
        if (user) {
            setLastActivity();
            resetInactivityTimer();
            startTokenRefresh();

            const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
            events.forEach(event => {
                window.addEventListener(event, resetInactivityTimer);
            });

            return () => {
                if (inactivityTimerRef.current) {
                    clearTimeout(inactivityTimerRef.current);
                }
                if (tokenRefreshRef.current) {
                    clearInterval(tokenRefreshRef.current);
                }
                events.forEach(event => {
                    window.removeEventListener(event, resetInactivityTimer);
                });
            };
        }
    }, [resetInactivityTimer, startTokenRefresh]);

    useEffect(() => {
        const user = getUserFromStorage();
        if (user) {
            const lastActivity = getLastActivity();
            const timeSinceActivity = Date.now() - lastActivity;
            
            if (timeSinceActivity >= INACTIVITY_TIMEOUT) {
                handleLogout();
            }
        }
    }, [handleLogout]);

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                
                <Route 
                    path="/admin" 
                    element={
                        <ProtectedRoute allowedRole="admin">
                            <AdminDashboard />
                        </ProtectedRoute>
                    } 
                />

                <Route 
                    path="/admin/employees" 
                    element={
                        <ProtectedRoute allowedRole="admin">
                            <EmployeeList />
                        </ProtectedRoute>
                    } 
                />

                <Route 
                    path="/admin/add-employee" 
                    element={
                        <ProtectedRoute allowedRole="admin">
                            <AddEmployee />
                        </ProtectedRoute>
                    } 
                />

        <Route 
          path="/admin/reports" 
          element={
            <ProtectedRoute allowedRole="admin">
              <Reports />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/calendar" 
          element={
            <ProtectedRoute allowedRole="admin">
              <CalendarPage />
            </ProtectedRoute>
          } 
        />
                
                <Route 
                    path="/leaves" 
                    element={
                        <ProtectedRoute>
                            <Leaves />
                        </ProtectedRoute>
                    } 
                />
                
                <Route 
                    path="/employee" 
                    element={
                        <ProtectedRoute allowedRole="employee">
                            <EmployeeDashboard />
                        </ProtectedRoute>
                    } 
                />
                
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
};

let inactivityTimerRef;
let tokenRefreshRef;

export default App;
