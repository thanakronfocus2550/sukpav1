-- ==============================================================================
-- SUK PA? V1 (ซักป่ะ?) Supabase PostgreSQL Complete Production Schema
-- Designed for KMUTNB Prachinburi Campus Laundry Delivery Operations
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. APP SETTINGS & CONFIGURATION
CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by TEXT
);

-- 2. DELIVERY FEE SETTINGS (With Price Snapshot Protection)
CREATE TABLE IF NOT EXISTS delivery_fee_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dorm_type TEXT UNIQUE NOT NULL CHECK (dorm_type IN ('INSIDE', 'OUTSIDE')),
    dorm_type_label TEXT NOT NULL,
    fee_amount NUMERIC(10, 2) NOT NULL CHECK (fee_amount >= 0),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by TEXT
);

-- 3. PARTNERS (Partner Laundry Shops)
CREATE TABLE IF NOT EXISTS partners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT,
    notes TEXT,
    commission_rate NUMERIC(10, 2) DEFAULT 5.00 CHECK (commission_rate >= 0),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CUSTOMERS (Students - No Login Required)
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    dorm_type TEXT NOT NULL CHECK (dorm_type IN ('INSIDE', 'OUTSIDE')),
    dorm_name TEXT NOT NULL,
    room_no TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_order_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);

-- 5. ORDERS
CREATE TYPE order_status_enum AS ENUM (
    'NEW',
    'CONFIRMED',
    'PICKED_UP',
    'SENT_TO_PARTNER',
    'WASHING',
    'READY',
    'DELIVERING',
    'COMPLETED',
    'CANCELLED'
);

CREATE TYPE service_type_enum AS ENUM (
    'WASH',
    'DRY',
    'WASH_AND_DRY'
);

CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id TEXT UNIQUE NOT NULL, -- e.g. SP261122-0001
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    dorm_type TEXT NOT NULL CHECK (dorm_type IN ('INSIDE', 'OUTSIDE')),
    dorm_name TEXT NOT NULL,
    room_no TEXT NOT NULL,
    basket_count INTEGER NOT NULL DEFAULT 1 CHECK (basket_count > 0),
    service_type service_type_enum DEFAULT 'WASH_AND_DRY',
    washer_weight TEXT NOT NULL DEFAULT '9KG',
    wash_program TEXT NOT NULL DEFAULT 'COLD_STANDARD',
    washer_price NUMERIC(10, 2) NOT NULL DEFAULT 40.00,
    drum_wash_hot BOOLEAN DEFAULT FALSE,
    extra_rinse BOOLEAN DEFAULT FALSE,
    dryer_weight TEXT NOT NULL DEFAULT '17KG',
    dryer_price NUMERIC(10, 2) NOT NULL DEFAULT 50.00,
    extra_dry_count INTEGER DEFAULT 0,
    own_detergent BOOLEAN DEFAULT FALSE,
    note TEXT,
    delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 40.00, -- Price Snapshot (หอใน: 40, หอนอก: 35)
    laundry_cost_estimate NUMERIC(10, 2) DEFAULT 0.00,
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 130.00,
    payment_method TEXT NOT NULL DEFAULT 'PROMPTPAY',
    payment_status TEXT NOT NULL DEFAULT 'PENDING',
    slip_url TEXT,
    status order_status_enum NOT NULL DEFAULT 'NEW',
    partner_id UUID REFERENCES partners(id) ON DELETE SET NULL,
    actual_partner_baskets INTEGER DEFAULT 0 CHECK (actual_partner_baskets >= 0),
    partner_commission_rate NUMERIC(10, 2) DEFAULT 5.00,
    partner_commission_total NUMERIC(10, 2) GENERATED ALWAYS AS (actual_partner_baskets * partner_commission_rate) STORED,
    cancelled_reason TEXT,
    picked_up_at TIMESTAMPTZ,
    sent_to_partner_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_orders_order_id ON orders(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- 6. ORDER ITEMS (Optional Itemized Add-ons / Detergents)
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PARTNER BASKET RECORDS (Audit-tracked actual baskets)
CREATE TABLE IF NOT EXISTS partner_basket_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE RESTRICT,
    baskets INTEGER NOT NULL CHECK (baskets >= 0),
    rate_per_basket NUMERIC(10, 2) NOT NULL DEFAULT 5.00,
    total_payout NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    recorded_by TEXT DEFAULT 'Admin',
    recorded_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT
);

-- 8. PARTNER REPORTS (Privacy-guaranteed Partner Summaries)
CREATE TYPE partner_report_status_enum AS ENUM (
    'DRAFT',
    'READY',
    'SENT',
    'CONFIRMED'
);

