import { NextResponse } from 'next/server';
import {
  clearAdminSession,
  createAdminSession,
  isAdminAuthConfigured,
  isAdminAuthenticated,
  isSameOriginRequest,
  verifyAdminPassword,
} from '@/lib/admin-auth';

export async function GET() {
  if (!isAdminAuthConfigured()) {
    return NextResponse.json(
      { success: false, error: 'ระบบล็อกอินผู้ดูแลยังตั้งค่าไม่สมบูรณ์' },
      { status: 503 }
    );
  }

  return NextResponse.json({ success: true, authenticated: await isAdminAuthenticated() });
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ success: false, error: 'คำขอไม่ถูกต้อง' }, { status: 403 });
  }

  if (!isAdminAuthConfigured()) {
    return NextResponse.json(
      { success: false, error: 'ระบบล็อกอินผู้ดูแลยังตั้งค่าไม่สมบูรณ์' },
      { status: 503 }
    );
  }

  let body: { password?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'ข้อมูลเข้าสู่ระบบไม่ถูกต้อง' }, { status: 400 });
  }

  if (typeof body.password !== 'string' || !verifyAdminPassword(body.password)) {
    return NextResponse.json({ success: false, error: 'รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง' }, { status: 401 });
  }

  await createAdminSession();
  return NextResponse.json({ success: true, authenticated: true });
}

export async function DELETE(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ success: false, error: 'คำขอไม่ถูกต้อง' }, { status: 403 });
  }

  await clearAdminSession();
  return NextResponse.json({ success: true, authenticated: false });
}
