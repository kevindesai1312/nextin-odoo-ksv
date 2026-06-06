import express from 'express';
import { protect } from '../middleware/auth.js';
import PurchaseOrder from '../models/PurchaseOrder.js';
import Vendor from '../models/Vendor.js';
import Invoice from '../models/Invoice.js';

const router = express.Router();

router.get('/stats', protect, async (req, res) => {
  try {
    // 1. Calculate Total Spend (from Purchase Orders)
    const poStats = await PurchaseOrder.aggregate([
      { $match: { deletedAt: null, status: { $ne: 'Cancelled' } } },
      { $group: { _id: null, totalSpend: { $sum: '$grandTotal' }, count: { $sum: 1 } } }
    ]);
    const totalSpend = poStats.length > 0 ? poStats[0].totalSpend : 0;
    const poFulfillment = poStats.length > 0 ? poStats[0].count : 0;

    // 2. Active Vendors
    const activeVendorsCount = await Vendor.countDocuments({ status: 'Active', deletedAt: null });

    // 3. Overdue Invoices
    const overdueInvoicesCount = await Invoice.countDocuments({ 
      status: { $in: ['Overdue', 'Pending Payment'] },
      dueDate: { $lt: new Date() }
    });

    // 4. Monthly Trend (grouping PO grandTotal by month)
    const monthlyData = await PurchaseOrder.aggregate([
      { $match: { deletedAt: null, status: { $ne: 'Cancelled' }, poDate: { $type: "date" } } },
      {
        $group: {
          _id: { month: { $month: '$poDate' }, year: { $year: '$poDate' } },
          spend: { $sum: '$grandTotal' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyTrend = monthlyData.map(data => ({
      month: `${monthNames[data._id.month - 1]} ${data._id.year}`,
      spend: Number((data.spend / 100000).toFixed(2)) // convert to Lakhs for frontend scale
    }));

    // 5. Category Spend
    // Join PO with Vendors to group by Vendor Category
    const categorySpendAgg = await PurchaseOrder.aggregate([
      { $match: { deletedAt: null, status: { $ne: 'Cancelled' } } },
      {
        $lookup: {
          from: 'vendors',
          localField: 'vendorId',
          foreignField: '_id',
          as: 'vendor'
        }
      },
      { $unwind: '$vendor' },
      {
        $group: {
          _id: '$vendor.category',
          amount: { $sum: '$grandTotal' }
        }
      },
      { $sort: { amount: -1 } }
    ]);

    const COLORS = ['#0D9488', '#10B981', '#F59E0B', '#F97316', '#3B82F6', '#8B5CF6'];
    const categorySpend = categorySpendAgg.map((cat, idx) => ({
      category: cat._id || 'Uncategorized',
      amount: Number((cat.amount / 100000).toFixed(2)), // in Lakhs
      color: COLORS[idx % COLORS.length]
    }));

    // 6. Top Vendors
    const topVendorsAgg = await PurchaseOrder.aggregate([
      { $match: { deletedAt: null, status: { $ne: 'Cancelled' } } },
      {
        $group: {
          _id: '$vendorId',
          vendorName: { $first: '$vendorName' },
          spend: { $sum: '$grandTotal' },
          pos: { $sum: 1 }
        }
      },
      { $sort: { spend: -1 } },
      { $limit: 5 }
    ]);

    const topVendors = topVendorsAgg.map(v => ({
      name: v.vendorName || 'Unknown Vendor',
      spend: v.spend,
      pos: v.pos
    }));

    res.json({
      kpis: {
        totalSpend: Number((totalSpend / 100000).toFixed(2)), // Lakhs
        activeVendors: activeVendorsCount,
        poFulfillment: poFulfillment, // Just showing total PO count for now
        overdueInvoices: overdueInvoicesCount
      },
      categorySpend: categorySpend.length > 0 ? categorySpend : [
        { category: 'No Data', amount: 0, color: '#CBD5E1' }
      ],
      topVendors: topVendors,
      monthlyTrend: monthlyTrend.length > 0 ? monthlyTrend : [
        { month: monthNames[new Date().getMonth()], spend: 0 }
      ]
    });
  } catch (error) {
    console.error('Dashboard Stats Error:', error);
    res.status(500).json({ message: 'Server error generating reports' });
  }
});

export default router;
