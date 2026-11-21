'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Truck,
  Store,
  Layers,
  Clock,
  AlertCircle,
  User,
  Phone,
  Building2,
  FileText,
  DollarSign,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  Edit3,
} from 'lucide-react';
import { Order, OrderStatus, Partner } from '@/lib/types';

const STATUS_LIST: { key: OrderStatus | 'ALL'; label: string }[] = [
  { key: 'ALL', label: 'ทั้งหมด' },
  { key: 'NEW', label: 'ออเดอร์ใหม่ (NEW)' },
  { key: 'CONFIRMED', label: 'ยืนยันแล้ว (CONFIRMED)' },
  { key: 'PICKED_UP', label: 'รับผ้าแล้ว (PICKED_UP)' },
  { key: 'SENT_TO_PARTNER', label: 'ส่งพาร์ทเนอร์ (SENT_TO_PARTNER)' },
  { key: 'WASHING', label: 'กำลังซัก/อบ (WASHING)' },
  { key: 'READY', label: 'พร้อมส่งคืน (READY)' },
  { key: 'DELIVERING', label: 'กำลังนำส่ง (DELIVERING)' },
  { key: 'COMPLETED', label: 'สำเร็จแล้ว (COMPLETED)' },
  { key: 'CANCELLED', label: 'ยกเลิก (CANCELLED)' },
];

function OrdersManagementContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [orders, setOrders] = useState<Order[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'ALL'>('ALL');

  // Modal / Drawer state for Order Actions
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [actionType, setActionType] = useState<'STATUS' | 'ASSIGN_PARTNER' | 'CANCEL' | null>(null);

  // Form states for Modal
  const [newStatus, setNewStatus] = useState<OrderStatus>('CONFIRMED');
  const [cancelReason, setCancelReason] = useState('');
  const [selectedPartnerId, setSelectedPartnerId] = useState('');
  const [actualBaskets, setActualBaskets] = useState(1);
  const [partnerNotes, setPartnerNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const url = new URL('/api/orders', window.location.origin);
      if (selectedStatus !== 'ALL') url.searchParams.set('status', selectedStatus);
      if (search) url.searchParams.set('search', search);

      const [ordRes, partRes] = await Promise.all([
        fetch(url.toString()),
        fetch('/api/partners'),
      ]);

      const ordData = await ordRes.json();
      const partData = await partRes.json();

      if (ordData.success) setOrders(ordData.orders);
      if (partData.success) {
        setPartners(partData.partners);
        if (partData.partners.length > 0 && !selectedPartnerId) {
          setSelectedPartnerId(partData.partners[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  const openStatusModal = (ord: Order) => {
    setActiveOrder(ord);
    setNewStatus(ord.status);
    setActionType('STATUS');
    setFeedbackMsg('');
  };

  const openPartnerModal = (ord: Order) => {
    setActiveOrder(ord);
    setActualBaskets(ord.actual_partner_baskets || ord.basket_count || 1);
    if (ord.partner_id) setSelectedPartnerId(ord.partner_id);
    setActionType('ASSIGN_PARTNER');
    setFeedbackMsg('');
  };

  const openCancelModal = (ord: Order) => {
    setActiveOrder(ord);
    setCancelReason('');
    setActionType('CANCEL');
    setFeedbackMsg('');
  };

  const closeModal = () => {
    setActiveOrder(null);
    setActionType(null);
    setIsUpdating(false);
  };

  // Submit Order Status Change
  const handleUpdateStatus = async () => {
    if (!activeOrder) return;
    setIsUpdating(true);
    setFeedbackMsg('');
    try {
      const res = await fetch(`/api/orders/${activeOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          actor: 'Admin',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to update status');

      await fetchOrders();
      closeModal();
    } catch (err: unknown) {
      setFeedbackMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setIsUpdating(false);
    }
  };

  // Submit Partner Assignment and Basket count (Basket * 5 THB)
  const handleAssignPartner = async () => {
    if (!activeOrder) return;
    setIsUpdating(true);
    setFeedbackMsg('');
    try {
      const res = await fetch(`/api/orders/${activeOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ASSIGN_PARTNER',
          partner_id: selectedPartnerId,
          actual_baskets: Number(actualBaskets),
          notes: partnerNotes,
          actor: 'Admin',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to assign partner');

      await fetchOrders();
      closeModal();
    } catch (err: unknown) {
      setFeedbackMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setIsUpdating(false);
    }
  };

  // Quick Assign Partner directly from table dropdown
  const handleQuickAssignPartner = async (orderId: string, partnerId: string, baskets: number) => {
    if (!partnerId) return;
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ASSIGN_PARTNER',
          partner_id: partnerId,
          actual_baskets: Number(baskets) || 1,
          actor: 'Admin',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to assign partner');
      await fetchOrders();
    } catch (err: unknown) {
      alert('เกิดข้อผิดพลาดในการมอบหมายพาร์ทเนอร์: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  // Submit Cancel Order
  const handleCancelOrder = async () => {
    if (!activeOrder) return;
    setIsUpdating(true);
    setFeedbackMsg('');
    try {
      const res = await fetch(`/api/orders/${activeOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'CANCELLED',
          reason: cancelReason || 'ยกเลิกโดยผู้ดูแลระบบ',
          actor: 'Admin',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to cancel order');

      await fetchOrders();
      closeModal();
    } catch (err: unknown) {
      setFeedbackMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            จัดการรายการออเดอร์ (Orders)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            เปลี่ยนสถานะ มอบหมายงานร้านพาร์ทเนอร์ และบันทึกจำนวนตะกร้าจริง
          </p>
        </div>
        <button
          onClick={fetchOrders}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl shadow-sm hover:bg-slate-50 self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>รีเฟรชข้อมูล</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาด้วย Order ID, ชื่อลูกค้า, หรือเบอร์โทรศัพท์..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-400 text-xs sm:text-sm"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl font-bold text-xs sm:text-sm shadow-sm transition-all"
          >
            ค้นหา
          </button>
        </form>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {STATUS_LIST.map((item) => (
            <button
              key={item.key}
              onClick={() => setSelectedStatus(item.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedStatus === item.key
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b">
              <tr>
                <th className="px-5 py-3">Order ID</th>
                <th className="px-4 py-3">ข้อมูลลูกค้า</th>
                <th className="px-4 py-3">ที่พัก</th>
                <th className="px-3 py-3">ตะกร้าผ้า</th>
                <th className="px-4 py-3">ร้านพาร์ทเนอร์</th>
                <th className="px-4 py-3">ค่าบริการ</th>
                <th className="px-4 py-3">สถานะ</th>
                <th className="px-5 py-3 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                    ไม่พบรายการออเดอร์ตามเงื่อนไขที่เลือก
                  </td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Order ID */}
                    <td className="px-5 py-4 font-mono font-bold text-sky-700">
                      <div>{ord.order_id}</div>
                      <span className="text-[10px] text-slate-400 font-normal">
                        {new Date(ord.created_at).toLocaleDateString('th-TH')}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="px-4 py-4 font-medium text-slate-800">
                      <div>{ord.customer_name}</div>
                      <div className="text-[11px] text-slate-400">{ord.customer_phone}</div>
                    </td>

                    {/* Location */}
                    <td className="px-4 py-4 text-slate-600">
                      <div>
                        {ord.dorm_name} ห้อง {ord.room_no}
                      </div>
                      <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-medium">
                        {ord.dorm_type === 'INSIDE' ? 'หอใน (40.-)' : 'หอนอก (35.-)'}
                      </span>
                    </td>

                    {/* Basket & Machine */}
                    <td className="px-3 py-4">
                      <div className="font-bold text-slate-800">{ord.basket_count} ตะกร้า</div>
                      <span className="text-[10px] text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded font-medium block mt-0.5">
                        ซัก {ord.washer_weight || '9KG'} + อบ {ord.dryer_weight || '17KG'}
                      </span>
                      {ord.own_detergent && (
                        <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded font-bold inline-block mt-1">
                          🧴 เอาน้ำยามาเอง
                        </span>
                      )}
                    </td>

                    {/* Partner Quick Pick Selector */}
                    <td className="px-4 py-4">
                      <div className="space-y-1.5">
                        <select
                          value={ord.partner_id || ''}
                          onChange={(e) =>
                            handleQuickAssignPartner(
                              ord.id,
                              e.target.value,
                              ord.actual_partner_baskets || ord.basket_count
                            )
                          }
                          className={`text-xs py-1.5 px-2.5 rounded-xl border font-bold focus:ring-2 focus:ring-sky-400 focus:outline-none transition-all cursor-pointer ${
                            ord.partner_id
                              ? 'bg-sky-50 text-sky-800 border-sky-300'
                              : 'bg-white text-slate-500 border-slate-300 hover:border-slate-400'
                          }`}
                        >
                          <option value="">-- เลือกพาร์ทเนอร์ --</option>
                          {partners.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                        </select>

                        {ord.partner_id ? (
                          <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold w-fit">
                            <span>✓ {ord.actual_partner_baskets || ord.basket_count} ตะกร้า</span>
                            <span>(฿{((ord.actual_partner_baskets || ord.basket_count) * 5).toFixed(2)})</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-amber-600 block pl-1">
                            ยังไม่ได้เลือก
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Total Amount & Payment Method */}
                    <td className="px-4 py-4">
                      <div className="font-black text-slate-900 text-sm">
                        ฿{(ord.total_amount || ord.delivery_fee).toFixed(2)}
                      </div>
                      <div className="flex flex-col gap-0.5 mt-1">
                        <span className="text-[10px] text-slate-500 font-medium">
                          {ord.payment_method === 'CASH' ? '💵 เงินสด (จ่ายตอนเริ่มงาน)' : '💳 โอนพร้อมเพย์'}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded w-fit ${
                            ord.payment_status === 'PAID'
                              ? 'bg-emerald-100 text-emerald-700'
                              : ord.payment_status === 'WAITING_VERIFICATION'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {ord.payment_status}
                        </span>
                      </div>
                    </td>

                    {/* Order Status */}
                    <td className="px-4 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold inline-block ${
                          ord.status === 'NEW'
                            ? 'bg-amber-100 text-amber-700'
                            : ord.status === 'CONFIRMED'
                            ? 'bg-blue-100 text-blue-700'
                            : ord.status === 'PICKED_UP'
                            ? 'bg-indigo-100 text-indigo-700'
                            : ord.status === 'SENT_TO_PARTNER'
                            ? 'bg-purple-100 text-purple-700'
                            : ord.status === 'WASHING'
                            ? 'bg-sky-100 text-sky-700'
                            : ord.status === 'READY'
                            ? 'bg-teal-100 text-teal-700'
                            : ord.status === 'DELIVERING'
                            ? 'bg-orange-100 text-orange-700'
                            : ord.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </td>

                    {/* Actions Menu */}
                    <td className="px-5 py-4 text-right space-x-1 whitespace-nowrap">
                      {/* Status Button */}
                      <button
                        onClick={() => openStatusModal(ord)}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all"
                      >
                        เปลี่ยนสถานะ
                      </button>

                      {/* Assign Partner Button */}
                      <button
                        onClick={() => openPartnerModal(ord)}
                        className="px-2.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-lg text-xs font-bold transition-all"
                      >
                        ส่งพาร์ทเนอร์
                      </button>

                      {/* Cancel Button (if not already completed/cancelled) */}
                      {ord.status !== 'COMPLETED' && ord.status !== 'CANCELLED' && (
                        <button
                          onClick={() => openCancelModal(ord)}
                          className="px-2 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold"
                        >
                          ยกเลิก
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Change Status */}
      {actionType === 'STATUS' && activeOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95">
            <h3 className="text-lg font-black text-slate-900">
              เปลี่ยนสถานะออเดอร์: {activeOrder.order_id}
            </h3>
            <p className="text-xs text-slate-500">
              สถานะปัจจุบัน: <strong>{activeOrder.status}</strong>
            </p>

            {feedbackMsg && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs">
                {feedbackMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                เลือกสถานะใหม่
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white"
              >
                <option value="NEW">NEW (รับคำสั่งซื้อแล้ว)</option>
                <option value="CONFIRMED">CONFIRMED (ยืนยันออเดอร์)</option>
                <option value="PICKED_UP">PICKED_UP (รับผ้าแล้ว)</option>
                <option value="SENT_TO_PARTNER">SENT_TO_PARTNER (ส่งร้านพาร์ทเนอร์แล้ว)</option>
                <option value="WASHING">WASHING (กำลังซัก/อบ)</option>
                <option value="READY">READY (พร้อมจัดส่ง)</option>
                <option value="DELIVERING">DELIVERING (กำลังนำส่ง)</option>
                <option value="COMPLETED">COMPLETED (จัดส่งสำเร็จ)</option>
                <option value="CANCELLED">CANCELLED (ยกเลิก)</option>
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={closeModal}
                disabled={isUpdating}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={isUpdating}
                className="flex-1 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-sm"
              >
                {isUpdating ? 'กำลังบันทึก...' : 'บันทึกสถานะ'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Assign Partner and Actual Baskets (Basket * 5 THB) */}
      {actionType === 'ASSIGN_PARTNER' && activeOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Store className="w-5 h-5 text-sky-500" />
              <span>ส่งผ้าให้ร้านพาร์ทเนอร์ & บันทึกตะกร้า</span>
            </h3>
            <p className="text-xs text-slate-500">
              ออเดอร์: <strong>{activeOrder.order_id}</strong> (ลูกค้าแจ้ง: {activeOrder.basket_count} ตะกร้า)
            </p>

            {feedbackMsg && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs">
                {feedbackMsg}
              </div>
            )}

            {/* Partner Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                เลือกร้านพาร์ทเนอร์
              </label>
              <select
                value={selectedPartnerId}
                onChange={(e) => setSelectedPartnerId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white"
              >
                {partners.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.owner_name})
                  </option>
                ))}
              </select>
            </div>

            {/* Actual Baskets Counter */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                จำนวนตะกร้าที่ส่งให้ร้านจริง
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActualBaskets(Math.max(1, actualBaskets - 1))}
                  className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  -
                </button>
                <div className="flex-1 text-center font-bold text-slate-800 text-lg py-2 border rounded-xl border-slate-200">
                  {actualBaskets} ตะกร้า
                </div>
                <button
                  type="button"
                  onClick={() => setActualBaskets(actualBaskets + 1)}
                  className="w-10 h-10 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold"
                >
                  +
                </button>
              </div>
            </div>

            {/* Auto Commission Calculation Box (5 THB/basket) */}
            <div className="p-4 bg-sky-50 rounded-2xl border border-sky-200 text-xs text-sky-800 space-y-1">
              <div className="flex justify-between font-bold">
                <span>ค่าตอบแทนร้านพาร์ทเนอร์ (5 บาท/ตะกร้า):</span>
                <span className="text-sm font-black text-sky-600">
                  ฿{(actualBaskets * 5).toFixed(2)}
                </span>
              </div>
              <p className="text-[11px] text-sky-600">
                คำนวณอัตโนมัติ: {actualBaskets} ตะกร้า × 5.00 บาท และจะลงบัญชีรายจ่ายให้ทันที
              </p>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                หมายเหตุเพิ่มเติม (ถ้ามี)
              </label>
              <input
                type="text"
                value={partnerNotes}
                onChange={(e) => setPartnerNotes(e.target.value)}
                placeholder="เช่น ผ้าขาวแยกถุง, ซักน้ำอุ่น 1 ถัง"
                className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={closeModal}
                disabled={isUpdating}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleAssignPartner}
                disabled={isUpdating}
                className="flex-1 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-sm"
              >
                {isUpdating ? 'กำลังบันทึก...' : 'ยืนยันส่งพาร์ทเนอร์'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Cancel Order */}
      {actionType === 'CANCEL' && activeOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95">
            <h3 className="text-lg font-black text-rose-600 flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              <span>ยืนยันยกเลิกออเดอร์: {activeOrder.order_id}</span>
            </h3>
            <p className="text-xs text-slate-600">
              ลูกค้า: {activeOrder.customer_name} ({activeOrder.dorm_name} ห้อง {activeOrder.room_no})
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                ระบุเหตุผลการยกเลิก
              </label>
              <textarea
                rows={3}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="เช่น ลูกค้าขอยกเลิก, ติดต่อลูกค้าไม่ได้, ผ้านอกเงื่อนไขการให้บริการ"
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={closeModal}
                disabled={isUpdating}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50"
              >
                ปิด
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={isUpdating}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm"
              >
                {isUpdating ? 'กำลังบันทึก...' : 'ยืนยันยกเลิกออเดอร์'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrdersManagementPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">กำลังโหลดรายการออเดอร์...</div>}>
      <OrdersManagementContent />
    </Suspense>
  );
}
