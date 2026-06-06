import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, X, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';

export interface Vendor {
  id: string;
  name: string;
  category: string;
  gstNo: string;
  contactNo: string;
  status: 'Active' | 'Pending' | 'Blocked';
  email: string;
  address: string;
}

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'Active': return '-blue-100 -blue-700';
    case 'Pending': return '-blue-100 -blue-700';
    case 'Blocked': return '-blue-100 -blue-700';
    default: return '-blue-100 -blue-700';
  }
};

export default function Vendors() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [formError, setFormError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    gstNo: '',
    contactNo: '',
    email: '',
    address: '',
    status: 'Pending' as 'Active' | 'Pending' | 'Blocked'
  });

  const fetchVendors = async () => {
    try {
      const res = await api.get('/api/vendors');
      setVendors(res.data || []);
    } catch (error) {
      console.error('Failed to fetch vendors', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const openModal = (vendor?: Vendor) => {
    setFormError('');
    if (vendor) {
      setEditingVendor(vendor);
      setFormData({
        name: vendor.name || '',
        category: vendor.category || '',
        gstNo: vendor.gstNo || '',
        contactNo: vendor.contactNo || '',
        email: vendor.email || '',
        address: vendor.address || '',
        status: vendor.status || 'Pending'
      });
    } else {
      setEditingVendor(null);
      setFormData({
        name: '',
        category: '',
        gstNo: '',
        contactNo: '',
        email: '',
        address: '',
        status: 'Pending'
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingVendor(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    try {
      if (editingVendor) {
        await api.put(`/api/vendors/${editingVendor.id}`, formData);
      } else {
        await api.post('/api/vendors', formData);
      }
      
      await fetchVendors();
      closeModal();
    } catch (error: any) {
      const msg = error.response?.data?.message || 'An error occurred while saving the vendor.';
      setFormError(msg);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete vendor "${name}"? This action cannot be undone.`)) {
      try {
        await api.delete(`/api/vendors/${id}`);
        setVendors(vendors.filter(v => v.id !== id));
      } catch (error: any) {
        alert(error.response?.data?.message || 'Failed to delete vendor.');
      }
    }
  };

  // Compute dynamic counts
  const countAll = vendors.length;
  const countActive = vendors.filter(v => v.status === 'Active').length;
  const countPending = vendors.filter(v => v.status === 'Pending').length;
  const countBlocked = vendors.filter(v => v.status === 'Blocked').length;

  const tabs = [
    { label: 'All', count: countAll },
    { label: 'Active', count: countActive },
    { label: 'Pending', count: countPending },
    { label: 'Blocked', count: countBlocked },
  ];

  const filteredVendors = vendors.filter((v) => {
    const matchTab = activeTab === 'All' || v.status === activeTab;
    const searchLower = search.toLowerCase();
    const matchSearch =
      !search ||
      (v.name || '').toLowerCase().includes(searchLower) ||
      (v.gstNo || '').toLowerCase().includes(searchLower) ||
      (v.category || '').toLowerCase().includes(searchLower);
    return matchTab && matchSearch;
  });

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
            Vendors
          </h1>
          <p className="text-sm -blue-400 font-inter">
            Manage vendor profiles, registrations, and statuses
          </p>
        </div>
        <button className="btn-primary shadow-sm" onClick={() => openModal()}>
          <Plus size={16} />
          Add Vendor
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6 max-w-lg">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 -blue-400" />
        <input
          type="text"
          placeholder="Search by name, GST number, category..."
          className="input-field pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.label}
            onClick={() => setActiveTab(tab.label)}
            className={`px-4 py-2 rounded-full text-sm font-inter transition-all duration-200 ${
              activeTab === tab.label 
                ? '-blue-100 -blue-700 font-semibold shadow-sm ring-1 -blue-600/20' 
                : 'bg-white -blue-600 font-medium hover:-blue-100 ring-1 -blue-100 shadow-sm'
            }`}
          >
            {tab.label} <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${activeTab === tab.label ? '-blue-100' : '-blue-100 -blue-400'}`}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Vendors Table */}
      <div className="bg-white rounded-2xl border -blue-100 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="-blue-100/50 border-b -blue-100">
                <th className="py-4 px-6 text-xs font-semibold -blue-400 uppercase tracking-wider font-inter">Vendor Name</th>
                <th className="py-4 px-6 text-xs font-semibold -blue-400 uppercase tracking-wider font-inter">Category</th>
                <th className="py-4 px-6 text-xs font-semibold -blue-400 uppercase tracking-wider font-inter">GST No.</th>
                <th className="py-4 px-6 text-xs font-semibold -blue-400 uppercase tracking-wider font-inter">Contact</th>
                <th className="py-4 px-6 text-xs font-semibold -blue-400 uppercase tracking-wider font-inter">Status</th>
                <th className="py-4 px-6 text-xs font-semibold -blue-400 uppercase tracking-wider font-inter text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredVendors.map((vendor) => (
                <tr key={vendor.id} className="hover:-blue-100/50 transition-colors">
                  <td className="py-4 px-6">
                    <p className="text-sm font-medium -blue-900 font-inter">{vendor.name}</p>
                    <p className="text-xs -blue-400 font-inter mt-0.5">{vendor.email}</p>
                  </td>
                  <td className="py-4 px-6 text-sm -blue-600 font-inter">{vendor.category}</td>
                  <td className="py-4 px-6 text-sm font-mono -blue-700">{vendor.gstNo}</td>
                  <td className="py-4 px-6 text-sm font-mono -blue-700">{vendor.contactNo}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium font-inter ${getStatusBadgeClass(vendor.status)}`}>
                      {vendor.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button 
                      onClick={() => openModal(vendor)}
                      className="-blue-400 hover:-blue-600 transition-colors mr-3"
                      title="Edit Vendor"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(vendor.id, vendor.name)}
                      className="-blue-400 hover:-blue-600 transition-colors"
                      title="Delete Vendor"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              
              {filteredVendors.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center -blue-400 font-inter text-sm -blue-100/30">
                    No vendors found matching your criteria.
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
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b -blue-100 flex items-center justify-between">
              <h2 className="text-lg font-bold -blue-900 font-nunito">
                {editingVendor ? 'Edit Vendor Profile' : 'Register New Vendor'}
              </h2>
              <button 
                onClick={closeModal}
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
              
              <form id="vendorForm" onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium -blue-700 mb-1 font-inter">Vendor Name <span className="-blue-600">*</span></label>
                    <input 
                      type="text" 
                      required
                      className="input-field" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium -blue-700 mb-1 font-inter">Category <span className="-blue-600">*</span></label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. IT Hardware, Logistics"
                      className="input-field" 
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium -blue-700 mb-1 font-inter">GST Number <span className="-blue-600">*</span></label>
                    <input 
                      type="text" 
                      required
                      className="input-field font-mono" 
                      value={formData.gstNo}
                      onChange={(e) => setFormData({...formData, gstNo: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium -blue-700 mb-1 font-inter">Status</label>
                    <select 
                      className="input-field"
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value as 'Active'|'Pending'|'Blocked'})}
                    >
                      <option value="Active">Active</option>
                      <option value="Pending">Pending</option>
                      <option value="Blocked">Blocked</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium -blue-700 mb-1 font-inter">Email Address <span className="-blue-600">*</span></label>
                    <input 
                      type="email" 
                      required
                      className="input-field" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium -blue-700 mb-1 font-inter">Contact Number <span className="-blue-600">*</span></label>
                    <input 
                      type="text" 
                      required
                      className="input-field" 
                      value={formData.contactNo}
                      onChange={(e) => setFormData({...formData, contactNo: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium -blue-700 mb-1 font-inter">Physical Address</label>
                  <textarea 
                    className="input-field min-h-[80px] resize-y" 
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                </div>
              </form>
            </div>
            
            <div className="px-6 py-4 border-t -blue-100 -blue-100 flex justify-end gap-3 rounded-b-2xl">
              <button 
                type="button"
                onClick={closeModal}
                className="btn-outline bg-white"
              >
                Cancel
              </button>
              <button 
                type="submit"
                form="vendorForm"
                className="btn-primary"
              >
                {editingVendor ? 'Save Changes' : 'Register Vendor'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
