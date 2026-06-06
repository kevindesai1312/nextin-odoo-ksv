import { useState, useEffect } from 'react';
import { FileText, CheckCircle, Clock, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

export interface POItem {
  name: string;
  qty: number;
  unitPrice: number;
  total: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendorName: string;
  vendorAddress: string;
  vendorGstin: string;
  items: POItem[];
  subtotal: number;
  cgst: number;
  sgst: number;
  grandTotal: number;
  status: 'Pending Payment' | 'Paid' | 'Completed' | 'Active';
  poDate: string;
  invoiceDate: string;
  dueDate: string;
}

export default function PurchaseOrders() {
  const { user } = useAuth();
  const [pos, setPos] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedPo, setExpandedPo] = useState<string | null>(null);

  useEffect(() => {
    api.get('/api/purchase-orders')
      .then((res: any) => {
        // Handle both wrapper and direct array
        const data = Array.isArray(res.data) ? res.data : (res.data?.data || res);
        setPos(Array.isArray(data) ? data : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredPos = pos.filter(po => 
    po.poNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    po.vendorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    po.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleExpand = (id: string) => {
    setExpandedPo(expandedPo === id ? null : id);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid':
      case 'Completed':
        return '-blue-100 -blue-700 -blue-100';
      case 'Active':
      case 'Pending Payment':
        return '-blue-100 -blue-700 -blue-100';
      default:
        return '-blue-100 -blue-700 -blue-100';
    }
  };

  const handleGenerateInvoice = async (po: PurchaseOrder) => {
    try {
      await api.post('/api/invoices', {
        poId: po.id || (po as any)._id,
        invoiceNumber: `INV-${Date.now()}`,
        amount: po.grandTotal,
        status: 'Draft',
        issueDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      });
      alert('Invoice generated successfully!');
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to generate invoice');
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold -blue-900 font-nunito tracking-tight mb-1">
            Purchase Orders
          </h1>
          <p className="text-sm -blue-400 font-inter">
            Manage and track all purchase orders across your vendors
          </p>
        </div>
        
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="-blue-400" />
          </div>
          <input
            type="text"
            className="input-field pl-10 w-full"
            placeholder="Search POs, vendors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* PO List */}
      <div className="flex flex-col gap-4">
        {filteredPos.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border -blue-100 shadow-sm">
            <FileText size={48} className="mx-auto -blue-100 mb-4" />
            <p className="-blue-400 font-inter">No purchase orders found.</p>
          </div>
        ) : (
          filteredPos.map((po) => (
            <div key={po.id} className="bg-white rounded-2xl border -blue-100 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md">
              {/* Header / Summary Row */}
              <div 
                className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer hover:-blue-100/50 transition-colors"
                onClick={() => toggleExpand(po.id)}
              >
                <div className="flex items-start md:items-center gap-4 w-full md:w-auto">
                  <div className="h-12 w-12 rounded-full -blue-100 flex items-center justify-center flex-shrink-0">
                    <FileText size={20} className="-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold -blue-900 font-mono tracking-tight mb-1 flex items-center gap-2">
                      {po.poNumber}
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider border ${getStatusBadge(po.status)} flex items-center gap-1`}>
                        {po.status === 'Paid' || po.status === 'Completed' ? <CheckCircle size={10} /> : <Clock size={10} />}
                        {po.status}
                      </span>
                    </h3>
                    <p className="text-sm font-medium -blue-600 font-inter">{po.vendorName}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between w-full md:w-auto gap-8">
                  <div className="flex gap-8">
                    <div className="hidden sm:block">
                      <p className="text-xs -blue-400 font-inter font-medium uppercase tracking-wider mb-1">Date</p>
                      <p className="text-sm font-medium -blue-900 font-inter">
                        {po.poDate ? new Date(po.poDate).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs -blue-400 font-inter font-medium uppercase tracking-wider mb-1">Grand Total</p>
                      <p className="text-lg font-bold -blue-700 font-mono">
                        ₹{(po.grandTotal || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <button className="-blue-400 hover:-blue-600 p-2 rounded-full hover:-blue-100 transition-colors">
                    {expandedPo === po.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedPo === po.id && (
                <div className="border-t -blue-100 -blue-100/30 p-5 md:p-6 animate-in slide-in-from-top-2 duration-200">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Line Items Table */}
                    <div className="lg:col-span-2">
                      <h4 className="text-xs font-bold -blue-400 uppercase tracking-wider mb-4 font-inter">Line Items</h4>
                      <div className="bg-white border -blue-100 rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left">
                            <thead>
                              <tr className="-blue-100 border-b -blue-100">
                                <th className="py-3 px-4 text-xs font-semibold -blue-400 font-inter">Item</th>
                                <th className="py-3 px-4 text-xs font-semibold -blue-400 font-inter text-center">Qty</th>
                                <th className="py-3 px-4 text-xs font-semibold -blue-400 font-inter text-right">Unit Price</th>
                                <th className="py-3 px-4 text-xs font-semibold -blue-400 font-inter text-right">Total</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {(po.items || []).length > 0 ? (
                                po.items.map((item, idx) => (
                                  <tr key={idx} className="hover:-blue-100/50">
                                    <td className="py-3 px-4 text-sm font-medium -blue-900">{item.name}</td>
                                    <td className="py-3 px-4 text-sm -blue-600 font-mono text-center">{item.qty}</td>
                                    <td className="py-3 px-4 text-sm -blue-600 font-mono text-right">₹{(item.unitPrice || 0).toLocaleString()}</td>
                                    <td className="py-3 px-4 text-sm -blue-900 font-mono font-medium text-right">₹{(item.total || 0).toLocaleString()}</td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={4} className="py-6 text-center text-sm -blue-400 italic">No line items recorded.</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    {/* Summary Sidebar */}
                    <div>
                      <h4 className="text-xs font-bold -blue-400 uppercase tracking-wider mb-4 font-inter">Order Details</h4>
                      <div className="bg-white border -blue-100 rounded-xl p-5 space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm -blue-400 font-inter">Subtotal</span>
                          <span className="text-sm font-mono -blue-700">₹{(po.subtotal || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm -blue-400 font-inter">CGST/SGST</span>
                          <span className="text-sm font-mono -blue-700">₹{((po.cgst || 0) + (po.sgst || 0)).toLocaleString()}</span>
                        </div>
                        <div className="pt-3 border-t -blue-100 flex justify-between items-center">
                          <span className="text-sm font-bold -blue-900 font-inter">Grand Total</span>
                          <span className="text-lg font-bold -blue-700 font-mono">₹{(po.grandTotal || 0).toLocaleString()}</span>
                        </div>
                      </div>
                      
                      <div className="mt-4 bg-white border -blue-100 rounded-xl p-5">
                        <h5 className="text-xs font-bold -blue-400 uppercase tracking-wider mb-2 font-inter">Vendor Info</h5>
                        <p className="text-sm font-medium -blue-900 mb-1">{po.vendorName}</p>
                        {po.vendorAddress && <p className="text-xs -blue-400 leading-relaxed mb-2">{po.vendorAddress}</p>}
                        {po.vendorGstin && <p className="text-xs -blue-400 font-mono">GSTIN: {po.vendorGstin}</p>}
                      </div>
                    </div>
                    
                    {/* Actions */}
                    {user?.role === 'Vendor' && po.status !== 'Paid' && po.status !== 'Completed' && (
                      <div className="lg:col-span-3 mt-4 pt-4 border-t -blue-100 flex justify-end">
                         <button 
                           onClick={() => handleGenerateInvoice(po)}
                           className="btn-primary"
                         >
                           <FileText size={16} /> Generate Invoice
                         </button>
                      </div>
                    )}
                    
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
