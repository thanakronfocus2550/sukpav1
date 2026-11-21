// ==============================================================================
// SUK PA? V1 TypeScript Type Definitions
// Exact Pricing from Official Partner Board (เครื่องซัก 9-28kg / เครื่องอบ 17-30kg)
// ==============================================================================

export type DormType = 'INSIDE' | 'OUTSIDE';

export type WasherWeight = '9KG' | '14KG' | '20KG' | '28KG';

export type WashProgram =
  | 'COLD_STANDARD' // [2] ซักน้ำเย็น (ฟรีน้ำยา)
  | 'WARM_STANDARD' // [3] ซักน้ำอุ่น (ฟรีน้ำยา)
  | 'COLD_NO_CHEM' // [1] ซักน้ำเย็น (ไม่มีน้ำยา)
  | 'ANTI_BACTERIA_COLD' // [6] ซักฆ่าเชื้อน้ำเย็น (ฟรีน้ำยา)
  | 'ANTI_BACTERIA_WARM'; // [7] ซักฆ่าเชื้อน้ำอุ่น (ฟรีน้ำยา)

export type DryerWeight = '17KG' | '24KG' | '30KG';

export type PaymentMethod = 'PROMPTPAY' | 'CASH';

export type OrderStatus =
  | 'NEW'
  | 'CONFIRMED'
  | 'PICKED_UP'
  | 'SENT_TO_PARTNER'
  | 'WASHING'
  | 'READY'
  | 'DELIVERING'
  | 'COMPLETED'
  | 'CANCELLED';

export type PaymentStatus =
  | 'PENDING'
  | 'WAITING_VERIFICATION'
  | 'PAID'
  | 'WRONG_AMOUNT'
  | 'EXPIRED'
  | 'REFUNDED';

export type PartnerReportStatus = 'DRAFT' | 'READY' | 'SENT' | 'CONFIRMED';

export type ExpenseCategory =
  | 'PARTNER_COMMISSION'
  | 'LAUNDRY_COST'
  | 'FUEL'
  | 'PACKAGING'
  | 'MAINTENANCE'
  | 'OTHER';

// Matrix according to uploaded price sheet
export const WASH_PROGRAM_LABELS: Record<WashProgram, { label: string; freeChemical: boolean }> = {
  COLD_STANDARD: { label: 'ซักน้ำเย็น (แนะนำ ฟรีน้ำยาซัก/ปรับผ้านุ่ม)', freeChemical: true },
  WARM_STANDARD: { label: 'ซักน้ำอุ่น (ฟรีน้ำยาซัก/ปรับผ้านุ่ม)', freeChemical: true },
  COLD_NO_CHEM: { label: 'ซักน้ำเย็น (ไม่มีน้ำยา)', freeChemical: false },
  ANTI_BACTERIA_COLD: { label: 'ซักฆ่าเชื้อน้ำเย็น (ฟรีน้ำยาซัก/ปรับผ้านุ่ม)', freeChemical: true },
  ANTI_BACTERIA_WARM: { label: 'ซักฆ่าเชื้อน้ำอุ่น (ฟรีน้ำยาซัก/ปรับผ้านุ่ม)', freeChemical: true },
};

export const WASHER_PRICING_TABLE: Record<WasherWeight, Record<WashProgram, number>> = {
  '9KG': {
    COLD_NO_CHEM: 40,
    COLD_STANDARD: 40,
    WARM_STANDARD: 60,
    ANTI_BACTERIA_COLD: 70,
    ANTI_BACTERIA_WARM: 90,
  },
  '14KG': {
    COLD_NO_CHEM: 60,
    COLD_STANDARD: 60,
    WARM_STANDARD: 80,
    ANTI_BACTERIA_COLD: 90,
    ANTI_BACTERIA_WARM: 110,
  },
  '20KG': {
    COLD_NO_CHEM: 80,
    COLD_STANDARD: 80,
    WARM_STANDARD: 100,
    ANTI_BACTERIA_COLD: 110,
    ANTI_BACTERIA_WARM: 130,
  },
  '28KG': {
    COLD_NO_CHEM: 100,
    COLD_STANDARD: 100,
    WARM_STANDARD: 120,
    ANTI_BACTERIA_COLD: 140,
    ANTI_BACTERIA_WARM: 160,
  },
};

