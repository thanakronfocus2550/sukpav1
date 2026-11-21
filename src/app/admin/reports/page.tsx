'use client';

import { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Calendar,
  Store,
  CheckCircle2,
  Send,
  AlertCircle,
  FileCheck,
  Shield,
  RefreshCw,
  Plus,
} from 'lucide-react';
import { Partner, PartnerReport, PartnerReportItem, PartnerReportStatus } from '@/lib/types';

export default function AdminReportsPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [reports, setReports] = useState<PartnerReport[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter/Generate Form State
  const [selectedPartnerId, setSelectedPartnerId] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Report Detail Modal
  const [activeReport, setActiveReport] = useState<PartnerReport | null>(null);
  const [reportItems, setReportItems] = useState<PartnerReportItem[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchData = async () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setLoading(true);
    try {
      const [partRes, repRes] = await Promise.all([
        fetch('/api/partners'),
        fetch('/api/reports/partner'),
      ]);

      const partData = await partRes.json();
      const repData = await repRes.json();

      if (partData.success) {
        setPartners(partData.partners);
        if (partData.partners.length > 0 && !selectedPartnerId) {
          setSelectedPartnerId(partData.partners[0].id);
        }
      }
      if (repData.success) {
        setReports(repData.reports);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartnerId || !selectedDate) {
      setErrorMsg('กรุณาเลือกร้านพาร์ทเนอร์และวันที่');
      return;
    }

    setIsGenerating(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/reports/partner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partner_id: selectedPartnerId,
          report_date: selectedDate,
          actor: 'Admin',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      await fetchData();
      openReportDetail(data.report.id);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setIsGenerating(false);
    }
  };

  const openReportDetail = async (reportId: string) => {
    setLoadingDetail(true);
    try {
      const res = await fetch(`/api/reports/partner?id=${reportId}`);
      const data = await res.json();
      if (data.success) {
        setActiveReport(data.report);
        setReportItems(data.items);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const updateReportStatus = async (newStatus: PartnerReportStatus) => {
    if (!activeReport) return;
    try {
      const res = await fetch('/api/reports/partner', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: activeReport.id,
          status: newStatus,
          actor: 'Admin',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActiveReport(data.report);
        await fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 sm:p-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            รายงานพาร์ทเนอร์ประจำวัน (Partner Daily Reports)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            สรุปจำนวนตะกร้าและค่าตอบแทน (5 บ./ตะกร้า) พร้อมระบบปกป้องข้อมูลส่วนตัวลูกค้า
          </p>
        </div>
      </div>

      {/* Generate Report Form */}
      <form
        onSubmit={handleGenerateReport}
        className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4"
      >
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-sky-500" />
          <span>สร้างรายงานสรุปยอดรายวัน</span>
        </h3>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs">
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              เลือกร้านพาร์ทเนอร์
            </label>
            <select
              value={selectedPartnerId}
              onChange={(e) => setSelectedPartnerId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white"
            >
              {partners.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.owner_name})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              เลือกวันที่ต้องการสรุปยอด
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={isGenerating}
              className="w-full py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm rounded-xl shadow-cute-button transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{isGenerating ? 'กำลังสร้างรายงาน...' : 'สร้างรายงานประจำวัน'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Reports History Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-slate-800">ประวัติรายงานย้อนหลัง</h3>
          <span className="text-xs text-slate-400">ทั้งหมด {reports.length} ฉบับ</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b">
              <tr>
                <th className="px-6 py-3">รหัสรายงาน</th>
                <th className="px-4 py-3">ร้านพาร์ทเนอร์</th>
                <th className="px-4 py-3">วันที่สรุปยอด</th>
                <th className="px-3 py-3">ออเดอร์</th>
                <th className="px-3 py-3">รวมตะกร้า</th>
                <th className="px-4 py-3">ค่าตอบแทนรวม</th>
                <th className="px-4 py-3">สถานะ</th>
                <th className="px-6 py-3 text-right">เอกสาร</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reports.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                    ยังไม่มีรายงานพาร์ทเนอร์ในระบบ
                  </td>
                </tr>
              ) : (
                reports.map((rpt) => (
                  <tr key={rpt.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-sky-700">
                      {rpt.report_code}
                    </td>
                    <td className="px-4 py-4 font-semibold text-slate-800">
                      {rpt.partner_name}
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {rpt.report_date}
                    </td>
                    <td className="px-3 py-4 font-medium text-slate-700">
                      {rpt.total_orders} รายการ
                    </td>
                    <td className="px-3 py-4 font-bold text-slate-900">
                      {rpt.total_baskets} ตะกร้า
                    </td>
                    <td className="px-4 py-4 font-black text-sky-600">
                      ฿{rpt.total_commission.toFixed(2)}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          rpt.status === 'CONFIRMED'
                            ? 'bg-emerald-100 text-emerald-700'
                            : rpt.status === 'SENT'
                            ? 'bg-blue-100 text-blue-700'
                            : rpt.status === 'READY'
                            ? 'bg-sky-100 text-sky-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {rpt.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openReportDetail(rpt.id)}
                        className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs rounded-lg border border-sky-200"
                      >
                        เปิดดู / พิมพ์
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable / Clean Report View Modal */}
      {activeReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:static print:bg-white print:p-0 print:block">
          <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl p-6 sm:p-10 space-y-6 my-8 print:shadow-none print:p-6 print:m-0 print:max-w-none print:w-full border border-slate-200 print:border-none">
            {/* Modal Actions (Hidden in Print) */}
            <div className="flex items-center justify-between pb-4 border-b print:hidden">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">สถานะรายงาน:</span>
                <span className="text-xs font-bold bg-sky-100 text-sky-700 px-3 py-1 rounded-full border border-sky-200">
                  {activeReport.status}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:brightness-105 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>พิมพ์ / บันทึกเป็น PDF</span>
                </button>
                <button
                  onClick={() => setActiveReport(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all"
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </div>

            {/* Document Header (Clean & Beautiful for PDF) */}
            <div className="border-b-2 border-slate-800 pb-5 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-sky-100 text-sky-800 text-[11px] font-extrabold print:border print:border-slate-300">
                    🧺 SUK PA? (ซักป่ะ?)
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 tracking-tight">
                    ใบสรุปยอดค่าตอบแทนพาร์ทเนอร์ประจำวัน
                  </h2>
                  <p className="text-xs text-slate-500">
                    บริการรับ-ส่งผ้าสำหรับนักศึกษา มจพ. ปราจีนบุรี • LINE: @044cmpog
                  </p>
                </div>
                <div className="text-right text-xs space-y-1 font-mono">
                  <div className="font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md inline-block print:border print:border-slate-300">
                    {activeReport.report_code}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    วันที่ออกเอกสาร: {activeReport.report_date}
                  </div>
                </div>
              </div>
            </div>

            {/* Partner & Settlement Overview Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">ร้านพาร์ทเนอร์</span>
                <strong className="text-slate-900 text-sm block mt-0.5 truncate">
                  {activeReport.partner_name}
                </strong>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">ประจำวันที่</span>
                <strong className="text-slate-900 text-sm block mt-0.5">
                  {activeReport.report_date}
                </strong>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">จำนวนตะกร้ารวม</span>
                <strong className="text-sky-700 text-sm block mt-0.5">
                  {activeReport.total_baskets} ตะกร้า
                </strong>
              </div>
              <div className="bg-sky-50 p-3.5 rounded-2xl border border-sky-200 print:bg-slate-100 print:border-slate-300">
                <span className="text-sky-700 block text-[10px] uppercase font-bold print:text-slate-600">ยอดเงินค่าตอบแทน</span>
                <strong className="text-sky-700 text-base font-black block mt-0.5 print:text-slate-900">
                  ฿{activeReport.total_commission.toFixed(2)}
                </strong>
              </div>
            </div>

            {/* Daily Itemized Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm print:shadow-none">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 w-14 text-center">ลำดับ</th>
                    <th className="px-4 py-3">หมายเลขออเดอร์ (Order ID)</th>
                    <th className="px-4 py-3 text-right">จำนวนตะกร้า</th>
                    <th className="px-4 py-3 text-right">ค่าตอบแทน (5 บาท/ตะกร้า)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 print:divide-slate-200">
                  {reportItems.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                        ไม่มีรายการออเดอร์ในวันนี้
                      </td>
                    </tr>
                  ) : (
                    reportItems.map((item, idx) => (
                      <tr key={item.id} className={idx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}>
                        <td className="px-4 py-2.5 text-center text-slate-500 font-mono">{idx + 1}</td>
                        <td className="px-4 py-2.5 font-mono font-bold text-slate-800">
                          {item.order_code}
                        </td>
                        <td className="px-4 py-2.5 text-right font-semibold text-slate-700">
                          {item.baskets} ตะกร้า
                        </td>
                        <td className="px-4 py-2.5 text-right font-bold text-slate-900">
                          ฿{item.commission_amount.toFixed(2)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot className="bg-slate-100 border-t-2 border-slate-800 font-black text-slate-900">
                  <tr>
                    <td colSpan={2} className="px-4 py-3 text-sm">
                      รวมทั้งสิ้น ({reportItems.length} ออเดอร์)
                    </td>
                    <td className="px-4 py-3 text-right text-sm">
                      {activeReport.total_baskets} ตะกร้า
                    </td>
                    <td className="px-4 py-3 text-right text-base text-sky-700 print:text-slate-900">
                      ฿{activeReport.total_commission.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Note & Policy */}
            <div className="text-[11px] text-slate-500 space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <p>• <strong>อัตราค่าตอบแทน:</strong> 5.00 บาทต่อตะกร้าผ้าจริงที่จัดส่งเข้าซักอบ</p>
              <p>• <strong>นโยบายข้อมูลส่วนบุคคล:</strong> รายงานนี้จัดทำตามข้อกำหนดความเป็นส่วนตัว ไม่แสดงข้อมูลส่วนบุคคลของนักศึกษา</p>
            </div>

            {/* Sign-off Boxes (Signatures for PDF / Print) */}
            <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs">
              <div className="text-center space-y-8">
                <span className="text-slate-500 font-semibold block">ผู้ส่งมอบงาน (ตัวแทน SUK PA?)</span>
                <div className="border-b border-dashed border-slate-400 w-44 mx-auto" />
                <span className="text-slate-600 block">(...........................................................)</span>
                <span className="text-slate-400 text-[10px] block">วันที่ ......... / ......... / 2569</span>
              </div>

              <div className="text-center space-y-8">
                <span className="text-slate-500 font-semibold block">ผู้รับมอบเงิน / ร้านพาร์ทเนอร์</span>
                <div className="border-b border-dashed border-slate-400 w-44 mx-auto" />
                <span className="text-slate-600 block">(...........................................................)</span>
                <span className="text-slate-400 text-[10px] block">วันที่ ......... / ......... / 2569</span>
              </div>
            </div>

            {/* Status Change Buttons for Admin (Hidden in Print) */}
            <div className="pt-4 flex flex-wrap items-center justify-between gap-2 print:hidden border-t">
              <span className="text-xs font-bold text-slate-600">อัปเดตสถานะรายงาน:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => updateReportStatus('READY')}
                  className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold rounded-xl border border-sky-200 transition-all"
                >
                  READY (พร้อมส่ง)
                </button>
                <button
                  onClick={() => updateReportStatus('SENT')}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl border border-blue-200 transition-all"
                >
                  SENT (ส่งร้านแล้ว)
                </button>
                <button
                  onClick={() => updateReportStatus('CONFIRMED')}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-200 transition-all"
                >
                  CONFIRMED (ร้านยืนยันยอด)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
