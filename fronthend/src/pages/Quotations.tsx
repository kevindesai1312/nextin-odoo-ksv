import { useState } from 'react';
import { Send, Save } from 'lucide-react';

const initialItems = [
  { id: '1', name: 'Ergonomic chair', qty: 25, unitPrice: 3500, total: 87500, delivery: 7 },
  { id: '2', name: 'Standing desks', qty: 10, unitPrice: 9200, total: 92000, delivery: 14 },
];

export default function Quotations() {
  const [items, setItems] = useState(initialItems);
  const [taxPercent, setTaxPercent] = useState(18);
  const [notes, setNotes] = useState('Payment terms: 20 days net from delivery');

  const subtotal = items.reduce((sum, i) => sum + i.total, 0);
  const taxAmount = Math.round(subtotal * (taxPercent / 100));
  const grandTotal = subtotal + taxAmount;

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
          Submit Quotations
        </h1>
        <p
          style={{
            fontSize: '14px',
            color: '#64748B',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          RFQ: office furniture procurement q2 — deadline 15 june 2025
        </p>
      </div>

      {/* RFQ Summary */}
      <div
        style={{
          background: '#F8FBFA',
          borderRadius: '12px',
          padding: '16px 20px',
          marginBottom: '24px',
          border: '1px solid #E2E8F0',
        }}
      >
        <p
          style={{
            fontSize: '13px',
            color: '#64748B',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          <strong style={{ color: '#1E293B' }}>RFQ Summary:</strong> Ergonomic chair * 25, standing desk
          *10 — category Furniture
        </p>
      </div>

      {/* Your Quotation Table */}
      <div className="card-surface" style={{ marginBottom: '24px', padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F8FBFA' }}>
              {['Item', 'Qty', 'Unit Price', 'Total', 'Delivery (days)'].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: '12px 16px',
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
            {items.map((item, i) => (
              <tr
                key={item.id}
                style={{
                  background: i % 2 === 1 ? '#F8FBFA' : 'white',
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
                    textAlign: 'center',
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
                    textAlign: 'center',
                  }}
                >
                  <input
                    type="number"
                    value={item.unitPrice}
                    onChange={(e) => {
                      const newItems = [...items];
                      const price = parseInt(e.target.value) || 0;
                      newItems[i].unitPrice = price;
                      newItems[i].total = price * newItems[i].qty;
                      setItems(newItems);
                    }}
                    className="input-field"
                    style={{ width: '100px', textAlign: 'center', fontSize: '13px' }}
                  />
                </td>
                <td
                  style={{
                    padding: '12px 16px',
                    fontSize: '13px',
                    fontFamily: "'IBM Plex Mono', monospace",
                    color: '#1E293B',
                    textAlign: 'center',
                  }}
                >
                  {item.total.toLocaleString()}
                </td>
                <td
                  style={{
                    padding: '12px 16px',
                    fontSize: '13px',
                    fontFamily: "'IBM Plex Mono', monospace",
                    color: '#1E293B',
                    textAlign: 'center',
                  }}
                >
                  <input
                    type="number"
                    value={item.delivery}
                    onChange={(e) => {
                      const newItems = [...items];
                      newItems[i].delivery = parseInt(e.target.value) || 0;
                      setItems(newItems);
                    }}
                    className="input-field"
                    style={{ width: '80px', textAlign: 'center', fontSize: '13px' }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tax & Totals */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '24px',
          marginBottom: '24px',
        }}
      >
        {/* Left - Tax & Notes */}
        <div>
          <div style={{ marginBottom: '16px' }}>
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
              Tax / GST %
            </label>
            <input
              type="number"
              className="input-field"
              value={taxPercent}
              onChange={(e) => setTaxPercent(parseInt(e.target.value) || 0)}
              style={{ width: '100px' }}
            />
          </div>
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
              Note / terms
            </label>
            <textarea
              className="input-field"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{ resize: 'vertical' }}
            />
          </div>
        </div>

        {/* Right - Summary Box */}
        <div
          className="card-surface"
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '8px 0',
              borderBottom: '1px solid #E2E8F0',
            }}
          >
            <span
              style={{
                fontSize: '14px',
                color: '#64748B',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Subtotal
            </span>
            <span
              style={{
                fontSize: '14px',
                fontFamily: "'IBM Plex Mono', monospace",
                color: '#1E293B',
              }}
            >
              {subtotal.toLocaleString()}
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '8px 0',
              borderBottom: '1px solid #E2E8F0',
            }}
          >
            <span
              style={{
                fontSize: '14px',
                color: '#64748B',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              GST ({taxPercent}%)
            </span>
            <span
              style={{
                fontSize: '14px',
                fontFamily: "'IBM Plex Mono', monospace",
                color: '#1E293B',
              }}
            >
              {taxAmount.toLocaleString()}
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '12px 0 0',
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
                fontSize: '18px',
                fontWeight: 700,
                fontFamily: "'IBM Plex Mono', monospace",
                color: '#0D9488',
              }}
            >
              {grandTotal.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <button className="btn-primary">
          <Send size={16} />
          Submit Quotation
        </button>
        <button className="btn-outline">
          <Save size={16} />
          Save Draft
        </button>
      </div>
    </div>
  );
}
