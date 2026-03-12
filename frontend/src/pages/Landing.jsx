import { Link } from 'react-router-dom'
import {
  Check,
  ChevronRight,
  PenLine,
  Palette,
  Rocket,
  Star,
  Wand2,
  X,
  Zap,
} from 'lucide-react'
import Button from '../components/ui/Button'
import Footer from '../components/layout/Footer'

/* ─────────────────── Data ─────────────────── */

const avatarSeeds = ['Maria', 'Carlos', 'Ana', 'Pedro', 'Sofia']

const styles = [
  { name: 'Anime', emoji: '🎌', gradient: 'from-pink-600/40 to-purple-600/40' },
  { name: 'Cartoon', emoji: '🎨', gradient: 'from-yellow-500/40 to-orange-500/40' },
  { name: 'Cinematografico', emoji: '🎬', gradient: 'from-blue-600/40 to-cyan-500/40' },
  { name: 'Terror', emoji: '👻', gradient: 'from-red-700/40 to-gray-800/40' },
  { name: 'Lego', emoji: '🧱', gradient: 'from-yellow-400/40 to-red-500/40' },
  { name: 'Minecraft', emoji: '⛏️', gradient: 'from-green-600/40 to-emerald-500/40' },
]

const steps = [
  {
    icon: PenLine,
    title: 'Escribe tu guion',
    desc: 'Escribe o genera tu guion con IA',
  },
  {
    icon: Palette,
    title: 'Personaliza el estilo',
    desc: 'Elige estilo visual, voz y musica',
  },
  {
    icon: Wand2,
    title: 'Genera con IA',
    desc: 'Nuestra IA crea tu video en minutos',
  },
  {
    icon: Rocket,
    title: 'Publica y crece',
    desc: 'Sube directo a TikTok, YouTube e Instagram',
  },
]

const comparisonRows = [
  { feature: 'Creditos gratis', clip: '0', pro: '5' },
  { feature: 'Guion max', clip: '1,100 chars', pro: '2,000 chars' },
  { feature: 'Instagram Reels', clip: false, pro: true },
  { feature: 'Historial videos', clip: false, pro: true },
  { feature: 'Terminos/Privacidad', clip: false, pro: true },
  { feature: 'Afiliados completo', clip: false, pro: true },
  { feature: 'Reembolso auto', clip: false, pro: true },
  { feature: 'Precios en soles', clip: false, pro: true },
]

const testimonials = [
  {
    name: 'Maria Rodriguez',
    platform: 'TikTok',
    followers: '45K',
    seed: 'Maria',
    quote:
      'ClipAI Pro me ahorra horas de edicion. Publico 3 videos al dia y mi cuenta no para de crecer.',
  },
  {
    name: 'Carlos Mendez',
    platform: 'YouTube',
    followers: '120K',
    seed: 'Carlos',
    quote:
      'La calidad de los videos es increible. Mis suscriptores no creen que los hago con IA.',
  },
  {
    name: 'Ana Sofia Lima',
    platform: 'Instagram',
    followers: '89K',
    seed: 'Ana',
    quote:
      'Antes tardaba todo el dia editando un reel. Ahora genero contenido profesional en minutos.',
  },
  {
    name: 'Pedro Gutierrez',
    platform: 'TikTok',
    followers: '230K',
    seed: 'Pedro',
    quote:
      'El estilo anime fue un hit total en mi cuenta. Mis videos virales empezaron gracias a ClipAI Pro.',
  },
  {
    name: 'Valentina Torres',
    platform: 'YouTube',
    followers: '67K',
    seed: 'Valentina',
    quote:
      'Increible herramienta. La voz en español suena natural y la musica queda perfecta.',
  },
  {
    name: 'Diego Ramirez',
    platform: 'Instagram',
    followers: '155K',
    seed: 'Diego',
    quote:
      'Como creador de contenido, ClipAI Pro es mi arma secreta. Lo recomiendo a todos mis colegas.',
  },
]

/* ─────────────────── Component Helpers ─────────────────── */

function ComparisonCell({ value }) {
  if (typeof value === 'boolean') {
    return value ? (
      <Check className="w-5 h-5 text-emerald-400 mx-auto" />
    ) : (
      <X className="w-5 h-5 text-red-400 mx-auto" />
    )
  }
  return <span className="text-sm text-gray-300">{value}</span>
}

/* ─────────────────── Landing Page ─────────────────── */

