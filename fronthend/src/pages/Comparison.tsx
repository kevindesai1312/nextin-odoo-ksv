import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, ArrowLeft, Calculator, AlertTriangle, Download } from 'lucide-react';
import { api } from '../lib/api';

export default function Comparison() {
  const navigate = useNavigate();
  const location = useLocation();
  const [submitting, setSubmitting] = useState(false);

  // Read state passed from Quotations.tsx
  const state = location.state as { rfq: any, quotes: any[] };

  if (!state || !state.rfq || !state.quotes || state.quotes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertTriangle size={48} className="-blue-600 mb-4" />
        <h2 className="text-xl font-bold -blue-900 mb-2">No Quotation Data</h2>
        <p className="-blue-400 mb-6 max-w-md">
          Please select an RFQ from the Quotations page to view and compare bids.
        </p>
        <button onClick={() => navigate('/quotations')} className="btn-primary">
          <ArrowLeft size={16} />
          Back to Quotations
        </button>
      </div>
    );
  }

  const { rfq, quotes } = state;

  const calculateTco = (quote: any) => {
    const penaltyPerDay = 500;
    const days = quote.deliveryDays || 0;
    return quote.grandTotal + (days * penaltyPerDay);
  };

  // Process and rank quotes to find the lowest based on TCO
  const sortedQuotes = [...quotes].sort((a, b) => calculateTco(a) - calculateTco(b));
  const lowestQuoteId = sortedQuotes.length > 0 ? sortedQuotes[0].id || sortedQuotes[0]._id : null;

  const criteria = [
    { key: 'grandTotal', label: 'Grand Total' },
    { key: 'deliveryPenalty', label: 'Est. Delivery Penalty' },
    { key: 'tco', label: 'Total Cost of Ownership (TCO)' },
    { key: 'taxGstPercent', label: 'GST %' },
    { key: 'deliveryDays', label: 'Delivery (days)' },
    { key: 'paymentTerms', label: 'Payment Terms' },
    { key: 'vendorRating', label: 'Vendor Rating' },
  ];

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Criteria," + sortedQuotes.map(q => `"${q.vendorName || 'Vendor'}"`).join(",") + "\n";
    
    criteria.forEach(c => {
      let row = `"${c.label}",`;
      row += sortedQuotes.map(q => {
        let val: any = '';
        if (c.key === 'grandTotal') val = q.grandTotal || 0;
        if (c.key === 'deliveryPenalty') val = (q.deliveryDays || 0) * 500;
        if (c.key === 'tco') val = calculateTco(q);
        if (c.key === 'taxGstPercent') val = q.taxGstPercent || 18;
        if (c.key === 'deliveryDays') val = q.deliveryDays || 'N/A';
        if (c.key === 'paymentTerms') val = q.paymentTerms || 'Standard';
        if (c.key === 'vendorRating') val = q.vendorRating || 'N/A';
        return `"${val}"`;
      }).join(",");
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Comparison_${rfq.rfqNumber}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSelectAndApprove = async (quoteId: string, vendorId: string) => {
    setSubmitting(true);
    try {
      const selectedQuote = quotes.find(q => (q.id || q._id) === quoteId);
      
      await api.post('/api/approvals', {
        rfqId: rfq.id || rfq._id,
        quotationId: quoteId,
        vendorId: vendorId,
        totalAmount: selectedQuote?.grandTotal || 0,
        steps: [
          { stepNumber: 1, stepLabel: 'L1 Review (Procurement)', approverRole: 'Manager', status: 'Pending' },
          { stepNumber: 2, stepLabel: 'L2 Review (Finance)', approverRole: 'Finance', status: 'Pending' },
          { stepNumber: 3, stepLabel: 'L3 Approval (Director)', approverRole: 'Director', status: 'Pending' },
          { stepNumber: 4, stepLabel: 'Generate PO', approverRole: 'System', status: 'Pending' }
        ]
      });
      alert('Approval Workflow Initiated Successfully!');
      navigate('/approvals');
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || error.message || 'Failed to initiate approval workflow';
      alert(`Error: ${msg}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="mb-8">
        <button 
          onClick={() => navigate('/quotations')}
          className="text-sm font-semibold text-[#60A5FA] hover:text-[#1E3A8A] flex items-center gap-1 mb-4 transition-colors w-fit"
        >
          <ArrowLeft size={16} />
          Back to RFQs
        </button>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-2xl font-bold -blue-900 font-nunito tracking-tight mb-1">
              Quotation Comparison
            </h1>
            <p className="text-sm -blue-400 font-inter flex items-center gap-2">
              <span className="font-mono -blue-600 -blue-100 px-1.5 py-0.5 rounded">{rfq.rfqNumber}</span> 
              &bull; {rfq.title}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleExportCSV} className="btn-outline flex items-center gap-2">
              <Download size={16} />
              Export CSV
            </button>
            <div className="-blue-100 -blue-700 px-4 py-2 rounded-lg text-sm font-semibold border -blue-100 flex items-center gap-2">
              <Calculator size={16} />
              {quotes.length} Bid{quotes.length !== 1 ? 's' : ''} Received
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-white rounded-2xl border -blue-100 shadow-sm overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="-blue-100 border-b -blue-100">
                <th className="py-4 px-6 text-xs font-semibold -blue-400 uppercase tracking-wider w-48 border-r -blue-100">
                  Criteria
                </th>
                {sortedQuotes.map((q) => {
                  const isLowest = (q.id || q._id) === lowestQuoteId;
                  return (
                    <th 
                      key={q.id || q._id} 
                      className={`py-4 px-6 text-center border-r -blue-100 last:border-r-0 min-w-[200px] ${
                        isLowest ? '-blue-100/50' : ''
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <span className={`text-sm font-bold font-inter mb-1 ${isLowest ? '-blue-700' : '-blue-900'}`}>
                          {q.vendorName || 'Unknown Vendor'}
                        </span>
                        {isLowest && (
                          <span className="inline-flex items-center gap-1 -blue-100 -blue-900 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                            Best TCO
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {criteria.map((c) => (
                <tr key={c.key} className="hover:-blue-100/30 transition-colors">
                  <td className="py-4 px-6 text-sm font-semibold -blue-700 -blue-100/50 border-r -blue-100 font-inter">
                    {c.label}
                  </td>
                  {sortedQuotes.map((q) => {
                    const isLowest = (q.id || q._id) === lowestQuoteId;
                    let value: string | number = '';
                    
                    switch (c.key) {
                      case 'grandTotal':
                        value = `₹${(q.grandTotal || 0).toLocaleString()}`;
                        break;
                      case 'deliveryPenalty':
                        value = `+ ₹${((q.deliveryDays || 0) * 500).toLocaleString()}`;
                        break;
                      case 'tco':
                        value = `₹${calculateTco(q).toLocaleString()}`;
                        break;
                      case 'taxGstPercent':
                        value = `${q.taxGstPercent || 18}%`;
                        break;
                      case 'deliveryDays':
                        value = `${q.deliveryDays || 'N/A'} Days`;
                        break;
                      case 'paymentTerms':
                        value = q.paymentTerms || 'Standard';
                        break;
                      case 'vendorRating':
                        value = q.vendorRating ? `${q.vendorRating}/5` : 'N/A';
                        break;
                    }
                    
                    return (
                      <td 
                        key={`${q.id || q._id}-${c.key}`} 
                        className={`py-4 px-6 text-center text-sm border-r -blue-100 last:border-r-0 ${
                          isLowest ? '-blue-100/30 font-medium -blue-900' : '-blue-700'
                        } ${(c.key === 'grandTotal' || c.key === 'tco') ? 'font-mono text-base font-bold' : 'font-inter'} ${c.key === 'tco' && isLowest ? 'text-emerald-700' : ''}`}
                      >
                        {value}
                      </td>
                    );
                  })}
                </tr>
              ))}
              
              {/* Action Row */}
              <tr className="-blue-100/50">
                <td className="py-6 px-6 border-r -blue-100"></td>
                {sortedQuotes.map((q) => {
                  const isLowest = (q.id || q._id) === lowestQuoteId;
                  return (
                    <td key={`action-${q.id || q._id}`} className={`py-6 px-6 text-center border-r -blue-100 last:border-r-0 ${isLowest ? '-blue-100/50' : ''}`}>
                      <button
                        onClick={() => handleSelectAndApprove(q.id || q._id, q.vendorId)}
                        disabled={submitting}
                        className={`w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                          isLowest 
                            ? 'bg-[#2563EB] text-white hover:bg-[#1D4ED8] shadow-sm hover:shadow-md' 
                            : 'bg-white border-2 border-[#DBEAFE] text-[#1D4ED8] hover:bg-[#DBEAFE]'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <CheckCircle size={16} />
                        Select & Approve
                      </button>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Note */}
      <p className="text-sm -blue-400 font-inter italic text-center">
        Selecting a vendor will automatically initiate the Purchase Order approval workflow.
      </p>
    </div>
  );
}
