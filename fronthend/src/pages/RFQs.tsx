import { useState, useEffect } from 'react';
import { Plus, X, Upload, Save, Send, FileText, CheckCircle, Search, Clock, Users } from 'lucide-react';
import { api } from '../lib/api';

export interface RFQItem {
  id?: string;
  name: string;
  qty: number;
  unit: string;
}

export interface RFQ {
  id: string;
  rfqNumber: string;
  title: string;
  category: string;
  deadline: string;
  status: 'Draft' | 'Published' | 'Closed' | 'Cancelled';
  items: RFQItem[];
  assignedVendors: any[];
}

export default function RFQs() {
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'create'>('list');
  const [searchTerm, setSearchTerm] = useState('');

  // Create Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [deadline, setDeadline] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [attachments, setAttachments] = useState<{name: string, url: string}[]>([]);
  const [items, setItems] = useState<RFQItem[]>([]);
  const [selectedVendors, setSelectedVendors] = useState<any[]>([]);
  
  // New Item State
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState('');
  const [newItemUnit, setNewItemUnit] = useState('NOS');
  
  // UI State
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rfqRes, vendorRes] = await Promise.all([
        api.get('/api/rfqs'),
        api.get('/api/vendors')
      ]);
      const rfqData = Array.isArray(rfqRes.data) ? rfqRes.data : (rfqRes.data?.data || rfqRes);
      const vendorData = Array.isArray(vendorRes.data) ? vendorRes.data : (vendorRes.data?.data || vendorRes);
      
      setRfqs(Array.isArray(rfqData) ? rfqData : []);
      setVendors(Array.isArray(vendorData) ? vendorData : []);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    if (!newItemName || !newItemQty) return;
    setItems([
      ...items,
      { id: Date.now().toString(), name: newItemName, qty: parseInt(newItemQty), unit: newItemUnit },
    ]);
    setNewItemName('');
    setNewItemQty('');
  };

  const removeItem = (id?: string) => setItems(items.filter((i) => i.id !== id));

  const toggleVendor = (vendor: any) => {
    if (selectedVendors.find(v => v.id === vendor.id || v._id === vendor._id)) {
      setSelectedVendors(selectedVendors.filter(v => (v.id || v._id) !== (vendor.id || vendor._id)));
    } else {
      setSelectedVendors([...selectedVendors, vendor]);
    }
  };

  const handleSave = async (send = false) => {
    if (!title || !deadline) {
      alert("Title and Deadline are required");
      return;
    }

    try {
      const payload = {
        rfqNumber: `RFQ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        title,
        category,
        deadline,
        deliveryDate,
        budget: budget ? parseFloat(budget) : undefined,
        description,
        status: send ? 'Published' : 'Draft',
        attachments,
        items: items.map(i => ({ name: i.name, qty: i.qty, unit: i.unit })),
        assignedVendors: selectedVendors.map(v => v.id || v._id)
      };
      await api.post('/api/rfqs', payload);
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
      // Reset form and go back to list
      setTitle('');
      setCategory('');
      setDeadline('');
      setDeliveryDate('');
      setBudget('');
      setDescription('');
      setItems([]);
      setAttachments([]);
      setSelectedVendors([]);
      
      fetchData(); // Refresh list
      setView('list');
    } catch (err) {
      console.error(err);
      alert('Failed to save RFQ');
    }
  };

  const filteredRfqs = rfqs.filter(r => 
    r.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.rfqNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Published': return '-blue-100 -blue-700 -blue-100';
      case 'Draft': return '-blue-100 -blue-700 -blue-100';
      case 'Closed': return '-blue-100 -blue-700 -blue-100';
      default: return '-blue-100 -blue-700 -blue-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 -blue-600"></div>
      </div>
    );
  }

  // --- LIST VIEW ---
  if (view === 'list') {
    return (
      <div className="animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold -blue-900 font-nunito tracking-tight mb-1">
              Requests for Quotation (RFQs)
            </h1>
            <p className="text-sm -blue-400 font-inter">
              Manage procurement requests and solicit vendor bids
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="-blue-400" />
              </div>
              <input
                type="text"
                className="input-field pl-10 w-full"
                placeholder="Search RFQs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setView('create')}
              className="btn-primary w-full sm:w-auto flex justify-center"
            >
              <Plus size={16} />
              Create RFQ
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredRfqs.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-white rounded-2xl border -blue-100 shadow-sm">
              <FileText size={48} className="mx-auto -blue-100 mb-4" />
              <p className="-blue-400 font-inter">No RFQs found.</p>
              <button 
                onClick={() => setView('create')}
                className="mt-4 -blue-600 font-medium hover:-blue-700 hover:underline"
              >
                Create your first RFQ
              </button>
            </div>
          ) : (
            filteredRfqs.map((rfq) => (
              <div key={rfq.id} className="bg-white rounded-2xl border -blue-100 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider border ${getStatusBadge(rfq.status)}`}>
                    {rfq.status}
                  </span>
                  <span className="text-sm font-mono font-medium -blue-400 -blue-100 px-2 py-1 rounded-md">
                    {rfq.rfqNumber}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold -blue-900 font-nunito leading-tight mb-2 flex-grow">
                  {rfq.title}
                </h3>
                
                <div className="space-y-2 mt-4 pt-4 border-t -blue-100">
                  <div className="flex justify-between items-center text-sm">
                    <span className="-blue-400 flex items-center gap-1.5"><Clock size={14} /> Deadline</span>
                    <span className="font-medium -blue-900">
                      {rfq.deadline ? new Date(rfq.deadline).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="-blue-400 flex items-center gap-1.5"><FileText size={14} /> Line Items</span>
                    <span className="font-mono -blue-700">{rfq.items?.length || 0}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="-blue-400 flex items-center gap-1.5"><Users size={14} /> Vendors</span>
                    <span className="font-mono -blue-700">{rfq.assignedVendors?.length || 0}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // --- CREATE VIEW ---
  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold -blue-900 font-nunito tracking-tight mb-1">
            Create RFQ
          </h1>
          <p className="text-sm -blue-400 font-inter">
            Build a new request for quotation and assign vendors
          </p>
        </div>
        <button 
          onClick={() => setView('list')}
          className="-blue-400 hover:-blue-700 p-2 rounded-full hover:-blue-100 transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Form Fields */}
        <div className="space-y-5">
          <div className="bg-white p-6 rounded-2xl border -blue-100 shadow-sm space-y-5">
            <div>
              <label className="block text-sm font-semibold -blue-700 mb-1.5">
                RFQ Title <span className="-blue-600">*</span>
              </label>
              <input
                type="text"
                className="input-field w-full"
                placeholder="e.g. Q3 Office Supplies Procurement"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold -blue-700 mb-1.5">
                  Category
                </label>
                <input
                  type="text"
                  className="input-field w-full"
                  placeholder="e.g. Furniture"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold -blue-700 mb-1.5">
                  Deadline <span className="-blue-600">*</span>
                </label>
                <input
                  type="date"
                  className="input-field w-full"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold -blue-700 mb-1.5">
                  Budget (Optional)
                </label>
                <input
                  type="number"
                  className="input-field w-full"
                  placeholder="Max budget..."
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold -blue-700 mb-1.5">
                  Expected Delivery Date
                </label>
                <input
                  type="date"
                  className="input-field w-full"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold -blue-700 mb-1.5">
                Description & Terms
              </label>
              <textarea
                className="input-field w-full resize-y min-h-[100px]"
                placeholder="Describe the overall requirement..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            
            {/* Attachments UI */}
            <div>
              <label className="block text-sm font-semibold -blue-700 mb-1.5">
                Attachments
              </label>
              <div className="border-2 border-dashed -blue-100 hover:-blue-400 -blue-100 transition-colors rounded-xl p-8 text-center relative">
                <input 
                  type="file" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setAttachments([...attachments, { name: e.target.files[0].name, url: 'https://example.com/mock.pdf' }]);
                    }
                  }} 
                />
                <Upload size={24} className="mx-auto -blue-400 mb-2" />
                <p className="text-sm -blue-400 font-inter">
                  Drag & drop specifications or click to upload
                </p>
              </div>
              {attachments.length > 0 && (
                <div className="mt-3 space-y-2">
                  {attachments.map((file, i) => (
                    <div key={i} className="flex justify-between items-center bg-white p-2 border -blue-100 rounded-md">
                      <span className="text-xs font-medium -blue-900">{file.name}</span>
                      <button onClick={() => setAttachments(attachments.filter((_, idx) => idx !== i))} className="-blue-400 hover:-blue-600">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Line Items & Vendors */}
        <div className="space-y-6">
          
          {/* Line Items */}
          <div className="bg-white p-6 rounded-2xl border -blue-100 shadow-sm">
            <h4 className="text-base font-bold -blue-900 font-nunito mb-4">
              Line Items
            </h4>
            
            <div className="overflow-hidden rounded-xl border -blue-100 mb-4">
              <table className="w-full text-left">
                <thead>
                  <tr className="-blue-100 border-b -blue-100">
                    <th className="py-2.5 px-4 text-xs font-semibold -blue-400 uppercase">Item Name</th>
                    <th className="py-2.5 px-4 text-xs font-semibold -blue-400 uppercase text-center">Qty</th>
                    <th className="py-2.5 px-4 text-xs font-semibold -blue-400 uppercase text-center">Unit</th>
                    <th className="py-2.5 px-4 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-sm -blue-400 italic">No items added yet.</td>
                    </tr>
                  ) : (
                    items.map((item) => (
                      <tr key={item.id} className="hover:-blue-100">
                        <td className="py-2.5 px-4 text-sm font-medium -blue-900">{item.name}</td>
                        <td className="py-2.5 px-4 text-sm -blue-600 font-mono text-center">{item.qty}</td>
                        <td className="py-2.5 px-4 text-sm -blue-600 text-center">{item.unit}</td>
                        <td className="py-2.5 px-4 text-center">
                          <button onClick={() => removeItem(item.id)} className="-blue-400 hover:-blue-600 transition-colors p-1">
                            <X size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex gap-2 items-end">
              <div className="flex-grow">
                <input
                  type="text"
                  placeholder="Item name"
                  className="input-field w-full text-sm py-2"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                />
              </div>
              <div className="w-20">
                <input
                  type="number"
                  placeholder="Qty"
                  className="input-field w-full text-sm py-2"
                  value={newItemQty}
                  onChange={(e) => setNewItemQty(e.target.value)}
                />
              </div>
              <div className="w-20">
                <input
                  type="text"
                  placeholder="Unit"
                  className="input-field w-full text-sm py-2"
                  value={newItemUnit}
                  onChange={(e) => setNewItemUnit(e.target.value)}
                />
              </div>
              <button
                onClick={addItem}
                className="-blue-100 hover:-blue-100 -blue-700 p-2.5 rounded-lg transition-colors flex-shrink-0"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          {/* Vendors */}
          <div className="bg-white p-6 rounded-2xl border -blue-100 shadow-sm">
            <h4 className="text-base font-bold -blue-900 font-nunito mb-4">
              Invite Vendors
            </h4>
            
            <div className="flex flex-wrap gap-2 mb-6">
              {selectedVendors.length === 0 ? (
                <p className="text-sm -blue-400 italic">No vendors selected.</p>
              ) : (
                selectedVendors.map((v) => (
                  <span
                    key={v.id || v._id}
                    className="inline-flex items-center gap-1.5 px-3 py-1 -blue-100 -blue-700 rounded-full text-xs font-semibold tracking-wide border -blue-100"
                  >
                    {v.name}
                    <button onClick={() => toggleVendor(v)} className="hover:-blue-600 transition-colors">
                      <X size={12} />
                    </button>
                  </span>
                ))
              )}
            </div>

            <div className="border-t -blue-100 pt-4">
              <p className="text-xs font-bold -blue-400 uppercase tracking-wider mb-3">Available Vendors</p>
              <div className="max-h-[160px] overflow-y-auto space-y-1.5 pr-2">
                {vendors.filter(v => v.status === 'Approved').map(v => {
                  const isSelected = selectedVendors.some(sv => (sv.id || sv._id) === (v.id || v._id));
                  return (
                    <div 
                      key={v.id || v._id}
                      onClick={() => toggleVendor(v)}
                      className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer border transition-colors ${
                        isSelected ? '-blue-100/50 -blue-100' : 'bg-white -blue-100 hover:-blue-400'
                      }`}
                    >
                      <div>
                        <p className="text-sm font-medium -blue-900 leading-tight">{v.name}</p>
                        <p className="text-[11px] -blue-400">{v.categories?.join(', ') || 'General'}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        isSelected ? '-blue-600 -blue-600 text-white' : '-blue-100'
                      }`}>
                        {isSelected && <CheckCircle size={12} />}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button className="btn-outline -blue-100 -blue-700 bg-white" onClick={() => handleSave(false)}>
              <Save size={16} />
              Save Draft
            </button>
            <button className="btn-primary" onClick={() => handleSave(true)}>
              <Send size={16} />
              Publish RFQ
            </button>
          </div>

        </div>
      </div>

      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-6 right-6 -blue-100 -blue-900 px-6 py-4 rounded-xl border -blue-100 shadow-lg z-50 animate-in slide-in-from-top-4 flex items-center gap-3">
          <CheckCircle size={20} className="-blue-600" />
          <span className="font-semibold text-sm">RFQ successfully saved!</span>
        </div>
      )}
    </div>
  );
}
