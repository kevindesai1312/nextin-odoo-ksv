import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Loader2, Upload } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    username: '',
    password: '',
    confirmPassword: '',
    role: 'Officer',
    country: '',
    additionalInfo: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');


    if (!form.firstName || !form.lastName || !form.email || !form.phone || !form.username || !form.password) {
      setError('Please fill in all required fields');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }


    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    const result = await register({
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone,
      username: form.username,
      password: form.password,
      role: form.role,
      country: form.country,
      additionalInfo: form.additionalInfo,
    });
    setLoading(false);

    if (result.success) {
      if (result.role === 'Vendor') navigate('/quotations');
      else if (result.role === 'Officer') navigate('/rfqs');
      else if (result.role === 'Manager') navigate('/approvals');
      else navigate('/dashboard');
    } else {
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="bg-white border -blue-100 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-8 w-full max-w-2xl">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-9 h-9 rounded-lg -blue-600 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 17h8M4 17l4-10 4 10M12 7h8M12 17h8" />
            </svg>
          </div>
          <span className="font-nunito text-lg font-bold -blue-900">
            VendorBridge
          </span>
        </div>

        {/* Photo upload section */}
        <div className="relative w-20 h-20 rounded-full border-2 border-dashed -blue-100 flex items-center justify-center mx-auto mb-6 bg-gradient-to-br from-blue-50 to-teal-50 hover:-blue-600 hover:-blue-100 transition-all duration-300 cursor-pointer group">
          <User size={32} className="-blue-400 group-hover:-blue-600 transition-colors duration-300" />
          <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/5 transition-all duration-300 flex items-center justify-center">
            <Upload size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Two column: First Name | Last Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium -blue-600 mb-2 font-inter">
                First Name
              </label>
              <input
                type="text"
                placeholder="First Name"
                className="input-field focus:ring-2 focus:-blue-600 focus:-blue-600 transition-all duration-200"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium -blue-600 mb-2 font-inter">
                Last Name
              </label>
              <input
                type="text"
                placeholder="Last Name"
                className="input-field focus:ring-2 focus:-blue-600 focus:-blue-600 transition-all duration-200"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              />
            </div>
          </div>

          {/* Two column: Email | Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium -blue-600 mb-2 font-inter">
                Email Address
              </label>
              <input
                type="email"
                placeholder="Email Address"
                className="input-field focus:ring-2 focus:-blue-600 focus:-blue-600 transition-all duration-200"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium -blue-600 mb-2 font-inter">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="Phone Number"
                className="input-field focus:ring-2 focus:-blue-600 focus:-blue-600 transition-all duration-200"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          </div>

          {/* Two column: Username | Password */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium -blue-600 mb-2 font-inter">
                Username
              </label>
              <input
                type="text"
                placeholder="Username"
                className="input-field focus:ring-2 focus:-blue-600 focus:-blue-600 transition-all duration-200"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium -blue-600 mb-2 font-inter">
                Password
              </label>
              <input
                type="password"
                placeholder="Password"
                className="input-field focus:ring-2 focus:-blue-600 focus:-blue-600 transition-all duration-200"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div className="mb-4">
            <label className="block text-sm font-medium -blue-600 mb-2 font-inter">
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="Confirm Password"
              className="input-field focus:ring-2 focus:-blue-600 focus:-blue-600 transition-all duration-200"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            />
          </div>

          {/* Two column: Role | Country */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium -blue-600 mb-2 font-inter">
                Role
              </label>
              <select
                className="input-field focus:ring-2 focus:-blue-600 focus:-blue-600 transition-all duration-200 cursor-pointer"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="Admin">Admin</option>
                <option value="Officer">Procurement Officer</option>
                <option value="Manager">Manager</option>
                <option value="Vendor">Vendor</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium -blue-600 mb-2 font-inter">
                Country
              </label>
              <input
                type="text"
                placeholder="Country"
                className="input-field focus:ring-2 focus:-blue-600 focus:-blue-600 transition-all duration-200"
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
              />
            </div>
          </div>

          {/* Additional Info */}
          <div className="mb-6">
            <label className="block text-sm font-medium -blue-600 mb-2 font-inter">
              Additional Information
            </label>
            <textarea
              placeholder="Additional Information..."
              className="input-field focus:ring-2 focus:-blue-600 focus:-blue-600 transition-all duration-200 resize-vertical"
              rows={4}
              value={form.additionalInfo}
              onChange={(e) => setForm({ ...form, additionalInfo: e.target.value })}
            />
          </div>

          {error && (
            <div className="-blue-600 text-sm mb-4 font-inter -blue-100 border -blue-100 rounded-lg px-4 py-2">
              {error}
            </div>
          )}

          {/* Register Button */}
          <button
            type="submit"
            className="btn-primary w-full justify-center mb-4 hover:-blue-700 active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Registering...
              </>
            ) : (
              'Register'
            )}
          </button>
        </form>

        <div className="pt-4 border-t -blue-100">
          <span className="text-sm -blue-600 font-inter">
            Already have an account?{' '}
          </span>
          <button
            onClick={() => navigate('/login')}
            className="-blue-600 text-sm font-inter font-semibold hover:-blue-700 transition-colors duration-200"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}
