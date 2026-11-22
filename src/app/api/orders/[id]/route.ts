import { NextResponse } from 'next/server';
import { getOrderById, updateOrderStatus, assignPartnerAndBaskets } from '@/lib/db';
import { OrderStatus } from '@/lib/types';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const order = await getOrderById(id);
    if (!order) {
      return NextResponse.json({ success: false, error: 'ไม่พบออเดอร์นี้' }, { status: 404 });
    }
    return NextResponse.json({ success: true, order });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const body = await request.json();
    const { action, status, partner_id, actual_baskets, actor, reason, notes } = body;

    if (action === 'ASSIGN_PARTNER') {
      if (!partner_id || actual_baskets === undefined) {
        return NextResponse.json({ success: false, error: 'กรุณาระบุพาร์ทเนอร์และจำนวนตะกร้าจริง' }, { status: 400 });
      }
      const updated = await assignPartnerAndBaskets(id, partner_id, Number(actual_baskets), actor || 'Admin', notes);
      return NextResponse.json({ success: true, order: updated });
    }

    if (status) {
      const updated = await updateOrderStatus(id, status as OrderStatus, actor || 'Admin', reason);
      return NextResponse.json({ success: true, order: updated });
    }

    return NextResponse.json({ success: false, error: 'Invalid action or status' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
