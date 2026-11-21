import { NextResponse } from 'next/server';
import { getFinancialSummary, getExpenses, addExpense } from '@/lib/db';
import { ExpenseCategory } from '@/lib/types';

export async function GET() {
  try {
    const summary = await getFinancialSummary();
    const expenses = await getExpenses();
    return NextResponse.json({ success: true, summary, expenses });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { category, title, amount, expense_date, note, actor, partner_id, order_id } = body;

    if (!title || amount === undefined || amount < 0) {
      return NextResponse.json({ success: false, error: 'กรุณากรอกรายการและจำนวนเงินให้ถูกต้อง' }, { status: 400 });
    }

    const newExp = await addExpense({
      category: (category as ExpenseCategory) || 'OTHER',
      title,
      amount: Number(amount),
      expense_date: expense_date || new Date().toISOString().split('T')[0],
      note: note || '',
      created_by: actor || 'Admin',
      partner_id,
      order_id,
    });

    return NextResponse.json({ success: true, expense: newExp });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
