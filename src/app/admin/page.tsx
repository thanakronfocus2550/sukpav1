'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  ArrowRight,
  Store,
  FileSpreadsheet,
  DollarSign,
  CreditCard,
  Layers,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { Order, OrderStatus } from '@/lib/types';

interface SummaryData {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  activeOrders: number;
  todayRevenue: number;
  totalRevenue: number;
  totalExpenses: number;
  partnerCommissionExpense: number;
  grossProfit: number;
}

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [finRes, ordRes] = await Promise.all([
        fetch('/api/finance'),
        fetch('/api/orders'),
      ]);

      const finData = await finRes.json();
      const ordData = await ordRes.json();

      if (finData.success) {
        setSummary(finData.summary);
      }
      if (ordData.success) {
        setRecentOrders(ordData.orders.slice(0, 8));
      }
    } catch (err) {
      console.error('Error fetching admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-4 sm:p-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            ภาพรวมระบบ SUK PA?
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            ระบบจัดการบริการรับ-ส่งผ้า นักศึกษา มจพ. ปราจีนบุรี (Partner Model)
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl shadow-sm hover:bg-slate-50 transition-all self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>รีเฟรชข้อมูล</span>
        </button>
      </div>

      {/* Primary Financial & Operational Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Metric 1: Today Revenue */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>รายได้ค่าส่งวันนี้</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600">
            ฿{summary ? summary.todayRevenue.toFixed(2) : '0.00'}
          </div>
          <p className="text-[11px] text-slate-400">จากค่าบริการรับ-ส่ง</p>
        </div>

        {/* Metric 2: Total Revenue */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>รายได้รวมทั้งหมด</span>
            <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-sky-600">
            ฿{summary ? summary.totalRevenue.toFixed(2) : '0.00'}
          </div>
          <p className="text-[11px] text-slate-400">หอใน 40.- / หอนอก 35.-</p>
        </div>

        {/* Metric 3: Total Expenses (including 5 THB/basket) */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>รายจ่ายรวม</span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-600">
            ฿{summary ? summary.totalExpenses.toFixed(2) : '0.00'}
          </div>
          <p className="text-[11px] text-slate-400">
            พาร์ทเนอร์ ฿{summary ? summary.partnerCommissionExpense.toFixed(2) : '0.00'}
          </p>
        </div>

        {/* Metric 4: Gross Profit */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>กำไรเบื้องต้น</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-indigo-600">
            ฿{summary ? summary.grossProfit.toFixed(2) : '0.00'}
          </div>
          <p className="text-[11px] text-slate-400">รายรับ - รายจ่าย</p>
        </div>
      </div>

      {/* Secondary Status Pipeline Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-3">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block">รอดำเนินการ</span>
            <span className="text-xl font-bold text-slate-800">
              {summary ? summary.pendingOrders : 0} ออเดอร์
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-3">
          <div className="p-3 bg-sky-50 text-sky-600 rounded-xl">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block">กำลังดำเนินการ</span>
            <span className="text-xl font-bold text-slate-800">
              {summary ? summary.activeOrders : 0} ออเดอร์
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block">สำเร็จแล้ว</span>
            <span className="text-xl font-bold text-slate-800">
              {summary ? summary.completedOrders : 0} ออเดอร์
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block">ออเดอร์ทั้งหมด</span>
            <span className="text-xl font-bold text-slate-800">
              {summary ? summary.totalOrders : 0} ออเดอร์
            </span>
          </div>
        </div>
      </div>

      {/* Recent Orders List Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base text-slate-900">
              รายการออเดอร์ล่าสุด
            </h3>
            <p className="text-xs text-slate-500">ออเดอร์ที่เข้ามาในระบบล่าสุด</p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
          >
            <span>ดูทั้งหมด</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b">
              <tr>
                <th className="px-6 py-3">Order ID</th>
                <th className="px-4 py-3">ลูกค้า</th>
                <th className="px-4 py-3">ที่พัก</th>
                <th className="px-3 py-3">ตะกร้า</th>
                <th className="px-4 py-3">ค่าบริการ</th>
                <th className="px-4 py-3">สถานะ</th>
                <th className="px-6 py-3 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    ยังไม่มีออเดอร์ในระบบ
                  </td>
                </tr>
              ) : (
                recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-sky-700">
                      {ord.order_id}
                    </td>
                    <td className="px-4 py-4 font-medium text-slate-800">
                      <div>{ord.customer_name}</div>
                      <div className="text-[11px] text-slate-400">{ord.customer_phone}</div>
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      <div>
                        {ord.dorm_name} ห้อง {ord.room_no}
                      </div>
                      <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">
                        {ord.dorm_type === 'INSIDE' ? 'หอใน (40.-)' : 'หอนอก (35.-)'}
                      </span>
                    </td>
                    <td className="px-3 py-4 font-bold text-slate-800">
                      {ord.basket_count} ตะกร้า
                    </td>
                    <td className="px-4 py-4 font-black text-slate-900">
                      ฿{ord.delivery_fee.toFixed(2)}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold inline-block ${
                          ord.status === 'NEW'
                            ? 'bg-amber-100 text-amber-700'
                            : ord.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-700'
                            : ord.status === 'CANCELLED'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-sky-100 text-sky-700'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/orders?search=${ord.order_id}`}
                        className="text-xs font-bold text-sky-600 hover:text-sky-800 bg-sky-50 px-3 py-1.5 rounded-lg border border-sky-200"
                      >
                        จัดการ
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
