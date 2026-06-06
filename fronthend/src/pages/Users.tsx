import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';

interface User {
  _id: string;
  firstName?: string;
  lastName?: string;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formError, setFormError] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    role: 'Vendor',
    isActive: true,
  });

  const fetchUsers = async () => {
    try {
      const res = await api.get('/api/users');
      setUsers(res.data || []);
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenModal = (user?: User) => {
    setFormError('');
    if (user) {
      setEditingUser(user);
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        username: user.username,
        email: user.email,
        password: '', // blank on edit
        role: user.role,
        isActive: user.isActive,
      });
    } else {
      setEditingUser(null);
      setFormData({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        password: '',
        role: 'Vendor',
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    try {
      if (editingUser) {
        // Update user
        const { password, ...rest } = formData;
        const payload = password ? { ...rest, password } : rest;
        
        await api.put(`/api/users/${editingUser._id}`, payload);
      } else {
        // Create user
        if (!formData.password) {
          setFormError('Password is required for new users.');
          return;
        }
        await api.post('/api/users', formData);
      }
      
      await fetchUsers();
      handleCloseModal();
    } catch (error: any) {
      const msg = error.response?.data?.message || 'An error occurred while saving.';
      setFormError(msg);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete user ${name}? This cannot be undone.`)) {
      try {
        await api.delete(`/api/users/${id}`);
        setUsers(users.filter(u => u._id !== id));
      } catch (error: any) {
        alert(error.response?.data?.message || 'Failed to delete user.');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 -blue-600"></div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-end mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold -blue-900 font-nunito tracking-tight mb-1">
            User Management
          </h1>
          <p className="text-sm -blue-400 font-inter">
            Manage system access, roles, and internal staff.
          </p>
        </div>
        <button 
          className="btn-primary shadow-sm"
          onClick={() => handleOpenModal()}
        >
          <Plus size={16} />
          Add User
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border -blue-100 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="-blue-100/50 border-b -blue-100">
                <th className="py-4 px-6 text-xs font-semibold -blue-400 uppercase tracking-wider font-inter">Name</th>
                <th className="py-4 px-6 text-xs font-semibold -blue-400 uppercase tracking-wider font-inter">Username</th>
                <th className="py-4 px-6 text-xs font-semibold -blue-400 uppercase tracking-wider font-inter">Email</th>
                <th className="py-4 px-6 text-xs font-semibold -blue-400 uppercase tracking-wider font-inter">Role</th>
                <th className="py-4 px-6 text-xs font-semibold -blue-400 uppercase tracking-wider font-inter">Status</th>
                <th className="py-4 px-6 text-xs font-semibold -blue-400 uppercase tracking-wider font-inter text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => {
                const displayName = user.firstName || user.lastName 
                  ? `${user.firstName || ''} ${user.lastName || ''}`.trim() 
                  : '-';
                  
                return (
                  <tr key={user._id} className="hover:-blue-100/50 transition-colors">
                    <td className="py-4 px-6 text-sm font-medium -blue-900 font-inter">
                      {displayName}
                    </td>
                    <td className="py-4 px-6 text-sm -blue-600 font-inter">
                      @{user.username}
                    </td>
                    <td className="py-4 px-6 text-sm -blue-400 font-inter">
                      {user.email}
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium -blue-100 -blue-700 font-inter">
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium font-inter ${
                        user.isActive ? '-blue-100 -blue-700' : '-blue-100 -blue-700'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button 
                        onClick={() => handleOpenModal(user)}
                        className="-blue-400 hover:-blue-600 transition-colors mr-3"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(user._id, user.username)}
                        className="-blue-400 hover:-blue-600 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center -blue-400 font-inter text-sm">
                    No users found in the database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 -blue-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b -blue-100 flex items-center justify-between">
              <h2 className="text-lg font-bold -blue-900 font-nunito">
                {editingUser ? 'Edit User' : 'Create New User'}
              </h2>
              <button 
                onClick={handleCloseModal}
                className="-blue-400 hover:-blue-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              {formError && (
                <div className="mb-6 -blue-100 -blue-700 px-4 py-3 rounded-lg text-sm font-inter flex gap-3 items-start border -blue-100">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}
              
              <form id="userForm" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium -blue-700 mb-1 font-inter">First Name</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium -blue-700 mb-1 font-inter">Last Name</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium -blue-700 mb-1 font-inter">Username <span className="-blue-600">*</span></label>
                  <input 
                    type="text" 
                    required
                    className="input-field" 
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium -blue-700 mb-1 font-inter">Email <span className="-blue-600">*</span></label>
                  <input 
                    type="email" 
                    required
                    className="input-field" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium -blue-700 mb-1 font-inter">
                    Password {editingUser ? '(Leave blank to keep unchanged)' : '<span className="-blue-600">*</span>'}
                  </label>
                  <input 
                    type="password" 
                    className="input-field" 
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium -blue-700 mb-1 font-inter">Role</label>
                    <select 
                      className="input-field"
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                    >
                      <option value="Admin">Admin</option>
                      <option value="Officer">Procurement Officer</option>
                      <option value="Manager">Manager</option>
                      <option value="Vendor">Vendor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium -blue-700 mb-1 font-inter">Status</label>
                    <select 
                      className="input-field"
                      value={formData.isActive ? 'true' : 'false'}
                      onChange={(e) => setFormData({...formData, isActive: e.target.value === 'true'})}
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="px-6 py-4 border-t -blue-100 -blue-100 flex justify-end gap-3 rounded-b-2xl">
              <button 
                type="button"
                onClick={handleCloseModal}
                className="btn-outline bg-white"
              >
                Cancel
              </button>
              <button 
                type="submit"
                form="userForm"
                className="btn-primary"
              >
                {editingUser ? 'Save Changes' : 'Create User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
