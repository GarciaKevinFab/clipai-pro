import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Sparkles, CheckCircle } from 'lucide-react'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { authAPI } from '../api/endpoints'
import { useToast } from '../hooks/useToast'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const toast = useToast()

  const uid = searchParams.get('uid')
  const token = searchParams.get('token')

  const [form, setForm] = useState({ new_password: '', confirm_password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})

    if (form.new_password !== form.confirm_password) {
      setErrors({ confirm_password: 'Las contrasenas no coinciden' })
      return
    }

    if (!uid || !token) {
      toast.error('Enlace de recuperacion invalido o expirado')
      return
    }

    setLoading(true)

    try {
      await authAPI.resetPassword({
        uid,
        token,
        new_password: form.new_password,
      })
      setSuccess(true)
    } catch (err) {
      const res = err.response?.data
      if (res && typeof res === 'object') {
        const fieldErrors = {}
        Object.entries(res).forEach(([key, val]) => {
          fieldErrors[key] = Array.isArray(val) ? val[0] : val
        })
        setErrors(fieldErrors)
        if (res.detail) toast.error(res.detail)
        else if (res.token) toast.error('El enlace ha expirado. Solicita uno nuevo.')
        else toast.error('No se pudo restablecer la contrasena')
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
            {success ? (
              <div className="text-center py-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-7 h-7 text-emerald-400" />
                </div>
                <h1 className="text-xl font-semibold text-white mb-2 font-[family-name:var(--font-heading)]">
                  Contrasena restablecida
                </h1>
                <p className="text-sm text-gray-400 mb-6">
                  Tu contrasena ha sido actualizada correctamente.
                </p>
                <Link to="/signin">
                  <Button className="w-full" size="lg">
                    Iniciar sesion
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <h1 className="text-xl font-semibold text-white mb-1 font-[family-name:var(--font-heading)]">
                  Restablecer contrasena
                </h1>
                <p className="text-sm text-gray-400 mb-6">
                  Ingresa tu nueva contrasena
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <Input
                    label="Nueva contrasena"
                    name="new_password"
                    type="password"
                    placeholder="Min. 8 caracteres"
                    value={form.new_password}
                    onChange={handleChange}
                    error={errors.new_password}
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

                  {errors.detail && (
                    <p className="text-sm text-red-400 text-center">{errors.detail}</p>
                  )}

                  <Button type="submit" loading={loading} className="w-full mt-2" size="lg">
                    Restablecer contrasena
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
