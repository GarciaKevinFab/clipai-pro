import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  X,
  Check,
  Circle,
  Loader2,
  Download,
  Share2,
  Plus,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react'
import { videosAPI } from '../../api/endpoints'
import Button from '../ui/Button'

const PROGRESS_STEPS = [
  { key: 1, label: 'Analizando guion con IA' },
  { key: 2, label: 'Generando imagenes (Stable Diffusion)' },
  { key: 3, label: 'Sintetizando voz (ElevenLabs)' },
  { key: 4, label: 'Renderizando subtitulos animados' },
  { key: 5, label: 'Ensamblando video (FFMPEG)' },
  { key: 6, label: 'Subiendo a tu biblioteca' },
]

const STATUS_TO_STEP = {
  pending: 1,
  processing: 1,
  generating_images: 2,
  generating_audio: 3,
  rendering: 4,
  uploading: 5,
  completed: 6,
}

export default function GeneratingOverlay({ videoId, onComplete, onClose }) {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [status, setStatus] = useState('pending')
  const [videoData, setVideoData] = useState(null)
  const [error, setError] = useState(null)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (!videoId) return

    const pollStatus = async () => {
      try {
        const res = await videosAPI.status(videoId)
        const data = res.data
        const newStatus = data.status

        setStatus(newStatus)
        setCurrentStep(STATUS_TO_STEP[newStatus] || 1)

        if (newStatus === 'completed') {
          setVideoData(data)
          clearInterval(intervalRef.current)
        } else if (newStatus === 'failed') {
          setError(data.error || 'Error desconocido al generar el video')
          clearInterval(intervalRef.current)
        }
      } catch (err) {
        // Keep polling on network errors
      }
    }

    // Initial poll
    pollStatus()

    // Poll every 3 seconds
    intervalRef.current = setInterval(pollStatus, 3000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [videoId])

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  const progressPercent = status === 'completed'
    ? 100
    : status === 'failed'
      ? 0
      : Math.round((currentStep / PROGRESS_STEPS.length) * 100)

  const handleRetry = () => {
    setError(null)
    setStatus('pending')
    setCurrentStep(1)

    const pollStatus = async () => {
      try {
        const res = await videosAPI.status(videoId)
        const data = res.data
        const newStatus = data.status

        setStatus(newStatus)
        setCurrentStep(STATUS_TO_STEP[newStatus] || 1)

        if (newStatus === 'completed') {
          setVideoData(data)
          clearInterval(intervalRef.current)
        } else if (newStatus === 'failed') {
          setError(data.error || 'Error desconocido al generar el video')
          clearInterval(intervalRef.current)
        }
      } catch {
        // Keep polling
      }
    }

    intervalRef.current = setInterval(pollStatus, 3000)
    pollStatus()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg mx-4">
        {/* Close button (only on error or completed) */}
        {(status === 'completed' || status === 'failed') && (
          <button
            onClick={onClose}
            className="absolute -top-12 right-0 p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="rounded-2xl bg-[#111827] border border-[var(--border)] shadow-2xl overflow-hidden">
          {/* Progress Bar */}
          <div className="h-1 bg-[var(--surface)]">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-700 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="p-6">
            {/* Error State */}
            {status === 'failed' && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white font-[family-name:var(--font-heading)]">
                    Error al generar
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">{error}</p>
                </div>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <Button variant="secondary" onClick={onClose}>
                    <X className="w-4 h-4" />
                    Cerrar
                  </Button>
                  <Button onClick={handleRetry}>
                    <RotateCcw className="w-4 h-4" />
                    Reintentar
                  </Button>
                </div>
              </div>
            )}

            {/* Completed State */}
            {status === 'completed' && videoData && (
              <div className="space-y-5">
                {/* Video Player */}
                {videoData.video_url && (
                  <div className="rounded-lg overflow-hidden bg-black">
                    <video
                      src={videoData.video_url}
                      controls
                      className="w-full max-h-64 object-contain"
                      autoPlay
                      muted
                    />
                  </div>
                )}

                <div className="text-center">
                  <h3 className="text-lg font-semibold text-white font-[family-name:var(--font-heading)]">
                    Video generado con exito
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Tu video esta listo para descargar o publicar
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  {videoData.video_url && (
                    <a
                      href={videoData.video_url}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto"
                    >
                      <Button variant="secondary" className="w-full">
                        <Download className="w-4 h-4" />
                        Descargar
                      </Button>
                    </a>
                  )}
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={() => {
                      onClose()
                      navigate(`/mis-videos/${videoId}`)
                    }}
                  >
                    <Share2 className="w-4 h-4" />
                    Publicar en redes
                  </Button>
                  <Button
                    className="w-full sm:w-auto"
                    onClick={() => {
                      onClose()
                      navigate('/crear-video')
                      window.location.reload()
                    }}
                  >
                    <Plus className="w-4 h-4" />
                    Crear otro video
                  </Button>
                </div>
              </div>
            )}

            {/* Processing State */}
            {status !== 'completed' && status !== 'failed' && (
              <div className="space-y-5">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-white font-[family-name:var(--font-heading)]">
                    Generando tu video
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Este proceso puede tomar unos minutos
                  </p>
                </div>

                {/* Steps */}
                <div className="space-y-3">
                  {PROGRESS_STEPS.map((step) => {
                    const isActive = currentStep === step.key
                    const isComplete = currentStep > step.key
                    const isPending = currentStep < step.key

                    return (
                      <div
                        key={step.key}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300 ${
                          isActive ? 'bg-blue-500/10' : ''
                        }`}
                      >
                        {/* Icon */}
                        <div className="shrink-0">
                          {isComplete ? (
                            <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            </div>
                          ) : isActive ? (
                            <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                              <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center">
                              <Circle className="w-3.5 h-3.5 text-gray-600" />
                            </div>
                          )}
                        </div>

                        {/* Label */}
                        <span
                          className={`text-sm transition-colors ${
                            isActive
                              ? 'text-blue-400 font-medium'
                              : isComplete
                                ? 'text-gray-400'
                                : 'text-gray-600'
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
