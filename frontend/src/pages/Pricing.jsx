import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import {
  Check,
  ChevronDown,
  CreditCard,
  Shield,
  Sparkles,
  Star,
  Zap,
} from 'lucide-react'
import { catalogAPI, paymentsAPI } from '../api/endpoints'
import { useAuthStore } from '../store/authStore'
import { useToast } from '../hooks/useToast'
import Button from '../components/ui/Button'
import Spinner from '../components/ui/Spinner'
import Modal from '../components/ui/Modal'
import Footer from '../components/layout/Footer'

/* ─────────────────── FAQ Data ─────────────────── */

const faqItems = [
  {
    question: 'Como funcionan los creditos?',
    answer:
      'Cada credito te permite generar un video completo con IA. Los creditos no expiran y se acumulan si compras mas de un plan. Al registrarte recibes 5 creditos gratuitos para que pruebes la plataforma.',
  },
  {
    question: 'Puedo cancelar mi plan en cualquier momento?',
    answer:
      'Si, puedes cancelar tu plan cuando quieras desde la configuracion de tu cuenta. Los creditos que ya compraste seguiran disponibles hasta que los uses.',
  },
  {
    question: 'Que metodos de pago aceptan?',
    answer:
      'Aceptamos tarjetas Visa, Mastercard y American Express a traves de Culqi, la pasarela de pago lider en Peru. Todos los pagos son seguros y en soles peruanos.',
  },
  {
    question: 'Ofrecen reembolsos?',
    answer:
      'Si, ofrecemos una garantia de reembolso de 7 dias. Si no estas satisfecho con el servicio, contactanos y te devolvemos tu dinero sin preguntas.',
  },
  {
    question: 'Los creditos expiran?',
    answer:
      'No, los creditos que compras no tienen fecha de vencimiento. Puedes usarlos cuando quieras a tu propio ritmo.',
  },
]

/* ─────────────────── FAQ Accordion ─────────────────── */

function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border border-[var(--border)] rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-white/5 transition-colors"
      >
        <span className="text-sm font-medium text-white">{question}</span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 flex-shrink-0 ml-4 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          open ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <p className="px-6 pb-4 text-sm text-gray-400 leading-relaxed">
          {answer}
        </p>
      </div>
    </div>
  )
}

/* ─────────────────── Checkout Modal ─────────────────── */

