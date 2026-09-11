import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { logAudit } from '@/lib/auth'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['application/pdf', 'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg', 'image/png', 'image/webp']

// POST /api/upload — upload document to Supabase Storage
export async function POST(req: NextRequest) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const kazuId = formData.get('kazu_id') as string | null
  const description = formData.get('description') as string | null

  if (!file) return NextResponse.json({ error: 'Laiha file' }, { status: 400 })
  if (file.size > MAX_FILE_SIZE) return NextResponse.json({ error: 'File boot liu (max 10MB)' }, { status: 400 })
  if (!ALLOWED_TYPES.includes(file.type)) return NextResponse.json({ error: 'Tipu file la suporta' }, { status: 400 })

  // Upload to Supabase Storage
  const ext = file.name.split('.').pop()
  const storagePath = `${user.id}/${kazuId || 'general'}/${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('dokumentu')
    .upload(storagePath, file, { contentType: file.type, upsert: false })

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

  // Save metadata to database
  const fileType = ext?.toUpperCase() || 'FILE'
  const { data, error } = await supabase
    .from('dokumentu')
    .insert({
      kazu_id: kazuId || null,
      uploaded_by: user.id,
      file_name: file.name,
      file_type: fileType,
      file_size: file.size,
      storage_path: storagePath,
      description: description || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await logAudit(user.id, 'upload', `Dokumentu karregadu: ${file.name}`, 'dokumentu', data.id)
  return NextResponse.json({ data }, { status: 201 })
}
