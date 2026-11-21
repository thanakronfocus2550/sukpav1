'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, Sparkles, ShoppingBag, Search, Tag, HelpCircle, PhoneCall, ShieldCheck } from 'lucide-react';

const NAV_LINKS = [
  { href: '/', label: 'หน้าแรก', icon: Sparkles },
  { href: '/booking', label: 'จองบริการ', icon: ShoppingBag, highlight: true },
  { href: '/pricing', label: 'ราคาค่าบริการ', icon: Tag },
  { href: '/how-it-works', label: 'ขั้นตอนบริการ', icon: HelpCircle },
  { href: '/track', label: 'ติดตามออเดอร์', icon: Search },
  { href: '/payment', label: 'ชำระเงิน/แนบสลิป', icon: ShieldCheck },
  { href: '/contact', label: 'ติดต่อเรา', icon: PhoneCall },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // If in admin dashboard, let AdminLayout handle navigation
  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-sky-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo with 3D Mascot */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-12 h-12 rounded-2xl overflow-hidden border-2 border-sky-400 shadow-md group-hover:scale-105 transition-transform bg-sky-50">
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
                <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-sky-600 to-blue-700 bg-clip-text text-transparent">
                  SUK PA?
                </span>
                <span className="bg-sky-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                  ซักป่ะ?
                </span>
              </div>
              <p className="text-xs text-sky-600/80 font-medium hidden sm:block">
                บริการรับ-ส่งผ้า มจพ. ปราจีนบุรี
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {NAV_LINKS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    item.highlight
                      ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-cute-button hover:brightness-105 active:scale-95'
                      : isActive
                      ? 'bg-sky-50 text-sky-700 font-semibold'
                      : 'text-slate-600 hover:text-sky-600 hover:bg-sky-50/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${item.highlight ? 'text-white' : isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Mobile Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:text-sky-600 hover:bg-sky-50 focus:outline-none"
              aria-label="Toggle Menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-sky-100 px-4 pt-2 pb-6 space-y-1 shadow-xl animate-in slide-in-from-top-2">
          {NAV_LINKS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all ${
                  item.highlight
                    ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold'
                    : isActive
                    ? 'bg-sky-50 text-sky-700 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-5 h-5 ${item.highlight ? 'text-white' : 'text-sky-500'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
