'use client';

import { useState, useEffect } from 'react';
import {
  Tag,
  Building2,
  Save,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  RefreshCw,
  Info,
} from 'lucide-react';
import { DeliveryFeeSetting } from '@/lib/types';

export default function AdminFeesPage() {
  const [fees, setFees] = useState<DeliveryFeeSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [insideFee, setInsideFee] = useState<number>(40);
  const [outsideFee, setOutsideFee] = useState<number>(35);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchFees = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/fees');
      const data = await res.json();
      if (data.success && data.fees) {
        setFees(data.fees);
        data.fees.forEach((f: DeliveryFeeSetting) => {
          if (f.dorm_type === 'INSIDE') setInsideFee(f.fee_amount);
          if (f.dorm_type === 'OUTSIDE') setOutsideFee(f.fee_amount);
        });
      }
    } catch (err) {
      console.error('Error fetching fees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();
  }, []);

  const handleSave = async (dormType: 'INSIDE' | 'OUTSIDE', amount: number) => {
    setIsSaving(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const res = await fetch('/api/fees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dorm_type: dormType,
          fee_amount: Number(amount),
          actor: 'Admin',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update fee');
      }

      setSuccessMsg(`อัปเดตอัตราค่าบริการ ${dormType === 'INSIDE' ? 'หอใน' : 'หอนอก'} เป็น ฿${amount} สำเร็จ`);
      await fetchFees();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-5xl">
      {/* Top Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          ตั้งค่าบริการรับ-ส่ง (Delivery Fees Management)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          กำหนดราคาค่าบริการรับ-ส่งสำหรับหอในและหอนอก (มีระบบ Price Snapshot คุ้มครองราคาออเดอร์เดิม)
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center gap-2 animate-in fade-in-50">
          <CheckCircle2 className="w-5 h-5" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Fees Configuration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* หอใน */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sky-100 shadow-cute space-y-6">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-sky-600 bg-sky-50 px-3 py-1 rounded-full">
              มจพ. ปราจีนบุรี
            </span>
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-900">ค่าบริการ หอใน</h3>
            <p className="text-xs text-slate-500">
              ครอบคลุมหอพักหญิง 1-2, หอพักชาย 1, หอพักอาจารย์
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              อัตราค่าบริการ (บาท / ออเดอร์)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-slate-400 font-bold">฿</span>
              <input
                type="number"
                min="0"
                step="1"
                value={insideFee}
                onChange={(e) => setInsideFee(Number(e.target.value))}
                className="w-full pl-9 pr-4 py-3 rounded-2xl border border-slate-200 text-xl font-black text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>
          </div>

          <button
            onClick={() => handleSave('INSIDE', insideFee)}
            disabled={isSaving}
            className="w-full py-3.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-2xl text-sm shadow-cute-button transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>บันทึกราคาหอใน</span>
          </button>
        </div>

        {/* หอนอก */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-blue-100 shadow-cute space-y-6">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              รอบมหาวิทยาลัย
            </span>
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-900">ค่าบริการ หอนอก</h3>
            <p className="text-xs text-slate-500">
              ครอบคลุมหอพักเอกชนรอบ มจพ. ปราจีนบุรี
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              อัตราค่าบริการ (บาท / ออเดอร์)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-slate-400 font-bold">฿</span>
              <input
                type="number"
                min="0"
                step="1"
                value={outsideFee}
                onChange={(e) => setOutsideFee(Number(e.target.value))}
                className="w-full pl-9 pr-4 py-3 rounded-2xl border border-slate-200 text-xl font-black text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          <button
            onClick={() => handleSave('OUTSIDE', outsideFee)}
            disabled={isSaving}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-sm shadow-cute-button transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>บันทึกราคาหอนอก</span>
          </button>
        </div>
      </div>

      {/* Snapshot Protection Notice */}
      <div className="bg-sky-50 border border-sky-200 rounded-3xl p-6 flex items-start gap-4 text-sky-800 text-sm">
        <ShieldCheck className="w-6 h-6 text-sky-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-bold">ระบบรักษาความถูกต้องของราคา (Price Snapshot Engine)</h4>
          <p className="text-xs text-sky-700 leading-relaxed">
            เมื่อมีการปรับอัตราค่าบริการใหม่ ราคาใหม่จะมีผลเฉพาะออเดอร์ที่สร้างขึ้นหลังจากนี้เท่านั้น
            ออเดอร์เดิมทั้งหมดในระบบจะถูกล็อกด้วยราคา Snapshot ณ เวลาที่ลูกค้ากดจอง เพื่อป้องกันไม่ให้เกิดการแก้ไขราคาย้อนหลัง
            และบันทึกประวัติการแก้ไขลงใน Audit Log โดยอัตโนมัติ
          </p>
        </div>
      </div>
    </div>
  );
}
