'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Store,
  FileSpreadsheet,
  CreditCard,
  DollarSign,
  Tag,
  Bell,
  Menu,
  X,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';

const ADMIN_NAV = [
  { href: '/admin', label: 'ภาพรวมระบบ (Dashboard)', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'จัดการออเดอร์ (Orders)', icon: ShoppingBag },
  { href: '/admin/partners', label: 'ร้านพาร์ทเนอร์ (Partners)', icon: Store },
  { href: '/admin/reports', label: 'รายงานพาร์ทเนอร์ (Reports)', icon: FileSpreadsheet },
  { href: '/admin/payments', label: 'ตรวจสลิปโอนเงิน (Payments)', icon: CreditCard },
  { href: '/admin/fees', label: 'ตั้งค่าบริการรับ-ส่ง (Fees)', icon: Tag },
  { href: '/admin/finance', label: 'บัญชีรายรับ-จ่าย (Finance)', icon: DollarSign },
  { href: '/admin/settings', label: 'บอทแจ้งเตือน & ระบบ (Bot)', icon: Bell },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-72 bg-slate-900 text-white border-r border-slate-800 shrink-0">
        {/* Brand Banner */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-2xl overflow-hidden border-2 border-sky-400 bg-sky-100 shrink-0">
              <Image
                src="/images/mascot.jpg"
                alt="SUK PA? Mascot"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-white">SUK PA?</span>
                <span className="text-[10px] bg-sky-500 text-white font-bold px-1.5 py-0.5 rounded-full">
                  Admin
                </span>
              </div>
              <p className="text-[11px] text-sky-300">ระบบจัดการหลังบ้าน V1</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {ADMIN_NAV.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-sky-600 text-white font-semibold shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Back to Client Website Button */}
        <div className="p-4 border-t border-slate-800">
          <Link
            href="/"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-sky-300 hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>กลับสู่หน้าเว็บลูกค้า</span>
          </Link>
        </div>
      </aside>

      {/* Mobile Header Bar */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between sticky top-0 z-40 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="relative w-8 h-8 rounded-xl overflow-hidden border border-sky-400 bg-sky-100">
            <Image src="/images/mascot.jpg" alt="SUK PA? Mascot" fill className="object-cover" />
          </div>
          <span className="font-bold text-lg">SUK PA? Admin</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-300 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 text-white p-4 space-y-1 border-b border-slate-800">
          {ADMIN_NAV.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium ${
                  isActive ? 'bg-sky-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
          <div className="pt-2 border-t border-slate-800">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-xs text-sky-400"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>กลับสู่หน้าเว็บลูกค้า</span>
            </Link>
          </div>
        </div>
      )}

      {/* Main Admin Content Area */}
      <main className="flex-1 overflow-y-auto min-h-screen">
        {children}
      </main>
    </div>
  );
}
