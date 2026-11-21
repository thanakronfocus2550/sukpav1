import { NextResponse } from 'next/server';
import { trackOrderCustomer } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { order_id, phone } = body;

    if (!order_id || !phone) {
      return NextResponse.json(
        { success: false, message: 'กรุณากรอกรหัส Order ID และเบอร์โทรศัพท์ที่ใช้จอง' },
        { status: 400 }
      );
    }

    const result = await trackOrderCustomer(order_id, phone);
    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message }, { status: 404 });
    }

    return NextResponse.json({ success: true, order: result.order });
  } catch (error) {
    return NextResponse.json({ success: false, message: String(error) }, { status: 500 });
  }
}
