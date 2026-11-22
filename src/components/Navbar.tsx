'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  Menu,
  X,
  ShoppingBag,
  Search,
  Tag,
  HelpCircle,
  PhoneCall,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

const MAIN_LINKS = [
  { href: '/', label: 'หน้าแรก' },
  { href: '/pricing', label: 'ราคาค่าบริการ' },
  { href: '/how-it-works', label: 'ขั้นตอนบริการ' },
  { href: '/track', label: 'ติดตามออเดอร์' },
  { href: '/contact', label: 'ติดต่อเรา' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // If in admin dashboard, let AdminLayout handle navigation
  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-sky-100/80 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 sm:h-20">
          {/* Logo with Cute Mascot */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-2xl overflow-hidden border-2 border-sky-400 shadow-sm group-hover:scale-105 group-hover:rotate-2 transition-all bg-sky-50">
              <Image
                src="/images/mascot.jpg"
                alt="SUK PA? Mascot"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-2xl tracking-tight bg-gradient-to-r from-sky-600 via-sky-700 to-blue-700 bg-clip-text text-transparent">
                  SUK PA?
                </span>
                <span className="bg-gradient-to-r from-sky-500 to-blue-600 text-white text-[11px] font-extrabold px-2 py-0.5 rounded-full shadow-xs">
                  ซักป่ะ?
                </span>
              </div>
              <p className="text-[11px] text-sky-600 font-medium hidden sm:block">
                บริการรับ-ส่งผ้า มจพ. ปราจีนบุรี
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links (Clean & Spacious) */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-50/80 p-1.5 rounded-full border border-slate-200/60 shadow-inner">
            {MAIN_LINKS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-white text-sky-700 shadow-sm font-bold'
                      : 'text-slate-600 hover:text-sky-600 hover:bg-white/60'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Button */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/track"
              className="text-xs font-bold text-slate-600 hover:text-sky-600 px-3 py-2 rounded-xl transition-colors hidden md:block"
            >
              ค้นหาสถานะผ้า
            </Link>
            <Link
              href="/booking"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 text-white font-black text-xs sm:text-sm shadow-cute-button hover:brightness-105 active:scale-95 transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>จองรับผ้าทันที</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex sm:hidden items-center gap-2">
            <Link
              href="/booking"
              className="px-3 py-1.5 rounded-full bg-sky-500 text-white font-bold text-xs shadow-sm flex items-center gap-1"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>จองผ้า</span>
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-sky-600 hover:bg-sky-50 focus:outline-none transition-colors"
              aria-label="Toggle Menu"
            >
              {isOpen ? <X className="w-6 h-6 text-slate-800" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="sm:hidden bg-white border-b border-sky-100 px-4 pt-3 pb-6 space-y-2 shadow-2xl animate-in slide-in-from-top-3">
          <div className="grid grid-cols-1 gap-1">
            {MAIN_LINKS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-sky-50 text-sky-700 font-bold border border-sky-200'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{item.label}</span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100">
            <Link
              href="/booking"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-black text-sm shadow-cute-button"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>จองรับผ้าออนไลน์ (SUK PA?)</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
