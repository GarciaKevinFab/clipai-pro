import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, ArrowLeft, CheckCircle } from 'lucide-react'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { authAPI } from '../api/endpoints'
import { useToast } from '../hooks/useToast'

export default function ForgotPassword() {
  const toast = useToast()

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await authAPI.forgotPassword({ email })
      setSent(true)
    } catch (err) {
      const res = err.response?.data
      if (res?.email) {
        setError(Array.isArray(res.email) ? res.email[0] : res.email)
      } else if (res?.detail) {
        setError(res.detail)
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
            {sent ? (
              <div className="text-center py-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-7 h-7 text-emerald-400" />
                </div>
                <h1 className="text-xl font-semibold text-white mb-2 font-[family-name:var(--font-heading)]">
                  Correo enviado
                </h1>
                <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                  Si existe una cuenta con <span className="text-white">{email}</span>,
                  recibiras un enlace para restablecer tu contrasena.
                </p>
                <Link
                  to="/signin"
                  className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver a iniciar sesion
                </Link>
              </div>
            ) : (
              <>
                <h1 className="text-xl font-semibold text-white mb-1 font-[family-name:var(--font-heading)]">
                  Recuperar contrasena
                </h1>
                <p className="text-sm text-gray-400 mb-6">
                  Ingresa tu correo y te enviaremos un enlace de recuperacion
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <Input
                    label="Correo electronico"
                    name="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setError('')
                    }}
                    error={error}
                    required
                  />

                  <Button type="submit" loading={loading} className="w-full mt-2" size="lg">
                    Enviar enlace de recuperacion
                  </Button>
                </form>

                <div className="text-center mt-6">
                  <Link
                    to="/signin"
                    className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-300 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Volver a iniciar sesion
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
