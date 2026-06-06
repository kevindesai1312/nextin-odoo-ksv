import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { api } from '../lib/api';

interface Stats {
  kpis: {
    totalSpend: number;
    activeVendors: number;
    poFulfillment: number;
    overdueInvoices: number;
    totalRfqs: number;
    activeRfqs: number;
    approvalSuccessRate: number;
    cycleTimeDays: number;
  };
  categorySpend: { category: string; amount: number; color: string }[];
  topVendors: { name: string; spend: number; pos: number }[];
  monthlyTrend: { month: string; spend: number }[];
}

export default function Reports() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/dashboard/stats')
      .then((res: any) => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleExportCSV = () => {
    if (!stats) return;

    // Build CSV strings
    let csvContent = "data:text/csv;charset=utf-8,\n";
    
    // KPI Data
    csvContent += "REPORT SUMMARY\n";
    csvContent += `Total Spend (L),${stats.kpis.totalSpend}\n`;
    csvContent += `Active Vendors,${stats.kpis.activeVendors}\n`;
    csvContent += `Total POs,${stats.kpis.poFulfillment}\n`;
    csvContent += `Overdue Invoices,${stats.kpis.overdueInvoices}\n\n`;

    // Category Spend
    csvContent += "CATEGORY SPEND\n";
    csvContent += "Category,Spend (Lakhs)\n";
    stats.categorySpend.forEach(c => {
      csvContent += `${c.category},${c.amount}\n`;
    });
    csvContent += "\n";

    // Top Vendors
    csvContent += "TOP VENDORS\n";
    csvContent += "Vendor Name,Spend (INR),Total POs\n";
    stats.topVendors.forEach(v => {
      // Escape commas in names
      const name = v.name.includes(',') ? `"${v.name}"` : v.name;
      csvContent += `${name},${v.spend},${v.pos}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `vendorbridge_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 -blue-600"></div>
      </div>
    );
  }

  const maxSpend = Math.max(...stats.categorySpend.map((c) => c.amount), 1);

  return (
    <div className="animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-end mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold -blue-900 font-nunito tracking-tight mb-1">
            Reports & Analytics
          </h1>
          <p className="text-sm -blue-400 font-inter">
            Real-time Procurement Insights
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportCSV}
            className="btn-outline bg-white shadow-sm hover:-blue-100 transition-colors"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-2xl p-6 border -blue-100 shadow-sm text-center">
          <div className="text-3xl font-bold font-nunito -blue-700 mb-1">
            ₹{stats.kpis.totalSpend}L
          </div>
          <div className="text-xs font-medium -blue-400 font-inter uppercase tracking-wider">
            Total Spend
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border -blue-100 shadow-sm text-center">
          <div className="text-3xl font-bold font-nunito -blue-700 mb-1">
            {stats.kpis.activeVendors}
          </div>
          <div className="text-xs font-medium -blue-400 font-inter uppercase tracking-wider">
            Active Vendors
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border -blue-100 shadow-sm text-center">
          <div className="text-3xl font-bold font-nunito -blue-700 mb-1">
            {stats.kpis.poFulfillment}
          </div>
          <div className="text-xs font-medium -blue-400 font-inter uppercase tracking-wider">
            Total POs
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border -blue-100 shadow-sm text-center">
          <div className="text-3xl font-bold font-nunito -blue-600 mb-1">
            {stats.kpis.overdueInvoices}
          </div>
          <div className="text-xs font-medium -blue-400 font-inter uppercase tracking-wider">
            Overdue Invoices
          </div>
        </div>
      </div>
      
      {/* Secondary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-2xl p-6 border -blue-100 shadow-sm text-center">
          <div className="text-3xl font-bold font-nunito -blue-700 mb-1">
            {stats.kpis.activeRfqs} <span className="text-lg -blue-400">/ {stats.kpis.totalRfqs}</span>
          </div>
          <div className="text-xs font-medium -blue-400 font-inter uppercase tracking-wider">
            Active / Total RFQs
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border -blue-100 shadow-sm text-center">
          <div className="text-3xl font-bold font-nunito -blue-700 mb-1">
            {stats.kpis.approvalSuccessRate}%
          </div>
          <div className="text-xs font-medium -blue-400 font-inter uppercase tracking-wider">
            Approval Success Rate
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border -blue-100 shadow-sm text-center">
          <div className="text-3xl font-bold font-nunito -blue-700 mb-1">
            {stats.kpis.cycleTimeDays}d
          </div>
          <div className="text-xs font-medium -blue-400 font-inter uppercase tracking-wider">
            Avg Cycle Time
          </div>
        </div>
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Spend by Category */}
        <div className="bg-white rounded-2xl p-6 border -blue-100 shadow-sm flex flex-col">
          <h4 className="text-xs font-semibold -blue-400 font-inter uppercase tracking-wide mb-6">
            Spend by Category (Lakhs)
          </h4>
          <div className="flex flex-col gap-5 flex-1 justify-center">
            {stats.categorySpend.map((cat, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-medium -blue-900 font-inter">
                    {cat.category}
                  </span>
                  <span className="text-sm -blue-400 font-mono">
                    ₹{cat.amount}L
                  </span>
                </div>
                <div className="h-2 w-full -blue-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${(cat.amount / maxSpend) * 100}%`,
                      backgroundColor: cat.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Vendors by Spend */}
        <div className="bg-white rounded-2xl p-0 border -blue-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 pb-4 border-b -blue-100">
            <h4 className="text-xs font-semibold -blue-400 font-inter uppercase tracking-wide">
              Top Vendors by Spend
            </h4>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="-blue-100/50 border-b -blue-100">
                  <th className="py-3 px-6 text-xs font-semibold -blue-400 uppercase tracking-wider font-inter">Vendor</th>
                  <th className="py-3 px-6 text-xs font-semibold -blue-400 uppercase tracking-wider font-inter text-right">Spend (₹)</th>
                  <th className="py-3 px-6 text-xs font-semibold -blue-400 uppercase tracking-wider font-inter text-right">POs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.topVendors.map((v, i) => (
                  <tr key={i} className="hover:-blue-100/50 transition-colors">
                    <td className="py-3 px-6 text-sm font-medium -blue-900 font-inter">
                      {v.name}
                    </td>
                    <td className="py-3 px-6 text-sm font-mono -blue-700 text-right">
                      {v.spend.toLocaleString()}
                    </td>
                    <td className="py-3 px-6 text-sm font-mono -blue-700 text-right">
                      {v.pos}
                    </td>
                  </tr>
                ))}
                {stats.topVendors.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-8 text-center -blue-400 font-inter text-sm">
                      No vendor spend data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="bg-white rounded-2xl p-6 border -blue-100 shadow-sm">
        <h4 className="text-xs font-semibold -blue-400 font-inter uppercase tracking-wide mb-6">
          Monthly Spend Trend
        </h4>
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: '#64748B', fontFamily: "'Inter', sans-serif" }}
                axisLine={false}
                tickLine={false}
                dy={10}
              />
              <YAxis 
                hide={false}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#64748B', fontFamily: "'Inter', sans-serif" }}
                tickFormatter={(val) => `₹${val}L`}
              />
              <Tooltip
                contentStyle={{
                  background: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                  fontSize: '12px',
                  fontFamily: "'Inter', sans-serif",
                }}
                formatter={(value: number) => [`₹${value}L`, 'Spend']}
                cursor={{ fill: '#F1F5F9' }}
              />
              <Bar
                dataKey="spend"
                fill="#0D9488"
                radius={[4, 4, 0, 0]}
                barSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
