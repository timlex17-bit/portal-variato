import { createServerSupabaseClient } from './supabase'
import { redirect } from 'next/navigation'
import type { Profile } from '@/types/database'

// Get current session (server-side)
export async function getSession() {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

// Get current user profile (server-side)
export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  return data
}

// Require auth — redirect to login if not logged in
export async function requireAuth() {
  const session = await getSession()
  if (!session) redirect('/auth/login')
  return session
}

// Require specific role
export async function requireRole(role: 'advogadu' | 'admin') {
  const profile = await getCurrentProfile()
  if (!profile || profile.role !== role) redirect('/portal/dashboard')
  return profile
}

// Generate 6-digit OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Log audit event
export async function logAudit(
  profileId: string,
  action: string,
  description: string,
  entityType?: string,
  entityId?: string,
  metadata?: Record<string, unknown>
) {
  const supabase = createServerSupabaseClient()
  await supabase.from('audit_log').insert({
    profile_id: profileId,
    action,
    description,
    entity_type: entityType,
    entity_id: entityId,
    metadata: metadata || {},
  })
}
