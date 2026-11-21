'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  CheckCircle2,
  Clock,
  Truck,
  Shirt,
  Sparkles,
  PackageCheck,
  AlertCircle,
  XCircle,
  ShieldCheck,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { Order, OrderStatus } from '@/lib/types';

interface CustomerTimelineStep {
  key: string;
  label: string;
  desc: string;
  statuses: OrderStatus[];
}

const CUSTOMER_STATUS_STEPS: CustomerTimelineStep[] = [
  {
    key: 'NEW',
    label: 'รับคำสั่งซื้อแล้ว',
    desc: 'ระบบบันทึกออเดอร์เรียบร้อย รอทีมงานยืนยันคิว',
    statuses: ['NEW'],
  },
  {
    key: 'CONFIRMED',
    label: 'ยืนยันออเดอร์',
    desc: 'ยืนยันคิวเรียบร้อย ไรเดอร์กำลังเตรียมเข้ารับตามรอบ',
    statuses: ['CONFIRMED'],
  },
  {
    key: 'PICKED_UP',
    label: 'รับผ้าแล้ว',
    desc: 'ไรเดอร์เข้ารับตะกร้าผ้าจากหอพักเรียบร้อย กำลังนำเข้าจุดซัก',
    statuses: ['PICKED_UP', 'SENT_TO_PARTNER'],
  },
  {
    key: 'WASHING',
    label: 'กำลังซักและอบผ้า',
    desc: 'กำลังดำเนินการซัก-อบผ้าด้วยเครื่องซักและอบมาตรฐาน',
    statuses: ['WASHING'],
  },
  {
    key: 'READY',
    label: 'ซักอบเสร็จแล้ว / พร้อมส่ง',
    desc: 'ผ้าหอมสะอาดพับเรียบร้อย พร้อมนำส่งคืนหอพัก',
    statuses: ['READY'],
  },
  {
    key: 'DELIVERING',
    label: 'กำลังนำส่งคืน',
    desc: 'ไรเดอร์กำลังนำผ้าไปส่งคืนที่หอพักของคุณ',
    statuses: ['DELIVERING'],
  },
  {
    key: 'COMPLETED',
    label: 'จัดส่งสำเร็จ',
    desc: 'จัดส่งผ้าคืนลูกค้าเรียบร้อยแล้ว ขอบคุณที่ใช้บริการ',
    statuses: ['COMPLETED'],
  },
];

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialOrderId = searchParams.get('order_id') || '';

  const [orderId, setOrderId] = useState(initialOrderId);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [order, setOrder] = useState<Partial<Order> | null>(null);

  const handleTrack = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!orderId.trim()) {
      setErrorMsg('กรุณากรอกรหัส Order ID (เช่น SP261122-0001)');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('กรุณากรอกเบอร์โทรศัพท์ที่ใช้ในการจองเพื่อยืนยันตัวตน');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setOrder(null);

    try {
      const res = await fetch('/api/orders/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderId.trim(),
          phone: phone.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'ไม่สามารถค้นหาออเดอร์ได้');
      }

      setOrder(data.order);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  // Map order status to customer-friendly timeline (without exposing internal partner routing)
  const currentStepIndex = order
    ? CUSTOMER_STATUS_STEPS.findIndex((s) => s.statuses.includes(order.status as OrderStatus))
    : -1;

  const currentStep = order
    ? CUSTOMER_STATUS_STEPS.find((s) => s.statuses.includes(order.status as OrderStatus))
    : null;

  const isCancelled = order?.status === 'CANCELLED';

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 text-sky-700 text-xs font-semibold">
            <Search className="w-3.5 h-3.5 text-sky-500" />
            <span>ค้นหาสถานะผ้าแบบเรียลไทม์</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            ติดตามสถานะออเดอร์
          </h1>
          <p className="text-slate-600 text-sm max-w-md mx-auto">
            กรอกหมายเลขคำสั่งซื้อและเบอร์โทรศัพท์ที่ใช้จองเพื่อดูสถานะปัจจุบัน
          </p>
        </div>

        {/* Tracking Search Card */}
        <form
          onSubmit={handleTrack}
          className="bg-white rounded-3xl p-6 sm:p-8 border border-sky-100 shadow-cute space-y-4"
        >
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                หมายเลขคำสั่งซื้อ (Order ID)
              </label>
              <input
                type="text"
                required
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="เช่น SP261122-0001"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-400 font-mono text-sm uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                เบอร์โทรศัพท์ที่ใช้จอง
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="08X-XXX-XXXX หรือ 4 ตัวท้าย"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-400 text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold text-base shadow-cute-button hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>กำลังค้นหา...</span>
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                <span>ค้นหาสถานะ</span>
              </>
            )}
          </button>
        </form>

        {/* Order Result Card */}
        {order && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sky-100 shadow-cute-lg space-y-6 animate-in fade-in-50">
            {/* Top Order Badge & Info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b gap-3">
              <div>
                <span className="text-xs text-slate-400 block">หมายเลขคำสั่งซื้อ</span>
                <span className="text-xl font-black text-sky-700 font-mono tracking-wide">
                  {order.order_id}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                    isCancelled
                      ? 'bg-rose-100 text-rose-700 border border-rose-200'
                      : order.status === 'COMPLETED'
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      : 'bg-sky-100 text-sky-700 border border-sky-200'
                  }`}
                >
                  {isCancelled
                    ? 'ยกเลิกออเดอร์'
                    : currentStep?.label || order.status}
                </span>

                <span
                  className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                    order.payment_status === 'PAID'
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                      : 'bg-amber-50 text-amber-600 border border-amber-200'
                  }`}
                >
                  {order.payment_status === 'PAID'
                    ? 'ชำระเงินแล้ว'
                    : order.payment_status === 'WAITING_VERIFICATION'
                    ? 'รอตรวจสลิป'
                    : 'ยังไม่ชำระเงิน'}
                </span>
              </div>
            </div>

            {/* Cancelled Alert */}
            {isCancelled && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-3">
                <XCircle className="w-6 h-6 shrink-0" />
                <div>
                  <h4 className="font-bold">ออเดอร์นี้ถูกยกเลิกแล้ว</h4>
                  <p className="text-xs text-rose-600">
                    หากมีข้อสงสัยกรุณาติดต่อทีมงานได้ที่เบอร์ 089-123-4567 หรือ Line: @044cmpog
                  </p>
                </div>
              </div>
            )}

            {/* Customer Status Timeline (Only if not cancelled) */}
            {!isCancelled && (
              <div className="space-y-4 pt-2">
                <h3 className="text-sm font-bold text-slate-800">ไทม์ไลน์สถานะการให้บริการ</h3>
                <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {CUSTOMER_STATUS_STEPS.map((step, idx) => {
                    const isPassed = currentStepIndex >= idx;
                    const isCurrent = currentStepIndex === idx;

                    return (
                      <div key={step.key} className="relative group">
                        {/* Status Dot */}
                        <div
                          className={`absolute -left-6 sm:-left-8 top-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                            isCurrent
                              ? 'bg-sky-500 text-white ring-4 ring-sky-100 scale-110 shadow-md'
                              : isPassed
                              ? 'bg-emerald-500 text-white'
                              : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          {isPassed ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <span>{idx + 1}</span>
                          )}
                        </div>

                        {/* Status Text */}
                        <div
                          className={`p-3 rounded-2xl transition-all ${
                            isCurrent
                              ? 'bg-sky-50/80 border border-sky-200 shadow-sm'
                              : 'bg-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-sm font-bold ${
                                isCurrent
                                  ? 'text-sky-700'
                                  : isPassed
                                  ? 'text-slate-800'
                                  : 'text-slate-400'
                              }`}
                            >
                              {step.label}
                            </span>
                            {isCurrent && (
                              <span className="text-[10px] font-bold bg-sky-500 text-white px-2 py-0.5 rounded-full animate-pulse">
                                กำลังดำเนินการ
                              </span>
                            )}
                          </div>
                          <p
                            className={`text-xs mt-0.5 ${
                              isCurrent ? 'text-sky-800' : 'text-slate-500'
                            }`}
                          >
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sanitized Order Details */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-2">
              <div className="flex justify-between">
                <span>สถานที่รับผ้า:</span>
                <span className="font-semibold text-slate-800">
                  {order.dorm_name} ({order.dorm_type === 'INSIDE' ? 'หอใน' : 'หอนอก'})
                </span>
              </div>
              <div className="flex justify-between">
                <span>จำนวนตะกร้า:</span>
                <span className="font-semibold text-slate-800">{order.basket_count} ตะกร้า</span>
              </div>
              <div className="flex justify-between">
                <span>ตู้ซัก+อบ:</span>
                <span className="font-semibold text-slate-800">
                  ซัก {order.washer_weight || '9KG'} + อบ {order.dryer_weight || '17KG'}
                </span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200 font-bold text-slate-800">
                <span>ค่าบริการรับ-ส่ง:</span>
                <span className="text-sky-600 text-sm">฿{order.delivery_fee?.toFixed(2)}</span>
              </div>
            </div>

            {/* Quick Actions */}
            {order.payment_status !== 'PAID' && (
              <div className="text-center pt-2">
                <Link
                  href={`/payment?order_id=${order.order_id}`}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm shadow-cute-button transition-all"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>ไปหน้าชำระเงินและแนบสลิป</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500">กำลังโหลด...</div>}>
      <TrackOrderContent />
    </Suspense>
  );
}
