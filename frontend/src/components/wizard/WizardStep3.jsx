import { Link } from 'react-router-dom'
import { Sparkles, AlertTriangle, CheckCircle2 } from 'lucide-react'
import Button from '../ui/Button'

const CREDIT_COSTS = { prompt_to_video: 10, sora2: 12, ai_asmr: 12 }

const VIDEO_TYPE_LABELS = {
  prompt_to_video: 'Prompt to Video',
  sora2: 'Sora 2',
  ai_asmr: 'AI ASMR',
}

const FORMAT_LABELS = {
  '9:16': '9:16 Vertical',
  '16:9': '16:9 Horizontal',
  '1:1': '1:1 Cuadrado',
}

export default function WizardStep3({ formData, userCredits, onGenerate, isGenerating }) {
  const costPerClip = CREDIT_COSTS[formData.video_type] || 10
  const totalCost = costPerClip * formData.clips_count
  const hasEnoughCredits = userCredits >= totalCost

  const summaryRows = [
    { label: 'Tipo de video', value: VIDEO_TYPE_LABELS[formData.video_type] || formData.video_type },
    { label: 'Estilo', value: formData.style || 'No seleccionado' },
    { label: 'Voz', value: formData.voice_name || 'No seleccionada' },
    { label: 'Musica', value: formData.music_name || 'Sin musica' },
    { label: 'Formato', value: FORMAT_LABELS[formData.format] || formData.format },
    { label: 'Clips', value: `${formData.clips_count} clips` },
    { label: 'Duracion por clip', value: `${formData.clip_duration} segundos` },
  ]

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
        <div className="px-5 py-3 border-b border-[var(--border)]">
          <h3 className="text-sm font-semibold text-white">Resumen de configuracion</h3>
        </div>
        <div className="divide-y divide-[var(--border)]">
          {summaryRows.map((row) => (
            <div key={row.label} className="flex items-center justify-between px-5 py-3">
              <span className="text-sm text-gray-400">{row.label}</span>
              <span className="text-sm font-medium text-white">{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Desglose de costos</h3>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">
            {costPerClip} creditos por clip &times; {formData.clips_count} clips
          </span>
          <span className="text-lg font-bold text-blue-400">{totalCost} creditos</span>
        </div>
        <div className="flex items-center justify-between text-sm mt-2 pt-2 border-t border-blue-500/10">
          <span className="text-gray-400">Tus creditos disponibles</span>
          <span className={`font-semibold ${hasEnoughCredits ? 'text-emerald-400' : 'text-red-400'}`}>
            {userCredits}
          </span>
        </div>
      </div>

      {/* Credit Check */}
      {hasEnoughCredits ? (
        <div className="flex items-center gap-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-4 py-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm text-emerald-400">
            Tienes suficientes creditos para generar este video
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          <div className="flex-1">
            <span className="text-sm text-red-400">
              No tienes suficientes creditos. Necesitas {totalCost - userCredits} creditos mas.
            </span>
            <Link
              to="/precios"
              className="block text-sm text-blue-400 hover:text-blue-300 mt-1 transition-colors"
            >
              Obtener mas creditos →
            </Link>
          </div>
        </div>
      )}

      {/* Generate Button */}
      <div className="flex justify-center pt-2">
        <Button
          size="lg"
          onClick={onGenerate}
          disabled={!hasEnoughCredits || isGenerating}
          loading={isGenerating}
          className="w-full sm:w-auto"
        >
          <Sparkles className="w-5 h-5" />
          Generar Video
        </Button>
      </div>
    </div>
  )
}
