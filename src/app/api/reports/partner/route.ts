import { NextResponse } from 'next/server';
import {
  getPartnerReports,
  getPartnerReportDetail,
  generatePartnerDailyReport,
  updatePartnerReportStatus,
} from '@/lib/db';
import { PartnerReportStatus } from '@/lib/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const detail = await getPartnerReportDetail(id);
      if (!detail) {
        return NextResponse.json({ success: false, error: 'ไม่พบรายงาน' }, { status: 404 });
      }
      return NextResponse.json({ success: true, ...detail });
    }

    const reports = await getPartnerReports();
    return NextResponse.json({ success: true, reports });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { partner_id, report_date, actor } = body;

    if (!partner_id || !report_date) {
      return NextResponse.json({ success: false, error: 'กรุณาเลือกร้านพาร์ทเนอร์และวันที่ต้องการสรุปยอด' }, { status: 400 });
    }

    const report = await generatePartnerDailyReport(partner_id, report_date, actor || 'Admin');
    return NextResponse.json({ success: true, report });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, actor } = body;

    if (!id || !status) {
      return NextResponse.json({ success: false, error: 'Missing report id or status' }, { status: 400 });
    }

    const updated = await updatePartnerReportStatus(id, status as PartnerReportStatus, actor || 'Admin');
    return NextResponse.json({ success: true, report: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
