import Link from 'next/link';
import {
  HelpCircle,
  ShoppingBag,
  Truck,
  Sparkles,
  PackageCheck,
  CheckCircle2,
  HelpCircle as QuestionIcon,
  ArrowRight,
  ShieldCheck,
  Clock,
} from 'lucide-react';

const FAQS = [
  {
    q: 'ต้องสมัครสมาชิกก่อนจองไหม?',
    a: 'ไม่ต้องสมัครสมาชิกเลยครับ! ลูกค้าสามารถกดจองผ่านหน้าเว็บ กรอกชื่อ เบอร์โทร และที่พักได้ทันทีภายใน 1 นาที',
  },
  {
    q: 'ต้องเลือกรอบเวลารับผ้าไหม?',
    a: 'ไม่ต้องเลือกรอบเวลาครับ ทีมงานและพี่ไรเดอร์มีรอบวิ่งรับผ้าสม่ำเสมอทุกวัน เมื่อจองแล้วสามารถนำตะกร้าผ้ามาเตรียมไว้ที่จุดนัดพบ หรือหน้าห้องได้เลย',
  },
  {
    q: 'มีบริการที่หอไหนบ้าง?',
    a: 'ครอบคลุมทั้งหอใน มจพ. ปราจีนบุรี (หอหญิง 1-2, หอชาย, หออาจารย์) ค่าส่ง 40 บาท/ออเดอร์ และหอนอกรอบมหาวิทยาลัย (สุขสบาย, ทวีทรัพย์, พงษ์เพชร, กุลจิรา ฯลฯ) ค่าส่ง 35 บาท/ออเดอร์',
  },
  {
    q: 'ทางร้านใช้เครื่องซักผ้าแบบไหน?',
    a: 'เราใช้เครื่องซัก-อบมาตรฐานอุตสาหกรรมขนาดใหญ่ (9 - 28 kg) สะอาด ซักด้วยน้ำอุ่น/น้ำร้อน และเครื่องอบลมร้อนที่ฆ่าเชื้อและไร้กลิ่นอับ 100%',
  },
  {
    q: 'ผ้าจะปนกับของคนอื่นไหม?',
    a: 'ไม่มีการปนเด็ดขาดครับ! เราแยกซักเป็นถังเดี่ยวของแต่ละคน ตะกร้าต่อตะกร้า พร้อมติดแท็กหมายเลข Order ID ประจำตัวทุกออเดอร์',
  },
  {
    q: 'ชำระเงินอย่างไร?',
    a: 'ชำระผ่าน PromptPay (พร้อมเพย์) โดยสแกน QR Code แล้วแนบสลิปผ่านหน้าเว็บ ระบบจะแจ้งเตือนและแอดมินจะตรวจสอบยอดทันที',
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-16">
        {/* Title */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 text-sky-700 text-xs font-semibold">
            <HelpCircle className="w-3.5 h-3.5 text-sky-500" />
            <span>สะดวก • ปลอดภัย • รวดเร็ว</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            ขั้นตอนการใช้บริการ SUK PA?
          </h1>
          <p className="text-slate-600 text-base max-w-xl mx-auto">
            วิธีใช้บริการง่าย ๆ แค่ 4 สเต็ป ไม่ต้องเสียเวลาซักผ้าเองอีกต่อไป
          </p>
        </div>

        {/* 4 Steps Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl p-8 border border-sky-100 shadow-cute space-y-4">
            <div className="flex items-center justify-between">
              <span className="w-12 h-12 rounded-2xl bg-sky-500 text-white font-black text-xl flex items-center justify-center shadow-cute-button">
                01
              </span>
              <span className="text-xs font-bold text-sky-600 bg-sky-50 px-3 py-1 rounded-full">
                หน้าเว็บไม่ต้อง Login
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900">จองรับผ้าออนไลน์</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              เข้าหน้า Booking กรอกชื่อ เบอร์โทรศัพท์ เลือกประเภทหอพัก (หอใน 40.- / หอนอก 35.-)
              ระบุเลขห้อง และจำนวนตะกร้าผ้า ระบบจะสร้างหมายเลขคำสั่งซื้อ (Order ID) ให้ทันที
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-blue-100 shadow-cute space-y-4">
            <div className="flex items-center justify-between">
              <span className="w-12 h-12 rounded-2xl bg-blue-500 text-white font-black text-xl flex items-center justify-center shadow-cute-button">
                02
              </span>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                ไรเดอร์ไปรับถึงที่
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900">เตรียมผ้ารอรับ</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              นำตะกร้าผ้ามาวางไว้ที่จุดรับของหอพัก หรือแขวนไว้หน้าห้องตามที่ระบุในหมายเหตุ
              พี่ไรเดอร์ SUK PA? จะเข้ารับผ้าและอัปเดตสถานะเป็น "รับผ้าแล้ว" (PICKED_UP)
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-indigo-100 shadow-cute space-y-4">
            <div className="flex items-center justify-between">
              <span className="w-12 h-12 rounded-2xl bg-indigo-500 text-white font-black text-xl flex items-center justify-center shadow-cute-button">
                03
              </span>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                ซัก-อบมาตรฐาน
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900">ซัก-อบ และพับผ้าเรียบร้อย</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              ผ้าจะถูกนำเข้าสู่ระบบซักอบมาตรฐานแยกถังเฉพาะคุณ
              ดำเนินการซักด้วยน้ำยามาตรฐาน อบแห้งด้วยความร้อนฆ่าเชื้อ และพับเก็บเข้าถุงอย่างประณีต
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-emerald-100 shadow-cute space-y-4">
            <div className="flex items-center justify-between">
              <span className="w-12 h-12 rounded-2xl bg-emerald-500 text-white font-black text-xl flex items-center justify-center shadow-cute-button">
                04
              </span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                ผ้าหอมสะอาดถึงห้อง
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900">จัดส่งคืน & ชำระเงิน</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              เมื่อผ้าพร้อมส่ง ไรเดอร์จะนำผ้าหอมสะอาดไปส่งคืนถึงหน้าห้องหรือจุดนัดพบ
              คุณสามารถชำระค่าบริการผ่าน PromptPay และแนบสลิปผ่านหน้าเว็บได้อย่างสะดวกสบาย
            </p>
          </div>
        </div>

        {/* FAQs Section */}
        <div className="space-y-6 pt-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">คำถามที่พบบ่อย (FAQ)</h2>
            <p className="text-xs text-slate-500">ตอบทุกข้อสงสัยเกี่ยวกับบริการ ซักป่ะ?</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FAQS.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-2 hover:border-sky-300 transition-colors"
              >
                <h4 className="font-bold text-slate-800 text-sm flex items-start gap-2">
                  <QuestionIcon className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                  <span>{faq.q}</span>
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed pl-6">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center bg-sky-500 rounded-3xl p-10 text-white space-y-4 shadow-cute-lg">
          <h3 className="text-2xl sm:text-3xl font-black">พร้อมสัมผัสประสบการณ์ซักผ้าแสนสบาย?</h3>
          <p className="text-sky-100 text-sm max-w-md mx-auto">
            ไม่ต้องลงทะเบียน จองคิวรับผ้าได้เลยตอนนี้
          </p>
          <div className="pt-2">
            <Link
              href="/booking"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-white text-sky-700 font-extrabold text-base shadow-lg hover:bg-sky-50 transition-all hover:scale-105 active:scale-95"
            >
              <ShoppingBag className="w-5 h-5 text-sky-600" />
              <span>เริ่มจองเลย</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
