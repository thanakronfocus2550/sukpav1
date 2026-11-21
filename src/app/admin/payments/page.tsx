'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  Eye,
  AlertCircle,
  Clock,
  RefreshCw,
  Search,
} from 'lucide-react';
import { Payment } from '@/lib/types';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'WAITING_VERIFICATION' | 'PAID' | 'WRONG_AMOUNT'>('ALL');

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/payments');
      const data = await res.json();
      if (data.success) {
        setPayments(data.payments);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleVerify = async (status: 'PAID' | 'WRONG_AMOUNT') => {
    if (!selectedPayment) return;
    setIsVerifying(true);
    try {
      const res = await fetch('/api/payments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_id: selectedPayment.id,
          status,
          reject_reason: status === 'WRONG_AMOUNT' ? rejectReason : undefined,
          actor: 'Admin',
        }),
      });

      const data = await res.json();
      if (data.success) {
        await fetchPayments();
        setSelectedPayment(null);
        setRejectReason('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsVerifying(false);
    }
  };

  const filteredPayments = payments.filter((p) => {
    if (statusFilter === 'ALL') return true;
    return p.status === statusFilter;
  });

  return (
    <div className="p-4 sm:p-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            ตรวจสอบสลิปและจัดการการชำระเงิน (Payments)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            ตรวจสอบภาพสลิป ยืนยันยอดเงิน หรือแจ้งยอดไม่ถูกต้อง (เชื่อมโยงแจ้งเตือน Telegram อัตโนมัติ)
          </p>
        </div>
        <button
          onClick={fetchPayments}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl shadow-sm hover:bg-slate-50 self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>รีเฟรชสลิป</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b pb-3">
        {(['ALL', 'WAITING_VERIFICATION', 'PAID', 'WRONG_AMOUNT'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              statusFilter === tab
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border hover:bg-slate-50'
            }`}
          >
            {tab === 'ALL'
              ? 'ทั้งหมด'
              : tab === 'WAITING_VERIFICATION'
              ? 'รอตรวจสอบ (Pending Review)'
              : tab === 'PAID'
              ? 'ยืนยันแล้ว (Paid)'
              : 'ยอดไม่ตรง (Wrong Amount)'}
          </button>
        ))}
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b">
              <tr>
                <th className="px-6 py-3">Order ID</th>
                <th className="px-4 py-3">ลูกค้า</th>
                <th className="px-4 py-3">ยอดเงินที่ต้องชำระ</th>
                <th className="px-4 py-3">หลักฐานสลิป</th>
                <th className="px-4 py-3">สถานะ</th>
                <th className="px-6 py-3 text-right">การตรวจสอบ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    ไม่พบรายการชำระเงินในหมวดนี้
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-sky-700">
                      {p.order_code}
                    </td>
                    <td className="px-4 py-4 font-medium text-slate-800">
                      <div>{p.customer_name}</div>
                      <div className="text-[11px] text-slate-400">{p.customer_phone}</div>
                    </td>
                    <td className="px-4 py-4 font-black text-slate-900 text-sm">
                      <div>฿{p.amount.toFixed(2)}</div>
                      <span className="text-[10px] text-slate-500 font-normal">
                        {p.payment_method === 'CASH' ? '💵 เงินสด (จ่ายตอนเริ่มงาน)' : '💳 พร้อมเพย์'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {p.slip_url ? (
                        <button
                          onClick={() => setSelectedPayment(p)}
                          className="flex items-center gap-1.5 text-xs text-sky-600 hover:text-sky-800 font-semibold bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>ดูภาพสลิป</span>
                        </button>
                      ) : p.payment_method === 'CASH' ? (
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-xs font-semibold">
                          รับเงินสดหน้างาน
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">ยังไม่แนบสลิป</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                          p.status === 'PAID'
                            ? 'bg-emerald-100 text-emerald-700'
                            : p.status === 'WAITING_VERIFICATION'
                            ? 'bg-amber-100 text-amber-700 animate-pulse'
                            : p.status === 'WRONG_AMOUNT'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {p.status !== 'PAID' && (
                        <button
                          onClick={() => setSelectedPayment(p)}
                          className="px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-xs font-bold shadow-sm"
                        >
                          {p.payment_method === 'CASH' ? 'ยืนยันรับเงินสด' : 'ตรวจสอบสลิป'}
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

      {/* Slip Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  ตรวจสอบสลิป: {selectedPayment.order_code}
                </h3>
                <p className="text-xs text-slate-500">
                  ยอดที่ต้องชำระ: <strong>฿{selectedPayment.amount.toFixed(2)}</strong>
                </p>
              </div>
              <button
                onClick={() => setSelectedPayment(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Slip Image View */}
            {selectedPayment.slip_url && (
              <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden border bg-slate-100 shadow-inner">
                <Image
                  src={selectedPayment.slip_url}
                  alt="Customer Transfer Slip"
                  fill
                  className="object-contain"
                />
              </div>
            )}

            {/* Reject Reason input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                หมายเหตุ / เหตุผล (กรณีปฏิเสธสลิป)
              </label>
              <input
                type="text"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="เช่น โอนเงินขาด 5 บาท, สลิปซ้ำกับรายการก่อนหน้า"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>

            {/* Verification Action Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => handleVerify('WRONG_AMOUNT')}
                disabled={isVerifying}
                className="flex-1 py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-bold text-xs rounded-xl transition-all"
              >
                ปฏิเสธสลิป (ยอดไม่ตรง)
              </button>
              <button
                onClick={() => handleVerify('PAID')}
                disabled={isVerifying}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
              >
                ยืนยันการชำระเงิน (PAID)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
