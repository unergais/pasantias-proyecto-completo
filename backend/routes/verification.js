// backend/routes/verification.js
import express from 'express'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'
import { sendVerificationEmail } from '../utils/mail.js'
import dotenv from 'dotenv'
dotenv.config()

const router = express.Router()

// Inicializa supabase en backend con SERVICE ROLE KEY (solo en backend)
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

/**
 * generateNumericCode(length)
 * genera un código numérico de 'length' dígitos
 */
function generateNumericCode(length = 6) {
  const buf = crypto.randomBytes(length)
  let code = ''
  for (let i = 0; i < length; i++) code += String(buf[i] % 10)
  return code
}

/**
 * POST /api/send-verification
 * body: { email }
 * - busca el perfil por email
 * - genera código y expiración
 * - actualiza la fila (email_verification_code, code_expires_at)
 * - envía correo
 */
router.post('/send-verification', async (req, res) => {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ error: 'Email requerido' })

    // Buscar perfil
    const { data: profiles, error: findErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .limit(1)

    if (findErr) return res.status(500).json({ error: findErr.message })
    if (!profiles || profiles.length === 0) return res.status(404).json({ error: 'Perfil no encontrado' })

    const profile = profiles[0]
    const code = generateNumericCode(6)
    const expiresAt = new Date(Date.now() + 1000 * 60 * 15).toISOString() // 15 minutos

    // Guardar código y expiración
    const { data: updated, error: updateErr } = await supabase
      .from('profiles')
      .update({ email_verification_code: code, code_expires_at: expiresAt })
      .eq('id', profile.id)
      .select()
      .single()

    if (updateErr) return res.status(500).json({ error: updateErr.message })

    // Enviar correo
    await sendVerificationEmail(email, code)

    return res.json({ ok: true, message: 'Código enviado' })
  } catch (err) {
    console.error('send-verification error', err)
    return res.status(500).json({ error: 'Error interno' })
  }
})

/**
 * POST /api/verify-code
 * body: { email, code }
 * - valida código y expiración
 * - marca email_verified = true y limpia campos
 */
router.post('/verify-code', async (req, res) => {
  try {
    const { email, code } = req.body
    if (!email || !code) return res.status(400).json({ error: 'Email y código son requeridos' })

    const { data: profiles, error: findErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .limit(1)

    if (findErr) return res.status(500).json({ error: findErr.message })
    if (!profiles || profiles.length === 0) return res.status(404).json({ error: 'Perfil no encontrado' })

    const profile = profiles[0]
    const now = new Date()

    if (!profile.email_verification_code || !profile.code_expires_at) {
      return res.status(400).json({ error: 'No hay código pendiente' })
    }

    if (profile.email_verification_code !== String(code)) {
      return res.status(400).json({ error: 'Código incorrecto' })
    }

    if (new Date(profile.code_expires_at) < now) {
      return res.status(400).json({ error: 'Código expirado' })
    }

    const { data: updated, error: updateErr } = await supabase
      .from('profiles')
      .update({ email_verified: true, email_verification_code: null, code_expires_at: null })
      .eq('id', profile.id)
      .select()
      .single()

    if (updateErr) return res.status(500).json({ error: updateErr.message })
    return res.json({ ok: true })
  } catch (err) {
    console.error('verify-code error', err)
    return res.status(500).json({ error: 'Error interno' })
  }
})

export default router
