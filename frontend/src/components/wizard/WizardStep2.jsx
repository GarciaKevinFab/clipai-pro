import { useState } from 'react'
import { Mic, Music, RectangleVertical, RectangleHorizontal, Square, Minus, Plus } from 'lucide-react'
import VoiceModal from '../video/VoiceModal'
import MusicModal from '../video/MusicModal'

const CREDIT_COSTS = { prompt_to_video: 10, sora2: 12, ai_asmr: 12 }

const FORMATS = [
  { value: '9:16', label: '9:16 Vertical', icon: RectangleVertical },
  { value: '16:9', label: '16:9 Horizontal', icon: RectangleHorizontal },
  { value: '1:1', label: '1:1 Cuadrado', icon: Square },
]

const DURATIONS = [4, 6, 8, 12]

export default function WizardStep2({ formData, setFormData }) {
  const [voiceModalOpen, setVoiceModalOpen] = useState(false)
  const [musicModalOpen, setMusicModalOpen] = useState(false)

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const costPerClip = CREDIT_COSTS[formData.video_type] || 10
  const totalCost = costPerClip * formData.clips_count

  return (
    <div className="space-y-8">
      {/* Voice Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Voz
        </label>
        <button
          type="button"
          onClick={() => setVoiceModalOpen(true)}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-[var(--border)]
            bg-[var(--surface)] hover:border-gray-600 transition-colors text-left"
        >
          <Mic className="w-5 h-5 text-gray-400 shrink-0" />
          <span className={formData.voice_name ? 'text-sm text-white' : 'text-sm text-gray-500'}>
            {formData.voice_name || 'Seleccionar voz'}
          </span>
        </button>
      </div>

      {/* Music Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Musica de fondo
        </label>
        <button
          type="button"
          onClick={() => setMusicModalOpen(true)}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-[var(--border)]
            bg-[var(--surface)] hover:border-gray-600 transition-colors text-left"
        >
          <Music className="w-5 h-5 text-gray-400 shrink-0" />
          <span className={formData.music_name ? 'text-sm text-white' : 'text-sm text-gray-500'}>
            {formData.music_name || 'Sin musica (opcional)'}
          </span>
        </button>
      </div>

      {/* Format Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Formato
        </label>
        <div className="grid grid-cols-3 gap-2">
          {FORMATS.map((fmt) => {
            const Icon = fmt.icon
            const isSelected = formData.format === fmt.value
            return (
              <button
                key={fmt.value}
                type="button"
                onClick={() => updateField('format', fmt.value)}
                className={`
                  flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200
                  ${
                    isSelected
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-[var(--surface)] border-[var(--border)] text-gray-400 hover:border-gray-600'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {fmt.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Clips Count */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-300">
            Cantidad de clips
          </label>
          <span className="text-xs text-gray-500">
            {costPerClip} cred/clip &times; {formData.clips_count} = {totalCost} creditos
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => updateField('clips_count', Math.max(1, formData.clips_count - 1))}
            disabled={formData.clips_count <= 1}
            className="w-10 h-10 rounded-lg border border-[var(--border)] bg-[var(--surface)] flex items-center justify-center
              text-gray-400 hover:border-gray-600 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Minus className="w-4 h-4" />
          </button>
          <div className="flex-1 relative">
            <input
              type="range"
              min={1}
              max={10}
              value={formData.clips_count}
              onChange={(e) => updateField('clips_count', parseInt(e.target.value))}
              className="w-full h-2 rounded-full appearance-none bg-[var(--surface)] cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:shadow-lg
                [&::-webkit-slider-thumb]:shadow-blue-500/30 [&::-webkit-slider-thumb]:cursor-pointer"
            />
            <div className="text-center mt-2">
              <span className="text-lg font-bold text-white">{formData.clips_count}</span>
              <span className="text-xs text-gray-500 ml-1">clips</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => updateField('clips_count', Math.min(10, formData.clips_count + 1))}
            disabled={formData.clips_count >= 10}
            className="w-10 h-10 rounded-lg border border-[var(--border)] bg-[var(--surface)] flex items-center justify-center
              text-gray-400 hover:border-gray-600 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Clip Duration */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Duracion por clip
        </label>
        <div className="grid grid-cols-4 gap-2">
          {DURATIONS.map((dur) => {
            const isSelected = formData.clip_duration === dur
            return (
              <button
                key={dur}
                type="button"
                onClick={() => updateField('clip_duration', dur)}
                className={`
                  px-3 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200
                  ${
                    isSelected
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-[var(--surface)] border-[var(--border)] text-gray-400 hover:border-gray-600'
                  }
                `}
              >
                {dur}s
              </button>
            )
          })}
        </div>
      </div>

      {/* Cost Summary */}
      <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-300">Costo total</span>
          <span className="text-lg font-bold text-blue-400">{totalCost} creditos</span>
        </div>
      </div>

      {/* Modals */}
      <VoiceModal
        isOpen={voiceModalOpen}
        onClose={() => setVoiceModalOpen(false)}
        selectedId={formData.voice_id}
        onSelect={(voice) => {
          updateField('voice_id', voice.id)
          updateField('voice_name', voice.name)
          setVoiceModalOpen(false)
        }}
      />
      <MusicModal
        isOpen={musicModalOpen}
        onClose={() => setMusicModalOpen(false)}
        selectedId={formData.music_id}
        onSelect={(track) => {
          updateField('music_id', track?.id || '')
          updateField('music_name', track?.name || '')
          setMusicModalOpen(false)
        }}
      />
    </div>
  )
}
