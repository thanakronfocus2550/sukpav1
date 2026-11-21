'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  CreditCard,
  QrCode,
  Upload,
  CheckCircle2,
  AlertCircle,
  Copy,
  Clock,
  Search,
  ShieldCheck,
  Banknote,
  Loader2,
} from 'lucide-react';
import { Order, LOCKED_PAYMENT_CONFIG } from '@/lib/types';
import { getPromptPayQrUrl } from '@/lib/promptpay';

function PaymentContent() {
  const searchParams = useSearchParams();
  const initialOrderId = searchParams.get('order_id') || '';

  const [orderId, setOrderId] = useState(initialOrderId);
  const [order, setOrder] = useState<Order | null>(null);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [slipFile, setSlipFile] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedAccount, setCopiedAccount] = useState(false);

  const fetchOrder = async (id: string) => {
    if (!id.trim()) return;
    setLoadingOrder(true);
    setErrorMsg('');
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(id.trim())}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'ไม่พบหมายเลขคำสั่งซื้อนี้');
      }
      setOrder(data.order);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg);
      setOrder(null);
    } finally {
      setLoadingOrder(false);
    }
  };

  useEffect(() => {
    if (initialOrderId) {
      fetchOrder(initialOrderId);
    }
  }, [initialOrderId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('ขนาดไฟล์รูปภาพต้องไม่เกิน 5 MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setSlipFile(reader.result as string);
        setErrorMsg('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadSlip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) {
      setErrorMsg('กรุณาระบุ Order ID และค้นหาออเดอร์ก่อนแนบสลิป');
      return;
    }
    if (!slipFile) {
      setErrorMsg('กรุณาเลือกรูปภาพสลิปการโอนเงิน');
      return;
    }

    setIsUploading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: order.id,
          slip_url: slipFile,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'ไม่สามารถอัปโหลดสลิปได้');
      }

      setUploadSuccess(true);
      await fetchOrder(order.id);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const totalAmount = order?.total_amount || 0;
  const qrUrl = getPromptPayQrUrl(LOCKED_PAYMENT_CONFIG.promptpayNumber, totalAmount);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 text-sky-700 text-xs font-semibold">
            <CreditCard className="w-3.5 h-3.5 text-sky-500" />
            <span>พร้อมเพย์ 0661323388 ธนกร ชูวงศ์วาลย์</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            ชำระเงินและแนบสลิป
          </h1>
          <p className="text-slate-600 text-sm max-w-md mx-auto">
            สแกน QR Code โอนเงินผ่านพร้อมเพย์ หรือตรวจสอบสถานะยอดเงินสด
          </p>
        </div>

        {/* Search Order ID input if not preloaded */}
        <div className="bg-white p-6 rounded-3xl border border-sky-100 shadow-cute">
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            ระบุหมายเลขคำสั่งซื้อ (Order ID) เพื่อตรวจสอบยอด
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="เช่น SP261122-0001"
              className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-400 font-mono text-sm uppercase"
            />
            <button
              onClick={() => fetchOrder(orderId)}
              disabled={loadingOrder}
              className="px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl font-bold text-sm shadow-cute-button transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {loadingOrder ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>ค้นหา</span>
            </button>
          </div>
          {errorMsg && (
            <p className="text-xs text-rose-600 mt-2 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errorMsg}</span>
            </p>
          )}
        </div>

        {/* Order Details & Payment Section */}
        {order && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Left: PromptPay QR */}
            <div className="md:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-sky-100 shadow-cute space-y-6 text-center">
              <span className="text-xs font-bold text-sky-600 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
                สแกนจ่ายผ่านแอปธนาคาร
              </span>

              {/* QR Code Container */}
              <div className="relative w-52 h-52 mx-auto bg-white border-2 border-slate-200 rounded-3xl p-3 shadow-inner flex flex-col items-center justify-center">
                <Image
                  src={qrUrl}
                  alt="PromptPay QR Code"
                  width={180}
                  height={180}
                  className="rounded-lg object-contain"
                  unoptimized
                />
              </div>

              {/* Account Details */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">พร้อมเพย์:</span>
                  <div className="flex items-center gap-1 font-mono font-bold text-slate-800">
                    <span>{LOCKED_PAYMENT_CONFIG.promptpayNumber}</span>
                    <button
                      onClick={() => copyToClipboard(LOCKED_PAYMENT_CONFIG.promptpayNumber)}
                      className="text-sky-600 hover:text-sky-700"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">ชื่อบัญชี:</span>
                  <strong className="text-slate-800">{LOCKED_PAYMENT_CONFIG.accountName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">ยอดที่ต้องชำระ:</span>
                  <strong className="text-sky-600 font-black">฿{order.total_amount.toFixed(2)}</strong>
                </div>
              </div>

              {copiedAccount && (
                <p className="text-xs text-emerald-600 font-semibold animate-pulse">
                  ✓ คัดลอกหมายเลขพร้อมเพย์เรียบร้อยแล้ว
                </p>
              )}
            </div>

            {/* Right: Summary & Upload */}
            <div className="md:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-sky-100 shadow-cute space-y-6">
              {/* Order Amount Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 text-white flex items-center justify-between shadow-md">
                <div>
                  <span className="text-xs text-sky-100 block">ยอดรวมทั้งสิ้น (ค่าส่ง + ตู้ซักอบ)</span>
                  <span className="text-3xl font-black">
                    ฿{order.total_amount.toFixed(2)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-sky-100 block">รหัสออเดอร์</span>
                  <span className="text-sm font-mono font-bold text-white bg-white/20 px-2 py-0.5 rounded-lg">
                    {order.order_id}
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-xs font-semibold text-slate-600">สถานะการชำระเงิน:</span>
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full ${
                    order.payment_status === 'PAID'
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                      : order.payment_status === 'WAITING_VERIFICATION'
                      ? 'bg-amber-100 text-amber-700 border border-amber-300'
                      : order.payment_status === 'WRONG_AMOUNT'
                      ? 'bg-rose-100 text-rose-700 border border-rose-300'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {order.payment_status === 'PAID'
                    ? '✓ ชำระเงินสำเร็จแล้ว'
                    : order.payment_status === 'WAITING_VERIFICATION'
                    ? '⏳ รอแอดมินตรวจสอบสลิป'
                    : order.payment_status === 'WRONG_AMOUNT'
                    ? '⚠️ ยอดเงินไม่ถูกต้อง'
                    : 'รอดำเนินการชำระเงิน'}
                </span>
              </div>

              {/* Upload Success State */}
              {uploadSuccess ? (
                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h4 className="font-bold text-emerald-800 text-base">
                    อัปโหลดสลิปเรียบร้อยแล้ว!
                  </h4>
                  <p className="text-xs text-emerald-700">
                    ระบบได้ส่งข้อมูลให้แอดมินตรวจสอบแล้วครับ
                  </p>
                  <Link
                    href={`/track?order_id=${order.order_id}`}
                    className="inline-block mt-2 text-xs font-bold text-emerald-800 underline"
                  >
                    ไปหน้าติดตามสถานะออเดอร์ →
                  </Link>
                </div>
              ) : order.payment_status === 'PAID' ? (
                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                  <h4 className="font-bold text-emerald-800">ยอดเงินได้รับการยืนยันแล้ว</h4>
                  <p className="text-xs text-emerald-600">ขอบพระคุณที่ใช้บริการ SUK PA? ครับ</p>
                </div>
              ) : (
                /* Upload Form */
                <form onSubmit={handleUploadSlip} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">
                      แนบภาพสลิปการโอนเงิน (PNG, JPG ไม่เกิน 5MB)
                    </label>

                    <label className="border-2 border-dashed border-sky-300 hover:border-sky-500 bg-sky-50/50 hover:bg-sky-50 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all">
                      {slipFile ? (
                        <div className="space-y-3 text-center">
                          <div className="relative w-36 h-48 mx-auto rounded-xl overflow-hidden border shadow-sm">
                            <Image
                              src={slipFile}
                              alt="Slip Preview"
                              fill
                              className="object-cover"
                            />
                          </div>
                          <span className="text-xs text-sky-600 font-semibold block">
                            คลิกเพื่อเปลี่ยนรูปสลิป
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-2 text-center text-slate-500">
                          <Upload className="w-8 h-8 text-sky-500 mx-auto" />
                          <p className="text-xs font-medium">คลิกเพื่อเลือกรูปภาพ หรือลากไฟล์มาวางที่นี่</p>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isUploading || !slipFile}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold text-base shadow-cute-button hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>กำลังส่งสลิป...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-5 h-5" />
                        <span>ยืนยันการแนบสลิป</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500">กำลังโหลด...</div>}>
      <PaymentContent />
    </Suspense>
  );
}
