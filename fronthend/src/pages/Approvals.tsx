import { useState, useEffect } from 'react';
import { CheckCircle, Clock, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { api } from '../lib/api';

export default function Approvals() {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchWorkflows = async () => {
    try {
      const res = await api.get('/api/approvals');
      const data = Array.isArray(res.data) ? res.data : (res.data?.data || res.data);
      setWorkflows(data);
      if (data.length > 0 && !selectedId) {
        setSelectedId(data[0].id || data[0]._id);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const selectedWorkflow = workflows.find(w => (w.id || w._id) === selectedId);

  const handleAction = async (action: 'Approved' | 'Rejected' | 'Changes Requested') => {
    if (!selectedWorkflow) return;
    
    // Find current pending step
    const currentStep = selectedWorkflow.steps.find((s: any) => s.status === 'Pending' || s.status === 'Awaiting');
    if (!currentStep) {
      alert("No pending step found.");
      return;
    }

    try {
      await api.put(`/api/approvals/${selectedWorkflow.id || selectedWorkflow._id}/steps/${currentStep.stepNumber}`, {
        status: action,
        remarks
      });
      alert(`Workflow marked as ${action}`);
      setRemarks('');
      fetchWorkflows();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to update approval');
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
    <div className="animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold -blue-900 font-nunito tracking-tight mb-1">
            Approval Workflows
          </h1>
          <p className="text-sm -blue-400 font-inter">
            Review and act on pending procurement requests
          </p>
        </div>
        
        {workflows.length > 0 && (
          <select 
            className="input-field w-full md:w-64"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            {workflows.map(w => (
              <option key={w.id || w._id} value={w.id || w._id}>
                {w.rfqId} - {w.status}
              </option>
            ))}
          </select>
        )}
      </div>

      {!selectedWorkflow ? (
        <div className="text-center py-12 bg-white rounded-2xl border -blue-100 shadow-sm">
          <CheckCircle size={48} className="mx-auto -blue-100 mb-4" />
          <p className="-blue-400 font-inter">No pending approvals found.</p>
        </div>
      ) : (
        <>
          {/* Step Indicator */}
          <div className="flex items-center mb-8 max-w-3xl overflow-x-auto pb-4">
            {selectedWorkflow.steps.map((s: any, i: number) => {
              const isCompleted = s.status === 'Approved';
              const isCurrent = s.status === 'Pending' && selectedWorkflow.currentStep === s.stepNumber;
              const isRejected = s.status === 'Rejected';
              const isChangesReq = s.status === 'Changes Requested';

              let bgColor = isCompleted ? '#0D9488' : isCurrent ? '#0D9488' : isRejected ? '#DC2626' : isChangesReq ? '#F59E0B' : 'white';
              let borderColor = isCompleted || isCurrent ? '#0D9488' : isRejected ? '#DC2626' : isChangesReq ? '#F59E0B' : '#CBD5E1';
              let textColor = isCompleted || isCurrent || isRejected || isChangesReq ? 'white' : '#94A3B8';

              return (
                <div key={s.stepNumber} className="flex items-center flex-shrink-0">
                  <div
                    style={{ width: '28px', height: '28px', borderRadius: '50%', border: `2px solid ${borderColor}`, background: bgColor, color: textColor }}
                    className="flex items-center justify-center text-[11px] font-bold font-inter z-10"
                  >
                    {isCompleted ? <CheckCircle size={14} /> : isRejected ? <XCircle size={14} /> : isChangesReq ? <AlertCircle size={14} /> : s.stepNumber}
                  </div>
                  <span className={`ml-2 text-xs font-inter whitespace-nowrap ${isCurrent ? 'font-bold -blue-700' : 'font-medium -blue-400'}`}>
                    {s.stepLabel}
                  </span>
                  {i < selectedWorkflow.steps.length - 1 && (
                    <div className="flex-1 h-[2px] mx-2 min-w-[30px] md:min-w-[60px]" style={{ background: isCompleted ? '#0D9488' : '#CBD5E1' }} />
                  )}
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left - Approval Chain History */}
            <div className="bg-white rounded-2xl border -blue-100 shadow-sm p-6">
              <h4 className="text-xs font-bold -blue-400 uppercase tracking-wider mb-6">Approval Chain History</h4>
              <div className="space-y-6">
                {selectedWorkflow.steps.map((s: any) => (
                  <div key={s.stepNumber} className="flex items-start gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      s.status === 'Approved' ? '-blue-100/50 -blue-600' : 
                      s.status === 'Rejected' ? 'bg-red-50 text-red-600' :
                      s.status === 'Changes Requested' ? 'bg-amber-50 text-amber-600' :
                      'bg-slate-100 -blue-400'
                    }`}>
                      {s.status === 'Approved' ? <CheckCircle size={16} /> : 
                       s.status === 'Rejected' ? <XCircle size={16} /> : 
                       s.status === 'Changes Requested' ? <AlertCircle size={16} /> :
                       <Clock size={16} />}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-sm font-bold -blue-900 font-inter">{s.stepLabel} <span className="font-normal -blue-400 text-xs">({s.approverRole})</span></span>
                        {s.actionAt && <span className="text-[11px] -blue-400 font-mono">{new Date(s.actionAt).toLocaleDateString()}</span>}
                      </div>
                      <div className="text-xs font-medium" style={{
                        color: s.status === 'Approved' ? '#0F766E' : s.status === 'Rejected' ? '#DC2626' : s.status === 'Changes Requested' ? '#D97706' : '#94A3B8'
                      }}>
                        Status: {s.status}
                      </div>
                      {s.remarks && (
                        <div className="mt-2 text-sm -blue-600 font-inter bg-slate-50 p-2 rounded-lg border -blue-100">
                          <span className="font-semibold text-xs -blue-400 uppercase tracking-wider block mb-1">Notes:</span>
                          {s.remarks}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Actions */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border -blue-100 shadow-sm p-6">
                <h4 className="text-xs font-bold -blue-400 uppercase tracking-wider mb-4">Request Details</h4>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b -blue-100">
                    <span className="text-sm -blue-400">Total Amount</span>
                    <span className="font-mono font-bold text-lg -blue-900">₹{(selectedWorkflow.totalAmount || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b -blue-100">
                    <span className="text-sm -blue-400">RFQ ID</span>
                    <span className="font-mono text-sm -blue-600">{selectedWorkflow.rfqId}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b -blue-100">
                    <span className="text-sm -blue-400">Current Workflow Status</span>
                    <span className="text-sm font-semibold px-2 py-1 bg-slate-100 rounded-md -blue-700">{selectedWorkflow.status}</span>
                  </div>
                </div>
              </div>

              {(selectedWorkflow.status === 'Pending' || selectedWorkflow.status === 'Awaiting') && (
                <div className="bg-white rounded-2xl border -blue-100 shadow-sm p-6">
                  <h4 className="text-xs font-bold -blue-400 uppercase tracking-wider mb-4">Your Action</h4>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold -blue-700 mb-1.5">Remarks / Notes</label>
                    <textarea
                      className="input-field w-full resize-y min-h-[80px]"
                      placeholder="Add conditions, reasons for rejection, or changes required..."
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button onClick={() => handleAction('Approved')} className="btn-primary flex-1 flex justify-center bg-emerald-600 hover:bg-emerald-700 border-emerald-600 hover:border-emerald-700">
                      <CheckCircle size={16} /> Approve
                    </button>
                    <button onClick={() => handleAction('Changes Requested')} className="btn-outline flex-1 flex justify-center text-amber-600 border-amber-200 hover:bg-amber-50">
                      <RefreshCw size={16} /> Request Changes
                    </button>
                    <button onClick={() => handleAction('Rejected')} className="btn-outline flex-1 flex justify-center text-red-600 border-red-200 hover:bg-red-50">
                      <XCircle size={16} /> Reject
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
