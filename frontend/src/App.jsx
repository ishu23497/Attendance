import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import EmployeeList from './pages/EmployeeList';
import AddEmployee from './pages/AddEmployee';
import Reports from './pages/Reports';
import Leaves from './pages/Leaves';
import { getCurrentUser } from './utils/attendanceLogic';

const ProtectedRoute = ({ children, allowedRole }) => {
  const user = JSON.parse(localStorage.getItem('userInfo'));
  
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // If user accesses a route not matching their role, redirect correctly
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/employee'} replace />;
  }

  return children;
};

const App = () => {
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
        
        {/* Catch all - if logged in go to dashboard, else login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
