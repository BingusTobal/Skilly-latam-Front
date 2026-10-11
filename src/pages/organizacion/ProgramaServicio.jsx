import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { mensajeDeError } from '../../api/axios'
import { obtenerServicio } from '../../api/catalogo'
import { disponibilidadServicio, slotsServicio } from '../../api/reservas'
import Alerta from '../../components/Alerta'
import { FORMATOS, formatearCLP } from '../../lib/formato'

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
    if (!fechaSel) return
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

  if (cargando) {
    return <p className="p-8 text-center text-sm text-gray-500">Cargando…</p>
  }
  if (!servicio) {
    return (
      <div className="p-8 text-center">
        <Alerta>{error || 'Servicio no encontrado.'}</Alerta>
        <Link to="/catalogo" className="mt-3 inline-block text-[13px] underline">
          Volver al catálogo
        </Link>
      </div>
    )
  }

  const primerDia = new Date(mes.getFullYear(), mes.getMonth(), 1)
  const offset = (primerDia.getDay() + 6) % 7
  const totalDiasMes = new Date(mes.getFullYear(), mes.getMonth() + 1, 0).getDate()
  const celdas = []
  for (let i = 0; i < offset; i += 1) celdas.push(null)
  for (let d = 1; d <= totalDiasMes; d += 1) celdas.push(d)

  const mesActual = mes.getFullYear() === hoy.getFullYear() && mes.getMonth() === hoy.getMonth()

  return (
    <div className="pt-5">
      <Link
        to={`/servicios/${id}`}
        className="text-[13px] text-gray-600 no-underline"
      >
        &larr; Volver al servicio
      </Link>

      <div className="mb-5 mt-3 flex items-center justify-between border border-black px-4 py-3">
        <div>
          <h1 className="text-[15px] font-bold">{servicio.titulo}</h1>
          <p className="text-[12px] text-gray-500">
            Duración estimada: {servicio.duracion_estimada || 'A convenir'} · Modalidad:{' '}
            {FORMATOS[servicio.formato]}
          </p>
        </div>
        <span className="text-[15px] font-bold text-brand-red">
          {formatearCLP(servicio.precio)}
        </span>
      </div>

      <h2 className="text-[15px] font-bold">Programa tu servicio</h2>
      <p className="mb-4 text-[12px] text-gray-500">
        Revisa la disponibilidad y elige la fecha y hora que más te convengan.
      </p>

      {error && (
        <div className="mb-4">
          <Alerta>{error}</Alerta>
        </div>
      )}

      <div className="flex flex-col gap-8 md:flex-row">
        <div className="flex-1">
          <div className="mb-2 flex items-center justify-between text-[13px]">
            <button
              type="button"
              onClick={() => cambiarMes(-1)}
              className="px-2 disabled:opacity-30"
              disabled={mesActual}
            >
              &lsaquo;
            </button>
            <span className="font-bold">
              {MESES[mes.getMonth()]} {mes.getFullYear()}
            </span>
            <button type="button" onClick={() => cambiarMes(1)} className="px-2">
              &rsaquo;
            </button>
          </div>
          <p className="mb-3 text-[11px] text-gray-400">
            Hora estándar de Chile (GMT-3/-4)
          </p>

          <div className="mb-5 grid grid-cols-7 gap-1 text-center text-[12px]">
            {DIAS.map((d) => (
              <div key={d} className="text-[11px] text-gray-400">
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
                  className={`py-2 ${
                    seleccionado
                      ? 'bg-navy font-bold text-white'
                      : habilitado
                        ? 'text-navy hover:bg-sky'
                        : 'text-gray-300'
                  }`}
                >
                  {dia}
                </button>
              )
            })}
          </div>

          {cargandoDias && (
            <p className="text-[12px] text-gray-400">Cargando disponibilidad…</p>
          )}

          {fechaSel && (
            <>
              <p className="mb-2 text-[13px] font-bold">Horarios disponibles</p>
              {slots.filter((s) => s.disponible).length === 0 ? (
                <p className="text-[12.5px] text-gray-500">
                  No quedan horarios libres ese día.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {slots.map((slot) => (
                    <button
                      key={slot.hora_inicio}
                      type="button"
                      disabled={!slot.disponible}
                      onClick={() => setHoraSel(slot.hora_inicio)}
                      className={`border py-[9px] text-center text-[13px] ${
                        horaSel === slot.hora_inicio
                          ? 'border-navy bg-navy font-bold text-white'
                          : slot.disponible
                            ? 'border-gray-400 hover:border-black'
                            : 'cursor-not-allowed border-gray-200 text-gray-300 line-through'
                      }`}
                    >
                      {slot.hora_inicio}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <aside className="w-full shrink-0 md:w-72">
          <div className="sticky top-5 border border-black p-4">
            <strong className="text-[13px]">Tu reserva</strong>
            <div className="mt-3 space-y-1.5 text-[12px]">
              <div className="flex justify-between border-b border-gray-100 py-1">
                <span className="text-gray-500">Fecha</span>
                <span>{fechaSel || 'Por elegir'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 py-1">
                <span className="text-gray-500">Hora</span>
                <span>{horaSel || 'Por elegir'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 py-1">
                <span className="text-gray-500">Modalidad</span>
                <span>{FORMATOS[servicio.formato]}</span>
              </div>
              <div className="flex justify-between py-1 text-[13px] font-bold">
                <span>Total</span>
                <span className="text-brand-red">{formatearCLP(servicio.precio)}</span>
              </div>
            </div>

            <button
              type="button"
              disabled={!fechaSel || !horaSel}
              onClick={() =>
                navigate(
                  `/servicios/${id}/reservar?fecha=${fechaSel}&hora=${horaSel}`,
                )
              }
              className="mt-4 w-full bg-black py-3 text-[13px] text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Solicitar reserva
            </button>
            <p className="mt-2 text-[10.5px] leading-snug text-gray-500">
              Si el profesional acepta, el pago queda autorizado y se libera al
              confirmar la entrega.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
