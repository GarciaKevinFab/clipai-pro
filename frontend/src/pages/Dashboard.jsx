import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Coins,
  Film,
  Diamond,
  CalendarDays,
  Play,
  Plus,
  Share2,
  CreditCard,
  Sparkles,
  Video,
  Globe,
  ChevronRight,
  ChevronLeft,
  X,
  Rocket,
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { videosAPI, authAPI } from '../api/endpoints'
import { useToast } from '../hooks/useToast'
import Spinner from '../components/ui/Spinner'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'

/* ─────────────────── Status helpers ─────────────────── */

const statusMap = {
  completed: { label: 'Completado', variant: 'success' },
  processing: { label: 'Procesando', variant: 'warning' },
  failed: { label: 'Error', variant: 'error' },
  pending: { label: 'Pendiente', variant: 'pending' },
  published: { label: 'Publicado', variant: 'info' },
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/* ─────────────────── Onboarding Modal ─────────────────── */

const onboardingSteps = [
  {
    icon: Sparkles,
    title: 'Bienvenido a ClipAI Pro',
    description:
      'Tienes 5 creditos gratuitos para comenzar. Cada credito te permite generar un video con inteligencia artificial de alta calidad, listo para publicar en tus redes sociales.',
  },
  {
    icon: Video,
    title: 'Crea tu primer video',
    description:
      'Usa nuestro asistente paso a paso para crear videos increibles. Escribe tu idea, elige un estilo visual, selecciona la voz y la musica, y deja que la IA haga el resto.',
  },
  {
    icon: Globe,
    title: 'Publica en redes',
    description:
      'Conecta tus cuentas de TikTok, YouTube e Instagram para publicar directamente desde ClipAI Pro. Programa tus publicaciones y haz crecer tu audiencia sin esfuerzo.',
  },
]

function OnboardingModal({ onComplete }) {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const current = onboardingSteps[step]
  const isLast = step === onboardingSteps.length - 1

  const handleComplete = async () => {
    setLoading(true)
    try {
      await onComplete()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#111827] border border-[var(--border)] shadow-2xl overflow-hidden">
        {/* Skip button */}
        <button
          onClick={handleComplete}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-300 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="flex flex-col items-center text-center px-8 pt-10 pb-6">
          <div className="w-20 h-20 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6">
            <current.icon className="w-10 h-10 text-blue-400" />
          </div>

          <h2 className="text-xl font-bold text-white mb-3 font-[family-name:var(--font-heading)]">
            {current.title}
          </h2>
          <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
            {current.description}
          </p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 pb-4">
          {onboardingSteps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step
                  ? 'w-8 bg-blue-500'
                  : i < step
                    ? 'w-4 bg-blue-500/40'
                    : 'w-4 bg-gray-700'
              }`}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between px-8 pb-8 pt-2">
          <button
            onClick={handleComplete}
            className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
          >
            Saltar
          </button>

          <div className="flex items-center gap-3">
            {step > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep(step - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
                Atras
              </Button>
            )}
            {isLast ? (
              <Button onClick={handleComplete} loading={loading}>
                <Rocket className="w-4 h-4" />
                Comenzar
              </Button>
            ) : (
              <Button onClick={() => setStep(step + 1)}>
                Siguiente
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────── Stat Card ─────────────────── */

function StatCard({ icon: Icon, label, value, color = 'text-white', to }) {
  const content = (
    <div className="rounded-xl bg-[#111827] border border-[var(--border)] p-5 hover:border-[var(--border-hover,#1f2937)] transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            color === 'text-yellow-400'
              ? 'bg-yellow-500/10'
              : color === 'text-blue-400'
                ? 'bg-blue-500/10'
                : color === 'text-purple-400'
                  ? 'bg-purple-500/10'
                  : 'bg-emerald-500/10'
          }`}
        >
          <Icon
            className={`w-5 h-5 ${
              color === 'text-yellow-400'
                ? 'text-yellow-400'
                : color === 'text-blue-400'
                  ? 'text-blue-400'
                  : color === 'text-purple-400'
                    ? 'text-purple-400'
                    : 'text-emerald-400'
            }`}
          />
        </div>
        {to && <ChevronRight className="w-4 h-4 text-gray-600" />}
      </div>
      <p className={`text-2xl font-bold ${color} font-[family-name:var(--font-heading)]`}>
        {value}
      </p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  )

  if (to) {
    return <Link to={to}>{content}</Link>
  }
  return content
}

/* ─────────────────── Video Card ─────────────────── */

function VideoCard({ video }) {
  const status = statusMap[video.status] || statusMap.pending

  return (
    <Link
      to={`/mis-videos/${video.id}`}
      className="group rounded-xl bg-[#111827] border border-[var(--border)] overflow-hidden hover:border-blue-500/30 transition-all duration-200"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 flex items-center justify-center">
        {video.thumbnail_url ? (
          <img
            src={video.thumbnail_url}
            alt={video.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
            <Play className="w-5 h-5 text-white ml-0.5" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="text-sm font-medium text-white truncate group-hover:text-blue-400 transition-colors">
          {video.title || 'Sin titulo'}
        </h3>
        <p className="text-xs text-gray-500 mt-1">{formatDate(video.created_at)}</p>
      </div>
    </Link>
  )
}

/* ─────────────────── Dashboard Page ─────────────────── */

export default function Dashboard() {
  const navigate = useNavigate()
  const toast = useToast()
  const { user, updateUser } = useAuthStore()

  const showOnboarding = user && user.onboarding_completed === false

  const { data: videosData, isLoading: videosLoading } = useQuery({
    queryKey: ['dashboard-videos'],
    queryFn: () => videosAPI.list({ page_size: 6 }),
    select: (res) => res.data,
  })

  const videos = videosData?.results || []
  const videosThisMonth = useMemo(() => {
    if (!videosData?.results) return 0
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    return videosData.results.filter(
      (v) => new Date(v.created_at) >= startOfMonth
    ).length
  }, [videosData])

  const handleOnboardingComplete = async () => {
    try {
      await authAPI.updateMe({ onboarding_completed: true })
      updateUser({ onboarding_completed: true })
      toast.success('Bienvenido a ClipAI Pro!')
    } catch {
      updateUser({ onboarding_completed: true })
    }
  }

  return (
    <>
      {showOnboarding && (
        <OnboardingModal onComplete={handleOnboardingComplete} />
      )}

      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white font-[family-name:var(--font-heading)]">
            Dashboard
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Bienvenido de vuelta, {user?.first_name || user?.username || 'usuario'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Coins}
            label="Creditos Disponibles"
            value={user?.credits ?? 0}
            color="text-yellow-400"
          />
          <StatCard
            icon={Film}
            label="Videos Generados"
            value={user?.total_videos_generated ?? 0}
            color="text-blue-400"
          />
          <StatCard
            icon={Diamond}
            label="Plan Actual"
            value={
              user?.plan
                ? user.plan.charAt(0).toUpperCase() + user.plan.slice(1)
                : 'Gratis'
            }
            color="text-purple-400"
            to="/precios"
          />
          <StatCard
            icon={CalendarDays}
            label="Videos Este Mes"
            value={videosLoading ? '...' : videosThisMonth}
            color="text-emerald-400"
          />
        </div>

        {/* Recent Videos */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-white font-[family-name:var(--font-heading)]">
              Videos Recientes
            </h2>
            <Link
              to="/mis-videos"
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
            >
              Ver todos
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {videosLoading ? (
            <div className="flex items-center justify-center py-16">
              <Spinner size="lg" />
            </div>
          ) : videos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {videos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Film}
              title="Aun no tienes videos"
              description="Crea tu primer video con inteligencia artificial y sorprendete con los resultados."
              actionLabel="Crear mi primer video"
              onAction={() => navigate('/crear-video')}
            />
          )}
        </div>

        {/* Quick Actions */}
        <div className="rounded-xl bg-[#111827] border border-[var(--border)] p-6">
          <h3 className="text-sm font-medium text-gray-400 mb-4">
            Acciones Rapidas
          </h3>
          <div className="flex flex-wrap gap-3">
            <Link to="/crear-video">
              <Button>
                <Plus className="w-4 h-4" />
                Crear Video
              </Button>
            </Link>
            <Link to="/redes-sociales">
              <Button variant="outline">
                <Share2 className="w-4 h-4" />
                Conectar Redes
              </Button>
            </Link>
            <Link to="/precios">
              <Button
                variant="outline"
                className="!border-yellow-500/30 !text-yellow-400 hover:!bg-yellow-500/5"
              >
                <CreditCard className="w-4 h-4" />
                Obtener Creditos
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
