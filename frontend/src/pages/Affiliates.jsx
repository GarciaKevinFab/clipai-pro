import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Users,
  DollarSign,
  Copy,
  Check,
  Link2,
  Share2,
  UserPlus,
  Wallet,
  TrendingUp,
  Calculator,
  Gift,
  CreditCard,
} from 'lucide-react'
import { affiliatesAPI } from '../api/endpoints'
import { useToast } from '../hooks/useToast'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Spinner from '../components/ui/Spinner'

/* ─────────────────── Helpers ─────────────────── */

function formatCurrency(amount) {
  if (amount == null) return 'S/ 0.00'
  return `S/ ${Number(amount).toFixed(2)}`
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const comissionStatusMap = {
  paid: { label: 'Pagado', variant: 'success' },
  pending: { label: 'Pendiente', variant: 'warning' },
  cancelled: { label: 'Cancelado', variant: 'error' },
}

/* ─────────────────── Sub-components ─────────────────── */

function StatCard({ icon: Icon, label, value, accent = false }) {
  return (
    <div className="bg-[#111827] border border-[var(--border)] rounded-xl p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg ${accent ? 'bg-blue-500/10 text-blue-400' : 'bg-white/5 text-gray-400'}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-sm text-gray-400">{label}</span>
      </div>
      <p className="text-2xl font-bold text-white font-[family-name:var(--font-heading)]">
        {value}
      </p>
    </div>
  )
}

function CopyLinkBox({ link }) {
  const [copied, setCopied] = useState(false)
  const inputRef = useRef(null)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      inputRef.current?.select()
      document.execCommand('copy')
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="bg-[#111827] border border-[var(--border)] rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <Link2 className="w-5 h-5 text-blue-400" />
        <h3 className="text-sm font-medium text-white">Tu enlace de referido</h3>
      </div>
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          readOnly
          value={link}
          className="flex-1 bg-[#07090f] border border-[var(--border)] rounded-lg px-4 py-2.5 text-sm text-gray-300 font-mono truncate focus:outline-none focus:border-blue-500/50"
        />
        <Button
          variant={copied ? 'primary' : 'secondary'}
          onClick={handleCopy}
          className="shrink-0"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Copiado!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copiar
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

function EarningsCalculator() {
  const [refs, setRefs] = useState(10)
  const avgPlan = 159
  const comission = 0.30
  const monthly = refs * avgPlan * comission
  const annual = monthly * 12

  return (
    <div className="bg-[#111827] border border-[var(--border)] rounded-xl p-6">
      <div className="flex items-center gap-2 mb-5">
        <Calculator className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-white font-[family-name:var(--font-heading)]">
          Calculadora de Ganancias
        </h3>
      </div>

      <div className="space-y-6">
        {/* Slider */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-gray-400">Numero de referidos</label>
            <span className="text-lg font-bold text-blue-400">{refs}</span>
          </div>
          <input
            type="range"
            min={1}
            max={500}
            value={refs}
            onChange={(e) => setRefs(Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer accent-blue-500
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
              [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:shadow-lg
              [&::-webkit-slider-thumb]:shadow-blue-500/30 [&::-webkit-slider-thumb]:cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span>1</span>
            <span>500</span>
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[#07090f] border border-[var(--border)] rounded-lg p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">Comision</p>
            <p className="text-lg font-bold text-emerald-400">30%</p>
          </div>
          <div className="bg-[#07090f] border border-[var(--border)] rounded-lg p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">Ganancia Mensual</p>
            <p className="text-lg font-bold text-white">{formatCurrency(monthly)}</p>
          </div>
          <div className="bg-[#07090f] border border-[var(--border)] rounded-lg p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">Ganancia Anual</p>
            <p className="text-lg font-bold text-blue-400">{formatCurrency(annual)}</p>
          </div>
        </div>

        <p className="text-xs text-gray-500 text-center">
          Basado en un plan promedio de S/ {avgPlan} por referido
        </p>
      </div>
    </div>
  )
}

function HowItWorks() {
  const steps = [
    {
      icon: Share2,
      title: 'Comparte tu link',
      description: 'Envia tu enlace de referido a tus amigos, seguidores o comunidad.',
    },
    {
      icon: UserPlus,
      title: 'Tu referido se registra',
      description: 'Cuando alguien se registra usando tu enlace, queda vinculado a tu cuenta.',
    },
    {
      icon: Wallet,
      title: 'Gana 30% por cada pago',
      description: 'Recibe el 30% de comision por cada pago que realice tu referido.',
    },
  ]

  return (
    <div className="bg-[#111827] border border-[var(--border)] rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-6 font-[family-name:var(--font-heading)]">
        Como funciona
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((step, i) => (
          <div key={i} className="text-center">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mx-auto mb-3">
              <step.icon className="w-6 h-6 text-blue-400" />
            </div>
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center mx-auto mb-3">
              {i + 1}
            </div>
            <h4 className="text-sm font-medium text-white mb-1">{step.title}</h4>
            <p className="text-xs text-gray-400 leading-relaxed">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─────────────────── Main Page ─────────────────── */

export default function Affiliates() {
  const queryClient = useQueryClient()
  const toast = useToast()

  // Fetch affiliate profile
  const {
    data: profile,
    isLoading: profileLoading,
  } = useQuery({
    queryKey: ['affiliate-profile'],
    queryFn: () => affiliatesAPI.profile().then((res) => res.data),
  })

  // Fetch earnings (only if affiliate)
  const { data: earnings } = useQuery({
    queryKey: ['affiliate-earnings'],
    queryFn: () => affiliatesAPI.earnings().then((res) => res.data),
    enabled: !!profile?.is_affiliate,
  })

  // Fetch referral link (only if affiliate)
  const { data: linkData } = useQuery({
    queryKey: ['affiliate-link'],
    queryFn: () => affiliatesAPI.link().then((res) => res.data),
    enabled: !!profile?.is_affiliate,
  })

  // Fetch referrals table (only if affiliate)
  const { data: referralsData } = useQuery({
    queryKey: ['affiliate-referrals'],
    queryFn: () => affiliatesAPI.referrals().then((res) => res.data),
    enabled: !!profile?.is_affiliate,
  })

  // Activate mutation
  const activateMutation = useMutation({
    mutationFn: () => affiliatesAPI.activate(),
    onSuccess: () => {
      toast.success('Te has convertido en afiliado exitosamente!')
      queryClient.invalidateQueries({ queryKey: ['affiliate-profile'] })
    },
    onError: () => {
      toast.error('Error al activar el programa de afiliados')
    },
  })

  const isAffiliate = profile?.is_affiliate
  const referralLink = linkData?.url || linkData?.link || ''
  const referrals = referralsData?.results ?? []

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Hero section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-blue-800/20 border border-blue-500/20 p-8 md:p-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10">
              <Gift className="w-7 h-7 text-blue-400" />
            </div>
            <Badge variant="info">Programa activo</Badge>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 font-[family-name:var(--font-heading)]">
            Programa de Afiliados
          </h1>
          <p className="text-lg text-gray-300 max-w-xl">
            Gana <span className="text-blue-400 font-semibold">30% de comision</span> por cada
            referido que se suscriba a ClipAI Pro
          </p>

          {!isAffiliate && (
            <div className="mt-6">
              <Button
                size="lg"
                loading={activateMutation.isPending}
                onClick={() => activateMutation.mutate()}
              >
                <Users className="w-5 h-5" />
                Conviertete en Afiliado
              </Button>
            </div>
          )}
        </div>
      </div>

      {isAffiliate && (
        <>
          {/* Referral link */}
          <CopyLinkBox link={referralLink} />

          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={Users}
              label="Total Referidos"
              value={earnings?.total_referrals ?? 0}
              accent
            />
            <StatCard
              icon={DollarSign}
              label="Ganancias del Mes"
              value={formatCurrency(earnings?.monthly_earnings)}
            />
            <StatCard
              icon={TrendingUp}
              label="Pendiente de Cobro"
              value={formatCurrency(earnings?.pending_amount)}
            />
            <StatCard
              icon={Wallet}
              label="Total Historico"
              value={formatCurrency(earnings?.total_earnings)}
            />
          </div>

          {/* Calculator */}
          <EarningsCalculator />

          {/* Referrals table */}
          <div className="bg-[#111827] border border-[var(--border)] rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--border)]">
              <h3 className="text-lg font-semibold text-white font-[family-name:var(--font-heading)]">
                Mis Referidos
              </h3>
            </div>

            {referrals.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Users className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                <p className="text-sm text-gray-400">
                  Aun no tienes referidos. Comparte tu enlace para comenzar a ganar.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--border)]">
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                        Usuario
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                        Fecha
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                        Plan
                      </th>
                      <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                        Comision (S/)
                      </th>
                      <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {referrals.map((ref, i) => {
                      const status = comissionStatusMap[ref.status] || comissionStatusMap.pending
                      return (
                        <tr key={ref.id || i} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-4 text-sm text-gray-300">
                            {ref.username || ref.email || '-'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-400">
                            {formatDate(ref.date || ref.created_at)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-300">
                            {ref.plan || '-'}
                          </td>
                          <td className="px-6 py-4 text-sm text-white text-right font-medium">
                            {formatCurrency(ref.commission || ref.amount)}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <Badge variant={status.variant}>{status.label}</Badge>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* How it works */}
          <HowItWorks />

          {/* Payment info */}
          <div className="bg-[#111827] border border-[var(--border)] rounded-xl p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <CreditCard className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-white">Informacion de pago</h3>
                <p className="text-sm text-gray-400">
                  Se paga el 1ro de cada mes via transferencia bancaria o Yape
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* How it works (also show when not affiliate) */}
      {!isAffiliate && <HowItWorks />}
    </div>
  )
}
