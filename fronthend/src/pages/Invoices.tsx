import { useState } from 'react';
import { Download, Printer, Mail, CheckCircle } from 'lucide-react';
import { purchaseOrders } from '../data/demoData';

export default function Invoices() {
  const [po] = useState(purchaseOrders[0]);
  const [status, setStatus] = useState(po.status);

  const handleMarkPaid = () => setStatus('Paid');

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '24px',
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "'Nunito', sans-serif",
              fontSize: '24px',
              fontWeight: 600,
              color: '#1E293B',
              marginBottom: '4px',
            }}
          >
            Purchase Order & Invoice
          </h1>
          <p
            style={{
              fontSize: '14px',
              color: '#64748B',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            PO-2024-auto-generated after approval
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-outline" style={{ fontSize: '12px', padding: '8px 14px' }}>
            <Download size={14} />
            Download PDF
          </button>
          <button className="btn-outline" style={{ fontSize: '12px', padding: '8px 14px' }}>
            <Printer size={14} />
            Print
          </button>
          <button className="btn-outline" style={{ fontSize: '12px', padding: '8px 14px' }}>
            <Mail size={14} />
            Email Invoice
          </button>
        </div>
      </div>

      {/* Invoice Document */}
      <div className="card-surface">
        {/* Bill To / Vendor Info */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '40px',
            marginBottom: '24px',
            paddingBottom: '20px',
            borderBottom: '1.5px solid #E2E8F0',
          }}
        >
          <div>
            <h4
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: '#64748B',
                textTransform: 'uppercase',
                fontFamily: "'Inter', sans-serif",
                marginBottom: '8px',
                letterSpacing: '0.5px',
              }}
            >
              Bill to
            </h4>
            <p
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#1E293B',
                fontFamily: "'Inter', sans-serif",
                marginBottom: '4px',
              }}
            >
              Your Organization Name
            </p>
            <p
              style={{
                fontSize: '13px',
                color: '#64748B',
                fontFamily: "'Inter', sans-serif",
                lineHeight: 1.6,
              }}
            >
              123, Business Park, Ahmedabad
              <br />
              GSTIN: 24AABCU9603R1ZX
            </p>
          </div>
          <div>
            <h4
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: '#64748B',
                textTransform: 'uppercase',
                fontFamily: "'Inter', sans-serif",
                marginBottom: '8px',
                letterSpacing: '0.5px',
              }}
            >
              Vendor
            </h4>
            <p
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#1E293B',
                fontFamily: "'Inter', sans-serif",
                marginBottom: '4px',
              }}
            >
              {po.vendorName}
            </p>
            <p
              style={{
                fontSize: '13px',
                color: '#64748B',
                fontFamily: "'Inter', sans-serif",
                lineHeight: 1.6,
              }}
            >
              {po.vendorAddress}
              <br />
              GSTIN: {po.vendorGstin}
            </p>
          </div>
        </div>

        {/* PO Details */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '20px',
            marginBottom: '24px',
            paddingBottom: '20px',
            borderBottom: '1.5px solid #E2E8F0',
          }}
        >
          {[
            { label: 'PO Number', value: po.poNumber },
            { label: 'Invoice Date', value: po.invoiceDate },
            { label: 'PO Date', value: po.poDate },
            { label: 'Due Date', value: po.dueDate },
          ].map((item) => (
            <div key={item.label}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#64748B',
                  textTransform: 'uppercase',
                  fontFamily: "'Inter', sans-serif",
                  letterSpacing: '0.5px',
                }}
              >
                {item.label}
              </span>
              <p
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#1E293B',
                  fontFamily: item.label === 'PO Number' ? "'IBM Plex Mono', monospace" : "'Inter', sans-serif",
                  marginTop: '4px',
                }}
              >
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {/* Items Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
          <thead>
            <tr style={{ background: '#F8FBFA' }}>
              {['Item', 'Qty', 'Unit Price', 'Total'].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: '12px 16px',
                    textAlign: h === 'Item' ? 'left' : 'right',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#64748B',
                    textTransform: 'uppercase',
                    borderBottom: '1.5px solid #CBD5E1',
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {po.items.map((item, i) => (
              <tr
                key={i}
                style={{
                  borderBottom: '1px solid #E2E8F0',
                }}
              >
                <td
                  style={{
                    padding: '12px 16px',
                    fontSize: '14px',
                    fontFamily: "'Inter', sans-serif",
                    color: '#1E293B',
                    fontWeight: 500,
                  }}
                >
                  {item.name}
                </td>
                <td
                  style={{
                    padding: '12px 16px',
                    fontSize: '13px',
                    fontFamily: "'IBM Plex Mono', monospace",
                    color: '#1E293B',
                    textAlign: 'right',
                  }}
                >
                  {item.qty}
                </td>
                <td
                  style={{
                    padding: '12px 16px',
                    fontSize: '13px',
                    fontFamily: "'IBM Plex Mono', monospace",
                    color: '#1E293B',
                    textAlign: 'right',
                  }}
                >
                  {item.unitPrice.toLocaleString()}
                </td>
                <td
                  style={{
                    padding: '12px 16px',
                    fontSize: '13px',
                    fontFamily: "'IBM Plex Mono', monospace",
                    color: '#1E293B',
                    textAlign: 'right',
                  }}
                >
                  {item.total.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            borderTop: '1.5px solid #CBD5E1',
            paddingTop: '20px',
          }}
        >
          <div style={{ width: '280px' }}>
            {[
              { label: 'Subtotal', value: po.subtotal.toLocaleString() },
              { label: `CGST (9%)`, value: po.cgst.toLocaleString() },
              { label: `SGST (9%)`, value: po.sgst.toLocaleString() },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '6px 0',
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
                    fontFamily: "'IBM Plex Mono', monospace",
                    color: '#1E293B',
                  }}
                >
                  {item.value}
                </span>
              </div>
            ))}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '12px 0 0',
                borderTop: '1.5px solid #CBD5E1',
                marginTop: '8px',
              }}
            >
              <span
                style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  color: '#1E293B',
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Grand Total
              </span>
              <span
                style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  fontFamily: "'IBM Plex Mono', monospace",
                  color: '#0D9488',
                }}
              >
                {po.grandTotal.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Status Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginTop: '20px',
          padding: '16px 24px',
          background: 'white',
          borderRadius: '16px',
          border: '1.5px solid #CBD5E1',
        }}
      >
        <span
          className={`status-badge ${
            status === 'Paid' ? 'status-badge-paid' : 'status-badge-pending'
          }`}
          style={{ fontSize: '13px' }}
        >
          {status === 'Paid' ? (
            <CheckCircle size={14} style={{ marginRight: '4px' }} />
          ) : (
            <Mail size={14} style={{ marginRight: '4px' }} />
          )}
          Status: {status}
        </span>
        {status === 'Pending Payment' && (
          <button
            onClick={handleMarkPaid}
            style={{
              background: 'none',
              border: 'none',
              color: '#0D9488',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: "'Inter', sans-serif",
              textDecoration: 'underline',
            }}
          >
            Mark as Paid
          </button>
        )}
      </div>
    </div>
  );
}
