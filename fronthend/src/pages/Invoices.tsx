import { useState, useEffect } from 'react';
import { Printer, Mail, CheckCircle, Receipt, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { api } from '../lib/api';

export interface InvoiceItem {
  name: string;
  qty: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  poId: any;
  vendorId: any;
  vendorName?: string;
  vendorAddress?: string;
  vendorGstin?: string;
  poNumber?: string;
  items?: InvoiceItem[];
  invoiceDate: string;
  dueDate: string;
  subtotal: number;
  cgst: number;
  sgst: number;
  grandTotal: number;
  status: 'Pending' | 'Paid' | 'Overdue';
}

export default function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedInvoice, setExpandedInvoice] = useState<string | null>(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = () => {
    setLoading(true);
    api.get('/api/invoices')
      .then((res: any) => {
        const data = Array.isArray(res.data) ? res.data : (res.data?.data || res);
        setInvoices(Array.isArray(data) ? data : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleMarkPaid = async (id: string) => {
    try {
      await api.post(`/api/invoices/${id}/pay`);
      setInvoices(invoices.map(inv => inv.id === id ? { ...inv, status: 'Paid' } : inv));
    } catch (error) {
      console.error('Failed to mark invoice as paid', error);
      alert('Failed to update invoice status');
    }
  };

  const handleEmailInvoice = async (id: string) => {
    try {
      const res = await api.post(`/api/invoices/${id}/send`);
      if (res.data.previewUrl) {
        alert(`Email sent successfully!\nPreview URL (Ethereal test): ${res.data.previewUrl}`);
      } else {
        alert('Email sent successfully!');
      }
    } catch (error: any) {
      console.error('Failed to send email', error);
      alert(error.response?.data?.message || 'Failed to send email');
    }
  };

  const filteredInvoices = invoices.filter(inv => 
    inv.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (inv.poId?.poNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (inv.vendorId?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleExpand = (id: string) => {
    setExpandedInvoice(expandedInvoice === id ? null : id);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid':
        return '-blue-100 -blue-700 -blue-100';
      case 'Overdue':
        return '-blue-100 -blue-700 -blue-100';
      default:
        return '-blue-100 -blue-700 -blue-100';
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
            Invoices & Billing
          </h1>
          <p className="text-sm -blue-400 font-inter">
            Track vendor payments and manage overdue invoices
          </p>
        </div>
        
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="-blue-400" />
          </div>
          <input
            type="text"
            className="input-field pl-10 w-full"
            placeholder="Search invoices, POs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Invoice List */}
      <div className="flex flex-col gap-4">
        {filteredInvoices.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border -blue-100 shadow-sm">
            <Receipt size={48} className="mx-auto -blue-100 mb-4" />
            <p className="-blue-400 font-inter">No invoices found.</p>
          </div>
        ) : (
          filteredInvoices.map((inv) => {
            const vendorName = inv.vendorId?.name || inv.vendorName || 'Unknown Vendor';
            const poNumber = inv.poId?.poNumber || inv.poNumber || 'N/A';
            
            return (
              <div key={inv.id} className="bg-white rounded-2xl border -blue-100 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md">
                {/* Header / Summary Row */}
                <div 
                  className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer hover:-blue-100/50 transition-colors"
                  onClick={() => toggleExpand(inv.id)}
                >
                  <div className="flex items-start md:items-center gap-4 w-full md:w-auto">
                    <div className="h-12 w-12 rounded-full -blue-100 flex items-center justify-center flex-shrink-0">
                      <Receipt size={20} className="-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold -blue-900 font-mono tracking-tight mb-1 flex items-center gap-2">
                        {inv.invoiceNumber}
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider border ${getStatusBadge(inv.status)} flex items-center gap-1`}>
                          {inv.status === 'Paid' ? <CheckCircle size={10} /> : <span className="w-1.5 h-1.5 rounded-full bg-current"></span>}
                          {inv.status}
                        </span>
                      </h3>
                      <p className="text-sm font-medium -blue-600 font-inter">
                        {vendorName} &bull; <span className="-blue-400 font-mono text-xs ml-1">{poNumber}</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between w-full md:w-auto gap-8">
                    <div className="flex gap-8">
                      <div className="hidden sm:block">
                        <p className="text-xs -blue-400 font-inter font-medium uppercase tracking-wider mb-1">Due Date</p>
                        <p className={`text-sm font-medium font-inter ${inv.status === 'Overdue' ? '-blue-600' : '-blue-900'}`}>
                          {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs -blue-400 font-inter font-medium uppercase tracking-wider mb-1">Amount</p>
                        <p className="text-lg font-bold -blue-700 font-mono">
                          ₹{(inv.grandTotal || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <button className="-blue-400 hover:-blue-600 p-2 rounded-full hover:-blue-100 transition-colors">
                      {expandedInvoice === inv.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  </div>
                </div>

                {/* Expanded Invoice Document */}
                {expandedInvoice === inv.id && (
                  <div className="border-t -blue-100 -blue-100/30 p-5 md:p-8 animate-in slide-in-from-top-2 duration-200">
                    
                    <div className="flex justify-between items-start mb-8">
                      <div>
                        <h4 className="text-lg font-bold -blue-900 font-nunito mb-1">Invoice Document</h4>
                        <p className="text-xs -blue-400 font-inter">Billed to VendorBridge Corp.</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => window.print()} className="btn-outline bg-white px-3 py-1.5 text-xs">
                          <Printer size={14} className="mr-1" /> Print / PDF
                        </button>
                        <button onClick={() => handleEmailInvoice(inv.id)} className="btn-outline bg-white px-3 py-1.5 text-xs">
                          <Mail size={14} className="mr-1" /> Email Vendor
                        </button>
                      </div>
                    </div>

                    <div className="bg-white border -blue-100 rounded-xl p-6 md:p-8 shadow-sm">
                      {/* Bill To / Vendor Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 pb-8 border-b -blue-100">
                        <div>
                          <h4 className="text-xs font-bold -blue-400 uppercase tracking-wider mb-2 font-inter">Bill To</h4>
                          <p className="text-sm font-bold -blue-900 mb-1">VendorBridge Corp.</p>
                          <p className="text-sm -blue-400 leading-relaxed">
                            123 Business Park, Block A<br />
                            Tech District, Bangalore 560001<br />
                            GSTIN: 29AABCU9603R1ZX
                          </p>
                        </div>
                        <div className="md:text-right">
                          <h4 className="text-xs font-bold -blue-400 uppercase tracking-wider mb-2 font-inter">From Vendor</h4>
                          <p className="text-sm font-bold -blue-900 mb-1">{vendorName}</p>
                          <p className="text-sm -blue-400 leading-relaxed">
                            {inv.vendorId?.address || inv.vendorAddress || 'Address not provided'}<br />
                            GSTIN: {inv.vendorId?.gstin || inv.vendorGstin || 'Not provided'}
                          </p>
                        </div>
                      </div>

                      {/* Summary Metrics */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 pb-8 border-b -blue-100">
                        <div>
                          <p className="text-xs font-bold -blue-400 uppercase tracking-wider mb-1">Invoice No</p>
                          <p className="text-sm font-mono font-bold -blue-900">{inv.invoiceNumber}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold -blue-400 uppercase tracking-wider mb-1">PO Reference</p>
                          <p className="text-sm font-mono font-medium -blue-700">{poNumber}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold -blue-400 uppercase tracking-wider mb-1">Invoice Date</p>
                          <p className="text-sm font-inter font-medium -blue-700">
                            {inv.invoiceDate ? new Date(inv.invoiceDate).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-bold -blue-400 uppercase tracking-wider mb-1">Due Date</p>
                          <p className="text-sm font-inter font-medium -blue-700">
                            {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      </div>

                      {/* Totals Box */}
                      <div className="flex justify-end mt-8">
                        <div className="w-full md:w-72 space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm -blue-400 font-inter">Subtotal</span>
                            <span className="text-sm font-mono -blue-700">₹{(inv.subtotal || 0).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm -blue-400 font-inter">CGST (9%)</span>
                            <span className="text-sm font-mono -blue-700">₹{(inv.cgst || Math.round(inv.subtotal * 0.09)).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm -blue-400 font-inter">SGST (9%)</span>
                            <span className="text-sm font-mono -blue-700">₹{(inv.sgst || Math.round(inv.subtotal * 0.09)).toLocaleString()}</span>
                          </div>
                          <div className="pt-3 border-t -blue-100 flex justify-between items-center">
                            <span className="text-base font-bold -blue-900 font-inter">Grand Total</span>
                            <span className="text-xl font-bold -blue-700 font-mono">₹{(inv.grandTotal || 0).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Action Bar */}
                    <div className="mt-6 flex justify-end">
                      {inv.status !== 'Paid' && (
                        <button 
                          onClick={() => handleMarkPaid(inv.id)}
                          className="btn-primary -blue-600 hover:-blue-700 border-none px-6"
                        >
                          <CheckCircle size={16} />
                          Mark as Paid
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
