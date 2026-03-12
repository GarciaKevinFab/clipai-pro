import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { videosAPI } from '../api/endpoints'
import { useToast } from '../hooks/useToast'
import Button from '../components/ui/Button'
import WizardStep1 from '../components/wizard/WizardStep1'
import WizardStep2 from '../components/wizard/WizardStep2'
import WizardStep3 from '../components/wizard/WizardStep3'
import GeneratingOverlay from '../components/video/GeneratingOverlay'

const CREDIT_COSTS = { prompt_to_video: 10, sora2: 12, ai_asmr: 12 }

const steps = [
  { number: 1, title: 'Guion' },
  { number: 2, title: 'Edicion' },
  { number: 3, title: 'Generar' },
]

export default function CreateVideo() {
  const navigate = useNavigate()
  const toast = useToast()
  const { user, updateCredits } = useAuthStore()

  const [currentStep, setCurrentStep] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatingVideoId, setGeneratingVideoId] = useState(null)

  const [formData, setFormData] = useState({
    video_type: 'prompt_to_video',
    script: '',
    style: '',
    voice_id: '',
    voice_name: '',
    music_id: '',
    music_name: '',
    format: '9:16',
    clips_count: 3,
    clip_duration: 6,
    title: '',
  })

  const totalCost = (CREDIT_COSTS[formData.video_type] || 10) * formData.clips_count
  const userCredits = user?.credits ?? 0

  const handleGenerate = async () => {
    if (userCredits < totalCost) {
      toast.error('No tienes suficientes creditos para generar este video.')
      return
    }

    setIsGenerating(true)
    try {
      const res = await videosAPI.generate({
        video_type: formData.video_type,
        script: formData.script,
        style: formData.style,
        voice_id: formData.voice_id || undefined,
        music_id: formData.music_id || undefined,
        format: formData.format,
        clips_count: formData.clips_count,
        clip_duration: formData.clip_duration,
        title: formData.title || undefined,
      })

      const videoId = res.data?.id || res.data?.video_id
      updateCredits(userCredits - totalCost)
      setGeneratingVideoId(videoId)
      toast.success('Video en proceso de generacion!')
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.error || 'Error al generar el video'
      toast.error(msg)
      setIsGenerating(false)
    }
  }

  const handleOverlayComplete = () => {
    setGeneratingVideoId(null)
    setIsGenerating(false)
    navigate('/mis-videos')
  }

  const handleOverlayClose = () => {
    setGeneratingVideoId(null)
    setIsGenerating(false)
  }

  return (
    <>
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white font-[family-name:var(--font-heading)]">
            Crear Video
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Configura tu video paso a paso con inteligencia artificial
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center">
          {steps.map((step, i) => (
            <div key={step.number} className="flex items-center">
              {/* Step circle + label */}
              <div className="flex flex-col items-center">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300
                    ${
                      currentStep === step.number
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                        : currentStep > step.number
                          ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                          : 'bg-[var(--surface)] text-gray-500 border border-[var(--border)]'
                    }
                  `}
                >
                  {currentStep > step.number ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.number
                  )}
                </div>
                <span
                  className={`text-xs mt-2 font-medium transition-colors ${
                    currentStep === step.number
                      ? 'text-blue-400'
                      : currentStep > step.number
                        ? 'text-gray-400'
                        : 'text-gray-600'
                  }`}
                >
                  {step.title}
                </span>
              </div>

              {/* Connector line */}
              {i < steps.length - 1 && (
                <div
                  className={`w-16 sm:w-24 h-0.5 mx-3 mb-6 transition-colors ${
                    currentStep > step.number ? 'bg-blue-500/50' : 'bg-[var(--border)]'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="rounded-xl bg-[#111827] border border-[var(--border)] p-6">
          {currentStep === 1 && (
            <WizardStep1 formData={formData} setFormData={setFormData} />
          )}
          {currentStep === 2 && (
            <WizardStep2 formData={formData} setFormData={setFormData} />
          )}
          {currentStep === 3 && (
            <WizardStep3
              formData={formData}
              userCredits={userCredits}
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
            />
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <Button
            variant="secondary"
            onClick={() => setCurrentStep((s) => s - 1)}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </Button>

          {currentStep < 3 ? (
            <Button onClick={() => setCurrentStep((s) => s + 1)}>
              Siguiente
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleGenerate}
              disabled={userCredits < totalCost || isGenerating}
              loading={isGenerating}
            >
              <Sparkles className="w-4 h-4" />
              Generar Video
            </Button>
          )}
        </div>
      </div>

      {/* Generating Overlay */}
      {generatingVideoId && (
        <GeneratingOverlay
          videoId={generatingVideoId}
          onComplete={handleOverlayComplete}
          onClose={handleOverlayClose}
        />
      )}
    </>
  )
}
