import fs from 'fs';
import path from 'path';
import {
  Order,
  Partner,
  DeliveryFeeSetting,
  PartnerBasketRecord,
  PartnerReport,
  PartnerReportItem,
  Payment,
  Expense,
  AuditLog,
  OrderStatus,
  PaymentStatus,
  PartnerReportStatus,
  DormType,
  WasherWeight,
  WashProgram,
  DryerWeight,
  PaymentMethod,
  WASHER_PRICING_TABLE,
  DRYER_PRICING_TABLE,
} from './types';
import { sendTelegramNotification } from './telegram';
import { supabaseAdmin, supabasePublic, isSupabaseConfigured } from './supabase';

interface DatabaseState {
  delivery_fees: DeliveryFeeSetting[];
  partners: Partner[];
  orders: Order[];
  partner_basket_records: PartnerBasketRecord[];
  partner_reports: PartnerReport[];
  partner_report_items: PartnerReportItem[];
  payments: Payment[];
  expenses: Expense[];
  audit_logs: AuditLog[];
}

const DB_FILE_PATH = process.env.VERCEL
  ? path.join('/tmp', 'sukpa_db.json')
  : path.join(process.cwd(), 'data', 'sukpa_db.json');

const INITIAL_STATE: DatabaseState = {
  delivery_fees: [
    {
      id: 'fee-inside',
      dorm_type: 'INSIDE',
      dorm_type_label: 'หอใน (มจพ. ปราจีนบุรี)',
      fee_amount: 40.0,
      is_active: true,
      updated_at: new Date().toISOString(),
    },
    {
      id: 'fee-outside',
      dorm_type: 'OUTSIDE',
      dorm_type_label: 'หอนอก (รอบมหาวิทยาลัย)',
      fee_amount: 35.0,
      is_active: true,
      updated_at: new Date().toISOString(),
    },
  ],
  partners: [],
  orders: [],
  partner_basket_records: [],
  partner_reports: [],
  partner_report_items: [],
  payments: [],
  expenses: [],
  audit_logs: [],
};

// In-memory local fallback sync
function ensureDbFile(): DatabaseState {
  try {
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE_PATH)) {
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(INITIAL_STATE, null, 2), 'utf-8');
      return INITIAL_STATE;
    }
    const content = fs.readFileSync(DB_FILE_PATH, 'utf-8');
    return JSON.parse(content) as DatabaseState;
  } catch (err) {
    console.error('Error reading DB file, returning initial state:', err);
    return INITIAL_STATE;
  }
}

function saveDbState(state: DatabaseState): void {
  try {
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving DB file:', err);
  }
}

// --------------------------------------------------------------------------
// 1. Delivery Fees
// --------------------------------------------------------------------------
export async function getDeliveryFees(): Promise<DeliveryFeeSetting[]> {
  if (isSupabaseConfigured && supabaseAdmin) {
    const { data } = await supabaseAdmin.from('delivery_fee_settings').select('*');
    if (data && data.length > 0) return data;
  }
  const db = ensureDbFile();
  return db.delivery_fees;
}

export async function updateDeliveryFee(dormType: DormType, newAmount: number, actor: string = 'Admin'): Promise<DeliveryFeeSetting> {
  const db = ensureDbFile();
  const feeSetting = db.delivery_fees.find((f) => f.dorm_type === dormType);
  if (!feeSetting) {
    throw new Error(`Fee setting for ${dormType} not found`);
  }

  const oldAmount = feeSetting.fee_amount;
  feeSetting.fee_amount = newAmount;
  feeSetting.updated_at = new Date().toISOString();

  // Audit Log
  db.audit_logs.push({
    id: `audit-${Date.now()}`,
    entity_type: 'FEE_SETTING',
    entity_id: feeSetting.id,
    action: 'UPDATE_DELIVERY_FEE',
    actor,
    old_value: { dorm_type: dormType, fee: oldAmount },
    new_value: { dorm_type: dormType, fee: newAmount },
    created_at: new Date().toISOString(),
  });

  saveDbState(db);

  if (isSupabaseConfigured && supabaseAdmin) {
    await supabaseAdmin
      .from('delivery_fee_settings')
      .update({ fee_amount: newAmount, updated_at: feeSetting.updated_at, updated_by: actor })
      .eq('dorm_type', dormType);
  }

  return feeSetting;
}

// --------------------------------------------------------------------------
// 2. Partners
// --------------------------------------------------------------------------
export async function getPartners(): Promise<Partner[]> {
  const client = supabaseAdmin || supabasePublic;
  if (isSupabaseConfigured && client) {
    try {
      const { data, error } = await client.from('partners').select('*').order('created_at', { ascending: false });
      if (!error && Array.isArray(data)) {
        return data;
      }
    } catch (e) {
      console.error('Supabase getPartners error:', e);
    }
  }
  const db = ensureDbFile();
  return db.partners;
}

export async function createPartner(partner: Omit<Partner, 'id' | 'created_at' | 'commission_rate'> & { commission_rate?: number }): Promise<Partner> {
  const db = ensureDbFile();
  let createdId = `partner-${Date.now()}`;
  const nowIso = new Date().toISOString();
  const client = supabaseAdmin || supabasePublic;

  if (isSupabaseConfigured && client) {
    try {
      const { data, error } = await client.from('partners').insert({
        name: partner.name,
        owner_name: partner.owner_name,
        phone: partner.phone,
        address: partner.address || '',
        notes: partner.notes || '',
        commission_rate: partner.commission_rate ?? 5.0,
        is_active: partner.is_active ?? true,
      }).select().single();

      if (data && !error) {
        createdId = data.id;
      } else if (error) {
        console.error('Supabase createPartner error:', error);
        throw new Error(error.message);
      }
    } catch (e) {
      console.error('Failed to insert partner into Supabase:', e);
      throw e;
    }
  }

  const newPartner: Partner = {
    ...partner,
    id: createdId,
    commission_rate: partner.commission_rate ?? 5.0,
    created_at: nowIso,
  };
  db.partners.unshift(newPartner);

  db.audit_logs.push({
    id: `audit-${Date.now()}`,
    entity_type: 'PARTNER',
    entity_id: newPartner.id,
    action: 'CREATE_PARTNER',
    actor: 'Admin',
    new_value: newPartner,
    created_at: nowIso,
  });

  saveDbState(db);
  return newPartner;
}

