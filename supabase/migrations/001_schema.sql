-- ============================================================
-- PORTAL DR. VARIATO DA COSTA — SUPABASE SCHEMA
-- ============================================================
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. PROFILES (extends Supabase auth.users)
-- ============================================================
CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT NOT NULL,
  email         TEXT NOT NULL,
  phone         TEXT,
  role          TEXT NOT NULL DEFAULT 'kliente' CHECK (role IN ('kliente', 'advogadu', 'admin')),
  avatar_url    TEXT,
  two_fa_enabled BOOLEAN DEFAULT FALSE,
  lang          TEXT DEFAULT 'TET' CHECK (lang IN ('TET', 'PT', 'EN')),
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. KAZU (Cases)
-- ============================================================
CREATE TABLE kazu (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kazu_number   TEXT UNIQUE NOT NULL, -- e.g. KZ-2025-001
  titulo        TEXT NOT NULL,
  tipo          TEXT NOT NULL CHECK (tipo IN (
    'Litigasaun', 'Propriedade/Rai', 'Hukum Traballu',
    'Hukum Família', 'Hukum Negósiu', 'Mediasaun', 'Arbitrájin', 'Outro'
  )),
  status        TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN (
    'pendente', 'ativu', 'rezolvidu', 'kansela'
  )),
  urgency       TEXT DEFAULT 'normal' CHECK (urgency IN ('normal', 'urjente', 'kritiku')),
  description   TEXT,
  progress      INTEGER DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  -- Parties
  kliente_id    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  advogadu_id   UUID REFERENCES profiles(id) ON DELETE SET NULL,
  -- Opposing party
  opposing_party TEXT,
  -- Dates
  start_date    DATE DEFAULT CURRENT_DATE,
  expected_end  DATE,
  closed_at     TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-generate kazu_number
CREATE SEQUENCE kazu_seq START 1;
CREATE OR REPLACE FUNCTION generate_kazu_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.kazu_number := 'KZ-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('kazu_seq')::TEXT, 3, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_kazu_number
  BEFORE INSERT ON kazu
  FOR EACH ROW
  WHEN (NEW.kazu_number IS NULL OR NEW.kazu_number = '')
  EXECUTE FUNCTION generate_kazu_number();

-- ============================================================
-- 3. KAZU TIMELINE (Step tracker)
-- ============================================================
CREATE TABLE kazu_timeline (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kazu_id    UUID NOT NULL REFERENCES kazu(id) ON DELETE CASCADE,
  step_name  TEXT NOT NULL,
  step_order INTEGER NOT NULL,
  status     TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'done')),
  notes      TEXT,
  done_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. DOKUMENTU (Documents)
