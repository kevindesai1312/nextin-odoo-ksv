import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, UserPlus, Receipt, TrendingUp, DollarSign, Users, Activity } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, 
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

const getStatusBadge = (status: string) => {
  const map: Record<string, string> = {
    Approved: 'status-badge-active',
    Pending: 'status-badge-pending',
    Draft: 'status-badge-draft',
    Paid: 'status-badge-paid',
  };
  return map[status] || 'status-badge-draft';
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    api.get('/api/dashboard/stats')
      .then(res => setStats(res.data || res)) // Handle axios or fetch response
      .catch(console.error);
  }, []);

  if (!stats) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
    </div>
  );

  // Dynamic greeting
  const greetingName = user?.firstName && user?.lastName 
    ? `${user.firstName} ${user.lastName}` 
    : user?.username || 'User';

  const userRole = user?.role || 'Admin';

  // Role-based KPI mapping
  const adminManagerKPIs = [
    { label: "Total Spend", value: `₹${stats.kpis?.totalSpend || 0}L`, color: '#0D9488', icon: DollarSign, trend: '+12%' },
    { label: 'Total POs', value: `${stats.kpis?.poFulfillment || 0}`, color: '#D97706', icon: TrendingUp, trend: '-2' },
    { label: "Active Vendors", value: `${stats.kpis?.activeVendors || 0}`, color: '#1E293B', icon: Users, trend: '+3' },
    { label: 'Overdue Invoices', value: `${stats.kpis?.overdueInvoices || 0}`, color: '#DC2626', icon: Receipt, trend: '+1' },
  ];

  const officerKPIs = [
    { label: "Active RFQ's", value: '12', color: '#0D9488', icon: FileText, trend: '+4' },
    { label: 'Awaiting Quotes', value: '8', color: '#D97706', icon: TrendingUp, trend: '-1' },
    { label: "PO's Generated", value: '24', color: '#1E293B', icon: Receipt, trend: '+12%' },
    { label: 'Open Issues', value: '1', color: '#DC2626', icon: Activity, trend: '0' },
  ];

  const kpiData = (userRole === 'Admin' || userRole === 'Manager') ? adminManagerKPIs : officerKPIs;

  const COLORS = ['#0D9488', '#10B981', '#F59E0B', '#F97316', '#3B82F6'];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-nunito tracking-tight">
            Welcome back, {greetingName} 👋
          </h1>
          <p className="text-slate-500 font-inter text-sm mt-1">
            {userRole} Dashboard Overview
          </p>
        </div>
        <div className="flex gap-3">
          {(userRole === 'Officer' || userRole === 'Admin') && (
            <button className="btn-primary shadow-sm" onClick={() => navigate('/rfqs')}>
              <FileText size={16} />
              New RFQ
            </button>
          )}
          {(userRole === 'Admin' || userRole === 'Manager') && (
            <button className="btn-outline shadow-sm" onClick={() => navigate('/vendors')}>
              <UserPlus size={16} />
              Add Vendor
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300 relative overflow-hidden group"
            >
              <div className="absolute -right-6 -top-6 bg-slate-50 rounded-full w-24 h-24 group-hover:scale-110 transition-transform duration-500" />
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${kpi.color}15`, color: kpi.color }}
                >
                  <Icon size={20} strokeWidth={2.5} />
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${kpi.trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : kpi.trend.startsWith('-') ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-600'}`}>
                  {kpi.trend}
                </span>
              </div>
              <div className="relative z-10">
                <h3 className="text-3xl font-bold font-nunito tracking-tight" style={{ color: '#1E293B' }}>
                  {kpi.value}
                </h3>
                <p className="text-sm font-medium text-slate-500 mt-1 font-inter">
                  {kpi.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Spending Trends - Advanced Area Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 font-nunito">Spending Trends</h3>
            <select className="text-sm border-none bg-slate-50 text-slate-600 rounded-md px-2 py-1 outline-none focus:ring-2 focus:ring-teal-500 font-inter">
              <option>Last 6 Months</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.monthlyTrend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0D9488" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0D9488" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748B', fontFamily: "'Inter', sans-serif" }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748B', fontFamily: "'Inter', sans-serif" }} 
                  tickFormatter={(val) => `$${val}M`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', fontFamily: "'Inter', sans-serif" }}
                  formatter={(value: any) => [`$${value}M`, 'Spend']}
                />
                <Area 
                  type="monotone" 
                  dataKey="spend" 
                  stroke="#0D9488" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorSpend)" 
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#0D9488' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Spend - Pie Chart */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-slate-900 font-nunito mb-2">Spend by Category</h3>
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.categorySpend || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="amount"
                >
                  {(stats.categorySpend || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => [`$${value}M`, 'Spend']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle"
                  wrapperStyle={{ fontSize: '12px', fontFamily: "'Inter', sans-serif", color: '#475569' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row - Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent POs */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 font-nunito">Recent Purchase Orders</h3>
            <button className="text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors" onClick={() => navigate('/purchase-orders')}>View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider font-inter">PO Number</th>
                  <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider font-inter">Vendor</th>
                  <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider font-inter">Amount</th>
                  <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider font-inter">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { po: 'PO-2023-089', vendor: 'Infra Supplies Ltd', amount: '$70,000', status: 'Approved' },
                  { po: 'PO-2023-090', vendor: 'TechCore Electronics', amount: '$90,000', status: 'Pending' },
                  { po: 'PO-2023-091', vendor: 'Office Wood Co.', amount: '$49,000', status: 'Draft' },
                  { po: 'PO-2023-092', vendor: 'FastLog Freight', amount: '$12,500', status: 'Paid' },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-6 text-sm font-mono text-slate-700">{row.po}</td>
                    <td className="py-3 px-6 text-sm font-medium text-slate-900 font-inter">{row.vendor}</td>
                    <td className="py-3 px-6 text-sm font-mono text-slate-700">{row.amount}</td>
                    <td className="py-3 px-6">
                      <span className={`status-badge ${getStatusBadge(row.status)}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Vendors (New Module) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col p-6">
          <h3 className="text-lg font-bold text-slate-900 font-nunito mb-4">Top Vendors</h3>
          <div className="flex flex-col gap-4">
            {(stats.topVendors || []).map((vendor: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-700 font-bold font-nunito">
                    {vendor.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 font-inter">{vendor.name}</p>
                    <p className="text-xs text-slate-500 font-inter">{vendor.pos} POs active</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-700 font-mono">${(vendor.spend / 1000).toFixed(0)}k</p>
                </div>
              </div>
            ))}
            {(!stats.topVendors || stats.topVendors.length === 0) && (
              <div className="text-center py-8 text-slate-500 text-sm font-inter">No vendor data available.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
