import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Check, VolumeX } from 'lucide-react'
import { catalogAPI } from '../../api/endpoints'
import Modal from '../ui/Modal'
import Spinner from '../ui/Spinner'
import Badge from '../ui/Badge'

const CATEGORY_TABS = [
  { id: 'all', label: 'Todos' },
  { id: 'epico', label: 'Epico' },
  { id: 'terror', label: 'Terror' },
  { id: 'alegre', label: 'Alegre' },
  { id: 'lofi', label: 'Lofi' },
  { id: 'drama', label: 'Drama' },
]

const CATEGORY_VARIANTS = {
  epico: 'info',
  terror: 'error',
  alegre: 'success',
  lofi: 'pending',
  drama: 'warning',
}

export default function MusicModal({ isOpen, onClose, onSelect, selectedId }) {
  const [categoryFilter, setCategoryFilter] = useState('all')

  const { data: musicData, isLoading } = useQuery({
    queryKey: ['catalog-music'],
    queryFn: () => catalogAPI.music(),
    select: (res) => res.data,
    enabled: isOpen,
  })

  const tracks = musicData?.results || musicData || []

  const filteredTracks = useMemo(() => {
    if (categoryFilter === 'all') return tracks
    return tracks.filter(
      (track) =>
        track.category?.toLowerCase() === categoryFilter ||
        track.genre?.toLowerCase() === categoryFilter
    )
  }, [tracks, categoryFilter])

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Seleccionar musica" size="lg">
      {/* Category Tabs */}
      <div className="flex gap-1 mb-4 p-1 rounded-lg bg-[var(--surface)] overflow-x-auto">
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setCategoryFilter(tab.id)}
            className={`
              px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all duration-200
              ${
                categoryFilter === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* No Music Option */}
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={`
          w-full flex items-center gap-3 p-3 rounded-lg border mb-2 text-left transition-all duration-200
          ${
            !selectedId
              ? 'border-blue-500 bg-blue-500/10'
              : 'border-[var(--border)] bg-[var(--surface)] hover:border-gray-600'
          }
        `}
      >
        <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
          <VolumeX className="w-4 h-4 text-gray-400" />
        </div>
        <div className="flex-1">
          <span className="text-sm font-medium text-gray-300">Sin musica</span>
        </div>
        {!selectedId && <Check className="w-4 h-4 text-blue-400 shrink-0" />}
      </button>

      {/* Tracks Grid */}
      <div className="max-h-72 overflow-y-auto pr-1 -mr-1 space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Spinner />
          </div>
        ) : filteredTracks.length > 0 ? (
          filteredTracks.map((track) => {
            const isSelected = selectedId === track.id
            const category = track.category || track.genre || ''
            return (
              <button
                key={track.id}
                type="button"
                onClick={() => onSelect(track)}
                className={`
                  w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all duration-200
                  ${
                    isSelected
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-[var(--border)] bg-[var(--surface)] hover:border-gray-600'
                  }
                `}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white truncate">
                      {track.name}
                    </span>
                    {category && (
                      <Badge variant={CATEGORY_VARIANTS[category.toLowerCase()] || 'info'}>
                        {category}
                      </Badge>
                    )}
                  </div>
                </div>
                {isSelected && <Check className="w-4 h-4 text-blue-400 shrink-0" />}
              </button>
            )
          })
        ) : (
          <p className="text-sm text-gray-500 text-center py-8">
            No se encontraron pistas en esta categoria
          </p>
        )}
      </div>
    </Modal>
  )
}
