import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Play,
  Download,
  Trash2,
  Film,
  Clock,
  Monitor,
  AlertTriangle,
} from 'lucide-react'
import { videosAPI } from '../api/endpoints'
import { useToast } from '../hooks/useToast'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Spinner from '../components/ui/Spinner'
import Modal from '../components/ui/Modal'
import EmptyState from '../components/ui/EmptyState'

/* ─────────────────── Constants ─────────────────── */

const TABS = [
  { key: '', label: 'Todos' },
  { key: 'completed', label: 'Listos' },
  { key: 'processing', label: 'En proceso' },
  { key: 'failed', label: 'Fallidos' },
]

const statusMap = {
  completed: { label: 'Completado', variant: 'success' },
  processing: { label: 'Generando', variant: 'info', pulse: true },
  failed: { label: 'Fallido', variant: 'error' },
  pending: { label: 'Pendiente', variant: 'pending' },
}

/* ─────────────────── Helpers ─────────────────── */

function formatDuration(seconds) {
  if (!seconds) return '--:--'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

/* ─────────────────── VideoCard ─────────────────── */

function VideoCard({ video, onDelete }) {
  const status = statusMap[video.status] || statusMap.pending

  return (
    <div className="group relative bg-[#111827] border border-[var(--border)] rounded-xl overflow-hidden transition-all duration-200 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5">
      {/* Thumbnail */}
      <div className="relative aspect-[9/16] overflow-hidden">
        {video.thumbnail_url ? (
          <img
            src={video.thumbnail_url}
            alt={video.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 flex items-center justify-center">
            <Film className="w-10 h-10 text-gray-600" />
          </div>
        )}

        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Play className="w-6 h-6 text-white fill-white" />
          </div>
        </div>

        {/* Status badge */}
        <div className="absolute top-2 left-2">
          <Badge variant={status.variant} className={status.pulse ? 'animate-pulse' : ''}>
            {status.label}
          </Badge>
        </div>

        {/* Hover actions */}
        <div className="absolute bottom-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {video.status === 'completed' && video.video_url && (
            <a
              href={video.video_url}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-black/60 backdrop-blur-sm text-white hover:bg-blue-600 transition-colors"
              title="Descargar"
            >
              <Download className="w-4 h-4" />
            </a>
          )}
          <button
            onClick={() => onDelete(video)}
            className="p-2 rounded-lg bg-black/60 backdrop-blur-sm text-white hover:bg-red-600 transition-colors"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 space-y-1.5">
        <h3 className="text-sm font-medium text-white truncate" title={video.title}>
          {video.title || 'Sin titulo'}
        </h3>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="inline-flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDuration(video.duration)}
          </span>
          {video.resolution && (
            <span className="inline-flex items-center gap-1">
              <Monitor className="w-3 h-3" />
              {video.resolution}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─────────────────── Main Page ─────────────────── */

export default function MyVideos() {
  const queryClient = useQueryClient()
  const toast = useToast()

  const [activeFilter, setActiveFilter] = useState('')
  const [page, setPage] = useState(1)
  const [allVideos, setAllVideos] = useState([])
  const [deleteTarget, setDeleteTarget] = useState(null)

  // Fetch videos
  const { isLoading, isFetching, data } = useQuery({
    queryKey: ['my-videos', activeFilter, page],
    queryFn: () =>
      videosAPI
        .list({ status: activeFilter || undefined, page })
        .then((res) => res.data),
    onSuccess: (newData) => {
      const results = newData?.results ?? []
      if (page === 1) {
        setAllVideos(results)
      } else {
        setAllVideos((prev) => [...prev, ...results])
      }
    },
  })

  const hasMore = data?.next != null

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => videosAPI.delete(id),
    onSuccess: () => {
      toast.success('Video eliminado correctamente')
      setDeleteTarget(null)
      setPage(1)
      queryClient.invalidateQueries({ queryKey: ['my-videos'] })
    },
    onError: () => {
      toast.error('Error al eliminar el video')
    },
  })

  const handleFilterChange = useCallback((key) => {
    setActiveFilter(key)
    setPage(1)
    setAllVideos([])
  }, [])

  const handleLoadMore = () => {
    setPage((p) => p + 1)
  }

  // Derive displayed videos
  const videos = allVideos.length > 0 ? allVideos : (data?.results ?? [])

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white font-[family-name:var(--font-heading)]">
          Mis Videos
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Gestiona todos tus videos generados con IA
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 p-1 bg-[#111827] border border-[var(--border)] rounded-xl w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleFilterChange(tab.key)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              activeFilter === tab.key
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading && page === 1 ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : videos.length === 0 ? (
        <EmptyState
          icon={Film}
          title="No hay videos"
          description={
            activeFilter
              ? 'No se encontraron videos con este filtro.'
              : 'Aun no has creado ningun video. Crea tu primer video con IA.'
          }
        />
      ) : (
        <>
          {/* Video grid */}
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
            {videos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>

          {/* Load more */}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button
                variant="secondary"
                onClick={handleLoadMore}
                loading={isFetching && page > 1}
              >
                Cargar mas videos
              </Button>
            </div>
          )}
        </>
      )}

      {/* Delete confirmation modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Eliminar video"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-red-500/10">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-300">
                Estas seguro de que quieres eliminar{' '}
                <span className="font-medium text-white">
                  {deleteTarget?.title || 'este video'}
                </span>
                ? Esta accion no se puede deshacer.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              loading={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate(deleteTarget.id)}
            >
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
