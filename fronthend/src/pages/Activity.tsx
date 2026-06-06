import { useState } from 'react';
import { CheckCircle, Clock, FileText, UserPlus, Receipt } from 'lucide-react';
import { activityLogs as logs } from '../data/demoData';

const filterTabs = ['All', 'RFQ', 'Approvals', 'Invoices', 'Vendors'];

const iconMap: Record<string, React.ElementType> = {
  check: CheckCircle,
  clock: Clock,
  file: FileText,
  user: UserPlus,
  'file-text': Receipt,
};

const colorMap: Record<string, { bg: string; color: string }> = {
  check: { bg: '#D4F5E0', color: '#0F766E' },
  clock: { bg: '#DBEAFE', color: '#1E40AF' },
  file: { bg: '#E8F5F0', color: '#0D9488' },
  user: { bg: '#FED7AA', color: '#C2410C' },
  'file-text': { bg: '#E9D5FF', color: '#7C3AED' },
};

export default function Activity() {
  const [activeTab, setActiveTab] = useState('All');

  const filtered =
    activeTab === 'All'
      ? logs
      : logs.filter((l) => l.type.toLowerCase() === activeTab.toLowerCase());

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
          Activity & Logs
        </h1>
        <p
          style={{
            fontSize: '14px',
            color: '#64748B',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          Procurement audit trail
        </p>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {filterTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 20px',
              borderRadius: '8px',
              border: activeTab === tab ? 'none' : '1.5px solid #CBD5E1',
              fontSize: '13px',
              fontWeight: activeTab === tab ? 600 : 400,
              fontFamily: "'Inter', sans-serif",
              background: activeTab === tab ? '#0D9488' : 'white',
              color: activeTab === tab ? 'white' : '#64748B',
              cursor: 'pointer',
              transition: 'all 150ms ease',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Activity Timeline */}
      <div className="card-surface">
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {filtered.map((log, i) => {
            const Icon = iconMap[log.icon] || FileText;
            const colors = colorMap[log.icon] || { bg: '#F1F5F9', color: '#64748B' };
            return (
              <div
                key={log.id}
                style={{
                  display: 'flex',
                  gap: '16px',
                  padding: '16px 0',
                  borderBottom: i < filtered.length - 1 ? '1px solid #E2E8F0' : 'none',
                  position: 'relative',
                }}
              >
                {/* Timeline line */}
                {i < filtered.length - 1 && (
                  <div
                    style={{
                      position: 'absolute',
                      left: '15px',
                      top: '48px',
                      bottom: '-4px',
                      width: '2px',
                      background: '#E2E8F0',
                    }}
                  />
                )}

                {/* Icon */}
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: colors.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={14} color={colors.color} />
                </div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      fontSize: '14px',
                      fontFamily: "'Inter', sans-serif",
                      color: '#1E293B',
                      lineHeight: 1.5,
                      marginBottom: '4px',
                    }}
                  >
                    {log.description}
                  </p>
                  <p
                    style={{
                      fontSize: '12px',
                      fontFamily: "'Inter', sans-serif",
                      color: '#94A3B8',
                    }}
                  >
                    {log.timestamp}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
