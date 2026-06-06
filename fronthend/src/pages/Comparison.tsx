import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const comparisonData = {
  rfqTitle: 'office furniture procurement q2',
  quotationCount: 3,
  vendors: [
    {
      name: 'Infra Supplies',
      isLowest: true,
      grandTotal: 185000,
      gstPercent: 18,
      deliveryDays: 10,
      rating: 4.5,
      paymentTerms: '30 days',
    },
    {
      name: 'TechCore LTD',
      isLowest: false,
      grandTotal: 200010,
      gstPercent: 18,
      deliveryDays: 14,
      rating: 4.0,
      paymentTerms: '20 days',
    },
    {
      name: 'Office Wood Co.',
      isLowest: false,
      grandTotal: 214000,
      gstPercent: 18,
      deliveryDays: 7,
      rating: 3.8,
      paymentTerms: '15 days',
    },
  ],
};

const criteria = [
  { key: 'grandTotal', label: 'Grand Total' },
  { key: 'gstPercent', label: 'GST %' },
  { key: 'deliveryDays', label: 'Delivery (days)' },
  { key: 'rating', label: 'Vendor Rating' },
  { key: 'paymentTerms', label: 'Payment Terms' },
];

export default function Comparison() {
  const navigate = useNavigate();

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
          Quotation Comparison
        </h1>
        <p
          style={{
            fontSize: '14px',
            color: '#64748B',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          RFQ: {comparisonData.rfqTitle} — {comparisonData.quotationCount} quotations received
        </p>
      </div>

      {/* Comparison Table */}
      <div className="card-surface" style={{ padding: 0, overflow: 'hidden', marginBottom: '20px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F8FBFA' }}>
              <th
                style={{
                  padding: '14px 16px',
                  textAlign: 'left',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#64748B',
                  textTransform: 'uppercase',
                  borderBottom: '1px solid #E2E8F0',
                  fontFamily: "'Inter', sans-serif",
                  width: '160px',
                }}
              >
                Criteria
              </th>
              {comparisonData.vendors.map((v) => (
                <th
                  key={v.name}
                  style={{
                    padding: '14px 16px',
                    textAlign: 'center',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: v.isLowest ? '#0F766E' : '#1E293B',
                    textTransform: 'uppercase',
                    borderBottom: '1px solid #E2E8F0',
                    fontFamily: "'Inter', sans-serif",
                    background: v.isLowest ? '#D4F5E0' : 'transparent',
                  }}
                >
                  {v.name}
                  {v.isLowest && (
                    <span
                      style={{
                        display: 'block',
                        fontSize: '10px',
                        fontWeight: 500,
                        color: '#0F766E',
                        marginTop: '2px',
                      }}
                    >
                      (Lowest)
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {criteria.map((c) => (
              <tr key={c.key} style={{ borderBottom: '1px solid #E2E8F0' }}>
                <td
                  style={{
                    padding: '14px 16px',
                    fontSize: '13px',
                    fontWeight: 500,
                    fontFamily: "'Inter', sans-serif",
                    color: '#1E293B',
                    background: '#FAFBFC',
                  }}
                >
                  {c.label}
                </td>
                {comparisonData.vendors.map((v) => {
                  let value: string | number = '';
                  switch (c.key) {
                    case 'grandTotal':
                      value = v.grandTotal.toLocaleString();
                      break;
                    case 'gstPercent':
                      value = v.gstPercent;
                      break;
                    case 'deliveryDays':
                      value = v.deliveryDays;
                      break;
                    case 'rating':
                      value = `${v.rating}/5`;
                      break;
                    case 'paymentTerms':
                      value = v.paymentTerms;
                      break;
                  }
                  return (
                    <td
                      key={v.name + c.key}
                      style={{
                        padding: '14px 16px',
                        textAlign: 'center',
                        fontSize: '13px',
                        fontFamily: c.key === 'grandTotal' || c.key === 'gstPercent' || c.key === 'deliveryDays' ? "'IBM Plex Mono', monospace" : "'Inter', sans-serif",
                        color: '#1E293B',
                        background: v.isLowest ? '#D4F5E0' : 'transparent',
                        fontWeight: c.key === 'grandTotal' ? 600 : 400,
                      }}
                    >
                      {value}
                    </td>
                  );
                })}
              </tr>
            ))}
            {/* Action Row */}
            <tr>
              <td
                style={{
                  padding: '14px 16px',
                  background: '#FAFBFC',
                }}
              />
              {comparisonData.vendors.map((v) => (
                <td
                  key={v.name + 'action'}
                  style={{
                    padding: '14px 16px',
                    textAlign: 'center',
                    background: v.isLowest ? '#D4F5E0' : 'transparent',
                  }}
                >
                  {v.isLowest ? (
                    <button
                      className="btn-primary"
                      style={{ fontSize: '12px', padding: '8px 16px' }}
                      onClick={() => navigate('/approvals')}
                    >
                      <CheckCircle size={14} />
                      Select & Approve
                    </button>
                  ) : (
                    <button
                      className="btn-outline"
                      style={{ fontSize: '12px', padding: '8px 16px' }}
                    >
                      Select
                    </button>
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer Note */}
      <p
        style={{
          fontSize: '12px',
          color: '#94A3B8',
          fontFamily: "'Inter', sans-serif",
          fontStyle: 'italic',
        }}
      >
        Green = lowest price, selecting vendor initiates the approval workflow.
      </p>
    </div>
  );
}
