'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Sparkles, Phone, MessageCircle, Clock, MapPin, Heart } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();

  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="bg-slate-900 text-white mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-2xl overflow-hidden border-2 border-sky-400 bg-sky-100">
                <Image
                  src="/images/mascot.jpg"
                  alt="SUK PA? Mascot"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <span className="font-extrabold text-2xl text-white">SUK PA?</span>
                <span className="ml-2 text-xs font-bold bg-sky-500 text-white px-2 py-0.5 rounded-full">
                  ซักป่ะ?
                </span>
                <p className="text-sm text-sky-200">แพลตฟอร์มรับ-ส่งผ้าสำหรับนักศึกษา มจพ. ปราจีนบุรี</p>
              </div>
            </div>
            <p className="text-sm text-slate-300 max-w-md leading-relaxed">
              เราเป็นตัวกลางรับ-ส่งผ้าถึงหอพัก ทั้งหอในและหอนอก โดยร่วมมือกับร้านพาร์ทเนอร์ซัก-อบมืออาชีพ
              ช่วยให้ชีวิตเด็กมหาลัยสะดวกสบาย ผ้าหอมสะอาด มีเวลาอ่านหนังสือและทำกิจกรรมมากขึ้น!
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold tracking-wider text-sky-400 uppercase">เมนูด่วน</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>
                <Link href="/booking" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                  จองรับผ้าออนไลน์
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white transition-colors">
                  อัตราค่าบริการและราคาซัก
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-white transition-colors">
                  ขั้นตอนและวิธีใช้บริการ
                </Link>
              </li>
              <li>
                <Link href="/track" className="hover:text-white transition-colors">
                  ติดตามสถานะผ้า
                </Link>
              </li>
              <li>
                <Link href="/payment" className="hover:text-white transition-colors">
                  แจ้งชำระเงินและแนบสลิป
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold tracking-wider text-sky-400 uppercase">ติดต่อ & จุดบริการ</h4>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span>มจพ. วิทยาเขตปราจีนบุรี ต.เนินหอม อ.เมือง จ.ปราจีนบุรี</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-400 shrink-0" />
                <span>เปิดบริการทุกวัน: 09:00 - 21:00 น.</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-sky-400 shrink-0" />
                <span>089-123-4567</span>
              </li>
              <li className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Line: @044cmpog</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-800 text-center text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 SUK PA? (ซักป่ะ?) V1. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for KMUTNB Prachinburi Students
          </p>
        </div>
      </div>
    </footer>
  );
}
