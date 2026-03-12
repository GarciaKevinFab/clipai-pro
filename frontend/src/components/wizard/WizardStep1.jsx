import { useQuery } from '@tanstack/react-query'
import { Video, Sparkles, Mic } from 'lucide-react'
import { catalogAPI } from '../../api/endpoints'
import Spinner from '../ui/Spinner'

const VIDEO_TYPES = [
  {
    id: 'prompt_to_video',
    name: 'Prompt to Video',
    description: 'IA genera imagenes + voz + subtitulos',
    cost: 10,
    icon: Sparkles,
  },
  {
    id: 'sora2',
    name: 'Sora 2',
    description: 'Video hiperrealista generado por IA',
    cost: 12,
    icon: Video,
  },
  {
    id: 'ai_asmr',
    name: 'AI ASMR',
    description: 'Videos ASMR con voz susurrante',
    cost: 12,
    icon: Mic,
  },
]

const SCRIPT_MAX_LENGTH = 2000

export default function WizardStep1({ formData, setFormData }) {
  const { data: stylesData, isLoading: stylesLoading } = useQuery({
    queryKey: ['catalog-styles'],
    queryFn: () => catalogAPI.styles(),
    select: (res) => res.data,
  })

  const styles = stylesData?.results || stylesData || []

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-8">
      {/* Video Type Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Tipo de video
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {VIDEO_TYPES.map((type) => {
            const Icon = type.icon
            const isSelected = formData.video_type === type.id
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => updateField('video_type', type.id)}
                className={`
                  relative flex flex-col items-start p-4 rounded-xl border text-left transition-all duration-200
                  ${
                    isSelected
                      ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10'
                      : 'border-[var(--border)] bg-[var(--surface)] hover:border-gray-600'
                  }
                `}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                    isSelected ? 'bg-blue-500/20' : 'bg-white/5'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isSelected ? 'text-blue-400' : 'text-gray-400'}`} />
                </div>
                <h3 className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                  {type.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1">{type.description}</p>
                <span
                  className={`text-xs font-medium mt-3 px-2 py-0.5 rounded-full ${
                    isSelected
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-white/5 text-gray-500'
                  }`}
                >
                  {type.cost} cred/clip
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Script Textarea */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-300">
            Guion del video
          </label>
          <span
            className={`text-xs ${
              formData.script.length >= SCRIPT_MAX_LENGTH
                ? 'text-red-400'
                : 'text-gray-500'
            }`}
          >
            {formData.script.length}/{SCRIPT_MAX_LENGTH}
          </span>
        </div>
        <textarea
          value={formData.script}
          onChange={(e) => {
            if (e.target.value.length <= SCRIPT_MAX_LENGTH) {
              updateField('script', e.target.value)
            }
          }}
          maxLength={SCRIPT_MAX_LENGTH}
          rows={6}
          placeholder="Escribe el guion de tu video aqui. Describe la historia, el mensaje o el contenido que quieres comunicar. La IA usara este texto para generar las imagenes, la voz y los subtitulos."
          className="w-full px-3.5 py-2.5 rounded-lg text-sm text-white placeholder-gray-500
            bg-[var(--surface)] border border-[var(--border)] transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-[var(--bg)]
            focus:border-[var(--accent)] focus:ring-[var(--accent)]/50 resize-none"
        />
      </div>

      {/* Style Grid */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Estilo visual
        </label>
        {stylesLoading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner />
          </div>
        ) : styles.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {styles.map((style) => {
              const isSelected = formData.style === (style.id || style.slug || style.name)
              return (
                <button
                  key={style.id || style.slug || style.name}
                  type="button"
                  onClick={() => updateField('style', style.id || style.slug || style.name)}
                  className={`
                    flex flex-col items-center justify-center p-3 rounded-lg border text-center transition-all duration-200
                    ${
                      isSelected
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-[var(--border)] bg-[var(--surface)] hover:border-gray-600'
                    }
                  `}
                >
                  <span className="text-2xl mb-1">{style.emoji || style.icon || '🎨'}</span>
                  <span className={`text-xs font-medium ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                    {style.name || style.label}
                  </span>
                </button>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">
            No se pudieron cargar los estilos
          </p>
        )}
      </div>
    </div>
  )
}
