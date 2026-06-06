import { useState } from 'react';
import { CheckCircle, Clock, XCircle } from 'lucide-react';
// import { api } from '../lib/api';

export interface ApprovalStep {
  step: number;
  label: string;
  status: 'completed' | 'current' | 'pending';
  approver?: string;
  role?: string;
  date?: string;
}

const steps: ApprovalStep[] = [
  { step: 1, label: 'Initiated', status: 'completed', approver: 'John Doe', role: 'Procurement', date: '10 Jun 2025' },
  { step: 2, label: 'L1 Review', status: 'current', approver: 'Jane Smith', role: 'Finance', date: '11 Jun 2025' },
  { step: 3, label: 'L2 Approval', status: 'pending', approver: 'Mike Johnson', role: 'Director', date: '' },
  { step: 4, label: 'Generate PO', status: 'pending', approver: 'System', role: 'Automated', date: '' },
];

export default function Approvals() {
  const [approvalSteps, setApprovalSteps] = useState<ApprovalStep[]>(steps);
  const [remarks, setRemarks] = useState('');

  const handleApprove = async () => {
    try {
      const currentStepObj = approvalSteps.find(s => s.status === 'current');
      if (!currentStepObj) return;

      // In a real app we'd pass the workflow ID. Here we mock calling the API.
      // await api.put(\`/api/approvals/\${workflowId}/steps/\${currentStepObj.step}\`, { status: 'Approved', remarks });
      
      const newSteps = approvalSteps.map((s) =>
        s.status === 'current' ? { ...s, status: 'completed' as const, remarks } : s
      );
      const nextPending = newSteps.find((s) => s.status === 'pending');
      if (nextPending) {
        const idx = newSteps.indexOf(nextPending);
        newSteps[idx] = { ...newSteps[idx], status: 'current' };
      }
      setApprovalSteps(newSteps);
      setRemarks('');
      alert('Step approved!');
    } catch (err) {
      console.error(err);
      alert('Failed to approve');
    }
  };

  const handleReject = async () => {
    try {
      // await api.put(\`/api/approvals/\${workflowId}/steps/\${currentStepObj.step}\`, { status: 'Rejected', remarks });
      alert('Procurement request rejected');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1
          style={{
            fontFamily: "'Nunito', sans-serif",
            fontSize: '24px',
            fontWeight: 600,
            color: '#1E293B',
            marginBottom: '4px',
          }}
        >
          Approval Workflow
        </h1>
        <p
          style={{
            fontSize: '14px',
            color: '#64748B',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          RFQ: office furniture Q2 — Vendor: Infra Supplies — 185,400
        </p>
      </div>

      {/* Step Indicator */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '28px',
          maxWidth: '500px',
        }}
      >
        {approvalSteps.map((s, i) => (
          <div key={s.step} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                border:
                  s.status === 'completed' || s.status === 'current'
                    ? '2px solid #0D9488'
                    : '2px solid #CBD5E1',
                background:
                  s.status === 'completed'
                    ? '#0D9488'
                    : s.status === 'current'
                    ? '#0D9488'
                    : 'white',
                color:
                  s.status === 'completed' || s.status === 'current'
                    ? 'white'
                    : '#94A3B8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: 600,
                fontFamily: "'Inter', sans-serif",
                flexShrink: 0,
              }}
            >
              {s.status === 'completed' ? (
                <CheckCircle size={14} />
              ) : (
                s.step
              )}
            </div>
            <span
              style={{
                marginLeft: '6px',
                fontSize: '11px',
                fontWeight: s.status === 'current' ? 600 : 400,
                color:
                  s.status === 'completed' || s.status === 'current'
                    ? '#0D9488'
                    : '#94A3B8',
                fontFamily: "'Inter', sans-serif",
                whiteSpace: 'nowrap',
              }}
            >
              {s.label}
            </span>
            {i < approvalSteps.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: '2px',
                  background:
                    s.status === 'completed' ? '#0D9488' : '#CBD5E1',
                  margin: '0 8px',
                  minWidth: '20px',
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Two Column Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '24px',
        }}
      >
        {/* Left - Approval Chain */}
        <div className="card-surface">
          <h4
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '11px',
              fontWeight: 600,
              color: '#64748B',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '16px',
            }}
          >
            Approval Chain
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            {approvalSteps
              .filter((s) => s.approver)
              .map((s) => (
                <div
                  key={s.step}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                  }}
                >
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background:
                        s.status === 'completed' ? '#D4F5E0' : '#FFF3CD',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {s.status === 'completed' ? (
                      <CheckCircle size={14} color="#0F766E" />
                    ) : (
                      <Clock size={14} color="#D97706" />
                    )}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: '14px',
                        fontWeight: 500,
                        fontFamily: "'Inter', sans-serif",
                        color: '#1E293B',
                      }}
                    >
                      {s.approver} ({s.role})
                    </div>
                    <div
                      style={{
                        fontSize: '12px',
                        fontFamily: "'Inter', sans-serif",
                        color:
                          s.status === 'completed' ? '#0F766E' : '#D97706',
                        marginTop: '2px',
                      }}
                    >
                      {s.status === 'completed'
                        ? `Approved on ${s.date}`
                        : `Awaiting — Assigned ${s.date}`}
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {/* Approval Remarks */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
                color: '#64748B',
                marginBottom: '6px',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Approval Remarks
            </label>
            <textarea
              className="input-field"
              rows={3}
              placeholder="Add your comments or conditions..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              style={{ resize: 'vertical' }}
            />
          </div>
        </div>

        {/* Right - Quotation Summary */}
        <div className="card-surface">
          <h4
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '11px',
              fontWeight: 600,
              color: '#64748B',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '16px',
            }}
          >
            Quotation Summary
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {[
              { label: 'Vendor', value: 'Infra Supplies PVT LTD' },
              { label: 'Total', value: '185,400', isMono: true },
              { label: 'Delivery', value: '10 days' },
              { label: 'Rating', value: '4.5/5' },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '12px 0',
                  borderBottom: '1px solid #E2E8F0',
                }}
              >
                <span
                  style={{
                    fontSize: '13px',
                    color: '#64748B',
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {item.label}
                </span>
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#1E293B',
                    fontFamily: item.isMono ? "'IBM Plex Mono', monospace" : "'Inter', sans-serif",
                  }}
                >
                  {item.value}
                </span>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={handleApprove}>
              <CheckCircle size={16} />
              Approve
            </button>
            <button
              className="btn-outline"
              style={{
                flex: 1,
                justifyContent: 'center',
                borderColor: '#FCA5A5',
                color: '#DC2626',
              }}
              onClick={handleReject}
            >
              <XCircle size={16} />
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
