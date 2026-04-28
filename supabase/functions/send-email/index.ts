// supabase/functions/send-email/index.ts
// Deploy with: supabase functions deploy send-email
// Set secret: supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxx

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const FROM_EMAIL = 'Putt N Glow <noreply@scores.thrillzone.co.nz>'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, subject, html, photos } = await req.json()

    if (!to || !subject || !html) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: 'Email service not configured. Set RESEND_API_KEY.' }), {
        status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Build attachments from photo URLs
    const attachments = []
    if (photos && photos.length > 0) {
      for (let i = 0; i < Math.min(photos.length, 10); i++) {
        try {
          const photoUrl = photos[i]
          if (!photoUrl || photoUrl.startsWith('blob:')) continue
          const photoRes = await fetch(photoUrl)
          if (!photoRes.ok) continue
          const photoBlob = await photoRes.arrayBuffer()
          const base64 = btoa(String.fromCharCode(...new Uint8Array(photoBlob)))
          attachments.push({
            filename: `memory-${i + 1}.jpg`,
            content: base64,
            type: 'image/jpeg',
          })
        } catch (e) {
          console.error(`Failed to attach photo ${i}:`, e)
        }
      }
    }

    const emailPayload: any = {
      from: FROM_EMAIL,
      to: [to],
      subject,
      html,
    }

    if (attachments.length > 0) {
      emailPayload.attachments = attachments
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    })

    const data = await res.json()

    if (!res.ok) {
      console.error('Resend error:', data)
      return new Response(JSON.stringify({ error: data.message || 'Email failed' }), {
        status: res.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ success: true, id: data.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (err) {
    console.error('Edge function error:', err)
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})