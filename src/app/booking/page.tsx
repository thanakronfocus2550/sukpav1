'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import confetti from 'canvas-confetti';
import {
  ShoppingBag,
  Sparkles,
  Building2,
  Phone,
  User,
  Layers,
  AlertCircle,
  CheckCircle2,
  Copy,
  ArrowRight,
  ShieldCheck,
  Loader2,
  CreditCard,
  Banknote,
  QrCode,
  Upload,
  Clock,
  Flame,
  Check,
} from 'lucide-react';
import {
  DormType,
  WasherWeight,
  WashProgram,
  DryerWeight,
  PaymentMethod,
  WASH_PROGRAM_LABELS,
  WASHER_PRICING_TABLE,
  DRYER_PRICING_TABLE,
  LOCKED_PAYMENT_CONFIG,
  Order,
} from '@/lib/types';
import { getPromptPayQrUrl } from '@/lib/promptpay';

const INSIDE_DORMS = [
  'หอพักหญิง 1',
  'หอพักหญิง 2',
  'หอพักชาย 1',
  'หอพักอาจารย์และบุคลากร',
  'หอพักในอื่นๆ (ระบุในหมายเหตุ)',
];

export default function BookingPage() {
  // 1. ข้อมูลผู้ติดต่อ
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [dormType, setDormType] = useState<DormType>('INSIDE');
  const [dormName, setDormName] = useState(INSIDE_DORMS[0]);
  const [customDormName, setCustomDormName] = useState('');
  const [roomNo, setRoomNo] = useState('');
  const [basketCount, setBasketCount] = useState(1);
  const [note, setNote] = useState('');

  // 2. เครื่องซักผ้า (ตามป้ายราคาจริง)
  const [washerWeight, setWasherWeight] = useState<WasherWeight>('9KG');
  const [washProgram, setWashProgram] = useState<WashProgram>('COLD_STANDARD');
  const [drumWashHot, setDrumWashHot] = useState(false); // ล้างถังด้วยน้ำร้อน +10
  const [extraRinse, setExtraRinse] = useState(false); // ล้างน้ำเพิ่ม +20 หรือ +30
  const [ownDetergent, setOwnDetergent] = useState(false); // เอาน้ำยามาเอง

  // 3. เครื่องอบผ้า (ตามป้ายราคาจริง)
  const [dryerWeight, setDryerWeight] = useState<DryerWeight>('17KG');
  const [extraDryCount, setExtraDryCount] = useState(0); // ต่อเวลาอบรอบละ 10 บาท

  // 4. วิธีชำระเงิน
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('PROMPTPAY');
  const [slipFile, setSlipFile] = useState<string | null>(null);
  const [agreedTerms, setAgreedTerms] = useState(false); // ยอมรับกฎและเงื่อนไขการให้บริการ

  // Delivery Fees (Snapshot: หอใน 40, หอนอก 35)
  const [fees, setFees] = useState<{ INSIDE: number; OUTSIDE: number }>({
    INSIDE: 40,
    OUTSIDE: 35,
  });

  // UI State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [copiedOrderId, setCopiedOrderId] = useState(false);
  const [copiedPromptpay, setCopiedPromptpay] = useState(false);

  // Remember User Info State
  const [rememberMe, setRememberMe] = useState(true);
  const [hasSavedData, setHasSavedData] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('sukpa_customer_info');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.customerName) setCustomerName(parsed.customerName);
        if (parsed.customerPhone) setCustomerPhone(parsed.customerPhone);
        if (parsed.dormType) {
          setDormType(parsed.dormType);
          if (parsed.dormType === 'INSIDE') {
            setDormName(parsed.dormName || INSIDE_DORMS[0]);
          } else {
            setCustomDormName(parsed.dormName || '');
          }
        }
        if (parsed.roomNo) setRoomNo(parsed.roomNo);
        setHasSavedData(true);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleClearSavedData = () => {
    try {
      localStorage.removeItem('sukpa_customer_info');
      setCustomerName('');
      setCustomerPhone('');
      setCustomDormName('');
      setRoomNo('');
      setHasSavedData(false);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetch('/api/fees')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.fees) {
          const newFees = { INSIDE: 40, OUTSIDE: 35 };
          data.fees.forEach((f: { dorm_type: DormType; fee_amount: number }) => {
            if (f.dorm_type === 'INSIDE') newFees.INSIDE = f.fee_amount;
            if (f.dorm_type === 'OUTSIDE') newFees.OUTSIDE = f.fee_amount;
          });
          setFees(newFees);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleDormTypeChange = (type: DormType) => {
    setDormType(type);
    if (type === 'INSIDE') {
      setDormName(INSIDE_DORMS[0]);
    } else {
      setDormName('');
    }
  };

  // Exact Price Calculations according to table
  const deliveryFee = dormType === 'INSIDE' ? fees.INSIDE : fees.OUTSIDE;
  const washerBasePrice = WASHER_PRICING_TABLE[washerWeight][washProgram];
  const drumWashHotFee = drumWashHot ? 10 : 0;
  const extraRinseFee = extraRinse
    ? ['20KG', '28KG'].includes(washerWeight)
      ? 30
      : 20
    : 0;
  const totalWasherPrice = washerBasePrice + drumWashHotFee + extraRinseFee;

  const dryerBasePrice = DRYER_PRICING_TABLE[dryerWeight].basePrice;
  const extraDryFee = extraDryCount * 10;
  const totalDryerPrice = dryerBasePrice + extraDryFee;

  const grandTotal = deliveryFee + totalWasherPrice + totalDryerPrice;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('ขนาดไฟล์รูปภาพสลิปต้องไม่เกิน 5 MB');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setErrorMsg('');

    if (!customerName.trim()) {
      setErrorMsg('กรุณากรอกชื่อ-นามสกุล หรือชื่อเล่น');
      return;
    }
    if (!customerPhone.trim() || customerPhone.trim().length < 9) {
      setErrorMsg('กรุณากรอกเบอร์โทรศัพท์ที่ถูกต้อง (9-10 หลัก)');
      return;
    }

    const finalDormName = dormType === 'INSIDE' ? dormName : customDormName.trim();
    if (!finalDormName) {
      setErrorMsg('กรุณาระบุชื่อหอพัก');
      return;
    }

    if (!roomNo.trim()) {
      setErrorMsg('กรุณาระบุเลขที่ห้องพัก');
      return;
    }

    if (paymentMethod === 'PROMPTPAY' && !slipFile) {
      setErrorMsg('กรุณาแนบภาพสลิปการโอนเงิน หรือเลือกชำระด้วยเงินสด (จ่ายตอนเริ่มงาน)');
      return;
    }

    if (!agreedTerms) {
      setErrorMsg('กรุณาทำเครื่องหมายยอมรับ "กฎและเงื่อนไขการให้บริการ" ก่อนยืนยันสั่งจอง');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName.trim(),
          customer_phone: customerPhone.trim(),
          dorm_type: dormType,
          dorm_name: finalDormName,
          room_no: roomNo.trim(),
          basket_count: Number(basketCount) || 1,
          washer_weight: washerWeight,
          wash_program: washProgram,
          drum_wash_hot: drumWashHot,
          extra_rinse: extraRinse,
          own_detergent: ownDetergent,
          dryer_weight: dryerWeight,
          extra_dry_count: extraDryCount,
          payment_method: paymentMethod,
          slip_url: paymentMethod === 'PROMPTPAY' ? slipFile : undefined,
          note: note.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ');
      }

      setCreatedOrder(data.order);

      // Save or Clear Remember Me Data
      if (rememberMe) {
        try {
          localStorage.setItem(
            'sukpa_customer_info',
            JSON.stringify({
              customerName: customerName.trim(),
              customerPhone: customerPhone.trim(),
              dormType,
              dormName: finalDormName,
              roomNo: roomNo.trim(),
            })
          );
          setHasSavedData(true);
        } catch {
          // ignore
        }
      } else {
        try {
          localStorage.removeItem('sukpa_customer_info');
          setHasSavedData(false);
        } catch {
          // ignore
        }
      }

      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string, isPromptpay = false) => {
    navigator.clipboard.writeText(text);
    if (isPromptpay) {
      setCopiedPromptpay(true);
      setTimeout(() => setCopiedPromptpay(false), 2000);
    } else {
      setCopiedOrderId(true);
      setTimeout(() => setCopiedOrderId(false), 2500);
    }
  };

  const qrUrl = getPromptPayQrUrl(LOCKED_PAYMENT_CONFIG.promptpayNumber, grandTotal);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header Title */}
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 text-sky-700 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-sky-500" />
            <span>ราคาตามป้ายจริง • คำนวณรวมค่าส่งเบ็ดเสร็จ</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            จองรับผ้าออนไลน์ (SUK PA?)
          </h1>
          <p className="text-slate-600 text-sm max-w-md mx-auto">
            เลือกขนาดตู้ซักและอบ คำนวณราคารวมส่ง ชำระเงินเพื่อรับ Order ID ทันที
          </p>
        </div>

        {/* Success Modal: ชำระเงินแล้วได้เลข Order ID ทันที */}
        {createdOrder ? (
          <div className="bg-white rounded-3xl p-8 border-2 border-emerald-300 shadow-cute-lg text-center space-y-6 animate-in zoom-in-95">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl mx-auto flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                สั่งจองและชำระเงินเรียบร้อย
              </span>
              <h2 className="text-2xl font-black text-slate-900">
                ได้รับหมายเลขคำสั่งซื้อของคุณแล้ว! 🧺
              </h2>
              <p className="text-xs text-slate-500">
                ระบบได้บันทึกออเดอร์และแจ้งเตือนทีมงานเรียบร้อยแล้ว
              </p>
            </div>

            {/* Generated Order ID Display Box */}
            <div className="p-4 bg-sky-50 rounded-2xl border border-sky-200 flex items-center justify-between max-w-md mx-auto">
              <div className="text-left">
                <span className="text-xs text-slate-500 block">หมายเลขคำสั่งซื้อ (Order ID)</span>
                <span className="text-xl font-black text-sky-700 tracking-wide font-mono">
                  {createdOrder.order_id}
                </span>
              </div>
              <button
                onClick={() => copyToClipboard(createdOrder.order_id, false)}
                className="flex items-center gap-1 text-xs bg-white text-sky-700 font-semibold px-3 py-2 rounded-xl border border-sky-300 shadow-sm hover:bg-sky-50"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedOrderId ? 'คัดลอกแล้ว!' : 'คัดลอก'}</span>
              </button>
            </div>

            {/* Summary Details */}
            <div className="bg-slate-50 p-5 rounded-2xl text-left text-xs space-y-2.5 max-w-md mx-auto border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">ผู้จอง:</span>
                <span className="font-semibold text-slate-800">{createdOrder.customer_name} ({createdOrder.customer_phone})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">สถานที่:</span>
                <span className="font-semibold text-slate-800">
                  {createdOrder.dorm_name} ห้อง {createdOrder.room_no} ({createdOrder.dorm_type === 'INSIDE' ? 'หอใน' : 'หอนอก'})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">ตู้ซัก+อบ:</span>
                <span className="font-semibold text-slate-800">
                  ซัก {createdOrder.washer_weight} + อบ {createdOrder.dryer_weight}
                </span>
              </div>
              {createdOrder.own_detergent && (
                <div className="flex justify-between text-amber-700 bg-amber-50 px-2 py-1 rounded-lg">
                  <span className="font-medium">น้ำยาซักผ้า:</span>
                  <span className="font-bold">🧴 ลูกค้านำน้ำยามาเอง</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">วิธีชำระเงิน:</span>
                <span className="font-bold text-slate-800">
                  {createdOrder.payment_method === 'CASH'
                    ? '💵 เงินสด (จ่ายตอนเริ่มงาน/ไรเดอร์รับผ้า)'
                    : '💳 โอนพร้อมเพย์ (แนบสลิปแล้ว)'}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm">
                <span className="font-bold text-slate-700">ยอดรวมทั้งสิ้น (รวมส่ง):</span>
                <span className="font-black text-sky-600 text-lg">
                  ฿{createdOrder.total_amount.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Next Steps */}
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-left text-xs text-amber-800 space-y-1 max-w-md mx-auto">
              <p className="font-bold">📌 สิ่งที่ต้องเตรียม:</p>
              <p>• นำตะกร้าผ้ามาวางไว้หน้าห้อง หรือจุดรับผ้าของหอพัก</p>
              {createdOrder.payment_method === 'CASH' && (
                <p>• เตรียมเงินสด <strong>฿{createdOrder.total_amount.toFixed(2)}</strong> ให้ไรเดอร์ตอนเข้ารับผ้า</p>
              )}
              <p>• สามารถใช้ Order ID นี้เพื่อตรวจสอบสถานะผ้าได้ตลอดเวลา</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-center max-w-md mx-auto pt-2">
              <Link
                href={`/track?order_id=${createdOrder.order_id}`}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold shadow-cute-button hover:brightness-105 transition-all text-sm"
              >
                <span>ติดตามสถานะออเดอร์</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          /* Booking Form */
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl p-6 sm:p-10 border border-sky-100 shadow-cute-lg space-y-8"
          >
            {errorMsg && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* แจ้งเตือนเมื่อโหลดข้อมูลที่เคยบันทึกไว้ */}
            {hasSavedData && (
              <div className="flex items-center justify-between p-3.5 bg-sky-50 text-sky-800 rounded-2xl text-xs border border-sky-200 animate-in fade-in-50">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-sky-500 shrink-0" />
                  <span className="font-semibold">ดึงข้อมูลผู้ติดต่อและหอพักที่บันทึกไว้ให้อัตโนมัติ</span>
                </div>
                <button
                  type="button"
                  onClick={handleClearSavedData}
                  className="text-[11px] text-rose-500 hover:text-rose-600 underline font-semibold whitespace-nowrap ml-2"
                >
                  ล้างข้อมูลที่จำไว้
                </button>
              </div>
            )}

            {/* 1. ข้อมูลผู้ติดต่อ */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
                <User className="w-4 h-4 text-sky-500" />
                <span>1. ข้อมูลผู้ติดต่อ</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    ชื่อ-นามสกุล / ชื่อเล่น <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="เช่น น้องมาร์ค วิศวะ"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-400 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    เบอร์โทรศัพท์ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="08X-XXX-XXXX"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-400 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* 2. สถานที่รับผ้า */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
                <Building2 className="w-4 h-4 text-sky-500" />
                <span>2. สถานที่รับผ้า (มจพ. ปราจีนบุรี)</span>
              </h3>

              {/* Dorm Type Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  ประเภทที่พัก <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleDormTypeChange('INSIDE')}
                    className={`p-3.5 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                      dormType === 'INSIDE'
                        ? 'border-sky-500 bg-sky-50/70 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-800">หอใน</span>
                      <span className="text-xs font-black text-sky-600 bg-white px-2 py-0.5 rounded-full border border-sky-200">
                        ค่าส่ง ฿{fees.INSIDE}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 mt-1">ในมหาวิทยาลัย มจพ.</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDormTypeChange('OUTSIDE')}
                    className={`p-3.5 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                      dormType === 'OUTSIDE'
                        ? 'border-blue-500 bg-blue-50/70 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-800">หอนอก</span>
                      <span className="text-xs font-black text-blue-600 bg-white px-2 py-0.5 rounded-full border border-blue-200">
                        ค่าส่ง ฿{fees.OUTSIDE}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 mt-1">หอพักรอบมหาวิทยาลัย</span>
                  </button>
                </div>
              </div>

              {/* Dorm Name & Room No. */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    ชื่อหอพัก <span className="text-rose-500">*</span>
                  </label>
                  {dormType === 'INSIDE' ? (
                    <select
                      value={dormName}
                      onChange={(e) => setDormName(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white text-sm"
                    >
                      {INSIDE_DORMS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      required
                      value={customDormName}
                      onChange={(e) => setCustomDormName(e.target.value)}
                      placeholder="เช่น หอสุขสบาย, หอทวีทรัพย์, หอบ้านสวน"
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-400 text-sm"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    เลขที่ห้อง <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={roomNo}
                    onChange={(e) => setRoomNo(e.target.value)}
                    placeholder="เช่น 302, 114"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-400 text-sm"
                  />
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer bg-slate-50 p-3 rounded-2xl border border-slate-200 hover:bg-slate-100/60 transition-all">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-sky-600 focus:ring-sky-500 w-4 h-4 cursor-pointer"
                />
                <span className="font-semibold text-slate-800">
                  💾 บันทึกข้อมูลของฉันสำหรับการสั่งครั้งต่อไป (ไม่ต้องพิมพ์ซ้ำในเครื่องนี้)
                </span>
              </label>
            </div>

            {/* 3. เลือกบริการตู้ซัก (ตามป้ายราคาจริง 100%) */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
                <Layers className="w-4 h-4 text-sky-500" />
                <span>3. บริการตู้ซักผ้า (เครื่องซัก Washer)</span>
              </h3>

              {/* เลือกขนาดเครื่องซัก */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  ขนาดเครื่องซักผ้า
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {(['9KG', '14KG', '20KG', '28KG'] as const).map((w) => {
                    const isSelected = washerWeight === w;
                    return (
                      <button
                        key={w}
                        type="button"
                        onClick={() => setWasherWeight(w)}
                        className={`p-3 rounded-2xl border-2 text-left transition-all ${
                          isSelected
                            ? 'border-sky-500 bg-sky-50/80 shadow-sm'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="font-extrabold text-base text-slate-800">{w.replace('KG', ' kg')}</div>
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                          {w === '9KG' ? 'มาตรฐาน' : w === '14KG' ? 'ปานกลาง' : w === '20KG' ? 'จุเยอะ/ผ้านวม' : 'จัมโบ้พิเศษ'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* เลือกโปรแกรมการซัก (ตามตาราง 1-7) */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">
                    โปรแกรมการซัก
                  </label>
                  <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                    โปรแกรม 2, 3, 6, 7 ฟรี น้ำยาซัก/ปรับผ้านุ่ม
                  </span>
                </div>

                <div className="space-y-2">
                  {(['COLD_STANDARD', 'WARM_STANDARD', 'COLD_NO_CHEM', 'ANTI_BACTERIA_COLD', 'ANTI_BACTERIA_WARM'] as const).map((prog) => {
                    const price = WASHER_PRICING_TABLE[washerWeight][prog];
                    const isSelected = washProgram === prog;
                    return (
                      <button
                        key={prog}
                        type="button"
                        onClick={() => setWashProgram(prog)}
                        className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                          isSelected
                            ? 'border-sky-500 bg-sky-50/80 shadow-sm ring-1 ring-sky-500'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-sky-600 bg-sky-600 text-white' : 'border-slate-300'}`}>
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <div>
                            <span className="font-semibold text-xs text-slate-800 block">
                              {WASH_PROGRAM_LABELS[prog].label}
                            </span>
                            {WASH_PROGRAM_LABELS[prog].freeChemical && (
                              <span className="text-[10px] text-emerald-600 font-medium">✓ ฟรีน้ำยาซักผ้าและปรับผ้านุ่ม</span>
                            )}
                          </div>
                        </div>
                        <span className="font-black text-sky-700 text-sm">฿{price}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ตัวเลือกเสริมเครื่องซัก (ล้างถังด้วยน้ำร้อน / ล้างน้ำเพิ่ม / เอาน้ำยามาเอง) */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-700 block">
                  ตัวเลือกเสริมเครื่องซักผ้า:
                </span>
                <div className="flex flex-col sm:flex-row gap-3">
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer bg-white p-2.5 rounded-xl border border-slate-200 flex-1">
                    <input
                      type="checkbox"
                      checked={drumWashHot}
                      onChange={(e) => setDrumWashHot(e.target.checked)}
                      className="rounded text-sky-600 focus:ring-sky-500 w-4 h-4"
                    />
                    <span>ล้างถังด้วยน้ำร้อน (+10 บาท)</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer bg-white p-2.5 rounded-xl border border-slate-200 flex-1">
                    <input
                      type="checkbox"
                      checked={extraRinse}
                      onChange={(e) => setExtraRinse(e.target.checked)}
                      className="rounded text-sky-600 focus:ring-sky-500 w-4 h-4"
                    />
                    <span>
                      ล้างน้ำเพิ่ม ({['20KG', '28KG'].includes(washerWeight) ? '+30 บาท' : '+20 บาท'})
                    </span>
                  </label>
                </div>

                {/* ติ๊กช่องว่าเอาน้ำยามาเอง */}
                <label className="flex items-start sm:items-center gap-2.5 text-xs text-slate-700 cursor-pointer bg-amber-50/80 p-3 rounded-xl border border-amber-200 hover:bg-amber-100/50 transition-all">
                  <input
                    type="checkbox"
                    checked={ownDetergent}
                    onChange={(e) => setOwnDetergent(e.target.checked)}
                    className="mt-0.5 sm:mt-0 rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                  />
                  <div>
                    <span className="font-bold text-amber-900 block">🧴 เอาน้ำยามาเอง (ลูกค้านำน้ำยาซักผ้า/ปรับผ้านุ่มมาเอง)</span>
                    <span className="text-[11px] text-amber-700">ทางร้านจะใช้น้ำยาของลูกค้าที่ฝากมาพร้อมตะกร้าผ้า</span>
                  </div>
                </label>
              </div>
            </div>

            {/* 4. บริการเครื่องอบผ้า (ตามป้ายราคาจริง 100%) */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
                <Flame className="w-4 h-4 text-rose-500" />
                <span>4. บริการเครื่องอบผ้า (เครื่องอบ Dryer อบแห้ง 25 นาที)</span>
              </h3>

              <div className="grid grid-cols-3 gap-2.5">
                {(['17KG', '24KG', '30KG'] as const).map((w) => {
                  const opt = DRYER_PRICING_TABLE[w];
                  const isSelected = dryerWeight === w;
                  return (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setDryerWeight(w)}
                      className={`p-3.5 rounded-2xl border-2 text-left transition-all ${
                        isSelected
                          ? 'border-rose-500 bg-rose-50/70 shadow-sm ring-1 ring-rose-500'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="font-extrabold text-base text-slate-800">{w.replace('KG', ' kg')}</div>
                      <div className="text-xs font-black text-rose-600 mt-1">฿{opt.basePrice}</div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        อบ 25 นาที (ต่อเวลา 10บ./{opt.extraTimeMins}นาที)
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* ต่อเวลาอบ */}
              <div className="flex items-center justify-between p-3.5 bg-rose-50/50 rounded-2xl border border-rose-100 text-xs">
                <div>
                  <span className="font-bold text-slate-800 block">ต่อเวลาอบผ้า</span>
                  <span className="text-[11px] text-slate-500">
                    +10 บาท ({DRYER_PRICING_TABLE[dryerWeight].extraTimeMins} นาที/รอบ)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setExtraDryCount(Math.max(0, extraDryCount - 1))}
                    className="w-8 h-8 rounded-lg bg-white border border-rose-200 font-bold"
                  >
                    -
                  </button>
                  <span className="font-bold text-slate-800 w-12 text-center">
                    {extraDryCount > 0 ? `+${extraDryCount} รอบ` : 'ไม่อบเพิ่ม'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setExtraDryCount(extraDryCount + 1)}
                    className="w-8 h-8 rounded-lg bg-rose-500 text-white font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* ตะกร้าและหมายเหตุ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    จำนวนตะกร้าผ้า
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setBasketCount(Math.max(1, basketCount - 1))}
                      className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold"
                    >
                      -
                    </button>
                    <div className="flex-1 text-center font-bold text-slate-800 py-2 border rounded-xl border-slate-200">
                      {basketCount} ตะกร้า
                    </div>
                    <button
                      type="button"
                      onClick={() => setBasketCount(basketCount + 1)}
                      className="w-10 h-10 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    หมายเหตุเพิ่มเติม (ถ้ามี)
                  </label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="เช่น แขวนไว้หน้าห้อง, แยกผ้าสี"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm"
                  />
                </div>
              </div>
            </div>

            {/* สรุปยอดรวมเบ็ดเสร็จ (ค่าส่ง + ตู้ซัก + ตู้อบ) */}
            <div className="bg-gradient-to-br from-sky-50 via-sky-50/50 to-blue-50 p-6 rounded-3xl border-2 border-sky-300 space-y-3">
              <span className="text-xs font-bold text-sky-700 bg-white px-3 py-1 rounded-full border border-sky-200">
                สรุปยอดคำนวณรวมทั้งหมด (ราคาตรงตามป้าย)
              </span>

              <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                <div className="flex justify-between">
                  <span>ค่าบริการรับ-ส่ง ({dormType === 'INSIDE' ? 'หอใน' : 'หอนอก'}):</span>
                  <span className="font-bold text-slate-800">฿{deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>
                    เครื่องซัก {washerWeight.replace('KG', 'kg')} ({WASH_PROGRAM_LABELS[washProgram].label.split(' ')[0]}
                    {drumWashHot ? ' +ล้างถัง' : ''}
                    {extraRinse ? ' +ล้างน้ำเพิ่ม' : ''}):
                  </span>
                  <span className="font-bold text-slate-800">฿{totalWasherPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>
                    เครื่องอบ {dryerWeight.replace('KG', 'kg')} (อบ 25 นาที{extraDryCount > 0 ? ` +ต่อเวลา ${extraDryCount} รอบ` : ''}):
                  </span>
                  <span className="font-bold text-slate-800">฿{totalDryerPrice.toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-sky-200 flex items-center justify-between">
                <div>
                  <span className="text-sm font-extrabold text-slate-900 block">
                    ยอดสุทธิที่ต้องชำระ
                  </span>
                  <span className="text-[11px] text-sky-600">รวมค่าส่งและเครื่องซักอบเรียบร้อย</span>
                </div>
                <span className="text-3xl font-black text-sky-600">
                  ฿{grandTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* 5. ชำระเงิน (ชำระเงินก่อนแล้วค่อยมีเลขออเดอร์) */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
                <CreditCard className="w-4 h-4 text-sky-500" />
                <span>5. เลือกวิธีชำระเงิน (ชำระเงินก่อนเพื่อรับ Order ID)</span>
              </h3>

              {/* Payment Method Switcher */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Method 1: PromptPay */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('PROMPTPAY')}
                  className={`p-4 rounded-2xl border-2 text-left transition-all flex items-center gap-3 ${
                    paymentMethod === 'PROMPTPAY'
                      ? 'border-sky-500 bg-sky-50/80 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-sm text-slate-800 block">
                      โอนผ่านพร้อมเพย์
                    </span>
                    <span className="text-[11px] text-slate-500">สแกน QR Code และแนบสลิป</span>
                  </div>
                </button>

                {/* Method 2: Cash on Pickup */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CASH')}
                  className={`p-4 rounded-2xl border-2 text-left transition-all flex items-center gap-3 ${
                    paymentMethod === 'CASH'
                      ? 'border-emerald-500 bg-emerald-50/80 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <Banknote className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-sm text-slate-800 block">
                      เงินสด (จ่ายตอนเริ่มงาน)
                    </span>
                    <span className="text-[11px] text-slate-500">จ่ายให้ไรเดอร์ตอนเข้ารับผ้า</span>
                  </div>
                </button>
              </div>

              {/* If PromptPay is selected */}
              {paymentMethod === 'PROMPTPAY' && (
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200 space-y-5 animate-in fade-in-50">
                  <div className="text-center space-y-3">
                    <span className="text-xs font-bold text-sky-700 bg-sky-100 px-3 py-1 rounded-full">
                      สแกน QR Code โอนเงิน ฿{grandTotal.toFixed(2)}
                    </span>

                    {/* QR Code Container */}
                    <div className="w-48 h-48 mx-auto bg-white p-3 rounded-2xl border-2 border-slate-200 shadow-sm flex items-center justify-center">
                      <Image
                        src={qrUrl}
                        alt="PromptPay QR Code"
                        width={180}
                        height={180}
                        className="rounded-lg object-contain"
                        unoptimized
                      />
                    </div>

                    {/* Locked Account Info */}
                    <div className="bg-white p-3.5 rounded-2xl border border-slate-200 text-xs text-left max-w-sm mx-auto space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">พร้อมเพย์:</span>
                        <div className="flex items-center gap-1 font-mono font-bold text-slate-900">
                          <span>{LOCKED_PAYMENT_CONFIG.promptpayNumber}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(LOCKED_PAYMENT_CONFIG.promptpayNumber, true)}
                            className="text-sky-600 hover:text-sky-700 text-xs ml-1"
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
                        <span className="text-slate-500">ยอดที่ต้องโอน:</span>
                        <strong className="text-sky-600 font-black">฿{grandTotal.toFixed(2)}</strong>
                      </div>
                    </div>

                    {copiedPromptpay && (
                      <p className="text-xs text-emerald-600 font-semibold animate-pulse">
                        ✓ คัดลอกหมายเลขพร้อมเพย์ {LOCKED_PAYMENT_CONFIG.promptpayNumber} แล้ว
                      </p>
                    )}
                  </div>

                  {/* Slip Upload Box */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700">
                      แนบภาพสลิปการโอนเงิน <span className="text-rose-500">*</span>
                    </label>

                    <label className="border-2 border-dashed border-sky-300 hover:border-sky-500 bg-white rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer transition-all">
                      {slipFile ? (
                        <div className="space-y-2 text-center">
                          <div className="relative w-32 h-44 mx-auto rounded-xl overflow-hidden border shadow-sm">
                            <Image src={slipFile} alt="Slip" fill className="object-cover" />
                          </div>
                          <span className="text-xs text-sky-600 font-semibold block">
                            คลิกเพื่อเปลี่ยนรูปสลิป
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-1 text-center text-slate-500">
                          <Upload className="w-7 h-7 text-sky-500 mx-auto" />
                          <p className="text-xs font-medium">คลิกเพื่ออัปโหลดสลิป หรือลากไฟล์มาวาง</p>
                          <p className="text-[10px] text-slate-400">PNG, JPG ไม่เกิน 5MB</p>
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
                </div>
              )}

              {/* If Cash is selected */}
              {paymentMethod === 'CASH' && (
                <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 space-y-2 animate-in fade-in-50">
                  <div className="flex items-center gap-2 font-bold text-sm text-emerald-800">
                    <Banknote className="w-5 h-5 text-emerald-600" />
                    <span>ชำระด้วยเงินสด (จ่ายตอนเริ่มงาน)</span>
                  </div>
                  <p className="leading-relaxed">
                    คุณเลือกชำระเงินสด ยอดรวมทั้งสิ้น <strong>฿{grandTotal.toFixed(2)}</strong>{' '}
                    สามารถนำเงินสดมอบให้พี่ไรเดอร์ตอนเข้ารับตะกร้าผ้าที่หน้าห้องได้เลยครับ
                  </p>
                </div>
              )}
            </div>

            {/* 6. กฎและเงื่อนไขการให้บริการ (ต้องกดยอมรับก่อนยืนยันชำระเงิน) */}
            <div className="bg-slate-50/90 rounded-3xl p-5 border border-slate-200 space-y-3.5">
              <div className="flex items-center gap-2 text-slate-800">
                <ShieldCheck className="w-5 h-5 text-sky-600" />
                <h4 className="font-bold text-sm">กฎและเงื่อนไขการให้บริการ SUK PA? (ซักป่ะ?)</h4>
              </div>

              <div className="text-xs text-slate-600 space-y-2 bg-white p-4 rounded-2xl border border-slate-200 leading-relaxed">
                <div className="flex items-start gap-2">
                  <span className="font-bold text-sky-600">1.</span>
                  <p>
                    <strong className="text-slate-800">ตรวจสอบกระเป๋าเสื้อผ้า:</strong> กรุณาตรวจสอบและนำสิ่งของมีค่า เช่น เงินสด หูฟัง กุญแจ ลิปสติก ปากกา หรือสิ่งของมีคม ออกจากกระเป๋าเสื้อผ้าทุกชิ้นก่อนส่งซัก
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-sky-600">2.</span>
                  <p>
                    <strong className="text-slate-800">การแยกผ้าสี/ผ้าบอบบาง:</strong> กรุณาแยกผ้าขาว ผ้าที่สีตกง่าย หรือผ้าเนื้อบอบบางเป็นพิเศษ ทางร้านขอสงวนสิทธิ์ไม่รับผิดชอบกรณีสีตกใส่กันหากไม่ได้แยกไว้
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-sky-600">3.</span>
                  <p>
                    <strong className="text-slate-800">การรับ-ส่งผ้า:</strong> โปรดระบุชื่อหอพัก เลขห้อง และเบอร์โทรศัพท์ที่ติดต่อได้จริง และโปรดรับสายเจ้าหน้าที่หรือตอบข้อความเมื่อถึงเวลานัดรับ-ส่งผ้า
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-sky-600">4.</span>
                  <p>
                    <strong className="text-slate-800">ขนาดตู้ซักและอบ:</strong> ควรเลือกขนาดตู้ให้เหมาะสมกับปริมาณผ้า หากใส่ผ้าแน่นเกินพิกัดตู้ อาจทำให้ผ้าซักไม่สะอาดหรืออบไม่แห้งสนิท
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-sky-600">5.</span>
                  <p>
                    <strong className="text-slate-800">การชำระเงิน:</strong> กรณีโอนเงินโปรดแนบสลิปที่มียอดเงินตรงตามระบบ / กรณีเงินสดโปรดเตรียมเงินสดให้พอดีกับยอดแจ้งชำระตอนเข้ารับผ้า
                  </p>
                </div>
              </div>

              {/* Checkbox ยอมรับกฎ */}
              <label className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                agreedTerms 
                  ? 'bg-sky-50 border-sky-400 ring-1 ring-sky-300' 
                  : 'bg-white border-slate-300 hover:border-slate-400'
              }`}>
                <input
                  type="checkbox"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="mt-0.5 rounded text-sky-600 focus:ring-sky-500 w-4 h-4 cursor-pointer"
                />
                <span className="text-xs text-slate-800 font-medium leading-relaxed">
                  ฉันได้อ่าน ทำความเข้าใจ และยอมรับ <strong className="text-sky-700">กฎและเงื่อนไขการให้บริการของ SUK PA?</strong> เรียบร้อยแล้ว <span className="text-rose-500">*</span>
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !agreedTerms}
              className={`w-full py-4 rounded-2xl text-white font-black text-lg transition-all flex items-center justify-center gap-2 ${
                agreedTerms
                  ? 'bg-gradient-to-r from-sky-500 to-blue-600 shadow-cute-button hover:brightness-105 active:scale-95'
                  : 'bg-slate-300 cursor-not-allowed opacity-70'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>กำลังดำเนินการและสร้าง Order ID...</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-5 h-5" />
                  <span>
                    {paymentMethod === 'CASH'
                      ? `ยืนยันสั่งจอง (จ่ายสด ฿${grandTotal.toFixed(2)})`
                      : `ยืนยันการโอนเงินและรับ Order ID (฿${grandTotal.toFixed(2)})`}
                  </span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
