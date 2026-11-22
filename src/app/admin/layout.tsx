'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
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
  Lock,
  LogOut,
  Eye,
  EyeOff,
  AlertCircle,
} from 'lucide-react';

const ADMIN_PASSWORD = 'focus0661323388';

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

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    try {
      const session = localStorage.getItem('sukpa_admin_auth');
      if (session === ADMIN_PASSWORD) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch {
      setIsAuthenticated(false);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput.trim() === ADMIN_PASSWORD) {
      try {
        localStorage.setItem('sukpa_admin_auth', ADMIN_PASSWORD);
      } catch {}
      setIsAuthenticated(true);
      setErrorMsg('');
    } else {
      setErrorMsg('รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('sukpa_admin_auth');
    } catch {}
    setIsAuthenticated(false);
    setPasswordInput('');
  };

  // Loading state while checking localStorage
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-400" />
      </div>
    );
  }

  // Password Gate Form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-md space-y-6 animate-in zoom-in-95">
          {/* Logo & Header */}
          <div className="text-center space-y-3">
            <div className="relative w-20 h-20 mx-auto rounded-3xl overflow-hidden border-2 border-sky-500 shadow-lg shadow-sky-500/20 bg-sky-900">
              <Image src="/images/mascot.jpg" alt="SUK PA? Mascot" fill className="object-cover" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-950 border border-sky-800 text-sky-400 text-xs font-semibold">
                <Lock className="w-3.5 h-3.5" />
                <span>พื้นที่เฉพาะผู้ดูแลระบบ (Admin Only)</span>
              </div>
              <h1 className="text-2xl font-black text-white mt-2 tracking-tight">
                เข้าสู่ระบบ SUK PA? Admin
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                กรุณาระบุรหัสผ่านเพื่อเข้าใช้งานระบบจัดการหลังบ้าน
              </p>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                รหัสผ่านผู้ดูแลระบบ (Admin Password)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoFocus
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="กรอกรหัสผ่านเข้าสู่ระบบ..."
                  className="w-full pl-4 pr-11 py-3.5 bg-slate-950 border border-slate-700 focus:border-sky-500 rounded-2xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 transition-all placeholder:text-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:brightness-105 active:scale-95 text-white font-bold text-sm shadow-lg shadow-sky-500/25 transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>เข้าสู่ระบบหลังบ้าน</span>
            </button>
          </form>

          {/* Back to Home Link */}
          <div className="text-center pt-2 border-t border-slate-800/80">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-sky-400 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>กลับสู่หน้าเว็บลูกค้า (SUK PA?)</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

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

        {/* Bottom Actions: Back to Home & Logout */}
        <div className="p-4 border-t border-slate-800 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-sky-300 hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>กลับสู่หน้าเว็บลูกค้า</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>ออกจากระบบ (Logout)</span>
          </button>
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
        <div className="flex items-center gap-2">
          <button
            onClick={handleLogout}
            className="p-1.5 text-rose-400 hover:text-rose-300"
            title="ออกจากระบบ"
          >
            <LogOut className="w-5 h-5" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
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
          <div className="pt-2 border-t border-slate-800 space-y-1">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-xs text-sky-400"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>กลับสู่หน้าเว็บลูกค้า</span>
            </Link>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-400 text-left"
            >
              <LogOut className="w-4 h-4" />
              <span>ออกจากระบบ (Logout)</span>
            </button>
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
