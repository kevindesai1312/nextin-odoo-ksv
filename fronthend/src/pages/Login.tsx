import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ username: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!form.username || !form.password) {
      setError('Please fill in all fields');
      return;
    }
    
    setLoading(true);
    const result = await login(form.username, form.password);
    setLoading(false);
    
    if (result.success) {
      if (result.role === 'Vendor') navigate('/quotations');
      else if (result.role === 'Officer') navigate('/rfqs');
      else if (result.role === 'Manager') navigate('/approvals');
      else navigate('/dashboard');
    } else {
      setError('Invalid username or password. Try admin/admin123');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="bg-white border -blue-100 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-8 w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-lg -blue-600 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 17h8M4 17l4-10 4 10M12 7h8M12 17h8" />
            </svg>
          </div>
          <span className="font-nunito text-xl font-bold -blue-900">
            VendorBridge
          </span>
        </div>

        {/* Avatar placeholder */}
        <div className="w-24 h-24 rounded-full border-2 border-dashed -blue-100 flex items-center justify-center mx-auto mb-8 bg-gradient-to-br from-blue-50 to-teal-50 hover:-blue-600 transition-colors duration-300">
          <User size={40} className="-blue-400" />
        </div>

        <form onSubmit={handleSubmit}>
          {/* Username */}
          <div className="mb-4">
            <label className="block text-sm font-medium -blue-600 mb-2 font-inter">
              Username
            </label>
            <div className="relative">
              <User
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 -blue-400"
              />
              <input
                type="text"
                placeholder="Enter username"
                className="input-field pl-10 focus:ring-2 focus:-blue-600 focus:-blue-600 transition-all duration-200"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="block text-sm font-medium -blue-600 mb-2 font-inter">
              Password
            </label>
            <div className="relative">
              <Lock
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 -blue-400"
              />
              <input
                type="password"
                placeholder="Enter password"
                className="input-field pl-10 focus:ring-2 focus:-blue-600 focus:-blue-600 transition-all duration-200"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
          </div>

          {error && (
            <div className="-blue-600 text-sm mb-4 font-inter -blue-100 border -blue-100 rounded-lg px-4 py-2">
              {error}
            </div>
          )}

          {/* Login Button */}
          <button
            type="submit"
            className="btn-primary w-full justify-center mb-4 hover:-blue-700 active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>

        {/* Forgot password */}
        <button
          onClick={() => {}}
          className="-blue-600 text-sm font-inter font-medium hover:-blue-700 transition-colors duration-200 mb-4"
        >
          Forgot password?
        </button>

        <div className="mt-5 pt-4 border-t -blue-100">
          <span className="text-sm -blue-600 font-inter">
            Don't have an account?{' '}
          </span>
          <button
            onClick={() => navigate('/register')}
            className="-blue-600 text-sm font-inter font-semibold hover:-blue-700 transition-colors duration-200"
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
}
