-- Seed initial delivery fee settings (หอใน: 40 บาท, หอนอก: 35 บาท)
INSERT INTO delivery_fee_settings (dorm_type, dorm_type_label, fee_amount, is_active)
VALUES
    ('INSIDE', 'หอใน (มจพ. ปราจีนบุรี)', 40.00, TRUE),
    ('OUTSIDE', 'หอนอก (รอบมหาวิทยาลัย)', 35.00, TRUE)
ON CONFLICT (dorm_type) DO UPDATE
SET fee_amount = EXCLUDED.fee_amount, dorm_type_label = EXCLUDED.dorm_type_label;

-- Seed default app settings
INSERT INTO app_settings (key, value, description)
VALUES
    ('general', '{"brand_name": "SUK PA? (ซักป่ะ?)", "tagline": "บริการรับ-ส่งผ้าสำหรับนักศึกษา มจพ. ปราจีนบุรี", "phone": "089-123-4567", "line_id": "@044cmpog", "service_hours": "09:00 - 21:00 น."}', 'ข้อมูลทั่วไปของระบบ'),
    ('payment', '{"promptpay_no": "0661323388", "account_name": "ธนกร ชูวงศ์วาลย์", "bank_name": "พร้อมเพย์ (PromptPay)"}', 'ข้อมูลการชำระเงิน พร้อมเพย์'),
    ('dormitories', '{"inside": ["หอพักหญิง 1", "หอพักหญิง 2", "หอพักชาย 1", "หอพักอาจารย์และบุคลากร"], "outside_popular": ["หอพักสุขสบาย", "หอพักทวีทรัพย์", "หอพักพงษ์เพชร", "หอบ้านสวน", "หอพักธนภัทร", "หอพักอื่นๆ"]}', 'รายชื่อหอพักแนะนำ')
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value;

-- Seed initial partner shop
INSERT INTO partners (name, owner_name, phone, address, notes, commission_rate, is_active)
VALUES
    ('ร้านซักอบฟองสบู่ (สาขาหน้า มจพ.)', 'ป้าสมศรี รักสะอาด', '081-987-6543', '123 หมู่ 6 ต.เนินหอม อ.เมืองปราจีนบุรี จ.ปราจีนบุรี 25230', 'พาร์ทเนอร์หลัก มีเครื่องซัก 10 เครื่อง อบ 6 เครื่อง', 5.00, TRUE),
    ('ร้านโมเดิร์นคลีน ลอนดรี้', 'คุณเอกชัย', '086-555-4321', '88 ต.เนินหอม อ.เมืองปราจีนบุรี', 'พาร์ทเนอร์สำรอง รับงานด่วน', 5.00, TRUE)
ON CONFLICT DO NOTHING;
