export type MedioPago =
  | 'efectivo'
  | 'mercado_pago'
  | 'debito_visa'

export interface Tenant {
  id: string
  slug: string
  business_name: string
  owner_name: string | null
  phone: string | null
  active: boolean
  trial_ends_at: string
  plan: string
  feature_caja: boolean
  feature_presupuestos: boolean
  signup_channel: string | null
  onboarding_completed_at: string | null
  dias_abiertos_semana: number
  created_at: string
}

export interface Profile {
  id: string
  tenant_id: string
  full_name: string | null
  role: 'owner' | 'staff' | 'superadmin'
  created_at: string
}

export interface Venta {
  id: string
  tenant_id: string
  fecha: string
  total: number
  medio_pago: MedioPago
  descripcion: string | null
  created_at: string
}

export interface Gasto {
  id: string
  tenant_id: string
  fecha: string
  monto: number
  medio_pago: Extract<MedioPago, 'efectivo' | 'mercado_pago'>
  descripcion: string
  categoria: string | null
  created_at: string
}

export interface Producto {
  id: string
  tenant_id: string
  nombre: string
  created_at: string
}

export interface Cliente {
  id: string
  tenant_id: string
  nombre: string
  telefono: string | null
  created_at: string
}

export interface ClienteConSaldo {
  id: string
  nombre: string
  telefono: string | null
  saldo: number
}

export type EstadoPresupuesto = 'pendiente' | 'parcialmente_cobrado' | 'cobrado' | 'cancelado'

export interface Presupuesto {
  id: string
  tenant_id: string
  numero: number
  cliente_id: string | null
  cliente_nombre: string
  cliente_telefono: string | null
  titulo: string | null
  fecha: string
  fecha_vencimiento: string | null
  monto_total: number
  estado: EstadoPresupuesto
  notas: string | null
  created_at: string
}

export type PresupuestoConSaldo = Presupuesto & {
  pagos_presupuesto: { monto: number }[]
}

export interface PresupuestoItem {
  id: string
  presupuesto_id: string
  descripcion: string
  cantidad: number
  precio_unitario: number
  created_at: string
}

export interface PagoPresupuesto {
  id: string
  tenant_id: string
  presupuesto_id: string
  fecha: string
  monto: number
  medio_pago: 'efectivo' | 'mercado_pago' | 'transferencia'
  notas: string | null
  created_at: string
}

export type SubscriptionStatus = 'pending' | 'authorized' | 'paused' | 'cancelled' | 'past_due'
export type PaymentMethod = 'mercadopago' | 'transferencia'
export type BillingPeriod = 'mensual' | 'anual'

export interface Subscription {
  id: string
  tenant_id: string
  mp_preapproval_id: string | null
  mp_plan_id: string | null
  status: SubscriptionStatus
  payment_method: PaymentMethod
  billing_period: BillingPeriod
  plan_amount_cents: number
  currency: string
  next_payment_date: string | null
  last_payment_at: string | null
  cancelled_at: string | null
  created_at: string
  updated_at: string
}

export type PagoTransferenciaStatus = 'pendiente' | 'en_revision' | 'aprobado' | 'rechazado'

export interface PagoTransferencia {
  id: string
  tenant_id: string
  subscription_id: string
  periodo: BillingPeriod
  amount_cents: number
  currency: string
  vence_at: string
  comprobante_path: string | null
  declared_at: string | null
  status: PagoTransferenciaStatus
  reviewed_at: string | null
  rejection_reason: string | null
  created_at: string
}

export type AvisoPagoTipo =
  | 'pendiente'
  | 'vence_5d'
  | 'vence_3d'
  | 'vencido'
  | 'comprobante_recibido'
  | 'aprobado'
  | 'rechazado'
export type AvisoPagoAudiencia = 'usuario' | 'admin'

export interface AvisoPago {
  id: string
  pago_id: string
  tenant_id: string
  tipo: AvisoPagoTipo
  audiencia: AvisoPagoAudiencia
  sent_at: string
}

export type EstadoSuscripcionTransferencia = 'al_dia' | 'pendiente' | 'en_revision' | 'vencido' | 'bloqueado'

export interface Payment {
  id: string
  subscription_id: string
  tenant_id: string
  mp_payment_id: string
  amount_cents: number
  currency: string
  status: 'approved' | 'rejected' | 'refunded' | 'pending'
  status_detail: string | null
  paid_at: string | null
  invoice_number: string | null
  created_at: string
}

export interface DailyTotal {
  id: string
  tenant_id: string
  fecha: string
  efectivo: number
  mercado_pago: number
  debito_visa: number
  total_ventas: number
  total_gastos: number
  neto: number
  created_at: string
}

export interface CostoFijo {
  id: string
  tenant_id: string
  concepto: string
  monto_mensual: number
  activo: boolean
  created_at: string
  updated_at: string
}

export interface Rubro {
  id: string
  tenant_id: string
  nombre: string
  margen_pct: number
  participacion_pct: number
  activo: boolean
  created_at: string
  updated_at: string
}

export type EstadoSemaforo = 'verde' | 'amarillo' | 'rojo' | 'sin_configurar'

export type PrecisionRentabilidad = 'estimada' | 'afinada'

export interface ResumenRentabilidad {
  margenEfectivo: number
  costosFijosMes: number
  equilibrioDiario: number
  ventasHoy: number
  ventasMes: number
  resultadoMes: number
  estadoSemaforo: EstadoSemaforo
  precision: PrecisionRentabilidad
  costosFijos: CostoFijo[]
  rubros: Rubro[]
  diasAbiertosSemana: number
}
