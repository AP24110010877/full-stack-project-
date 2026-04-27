import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ShoppingBasket, ArrowRight } from 'lucide-react';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/register', { username, email, password });
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-secondary-light">
      <div className="card w-full max-w-md mx-4 relative overflow-hidden">
         {/* Soft decorative blob */}
         <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-primary/10 rounded-full blur-2xl"></div>

        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-primary/10 rounded-full text-primary mb-4">
             <ShoppingBasket size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Create Account</h2>
          <p className="text-gray-500 mt-2">Start organizing your shopping easily</p>
        </div>

        {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

        <form onSubmit={handleRegister} className="space-y-4 relative z-10">
          <div>
             <input type="text" placeholder="Full Name" required
               minLength="3"
               className="input-field"
               value={username} onChange={e => setUsername(e.target.value)} />
          </div>
          <div>
             <input type="email" placeholder="Email Address" required
               className="input-field"
               value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
             <input type="password" placeholder="Password" required minLength="6"
               className="input-field"
               value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <button type="submit" className="btn-primary w-full flex justify-center items-center gap-2 mt-4">
            Sign Up <ArrowRight size={18} />
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account? <Link to="/login" className="text-primary hover:underline font-medium">Log In</Link>
        </p>
      </div>
    </div>
  );
}
