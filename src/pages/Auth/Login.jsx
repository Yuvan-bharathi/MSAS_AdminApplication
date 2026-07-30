import { useState } from 'react';
import { supabase } from '../../utils/supabase';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // Navigate to dashboard on success
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-3xl p-8 shadow-sm border border-border-subtle"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-brand-600 mb-2">MSAS</h1>
          <p className="text-text-secondary">Admin Login</p>
        </div>

        {error && (
          <div className="bg-rose-50 text-rose-700 p-3 rounded-xl mb-6 text-sm font-medium border border-rose-200">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border-subtle focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-shadow"
              placeholder="admin@msas.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border-subtle focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-shadow"
              placeholder="••••••••"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 rounded-xl transition-all shadow-sm shadow-brand-500/30 disabled:opacity-70 flex justify-center items-center"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