-- ============================================================
CREATE TABLE dokumentu (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kazu_id       UUID REFERENCES kazu(id) ON DELETE SET NULL,
  uploaded_by   UUID REFERENCES profiles(id) ON DELETE SET NULL,
  file_name     TEXT NOT NULL,
  file_type     TEXT NOT NULL, -- PDF, DOCX, JPG, etc.
  file_size     BIGINT,         -- bytes
  storage_path  TEXT NOT NULL,  -- Supabase Storage path
  storage_bucket TEXT DEFAULT 'dokumentu',
  is_signed     BOOLEAN DEFAULT FALSE,
  signed_by     UUID REFERENCES profiles(id),
  signed_at     TIMESTAMPTZ,
  signature_hash TEXT,          -- SHA-256 of signature
  description   TEXT,
  is_confidential BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 5. ASSINATURA DIJITÁL (Digital Signatures)
-- ============================================================
CREATE TABLE assinatura (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dokumentu_id    UUID NOT NULL REFERENCES dokumentu(id) ON DELETE CASCADE,
  signed_by       UUID NOT NULL REFERENCES profiles(id),
  signature_data  TEXT,          -- base64 canvas data (optional, for record)
  signature_hash  TEXT NOT NULL, -- SHA-256
  ip_address      TEXT,
  user_agent      TEXT,
  signed_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 6. KALENDER / EVENTU
-- ============================================================
CREATE TABLE eventu (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kazu_id     UUID REFERENCES kazu(id) ON DELETE CASCADE,
  created_by  UUID REFERENCES profiles(id),
  titulo      TEXT NOT NULL,
  tipo        TEXT DEFAULT 'outro' CHECK (tipo IN (
    'audiensia', 'konsultasaun', 'video_call', 'mediasaun', 'deadline', 'outro'
  )),
  description TEXT,
  location    TEXT,
  start_time  TIMESTAMPTZ NOT NULL,
  end_time    TIMESTAMPTZ,
  is_online   BOOLEAN DEFAULT FALSE,
  meet_link   TEXT,
  reminder_sent BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Participants
CREATE TABLE eventu_participants (
  eventu_id  UUID REFERENCES eventu(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status     TEXT DEFAULT 'invited' CHECK (status IN ('invited', 'confirmed', 'declined')),
  PRIMARY KEY (eventu_id, profile_id)
);

-- ============================================================
-- 7. CHAT / MENSAGEM
-- ============================================================
CREATE TABLE konversa (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kazu_id    UUID REFERENCES kazu(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE konversa_participants (
  konversa_id UUID REFERENCES konversa(id) ON DELETE CASCADE,
  profile_id  UUID REFERENCES profiles(id) ON DELETE CASCADE,
  PRIMARY KEY (konversa_id, profile_id)
);

CREATE TABLE mensagem (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  konversa_id UUID NOT NULL REFERENCES konversa(id) ON DELETE CASCADE,
  sender_id   UUID NOT NULL REFERENCES profiles(id),
  content     TEXT NOT NULL,
  is_read     BOOLEAN DEFAULT FALSE,
  read_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 8. NOTIFIKASAUN
-- ============================================================
CREATE TABLE notifikasaun (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tipo        TEXT NOT NULL CHECK (tipo IN (
    'kazu', 'dokumentu', 'chat', 'eventu', 'invoice', 'sistema'
  )),
  titulo      TEXT NOT NULL,
  content     TEXT,
  is_read     BOOLEAN DEFAULT FALSE,
  link        TEXT,             -- route to navigate on click
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 9. INVOICE / FATURA
-- ============================================================
CREATE TABLE invoice (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number  TEXT UNIQUE NOT NULL, -- INV-2025-001
  kazu_id         UUID REFERENCES kazu(id) ON DELETE SET NULL,
  kliente_id      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  advogadu_id     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status          TEXT DEFAULT 'pendente' CHECK (status IN (
    'draft', 'pendente', 'pagu', 'kansela', 'vensidu'
  )),
  subtotal        DECIMAL(12,2) DEFAULT 0,
  tax_rate        DECIMAL(5,2) DEFAULT 0,
  tax_amount      DECIMAL(12,2) DEFAULT 0,
  total           DECIMAL(12,2) DEFAULT 0,
  currency        TEXT DEFAULT 'USD',
  due_date        DATE,
  paid_at         TIMESTAMPTZ,
  payment_method  TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE SEQUENCE invoice_seq START 1;
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.invoice_number := 'INV-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('invoice_seq')::TEXT, 3, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_invoice_number
  BEFORE INSERT ON invoice
  FOR EACH ROW
  WHEN (NEW.invoice_number IS NULL OR NEW.invoice_number = '')
  EXECUTE FUNCTION generate_invoice_number();

-- Invoice line items
CREATE TABLE invoice_item (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id  UUID NOT NULL REFERENCES invoice(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity    DECIMAL(8,2) DEFAULT 1,
  unit_price  DECIMAL(12,2) NOT NULL,
  total       DECIMAL(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  sort_order  INTEGER DEFAULT 0
);

-- ============================================================
-- 10. NOTA
-- ============================================================
CREATE TABLE nota (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kazu_id    UUID REFERENCES kazu(id) ON DELETE CASCADE,
  author_id  UUID NOT NULL REFERENCES profiles(id),
  titulo     TEXT NOT NULL,
  content    TEXT,
  color      TEXT DEFAULT 'gold' CHECK (color IN ('gold', 'blue', 'green', 'red')),
  is_pinned  BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 11. RATING & REVIEW
-- ============================================================
CREATE TABLE rating (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kazu_id     UUID REFERENCES kazu(id) ON DELETE SET NULL,
  kliente_id  UUID NOT NULL REFERENCES profiles(id),
  advogadu_id UUID REFERENCES profiles(id),
  stars       INTEGER NOT NULL CHECK (stars BETWEEN 1 AND 5),
  comment     TEXT,
  is_public   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 12. SURAT JURÍDIKU (Generated Letters)
-- ============================================================
CREATE TABLE surat (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kazu_id     UUID REFERENCES kazu(id) ON DELETE SET NULL,
  created_by  UUID REFERENCES profiles(id),
  tipo        TEXT NOT NULL CHECK (tipo IN (
    'kuasa', 'somatoriu', 'nda', 'mediasaun', 'rekursu', 'outro'
  )),
  titulo      TEXT NOT NULL,
  content     TEXT NOT NULL,   -- generated letter content
  storage_path TEXT,           -- if saved as PDF
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 13. AUDIT LOG
-- ============================================================
CREATE TABLE audit_log (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id  UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,   -- 'login', 'upload', 'payment', 'sign', etc.
  entity_type TEXT,            -- 'kazu', 'dokumentu', 'invoice', etc.
  entity_id   UUID,
  description TEXT,
  ip_address  TEXT,
  user_agent  TEXT,
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 14. TWO FACTOR AUTH OTP
-- ============================================================
CREATE TABLE otp_codes (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  code       TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '10 minutes'),
  used       BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES (performance)
-- ============================================================
CREATE INDEX idx_kazu_kliente     ON kazu(kliente_id);
CREATE INDEX idx_kazu_advogadu    ON kazu(advogadu_id);
CREATE INDEX idx_kazu_status      ON kazu(status);
CREATE INDEX idx_dokumentu_kazu   ON dokumentu(kazu_id);
CREATE INDEX idx_mensagem_konversa ON mensagem(konversa_id);
CREATE INDEX idx_mensagem_created  ON mensagem(created_at DESC);
CREATE INDEX idx_notif_profile     ON notifikasaun(profile_id, is_read);
CREATE INDEX idx_invoice_kliente   ON invoice(kliente_id);
CREATE INDEX idx_invoice_status    ON invoice(status);
CREATE INDEX idx_audit_profile     ON audit_log(profile_id);
CREATE INDEX idx_audit_created     ON audit_log(created_at DESC);
CREATE INDEX idx_otp_profile       ON otp_codes(profile_id, used);

-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated  BEFORE UPDATE ON profiles  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_kazu_updated      BEFORE UPDATE ON kazu      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_invoice_updated   BEFORE UPDATE ON invoice   FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_nota_updated      BEFORE UPDATE ON nota      FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE kazu         ENABLE ROW LEVEL SECURITY;
ALTER TABLE dokumentu    ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensagem     ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifikasaun ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice      ENABLE ROW LEVEL SECURITY;
ALTER TABLE nota         ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log    ENABLE ROW LEVEL SECURITY;
ALTER TABLE rating       ENABLE ROW LEVEL SECURITY;
ALTER TABLE surat        ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventu       ENABLE ROW LEVEL SECURITY;

-- Helper: get current user role
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- PROFILES: user sees own, admin sees all
CREATE POLICY "profiles_select" ON profiles FOR SELECT
  USING (id = auth.uid() OR current_user_role() IN ('advogadu', 'admin'));

CREATE POLICY "profiles_update" ON profiles FOR UPDATE
  USING (id = auth.uid());

-- KAZU: kliente sees own cases, advogadu sees all
CREATE POLICY "kazu_select" ON kazu FOR SELECT
  USING (kliente_id = auth.uid() OR current_user_role() IN ('advogadu', 'admin'));

CREATE POLICY "kazu_insert" ON kazu FOR INSERT
  WITH CHECK (current_user_role() IN ('advogadu', 'admin'));

CREATE POLICY "kazu_update" ON kazu FOR UPDATE
  USING (current_user_role() IN ('advogadu', 'admin'));

-- DOKUMENTU: kliente sees own, advogadu sees all
CREATE POLICY "dokumentu_select" ON dokumentu FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM kazu WHERE id = kazu_id AND kliente_id = auth.uid())
    OR current_user_role() IN ('advogadu', 'admin')
  );

CREATE POLICY "dokumentu_insert" ON dokumentu FOR INSERT
  WITH CHECK (uploaded_by = auth.uid());

-- MENSAGEM: only participants see messages
CREATE POLICY "mensagem_select" ON mensagem FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM konversa_participants
      WHERE konversa_id = mensagem.konversa_id AND profile_id = auth.uid()
    )
  );

CREATE POLICY "mensagem_insert" ON mensagem FOR INSERT
  WITH CHECK (sender_id = auth.uid());

-- NOTIFIKASAUN: user sees own only
CREATE POLICY "notif_select" ON notifikasaun FOR SELECT
  USING (profile_id = auth.uid());

CREATE POLICY "notif_update" ON notifikasaun FOR UPDATE
  USING (profile_id = auth.uid());

-- INVOICE: kliente sees own, advogadu sees all
CREATE POLICY "invoice_select" ON invoice FOR SELECT
  USING (kliente_id = auth.uid() OR current_user_role() IN ('advogadu', 'admin'));

-- NOTA: author sees own, advogadu sees all
CREATE POLICY "nota_select" ON nota FOR SELECT
  USING (author_id = auth.uid() OR current_user_role() IN ('advogadu', 'admin'));

CREATE POLICY "nota_insert" ON nota FOR INSERT
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "nota_delete" ON nota FOR DELETE
  USING (author_id = auth.uid() OR current_user_role() = 'admin');

-- AUDIT: user sees own, admin sees all
CREATE POLICY "audit_select" ON audit_log FOR SELECT
  USING (profile_id = auth.uid() OR current_user_role() = 'admin');

-- RATING: public read, kliente writes own
CREATE POLICY "rating_select" ON rating FOR SELECT USING (is_public = TRUE OR kliente_id = auth.uid());
CREATE POLICY "rating_insert" ON rating FOR INSERT WITH CHECK (kliente_id = auth.uid());

-- SURAT: kazu participants and advogadu
CREATE POLICY "surat_select" ON surat FOR SELECT
  USING (created_by = auth.uid() OR current_user_role() IN ('advogadu', 'admin'));

-- EVENTU: participants and advogadu
CREATE POLICY "eventu_select" ON eventu FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM eventu_participants WHERE eventu_id = eventu.id AND profile_id = auth.uid())
    OR current_user_role() IN ('advogadu', 'admin')
  );
