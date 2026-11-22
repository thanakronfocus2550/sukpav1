import { NextResponse } from 'next/server';
import { getDeliveryFees, updateDeliveryFee } from '@/lib/db';
import { DormType } from '@/lib/types';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET() {
  try {
    const fees = await getDeliveryFees();
    return NextResponse.json({ success: true, fees });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { dorm_type, fee_amount, actor } = body;

    if (!dorm_type || fee_amount === undefined || fee_amount < 0) {
      return NextResponse.json({ success: false, error: 'ข้อมูลไม่ถูกต้อง' }, { status: 400 });
    }

    const updated = await updateDeliveryFee(dorm_type as DormType, Number(fee_amount), actor || 'Admin');
    return NextResponse.json({ success: true, fee: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
