-- ============================================================
-- SEED DATA — untuk development/testing
-- Jalankan SETELAH membuat user di Supabase Auth Dashboard
-- Ganti UUID sesuai user yang dibuat
-- ============================================================

-- Insert demo profiles (UUID harus match dengan auth.users)
-- Buat user dulu di: Supabase Dashboard > Authentication > Users > Add user
-- Email: variato@dacosta.tl | pass: Admin123!
-- Email: kliente@demo.tl    | pass: Demo123!

-- Setelah buat user, ambil UUID mereka dan paste di bawah:
DO $$
DECLARE
  v_variato_id UUID := 'PASTE-VARIATO-UUID-HERE';
  v_kliente_id UUID := 'PASTE-KLIENTE-UUID-HERE';
  v_kazu1_id   UUID := uuid_generate_v4();
  v_kazu2_id   UUID := uuid_generate_v4();
  v_kazu3_id   UUID := uuid_generate_v4();
  v_konv_id    UUID := uuid_generate_v4();
BEGIN

-- Profiles
INSERT INTO profiles (id, full_name, email, phone, role, two_fa_enabled) VALUES
  (v_variato_id, 'Dr. Variato da Costa', 'variato@dacosta.tl', '+670 7700-1234', 'advogadu', true),
  (v_kliente_id, 'Kliente Demo',         'kliente@demo.tl',   '+670 7700-0000', 'kliente',  false);

-- Kazu
INSERT INTO kazu (id, kazu_number, titulo, tipo, status, progress, description, kliente_id, advogadu_id, start_date) VALUES
  (v_kazu1_id, 'KZ-2025-001', 'Disputas Rai Familia',  'Propriedade/Rai',  'ativu',    60, 'Disputa posse rai entre familia iha Liquica.', v_kliente_id, v_variato_id, '2025-01-10'),
  (v_kazu2_id, 'KZ-2025-002', 'Kontratu Traballu',     'Hukum Traballu',   'pendente', 25, 'Reklamasaun demisaun ilejitima.', v_kliente_id, v_variato_id, '2025-01-05'),
  (v_kazu3_id, 'KZ-2025-003', 'Negosius Komersial',    'Hukum Negosiu',    'ativu',    40, 'Disputa kontrato fornecedor.', v_kliente_id, v_variato_id, '2025-01-01');

-- Kazu Timeline steps
INSERT INTO kazu_timeline (kazu_id, step_name, step_order, status) VALUES
  (v_kazu1_id, 'Konsultasaun', 1, 'done'),
  (v_kazu1_id, 'Prepara Kazu', 2, 'done'),
  (v_kazu1_id, 'Dosie Kompletu', 3, 'done'),
  (v_kazu1_id, 'Audiensia', 4, 'active'),
  (v_kazu1_id, 'Desizaun', 5, 'pending');

-- Eventu
INSERT INTO eventu (kazu_id, created_by, titulo, tipo, start_time, end_time, location, is_online) VALUES
  (v_kazu1_id, v_variato_id, 'Audiensia Tribunal', 'audiensia', '2025-01-25 09:00+09', '2025-01-25 11:00+09', 'Tribunal Distrital Dili', false),
  (v_kazu2_id, v_variato_id, 'Video Call Konsultasaun', 'video_call', '2025-01-28 10:00+09', '2025-01-28 11:00+09', NULL, true),
  (v_kazu3_id, v_variato_id, 'Seksaun Mediasaun', 'mediasaun', '2025-01-30 14:00+09', '2025-01-30 16:00+09', 'Eskritorio Dr. Variato', false);

-- Chat
INSERT INTO konversa (id) VALUES (v_konv_id);
INSERT INTO konversa_participants (konversa_id, profile_id) VALUES
  (v_konv_id, v_variato_id),
  (v_konv_id, v_kliente_id);

INSERT INTO mensagem (konversa_id, sender_id, content, created_at) VALUES
  (v_konv_id, v_variato_id, 'Bondia! Oinsá hau bele ajuda ita ohin?', NOW() - INTERVAL '2 hours'),
  (v_konv_id, v_kliente_id, 'Hau hakarak hatene kona-ba progresu kazu rai hau nian.', NOW() - INTERVAL '1 hour 55 minutes'),
  (v_konv_id, v_variato_id, 'Kazu KZ-2025-001 iha progresu diak. Audiensia tuir mai 25 Janeiro.', NOW() - INTERVAL '1 hour 53 minutes');

-- Invoice
INSERT INTO invoice (kazu_id, kliente_id, advogadu_id, status, subtotal, total, due_date) VALUES
  (v_kazu1_id, v_kliente_id, v_variato_id, 'pagu',    800.00, 800.00, '2025-01-10'),
  (v_kazu2_id, v_kliente_id, v_variato_id, 'pagu',    200.00, 200.00, '2025-01-15'),
  (v_kazu1_id, v_kliente_id, v_variato_id, 'pendente', 1400.00, 1400.00, '2025-02-15');

-- Nota
INSERT INTO nota (kazu_id, author_id, titulo, content, color) VALUES
  (v_kazu1_id, v_kliente_id, 'Nota Audiensia 25 Jan', 'Prepara dokumentu A1-A5. Haree provas foto rai.', 'gold'),
  (v_kazu2_id, v_kliente_id, 'Prova Adicional Precisa', 'Simu slip gaji 3 bulan ikus ba prova.', 'blue');

-- Notifikasaun
INSERT INTO notifikasaun (profile_id, tipo, titulo, content, link) VALUES
  (v_kliente_id, 'kazu',     'Kazu KZ-2025-003 ativu ona', 'Kazu foun ita ativu ona', '/portal/kazu'),
  (v_kliente_id, 'eventu',   'Video call agendado ba aban', 'KZ-2025-002 — Online 10:00', '/portal/kalender'),
  (v_kliente_id, 'invoice',  'Fatura INV-2025-008 pagu', 'Obrigadu pagamentu!', '/portal/invoice');

-- Audit log
INSERT INTO audit_log (profile_id, action, entity_type, description) VALUES
  (v_kliente_id, 'login',  NULL,       'Login suksesu — kliente@demo.tl'),
  (v_kliente_id, 'upload', 'dokumentu','Kontrato_Traballu_2025.pdf karregadu'),
  (v_kliente_id, 'payment','invoice',  'INV-2025-007 pagu — $800');

END $$;
