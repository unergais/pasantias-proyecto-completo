// src/Auth/Auth.jsx
import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')

  const handleLogin = async (event) => {
    event.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithOtp({ email })
      if (error) {
        alert(error.error_description || error.message)
      } else {
        alert('Revisa tu correo para el enlace mágico')
      }
    } catch (err) {
      console.error('Supabase error:', err)
      alert('Ocurrió un error al intentar iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="row flex flex-center">
      <div className="col-6 form-widget">
        <h1 className="header">Supabase + React</h1>
        <p className="description">Inicia sesión con enlace mágico mediante tu correo</p>
        <form className="form-widget" onSubmit={handleLogin}>
          <div>
            <input
              className="inputField"
              type="email"
              placeholder="tu@correo.com"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <button className="button block" disabled={loading}>
              {loading ? <span>Cargando...</span> : <span>Enviar enlace</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
