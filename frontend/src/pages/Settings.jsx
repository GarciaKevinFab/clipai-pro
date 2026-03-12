import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Lock, CreditCard, AlertTriangle, LogOut } from 'lucide-react'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { useAuthStore } from '../store/authStore'
import { authAPI } from '../api/endpoints'
import { useToast } from '../hooks/useToast'

function SectionCard({ icon: Icon, title, children }) {
  return (
    <div className="rounded-xl bg-[var(--card)] border border-[var(--border)] overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-[var(--border)]">
        <Icon className="w-5 h-5 text-gray-400" />
        <h2 className="text-base font-semibold text-white font-[family-name:var(--font-heading)]">
          {title}
        </h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

export default function Settings() {
  const navigate = useNavigate()
  const toast = useToast()
  const { user, updateUser, logout } = useAuthStore()

  // Profile form
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
  })
  const [profileLoading, setProfileLoading] = useState(false)

  // Password form
  const [passwords, setPasswords] = useState({
    old_password: '',
    new_password: '',
  })
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordErrors, setPasswordErrors] = useState({})

  useEffect(() => {
    if (user) {
      setProfile({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
      })
    }
  }, [user])

  const handleProfileSave = async () => {
    setProfileLoading(true)
    try {
      const { data } = await authAPI.updateMe(profile)
      updateUser(data)
      toast.success('Perfil actualizado correctamente')
    } catch (err) {
      const res = err.response?.data
      toast.error(res?.detail || 'Error al actualizar perfil')
    } finally {
      setProfileLoading(false)
    }
  }

  const handlePasswordSave = async () => {
    setPasswordErrors({})
    setPasswordLoading(true)
    try {
      await authAPI.changePassword(passwords)
      setPasswords({ old_password: '', new_password: '' })
      toast.success('Contrasena actualizada correctamente')
    } catch (err) {
      const res = err.response?.data
      if (res && typeof res === 'object') {
        const fieldErrors = {}
        Object.entries(res).forEach(([key, val]) => {
          fieldErrors[key] = Array.isArray(val) ? val[0] : val
        })
        setPasswordErrors(fieldErrors)
        toast.error(res.detail || 'Error al cambiar contrasena')
      } else {
        toast.error('Error de conexion')
      }
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/signin')
    toast.info('Sesion cerrada')
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('es-PE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white font-[family-name:var(--font-heading)]">
          Configuracion
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Administra tu cuenta y preferencias
        </p>
      </div>

      {/* Mi Cuenta */}
      <SectionCard icon={User} title="Mi Cuenta">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Nombre"
            value={profile.first_name}
            onChange={(e) =>
              setProfile((p) => ({ ...p, first_name: e.target.value }))
            }
            placeholder="Tu nombre"
          />
          <Input
            label="Apellido"
            value={profile.last_name}
            onChange={(e) =>
              setProfile((p) => ({ ...p, last_name: e.target.value }))
            }
            placeholder="Tu apellido"
          />
          <Input
            label="Correo electronico"
            value={user?.email || ''}
            disabled
            className="opacity-60 cursor-not-allowed"
          />
          <Input
            label="Nombre de usuario"
            value={user?.username || ''}
            disabled
            className="opacity-60 cursor-not-allowed"
          />
        </div>
        <div className="flex justify-end mt-5">
          <Button onClick={handleProfileSave} loading={profileLoading}>
            Guardar cambios
          </Button>
        </div>
      </SectionCard>

      {/* Cambiar Contrasena */}
      <SectionCard icon={Lock} title="Cambiar Contrasena">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Contrasena actual"
            name="old_password"
            type="password"
            placeholder="********"
            value={passwords.old_password}
            onChange={(e) =>
              setPasswords((p) => ({ ...p, old_password: e.target.value }))
            }
            error={passwordErrors.old_password}
          />
          <Input
            label="Nueva contrasena"
            name="new_password"
            type="password"
            placeholder="Min. 8 caracteres"
            value={passwords.new_password}
            onChange={(e) =>
              setPasswords((p) => ({ ...p, new_password: e.target.value }))
            }
            error={passwordErrors.new_password}
          />
        </div>
        <div className="flex justify-end mt-5">
          <Button onClick={handlePasswordSave} loading={passwordLoading}>
            Cambiar contrasena
          </Button>
        </div>
      </SectionCard>

      {/* Plan Actual */}
      <SectionCard icon={CreditCard} title="Plan Actual">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-lg bg-[var(--surface)] border border-[var(--border)] p-4">
            <p className="text-xs text-gray-500 mb-1">Plan</p>
            <p className="text-lg font-semibold text-white font-[family-name:var(--font-heading)]">
              {user?.plan_name || 'Gratis'}
            </p>
          </div>
          <div className="rounded-lg bg-[var(--surface)] border border-[var(--border)] p-4">
            <p className="text-xs text-gray-500 mb-1">Creditos</p>
            <p className="text-lg font-semibold text-blue-400">
              {user?.credits ?? 0}
            </p>
          </div>
          <div className="rounded-lg bg-[var(--surface)] border border-[var(--border)] p-4">
            <p className="text-xs text-gray-500 mb-1">Vence</p>
            <p className="text-lg font-semibold text-white">
              {formatDate(user?.plan_expiry)}
            </p>
          </div>
        </div>
        <div className="flex justify-end mt-5">
          <Link to="/precios">
            <Button variant="secondary">Mejorar plan</Button>
          </Link>
        </div>
      </SectionCard>

      {/* Zona Peligrosa */}
      <div className="rounded-xl border border-red-500/20 overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-red-500/20 bg-red-500/5">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          <h2 className="text-base font-semibold text-red-400 font-[family-name:var(--font-heading)]">
            Zona Peligrosa
          </h2>
        </div>
        <div className="p-6 bg-[var(--card)]">
          <p className="text-sm text-gray-400 mb-4">
            Al cerrar sesion se eliminaran tus datos de sesion local.
          </p>
          <Button variant="danger" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
            Cerrar sesion
          </Button>
        </div>
      </div>
    </div>
  )
}