export default function Landing() {
  return (
    <div className="min-h-screen bg-[var(--bg)] overflow-hidden">
      {/* ═══════════════════ HERO ═══════════════════ */}
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-28 px-4">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[120px]" />
          <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white font-[family-name:var(--font-heading)] leading-tight mb-6">
            Crea Videos Virales
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              con IA en Minutos
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Genera contenido profesional para TikTok, YouTube e Instagram.
            Sin experiencia tecnica.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <Link to="/signup">
              <Button size="lg" className="text-base px-8 py-3.5">
                <Zap className="w-5 h-5" />
                Crear mi primer video gratis
              </Button>
            </Link>
            <Link to="/precios">
              <Button variant="outline" size="lg" className="text-base px-8 py-3.5">
                Ver precios
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {/* Social proof */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex -space-x-2">
              {avatarSeeds.map((seed) => (
                <img
                  key={seed}
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`}
                  alt=""
                  className="w-9 h-9 rounded-full border-2 border-[var(--bg)] bg-gray-700"
                />
              ))}
            </div>
            <p className="text-sm text-gray-400">
              <span className="text-white font-semibold">162,747+</span>{' '}
              creadores ya usan ClipAI Pro
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════ GALLERY ═══════════════════ */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white font-[family-name:var(--font-heading)] text-center mb-4">
            Estilos para cada tipo de contenido
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-lg mx-auto">
            Elige entre multiples estilos visuales para darle a tus videos un
            look unico y profesional.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {styles.map((style) => (
              <div
                key={style.name}
                className={`group relative rounded-2xl bg-gradient-to-br ${style.gradient} border border-white/10 p-6 text-center hover:scale-105 transition-transform duration-300 cursor-default`}
              >
                <span className="text-4xl mb-3 block">{style.emoji}</span>
                <span className="text-sm font-semibold text-white">
                  {style.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ HOW IT WORKS ═══════════════════ */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent via-blue-950/20 to-transparent">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white font-[family-name:var(--font-heading)] text-center mb-4">
            Como funciona
          </h2>
          <p className="text-gray-400 text-center mb-14 max-w-lg mx-auto">
            De la idea al video viral en 4 simples pasos.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <div key={i} className="text-center group">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-500/20 transition-colors">
                  <step.icon className="w-7 h-7 text-blue-400" />
                </div>
                <div className="text-xs font-bold text-blue-400/60 mb-2">
                  Paso {i + 1}
                </div>
                <h3 className="text-base font-semibold text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ COMPARISON ═══════════════════ */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white font-[family-name:var(--font-heading)] text-center mb-4">
            Por que ClipAI Pro?
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-lg mx-auto">
            Comparanos con la competencia y decide por ti mismo.
          </p>

          <div className="rounded-2xl border border-[var(--border)] overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-3 bg-white/5">
              <div className="px-5 py-4 text-sm font-medium text-gray-400">
                Caracteristica
              </div>
              <div className="px-5 py-4 text-sm font-medium text-gray-400 text-center">
                ClipShort
              </div>
              <div className="px-5 py-4 text-sm font-medium text-center">
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent font-semibold">
                  ClipAI Pro
                </span>
              </div>
            </div>

            {/* Table rows */}
            {comparisonRows.map((row, i) => (
              <div
                key={i}
                className={`grid grid-cols-3 ${
                  i % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.02]'
                } border-t border-[var(--border)]`}
              >
                <div className="px-5 py-3.5 text-sm text-gray-300">
                  {row.feature}
                </div>
                <div className="px-5 py-3.5 text-center">
                  <ComparisonCell value={row.clip} />
                </div>
                <div className="px-5 py-3.5 text-center">
                  <ComparisonCell value={row.pro} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ TESTIMONIALS ═══════════════════ */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent via-purple-950/15 to-transparent">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white font-[family-name:var(--font-heading)] text-center mb-4">
            Lo que dicen nuestros creadores
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-lg mx-auto">
            Miles de creadores de contenido confian en ClipAI Pro para hacer
            crecer sus redes.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-6 hover:border-purple-500/30 transition-colors"
              >
                {/* Stars */}
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star
                      key={j}
                      className="w-4 h-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-sm text-gray-300 leading-relaxed mb-5">
                  &ldquo;{t.quote}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${t.seed}`}
                    alt=""
                    className="w-10 h-10 rounded-full bg-gray-700"
                  />
                  <div>
                    <p className="text-sm font-medium text-white">{t.name}</p>
                    <p className="text-xs text-gray-500">
                      {t.platform} &middot; {t.followers} seguidores
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ FINAL CTA ═══════════════════ */}
      <section className="py-24 px-4">
        <div className="relative max-w-3xl mx-auto text-center">
          {/* Glow */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px]" />
          </div>

          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-bold text-white font-[family-name:var(--font-heading)] mb-4">
              Empieza gratis &mdash; sin tarjeta de credito
            </h2>
            <p className="text-gray-400 mb-8">
              5 creditos de bienvenida incluidos. Crea tu primer video hoy.
            </p>
            <Link to="/signup">
              <Button size="lg" className="text-base px-10 py-4">
                <Zap className="w-5 h-5" />
                Crear mi cuenta gratis
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════ FOOTER ═══════════════════ */}
      <Footer />
    </div>
  )
}
