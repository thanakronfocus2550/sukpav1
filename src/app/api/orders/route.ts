import { NextResponse } from 'next/server';
import { createOrder, getOrders } from '@/lib/db';
import { OrderStatus, WasherWeight, WashProgram, DryerWeight, PaymentMethod } from '@/lib/types';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET(request: Request) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as OrderStatus | undefined;
    const search = searchParams.get('search') || undefined;

    const orders = await getOrders({ status: status || undefined, search });
    return NextResponse.json({ success: true, orders });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customer_name,
      customer_phone,
      dorm_type,
      dorm_name,
      room_no,
      basket_count,
      washer_weight,
      wash_program,
      drum_wash_hot,
      extra_rinse,
      dryer_weight,
      extra_dry_count,
      payment_method,
      slip_url,
      own_detergent,
      note,
    } = body;

    // Validation
    if (!customer_name || !customer_phone || !dorm_type || !dorm_name || !room_no) {
      return NextResponse.json(
        { success: false, error: 'กรุณากรอกข้อมูลให้ครบถ้วนทุกช่องที่มีเครื่องหมายดอกจัน (*)' },
        { status: 400 }
      );
    }

    if (!['INSIDE', 'OUTSIDE'].includes(dorm_type)) {
      return NextResponse.json({ success: false, error: 'ประเภทที่พักไม่ถูกต้อง' }, { status: 400 });
    }

    const order = await createOrder({
      customer_name,
      customer_phone,
      dorm_type,
      dorm_name,
      room_no,
      basket_count: Number(basket_count) || 1,
      washer_weight: (washer_weight as WasherWeight) || '9KG',
      wash_program: (wash_program as WashProgram) || 'COLD_STANDARD',
      drum_wash_hot: Boolean(drum_wash_hot),
      extra_rinse: Boolean(extra_rinse),
      dryer_weight: (dryer_weight as DryerWeight) || '17KG',
      extra_dry_count: Number(extra_dry_count) || 0,
      own_detergent: Boolean(own_detergent),
      payment_method: (payment_method as PaymentMethod) || 'PROMPTPAY',
      slip_url: slip_url || undefined,
      note: note || '',
    });

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
