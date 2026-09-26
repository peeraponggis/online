-- 0002_seed_settings.sql
-- ค่าเริ่มต้นของตั้งค่าเว็บ (ปลอดภัยต่อการรันซ้ำ)

insert into public.settings (key, value) values
  ('bank', '{
    "name": "ชื่อบริษัท จำกัด",
    "account": "123-4-56789-012",
    "promptpay": "0123456789"
  }'::jsonb),
  ('site', '{
    "headline": "เรียนรู้ทุกสกิล อย่างเป็นธรรมชาติ",
    "subline": "คอร์สออนไลน์คุณภาพจากผู้สอนมืออาชีพ ด้วยธีมธรรมชาติ ให้คุณเรียนรู้อย่างสบายตา",
    "ctaPrimary": "เริ่มต้นเรียนฟรี",
    "ctaSecondary": "ดูแพ็กเกจ",
    "maintenance": false
  }'::jsonb)
on conflict (key) do nothing;
