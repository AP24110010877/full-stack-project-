import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Leaf } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 fixed w-full top-0 z-50 transition-all shadow-sm">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2 text-primary font-bold text-xl tracking-tight">
          <Leaf className="text-primary" />
          <span>FreshFood List</span>
        </Link>
        
        <div className="flex items-center gap-4">
          {token ? (
            <>
              <span className="text-sm font-medium text-gray-600 hidden sm:block">Hello, {user?.username}</span>
              <button onClick={handleLogout} className="text-gray-500 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50">
                <LogOut size={20} />
              </button>
            </>
          ) : (
            <div className="space-x-4">
              <Link to="/login" className="text-gray-600 font-medium hover:text-primary transition-colors">Log In</Link>
              <Link to="/register" className="btn-primary py-1.5 px-4 text-sm hidden sm:inline-block">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
