import Link from 'next/link';
import Image from 'next/image';
import {
  Sparkles,
  ShoppingBag,
  Search,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Shirt,
  Truck,
  HeartHandshake,
  ArrowRight,
  ChevronRight,
  Smile,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-sky-100 via-sky-50 to-white pt-8 pb-16 lg:pt-16 lg:pb-24">
        {/* Decorative Floating Bubbles */}
        <div className="absolute top-10 left-10 w-24 h-24 bg-sky-300/30 rounded-full blur-xl animate-float pointer-events-none" />
        <div className="absolute top-40 right-12 w-32 h-32 bg-blue-300/25 rounded-full blur-2xl animate-float-delayed pointer-events-none" />
        <div className="absolute bottom-10 left-1/3 w-20 h-20 bg-sky-200/40 rounded-full blur-lg animate-float pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-cute border border-sky-200/70 text-sky-700 text-sm font-semibold">
                <Sparkles className="w-4 h-4 text-sky-500 animate-pulse" />
                <span>มจพ. ปราจีนบุรี ซักผ้าสบาย ไม่ต้องแบกไปเอง!</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
                หมดปัญหาไม่มีเวลาซักผ้า{' '}
                <span className="block bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  เรียกน้อง "ซักป่ะ?" ไปรับถึงหอ!
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 font-normal max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                บริการรับ-ส่งผ้าสำหรับนักศึกษา มจพ. ปราจีนบุรี ตัวกลางดูแลรับผ้าจากหน้าห้อง ส่งร้านพาร์ทเนอร์ซัก-อบ-พับเรียบร้อย พร้อมส่งคืนถึงที่พัก{' '}
                <strong className="text-sky-700 font-semibold">ไม่ต้องสมัครสมาชิก จองง่ายใน 1 นาที</strong>
              </p>

              {/* Price Badges Preview */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                <div className="px-4 py-2.5 rounded-2xl bg-white border border-sky-200 shadow-sm flex items-center gap-2">
                  <span className="text-xs text-slate-500">ค่าส่งหอใน:</span>
                  <span className="text-lg font-black text-sky-600">40.-</span>
                  <span className="text-xs text-slate-400">/ออเดอร์</span>
                </div>
                <div className="px-4 py-2.5 rounded-2xl bg-white border border-sky-200 shadow-sm flex items-center gap-2">
                  <span className="text-xs text-slate-500">ค่าส่งหอนอก:</span>
                  <span className="text-lg font-black text-blue-600">35.-</span>
                  <span className="text-xs text-slate-400">/ออเดอร์</span>
                </div>
                <div className="px-4 py-2.5 rounded-2xl bg-sky-50 border border-sky-200 shadow-sm flex items-center gap-2 text-sky-800 text-xs font-semibold">
                  <Smile className="w-4 h-4 text-sky-500" />
                  <span>พาร์ทเนอร์มืออาชีพ ค่าตอบแทน 5 บ./ตะกร้า</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                <Link
                  href="/booking"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold text-lg shadow-cute-button hover:brightness-105 active:scale-95 transition-all"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>จองรับผ้าทันที</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>

                <Link
                  href="/track"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-white border-2 border-sky-200 text-slate-700 font-semibold text-base shadow-sm hover:border-sky-400 hover:text-sky-600 transition-colors"
                >
                  <Search className="w-4 h-4 text-sky-500" />
                  <span>ติดตามสถานะออเดอร์</span>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-4 flex items-center justify-center lg:justify-start gap-6 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ไม่มีค่าบริการแอบแฝง
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ซักแยกถัง ไม่ปนกับใคร
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ผ้าพับเรียบพร้อมใส่
                </span>
              </div>
            </div>

            {/* Right Mascot 3D Showcase */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-tr from-sky-400 via-blue-400 to-cyan-300 rounded-3xl opacity-30 blur-2xl group-hover:opacity-40 transition-opacity" />
                <div className="relative w-72 sm:w-88 md:w-96 aspect-square rounded-3xl overflow-hidden shadow-cute-lg border-4 border-white bg-white">
                  <Image
                    src="/images/mascot.jpg"
                    alt="SUK PA? Mascot 3D"
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md rounded-2xl p-3 border border-sky-100 shadow-md text-center">
                    <p className="font-extrabold text-sm text-slate-800">
                      น้อง "ซักป่ะ?" พร้อมลุยทุกหอพัก! 🫧
                    </p>
                    <p className="text-[11px] text-sky-600 font-medium">
                      หอหญิง 1-2, หอชาย, หออาจารย์ และหอนอกรอบ มจพ.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Steps How It Works Section */}
      <section className="py-16 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-sky-600 uppercase tracking-widest bg-sky-50 px-3 py-1 rounded-full">
              ขั้นตอนง่าย ๆ
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-3">
              แค่ 4 ขั้นตอน ผ้าก็หอมสะอาดถึงห้อง
            </h2>
            <p className="text-slate-600 text-sm mt-2">
              ประหยัดเวลา ไม่ต้องนั่งรอเครื่องซักผ้าหยอดเหรียญ
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-b from-sky-50/70 to-white p-6 rounded-3xl border border-sky-100 shadow-sm relative group hover:border-sky-300 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-sky-500 text-white font-extrabold text-lg flex items-center justify-center shadow-cute-button mb-4">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">จองผ่านเว็บ</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                กรอกชื่อ เบอร์โทร หอพัก และจำนวนตะกร้า ไม่ต้องสมัครสมาชิก
              </p>
            </div>

            <div className="bg-gradient-to-b from-sky-50/70 to-white p-6 rounded-3xl border border-sky-100 shadow-sm relative group hover:border-sky-300 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-blue-500 text-white font-extrabold text-lg flex items-center justify-center shadow-cute-button mb-4">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">พี่ไรเดอร์ไปรับ</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                นำตะกร้าผ้ามาไว้จุดนัดพบหรือหน้าห้อง พี่ไรเดอร์ไปรับตามรอบ
              </p>
            </div>

            <div className="bg-gradient-to-b from-sky-50/70 to-white p-6 rounded-3xl border border-sky-100 shadow-sm relative group hover:border-sky-300 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500 text-white font-extrabold text-lg flex items-center justify-center shadow-cute-button mb-4">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">พาร์ทเนอร์ซัก-อบ</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                ส่งร้านพาร์ทเนอร์เครื่องมาตรฐาน สะอาด ซัก-อบแห้ง พับเรียบร้อย
              </p>
            </div>

            <div className="bg-gradient-to-b from-sky-50/70 to-white p-6 rounded-3xl border border-sky-100 shadow-sm relative group hover:border-sky-300 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white font-extrabold text-lg flex items-center justify-center shadow-cute-button mb-4">
                4
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">ส่งคืนถึงห้อง</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                ส่งผ้าหอมสะอาดคืนถึงที่ ชำระเงินผ่านพร้อมเพย์สบายใจ
              </p>
            </div>
          </div>

          <div className="text-center mt-10">
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-sky-600 hover:text-sky-700"
            >
              <span>อ่านรายละเอียดขั้นตอนและคำถามพบบ่อยทั้งหมด</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Highlights & Features */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-cute space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center">
                <Truck className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">ค่าบริการชัดเจน เป็นธรรม</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                ค่าส่งหอใน 40 บาท / หอนอก 35 บาทต่อออเดอร์ ไม่มีบวกเพิ่ม ไม่ต้องแบกผ้าขี่มอเตอร์ไซค์ไปตากแดดตากฝน
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-cute space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <HeartHandshake className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">โมเดลร้านพาร์ทเนอร์ชุมชน</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                ร่วมมือกับร้านซักอบรีดรอบ มจพ. ปราจีนบุรี กระจายรายได้สู่ชุมชน พร้อมมาตรฐานดูแลรักษาผ้าของคุณอย่างดีที่สุด
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-cute space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">ติดตามสถานะแบบเรียลไทม์</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                รู้ทุกขั้นตอน ตั้งแต่รับผ้า ส่งร้าน กำลังซัก จนถึงพร้อมส่งคืน ปลอดภัยด้วยระบบค้นหาด้วย Order ID + เบอร์โทร
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="py-16 bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold">
            พร้อมส่งผ้าให้น้อง "ซักป่ะ?" ดูแลหรือยัง?
          </h2>
          <p className="text-sky-100 text-base sm:text-lg max-w-xl mx-auto">
            ไม่ต้องรอวันหยุด ไม่ต้องเหนื่อยแบกผ้า จองเลยวันนี้เริ่มบริการทันที!
          </p>
          <div className="pt-2">
            <Link
              href="/booking"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-sky-700 font-extrabold text-lg shadow-xl hover:bg-sky-50 transition-all hover:scale-105 active:scale-95"
            >
              <ShoppingBag className="w-5 h-5 text-sky-600" />
              <span>จองรับผ้าตอนนี้เลย</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
