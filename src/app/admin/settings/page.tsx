'use client';

import { useState } from 'react';
import {
  Bell,
  Send,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Server,
  Key,
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  const testTelegram = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/telegram/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'ทดสอบส่งข้อความแจ้งเตือนจากหน้า Admin SUK PA?' }),
      });
      const data = await res.json();
      if (data.success) {
        setTestResult('✓ ทดสอบส่งข้อความสำเร็จ: ระบบแจ้งเตือนพร้อมทำงาน');
      } else {
        setTestResult(`⚠️ ${data.error || 'ไม่สามารถส่งได้'}`);
      }
    } catch (err: unknown) {
      setTestResult(`Error: ${String(err)}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          ตั้งค่าระบบ & Telegram Bot
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          ตั้งค่าการแจ้งเตือนแอดมินผ่าน Telegram Bot (@SukPaAdminBot) และความปลอดภัย
        </p>
      </div>

      {/* Bot Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Telegram Admin Bot</h3>
            <p className="text-xs text-sky-600 font-medium">@SukPaAdminBot (Server Environment Variables)</p>
          </div>
        </div>

        <div className="p-4 bg-slate-50 rounded-2xl text-xs space-y-2 text-slate-600 border border-slate-200">
          <p>
            🔒 <strong>ความปลอดภัย:</strong> Bot Token และ Admin Chat ID ถูกเก็บไว้ใน Server Environment
            Variables เท่านั้น ไม่ถูกเปิดเผยในฝั่ง Client
          </p>
          <p>
            📢 <strong>10 เหตุการณ์แจ้งเตือน:</strong> มีออเดอร์ใหม่, ยกเลิกออเดอร์, อัปโหลดสลิป, ยืนยันชำระเงิน,
            ยอดไม่ถูกต้อง, ค้างชำระ, ส่งผ้าให้พาร์ทเนอร์, พาร์ทเนอร์ทำเสร็จ, สรุปรายงานพร้อมส่ง, ตรวจพบข้อผิดพลาด
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={testTelegram}
            disabled={testing}
            className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow-cute-button transition-all flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>{testing ? 'กำลังทดสอบ...' : 'ทดสอบส่งข้อความแจ้งเตือน'}</span>
          </button>
        </div>

        {testResult && (
          <div className="p-3 bg-sky-50 border border-sky-200 text-sky-800 text-xs rounded-xl">
            {testResult}
          </div>
        )}
      </div>

      {/* Supabase PostgreSQL Status */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">ฐานข้อมูล Supabase PostgreSQL</h3>
            <p className="text-xs text-emerald-600 font-medium">Schema, RLS & Seed Files Ready</p>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          ไฟล์สคริปต์ SQL พร้อมใช้งานอยู่ในโฟลเดอร์ <code className="bg-slate-100 px-1 py-0.5 rounded">supabase/schema.sql</code> และ <code className="bg-slate-100 px-1 py-0.5 rounded">supabase/seed.sql</code> สามารถนำไปรันบน Supabase SQL Editor ได้ทันที
        </p>
      </div>
    </div>
  );
}
