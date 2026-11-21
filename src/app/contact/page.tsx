import Link from 'next/link';
import Image from 'next/image';
import {
  PhoneCall,
  MessageCircle,
  MapPin,
  Clock,
  Sparkles,
  ShoppingBag,
  Send,
  HelpCircle,
} from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 text-sky-700 text-xs font-semibold">
            <PhoneCall className="w-3.5 h-3.5 text-sky-500" />
            <span>ติดต่อเราได้ตลอดเวลาทำการ</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            ติดต่อทีมงาน SUK PA?
          </h1>
          <p className="text-slate-600 text-sm max-w-md mx-auto">
            มีคำถาม ข้อเสนอแนะ หรือต้องการความช่วยเหลือด่วน ติดต่อเราได้ตามช่องทางด้านล่างนี้ครับ
          </p>
        </div>

        {/* Contact Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Phone */}
          <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-cute text-center space-y-3">
            <div className="w-14 h-14 bg-sky-100 text-sky-600 rounded-2xl mx-auto flex items-center justify-center">
              <PhoneCall className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-slate-800 text-lg">เบอร์โทรศัพท์</h3>
            <p className="text-xs text-slate-500">สำหรับติดต่อสอบถามและแจ้งเหตุเร่งด่วน</p>
            <a
              href="tel:0891234567"
              className="inline-block font-extrabold text-sky-600 hover:text-sky-700 text-lg"
            >
              089-123-4567
            </a>
          </div>

          {/* Card 2: Line OA */}
          <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-cute text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl mx-auto flex items-center justify-center">
              <MessageCircle className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-slate-800 text-lg">LINE Official</h3>
            <p className="text-xs text-slate-500">แชทคุยกับแอดมิน ส่งรูป สอบถามคิวรับผ้า</p>
            <a
              href="https://line.me/R/ti/p/@044cmpog"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block font-extrabold text-emerald-600 hover:text-emerald-700 text-lg"
            >
              @044cmpog
            </a>
          </div>

          {/* Card 3: Service Hours */}
          <div className="bg-white rounded-3xl p-6 border border-blue-100 shadow-cute text-center space-y-3">
            <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl mx-auto flex items-center justify-center">
              <Clock className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-slate-800 text-lg">เวลาทำการ</h3>
            <p className="text-xs text-slate-500">เปิดให้บริการรับและส่งผ้าทุกวัน</p>
            <span className="inline-block font-extrabold text-blue-600 text-lg">
              09:00 - 21:00 น.
            </span>
          </div>
        </div>

        {/* Location & Coverage Card */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-cute space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">พื้นที่ให้บริการ</h3>
              <p className="text-xs text-slate-500">ครอบคลุมทุกหอพักในและหอนอกรอบมหาวิทยาลัย</p>
            </div>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed">
            มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ วิทยาเขตปราจีนบุรี (มจพ. ปราจีนบุรี)
            ตำบลเนินหอม อำเภอเมืองปราจีนบุรี จังหวัดปราจีนบุรี 25230
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
            <div className="p-3 rounded-2xl bg-sky-50 border border-sky-100 font-medium text-sky-800">
              ✓ <strong>หอใน (40.-):</strong> หอพักหญิง 1, หอพักหญิง 2, หอพักชาย 1, หอพักอาจารย์
            </div>
            <div className="p-3 rounded-2xl bg-blue-50 border border-blue-100 font-medium text-blue-800">
              ✓ <strong>หอนอก (35.-):</strong> หอสุขสบาย, ทวีทรัพย์, พงษ์เพชร, กุลจิรา, ธนภัทร ฯลฯ
            </div>
          </div>
        </div>

        {/* Quick Booking CTA */}
        <div className="text-center pt-4">
          <Link
            href="/booking"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-black text-lg shadow-cute-button hover:brightness-105 active:scale-95 transition-all"
          >
            <ShoppingBag className="w-5 h-5" />
            <span>จองรับผ้าออนไลน์ได้เลยตอนนี้</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
