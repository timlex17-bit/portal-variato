# Portal Dr. Variato da Costa — Backend Setup

## Stack
- **Frontend/Backend**: Next.js 14 (App Router)
- **Database + Auth + Storage**: Supabase
- **Email (OTP)**: Resend
- **Deploy**: Vercel

---

## Setup — Pasu husi Pasu

### 1. Kria Projetu Supabase
1. Ba https://supabase.com → New Project
2. Naran: `portal-variato`
3. Password: pilih yang kuat, simpan
4. Region: `Southeast Asia (Singapore)` — terdekat dari Timor-Leste

### 2. Jalankan SQL Schema
1. Supabase Dashboard → SQL Editor → New Query
2. Copy-paste isi `supabase/migrations/001_schema.sql`
3. Klik **Run**

### 3. Setup Supabase Storage
```sql
-- Jalankan di SQL Editor
INSERT INTO storage.buckets (id, name, public) VALUES ('dokumentu', 'dokumentu', false);

-- Storage policy: user upload file sendiri
CREATE POLICY "Users upload own files" ON storage.objects
  FOR INSERT WITH CHECK (auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users read own files" ON storage.objects
  FOR SELECT USING (auth.uid()::text = (storage.foldername(name))[1]
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('advogadu','admin')));
```

### 4. Buat Demo Users
- Supabase Dashboard → Authentication → Users → Add User
- Email: `variato@dacosta.tl` | Password: `Admin123!`
- Email: `kliente@demo.tl`    | Password: `Demo123!`
- Ambil UUID masing-masing dari tabel users

### 5. Seed Data
1. Buka `supabase/seed/001_seed.sql`
2. Ganti `PASTE-VARIATO-UUID-HERE` dan `PASTE-KLIENTE-UUID-HERE`
3. Jalankan di SQL Editor

### 6. Setup Next.js
```bash
# Clone / copy project
cd portal-variato

# Install dependencies
npm install

# Copy env file
cp .env.example .env.local
# Edit .env.local dengan nilai dari Supabase Dashboard

# Run development
npm run dev
```

### 7. Setup Resend (Email OTP)
1. Daftar di https://resend.com (gratis 3000 email/bulan)
2. Add domain `dacosta.tl` (atau pakai resend test domain untuk dev)
3. Buat API key → paste ke `.env.local`

### 8. Deploy ke Vercel
```bash
npm install -g vercel
vercel

# Set environment variables di Vercel Dashboard
# Settings → Environment Variables → tambah semua dari .env.local
```

---

## Struktur Folder

```
portal-variato/
├── supabase/
│   ├── migrations/
│   │   └── 001_schema.sql       ← Schema database lengkap
│   └── seed/
│       └── 001_seed.sql         ← Data demo
│
├── src/
│   ├── app/
│   │   ├── auth/                ← Login, Register, 2FA, Reset
│   │   ├── portal/              ← Semua halaman portal (protected)
│   │   │   ├── dashboard/
│   │   │   ├── kazu/
│   │   │   ├── dokumentu/
│   │   │   ├── kalender/
│   │   │   ├── chat/
│   │   │   ├── video-call/
│   │   │   ├── invoice/
│   │   │   ├── export/
│   │   │   ├── surat/
│   │   │   ├── assinatura/
│   │   │   ├── nota/
│   │   │   ├── audit/
│   │   │   ├── ajuda/
│   │   │   ├── admin/
│   │   │   └── perfil/
│   │   └── api/                 ← API routes (REST endpoints)
│   │       ├── auth/send-otp/   ← POST: kirim OTP, PUT: verifikasi
│   │       ├── kazu/            ← GET/POST kazu
│   │       ├── dokumentu/       ← GET/DELETE dokumen
│   │       ├── chat/            ← GET messages
│   │       ├── invoice/         ← GET/POST/PATCH invoice
│   │       ├── upload/          ← POST file upload
│   │       ├── rating/          ← POST rating
│   │       ├── audit/           ← GET audit log
│   │       └── export/          ← GET CSV/PDF export
│   │
│   ├── components/
│   │   ├── ui/                  ← Button, Input, Modal, Badge, dll.
│   │   ├── layout/              ← Sidebar, Topbar, Layout wrapper
│   │   ├── dashboard/           ← KPI cards, charts
│   │   ├── kazu/                ← KazuCard, KazuDetail, StepTracker
│   │   ├── dokumentu/           ← DocList, UploadZone
│   │   ├── chat/                ← ChatWindow, MessageBubble
│   │   └── invoice/             ← InvoiceCard, InvoicePrint
│   │
│   ├── lib/
│   │   ├── supabase.ts          ← Client & server Supabase instances
│   │   ├── auth.ts              ← Auth helpers, requireAuth(), logAudit()
│   │   └── utils.ts             ← Format currency, date, file size, dll.
│   │
│   ├── hooks/
│   │   ├── useKazu.ts           ← SWR/React Query hook untuk kazu
│   │   ├── useChat.ts           ← Realtime chat hook
│   │   ├── useNotifications.ts  ← Realtime notifications hook
│   │   └── useProfile.ts        ← Current user profile hook
│   │
│   └── types/
│       └── database.ts          ← TypeScript types untuk semua tabel
│
├── public/
│   └── templates/               ← Surat template files
│
├── package.json
├── .env.example                 ← Template environment variables
└── README.md
```

---

## API Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/auth/send-otp` | Kirim OTP ke email |
| PUT  | `/api/auth/send-otp` | Verifikasi OTP |
| GET  | `/api/kazu` | List kazu (filter: status, search) |
| POST | `/api/kazu` | Buat kazu baru |
| GET  | `/api/kazu/[id]` | Detail kazu |
| PATCH| `/api/kazu/[id]` | Update kazu |
| POST | `/api/upload` | Upload dokumen |
| GET  | `/api/dokumentu` | List dokumen |
| GET  | `/api/chat` | List konversa |
| GET  | `/api/invoice` | List invoice |
| POST | `/api/invoice` | Buat invoice |
| POST | `/api/rating` | Submit rating |
| GET  | `/api/audit` | Log aktivitas |
| GET  | `/api/export` | Export CSV/PDF |

---

## Realtime Features (Supabase Realtime)

```typescript
// Chat — subscribe to new messages
supabase.channel('chat')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'mensagem',
    filter: `konversa_id=eq.${konversaId}`
  }, (payload) => {
    // Handle new message
  })
  .subscribe()

// Notifications — realtime badge update
supabase.channel('notif')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'notifikasaun',
    filter: `profile_id=eq.${userId}`
  }, handleNewNotification)
  .subscribe()
```

---

## Biaya Estimasi (USD/bulan)

| Service | Plan | Biaya |
|---------|------|-------|
| Supabase | Free (500MB DB, 1GB storage) | $0 |
| Vercel | Hobby | $0 |
| Resend | Free (3000 email/bulan) | $0 |
| **Total awal** | | **$0** |
| Supabase Pro (jika perlu scale) | $25/bulan | $25 |
