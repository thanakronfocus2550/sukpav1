import { NextResponse } from 'next/server';
import { getPayments, uploadPaymentSlip, verifyPayment } from '@/lib/db';

export async function GET() {
  try {
    const payments = await getPayments();
    return NextResponse.json({ success: true, payments });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { order_id, slip_url } = body;

    if (!order_id || !slip_url) {
      return NextResponse.json({ success: false, error: 'กรุณาระบุ Order ID และแนบหลักฐานสลิปโอนเงิน' }, { status: 400 });
    }

    const payment = await uploadPaymentSlip(order_id, slip_url);
    return NextResponse.json({ success: true, payment });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { payment_id, status, actor, reject_reason } = body;

    if (!payment_id || !status) {
      return NextResponse.json({ success: false, error: 'Missing payment id or status' }, { status: 400 });
    }

    const updated = await verifyPayment(payment_id, status, actor || 'Admin', reject_reason);
    return NextResponse.json({ success: true, payment: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
