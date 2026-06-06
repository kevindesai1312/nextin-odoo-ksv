import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Search, ChevronRight, Calculator, Clock, Users, X, Save, Send } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

export default function Quotations() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rfqs, setRfqs] = useState<any[]>([]);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'deadline' | 'bids' | 'title'>('deadline');
  
  // Vendor specific state
  const [activeRfqForQuote, setActiveRfqForQuote] = useState<any | null>(null);
  const [quoteItems, setQuoteItems] = useState<any[]>([]);
  const [taxPercent, setTaxPercent] = useState(18);
  const [deliveryDays, setDeliveryDays] = useState(7);
  const [notes, setNotes] = useState('Payment terms: 30 days net');
  const [attachments, setAttachments] = useState<{name: string, url: string}[]>([]);
  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      api.get('/api/rfqs'),
      api.get('/api/quotations')
    ])
    .then(([rfqRes, quoteRes]) => {
      const rData = Array.isArray(rfqRes.data) ? rfqRes.data : (rfqRes.data?.data || rfqRes);
      const qData = Array.isArray(quoteRes.data) ? quoteRes.data : (quoteRes.data?.data || quoteRes);
      setRfqs(Array.isArray(rData) ? rData : []);
      setQuotations(Array.isArray(qData) ? qData : []);
    })
    .catch(console.error)
    .finally(() => setLoading(false));
  };

  // --- VENDOR LOGIC ---
  const handleOpenQuoteForm = (rfq: any, existingQuote?: any) => {
    setActiveRfqForQuote(rfq);
    if (existingQuote) {
      setQuoteItems(existingQuote.items);
      setTaxPercent(existingQuote.taxGstPercent);
      setDeliveryDays(existingQuote.deliveryDays);
      setNotes(existingQuote.notes || '');
      setAttachments(existingQuote.attachments || []);
      setEditingQuoteId(existingQuote.id || existingQuote._id);
    } else {
      setQuoteItems(rfq.items.map((i: any) => ({
        ...i,
        unitPrice: 0,
        totalPrice: 0,
      })));
      setTaxPercent(18);
      setDeliveryDays(7);
      setNotes('Payment terms: 30 days net');
      setAttachments([]);
      setEditingQuoteId(null);
    }
  };

  const handleUpdateQuoteItem = (idx: number, price: number) => {
    const newItems = [...quoteItems];
    newItems[idx].unitPrice = price;
    newItems[idx].totalPrice = price * newItems[idx].qty;
    setQuoteItems(newItems);
  };

  const handleSubmitQuote = async () => {
    try {
      const subtotal = quoteItems.reduce((sum, i) => sum + i.totalPrice, 0);
      const gstAmount = Math.round(subtotal * (taxPercent / 100));
      const grandTotal = subtotal + gstAmount;

      const payload = {
        rfqId: activeRfqForQuote.id || activeRfqForQuote._id,
        vendorId: user?.id || (user as any)?._id || '661858a2f3a61b2a9c3d4e51', // Fallback to a dummy vendor ID if not fully wired
        items: quoteItems,
        status: 'Submitted',
        taxGstPercent: taxPercent,
        subtotal,
        gstAmount,
        grandTotal,
        deliveryDays,
        notes,
        attachments
      };

      if (editingQuoteId) {
        await api.put(`/api/quotations/${editingQuoteId}`, payload);
        alert('Quotation updated successfully!');
      } else {
        await api.post('/api/quotations', payload);
        alert('Quotation submitted successfully!');
      }
      setActiveRfqForQuote(null);
      fetchData(); // Refresh so they see their submitted quote
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to submit quotation');
    }
  };

  // --- OFFICER LOGIC ---
  const rfqsWithQuotes = rfqs.filter(rfq => rfq.status === 'Published' || rfq.status === 'Closed').map(rfq => {
    const quotes = quotations.filter(q => (q.rfqId === rfq.id) || (q.rfqId === rfq._id));
    return { ...rfq, quotes };
  });

  const filteredRfqs = rfqsWithQuotes.filter(r => 
    r.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.rfqNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedRfqs = [...filteredRfqs].sort((a, b) => {
    if (sortBy === 'deadline') {
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    }
    if (sortBy === 'bids') {
      return b.quotes.length - a.quotes.length; // Descending
    }
    return a.title.localeCompare(b.title);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 -blue-600"></div>
      </div>
    );
  }

  // ==========================================
  // VENDOR VIEW: SUBMIT QUOTATION FORM
  // ==========================================
  if (user?.role === 'Vendor' && activeRfqForQuote) {
    const subtotal = quoteItems.reduce((sum, i) => sum + i.totalPrice, 0);
    const taxAmount = Math.round(subtotal * (taxPercent / 100));
    const grandTotal = subtotal + taxAmount;

    return (
      <div className="animate-in fade-in duration-300 pb-12">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold -blue-900 font-nunito tracking-tight mb-1">
              Submit Quotation
            </h1>
            <p className="text-sm -blue-400 font-inter">
              RFQ: {activeRfqForQuote.rfqNumber} — {activeRfqForQuote.title}
            </p>
          </div>
          <button 
            onClick={() => setActiveRfqForQuote(null)}
            className="-blue-400 hover:-blue-700 p-2 rounded-full hover:-blue-100 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="-blue-100 border -blue-100 p-4 rounded-xl mb-6">
          <p className="text-sm -blue-900 font-inter">
            <strong className="font-semibold">Instructions:</strong> Provide your best unit prices for the requested items below. Your total will be calculated automatically.
          </p>
        </div>

        <div className="bg-white rounded-2xl border -blue-100 shadow-sm overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="-blue-100 border-b -blue-100">
                  <th className="py-3 px-6 text-xs font-semibold -blue-400 uppercase tracking-wider">Item Name</th>
                  <th className="py-3 px-6 text-xs font-semibold -blue-400 uppercase tracking-wider text-center">Req. Qty</th>
                  <th className="py-3 px-6 text-xs font-semibold -blue-400 uppercase tracking-wider text-center w-40">Unit Price (₹)</th>
                  <th className="py-3 px-6 text-xs font-semibold -blue-400 uppercase tracking-wider text-right">Total Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {quoteItems.map((item, i) => (
                  <tr key={i} className="hover:-blue-100/50">
                    <td className="py-3 px-6 text-sm font-medium -blue-900">{item.name}</td>
                    <td className="py-3 px-6 text-sm -blue-600 font-mono text-center">{item.qty} {item.unit}</td>
                    <td className="py-3 px-6 text-center">
                      <input
                        type="number"
                        min="0"
                        className="input-field text-center w-full"
                        value={item.unitPrice || ''}
                        onChange={(e) => handleUpdateQuoteItem(i, parseInt(e.target.value) || 0)}
                      />
                    </td>
                    <td className="py-3 px-6 text-sm font-mono font-medium -blue-900 text-right">
                      ₹{item.totalPrice.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="space-y-5 bg-white p-6 rounded-2xl border -blue-100 shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold -blue-700 mb-1.5">GST / Tax %</label>
                <input
                  type="number"
                  className="input-field w-full"
                  value={taxPercent}
                  onChange={(e) => setTaxPercent(parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold -blue-700 mb-1.5">Delivery (Days)</label>
                <input
                  type="number"
                  className="input-field w-full"
                  value={deliveryDays}
                  onChange={(e) => setDeliveryDays(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold -blue-700 mb-1.5">Terms & Notes</label>
              <textarea
                className="input-field w-full resize-y min-h-[80px]"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            
            {/* Attachments */}
            <div className="mt-4">
              <label className="block text-sm font-semibold -blue-700 mb-1.5">Attachments</label>
              <div className="border-2 border-dashed -blue-100 hover:-blue-400 transition-colors rounded-xl p-4 text-center relative">
                <input 
                  type="file" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setAttachments([...attachments, { name: e.target.files[0].name, url: 'https://example.com/mock.pdf' }]);
                    }
                  }} 
                />
                <p className="text-sm -blue-400">Click or drag files to upload</p>
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

          <div className="bg-white p-6 rounded-2xl border -blue-100 shadow-sm flex flex-col justify-center">
            <h4 className="text-base font-bold -blue-900 font-nunito mb-4 border-b -blue-100 pb-2">
              Quotation Summary
            </h4>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center text-sm -blue-600">
                <span>Subtotal</span>
                <span className="font-mono">₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm -blue-600">
                <span>GST ({taxPercent}%)</span>
                <span className="font-mono">₹{taxAmount.toLocaleString()}</span>
              </div>
              <div className="pt-3 border-t -blue-100 flex justify-between items-center">
                <span className="text-base font-bold -blue-900">Grand Total</span>
                <span className="text-2xl font-bold -blue-700 font-mono">₹{grandTotal.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button className="btn-outline flex-1 flex justify-center -blue-600 -blue-100">
                <Save size={18} /> Save Draft
              </button>
              <button onClick={handleSubmitQuote} className="btn-primary flex-1 flex justify-center -blue-600 hover:-blue-700">
                <Send size={18} /> {editingQuoteId ? 'Update Bid' : 'Submit Bid'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VENDOR VIEW: LIST OF RFQS THEY CAN BID ON
  // ==========================================
  if (user?.role === 'Vendor') {
    // Only show published RFQs
    const vendorRfqs = rfqs.filter(r => r.status === 'Published');
    
    return (
      <div className="animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold -blue-900 font-nunito tracking-tight mb-1">
              Available RFQs
            </h1>
            <p className="text-sm -blue-400 font-inter">
              Review requests and submit your best quotations
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {vendorRfqs.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-white rounded-2xl border -blue-100 shadow-sm">
              <FileText size={48} className="mx-auto -blue-100 mb-4" />
              <p className="-blue-400 font-inter">No RFQs available for bidding.</p>
            </div>
          ) : (
            vendorRfqs.map((rfq) => {
              const existingQuote = quotations.find(q => (q.rfqId === rfq.id || q.rfqId === rfq._id) && (q.vendorId === user?.id || q.vendorId === (user as any)?._id));
              const hasSubmitted = !!existingQuote;
              const isDeadlinePassed = new Date() > new Date(rfq.deadline);
              
              return (
                <div key={rfq.id} className="bg-white rounded-2xl border -blue-100 shadow-sm hover:shadow-md transition-all duration-200 p-6 flex flex-col h-full group">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-sm font-mono font-medium -blue-400 -blue-100 px-2 py-1 rounded-md border -blue-100">
                      {rfq.rfqNumber}
                    </span>
                    {hasSubmitted && (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider border -blue-100 -blue-700 -blue-100">
                        Bid Submitted
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-bold -blue-900 font-nunito leading-tight mb-2 flex-grow">
                    {rfq.title}
                  </h3>
                  
                  <div className="space-y-3 mt-4 pt-4 border-t -blue-100 mb-6">
                    <div className="flex justify-between items-center text-sm">
                      <span className="-blue-400 flex items-center gap-1.5"><Clock size={14} /> Deadline</span>
                      <span className="font-medium -blue-600">
                        {rfq.deadline ? new Date(rfq.deadline).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="-blue-400 flex items-center gap-1.5"><FileText size={14} /> Items Requested</span>
                      <span className="font-mono -blue-700">{rfq.items?.length || 0}</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleOpenQuoteForm(rfq, existingQuote)}
                    disabled={isDeadlinePassed && !hasSubmitted}
                    className={`w-full py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors ${
                      (isDeadlinePassed && !hasSubmitted)
                        ? 'bg-[#DBEAFE] text-[#60A5FA] cursor-not-allowed'
                        : 'bg-[#2563EB] text-white hover:bg-[#1D4ED8] shadow-sm hover:shadow'
                    }`}
                  >
                    {hasSubmitted && !isDeadlinePassed ? 'Edit Quotation' : hasSubmitted ? 'Quotation Locked' : isDeadlinePassed ? 'Deadline Passed' : 'Submit Quotation'}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // OFFICER VIEW: REVIEW RECEIVED BIDS
  // ==========================================
  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold -blue-900 font-nunito tracking-tight mb-1">
            Quotations Review
          </h1>
          <p className="text-sm -blue-400 font-inter">
            Review and compare vendor bids submitted against your RFQs
          </p>
        </div>
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
          <select
            className="input-field w-full sm:w-auto text-sm"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
          >
            <option value="deadline">Sort by Deadline</option>
            <option value="bids">Sort by Most Bids</option>
            <option value="title">Sort by Title</option>
          </select>
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="-blue-400" />
            </div>
            <input
              type="text"
              className="input-field pl-10 w-full text-sm"
              placeholder="Search RFQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {sortedRfqs.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-2xl border -blue-100 shadow-sm">
            <Calculator size={48} className="mx-auto -blue-100 mb-4" />
            <p className="-blue-400 font-inter mb-1">No published RFQs found.</p>
            <p className="text-sm -blue-400">Publish an RFQ to start receiving quotations.</p>
          </div>
        ) : (
          sortedRfqs.map((rfq) => (
            <div key={rfq.id} className="bg-white rounded-2xl border -blue-100 shadow-sm hover:shadow-md transition-all duration-200 p-6 flex flex-col h-full group">
              <div className="flex justify-between items-start mb-4">
                <span className="text-sm font-mono font-medium -blue-400 -blue-100 px-2 py-1 rounded-md border -blue-100">
                  {rfq.rfqNumber}
                </span>
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider border ${
                  rfq.quotes.length > 0 ? '-blue-100 -blue-700 -blue-100' : '-blue-100 -blue-600 -blue-100'
                }`}>
                  {rfq.quotes.length} Bid{rfq.quotes.length !== 1 ? 's' : ''} Received
                </span>
              </div>
              
              <h3 className="text-lg font-bold -blue-900 font-nunito leading-tight mb-2 flex-grow">
                {rfq.title}
              </h3>
              
              <div className="space-y-3 mt-4 pt-4 border-t -blue-100 mb-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="-blue-400 flex items-center gap-1.5"><Clock size={14} /> Deadline</span>
                  <span className="font-medium -blue-900">
                    {rfq.deadline ? new Date(rfq.deadline).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="-blue-400 flex items-center gap-1.5"><Users size={14} /> Invited Vendors</span>
                  <span className="font-mono -blue-700">{rfq.assignedVendors?.length || 0}</span>
                </div>
              </div>

              <button 
                onClick={() => navigate('/comparison', { state: { rfq, quotes: rfq.quotes } })}
                disabled={rfq.quotes.length === 0}
                className={`w-full py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors ${
                  rfq.quotes.length > 0 
                    ? 'bg-[#2563EB] text-white hover:bg-[#1D4ED8] shadow-sm hover:shadow group-hover:-translate-y-0.5 duration-200'
                    : 'bg-[#DBEAFE] text-[#60A5FA] cursor-not-allowed'
                }`}
              >
                {rfq.quotes.length > 0 ? (
                  <>Compare Bids <ChevronRight size={16} /></>
                ) : (
                  'Waiting for Bids...'
                )}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
