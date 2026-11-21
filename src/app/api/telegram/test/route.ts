import { NextResponse } from 'next/server';
import { sendTelegramNotification } from '@/lib/telegram';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const result = await sendTelegramNotification({
      event: 'SYSTEM_ERROR',
      errorMessage: body.message || 'ทดสอบการส่งข้อความแจ้งเตือนจากระบบ SUK PA? Admin Console',
      extraInfo: 'Telegram Bot Connection Test',
    });
    return NextResponse.json({ success: true, result });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
