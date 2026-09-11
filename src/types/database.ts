// ============================================================
// AUTO-GENERATED TYPES — matches Supabase schema
// Run: npx supabase gen types typescript --project-id YOUR_ID > src/types/database.ts
// ============================================================

export type UserRole = 'kliente' | 'advogadu' | 'admin'
export type KazuStatus = 'pendente' | 'ativu' | 'rezolvidu' | 'kansela'
export type KazuTipo = 'Litigasaun' | 'Propriedade/Rai' | 'Hukum Traballu' | 'Hukum Família' | 'Hukum Negósiu' | 'Mediasaun' | 'Arbitrájin' | 'Outro'
export type InvoiceStatus = 'draft' | 'pendente' | 'pagu' | 'kansela' | 'vensidu'
export type EventuTipo = 'audiensia' | 'konsultasaun' | 'video_call' | 'mediasaun' | 'deadline' | 'outro'
export type NotaTipo = 'gold' | 'blue' | 'green' | 'red'
export type SuratTipo = 'kuasa' | 'somatoriu' | 'nda' | 'mediasaun' | 'rekursu' | 'outro'
export type Lang = 'TET' | 'PT' | 'EN'

export interface Profile {
  id: string
  full_name: string
  email: string
  phone: string | null
  role: UserRole
  avatar_url: string | null
  two_fa_enabled: boolean
  lang: Lang
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Kazu {
  id: string
  kazu_number: string
  titulo: string
  tipo: KazuTipo
  status: KazuStatus
  urgency: 'normal' | 'urjente' | 'kritiku'
  description: string | null
  progress: number
  kliente_id: string | null
  advogadu_id: string | null
  opposing_party: string | null
  start_date: string
  expected_end: string | null
  closed_at: string | null
  created_at: string
  updated_at: string
  // Joined fields
  kliente?: Profile
  advogadu?: Profile
  timeline?: KazuTimeline[]
}

export interface KazuTimeline {
  id: string
  kazu_id: string
  step_name: string
  step_order: number
  status: 'pending' | 'active' | 'done'
  notes: string | null
  done_at: string | null
  created_at: string
}

export interface Dokumentu {
  id: string
  kazu_id: string | null
  uploaded_by: string | null
  file_name: string
  file_type: string
  file_size: number | null
  storage_path: string
  storage_bucket: string
  is_signed: boolean
  signed_by: string | null
  signed_at: string | null
  signature_hash: string | null
  description: string | null
  is_confidential: boolean
  created_at: string
  // Joined
  kazu?: Pick<Kazu, 'id' | 'kazu_number' | 'titulo'>
  uploader?: Pick<Profile, 'id' | 'full_name'>
}

export interface Eventu {
  id: string
  kazu_id: string | null
  created_by: string | null
  titulo: string
  tipo: EventuTipo
  description: string | null
  location: string | null
  start_time: string
  end_time: string | null
  is_online: boolean
  meet_link: string | null
  reminder_sent: boolean
  created_at: string
  // Joined
  kazu?: Pick<Kazu, 'id' | 'kazu_number' | 'titulo'>
  participants?: Profile[]
}

export interface Mensagem {
  id: string
  konversa_id: string
  sender_id: string
  content: string
  is_read: boolean
  read_at: string | null
  created_at: string
  // Joined
  sender?: Pick<Profile, 'id' | 'full_name' | 'avatar_url' | 'role'>
}

export interface Konversa {
  id: string
  kazu_id: string | null
  created_at: string
  // Joined
  participants?: Profile[]
  last_message?: Mensagem
  unread_count?: number
}

export interface Notifikasaun {
  id: string
  profile_id: string
  tipo: 'kazu' | 'dokumentu' | 'chat' | 'eventu' | 'invoice' | 'sistema'
  titulo: string
  content: string | null
  is_read: boolean
  link: string | null
  created_at: string
}

export interface Invoice {
  id: string
  invoice_number: string
  kazu_id: string | null
  kliente_id: string | null
  advogadu_id: string | null
  status: InvoiceStatus
  subtotal: number
  tax_rate: number
  tax_amount: number
  total: number
  currency: string
  due_date: string | null
  paid_at: string | null
  payment_method: string | null
  notes: string | null
  created_at: string
  updated_at: string
  // Joined
  items?: InvoiceItem[]
  kazu?: Pick<Kazu, 'id' | 'kazu_number' | 'titulo'>
  kliente?: Pick<Profile, 'id' | 'full_name' | 'email'>
}

export interface InvoiceItem {
  id: string
  invoice_id: string
  description: string
  quantity: number
  unit_price: number
  total: number
  sort_order: number
}

export interface Nota {
  id: string
  kazu_id: string | null
  author_id: string
  titulo: string
  content: string | null
  color: NotaTipo
  is_pinned: boolean
  created_at: string
  updated_at: string
  // Joined
  kazu?: Pick<Kazu, 'id' | 'kazu_number' | 'titulo'>
}

export interface Rating {
  id: string
  kazu_id: string | null
  kliente_id: string
  advogadu_id: string | null
  stars: number
  comment: string | null
  is_public: boolean
  created_at: string
}

export interface Surat {
  id: string
  kazu_id: string | null
  created_by: string | null
  tipo: SuratTipo
  titulo: string
  content: string
  storage_path: string | null
  created_at: string
}

export interface AuditLog {
  id: string
  profile_id: string | null
  action: string
  entity_type: string | null
  entity_id: string | null
  description: string | null
  ip_address: string | null
  metadata: Record<string, unknown>
  created_at: string
}

// ============================================================
// API Response types
// ============================================================
export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  pageSize: number
}

// ============================================================
// Dashboard stats
// ============================================================
export interface DashboardStats {
  kazu_ativu: number
  kazu_pendente: number
  kazu_rezolvidu: number
  audiensia_tuir_mai: number
  dokumentu_total: number
  invoice_pendente_total: number
  invoice_pagu_total: number
  unread_notifications: number
}
