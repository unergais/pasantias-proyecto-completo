// backend/utils/mail.js
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config()

// Configura el transporter de nodemailer usando Gmail (App Password o OAuth2 según prefieras)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
})

/**
 * sendVerificationEmail
 * @param {string} to - email destinatario
 * @param {string} code - código de verificación (texto)
 * @returns {Promise}
 */
export async function sendVerificationEmail(to, code) {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to,
    subject: 'Código de verificación - Pasantías UNERG',
    text: `Tu código de verificación es: ${code}. Expira en 15 minutos.`,
    html: `
      <div style="font-family: Arial, Helvetica, sans-serif; line-height:1.4; color:#111;">
        <p>Hola,</p>
        <p>Tu código de verificación para el sistema de Pasantías UNERG es:</p>
        <h2 style="letter-spacing:4px; color:#0b63d6;">${code}</h2>
        <p>Este código expira en 15 minutos.</p>
        <p>Si no solicitaste este código, ignora este correo.</p>
        <hr/>
        <p style="font-size:12px; color:#666;">Pasantías UNERG</p>
      </div>
    `
  }

  return transporter.sendMail(mailOptions)
}