export async function updatePartner(id: string, updates: Partial<Partner>): Promise<Partner> {
  const db = ensureDbFile();
  const partner = db.partners.find((p) => p.id === id);
  if (partner) {
    const oldPartner = { ...partner };
    Object.assign(partner, updates);

    db.audit_logs.push({
      id: `audit-${Date.now()}`,
      entity_type: 'PARTNER',
      entity_id: id,
      action: 'UPDATE_PARTNER',
      actor: 'Admin',
      old_value: oldPartner,
      new_value: partner,
      created_at: new Date().toISOString(),
    });

    saveDbState(db);
  }

  const client = supabaseAdmin || supabasePublic;
  if (isSupabaseConfigured && client) {
    try {
      const { error } = await client.from('partners').update(updates).eq('id', id);
      if (error) {
        console.error('Supabase updatePartner error:', error);
        throw new Error(error.message);
      }
    } catch (e) {
      console.error('Failed to update partner in Supabase:', e);
      throw e;
    }
  }

  if (!partner && isSupabaseConfigured && client) {
    const { data } = await client.from('partners').select('*').eq('id', id).single();
    if (data) return data;
  }

  if (!partner) throw new Error('Partner not found');
  return partner;
}

export async function deletePartner(id: string): Promise<boolean> {
  const db = ensureDbFile();
  const index = db.partners.findIndex((p) => p.id === id);
  if (index !== -1) {
    db.partners.splice(index, 1);
    db.audit_logs.push({
      id: `audit-${Date.now()}`,
      entity_type: 'PARTNER',
      entity_id: id,
      action: 'DELETE_PARTNER',
      actor: 'Admin',
      created_at: new Date().toISOString(),
    });
    saveDbState(db);
  }

  const client = supabaseAdmin || supabasePublic;
  if (isSupabaseConfigured && client) {
    try {
      const { error } = await client.from('partners').delete().eq('id', id);
      if (error) {
        console.error('Supabase deletePartner error:', error);
        throw new Error(error.message);
      }
    } catch (e) {
      console.error('Failed to delete partner from Supabase:', e);
      throw e;
    }
  }

  return true;
}

// --------------------------------------------------------------------------
// 3. Orders & Booking (With Price Snapshot)
// --------------------------------------------------------------------------
function generateOrderId(count: number): string {
  const now = new Date();
  const year = String(now.getFullYear()).slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const seq = String(count + 1).padStart(4, '0');
  return `SP${year}${month}${day}-${seq}`;
}