function CheckoutModal({ isOpen, onClose, plan }) {
  const toast = useToast()
  const { updateUser } = useAuthStore()
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')

  const chargeMutation = useMutation({
    mutationFn: (data) => paymentsAPI.createCharge(data),
    onSuccess: (res) => {
      const data = res.data
      if (data.credits !== undefined) {
        updateUser({ credits: data.credits, plan: data.plan || plan.name })
      }
      toast.success('Pago procesado correctamente. Creditos agregados!')
      onClose()
    },
    onError: (err) => {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Error al procesar el pago. Intenta de nuevo.'
      toast.error(msg)
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!cardNumber || !expiry || !cvv) {
      toast.error('Completa todos los campos de la tarjeta.')
      return
    }
    chargeMutation.mutate({
      plan_id: plan.id,
      culqi_token: 'tok_test',
    })
  }

  if (!plan) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirmar compra">
      {/* Plan summary */}
      <div className="rounded-lg bg-white/5 border border-[var(--border)] p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-white">{plan.name}</span>
          <span className="text-lg font-bold text-white">
            S/ {plan.price}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Zap className="w-3.5 h-3.5 text-yellow-400" />
          <span>{plan.credits} creditos incluidos</span>
        </div>
      </div>

      {/* Card form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">
            Numero de tarjeta
          </label>
          <input
            type="text"
            placeholder="4111 1111 1111 1111"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            maxLength={19}
            className="w-full px-3 py-2.5 bg-white/5 border border-[var(--border)] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">
              Vencimiento
            </label>
            <input
              type="text"
              placeholder="MM/AA"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              maxLength={5}
              className="w-full px-3 py-2.5 bg-white/5 border border-[var(--border)] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">CVV</label>
            <input
              type="text"
              placeholder="123"
              value={cvv}
              onChange={(e) => setCvv(e.target.value)}
              maxLength={4}
              className="w-full px-3 py-2.5 bg-white/5 border border-[var(--border)] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
            />
          </div>
        </div>

        <p className="text-[11px] text-gray-500 italic">
          En produccion se usara Culqi.js para tokenizar la tarjeta de forma
          segura.
        </p>

        <Button
          type="submit"
          className="w-full"
          size="lg"
          loading={chargeMutation.isPending}
        >
          <CreditCard className="w-4 h-4" />
          Pagar S/ {plan.price}
        </Button>
      </form>
    </Modal>
  )
}

/* ─────────────────── Plan Card ─────────────────── */

function PlanCard({ plan, onSelect, isPopular }) {
  const periodLabel =
    plan.period === 'weekly'
      ? 'semanal'
      : plan.period === 'monthly'
        ? 'mensual'
        : plan.period

  return (
    <div
      className={`relative rounded-2xl border p-6 flex flex-col transition-all duration-300 hover:-translate-y-1 ${
        isPopular
          ? 'border-purple-500/50 bg-gradient-to-b from-purple-500/10 via-[var(--card)] to-[var(--card)] shadow-xl shadow-purple-500/10 scale-[1.03] z-10'
          : 'border-[var(--border)] bg-[var(--card)] hover:border-blue-500/30'
      }`}
    >
      {/* Popular badge */}
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg">
            <Star className="w-3 h-3" />
            Mas popular
          </span>
        </div>
      )}

      {/* Plan name */}
      <h3 className="text-lg font-bold text-white font-[family-name:var(--font-heading)] mb-4">
        {plan.name}
      </h3>

      {/* Price */}
      <div className="mb-1">
        {plan.original_price &&
          Number(plan.original_price) !== Number(plan.price) && (
            <span className="text-sm text-gray-500 line-through mr-2">
              S/ {plan.original_price}
            </span>
          )}
        <span className="text-3xl font-bold text-white font-[family-name:var(--font-heading)]">
          S/ {plan.price}
        </span>
      </div>
      <span className="text-xs text-gray-400 mb-5">{periodLabel}</span>

      {/* Credits */}
      <div className="flex items-center gap-2 mb-5 px-3 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
        <Zap className="w-4 h-4 text-yellow-400" />
        <span className="text-sm font-semibold text-yellow-400">
          {plan.credits} creditos
        </span>
      </div>

      {/* Features */}
      <ul className="flex-1 space-y-2.5 mb-6">
        {(plan.features || []).map((feature, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
            <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Button
        onClick={() => onSelect(plan)}
        variant={isPopular ? 'primary' : 'outline'}
        size="lg"
        className={`w-full ${
          isPopular
            ? '!bg-gradient-to-r !from-purple-600 !to-blue-600 hover:!from-purple-500 hover:!to-blue-500 !shadow-lg !shadow-purple-500/20'
            : ''
        }`}
      >
        {isPopular ? (
          <>
            <Sparkles className="w-4 h-4" />
            Empezar ahora
          </>
        ) : (
          'Elegir plan'
        )}
      </Button>
    </div>
  )
}

/* ─────────────────── Pricing Page ─────────────────── */

export default function Pricing() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  const {
    data: plans,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['plans'],
    queryFn: () => catalogAPI.plans(),
    select: (res) => res.data,
  })

  const handleSelectPlan = (plan) => {
    if (!isAuthenticated) {
      navigate('/signup')
      return
    }
    setSelectedPlan(plan)
    setCheckoutOpen(true)
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* ─── Header ─── */}
      <section className="pt-20 pb-12 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white font-[family-name:var(--font-heading)] mb-4">
          Elige tu plan
        </h1>
        <p className="text-gray-400 max-w-md mx-auto">
          Precios en soles peruanos. Cancela cuando quieras.
        </p>
      </section>

      {/* ─── Plan Cards ─── */}
      <section className="max-w-6xl mx-auto px-4 md:px-8 pb-20">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-gray-400">
              Error al cargar los planes. Intenta de nuevo.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
            {(plans || []).map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onSelect={handleSelectPlan}
                isPopular={plan.is_popular}
              />
            ))}
          </div>
        )}
      </section>

      {/* ─── Guarantee ─── */}
      <section className="max-w-3xl mx-auto px-4 pb-16">
        <div className="flex items-center gap-4 px-6 py-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <Shield className="w-8 h-8 text-emerald-400 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-emerald-400">
              Garantia de 7 dias
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Si no estas satisfecho, te devolvemos tu dinero. Sin preguntas.
            </p>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="max-w-3xl mx-auto px-4 md:px-8 pb-20">
        <h2 className="text-2xl font-bold text-white font-[family-name:var(--font-heading)] text-center mb-8">
          Preguntas frecuentes
        </h2>
        <div className="space-y-3">
          {faqItems.map((item, i) => (
            <FAQItem key={i} question={item.question} answer={item.answer} />
          ))}
        </div>
      </section>

      {/* ─── CTA bottom ─── */}
      {!isAuthenticated && (
        <section className="max-w-3xl mx-auto px-4 pb-20 text-center">
          <p className="text-gray-400 mb-4">
            Registrate gratis y recibe 5 creditos de bienvenida.
          </p>
          <Link to="/signup">
            <Button size="lg">
              <Sparkles className="w-4 h-4" />
              Crear cuenta gratis
            </Button>
          </Link>
        </section>
      )}

      <Footer />

      {/* ─── Checkout Modal ─── */}
      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => {
          setCheckoutOpen(false)
          setSelectedPlan(null)
        }}
        plan={selectedPlan}
      />
    </div>
  )
}
