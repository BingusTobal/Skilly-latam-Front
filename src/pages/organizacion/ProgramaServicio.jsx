import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { mensajeDeError } from '../../api/axios'
import { obtenerServicio } from '../../api/catalogo'
import { disponibilidadServicio, slotsServicio } from '../../api/reservas'
import Alerta from '../../components/Alerta'
import Icon from '../../components/Icon'
import {
  Boton,
  BotonEnlace,
  Card,
  Migas,
  Precio,
  Skeleton,
} from '../../components/ui'
import { FORMATOS } from '../../lib/formato'

const MESES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
]
const DIAS = ['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom']

function iso(fecha) {
  const y = fecha.getFullYear()
  const m = String(fecha.getMonth() + 1).padStart(2, '0')
  const d = String(fecha.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function CargandoPrograma() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-24 w-full rounded-[20px]" />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Skeleton className="h-[420px] w-full rounded-[20px]" />
        <Skeleton className="h-[300px] w-full rounded-[20px]" />
      </div>
    </div>
  )
}

export default function ProgramaServicio() {
  const { id } = useParams()
  const navigate = useNavigate()

  const hoy = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const [servicio, setServicio] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const [mes, setMes] = useState(() => new Date(hoy.getFullYear(), hoy.getMonth(), 1))
  const [dias, setDias] = useState({})
  const [cargandoDias, setCargandoDias] = useState(false)

  const [fechaSel, setFechaSel] = useState('')
  const [slots, setSlots] = useState([])
  const [horaSel, setHoraSel] = useState('')

  useEffect(() => {
    let activo = true
    setCargando(true)
    obtenerServicio(id)
      .then((data) => activo && setServicio(data))
      .catch(() => activo && setError('No pudimos cargar el servicio.'))
      .finally(() => activo && setCargando(false))
    return () => {
      activo = false
    }
  }, [id])

  useEffect(() => {
    let activo = true
    const primerDia = new Date(mes.getFullYear(), mes.getMonth(), 1)
    const ultimoDia = new Date(mes.getFullYear(), mes.getMonth() + 1, 0)
    const desde = primerDia < hoy ? hoy : primerDia
    const totalDias = Math.round((ultimoDia - desde) / 86400000) + 1

    if (totalDias <= 0) {
      setDias({})
      return undefined
    }

    setCargandoDias(true)
    disponibilidadServicio(id, { desde: iso(desde), dias: totalDias })
      .then((data) => {
        if (!activo) return
        setDias(Object.fromEntries(data.dias.map((d) => [d.fecha, d.libres])))
      })
      .catch(() => {})
      .finally(() => activo && setCargandoDias(false))
    return () => {
      activo = false
    }
  }, [mes, id, hoy])

  useEffect(() => {
    if (!fechaSel) return undefined
    let activo = true
    setSlots([])
    setHoraSel('')
    slotsServicio(id, fechaSel)
      .then((data) => activo && setSlots(data.slots || []))
      .catch((err) => activo && setError(mensajeDeError(err)))
    return () => {
      activo = false
    }
  }, [id, fechaSel])

  function cambiarMes(delta) {
    setMes((actual) => new Date(actual.getFullYear(), actual.getMonth() + delta, 1))
    setFechaSel('')
    setHoraSel('')
  }

  if (cargando) return <CargandoPrograma />

  if (!servicio) {
    return (
      <div className="mx-auto max-w-lg py-10 text-center">
        <Alerta>{error || 'Servicio no encontrado.'}</Alerta>
        <BotonEnlace to="/catalogo" variante="secundario" className="mt-5">
          Volver al catálogo
        </BotonEnlace>
      </div>
    )
  }

  const primerDia = new Date(mes.getFullYear(), mes.getMonth(), 1)
  const offset = (primerDia.getDay() + 6) % 7
  const totalDiasMes = new Date(mes.getFullYear(), mes.getMonth() + 1, 0).getDate()
  const celdas = []
  for (let i = 0; i < offset; i += 1) celdas.push(null)
  for (let d = 1; d <= totalDiasMes; d += 1) celdas.push(d)

  const mesActual =
    mes.getFullYear() === hoy.getFullYear() && mes.getMonth() === hoy.getMonth()
  const horariosDisponibles = slots.filter((s) => s.disponible)

  return (
    <div>
      <Migas
        className="mb-4"
        items={[
          { texto: 'Catálogo', to: '/catalogo' },
          { texto: servicio.titulo, to: `/servicios/${id}` },
          { texto: 'Programar' },
        ]}
      />

      <Card className="mb-6 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-brand-blue">
              Programa tu servicio
            </p>
            <h1 className="mt-1 text-[1.25rem] font-extrabold tracking-[-0.02em] text-ink">
              {servicio.titulo}
            </h1>
            <p className="mt-1 text-[0.8125rem] text-ink-3">
              {FORMATOS[servicio.formato]} · {servicio.duracion_estimada || 'A convenir'}
            </p>
          </div>
          <Precio valor={servicio.precio} nota="" tamano="md" className="text-right" />
        </div>
      </Card>

      {error && (
        <div className="mb-5">
          <Alerta>{error}</Alerta>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-6">
          <Card className="p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-[1.0625rem] font-bold text-ink">Elige una fecha</h2>
                <p className="mt-0.5 flex items-center gap-1.5 text-[0.75rem] text-ink-3">
                  <Icon nombre="clock" className="h-3.5 w-3.5" />
                  Hora estándar de Chile (GMT-3/-4)
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <Boton
                  variante="secundario"
                  tamano="sm"
                  className="px-2.5"
                  onClick={() => cambiarMes(-1)}
                  disabled={mesActual}
                  aria-label="Mes anterior"
                >
                  <Icon nombre="arrow-left" className="h-4 w-4" />
                </Boton>
                <span className="min-w-[132px] text-center text-[0.875rem] font-bold text-ink">
                  {MESES[mes.getMonth()]} {mes.getFullYear()}
                </span>
                <Boton
                  variante="secundario"
                  tamano="sm"
                  className="px-2.5"
                  onClick={() => cambiarMes(1)}
                  aria-label="Mes siguiente"
                >
                  <Icon nombre="arrow-right" className="h-4 w-4" />
                </Boton>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center">
              {DIAS.map((d) => (
                <div
                  key={d}
                  className="pb-1.5 text-[0.6875rem] font-bold uppercase tracking-wide text-ink-3"
                >
                  {d}
                </div>
              ))}
              {celdas.map((dia, indice) => {
                if (dia === null) return <div key={`v-${indice}`} />
                const fecha = iso(new Date(mes.getFullYear(), mes.getMonth(), dia))
                const libres = dias[fecha] || 0
                const pasado = new Date(mes.getFullYear(), mes.getMonth(), dia) < hoy
                const habilitado = libres > 0 && !pasado
                const seleccionado = fecha === fechaSel
                return (
                  <button
                    key={fecha}
                    type="button"
                    disabled={!habilitado}
                    onClick={() => {
                      setFechaSel(fecha)
                      setHoraSel('')
                    }}
                    title={
                      habilitado
                        ? `${libres} horario${libres === 1 ? '' : 's'} disponible${libres === 1 ? '' : 's'}`
                        : 'Sin disponibilidad'
                    }
                    className={`relative mx-auto grid h-10 w-full max-w-[46px] place-items-center rounded-xl text-[0.875rem] font-semibold transition ${
                      seleccionado
                        ? 'bg-brand-blue text-white shadow-[0_8px_18px_-8px_rgba(43,100,240,0.8)]'
                        : habilitado
                          ? 'text-ink-2 hover:bg-brand-blue-soft hover:text-brand-blue-deep'
                          : 'cursor-not-allowed text-ink-3/40'
                    }`}
                  >
                    {dia}
                    {habilitado && !seleccionado && (
                      <span className="absolute bottom-1 h-1 w-1 rounded-full bg-brand-mint" />
                    )}
                  </button>
                )
              })}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-line pt-3 text-[0.75rem] font-semibold text-ink-3">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-mint" />
                Con disponibilidad
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-blue" />
                Seleccionado
              </span>
              {cargandoDias && (
                <span className="ml-auto inline-flex items-center gap-1.5">
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-brand-blue border-t-transparent" />
                  Cargando disponibilidad…
                </span>
              )}
            </div>
          </Card>

          {fechaSel && (
            <Card className="p-5 sm:p-6">
              <h2 className="text-[1.0625rem] font-bold text-ink">Horarios disponibles</h2>
              <p className="mt-0.5 mb-4 text-[0.75rem] text-ink-3">
                Selecciona el bloque que prefieras para el {fechaSel.split('-').reverse().join('/')}.
              </p>
              {slots.length === 0 ? (
                <p className="inline-flex items-center gap-2 text-[0.875rem] text-ink-3">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-blue border-t-transparent" />
                  Consultando horarios…
                </p>
              ) : horariosDisponibles.length === 0 ? (
                <div className="rounded-xl bg-warn-soft px-4 py-3 text-[0.875rem] font-semibold text-warn">
                  No quedan horarios libres ese día. Prueba con otra fecha.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {slots.map((slot) => {
                    const activo = horaSel === slot.hora_inicio
                    return (
                      <button
                        key={slot.hora_inicio}
                        type="button"
                        disabled={!slot.disponible}
                        onClick={() => setHoraSel(slot.hora_inicio)}
                        className={`rounded-xl border px-3 py-2.5 text-center text-[0.8125rem] font-bold transition ${
                          activo
                            ? 'border-brand-blue bg-brand-blue text-white'
                            : slot.disponible
                              ? 'border-line bg-white text-ink-2 hover:border-brand-blue hover:text-brand-blue-deep'
                              : 'cursor-not-allowed border-line/60 bg-canvas text-ink-3/40 line-through'
                        }`}
                      >
                        {slot.hora_inicio}
                      </button>
                    )
                  })}
                </div>
              )}
            </Card>
          )}
        </div>

        <aside className="w-full lg:w-[320px]">
          <div className="lg:sticky lg:top-24">
            <Card className="overflow-hidden">
              <div className="border-b border-line px-5 py-4">
                <h2 className="flex items-center gap-2 text-[0.9375rem] font-bold text-ink">
                  <Icon nombre="calendar" className="h-4 w-4 text-brand-blue" />
                  Tu reserva
                </h2>
              </div>
              <dl className="space-y-2.5 px-5 py-4 text-[0.875rem]">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-ink-3">Fecha</dt>
                  <dd className="font-semibold text-ink">{fechaSel || 'Por elegir'}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-ink-3">Hora</dt>
                  <dd className="font-semibold text-ink">{horaSel || 'Por elegir'}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-ink-3">Modalidad</dt>
                  <dd className="font-semibold text-ink">{FORMATOS[servicio.formato]}</dd>
                </div>
              </dl>
              <div className="border-t border-dashed border-line px-5 py-4">
                <div className="flex items-end justify-between gap-3">
                  <span className="text-[0.875rem] font-semibold text-ink-2">Total</span>
                  <Precio valor={servicio.precio} nota="" tamano="sm" className="text-right" />
                </div>
              </div>
              <div className="px-5 pb-5">
                <Boton
                  tamano="lg"
                  className="w-full"
                  disabled={!fechaSel || !horaSel}
                  onClick={() =>
                    navigate(
                      `/servicios/${id}/reservar?fecha=${fechaSel}&hora=${horaSel}`,
                    )
                  }
                >
                  Continuar
                  <Icon nombre="arrow-right" className="h-4 w-4" />
                </Boton>
                <p className="mt-2.5 text-[0.75rem] leading-relaxed text-ink-3">
                  El profesional confirma la solicitud. El pago queda en custodia y se
                  libera al confirmar la entrega.
                </p>
              </div>
            </Card>
          </div>
        </aside>
      </div>
    </div>
  )
}
