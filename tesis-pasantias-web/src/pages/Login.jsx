// src/pages/Login.jsx
import React, { useState, useEffect } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function Login() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ email: '', password: '', rememberMe: false })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
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

  const findProfileByEmail = async (email) => {
    // Primera y preferida: columna 'email' (minúscula)
    const { data, error } = await supabase.from('profiles').select('*').eq('email', email).limit(1)
    if (error) {
      // devolver el error para manejo externo
      return { data: null, error }
    }
    if (Array.isArray(data) && data.length > 0) return { data: data[0], error: null }

    // Si no encontró nada, puedes intentar otras variantes si realmente existen en tu esquema.
    // Comentaré la variante con 'Email' porque causa 400 si la columna no existe.
    // Si confirmas que tienes una columna con nombre exacto 'Email' (creada con comillas),
    // descomenta la siguiente línea para intentar esa variante:
    //
    // const { data: d2, error: e2 } = await supabase.from('profiles').select('*').eq('"Email"', email).limit(1)
    // return { data: Array.isArray(d2) && d2.length > 0 ? d2[0] : null, error: e2 }

    return { data: null, error: null }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    const email = (formData.email || '').trim()
    const password = formData.password || ''

    if (!email || !password) {
      setError('Ingresa correo y contraseña')
      setIsLoading(false)
      return
    }

    try {
      const { data: profile, error: queryError } = await findProfileByEmail(email)

      if (queryError) {
        console.error('Error consultando profiles:', queryError)
        setError('Error al consultar usuario. Revisa la consola.')
        return
      }

      if (!profile) {
        setError('Usuario no encontrado')
        return
      }

      const storedPassword = profile.password ?? profile.contrasena ?? profile.contraseña ?? null

      if (!storedPassword) {
        setError('No hay contraseña registrada para este usuario en profiles')
        return
      }

      if (String(storedPassword) !== String(password)) {
        setError('Contraseña incorrecta')
        return
      }

      const rawRole = (profile.role || profile.Role || '').toString().trim()
      const role = rawRole.toLowerCase()

      if (role === 'superadmin' || role.includes('super')) {
        navigate('/superadmin/dashboard')
      } else if (role === 'admin' || role.includes('admin')) {
        navigate('/admin/dashboard')
      } else {
        navigate('/student/dashboard')
      }
    } catch (err) {
      console.error('Error al iniciar sesión:', err)
      setError(err?.message || 'Error inesperado')
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
          <div className="text-center mb-8">
            <img src="/images/logo.svg" alt="Logo UNERG" className="mx-auto mb-4 w-16 h-16" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">UNERG</h1>
            <p className="text-gray-600">Sistema de Pasantias AIS UNERG</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Correo Electrónico</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="usuario@unerg.edu.ve"
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
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors pr-12"
                  placeholder="••••••••"
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

            <div className="flex items-center">
              <input
                type="checkbox"
                name="rememberMe"
                id="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-700">
                Recuérdame los datos en este equipo
              </label>
            </div>

            {error && <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">{error}</div>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿No tienes cuenta de estudiante?{' '}
              <Link to="/register" className="text-blue-600 hover:underline font-medium">
                Regístrate aquí
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