export const DRYER_PRICING_TABLE: Record<DryerWeight, { basePrice: number; extraTimeMins: number }> = {
  '17KG': { basePrice: 50, extraTimeMins: 5 },
  '24KG': { basePrice: 70, extraTimeMins: 4 },
  '30KG': { basePrice: 90, extraTimeMins: 3 },
};

export const LOCKED_PAYMENT_CONFIG = {
  promptpayNumber: '0661323388',
  accountName: 'ธนกร ชูวงศ์วาลย์',
  bankName: 'พร้อมเพย์ (PromptPay)',
};

export interface DeliveryFeeSetting {
  id: string;
  dorm_type: DormType;
  dorm_type_label: string;
  fee_amount: number;
  is_active: boolean;
  updated_at: string;
}

export interface Partner {
  id: string;
  name: string;
  owner_name: string;
  phone: string;
  address: string;
  notes?: string;
  commission_rate: number; // default 5.00
  is_active: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  order_id: string; // SPYYMMDD-XXXX
  customer_id?: string;
  customer_name: string;
  customer_phone: string;
  dorm_type: DormType;
  dorm_name: string;
  room_no: string;
  basket_count: number;
  service_type?: string;
  washer_weight: WasherWeight;
  wash_program: WashProgram;
  washer_price: number;
  drum_wash_hot?: boolean; // +10 THB
  extra_rinse?: boolean; // +20 (9/14kg) or +30 (20/28kg)
  dryer_weight: DryerWeight;
  dryer_price: number;
  extra_dry_count?: number; // +10 THB each
  own_detergent?: boolean; // เอาน้ำยามาเอง
  note?: string;
  delivery_fee: number; // Snapshot (หอใน: 40, หอนอก: 35)
  laundry_cost_estimate: number;
  total_amount: number; // delivery_fee + washer_price + dryer_price + add-ons
  payment_method: PaymentMethod;
  status: OrderStatus;
  partner_id?: string;
  partner_name?: string;
  actual_partner_baskets: number;
  partner_commission_rate: number; // 5.00
  partner_commission_total: number; // actual_partner_baskets * 5.00
  cancelled_reason?: string;
  payment_status: PaymentStatus;
  slip_url?: string;
  picked_up_at?: string;
  sent_to_partner_at?: string;
  completed_at?: string;
  cancelled_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PartnerBasketRecord {
  id: string;
  order_id: string;
  order_code: string;
  partner_id: string;
  partner_name: string;
  baskets: number;
  rate_per_basket: number;
  total_payout: number;
  recorded_by: string;
  recorded_at: string;
  notes?: string;
}

export interface PartnerReport {
  id: string;
  report_code: string;
  partner_id: string;
  partner_name: string;
  report_date: string;
  total_orders: number;
  total_baskets: number;
  total_commission: number;
  status: PartnerReportStatus;
  notes?: string;
  created_by: string;
  sent_at?: string;
  confirmed_at?: string;
  created_at: string;
}

export interface PartnerReportItem {
  id: string;
  report_id: string;
  order_id: string;
  order_code: string;
  baskets: number;
  commission_amount: number;
  created_at: string;
}

export interface Payment {
  id: string;
  order_id: string;
  order_code: string;
  customer_name: string;
  customer_phone: string;
  amount: number;
  payment_method: PaymentMethod;
  slip_url?: string;
  status: PaymentStatus;
  reject_reason?: string;
  verified_at?: string;
  verified_by?: string;
  created_at: string;
}

export interface Expense {
  id: string;
  category: ExpenseCategory;
  title: string;
  amount: number;
  expense_date: string;
  order_id?: string;
  partner_id?: string;
  receipt_url?: string;
  note?: string;
  created_by: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  entity_type: 'ORDER' | 'PARTNER_BASKET' | 'REPORT' | 'FEE_SETTING' | 'PAYMENT' | 'PARTNER';
  entity_id: string;
  action: string;
  actor: string;
  old_value?: unknown;
  new_value?: unknown;
  created_at: string;
}