CREATE TABLE IF NOT EXISTS partner_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_code TEXT UNIQUE NOT NULL, -- e.g. RPT-20261122-01
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE RESTRICT,
    report_date DATE NOT NULL,
    total_orders INTEGER NOT NULL DEFAULT 0,
    total_baskets INTEGER NOT NULL DEFAULT 0,
    total_commission NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    status partner_report_status_enum NOT NULL DEFAULT 'DRAFT',
    notes TEXT,
    created_by TEXT DEFAULT 'Admin',
    sent_at TIMESTAMPTZ,
    confirmed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. PARTNER REPORT ITEMS (Strictly NO student name, phone, or room numbers!)
CREATE TABLE IF NOT EXISTS partner_report_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID NOT NULL REFERENCES partner_reports(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    order_code TEXT NOT NULL,
    baskets INTEGER NOT NULL,
    commission_amount NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. PAYMENTS & SLIPS
CREATE TYPE payment_status_enum AS ENUM (
    'PENDING',
    'WAITING_VERIFICATION',
    'PAID',
    'WRONG_AMOUNT',
    'EXPIRED',
    'REFUNDED'
);

CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
    payment_method TEXT NOT NULL DEFAULT 'PROMPTPAY',
    slip_url TEXT,
    status payment_status_enum NOT NULL DEFAULT 'PENDING',
    reject_reason TEXT,
    verified_at TIMESTAMPTZ,
    verified_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- 11. EXPENSES & ACCOUNTING
CREATE TYPE expense_category_enum AS ENUM (
    'PARTNER_COMMISSION',
    'LAUNDRY_COST',
    'FUEL',
    'PACKAGING',
    'MAINTENANCE',
    'OTHER'
);

CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category expense_category_enum NOT NULL DEFAULT 'OTHER',
    title TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    partner_id UUID REFERENCES partners(id) ON DELETE SET NULL,
    receipt_url TEXT,
    note TEXT,
    created_by TEXT DEFAULT 'Admin',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date);

-- 12. REVENUE RECORDS
CREATE TABLE IF NOT EXISTS revenue_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    category TEXT NOT NULL DEFAULT 'DELIVERY_FEE',
    amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
    record_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type TEXT NOT NULL, -- 'ORDER', 'PARTNER_BASKET', 'PAYMENT', etc.
    entity_id TEXT NOT NULL,
    action TEXT NOT NULL, -- 'UPDATE_STATUS', 'UPDATE_BASKETS', 'VERIFY_PAYMENT'
    actor TEXT NOT NULL DEFAULT 'System/Admin',
    old_value JSONB,
    new_value JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- 14. TELEGRAM NOTIFICATIONS LOG
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel TEXT NOT NULL DEFAULT 'TELEGRAM',
    event_type TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    error_message TEXT,
    metadata JSONB,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_fee_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_basket_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_report_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Public can read fee settings to calculate booking costs
CREATE POLICY "Public fee settings read" ON delivery_fee_settings
    FOR SELECT USING (is_active = TRUE);

-- Public can insert new orders and customers (Booking without login)
CREATE POLICY "Public insert orders" ON orders
    FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Public insert customers" ON customers
    FOR INSERT WITH CHECK (TRUE);

-- Public can read their own order via order_id + phone validation (enforced by API route)
CREATE POLICY "Service role full access on orders" ON orders
    FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- Service role / Admin has full access to all tables
CREATE POLICY "Service role full access delivery_fee_settings" ON delivery_fee_settings FOR ALL USING (TRUE);
CREATE POLICY "Service role full access partners" ON partners FOR ALL USING (TRUE);
CREATE POLICY "Service role full access customers" ON customers FOR ALL USING (TRUE);
CREATE POLICY "Service role full access payments" ON payments FOR ALL USING (TRUE);
CREATE POLICY "Service role full access partner_basket_records" ON partner_basket_records FOR ALL USING (TRUE);
CREATE POLICY "Service role full access partner_reports" ON partner_reports FOR ALL USING (TRUE);
CREATE POLICY "Service role full access partner_report_items" ON partner_report_items FOR ALL USING (TRUE);
CREATE POLICY "Service role full access expenses" ON expenses FOR ALL USING (TRUE);
CREATE POLICY "Service role full access revenue_records" ON revenue_records FOR ALL USING (TRUE);
CREATE POLICY "Service role full access audit_logs" ON audit_logs FOR ALL USING (TRUE);
CREATE POLICY "Service role full access notifications" ON notifications FOR ALL USING (TRUE);
CREATE POLICY "Service role full access app_settings" ON app_settings FOR ALL USING (TRUE);
