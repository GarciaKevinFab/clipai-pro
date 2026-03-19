import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Globe, Check, Unplug, AlertTriangle, Clock } from 'lucide-react'
import { socialAPI } from '../api/endpoints'
import { useToast } from '../hooks/useToast'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Spinner from '../components/ui/Spinner'
import Modal from '../components/ui/Modal'
import EmptyState from '../components/ui/EmptyState'

/* ─────────────────── Platform config ─────────────────── */

const PLATFORMS = [
  {
    key: 'tiktok',
    name: 'TikTok',
    description: 'Publica videos cortos directamente en tu perfil de TikTok',
    color: '#000000',
    textColor: '#fff',
    icon: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V9.17a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.01-.6z" />
      </svg>
    ),
    start: () => socialAPI.tiktokStart(),
  },
  {
    key: 'youtube',
    name: 'YouTube',
    description: 'Sube tus videos como Shorts o videos regulares en YouTube',
    color: '#FF0000',
    textColor: '#fff',
    icon: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
    start: () => socialAPI.youtubeStart(),
  },
  {
    key: 'instagram',
    name: 'Instagram',
    description: 'Comparte tus videos como Reels en tu cuenta de Instagram',
    color: '#E4405F',
    textColor: '#fff',
    icon: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
      </svg>
    ),
    start: () => socialAPI.instagramStart(),
  },
]

/* ─────────────────── Main Page ─────────────────── */

export default function SocialNetworks() {
  const queryClient = useQueryClient()
  const toast = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const [disconnectTarget, setDisconnectTarget] = useState(null)

  // Fetch connected accounts
  const { data, isLoading } = useQuery({
    queryKey: ['social-accounts'],
    queryFn: () => socialAPI.accounts().then((res) => res.data),
  })

  const accounts = data?.results ?? []

  // Show success toast if redirected back with ?connected=
  useEffect(() => {
    const connected = searchParams.get('connected')
    if (connected) {
      const platformName = PLATFORMS.find((p) => p.key === connected)?.name || connected
      toast.success(`${platformName} conectado exitosamente`)
      searchParams.delete('connected')
      setSearchParams(searchParams, { replace: true })
      queryClient.invalidateQueries({ queryKey: ['social-accounts'] })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Connect handler
  const handleConnect = async (platform) => {
    try {
      const res = await platform.start()
      const url = res.data?.url || res.data?.redirect_url
      if (url) {
        window.location.href = url
      }
    } catch {
      toast.error(`Error al conectar ${platform.name}`)
    }
  }

  // Disconnect mutation
  const disconnectMutation = useMutation({
    mutationFn: (id) => socialAPI.disconnect(id),
    onSuccess: () => {
      toast.success('Cuenta desconectada')
      setDisconnectTarget(null)
      queryClient.invalidateQueries({ queryKey: ['social-accounts'] })
    },
    onError: () => {
      toast.error('Error al desconectar la cuenta')
    },
  })

  // Helper: find connected account for a platform
  const getConnected = (platformKey) =>
    accounts.find(
      (a) => a.platform?.toLowerCase() === platformKey || a.provider?.toLowerCase() === platformKey
    )

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white font-[family-name:var(--font-heading)]">
          Redes Sociales
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Conecta tus cuentas para publicar directamente
        </p>
      </div>

      {/* Loading */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          {/* Platform grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PLATFORMS.map((platform) => {
              const connected = getConnected(platform.key)

              return (
                <div
                  key={platform.key}
                  className={`relative bg-[#111827] border rounded-xl p-6 transition-all duration-200 ${
                    connected
                      ? 'border-emerald-500/30 shadow-lg shadow-emerald-500/5'
                      : 'border-[var(--border)] hover:border-blue-500/30'
                  }`}
                >
                  {/* Icon */}
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: platform.color, color: platform.textColor }}
                  >
                    {platform.icon}
                  </div>

                  {/* Info */}
                  <h3 className="text-lg font-semibold text-white mb-1">{platform.name}</h3>
                  <p className="text-sm text-gray-400 mb-4 leading-relaxed">
                    {platform.description}
                  </p>

                  {connected ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="success">
                          <Check className="w-3 h-3 mr-1" />
                          Conectada
                        </Badge>
                        {connected.username && (
                          <span className="text-sm text-gray-300 truncate">
                            @{connected.username}
                          </span>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-red-400 border-red-500/20 hover:bg-red-500/10 hover:text-red-300"
                        onClick={() => setDisconnectTarget({ ...connected, platformName: platform.name })}
                      >
                        <Unplug className="w-4 h-4" />
                        Desconectar
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full"
                      onClick={() => handleConnect(platform)}
                    >
                      Conectar {platform.name}
                    </Button>
                  )}
                </div>
              )
            })}

            {/* Coming soon card */}
            <div className="relative bg-[#111827] border border-[var(--border)] rounded-xl p-6 opacity-60">
              <div className="w-14 h-14 rounded-xl bg-gray-800 flex items-center justify-center mb-4 text-gray-400">
                <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">X / Twitter</h3>
              <p className="text-sm text-gray-400 mb-4 leading-relaxed">
                Comparte clips y promociones en X
              </p>
              <Badge variant="pending">
                <Clock className="w-3 h-3 mr-1" />
                Proximamente
              </Badge>
            </div>
          </div>

          {/* Empty state if nothing connected */}
          {accounts.length === 0 && (
            <div className="pt-4">
              <EmptyState
                icon={Globe}
                title="Sin cuentas conectadas"
                description="Conecta al menos una red social para poder publicar tus videos directamente desde ClipAI Pro."
              />
            </div>
          )}
        </>
      )}

      {/* Disconnect confirmation modal */}
      <Modal
        isOpen={!!disconnectTarget}
        onClose={() => setDisconnectTarget(null)}
        title="Desconectar cuenta"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-red-500/10">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <p className="text-sm text-gray-300">
              Estas seguro de que quieres desconectar tu cuenta de{' '}
              <span className="font-medium text-white">
                {disconnectTarget?.platformName}
              </span>
              ? Ya no podras publicar directamente en esta plataforma.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setDisconnectTarget(null)}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              loading={disconnectMutation.isPending}
              onClick={() => disconnectMutation.mutate(disconnectTarget.id)}
            >
              Desconectar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
