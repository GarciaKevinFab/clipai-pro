import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Sparkles } from 'lucide-react'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { useAuthStore } from '../store/authStore'
import { authAPI } from '../api/endpoints'
import { useToast } from '../hooks/useToast'

export default function SignIn() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const toast = useToast()

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)

    try {
      const { data } = await authAPI.login(form)
      login(data.tokens, data.user)
      toast.success('Bienvenido de vuelta')
      navigate('/dashboard')
    } catch (err) {
      const res = err.response?.data
      if (res && typeof res === 'object') {
        const fieldErrors = {}
        Object.entries(res).forEach(([key, val]) => {
          fieldErrors[key] = Array.isArray(val) ? val[0] : val
        })
        setErrors(fieldErrors)
        if (res.detail) toast.error(res.detail)
        else if (res.non_field_errors) toast.error(res.non_field_errors[0] || 'Error al iniciar sesion')
        else toast.error('Credenciales incorrectas')
      } else {
        toast.error('Error de conexion. Intenta de nuevo.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-blue-500" />
            <span className="text-2xl font-bold text-white font-[family-name:var(--font-heading)]">
              ClipAI Pro
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="relative rounded-2xl p-[1px] bg-gradient-to-b from-blue-500/30 to-transparent">
          <div className="rounded-2xl bg-[var(--card)] p-8 shadow-2xl shadow-blue-500/5">
            <h1 className="text-xl font-semibold text-white mb-1 font-[family-name:var(--font-heading)]">
              Iniciar sesion
            </h1>
            <p className="text-sm text-gray-400 mb-6">
              Accede a tu cuenta para continuar
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                label="Correo electronico"
                name="email"
                type="email"
                placeholder="tu@email.com"
                value={form.email}
                onChange={handleChange}
                error={errors.email}
                required
              />

              <Input
                label="Contrasena"
                name="password"
                type="password"
                placeholder="********"
                value={form.password}
                onChange={handleChange}
                error={errors.password}
                required
              />

              <div className="flex justify-end">
                <Link
                  to="/forgot-password"
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Olvidaste tu contrasena?
                </Link>
              </div>

              {errors.detail && (
                <p className="text-sm text-red-400 text-center">{errors.detail}</p>
              )}

              <Button type="submit" loading={loading} className="w-full mt-2" size="lg">
                Iniciar sesion
              </Button>
            </form>

            <p className="text-sm text-gray-400 text-center mt-6">
              No tienes cuenta?{' '}
              <Link to="/signup" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                Registrate
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