export async function createOrder(data: {
  customer_name: string;
  customer_phone: string;
  dorm_type: DormType;
  dorm_name: string;
  room_no: string;
  basket_count: number;
  washer_weight: WasherWeight;
  wash_program: WashProgram;
  drum_wash_hot?: boolean;
  extra_rinse?: boolean;
  dryer_weight: DryerWeight;
  extra_dry_count?: number;
  own_detergent?: boolean;
  payment_method: PaymentMethod;
  slip_url?: string;
  note?: string;
}): Promise<Order> {
  const db = ensureDbFile();

  // 1. Delivery fee snapshot: Inside = 40, Outside = 35
  let deliveryFeeSnapshot = data.dorm_type === 'INSIDE' ? 40.0 : 35.0;
  if (isSupabaseConfigured && supabaseAdmin) {
    const { data: feeData } = await supabaseAdmin
      .from('delivery_fee_settings')
      .select('fee_amount')
      .eq('dorm_type', data.dorm_type)
      .eq('is_active', true)
      .maybeSingle();
    if (feeData?.fee_amount !== undefined) {
      deliveryFeeSnapshot = Number(feeData.fee_amount);
    }
  } else {
    const feeSetting = db.delivery_fees.find((f) => f.dorm_type === data.dorm_type);
    if (feeSetting) deliveryFeeSnapshot = feeSetting.fee_amount;
  }

  // 2. Exact Washer pricing from table
  const washerBasePrice =
    WASHER_PRICING_TABLE[data.washer_weight]?.[data.wash_program] ?? 40;
  const drumWashHotPrice = data.drum_wash_hot ? 10 : 0;
  const extraRinsePrice = data.extra_rinse
    ? ['20KG', '28KG'].includes(data.washer_weight)
      ? 30
      : 20
    : 0;
  const washerTotalPrice = washerBasePrice + drumWashHotPrice + extraRinsePrice;

  // 3. Exact Dryer pricing from table
  const dryerBasePrice = DRYER_PRICING_TABLE[data.dryer_weight]?.basePrice ?? 50;
  const extraDryPrice = (data.extra_dry_count || 0) * 10;
  const dryerTotalPrice = dryerBasePrice + extraDryPrice;

  // 4. Grand Total (Delivery + Washer + Dryer + Add-ons)
  const totalAmount = deliveryFeeSnapshot + washerTotalPrice + dryerTotalPrice;

  // 5. Generate sequential Order ID
  let todayOrderCount = db.orders.length;
  if (isSupabaseConfigured && supabaseAdmin) {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
    const { count } = await supabaseAdmin
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', startOfDay);
    todayOrderCount = count || 0;
  }
  const orderId = generateOrderId(todayOrderCount);

  const paymentStatus: PaymentStatus =
    data.payment_method === 'CASH'
      ? 'PENDING'
      : data.slip_url
      ? 'WAITING_VERIFICATION'
      : 'PENDING';

  const newOrder: Order = {
    id: `order-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    order_id: orderId,
    customer_name: data.customer_name.trim(),
    customer_phone: data.customer_phone.trim(),
    dorm_type: data.dorm_type,
    dorm_name: data.dorm_name.trim(),
    room_no: data.room_no.trim(),
    basket_count: Number(data.basket_count) || 1,
    washer_weight: data.washer_weight,
    wash_program: data.wash_program,
    washer_price: washerTotalPrice,
    drum_wash_hot: Boolean(data.drum_wash_hot),
    extra_rinse: Boolean(data.extra_rinse),
    dryer_weight: data.dryer_weight,
    dryer_price: dryerTotalPrice,
    extra_dry_count: data.extra_dry_count || 0,
    own_detergent: Boolean(data.own_detergent),
    note: data.note?.trim() || '',
    delivery_fee: deliveryFeeSnapshot,
    laundry_cost_estimate: washerTotalPrice + dryerTotalPrice,
    total_amount: totalAmount,
    payment_method: data.payment_method,
    slip_url: data.slip_url,
    status: 'NEW',
    actual_partner_baskets: 0,
    partner_commission_rate: 5.0,
    partner_commission_total: 0,
    payment_status: paymentStatus,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabaseAdmin) {
    const { data: customer, error: customerError } = await supabaseAdmin
      .from('customers')
      .insert({
        full_name: newOrder.customer_name,
        phone: newOrder.customer_phone,
        dorm_type: newOrder.dorm_type,
        dorm_name: newOrder.dorm_name,
        room_no: newOrder.room_no,
        last_order_at: newOrder.created_at,
      })
      .select('id')
      .single();

    if (customerError) {
      throw new Error(`ไม่สามารถบันทึกข้อมูลลูกค้าได้: ${customerError.message}`);
    }

    const optionsNote = [
      `ซัก ${newOrder.washer_weight} - ${newOrder.wash_program}`,
      `อบ ${newOrder.dryer_weight}`,
      newOrder.drum_wash_hot ? 'ซักน้ำอุ่น/อบเพิ่มเติม' : '',
      newOrder.extra_rinse ? 'ซักล้างเพิ่ม' : '',
      (newOrder.extra_dry_count || 0) > 0 ? `อบเพิ่ม ${newOrder.extra_dry_count} รอบ` : '',
      newOrder.own_detergent ? 'ลูกค้านำน้ำยาซักผ้ามาเอง' : '',
      newOrder.payment_method === 'CASH' ? 'ชำระเงินสดตอนรับผ้า' : 'ชำระพร้อมเพย์',
      newOrder.note || '',
    ].filter(Boolean).join(' | ');

    const { data: insertedOrder, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        order_id: newOrder.order_id,
        customer_id: customer?.id,
        customer_name: newOrder.customer_name,
        customer_phone: newOrder.customer_phone,
        dorm_type: newOrder.dorm_type,
        dorm_name: newOrder.dorm_name,
        room_no: newOrder.room_no,
        basket_count: newOrder.basket_count,
        service_type: 'WASH_AND_DRY',
        note: optionsNote,
        delivery_fee: newOrder.delivery_fee,
        laundry_cost_estimate: newOrder.laundry_cost_estimate,
        total_amount: newOrder.total_amount,
        status: newOrder.status,
        actual_partner_baskets: 0,
        partner_commission_rate: 5,
      })
      .select('*')
      .single();

    if (orderError) {
      throw new Error(`ไม่สามารถบันทึกออเดอร์ได้: ${orderError.message}`);
    }

    newOrder.id = insertedOrder.id;
    newOrder.created_at = insertedOrder.created_at || newOrder.created_at;
    newOrder.updated_at = insertedOrder.updated_at || newOrder.updated_at;

    const { error: paymentError } = await supabaseAdmin
      .from('payments')
      .insert({
        order_id: insertedOrder.id,
        amount: newOrder.total_amount,
        slip_url: newOrder.slip_url,
        status: newOrder.payment_status,
      });

    if (paymentError) {
      console.error('Supabase initial payment error:', paymentError);
    }
  }

  db.orders.unshift(newOrder);

  // Create initial payment record
  const initialPayment: Payment = {
    id: `pay-${Date.now()}`,
    order_id: newOrder.id,
    order_code: newOrder.order_id,
    customer_name: newOrder.customer_name,
    customer_phone: newOrder.customer_phone,
    amount: newOrder.total_amount,
    payment_method: data.payment_method,
    slip_url: data.slip_url,
    status: paymentStatus,
    created_at: new Date().toISOString(),
  };
  db.payments.unshift(initialPayment);

  // Audit log
  db.audit_logs.push({
    id: `audit-${Date.now()}`,
    entity_type: 'ORDER',
    entity_id: newOrder.id,
    action: 'CREATE_ORDER',
    actor: 'Customer (Self-service)',
    new_value: newOrder,
    created_at: new Date().toISOString(),
  });

  saveDbState(db);

  // Telegram alert
  sendTelegramNotification({
    event: 'NEW_ORDER',
    orderId: newOrder.order_id,
    customerName: newOrder.customer_name,
    phone: newOrder.customer_phone,
    dormInfo: `${newOrder.dorm_name} ห้อง ${newOrder.room_no} (${newOrder.dorm_type === 'INSIDE' ? 'หอใน' : 'หอนอก'})`,
    basketCount: newOrder.basket_count,
    amount: newOrder.total_amount,
    extraInfo: `ซัก ${data.washer_weight} (${washerTotalPrice}บ.) + อบ ${data.dryer_weight} (${dryerTotalPrice}บ.) | รวมส่ง: ฿${totalAmount}`,
  }).catch((e) => console.error('Telegram notification error:', e));

  return newOrder;
}

export async function getOrders(filters?: {
  status?: OrderStatus;
  search?: string;
}): Promise<Order[]> {
  if (isSupabaseConfigured && supabaseAdmin) {
    let query = supabaseAdmin
      .from('orders')
      .select('*, partners(name)')
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.search) {
      const q = filters.search.trim();
      if (q) {
        query = query.or(
          `order_id.ilike.%${q}%,customer_name.ilike.%${q}%,customer_phone.ilike.%${q}%,dorm_name.ilike.%${q}%`
        );
      }
    }

    const { data, error } = await query;
    if (error) throw new Error(`ไม่สามารถดึงออเดอร์จาก Supabase ได้: ${error.message}`);
    if (Array.isArray(data)) {
      return data.map((row) => ({
        ...row,
        washer_price: Number(row.washer_price),
        dryer_price: Number(row.dryer_price),
        delivery_fee: Number(row.delivery_fee),
        laundry_cost_estimate: Number(row.laundry_cost_estimate || 0),
        total_amount: Number(row.total_amount),
        actual_partner_baskets: Number(row.actual_partner_baskets || 0),
        partner_commission_rate: Number(row.partner_commission_rate || 5),
        partner_commission_total: Number(row.partner_commission_total || 0),
        partner_name: row.partners?.name,
      }));
    }
  }

  const db = ensureDbFile();
  let list = db.orders;

  if (filters?.status) {
    list = list.filter((o) => o.status === filters.status);
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase().trim();
    list = list.filter(
      (o) =>
        o.order_id.toLowerCase().includes(q) ||
        o.customer_name.toLowerCase().includes(q) ||
        o.customer_phone.includes(q) ||
        o.dorm_name.toLowerCase().includes(q)
    );
  }
  return list;
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  if (isSupabaseConfigured && supabaseAdmin) {
    const value = orderId.trim();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
    let query = supabaseAdmin
      .from('orders')
      .select('*, partners(name)');
    query = isUuid ? query.eq('id', value) : query.eq('order_id', value);

    const { data, error } = await query.maybeSingle();
    if (error) throw new Error(`ไม่สามารถดึงออเดอร์ได้: ${error.message}`);
    if (data) {
      return {
        ...data,
        washer_price: Number(data.washer_price),
        dryer_price: Number(data.dryer_price),
        delivery_fee: Number(data.delivery_fee),
        laundry_cost_estimate: Number(data.laundry_cost_estimate || 0),
        total_amount: Number(data.total_amount),
        actual_partner_baskets: Number(data.actual_partner_baskets || 0),
        partner_commission_rate: Number(data.partner_commission_rate || 5),
        partner_commission_total: Number(data.partner_commission_total || 0),
        partner_name: data.partners?.name,
      };
    }
  }

  const db = ensureDbFile();
  const found = db.orders.find(
    (o) => o.order_id.toUpperCase() === orderId.toUpperCase() || o.id === orderId
  );
  return found || null;
}

// Secure Customer Order Tracking: requires matching last 4 digits of phone number
export async function trackOrderCustomer(orderId: string, phoneVerification: string): Promise<{ success: boolean; order?: Partial<Order>; message?: string }> {
  if (isSupabaseConfigured && supabaseAdmin) {
    const order = await getOrderById(orderId);
    if (!order) {
      return { success: false, message: 'ไม่พบหมายเลขคำสั่งซื้อนี้ในระบบ กรุณาตรวจสอบใหม่อีกครั้ง' };
    }

    const cleanDbPhone = order.customer_phone.replace(/\D/g, '');
    const cleanInputPhone = phoneVerification.replace(/\D/g, '');
    const isMatched =
      cleanDbPhone === cleanInputPhone ||
      cleanDbPhone.endsWith(cleanInputPhone) ||
      cleanInputPhone.endsWith(cleanDbPhone.slice(-4));

    if (!isMatched) {
      return { success: false, message: 'เบอร์โทรศัพท์ยืนยันไม่ถูกต้อง กรุณากรอกเบอร์โทรที่ใช้ในการจอง' };
    }

    const safeOrder: Partial<Order> = {
      order_id: order.order_id,
      customer_name: order.customer_name.charAt(0) + '***',
      dorm_type: order.dorm_type,
      dorm_name: order.dorm_name,
      room_no: '***',
      basket_count: order.basket_count,
      washer_weight: order.washer_weight,
      dryer_weight: order.dryer_weight,
      delivery_fee: order.delivery_fee,
      total_amount: order.total_amount,
      status: order.status,
      payment_status: order.payment_status,
      picked_up_at: order.picked_up_at,
      sent_to_partner_at: order.sent_to_partner_at,
      completed_at: order.completed_at,
      created_at: order.created_at,
    };
    return { success: true, order: safeOrder };
  }

  const db = ensureDbFile();
  const order = db.orders.find((o) => o.order_id.toUpperCase() === orderId.toUpperCase().trim());

  if (!order) {
    return { success: false, message: 'ไม่พบหมายเลขคำสั่งซื้อนี้ในระบบ กรุณาตรวจสอบใหม่อีกครั้ง' };
  }

  // Clean phone string (remove hyphens and spaces)
  const cleanDbPhone = order.customer_phone.replace(/\D/g, '');
  const cleanInputPhone = phoneVerification.replace(/\D/g, '');

  const isMatched =
    cleanDbPhone === cleanInputPhone ||
    cleanDbPhone.endsWith(cleanInputPhone) ||
    cleanInputPhone.endsWith(cleanDbPhone.slice(-4));

  if (!isMatched) {
    return { success: false, message: 'เบอร์โทรศัพท์ยืนยันไม่ถูกต้อง กรุณากรอกเบอร์โทรที่ใช้ในการจอง' };
  }

  // Return privacy-friendly object (masking sensitive data)
  const safeOrder: Partial<Order> = {
    order_id: order.order_id,
    customer_name: order.customer_name.charAt(0) + '***',
    dorm_type: order.dorm_type,
    dorm_name: order.dorm_name,
    room_no: '***',
    basket_count: order.basket_count,
    washer_weight: order.washer_weight,
    dryer_weight: order.dryer_weight,
    delivery_fee: order.delivery_fee,
    total_amount: order.total_amount,
    status: order.status,
    payment_status: order.payment_status,
    picked_up_at: order.picked_up_at,
    sent_to_partner_at: order.sent_to_partner_at,
    completed_at: order.completed_at,
    created_at: order.created_at,
  };

  return { success: true, order: safeOrder };
}

// --------------------------------------------------------------------------
// 4. Order Status Transitions & Operations
// --------------------------------------------------------------------------
export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  actor: string = 'Admin',
  cancelledReason?: string
): Promise<Order> {
  if (isSupabaseConfigured && supabaseAdmin) {
    const order = await getOrderById(orderId);
    if (!order) throw new Error('Order not found');

    const updates: Record<string, unknown> = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    };
    if (newStatus === 'PICKED_UP') updates.picked_up_at = new Date().toISOString();
    if (newStatus === 'COMPLETED') updates.completed_at = new Date().toISOString();
    if (newStatus === 'CANCELLED') {
      updates.cancelled_at = new Date().toISOString();
      updates.cancelled_reason = cancelledReason;
    }

    const { data, error } = await supabaseAdmin
      .from('orders')
      .update(updates)
      .eq('id', order.id)
      .select('*, partners(name)')
      .single();
    if (error) throw new Error(`ไม่สามารถอัปเดตสถานะออเดอร์ได้: ${error.message}`);

    if (newStatus === 'CANCELLED') {
      sendTelegramNotification({
        event: 'CANCEL_ORDER',
        orderId: order.order_id,
        customerName: order.customer_name,
        reason: cancelledReason,
      }).catch(console.error);
    }

    return {
      ...data,
      washer_price: Number(data.washer_price),
      dryer_price: Number(data.dryer_price),
      delivery_fee: Number(data.delivery_fee),
      laundry_cost_estimate: Number(data.laundry_cost_estimate || 0),
      total_amount: Number(data.total_amount),
      actual_partner_baskets: Number(data.actual_partner_baskets || 0),
      partner_commission_rate: Number(data.partner_commission_rate || 5),
      partner_commission_total: Number(data.partner_commission_total || 0),
      partner_name: data.partners?.name,
    };
  }

  const db = ensureDbFile();
  const order = db.orders.find((o) => o.id === orderId || o.order_id === orderId);
  if (!order) throw new Error('Order not found');

  const oldStatus = order.status;
  order.status = newStatus;
  order.updated_at = new Date().toISOString();

  if (newStatus === 'PICKED_UP') {
    order.picked_up_at = new Date().toISOString();
  } else if (newStatus === 'COMPLETED') {
    order.completed_at = new Date().toISOString();
  } else if (newStatus === 'CANCELLED') {
    order.cancelled_at = new Date().toISOString();
    order.cancelled_reason = cancelledReason;

    sendTelegramNotification({
      event: 'CANCEL_ORDER',
      orderId: order.order_id,
      customerName: order.customer_name,
      reason: cancelledReason,
    }).catch(console.error);
  }

  db.audit_logs.push({
    id: `audit-${Date.now()}`,
    entity_type: 'ORDER',
    entity_id: order.id,
    action: 'UPDATE_ORDER_STATUS',
    actor,
    old_value: { status: oldStatus },
    new_value: { status: newStatus, cancelled_reason: cancelledReason },
    created_at: new Date().toISOString(),
  });

  saveDbState(db);
  return order;
}

// --------------------------------------------------------------------------
// 5. Partner Basket Assignment & 5 THB/Basket Commission
// --------------------------------------------------------------------------
export async function assignPartnerAndBaskets(
  orderId: string,
  partnerId: string,
  actualBaskets: number,
  actor: string = 'Admin',
  notes?: string
): Promise<Order> {
  if (isSupabaseConfigured && supabaseAdmin) {
    const order = await getOrderById(orderId);
    if (!order) throw new Error('Order not found');

    const { data: partner, error: partnerError } = await supabaseAdmin
      .from('partners')
      .select('*')
      .eq('id', partnerId)
      .single();
    if (partnerError || !partner) throw new Error('Partner not found');

    const commissionRate = Number(partner.commission_rate || 5);
    const sentAt = new Date().toISOString();
    const { data, error } = await supabaseAdmin
      .from('orders')
      .update({
        partner_id: partner.id,
        actual_partner_baskets: Number(actualBaskets),
        partner_commission_rate: commissionRate,
        status: 'SENT_TO_PARTNER',
        sent_to_partner_at: sentAt,
        updated_at: sentAt,
      })
      .eq('id', order.id)
      .select('*, partners(name)')
      .single();
    if (error) throw new Error(`ไม่สามารถมอบหมายพาร์ทเนอร์ได้: ${error.message}`);

    await supabaseAdmin.from('partner_basket_records').insert({
      order_id: order.id,
      partner_id: partner.id,
      baskets: Number(actualBaskets),
      rate_per_basket: commissionRate,
      total_payout: Number(actualBaskets) * commissionRate,
      recorded_by: actor,
      notes,
    });

    await supabaseAdmin.from('expenses').insert({
      category: 'PARTNER_COMMISSION',
      title: `ค่าตอบแทนร้าน ${partner.name} (ออเดอร์ ${order.order_id}: ${actualBaskets} ตะกร้า)`,
      amount: Number(actualBaskets) * commissionRate,
      expense_date: sentAt.split('T')[0],
      order_id: order.id,
      partner_id: partner.id,
      created_by: actor,
    });

    sendTelegramNotification({
      event: 'SENT_TO_PARTNER',
      orderId: order.order_id,
      partnerName: partner.name,
      basketCount: Number(actualBaskets),
      amount: Number(actualBaskets) * commissionRate,
    }).catch(console.error);

    return {
      ...data,
      washer_price: Number(data.washer_price),
      dryer_price: Number(data.dryer_price),
      delivery_fee: Number(data.delivery_fee),
      laundry_cost_estimate: Number(data.laundry_cost_estimate || 0),
      total_amount: Number(data.total_amount),
      actual_partner_baskets: Number(data.actual_partner_baskets || 0),
      partner_commission_rate: Number(data.partner_commission_rate || 5),
      partner_commission_total: Number(data.partner_commission_total || 0),
      partner_name: data.partners?.name,
    };
  }

  const db = ensureDbFile();
  const order = db.orders.find((o) => o.id === orderId || o.order_id === orderId);
  if (!order) throw new Error('Order not found');

  const partner = db.partners.find((p) => p.id === partnerId);
  if (!partner) throw new Error('Partner not found');

  const commissionRate = partner.commission_rate || 5.0; // 5 THB/basket
  const oldBaskets = order.actual_partner_baskets;
  const oldCommission = order.partner_commission_total;

  order.partner_id = partner.id;
  order.partner_name = partner.name;
  order.actual_partner_baskets = Number(actualBaskets);
  order.partner_commission_rate = commissionRate;
  order.partner_commission_total = Number(actualBaskets) * commissionRate;
  order.status = 'SENT_TO_PARTNER';
  order.sent_to_partner_at = new Date().toISOString();
  order.updated_at = new Date().toISOString();

  // Create Partner Basket Record
  const basketRecord: PartnerBasketRecord = {
    id: `pbr-${Date.now()}`,
    order_id: order.id,
    order_code: order.order_id,
    partner_id: partner.id,
    partner_name: partner.name,
    baskets: Number(actualBaskets),
    rate_per_basket: commissionRate,
    total_payout: Number(actualBaskets) * commissionRate,
    recorded_by: actor,
    recorded_at: new Date().toISOString(),
    notes,
  };
  db.partner_basket_records.unshift(basketRecord);

  // Auto record partner commission as an expense item
  db.expenses.push({
    id: `exp-${Date.now()}`,
    category: 'PARTNER_COMMISSION',
    title: `ค่าตอบแทนร้าน ${partner.name} (ออเดอร์ ${order.order_id}: ${actualBaskets} ตะกร้า)`,
    amount: Number(actualBaskets) * commissionRate,
    expense_date: new Date().toISOString().split('T')[0],
    order_id: order.id,
    partner_id: partner.id,
    created_by: actor,
    created_at: new Date().toISOString(),
  });

  // Audit log with full details
  db.audit_logs.push({
    id: `audit-${Date.now()}`,
    entity_type: 'PARTNER_BASKET',
    entity_id: order.id,
    action: 'ASSIGN_PARTNER_BASKETS',
    actor,
    old_value: { actual_baskets: oldBaskets, commission: oldCommission },
    new_value: {
      partner: partner.name,
      actual_baskets: actualBaskets,
      rate: commissionRate,
      commission_total: Number(actualBaskets) * commissionRate,
      notes,
    },
    created_at: new Date().toISOString(),
  });

  saveDbState(db);

  // Notify Telegram
  sendTelegramNotification({
    event: 'SENT_TO_PARTNER',
    orderId: order.order_id,
    partnerName: partner.name,
    basketCount: Number(actualBaskets),
    amount: Number(actualBaskets) * commissionRate,
  }).catch(console.error);

  return order;
}

// --------------------------------------------------------------------------
// 6. Partner Daily Reports (Strict Privacy: NO customer names/phones/rooms)
// --------------------------------------------------------------------------
export async function generatePartnerDailyReport(
  partnerId: string,
  reportDate: string, // YYYY-MM-DD
  actor: string = 'Admin'
): Promise<PartnerReport> {
  if (isSupabaseConfigured && supabaseAdmin) {
    const { data: partner, error: partnerError } = await supabaseAdmin
      .from('partners')
      .select('*')
      .eq('id', partnerId)
      .maybeSingle();
    if (partnerError) throw new Error(`ไม่สามารถอ่านข้อมูลพาร์ทเนอร์ได้: ${partnerError.message}`);
    if (!partner) throw new Error('Partner not found');

    const nextDay = new Date(`${reportDate}T00:00:00.000Z`);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);
    const nextDate = nextDay.toISOString().slice(0, 10);

    const { data: targetOrders, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select('id,order_id,actual_partner_baskets,basket_count,partner_commission_rate')
      .eq('partner_id', partnerId)
      .gte('sent_to_partner_at', `${reportDate}T00:00:00.000Z`)
      .lt('sent_to_partner_at', `${nextDate}T00:00:00.000Z`);
    if (ordersError) throw new Error(`ไม่สามารถดึงออเดอร์สำหรับรายงานได้: ${ordersError.message}`);

    const orders = targetOrders || [];
    let totalBaskets = 0;
    let totalCommission = 0;
    for (const order of orders) {
      const baskets = Number(order.actual_partner_baskets || order.basket_count || 1);
      const commission = baskets * Number(order.partner_commission_rate || partner.commission_rate || 5);
      totalBaskets += baskets;
      totalCommission += commission;
    }

    const reportCode = `RPT-${reportDate.replace(/-/g, '')}-${partner.name.substring(0, 4)}-${Math.floor(100 + Math.random() * 900)}`;
    const { data: report, error: reportError } = await supabaseAdmin
      .from('partner_reports')
      .insert({
        report_code: reportCode,
        partner_id: partner.id,
        report_date: reportDate,
        total_orders: orders.length,
        total_baskets: totalBaskets,
        total_commission: totalCommission,
        status: 'READY',
        created_by: actor,
      })
      .select('*')
      .single();
    if (reportError) throw new Error(`ไม่สามารถสร้างรายงานได้: ${reportError.message}`);

    if (orders.length > 0) {
      const items = orders.map((order) => ({
        report_id: report.id,
        order_id: order.id,
        order_code: order.order_id,
        baskets: Number(order.actual_partner_baskets || order.basket_count || 1),
        commission_amount:
          Number(order.actual_partner_baskets || order.basket_count || 1)
          * Number(order.partner_commission_rate || partner.commission_rate || 5),
      }));
      const { error: itemsError } = await supabaseAdmin
        .from('partner_report_items')
        .insert(items);
      if (itemsError) throw new Error(`ไม่สามารถบันทึกรายการรายงานได้: ${itemsError.message}`);
    }

    sendTelegramNotification({
      event: 'PARTNER_REPORT_READY',
      partnerName: partner.name,
      reason: reportCode,
      basketCount: totalBaskets,
      amount: totalCommission,
    }).catch(console.error);

    return {
      ...report,
      partner_name: partner.name,
      total_orders: Number(report.total_orders),
      total_baskets: Number(report.total_baskets),
      total_commission: Number(report.total_commission),
    };
  }

  const db = ensureDbFile();
  const partner = db.partners.find((p) => p.id === partnerId);
  if (!partner) throw new Error('Partner not found');

  // Find all orders delivered to this partner on this date
  const targetOrders = db.orders.filter((o) => {
    if (o.partner_id !== partnerId) return false;
    const sentDate = o.sent_to_partner_at ? o.sent_to_partner_at.split('T')[0] : o.created_at.split('T')[0];
    return sentDate === reportDate;
  });

  const reportCode = `RPT-${reportDate.replace(/-/g, '')}-${partner.name.substring(0, 4)}-${Math.floor(100 + Math.random() * 900)}`;

  let totalBaskets = 0;
  let totalCommission = 0;

  const reportId = `prpt-${Date.now()}`;
  const reportItems: PartnerReportItem[] = [];

  for (const ord of targetOrders) {
    const baskets = ord.actual_partner_baskets || ord.basket_count || 1;
    const commission = baskets * (ord.partner_commission_rate || 5.0);
    totalBaskets += baskets;
    totalCommission += commission;

    reportItems.push({
      id: `prpti-${Date.now()}-${ord.order_id}`,
      report_id: reportId,
      order_id: ord.id,
      order_code: ord.order_id, // STRICT PRIVACY: Only Order ID!
      baskets,
      commission_amount: commission,
      created_at: new Date().toISOString(),
    });
  }

  const newReport: PartnerReport = {
    id: reportId,
    report_code: reportCode,
    partner_id: partner.id,
    partner_name: partner.name,
    report_date: reportDate,
    total_orders: targetOrders.length,
    total_baskets: totalBaskets,
    total_commission: totalCommission,
    status: 'READY',
    created_by: actor,
    created_at: new Date().toISOString(),
  };

  db.partner_reports.unshift(newReport);
  db.partner_report_items.push(...reportItems);

  db.audit_logs.push({
    id: `audit-${Date.now()}`,
    entity_type: 'REPORT',
    entity_id: newReport.id,
    action: 'GENERATE_PARTNER_REPORT',
    actor,
    new_value: {
      report_code: reportCode,
      partner: partner.name,
      orders_count: targetOrders.length,
      baskets: totalBaskets,
      commission: totalCommission,
    },
    created_at: new Date().toISOString(),
  });

  saveDbState(db);

  sendTelegramNotification({
    event: 'PARTNER_REPORT_READY',
    partnerName: partner.name,
    reason: reportCode,
    basketCount: totalBaskets,
    amount: totalCommission,
  }).catch(console.error);

  return newReport;
}

export async function getPartnerReports(): Promise<PartnerReport[]> {
  if (isSupabaseConfigured && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('partner_reports')
      .select('*, partners(name)')
      .order('created_at', { ascending: false });
    if (error) throw new Error(`ไม่สามารถดึงรายงานพาร์ทเนอร์ได้: ${error.message}`);
    return (data || []).map((report) => ({
      ...report,
      partner_name: report.partners?.name || '',
      total_orders: Number(report.total_orders),
      total_baskets: Number(report.total_baskets),
      total_commission: Number(report.total_commission),
    }));
  }

  const db = ensureDbFile();
  return db.partner_reports;
}

export async function getPartnerReportDetail(reportId: string): Promise<{ report: PartnerReport; items: PartnerReportItem[] } | null> {
  if (isSupabaseConfigured && supabaseAdmin) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(reportId.trim());
    let reportQuery = supabaseAdmin
      .from('partner_reports')
      .select('*, partners(name)');
    reportQuery = isUuid
      ? reportQuery.eq('id', reportId.trim())
      : reportQuery.eq('report_code', reportId.trim());
    const { data: report, error: reportError } = await reportQuery.maybeSingle();
    if (reportError) throw new Error(`ไม่สามารถดึงรายงานได้: ${reportError.message}`);
    if (!report) return null;

    const { data: items, error: itemsError } = await supabaseAdmin
      .from('partner_report_items')
      .select('*')
      .eq('report_id', report.id)
      .order('created_at', { ascending: true });
    if (itemsError) throw new Error(`ไม่สามารถดึงรายการรายงานได้: ${itemsError.message}`);

    return {
      report: {
        ...report,
        partner_name: report.partners?.name || '',
        total_orders: Number(report.total_orders),
        total_baskets: Number(report.total_baskets),
        total_commission: Number(report.total_commission),
      },
      items: (items || []).map((item) => ({
        ...item,
        baskets: Number(item.baskets),
        commission_amount: Number(item.commission_amount),
      })),
    };
  }

  const db = ensureDbFile();
  const report = db.partner_reports.find((r) => r.id === reportId || r.report_code === reportId);
  if (!report) return null;
  const items = db.partner_report_items.filter((i) => i.report_id === report.id);
  return { report, items };
}

export async function updatePartnerReportStatus(
  reportId: string,
  newStatus: PartnerReportStatus,
  actor: string = 'Admin'
): Promise<PartnerReport> {
  if (isSupabaseConfigured && supabaseAdmin) {
    const updates: Record<string, unknown> = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    };
    if (newStatus === 'SENT') updates.sent_at = new Date().toISOString();
    if (newStatus === 'CONFIRMED') updates.confirmed_at = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from('partner_reports')
      .update(updates)
      .eq('id', reportId)
      .select('*, partners(name)')
      .single();
    if (error) throw new Error(`ไม่สามารถอัปเดตสถานะรายงานได้: ${error.message}`);

    return {
      ...data,
      partner_name: data.partners?.name || '',
      total_orders: Number(data.total_orders),
      total_baskets: Number(data.total_baskets),
      total_commission: Number(data.total_commission),
    };
  }

  const db = ensureDbFile();
  const report = db.partner_reports.find((r) => r.id === reportId);
  if (!report) throw new Error('Report not found');

  const oldStatus = report.status;
  report.status = newStatus;
  if (newStatus === 'SENT') {
    report.sent_at = new Date().toISOString();
  } else if (newStatus === 'CONFIRMED') {
    report.confirmed_at = new Date().toISOString();
  }

  db.audit_logs.push({
    id: `audit-${Date.now()}`,
    entity_type: 'REPORT',
    entity_id: report.id,
    action: 'UPDATE_REPORT_STATUS',
    actor,
    old_value: { status: oldStatus },
    new_value: { status: newStatus },
    created_at: new Date().toISOString(),
  });

  saveDbState(db);
  return report;
}

// --------------------------------------------------------------------------
// 7. Payment & Slip Verification
// --------------------------------------------------------------------------
export async function uploadPaymentSlip(orderId: string, slipUrl: string): Promise<Payment> {
  const db = ensureDbFile();
  const order = db.orders.find((o) => o.id === orderId || o.order_id === orderId);
  if (!order) throw new Error('Order not found');

  order.slip_url = slipUrl;
  order.payment_status = 'WAITING_VERIFICATION';
  order.updated_at = new Date().toISOString();

  let payment = db.payments.find((p) => p.order_id === order.id);
  if (!payment) {
    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      order_id: order.id,
      order_code: order.order_id,
      customer_name: order.customer_name,
      customer_phone: order.customer_phone,
      amount: order.total_amount,
      payment_method: 'PROMPTPAY',
      status: 'WAITING_VERIFICATION',
      slip_url: slipUrl,
      created_at: new Date().toISOString(),
    };
    db.payments.unshift(newPayment);
    payment = newPayment;
  } else {
    payment.slip_url = slipUrl;
    payment.status = 'WAITING_VERIFICATION';
  }

  saveDbState(db);

  sendTelegramNotification({
    event: 'SLIP_UPLOADED',
    orderId: order.order_id,
    customerName: order.customer_name,
    amount: order.total_amount,
  }).catch(console.error);

  return payment;
}

export async function verifyPayment(
  paymentId: string,
  newStatus: 'PAID' | 'WRONG_AMOUNT' | 'REFUNDED',
  actor: string = 'Admin',
  rejectReason?: string
): Promise<Payment> {
  const db = ensureDbFile();
  const payment = db.payments.find((p) => p.id === paymentId);
  if (!payment) throw new Error('Payment not found');

  payment.status = newStatus;
  payment.verified_at = new Date().toISOString();
  payment.verified_by = actor;
  payment.reject_reason = rejectReason;

  const order = db.orders.find((o) => o.id === payment.order_id);
  if (order) {
    order.payment_status = newStatus;
    if (newStatus === 'PAID') {
      if (order.status === 'NEW') {
        order.status = 'CONFIRMED';
      }
      sendTelegramNotification({
        event: 'PAYMENT_CONFIRMED',
        orderId: order.order_id,
        customerName: order.customer_name,
        amount: payment.amount,
      }).catch(console.error);
    } else if (newStatus === 'WRONG_AMOUNT') {
      sendTelegramNotification({
        event: 'WRONG_AMOUNT',
        orderId: order.order_id,
        customerName: order.customer_name,
        phone: order.customer_phone,
        reason: rejectReason,
      }).catch(console.error);
    }
  }

  db.audit_logs.push({
    id: `audit-${Date.now()}`,
    entity_type: 'PAYMENT',
    entity_id: payment.id,
    action: 'VERIFY_PAYMENT',
    actor,
    new_value: { status: newStatus, reject_reason: rejectReason },
    created_at: new Date().toISOString(),
  });

  saveDbState(db);
  return payment;
}

export async function getPayments(): Promise<Payment[]> {
  const db = ensureDbFile();
  return db.payments;
}

// --------------------------------------------------------------------------
// 8. Finance, Expenses & Accounting Summary
// --------------------------------------------------------------------------
export async function getExpenses(): Promise<Expense[]> {
  const db = ensureDbFile();
  return db.expenses;
}

export async function addExpense(expense: Omit<Expense, 'id' | 'created_at'>): Promise<Expense> {
  const db = ensureDbFile();
  const newExp: Expense = {
    ...expense,
    id: `exp-${Date.now()}`,
    created_at: new Date().toISOString(),
  };
  db.expenses.unshift(newExp);
  saveDbState(db);
  return newExp;
}

export async function getFinancialSummary() {
  const db = ensureDbFile();
  const orders = db.orders;

  const totalOrders = orders.length;
  const completedOrders = orders.filter((o) => o.status === 'COMPLETED').length;
  const pendingOrders = orders.filter((o) => o.status === 'NEW' || o.status === 'CONFIRMED').length;
  const activeOrders = orders.filter((o) => ['PICKED_UP', 'SENT_TO_PARTNER', 'WASHING', 'READY', 'DELIVERING'].includes(o.status)).length;

  const todayStr = new Date().toISOString().split('T')[0];

  // Revenue from paid/confirmed delivery fees
  let totalRevenue = 0;
  let todayRevenue = 0;

  for (const o of orders) {
    if (o.status !== 'CANCELLED') {
      totalRevenue += o.delivery_fee;
      if (o.created_at.startsWith(todayStr)) {
        todayRevenue += o.delivery_fee;
      }
    }
  }

  // Expenses: Partner commissions + other costs
  let totalExpenses = 0;
  let partnerCommissionExpense = 0;

  for (const exp of db.expenses) {
    totalExpenses += exp.amount;
    if (exp.category === 'PARTNER_COMMISSION') {
      partnerCommissionExpense += exp.amount;
    }
  }

  const grossProfit = totalRevenue - totalExpenses;

  return {
    totalOrders,
    completedOrders,
    pendingOrders,
    activeOrders,
    todayRevenue,
    totalRevenue,
    totalExpenses,
    partnerCommissionExpense,
    grossProfit,
  };
}

export async function getAuditLogs(): Promise<AuditLog[]> {
  const db = ensureDbFile();
  return db.audit_logs.slice(0, 100);
}
