// src/pages/Register.jsx
import React, { useState, useEffect } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { v4 as uuidv4 } from 'uuid'

export default function Register() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    fullName: '',
    ci: '',
    phone: '',
    email: '',
    password: '',
    acceptTerms: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const backgroundImages = ['/images/1.jpg', '/images/2.jpg', '/images/3.jpg', '/images/4.jpg']

  useEffect(() => {
    const id = setInterval(() => setCurrentImageIndex((p) => (p + 1) % backgroundImages.length), 5000)
    return () => clearInterval(id)
  }, [backgroundImages.length])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const validate = () => {
    if (!formData.fullName.trim()) return 'Ingresa tu nombre completo'
    if (!formData.ci.trim()) return 'Ingresa tu cédula de identidad'
    if (!formData.phone.trim()) return 'Ingresa tu teléfono'
    if (!formData.email.trim()) return 'Ingresa tu correo electrónico'
    if (!formData.password) return 'Ingresa una contraseña'
    if (!formData.acceptTerms) return 'Debes aceptar los términos y condiciones'
    return ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    const v = validate()
    if (v) {
      setError(v)
      return
    }
    setIsLoading(true)

    try {
      // Prepara objeto a insertar en la tabla profiles (usa 'password' como columna)
      const newProfile = {
        id: uuidv4(),
        user_id: uuidv4(),
        full_name: formData.fullName,
        ci: formData.ci,
        phone: formData.phone,
        role: 'student',
        created_at: new Date().toISOString(),
        email: formData.email,
        password: formData.password,
        empresa_pasantias: null,
        cohorte: null,
        email_verified: false,
        email_verification_code: null,
        code_expires_at: null,
      }

      // Insertar en profiles
      const { data, error: insertError } = await supabase.from('profiles').insert([newProfile]).select().single()

      if (insertError) {
        console.error('Error insertando profile:', insertError)
        setError(insertError.message || 'Error al registrar usuario')
        setIsLoading(false)
        return
      }

      // Si la inserción fue exitosa, intentar enviar el código de verificación vía backend
      try {
        const backendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000').replace(/\/$/, '')
        const resp = await fetch(`${backendUrl}/api/send-verification`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email })
        })
        const json = await resp.json()
        if (!resp.ok) {
          console.error('Error enviando código de verificación:', json)
          // mostrar mensaje pero permitir al usuario seguir (puede reintentar)
          setSuccess('Usuario registrado. No se pudo enviar el código por correo. Intenta reenviar.')
          // redireccionar al login para que el administrador / usuario pueda solicitar reenvío manual si se desea
          setTimeout(() => navigate('/'), 1200)
          return
        }
        // Si todo OK: redirigir a la vista de verificación con email en query
        setSuccess('Registro completado. Revisa tu correo para el código de verificación.')
        setTimeout(() => {
          navigate(`/verify-email?email=${encodeURIComponent(formData.email)}`)
        }, 700)
      } catch (mailErr) {
        console.error('Error en llamada al backend de envío de correo:', mailErr)
        setSuccess('Usuario registrado. No se pudo enviar el correo de verificación.')
        setTimeout(() => navigate('/'), 900)
      }
    } catch (err) {
      console.error('handleSubmit register error:', err)
      setError(err?.message || 'Ocurrió un error. Intenta nuevamente.')
    } finally {
      setIsLoading(false)
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
              transform: 'translateZ(0)',
            }}
          />
        ))}
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'black', opacity: 0.28, pointerEvents: 'none' }} />
      </div>

      <div className="relative z-10 max-w-md w-full">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-6">
            <img src="/images/logo.svg" alt="Logo UNERG" className="mx-auto mb-4 w-16 h-16" />
            <h1 className="text-2xl font-bold text-gray-900">Registro Pasante</h1>
            <p className="text-sm text-gray-600">Registro de estudiantes para Pasantias</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre Completo</label>
              <input
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Juan Pérez"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cédula de Identidad</label>
              <input
                name="ci"
                value={formData.ci}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="V-12345678"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="+58 412 1234567"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Correo Electrónico</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="estudiante@unerg.edu.ve"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors pr-12"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-start">
              <input
                id="acceptTerms"
                name="acceptTerms"
                type="checkbox"
                checked={formData.acceptTerms}
                onChange={handleChange}
                className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="acceptTerms" className="ml-3 text-sm text-gray-700">
                Acepto los términos y condiciones
              </label>
            </div>

            {error && <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">{error}</div>}
            {success && <div className="p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg">{success}</div>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Registrando...' : 'Registrarse'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes cuenta?{' '}
              <Link to="/" className="text-blue-600 hover:underline font-medium">
                Inicia sesión
              </Link>
            </p>
          </div>
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
