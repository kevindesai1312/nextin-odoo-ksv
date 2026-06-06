export interface Vendor {
  id: string;
  name: string;
  category: string;
  gstNo: string;
  contactNo: string;
  status: 'Active' | 'Pending' | 'Blocked';
  email: string;
  address: string;
}

export interface RFQ {
  id: string;
  title: string;
  category: string;
  deadline: string;
  description: string;
  status: 'Draft' | 'Sent' | 'Closed';
  items: RFQItem[];
  assignedVendors: string[];
}

export interface RFQItem {
  id: string;
  name: string;
  qty: number;
  unit: string;
}

export interface Quotation {
  id: string;
  rfqId: string;
  vendorId: string;
  vendorName: string;
  items: QuotationItem[];
  taxPercent: number;
  subtotal: number;
  taxAmount: number;
  grandTotal: number;
  deliveryDays: number;
  paymentTerms: string;
  notes: string;
  status: 'Draft' | 'Submitted';
  vendorRating: number;
}

export interface QuotationItem {
  id: string;
  name: string;
  qty: number;
  unitPrice: number;
  total: number;
  deliveryDays: number;
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

export interface POItem {
  name: string;
  qty: number;
  unitPrice: number;
  total: number;
}

export interface ApprovalStep {
  step: number;
  label: string;
  status: 'completed' | 'current' | 'pending';
  approver?: string;
  role?: string;
  date?: string;
  remarks?: string;
}

export interface ActivityLog {
  id: string;
  type: 'quotation' | 'approval' | 'rfq' | 'vendor' | 'invoice';
  description: string;
  timestamp: string;
  icon: string;
}

export const vendors: Vendor[] = [
  { id: '1', name: 'Infra Supplies Pvt Ltd', category: 'Construction', gstNo: '27AABCU9603R1Z0', contactNo: '9876543210', status: 'Active', email: 'contact@infrasupplies.com', address: '456, Industrial Estate, Surat' },
  { id: '2', name: 'TechCore LTD', category: 'IT', gstNo: '27AABCU9603R1Z1', contactNo: '9876543211', status: 'Active', email: 'info@techcore.com', address: '789, Tech Park, Bangalore' },
  { id: '3', name: 'FastLog Transport', category: 'Logistics', gstNo: '27AABCU9603R1Z2', contactNo: '9876543212', status: 'Blocked', email: 'support@fastlog.com', address: '321, Transport Nagar, Delhi' },
  { id: '4', name: 'Office Wood Co.', category: 'Furniture', gstNo: '27AABCU9603R1Z3', contactNo: '9876543213', status: 'Active', email: 'sales@officewood.com', address: '654, Furniture Market, Mumbai' },
  { id: '5', name: 'Stationery Plus', category: 'Stationery', gstNo: '27AABCU9603R1Z4', contactNo: '9876543214', status: 'Pending', email: 'hello@stationeryplus.com', address: '987, Paper Market, Chennai' },
];

export const rfqs: RFQ[] = [
  {
    id: '1',
    title: 'Office Furniture procurement Q2',
    category: 'Furniture',
    deadline: '15 June 2025',
    description: 'Ergonomic chairs and standing desks for 3rd floor',
    status: 'Sent',
    items: [
      { id: '1', name: 'Ergonomic chair', qty: 25, unit: 'NOS' },
      { id: '2', name: 'Standing desks', qty: 10, unit: 'NOS' },
    ],
    assignedVendors: ['1', '2', '4'],
  },
  {
    id: '2',
    title: 'IT Hardware Refresh Q2',
    category: 'IT Hardware',
    deadline: '30 June 2025',
    description: 'Laptops and monitors for new hires',
    status: 'Draft',
    items: [
      { id: '3', name: 'Laptop Dell Latitude', qty: 15, unit: 'NOS' },
      { id: '4', name: 'Monitor 27" LG', qty: 15, unit: 'NOS' },
    ],
    assignedVendors: ['2'],
  },
];

export const quotations: Quotation[] = [
  {
    id: '1',
    rfqId: '1',
    vendorId: '1',
    vendorName: 'Infra Supplies',
    items: [
      { id: '1', name: 'Ergonomic chair', qty: 25, unitPrice: 3500, total: 87500, deliveryDays: 7 },
      { id: '2', name: 'Standing desks', qty: 10, unitPrice: 9200, total: 92000, deliveryDays: 14 },
    ],
    taxPercent: 18,
    subtotal: 169500,
    taxAmount: 30510,
    grandTotal: 185000,
    deliveryDays: 10,
    paymentTerms: '30 days',
    notes: 'Payment terms: 30 days net from delivery',
    status: 'Submitted',
    vendorRating: 4.5,
  },
  {
    id: '2',
    rfqId: '1',
    vendorId: '2',
    vendorName: 'TechCore LTD',
    items: [
      { id: '3', name: 'Ergonomic chair', qty: 25, unitPrice: 3800, total: 95000, deliveryDays: 10 },
      { id: '4', name: 'Standing desks', qty: 10, unitPrice: 9500, total: 95000, deliveryDays: 12 },
    ],
    taxPercent: 18,
    subtotal: 190000,
    taxAmount: 34200,
    grandTotal: 200010,
    deliveryDays: 14,
    paymentTerms: '20 days',
    notes: 'Payment terms: 20 days net from delivery',
    status: 'Submitted',
    vendorRating: 4.0,
  },
  {
    id: '3',
    rfqId: '1',
    vendorId: '4',
    vendorName: 'Office Wood Co.',
    items: [
      { id: '5', name: 'Ergonomic chair', qty: 25, unitPrice: 4200, total: 105000, deliveryDays: 5 },
      { id: '6', name: 'Standing desks', qty: 10, unitPrice: 9800, total: 98000, deliveryDays: 7 },
    ],
    taxPercent: 18,
    subtotal: 203000,
    taxAmount: 36540,
    grandTotal: 214000,
    deliveryDays: 7,
    paymentTerms: '15 days',
    notes: 'Payment terms: 15 days net from delivery',
    status: 'Submitted',
    vendorRating: 3.8,
  },
];

export const purchaseOrders: PurchaseOrder[] = [
  {
    id: '1',
    poNumber: 'PO-2025-0068',
    vendorName: 'Infra Supplies Pvt Ltd',
    vendorAddress: '456, Industrial Estate, Surat',
    vendorGstin: '27AABCU9603R1ZX',
    items: [
      { name: 'Ergonomic chair', qty: 25, unitPrice: 3500, total: 87500 },
      { name: 'Standing desks', qty: 10, unitPrice: 9200, total: 92000 },
    ],
    subtotal: 169500,
    cgst: 15255,
    sgst: 15255,
    grandTotal: 200010,
    status: 'Pending Payment',
    poDate: '21 May, 2025',
    invoiceDate: '22 May 2025',
    dueDate: '21 June 2025',
  },
];

export const approvalSteps: ApprovalStep[] = [
  { step: 1, label: 'L1', status: 'completed', approver: 'Rahul Mehta', role: 'Procurement Head', date: 'May 20, 10:32 AM', remarks: 'Approved' },
  { step: 2, label: 'L1 Review', status: 'completed', approver: 'Rahul Mehta', role: 'Procurement Head', date: 'May 20, 11:00 AM', remarks: 'Reviewed and approved' },
  { step: 3, label: 'L2 Approval', status: 'current', approver: 'Priya Shah', role: 'Finance Manager', date: 'May 21', remarks: '' },
  { step: 4, label: 'Generate PO', status: 'pending' },
];

export const activityLogs: ActivityLog[] = [
  { id: '1', type: 'quotation', description: 'Quotation selected — Infra Supplies Pvt Ltd selected for office furniture Q2', timestamp: '23 May 2025, 4:15 PM', icon: 'check' },
  { id: '2', type: 'approval', description: 'Approval pending — PO: 2024 awaiting L2 approval by Priya Shah', timestamp: '22 May 2025, 04:15 AM', icon: 'clock' },
  { id: '3', type: 'rfq', description: 'RFQ published — office furniture Q2 sent to 3 vendors', timestamp: '19 May 2025', icon: 'file' },
  { id: '4', type: 'vendor', description: 'Vendor added — FastLog transport registered and pending verifications', timestamp: '18 May 2025, 3:20 PM', icon: 'user' },
  { id: '5', type: 'invoice', description: 'Invoice generated — PO-2025-0068 invoice created for Infra Supplies', timestamp: '17 May 2025, 2:00 PM', icon: 'file-text' },
  { id: '6', type: 'quotation', description: 'Quotation received — TechCore LTD submitted quotation for IT Hardware Refresh', timestamp: '16 May 2025, 11:30 AM', icon: 'check' },
];

export const categorySpend = [
  { category: 'IT Hardware', amount: 4.8, color: '#0D9488' },
  { category: 'Furniture', amount: 3.2, color: '#10B981' },
  { category: 'Stationery', amount: 2.1, color: '#F59E0B' },
  { category: 'Logistics', amount: 2.3, color: '#F97316' },
];

export const topVendors = [
  { name: 'TechCore Ltd', spend: 420000, pos: 6 },
  { name: 'Infra Supplies', spend: 310000, pos: 4 },
  { name: 'FastLog', spend: 190000, pos: 3 },
];

export const monthlyTrend = [
  { month: 'Dec', spend: 6.2 },
  { month: 'Jan', spend: 7.8 },
  { month: 'Feb', spend: 8.5 },
  { month: 'Mar', spend: 10.2 },
  { month: 'Apr', spend: 11.5 },
  { month: 'May', spend: 12.4 },
];
