import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, User, UserRound, Check } from 'lucide-react'
import { catalogAPI } from '../../api/endpoints'
import Modal from '../ui/Modal'
import Spinner from '../ui/Spinner'

const GENDER_TABS = [
  { id: 'all', label: 'Todos' },
  { id: 'male', label: 'Masculino' },
  { id: 'female', label: 'Femenino' },
]

export default function VoiceModal({ isOpen, onClose, onSelect, selectedId }) {
  const [search, setSearch] = useState('')
  const [genderFilter, setGenderFilter] = useState('all')

  const { data: voicesData, isLoading } = useQuery({
    queryKey: ['catalog-voices'],
    queryFn: () => catalogAPI.voices(),
    select: (res) => res.data,
    enabled: isOpen,
  })

  const voices = voicesData?.results || voicesData || []

  const filteredVoices = useMemo(() => {
    return voices.filter((voice) => {
      const matchesSearch =
        !search ||
        voice.name?.toLowerCase().includes(search.toLowerCase()) ||
        voice.description?.toLowerCase().includes(search.toLowerCase())

      const matchesGender =
        genderFilter === 'all' || voice.gender === genderFilter

      return matchesSearch && matchesGender
    })
  }, [voices, search, genderFilter])

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Seleccionar voz" size="lg">
      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar voz por nombre..."
          className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm text-white placeholder-gray-500
            bg-[var(--surface)] border border-[var(--border)] transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)]"
        />
      </div>

      {/* Gender Filter Tabs */}
      <div className="flex gap-1 mb-4 p-1 rounded-lg bg-[var(--surface)]">
        {GENDER_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setGenderFilter(tab.id)}
            className={`
              flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200
              ${
                genderFilter === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Voices Grid */}
      <div className="max-h-80 overflow-y-auto pr-1 -mr-1 space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Spinner />
          </div>
        ) : filteredVoices.length > 0 ? (
          filteredVoices.map((voice) => {
            const isSelected = selectedId === voice.id
            return (
              <button
                key={voice.id}
                type="button"
                onClick={() => onSelect(voice)}
                className={`
                  w-full flex items-start gap-3 p-3 rounded-lg border text-left transition-all duration-200
                  ${
                    isSelected
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-[var(--border)] bg-[var(--surface)] hover:border-gray-600'
                  }
                `}
              >
                {/* Gender Icon */}
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    voice.gender === 'female'
                      ? 'bg-pink-500/10'
                      : 'bg-blue-500/10'
                  }`}
                >
                  {voice.gender === 'female' ? (
                    <UserRound className="w-4 h-4 text-pink-400" />
                  ) : (
                    <User className="w-4 h-4 text-blue-400" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white truncate">
                      {voice.name}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-blue-400 shrink-0" />}
                  </div>
                  {voice.description && (
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                      {voice.description}
                    </p>
                  )}
                  {voice.tags && voice.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {voice.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-1.5 py-0.5 text-[10px] rounded bg-white/5 text-gray-500"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </button>
            )
          })
        ) : (
          <p className="text-sm text-gray-500 text-center py-8">
            No se encontraron voces
          </p>
        )}
      </div>
    </Modal>
  )
}
