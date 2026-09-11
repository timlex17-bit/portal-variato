import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { generateOTP } from '@/lib/auth'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// POST /api/auth/send-otp
export async function POST(req: NextRequest) {
  const supabase = createServerSupabaseClient()
  const { email } = await req.json()

  // Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, two_fa_enabled')
    .eq('email', email)
    .single()

  if (!profile) return NextResponse.json({ error: 'Email la hetan' }, { status: 404 })

  // Generate OTP
  const code = generateOTP()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 min

  // Save OTP
  await supabase.from('otp_codes').insert({
    profile_id: profile.id,
    code,
    expires_at: expiresAt,
  })

  // Send email via Resend
  await resend.emails.send({
    from: 'Portal Dr. Variato <noreply@dacosta.tl>',
    to: email,
    subject: 'Kódigu Verifikasaun — Portal Dr. Variato da Costa',
    html: `
      <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:32px">
        <h2 style="font-family:Georgia,serif;color:#0B1D3A">Portal Dr. Variato da Costa</h2>
        <p>Bondia ${profile.full_name},</p>
        <p>Ita nia kódigu verifikasaun:</p>
        <div style="background:#F8F6F1;border-radius:10px;padding:24px;text-align:center;margin:24px 0">
          <span style="font-size:2.5rem;font-weight:700;letter-spacing:12px;color:#0B1D3A">${code}</span>
        </div>
        <p style="color:#6B7280;font-size:.875rem">Kódigu ida-ne'e valid durante <strong>10 minutu</strong>.</p>
        <p style="color:#6B7280;font-size:.875rem">Se ita la tama sai, ignora email ida-ne'e.</p>
      </div>
    `,
  })

  return NextResponse.json({ success: true, message: 'OTP harukadu' })
}

// POST /api/auth/verify-otp
export async function PUT(req: NextRequest) {
  const supabase = createServerSupabaseClient()
  const { email, code } = await req.json()

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single()

  if (!profile) return NextResponse.json({ error: 'Profil la hetan' }, { status: 404 })

  const { data: otp } = await supabase
    .from('otp_codes')
    .select('*')
    .eq('profile_id', profile.id)
    .eq('code', code)
    .eq('used', false)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!otp) return NextResponse.json({ error: 'Kódigu sala ka vensidu' }, { status: 400 })

  // Mark OTP as used
  await supabase.from('otp_codes').update({ used: true }).eq('id', otp.id)

  return NextResponse.json({ success: true, message: 'OTP válidu' })
}
