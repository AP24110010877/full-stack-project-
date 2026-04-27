import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-secondary-light">
      <div className="card w-full max-w-md mx-4 relative overflow-hidden">
        {/* Soft decorative blob */}
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-primary/10 rounded-full blur-2xl"></div>

        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-primary/10 rounded-full text-primary mb-4">
            <ShoppingBag size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
          <p className="text-gray-500 mt-2">Manage your groceries smartly</p>
        </div>

        {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

        <form onSubmit={handleLogin} className="space-y-4 relative z-10">
          <div>
             <input type="email" placeholder="Email" required
               className="input-field"
               value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
             <input type="password" placeholder="Password" required
               className="input-field"
               value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <button type="submit" className="btn-primary w-full flex justify-center items-center gap-2 mt-4">
            Sign In <ArrowRight size={18} />
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Don't have an account? <Link to="/register" className="text-primary hover:underline font-medium">Register</Link>
        </p>
      </div>
    </div>
  );
}
