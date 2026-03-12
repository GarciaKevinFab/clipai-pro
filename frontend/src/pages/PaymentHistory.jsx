import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Receipt, CreditCard } from 'lucide-react'
import Badge from '../components/ui/Badge'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import { paymentsAPI } from '../api/endpoints'

const statusMap = {
  completed: { label: 'Completado', variant: 'success' },
  approved: { label: 'Aprobado', variant: 'success' },
  pending: { label: 'Pendiente', variant: 'pending' },
  failed: { label: 'Fallido', variant: 'error' },
  refunded: { label: 'Reembolsado', variant: 'warning' },
}

export default function PaymentHistory() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['payment-history'],
    queryFn: () => paymentsAPI.history().then((res) => res.data),
  })

  const payments = data?.results ?? data ?? []

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const formatAmount = (amount) => {
    if (amount == null) return '-'
    return Number(amount).toFixed(2)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white font-[family-name:var(--font-heading)]">
            Historial de Pagos
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Revisa tus transacciones y comprobantes
          </p>
        </div>
        <Link to="/precios">
          <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/15 border border-blue-500/20 rounded-lg transition-colors">
            <CreditCard className="w-4 h-4" />
            Ver planes
          </button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : isError ? (
        <div className="rounded-xl bg-[var(--card)] border border-[var(--border)] p-8 text-center">
          <p className="text-sm text-red-400">
            Error al cargar el historial de pagos. Intenta de nuevo.
          </p>
        </div>
      ) : payments.length === 0 ? (
        <div className="rounded-xl bg-[var(--card)] border border-[var(--border)]">
          <EmptyState
            icon={Receipt}
            title="Sin pagos registrados"
            description="Aun no tienes transacciones. Adquiere un plan para comenzar a crear videos ilimitados."
            actionLabel="Ver planes"
            onAction={() => window.location.href = '/precios'}
          />
        </div>
      ) : (
        <div className="rounded-xl bg-[var(--card)] border border-[var(--border)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Fecha
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Plan
                  </th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Monto (S/)
                  </th>
                  <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Estado
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Metodo
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {payments.map((payment) => {
                  const status = statusMap[payment.status] || {
                    label: payment.status,
                    variant: 'info',
                  }
                  return (
                    <tr
                      key={payment.id}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-6 py-4 text-gray-300 whitespace-nowrap">
                        {formatDate(payment.created_at || payment.date)}
                      </td>
                      <td className="px-6 py-4 text-white font-medium whitespace-nowrap">
                        {payment.plan_name || payment.plan || '-'}
                      </td>
                      <td className="px-6 py-4 text-right text-white font-medium tabular-nums whitespace-nowrap">
                        {formatAmount(payment.amount)}
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </td>
                      <td className="px-6 py-4 text-gray-400 whitespace-nowrap">
                        {payment.payment_method || payment.method || '-'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
