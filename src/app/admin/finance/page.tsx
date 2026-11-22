'use client';

import { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Layers,
  Plus,
  Calendar,
  Tag,
  RefreshCw,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { Expense, ExpenseCategory } from '@/lib/types';

export default function AdminFinancePage() {
  const [summary, setSummary] = useState({
    totalOrders: 0,
    completedOrders: 0,
    todayRevenue: 0,
    partnerRevenue: 0,
    totalRevenue: 0,
    totalExpenses: 0,
    partnerCommissionExpense: 0,
    grossProfit: 0,
  });
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  // New Expense Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('FUEL');
  const [note, setNote] = useState('');
  const [expenseDate, setExpenseDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchData = async () => {
    setExpenseDate(new Date().toISOString().split('T')[0]);
    setLoading(true);
    try {
      const res = await fetch('/api/finance');
      const data = await res.json();
      if (data.success) {
        setSummary(data.summary);
        setExpenses(data.expenses);
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

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount) {
      setErrorMsg('กรุณากรอกรายการและจำนวนเงิน');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/finance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          amount: Number(amount),
          category,
          note: note.trim(),
          expense_date: expenseDate,
          actor: 'Admin',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      setShowAddModal(false);
      setTitle('');
      setAmount('');
      setNote('');
      await fetchData();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            บัญชีรายรับ-รายจ่าย (Finance & Accounting)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            สรุปรายรับค่าบริการรับ-ส่ง รายจ่ายค่าตอบแทนพาร์ทเนอร์ และกำไรเบื้องต้น
          </p>
        </div>
        <div className="flex items-center gap-2 self-start">
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow-cute-button transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>บันทึกรายจ่าย</span>
          </button>
        </div>
      </div>

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Revenue */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>รายได้รวมทั้งหมด</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-600">
            ฿{summary.totalRevenue.toFixed(2)}
          </div>
          <p className="text-xs text-slate-400">
            ค่าบริการรับ-ส่งวันนี้: ฿{summary.todayRevenue.toFixed(2)} (หอนอก 35 / หอใน 40 บาทต่อตะกร้า)
          </p>
        </div>

        {/* Partner Revenue */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>รายได้จากพาร์ทเนอร์</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-purple-600">
            ฿{summary.partnerRevenue.toFixed(2)}
          </div>
          <p className="text-xs text-slate-400">
            เพิ่ม 5 บาทต่อตะกร้า รวมกับค่าบริการในรายได้รวม
          </p>
        </div>

        {/* Gross Profit */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>กำไรเบื้องต้น</span>
            <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-sky-600">
            ฿{summary.grossProfit.toFixed(2)}
          </div>
          <p className="text-xs text-slate-400">
            รายได้รวมทั้งหมด - รายจ่ายรวม ฿{summary.totalExpenses.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-slate-800">บันทึกรายการรายจ่าย (Expense Logs)</h3>
          <span className="text-xs text-slate-400">ทั้งหมด {expenses.length} รายการ</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b">
              <tr>
                <th className="px-6 py-3">วันที่</th>
                <th className="px-4 py-3">หมวดหมู่</th>
                <th className="px-4 py-3">รายการ</th>
                <th className="px-4 py-3">จำนวนเงิน</th>
                <th className="px-4 py-3">หมายเหตุ</th>
                <th className="px-6 py-3 text-right">ผู้บันทึก</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    ยังไม่มีรายการรายจ่าย
                  </td>
                </tr>
              ) : (
                expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 text-slate-600 font-mono">
                      {exp.expense_date}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          exp.category === 'PARTNER_COMMISSION'
                            ? 'bg-purple-100 text-purple-700'
                            : exp.category === 'FUEL'
                            ? 'bg-amber-100 text-amber-700'
                            : exp.category === 'LAUNDRY_COST'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {exp.category}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-semibold text-slate-800">
                      {exp.title}
                    </td>
                    <td className="px-4 py-4 font-black text-rose-600">
                      -฿{exp.amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-4 text-slate-500 text-xs">
                      {exp.note || '-'}
                    </td>
                    <td className="px-6 py-4 text-right text-slate-400 text-xs">
                      {exp.created_by}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleAddExpense}
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95"
          >
            <h3 className="text-lg font-black text-slate-900">
              บันทึกรายการรายจ่ายใหม่
            </h3>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                หมวดหมู่รายจ่าย
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white"
              >
                <option value="FUEL">ค่าน้ำมัน / ค่าเดินทาง (FUEL)</option>
                <option value="PACKAGING">ค่าถุง / บรรจุภัณฑ์ (PACKAGING)</option>
                <option value="LAUNDRY_COST">ค่าซักอบหน้าร้าน (LAUNDRY_COST)</option>
                <option value="MAINTENANCE">ค่าซ่อมบำรุง / อุปกรณ์ (MAINTENANCE)</option>
                <option value="OTHER">อื่นๆ (OTHER)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                รายการรายจ่าย <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="เช่น ค่าน้ำมันมอเตอร์ไซค์รับผ้า"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  จำนวนเงิน (บาท) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  วันที่จ่าย
                </label>
                <input
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                หมายเหตุเพิ่มเติม
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="เช่น ใบเสร็จปั๊ม ปตท."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-sm"
              >
                {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกรายจ่าย'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
