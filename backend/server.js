// backend/server.js
import express from 'express'
import cors from 'cors'
import verificationRoutes from './routes/verification.js'
import dotenv from 'dotenv'
import nodemailer from 'nodemailer'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

dotenv.config()
const app = express()
app.use(cors())
app.use(express.json())

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
// Nota: usa SERVICE_ROLE_KEY solo en backend (no exponer en frontend)

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD // o usa OAuth2
  }
})

function generateCode(length = 6) {
  const buf = crypto.randomBytes(length)
  // convertir a dígitos: tomar mod 10 de cada byte
  let code = ''
  for (let i = 0; i < length; i++) code += String((buf[i] % 10))
  return code
}

app.post('/api/send-verification', async (req, res) => {
  const { email } = req.body
  if (!email) return res.status(400).json({ error: 'Email requerido' })

  try {
    // Buscar el profile existente (o manejar creación separada)
    const { data: profiles, error: findErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .limit(1)

    if (findErr) return res.status(500).json({ error: findErr.message })
    if (!profiles || profiles.length === 0) return res.status(404).json({ error: 'Perfil no encontrado' })

    const profile = profiles[0]
    const code = generateCode(6)
    const expiresAt = new Date(Date.now() + 1000 * 60 * 15).toISOString() // 15 min

    // Guardar código y expiración en DB
    const { data: updated, error: updateErr } = await supabase
      .from('profiles')
      .update({ email_verification_code: code, code_expires_at: expiresAt })
      .eq('id', profile.id)
      .select()
      .single()

    if (updateErr) return res.status(500).json({ error: updateErr.message })

    // Enviar correo
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Código de verificación - Pasantías UNERG',
      text: `Tu código de verificación es: ${code}. Expira en 15 minutos.`,
      html: `<p>Tu código de verificación es: <b>${code}</b></p><p>Expira en 15 minutos.</p>`
    }

    await transporter.sendMail(mailOptions)
    return res.json({ ok: true, message: 'Código enviado' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Error interno' })
  }
})

app.post('/api/verify-code', async (req, res) => {
  const { email, code } = req.body
  if (!email || !code) return res.status(400).json({ error: 'Email y código son requeridos' })

  try {
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

    // Marcar como verificado y limpiar código
    const { data: updated, error: updateErr } = await supabase
      .from('profiles')
      .update({ email_verified: true, email_verification_code: null, code_expires_at: null })
      .eq('id', profile.id)
      .select()
      .single()

    if (updateErr) return res.status(500).json({ error: updateErr.message })
    return res.json({ ok: true })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Error interno' })
  }
})

// Health endpoint for orchestration checks
app.get('/health', (req, res) => {
  return res.json({ ok: true, service: 'backend', timestamp: new Date().toISOString() })
})

const port = process.env.PORT || 4000
app.listen(port, () => console.log(`Server listening ${port}`))
