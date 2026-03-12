import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { useAuthStore } from '../store/authStore'
import { authAPI } from '../api/endpoints'
import { useToast } from '../hooks/useToast'

export default function SignUp() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const login = useAuthStore((s) => s.login)
  const toast = useToast()

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirm_password: '',
  })
  const [accepted, setAccepted] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})

    if (form.password !== form.confirm_password) {
      setErrors({ confirm_password: 'Las contrasenas no coinciden' })
      return
    }

    if (!accepted) {
      toast.warning('Debes aceptar los Terminos de Uso y Politica de Privacidad')
      return
    }

    setLoading(true)

    try {
      const payload = {
        username: form.username,
        email: form.email,
        password: form.password,
      }

      const ref = searchParams.get('ref')
      if (ref) payload.ref = ref

      const { data } = await authAPI.register(payload)
      login(data.tokens, data.user)
      toast.success('Cuenta creada. Tienes 5 creditos gratis para empezar!')
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
        else if (res.non_field_errors) toast.error(res.non_field_errors[0] || 'Error al registrar')
        else toast.error('Revisa los campos e intenta de nuevo')
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
              Crear cuenta
            </h1>
            <p className="text-sm text-gray-400 mb-6">
              Empieza a crear videos con IA gratis
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                label="Nombre de usuario"
                name="username"
                type="text"
                placeholder="miusuario"
                value={form.username}
                onChange={handleChange}
                error={errors.username}
                required
              />

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
                placeholder="Min. 8 caracteres"
                value={form.password}
                onChange={handleChange}
                error={errors.password}
                required
              />

              <Input
                label="Confirmar contrasena"
                name="confirm_password"
                type="password"
                placeholder="Repite tu contrasena"
                value={form.confirm_password}
                onChange={handleChange}
                error={errors.confirm_password}
                required
              />

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-[var(--border)] bg-[var(--surface)] text-blue-500 focus:ring-blue-500/50 focus:ring-offset-0"
                />
                <span className="text-xs text-gray-400 leading-relaxed">
                  Acepto los{' '}
                  <Link to="/terminos" className="text-blue-400 hover:text-blue-300 underline">
                    Terminos de Uso
                  </Link>{' '}
                  y la{' '}
                  <Link to="/privacidad" className="text-blue-400 hover:text-blue-300 underline">
                    Politica de Privacidad
                  </Link>
                </span>
              </label>

              {errors.detail && (
                <p className="text-sm text-red-400 text-center">{errors.detail}</p>
              )}

              <Button type="submit" loading={loading} className="w-full mt-2" size="lg">
                Crear cuenta gratis
              </Button>
            </form>

            <p className="text-sm text-gray-400 text-center mt-6">
              Ya tienes cuenta?{' '}
              <Link to="/signin" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                Inicia sesion
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
