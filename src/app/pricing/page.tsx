import Image from 'next/image';
import Link from 'next/link';
import {
  Tag,
  Truck,
  CheckCircle2,
  Sparkles,
  Info,
  ShoppingBag,
  ArrowRight,
  Flame,
  Wind,
} from 'lucide-react';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Title */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 text-sky-700 text-xs font-semibold">
            <Tag className="w-3.5 h-3.5 text-sky-500" />
            <span>ราคาโปร่งใส ตรงไปตรงมา ไม่มีบวกเพิ่ม</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            อัตราค่าบริการและราคาซัก-อบ
          </h1>
          <p className="text-slate-600 text-base max-w-2xl mx-auto">
            SUK PA? คิดค่าบริการรับ-ส่งตามระยะหอพัก ส่วนค่าซัก-อบคิดตามราคาจริงหน้าร้านพาร์ทเนอร์
          </p>
        </div>

        {/* 1. SUK PA? Delivery Fee Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-500 text-white flex items-center justify-center font-bold">
              1
            </div>
            <h2 className="text-2xl font-black text-slate-900">
              ค่าบริการรับ-ส่ง (SUK PA? Delivery Fee)
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* หอใน */}
            <div className="bg-white rounded-3xl p-8 border-2 border-sky-400 shadow-cute relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-4 right-4 bg-sky-100 text-sky-700 font-bold text-xs px-3 py-1 rounded-full">
                ยอดนิยม
              </div>
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900">หอใน มจพ. ปราจีนบุรี</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    หอหญิง 1-2, หอพักชาย 1, หอพักอาจารย์และบุคลากร
                  </p>
                </div>
                <div className="pt-2">
                  <span className="text-5xl font-black text-sky-600">40</span>
                  <span className="text-slate-500 font-medium ml-2">บาท / ออเดอร์</span>
                </div>
                <ul className="space-y-2 text-sm text-slate-600 pt-2 border-t border-slate-100">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>รับผ้าถึงหน้าห้องหรือจุดนัดพบของหอ</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>ส่งร้านพาร์ทเนอร์ซัก-อบ-พับมาตรฐาน</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>ส่งคืนถึงหน้าห้องตรงเวลา</span>
                  </li>
                </ul>
              </div>
              <div className="pt-6">
                <Link
                  href="/booking"
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm shadow-cute-button transition-all"
                >
                  <span>จองรับผ้าหอใน</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* หอนอก */}
            <div className="bg-white rounded-3xl p-8 border-2 border-blue-400 shadow-cute relative overflow-hidden flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900">หอนอกรอบมหาวิทยาลัย</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    หอพักสุขสบาย, ทวีทรัพย์, พงษ์เพชร, กุลจิรา, ธนภัทร และหอนอกอื่นๆ
                  </p>
                </div>
                <div className="pt-2">
                  <span className="text-5xl font-black text-blue-600">35</span>
                  <span className="text-slate-500 font-medium ml-2">บาท / ออเดอร์</span>
                </div>
                <ul className="space-y-2 text-sm text-slate-600 pt-2 border-t border-slate-100">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>รับผ้าถึงหอพักรอบบริเวณ มจพ.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>ไม่ต้องเสี่ยงฝนหรือแบกขี่มอเตอร์ไซค์</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>ส่งคืนผ้าหอมสะอาดถึงมือ</span>
                  </li>
                </ul>
              </div>
              <div className="pt-6">
                <Link
                  href="/booking"
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-cute-button transition-all"
                >
                  <span>จองรับผ้าหอนอก</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Partner Laundry Price Board Reference */}
        <div className="space-y-6 pt-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
              2
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900">
                ตารางราคาซัก-อบ หน้าร้านพาร์ทเนอร์
              </h2>
              <p className="text-xs text-slate-500">
                ราคามาตรฐานเครื่องอุตสาหกรรม จ่ายตามขนาดและโปรแกรมที่ลูกค้าเลือก
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Interactive Tables */}
            <div className="lg:col-span-7 space-y-6">
              {/* Washers Table */}
              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="bg-sky-600 text-white px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-base">
                    <Sparkles className="w-5 h-5" />
                    <span>เครื่องซักผ้า (Washer)</span>
                  </div>
                  <span className="text-xs bg-sky-500 px-2.5 py-1 rounded-full font-medium">
                    โปรแกรม 2, 3, 6, 7 ฟรีน้ำยา
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b">
                      <tr>
                        <th className="px-4 py-3">ขนาด</th>
                        <th className="px-3 py-3">ซักน้ำเย็น</th>
                        <th className="px-3 py-3">ซักน้ำอุ่น</th>
                        <th className="px-3 py-3">ฆ่าเชื้อน้ำเย็น</th>
                        <th className="px-3 py-3">ฆ่าเชื้อน้ำอุ่น</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      <tr className="hover:bg-sky-50/50">
                        <td className="px-4 py-3 font-bold text-sky-700">9 kg</td>
                        <td className="px-3 py-3">40.-</td>
                        <td className="px-3 py-3">60.-</td>
                        <td className="px-3 py-3">70.-</td>
                        <td className="px-3 py-3">90.-</td>
                      </tr>
                      <tr className="hover:bg-sky-50/50">
                        <td className="px-4 py-3 font-bold text-sky-700">14 kg</td>
                        <td className="px-3 py-3">60.-</td>
                        <td className="px-3 py-3">80.-</td>
                        <td className="px-3 py-3">90.-</td>
                        <td className="px-3 py-3">110.-</td>
                      </tr>
                      <tr className="hover:bg-sky-50/50">
                        <td className="px-4 py-3 font-bold text-sky-700">20 kg</td>
                        <td className="px-3 py-3">80.-</td>
                        <td className="px-3 py-3">100.-</td>
                        <td className="px-3 py-3">110.-</td>
                        <td className="px-3 py-3">130.-</td>
                      </tr>
                      <tr className="hover:bg-sky-50/50">
                        <td className="px-4 py-3 font-bold text-sky-700">28 kg</td>
                        <td className="px-3 py-3">100.-</td>
                        <td className="px-3 py-3">120.-</td>
                        <td className="px-3 py-3">140.-</td>
                        <td className="px-3 py-3">160.-</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="p-3 bg-slate-50 text-[11px] text-slate-500 border-t flex flex-wrap gap-4">
                  <span>• ล้างถังด้วยน้ำร้อน: 10 บาท</span>
                  <span>• ล้างน้ำเพิ่ม: 20–30 บาท</span>
                </div>
              </div>

              {/* Dryers Table */}
              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="bg-rose-500 text-white px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-base">
                    <Flame className="w-5 h-5" />
                    <span>เครื่องอบผ้า (Dryer)</span>
                  </div>
                  <span className="text-xs bg-rose-400 px-2.5 py-1 rounded-full font-medium">
                    อบแห้งสนิท ไร้กลิ่นอับ
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b">
                      <tr>
                        <th className="px-4 py-3">ขนาดเครื่องอบ</th>
                        <th className="px-4 py-3">อบ 25 นาที</th>
                        <th className="px-4 py-3">ต่อเวลาอบ (+10 บาท)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      <tr className="hover:bg-rose-50/50">
                        <td className="px-4 py-3 font-bold text-rose-600">17 kg</td>
                        <td className="px-4 py-3">50.-</td>
                        <td className="px-4 py-3 text-slate-500">10 บาท (+5 นาที)</td>
                      </tr>
                      <tr className="hover:bg-rose-50/50">
                        <td className="px-4 py-3 font-bold text-rose-600">24 kg</td>
                        <td className="px-4 py-3">70.-</td>
                        <td className="px-4 py-3 text-slate-500">10 บาท (+4 นาที)</td>
                      </tr>
                      <tr className="hover:bg-rose-50/50">
                        <td className="px-4 py-3 font-bold text-rose-600">30 kg</td>
                        <td className="px-4 py-3">90.-</td>
                        <td className="px-4 py-3 text-slate-500">10 บาท (+3 นาที)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right: Original Price Board Image */}
            <div className="lg:col-span-5 bg-white p-4 rounded-3xl border border-slate-200 shadow-cute space-y-3">
              <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden border">
                <Image
                  src="/images/pricing-board.jpg"
                  alt="ตารางราคาซักอบร้านพาร์ทเนอร์"
                  fill
                  className="object-contain bg-slate-100"
                />
              </div>
              <div className="p-2 text-center">
                <span className="text-xs font-semibold text-slate-700 block">
                  ป้ายราคามาตรฐานจากร้านพาร์ทเนอร์จริง
                </span>
                <span className="text-[11px] text-slate-400">
                  เครื่องซักขนาด 9-28kg และเครื่องอบ 17-30kg
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-sky-50 border border-sky-200 rounded-3xl p-6 flex items-start gap-4 text-sky-800 text-sm">
          <Info className="w-6 h-6 text-sky-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold">ระบบคำนวณราคารวมเบ็ดเสร็จและช่องทางชำระเงิน</h4>
            <p className="text-xs text-sky-700 leading-relaxed">
              ในขั้นตอนการจอง ระบบจะรวมค่าบริการรับ-ส่ง (หอใน 40.- / หอนอก 35.-) กับค่าตู้ซักและตู้อบให้ทันที
              โดยลูกค้าสามารถเลือกชำระเงินผ่าน <strong>พร้อมเพย์ 0661323388 (ธนกร ชูวงศ์วาลย์)</strong> และแนบสลิป
              หรือเลือก <strong>ชำระด้วยเงินสด (จ่ายตอนเริ่มงาน / ไรเดอร์เข้ารับผ้า)</strong> ได้อย่างสะดวกสบายครับ
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
