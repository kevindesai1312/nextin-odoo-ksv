import { useState, useEffect } from 'react';
import { FileText, CheckCircle, Clock } from 'lucide-react';
import { api } from '../lib/api';

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
  status: 'Pending Payment' | 'Paid';
  poDate: string;
  invoiceDate: string;
  dueDate: string;
}

export default function PurchaseOrders() {
  const [pos, setPos] = useState<PurchaseOrder[]>([]);

  useEffect(() => {
    api.get('/api/purchase-orders').then(setPos).catch(console.error);
  }, []);

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
            Purchase Orders
          </h1>
          <p
            style={{
              fontSize: '14px',
              color: '#64748B',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Manage and track all purchase orders
          </p>
        </div>
      </div>

      {/* PO Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {pos.map((po) => (
          <div key={po.id} className="card-surface">
            {/* PO Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '20px',
                paddingBottom: '16px',
                borderBottom: '1px solid #E2E8F0',
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '4px',
                  }}
                >
                  <FileText size={18} color="#0D9488" />
                  <span
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: '16px',
                      fontWeight: 600,
                      color: '#1E293B',
                    }}
                  >
                    {po.poNumber}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: '13px',
                    color: '#64748B',
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {po.vendorName}
                </p>
              </div>
              <span
                className={`status-badge ${
                  po.status === 'Paid' ? 'status-badge-paid' : 'status-badge-pending'
                }`}
              >
                {po.status === 'Paid' ? (
                  <CheckCircle size={12} style={{ marginRight: '4px' }} />
                ) : (
                  <Clock size={12} style={{ marginRight: '4px' }} />
                )}
                {po.status}
              </span>
            </div>

            {/* PO Items Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px' }}>
              <thead>
                <tr style={{ background: '#F8FBFA' }}>
                  {['Item', 'Qty', 'Unit Price', 'Total'].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: '10px 12px',
                        textAlign: h === 'Item' ? 'left' : 'center',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#64748B',
                        textTransform: 'uppercase',
                        borderBottom: '1px solid #E2E8F0',
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
                      background: i % 2 === 1 ? '#F8FBFA' : 'white',
                      borderBottom: '1px solid #E2E8F0',
                    }}
                  >
                    <td
                      style={{
                        padding: '10px 12px',
                        fontSize: '13px',
                        fontFamily: "'Inter', sans-serif",
                        color: '#1E293B',
                      }}
                    >
                      {item.name}
                    </td>
                    <td
                      style={{
                        padding: '10px 12px',
                        fontSize: '13px',
                        fontFamily: "'IBM Plex Mono', monospace",
                        color: '#1E293B',
                        textAlign: 'center',
                      }}
                    >
                      {item.qty}
                    </td>
                    <td
                      style={{
                        padding: '10px 12px',
                        fontSize: '13px',
                        fontFamily: "'IBM Plex Mono', monospace",
                        color: '#1E293B',
                        textAlign: 'center',
                      }}
                    >
                      {item.unitPrice.toLocaleString()}
                    </td>
                    <td
                      style={{
                        padding: '10px 12px',
                        fontSize: '13px',
                        fontFamily: "'IBM Plex Mono', monospace",
                        color: '#1E293B',
                        textAlign: 'center',
                      }}
                    >
                      {item.total.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* PO Footer */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', gap: '24px' }}>
                <div>
                  <span
                    style={{
                      fontSize: '11px',
                      color: '#64748B',
                      fontFamily: "'Inter', sans-serif",
                      textTransform: 'uppercase',
                      fontWeight: 600,
                    }}
                  >
                    PO Date
                  </span>
                  <p
                    style={{
                      fontSize: '13px',
                      fontFamily: "'Inter', sans-serif",
                      color: '#1E293B',
                      marginTop: '2px',
                    }}
                  >
                    {po.poDate}
                  </p>
                </div>
                <div>
                  <span
                    style={{
                      fontSize: '11px',
                      color: '#64748B',
                      fontFamily: "'Inter', sans-serif",
                      textTransform: 'uppercase',
                      fontWeight: 600,
                    }}
                  >
                    Due Date
                  </span>
                  <p
                    style={{
                      fontSize: '13px',
                      fontFamily: "'Inter', sans-serif",
                      color: '#1E293B',
                      marginTop: '2px',
                    }}
                  >
                    {po.dueDate}
                  </p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span
                  style={{
                    fontSize: '11px',
                    color: '#64748B',
                    fontFamily: "'Inter', sans-serif",
                    textTransform: 'uppercase',
                    fontWeight: 600,
                  }}
                >
                  Grand Total
                </span>
                <p
                  style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    fontFamily: "'IBM Plex Mono', monospace",
                    color: '#0D9488',
                    marginTop: '2px',
                  }}
                >
                  {po.grandTotal.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
