import { Fragment, useEffect, useMemo, useState } from 'react'

import { listarDisputasAdmin } from '../../api/admin'
import { mensajeDeError } from '../../api/axios'
import Alerta from '../../components/Alerta'
import StatusBadge from '../../components/StatusBadge'
import { Cargando, Encabezado, Kpi, Vacio } from '../../components/admin/ui'
import {
  ESTADOS_DISPUTA,
  formatearCLP,
  formatearFechaHora,
} from '../../lib/formato'

const FILTROS = [
  ['', 'Todas'],
  ['abierta', 'Abiertas'],
  ['en_revision', 'En revisión'],
  ['resuelta', 'Resueltas'],
]

export default function Disputas() {
  const [disputas, setDisputas] = useState([])
  const [estado, setEstado] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [q, setQ] = useState('')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [expandido, setExpandido] = useState(null)

  useEffect(() => {
    setCargando(true)
    setError('')
    const params = {}
    if (estado) params.estado = estado
    if (q) params.q = q
    listarDisputasAdmin(params)
      .then((res) => setDisputas(res.data.results || res.data))
      .catch((err) => setError(mensajeDeError(err)))
      .finally(() => setCargando(false))
  }, [estado, q])

  const kpis = useMemo(() => {
    const abiertas = disputas.filter((d) => d.estado === 'abierta').length
    const revision = disputas.filter((d) => d.estado === 'en_revision').length
    const resueltas = disputas.filter((d) => d.estado === 'resuelta').length
    const retenido = disputas
      .filter((d) => d.estado !== 'resuelta')
      .reduce((total, d) => total + Number(d.monto || 0), 0)
    return { abiertas, revision, resueltas, retenido }
  }, [disputas])

  return (
    <div>
      <Encabezado titulo="Disputas" />

      <div className="mb-6 flex gap-3.5">
        <Kpi etiqueta="Disputas abiertas" valor={kpis.abiertas} tono="alert" />
        <Kpi etiqueta="En revisión" valor={kpis.revision} tono="warn" />
        <Kpi etiqueta="Resueltas" valor={kpis.resueltas} tono="ok" />
        <Kpi etiqueta="Monto retenido en disputa" valor={formatearCLP(kpis.retenido)} />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {FILTROS.map(([clave, etiqueta]) => (
          <button
            key={clave}
            type="button"
            onClick={() => setEstado(clave)}
            className={`border px-3 py-1.5 text-[12px] ${
              estado === clave ? 'border-black bg-black text-white' : 'border-line'
            }`}
          >
            {etiqueta}
          </button>
        ))}
        <form
          className="ml-auto flex gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            setQ(busqueda.trim())
          }}
        >
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar servicio, organización o profesional…"
            className="w-64 border border-gray-400 px-3 py-1.5 text-[12px] outline-none"
          />
          <button
            type="submit"
            className="border border-black px-3 py-1.5 text-[11.5px]"
          >
            Buscar
          </button>
        </form>
      </div>

      {error && (
        <div className="mb-4">
          <Alerta>{error}</Alerta>
        </div>
      )}

      {cargando ? (
        <Cargando />
      ) : disputas.length === 0 ? (
        <Vacio>No hay disputas para este filtro.</Vacio>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[12px]">
            <thead>
              <tr className="border-b border-black text-left">
                <th className="py-2 pr-3 font-bold">Servicio</th>
                <th className="py-2 pr-3 font-bold">Organización</th>
                <th className="py-2 pr-3 font-bold">Profesional</th>
                <th className="py-2 pr-3 font-bold">Motivo</th>
                <th className="py-2 pr-3 text-right font-bold">Monto retenido</th>
                <th className="py-2 pr-3 font-bold">Estado</th>
                <th className="py-2 font-bold" />
              </tr>
            </thead>
            <tbody>
              {disputas.map((d) => (
                <Fragment key={d.id}>
                  <tr className="border-b border-line">
                    <td className="py-2.5 pr-3 font-bold">{d.servicio}</td>
                    <td className="py-2.5 pr-3">{d.organizacion}</td>
                    <td className="py-2.5 pr-3">{d.profesional}</td>
                    <td className="py-2.5 pr-3">{d.motivo}</td>
                    <td className="py-2.5 pr-3 text-right">{formatearCLP(d.monto)}</td>
                    <td className="py-2.5 pr-3">
                      <StatusBadge estado={d.estado} mapa={ESTADOS_DISPUTA} />
                    </td>
                    <td className="py-2.5 text-right">
                      <button
                        type="button"
                        onClick={() => setExpandido(expandido === d.id ? null : d.id)}
                        className="border border-black px-2.5 py-1 text-[11px] font-bold"
                      >
                        {expandido === d.id ? 'Cerrar' : 'Revisar'}
                      </button>
                    </td>
                  </tr>
                  {expandido === d.id && (
                    <tr className="border-b border-line bg-[#f7f7f7]">
                      <td colSpan={7} className="px-3 py-3 text-[11.5px] text-gray-600">
                        <p className="mb-1">
                          <b className="text-black">Descripción:</b>{' '}
                          {d.descripcion || 'Sin descripción adicional.'}
                        </p>
                        <p>
                          Abierta el {formatearFechaHora(d.creada_en)}
                          {d.resuelta_en && ` · Resuelta el ${formatearFechaHora(d.resuelta_en)}`}
                          {` · Reserva #${d.reserva}`}
                        </p>
                        <p className="mt-1 text-[10.5px] italic">
                          La resolución con efecto sobre el pago se habilita en la fase de
                          disputas. Por ahora esta bandeja es de solo lectura.
                        </p>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
