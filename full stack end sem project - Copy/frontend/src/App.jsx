import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ListDetails from './pages/ListDetails';
import Navbar from './components/Navbar';
import { AuthProvider, useAuth } from './context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-20">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
            <Route path="/lists/:id" element={
              <PrivateRoute>
                <ListDetails />
              </PrivateRoute>
            } />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </main>
      </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
