import { useState } from 'react';
import { Plus, X, Upload, Save, Send } from 'lucide-react';
import { api } from '../lib/api';

export interface RFQItem {
  id?: string;
  name: string;
  qty: number;
  unit: string;
}

export default function RFQs() {
  const [step] = useState(1);
  const [title, setTitle] = useState('Office Furniture procurement Q2');
  const [category, setCategory] = useState('Furniture');
  const [deadline, setDeadline] = useState('2025-06-15');
  const [description, setDescription] = useState('Ergonomic chairs and standing desks for 3rd floor');
  const [items, setItems] = useState<RFQItem[]>([
    { id: '1', name: 'Ergonomic chair', qty: 25, unit: 'NOS' },
    { id: '2', name: 'Standing desks', qty: 10, unit: 'NOS' },
  ]);
  const [vendors, setVendors] = useState<string[]>(['Infra Supplies Pvt Ltd', 'Techcore LTD']);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState('');
  const [newItemUnit, setNewItemUnit] = useState('NOS');
  const [newVendor, setNewVendor] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const addItem = () => {
    if (!newItemName || !newItemQty) return;
    setItems([
      ...items,
      { id: Date.now().toString(), name: newItemName, qty: parseInt(newItemQty), unit: newItemUnit },
    ]);
    setNewItemName('');
    setNewItemQty('');
  };

  const removeItem = (id?: string) => setItems(items.filter((i) => i.id !== id));

  const addVendor = () => {
    if (!newVendor || vendors.includes(newVendor)) return;
    setVendors([...vendors, newVendor]);
    setNewVendor('');
  };

  const removeVendor = (v: string) => setVendors(vendors.filter((ven) => ven !== v));

  const handleSave = async (send = false) => {
    try {
      const payload = {
        rfqNumber: `RFQ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        title,
        category,
        deadline,
        description,
        status: send ? 'Published' : 'Draft',
        items: items.map(i => ({ name: i.name, qty: i.qty, unit: i.unit })),
      };
      await api.post('/api/rfqs', payload);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert('Failed to save RFQ');
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
          Create RFQ's
        </h1>
        <p
          style={{
            fontSize: '14px',
            color: '#64748B',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          New request for quotation
        </p>
      </div>

      {/* Step Indicator */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0',
          marginBottom: '28px',
          maxWidth: '400px',
        }}
      >
        {[1, 2, 3].map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                border: `2px solid ${s <= step ? '#0D9488' : '#CBD5E1'}`,
                background: s <= step ? '#0D9488' : 'white',
                color: s <= step ? 'white' : '#94A3B8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 600,
                fontFamily: "'Inter', sans-serif",
                flexShrink: 0,
              }}
            >
              {s}
            </div>
            {i < 2 && (
              <div
                style={{
                  flex: 1,
                  height: '2px',
                  background: s < step ? '#0D9488' : '#CBD5E1',
                  margin: '0 8px',
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Form Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '24px',
          marginBottom: '24px',
        }}
      >
        {/* Left Column - Form Fields */}
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
              RFQ's Title <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <input
              type="text"
              className="input-field"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

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
              Category
            </label>
            <input
              type="text"
              className="input-field"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>

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
              Deadline <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <input
              type="date"
              className="input-field"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>

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
              Description
            </label>
            <textarea
              className="input-field"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ resize: 'vertical' }}
            />
          </div>
        </div>

        {/* Right Column - Line Items & Vendors */}
        <div>
          {/* Line Items */}
          <div className="card-surface" style={{ marginBottom: '16px', padding: '16px' }}>
            <h4
              style={{
                fontFamily: "'Nunito', sans-serif",
                fontSize: '14px',
                fontWeight: 600,
                marginBottom: '12px',
                color: '#1E293B',
              }}
            >
              Line Items
            </h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12px' }}>
              <thead>
                <tr style={{ background: '#F8FBFA' }}>
                  {['Item', 'Qty', 'Unit', ''].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: '8px',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#64748B',
                        textTransform: 'uppercase',
                        textAlign: 'left',
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '8px', fontSize: '13px', fontFamily: "'Inter', sans-serif" }}>
                      {item.name}
                    </td>
                    <td
                      style={{
                        padding: '8px',
                        fontSize: '13px',
                        fontFamily: "'IBM Plex Mono', monospace",
                      }}
                    >
                      {item.qty}
                    </td>
                    <td style={{ padding: '8px', fontSize: '13px', fontFamily: "'Inter', sans-serif" }}>
                      {item.unit}
                    </td>
                    <td style={{ padding: '8px' }}>
                      <button
                        onClick={() => removeItem(item.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#94A3B8',
                          cursor: 'pointer',
                          padding: '2px',
                        }}
                      >
                        <X size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Add Item Row */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input
                type="text"
                placeholder="Item name"
                className="input-field"
                style={{ flex: 1, fontSize: '12px', padding: '8px 10px' }}
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
              />
              <input
                type="number"
                placeholder="Qty"
                className="input-field"
                style={{ width: '60px', fontSize: '12px', padding: '8px 10px' }}
                value={newItemQty}
                onChange={(e) => setNewItemQty(e.target.value)}
              />
              <input
                type="text"
                placeholder="Unit"
                className="input-field"
                style={{ width: '60px', fontSize: '12px', padding: '8px 10px' }}
                value={newItemUnit}
                onChange={(e) => setNewItemUnit(e.target.value)}
              />
            </div>
            <button
              onClick={addItem}
              style={{
                background: 'none',
                border: 'none',
                color: '#0D9488',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Plus size={14} />
              add line item
            </button>
          </div>

          {/* Assign Vendors */}
          <div className="card-surface" style={{ padding: '16px', marginBottom: '16px' }}>
            <h4
              style={{
                fontFamily: "'Nunito', sans-serif",
                fontSize: '14px',
                fontWeight: 600,
                marginBottom: '12px',
                color: '#1E293B',
              }}
            >
              Assign Vendors
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
              {vendors.map((v) => (
                <span
                  key={v}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    background: '#E8F5F0',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontFamily: "'Inter', sans-serif",
                    color: '#1E293B',
                  }}
                >
                  {v}
                  <button
                    onClick={() => removeVendor(v)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#94A3B8',
                      cursor: 'pointer',
                      padding: 0,
                      display: 'flex',
                    }}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Vendor name"
                className="input-field"
                style={{ flex: 1, fontSize: '12px', padding: '8px 10px' }}
                value={newVendor}
                onChange={(e) => setNewVendor(e.target.value)}
              />
              <button
                onClick={addVendor}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#0D9488',
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif",
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  whiteSpace: 'nowrap',
                }}
              >
                <Plus size={14} />
                add vendor
              </button>
            </div>
          </div>

          {/* Attachments */}
          <div
            style={{
              border: '2px dashed #CBD5E1',
              borderRadius: '12px',
              padding: '24px',
              textAlign: 'center',
              cursor: 'pointer',
            }}
          >
            <Upload size={24} color="#94A3B8" style={{ marginBottom: '8px' }} />
            <p
              style={{
                fontSize: '13px',
                color: '#94A3B8',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Drag & drop files or click to upload
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <button className="btn-primary" onClick={() => handleSave(true)}>
          <Send size={16} />
          Save & Send to Vendors
        </button>
        <button className="btn-outline" onClick={() => handleSave(false)}>
          <Save size={16} />
          Save as Draft
        </button>
      </div>

      {/* Success Toast */}
      {showSuccess && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: '#D4F5E0',
            color: '#0F766E',
            padding: '12px 20px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 500,
            fontFamily: "'Inter', sans-serif",
            zIndex: 200,
            animation: 'slideIn 0.3s ease',
          }}
        >
          RFQ saved successfully!
        </div>
      )}
    </div>
  );
}
