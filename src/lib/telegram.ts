// ==============================================================================
// SUK PA? V1 Telegram Notification Utility (@SukPaAdminBot)
// Strictly Server-side only! Never expose tokens to client.
// ==============================================================================

export type TelegramEvent =
  | 'NEW_ORDER'
  | 'CANCEL_ORDER'
  | 'SLIP_UPLOADED'
  | 'PAYMENT_CONFIRMED'
  | 'WRONG_AMOUNT'
  | 'PENDING_PAYMENT_REMINDER'
  | 'SENT_TO_PARTNER'
  | 'PARTNER_FINISHED'
  | 'PARTNER_REPORT_READY'
  | 'SYSTEM_ERROR';

interface SendNotificationParams {
  event: TelegramEvent;
  orderId?: string;
  customerName?: string;
  phone?: string;
  dormInfo?: string;
  amount?: number;
  partnerName?: string;
  basketCount?: number;
  reason?: string;
  errorMessage?: string;
  extraInfo?: string;
}

export async function sendTelegramNotification(params: SendNotificationParams): Promise<{ success: boolean; message?: string }> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  const now = new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' });

  let text = '';

  switch (params.event) {
    case 'NEW_ORDER':
      text = `🧺 *[ออเดอร์ใหม่เข้ามา]* 🧺\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `🆔 *Order ID:* \`${params.orderId}\`\n` +
        `👤 *ลูกค้า:* ${params.customerName} (${params.phone})\n` +
        `🏢 *ที่พัก:* ${params.dormInfo}\n` +
        `🧺 *จำนวนตะกร้า:* ${params.basketCount} ตะกร้า\n` +
        `💰 *ค่าบริการรับ-ส่ง:* ฿${params.amount?.toFixed(2)}\n` +
        `⏰ *เวลาจอง:* ${now}\n` +
        `👉 รีบเข้าไปตรวจสอบและกดยืนยันออเดอร์`;
      break;

    case 'CANCEL_ORDER':
      text = `❌ *[แจ้งยกเลิกออเดอร์]* ❌\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `🆔 *Order ID:* \`${params.orderId}\`\n` +
        `👤 *ลูกค้า:* ${params.customerName}\n` +
        `⚠️ *เหตุผล:* ${params.reason || 'ไม่ได้ระบุเหตุผล'}\n` +
        `⏰ *เวลาที่ยกเลิก:* ${now}`;
      break;

    case 'SLIP_UPLOADED':
      text = `💳 *[มีการอัปโหลดสลิปโอนเงิน]* 💳\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `🆔 *Order ID:* \`${params.orderId}\`\n` +
        `👤 *ลูกค้า:* ${params.customerName}\n` +
        `💰 *ยอดที่ต้องชำระ:* ฿${params.amount?.toFixed(2)}\n` +
        `⏰ *เวลาอัปโหลด:* ${now}\n` +
        `👉 กรุณาเข้าสู่ระบบ Admin เพื่อตรวจสอบสลิป`;
      break;

    case 'PAYMENT_CONFIRMED':
      text = `✅ *[ยืนยันการชำระเงินสำเร็จ]* ✅\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `🆔 *Order ID:* \`${params.orderId}\`\n` +
        `💰 *ยอดเงิน:* ฿${params.amount?.toFixed(2)}\n` +
        `👤 *ลูกค้า:* ${params.customerName}\n` +
        `⏰ *เวลาตรวจสอบ:* ${now}\n` +
        `🎉 เตรียมจัดส่งผ้าคืนลูกค้า`;
      break;

    case 'WRONG_AMOUNT':
      text = `⚠️ *[สลิปโอนเงินไม่ถูกต้อง / ยอดไม่ตรง]* ⚠️\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `🆔 *Order ID:* \`${params.orderId}\`\n` +
        `👤 *ลูกค้า:* ${params.customerName} (${params.phone})\n` +
        `❗ *หมายเหตุ:* ${params.reason || 'ยอดเงินไม่ตรงตามที่ระบุ'}\n` +
        `⏰ *เวลาบันทึก:* ${now}`;
      break;

    case 'PENDING_PAYMENT_REMINDER':
      text = `⏳ *[แจ้งเตือนออเดอร์ค้างชำระ]* ⏳\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `🆔 *Order ID:* \`${params.orderId}\`\n` +
        `👤 *ลูกค้า:* ${params.customerName} (${params.phone})\n` +
        `💰 *ยอดค้าง:* ฿${params.amount?.toFixed(2)}\n` +
        `⏰ *ตรวจสอบเมื่อ:* ${now}`;
      break;

    case 'SENT_TO_PARTNER':
      text = `🚚 *[ส่งผ้าให้ร้านพาร์ทเนอร์แล้ว]* 🚚\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `🆔 *Order ID:* \`${params.orderId}\`\n` +
        `🏪 *ร้านพาร์ทเนอร์:* ${params.partnerName}\n` +
        `🧺 *จำนวนตะกร้าจริง:* ${params.basketCount} ตะกร้า\n` +
        `💵 *ค่าตอบแทนร้าน (฿5/ตะกร้า):* ฿${((params.basketCount || 0) * 5).toFixed(2)}\n` +
        `⏰ *เวลาส่ง:* ${now}`;
      break;

    case 'PARTNER_FINISHED':
      text = `✨ *[พาร์ทเนอร์ซัก-อบเสร็จสิ้น]* ✨\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `🆔 *Order ID:* \`${params.orderId}\`\n` +
        `🏪 *ร้านพาร์ทเนอร์:* ${params.partnerName}\n` +
        `📦 *สถานะ:* ผ้าพร้อมนำส่งคืนลูกค้า\n` +
        `⏰ *เวลาเสร็จสิ้น:* ${now}`;
      break;

    case 'PARTNER_REPORT_READY':
      text = `📊 *[รายงานพาร์ทเนอร์พร้อมส่ง]* 📊\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `🏪 *ร้านพาร์ทเนอร์:* ${params.partnerName}\n` +
        `📑 *รหัสรายงาน:* \`${params.reason || 'DRAFT'}\`\n` +
        `🧺 *รวมทั้งสิ้น:* ${params.basketCount} ตะกร้า\n` +
        `💵 *ยอดรวมค่าตอบแทน:* ฿${params.amount?.toFixed(2)}\n` +
        `⏰ *วันที่สร้าง:* ${now}`;
      break;

    case 'SYSTEM_ERROR':
      text = `🚨 *[ระบบตรวจพบข้อผิดพลาด]* 🚨\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `❗ *Error Details:* ${params.errorMessage || 'Unknown system error'}\n` +
        `📌 *Context:* ${params.extraInfo || 'SUK PA? Server'}\n` +
        `⏰ *เวลาที่เกิดเหตุ:* ${now}`;
      break;

    default:
      text = `📢 *[SUK PA? Notification]*\n${JSON.stringify(params)}\n⏰ ${now}`;
  }

  // If Bot Token or Chat ID are not yet configured, log to server console gracefully
  if (!token || !chatId || token === 'your-telegram-bot-token') {
    console.log('[Telegram Notification Simulated (No Credentials Yet)]:', text);
    return { success: true, message: 'Simulated in development (credentials pending)' };
  }

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'Markdown',
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.ok) {
      console.error('[Telegram API Error]:', data);
      return { success: false, message: data.description || 'Failed to send Telegram message' };
    }

    return { success: true, message: 'Sent successfully' };
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error('[Telegram API Exception]:', errMsg);
    return { success: false, message: errMsg };
  }
}
