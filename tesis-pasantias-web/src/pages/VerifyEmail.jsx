// src/pages/VerifyEmail.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export default function VerifyEmail() {
  const navigate = useNavigate()
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const initialEmail = params.get('email') || ''

  const [email, setEmail] = useState(initialEmail)
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [attempts, setAttempts] = useState(0)

  const backgroundImages = ['/images/1.jpg', '/images/2.jpg', '/images/3.jpg', '/images/4.jpg']
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setCurrentImageIndex((p) => (p + 1) % backgroundImages.length), 5000)
    return () => clearInterval(id)
  }, [backgroundImages.length])

  useEffect(() => {
    if (!initialEmail) {
      setError('No se recibió correo. Verifica que viniste desde el registro o ingresa tu correo abajo.')
    }
  }, [initialEmail])

  const backendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000').replace(/\/$/, '')

  const handleVerify = async (e) => {
    e?.preventDefault()
    setError('')
    setSuccess('')
    if (!email) return setError('Ingresa tu correo.')
    if (!code || code.trim().length < 4) return setError('Ingresa el código de verificación completo.')

    setLoading(true)
    try {
      const res = await fetch(`${backendUrl}/api/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: code.trim() })
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(json?.error || 'Error verificando el código')
        setAttempts((a) => a + 1)
        return
      }
      setSuccess('Correo verificado correctamente. Redirigiendo al inicio...')
      setTimeout(() => navigate('/'), 900)
    } catch (err) {
      console.error('verify-code error', err)
      setError('Error de red. Intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setError('')
    setSuccess('')
    if (!email) return setError('Ingresa tu correo para reenviar el código.')
    setLoading(true)
    try {
      const res = await fetch(`${backendUrl}/api/send-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(json?.error || 'No se pudo reenviar el código')
        return
      }
      setSuccess('Código reenviado. Revisa tu bandeja.')
    } catch (err) {
      console.error('send-verification error', err)
      setError('Error de red al reenviar. Intenta más tarde.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0 z-0">
        {backgroundImages.map((src, i) => (
          <img
            key={src}
            src={src}
            alt={`fondo-${i}`}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: i === currentImageIndex ? 1 : 0,
              transition: 'opacity 1s ease-in-out',
              pointerEvents: 'none',
              transform: 'translateZ(0)'
            }}
          />
        ))}
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'black', opacity: 0.28, pointerEvents: 'none' }} />
      </div>

      <div className="relative z-10 max-w-md w-full">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6">
          <div className="text-center mb-4">
            <img src="/images/logo.svg" alt="Logo UNERG" className="mx-auto mb-2 w-14 h-14" />
            <h2 className="text-2xl font-semibold text-gray-900">Verificación de correo</h2>
            <p className="text-sm text-gray-600">
              Introduce el código que enviamos a <b>{initialEmail || 'tu correo'}</b>
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Correo</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">Código de verificación</label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="123456"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {error && <div className="p-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">{error}</div>}
            {success && <div className="p-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg">{success}</div>}

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-60"
              >
                {loading ? 'Verificando...' : 'Verificar'}
              </button>

              <button
                type="button"
                onClick={handleResend}
                disabled={loading}
                className="px-3 py-2 border rounded-lg text-sm disabled:opacity-60"
              >
                Reenviar código
              </button>

              <button type="button" onClick={() => navigate('/')} className="ml-auto text-sm text-gray-600 hover:underline">
                Cancelar
              </button>
            </div>

            <div className="text-xs text-gray-500 mt-2">Intentos: {attempts}</div>
          </form>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
        {backgroundImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImageIndex(index)}
            aria-label={`Ir a imagen ${index + 1}`}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentImageIndex ? 'bg-white scale-110' : 'bg-white/50 hover:bg-white/75'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
