import { NextResponse } from 'next/server';
import { getPartners, createPartner, updatePartner, deletePartner } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET(request: Request) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const partners = await getPartners();
    return NextResponse.json({ success: true, partners });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { name, owner_name, phone, address, notes, commission_rate } = body;

    if (!name || !owner_name || !phone) {
      return NextResponse.json({ success: false, error: 'กรุณากรอกชื่อร้าน ชื่อเจ้าของ และเบอร์โทรศัพท์' }, { status: 400 });
    }

    const newPartner = await createPartner({
      name,
      owner_name,
      phone,
      address: address || '',
      notes: notes || '',
      commission_rate: Number(commission_rate) || 5.0,
      is_active: true,
    });

    return NextResponse.json({ success: true, partner: newPartner });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { id, updates } = body;

    if (!id || !updates) {
      return NextResponse.json({ success: false, error: 'Missing partner id or updates' }, { status: 400 });
    }

    const updated = await updatePartner(id, updates);
    return NextResponse.json({ success: true, partner: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const queryId = searchParams.get('id');
    let id = queryId;

    if (!id) {
      try {
        const body = await request.json();
        id = body?.id;
      } catch {}
    }

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing partner id' }, { status: 400 });
    }

    await deletePartner(id);
    return NextResponse.json({ success: true, message: 'Partner deleted successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
