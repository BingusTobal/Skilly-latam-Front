import { Fragment, useEffect, useMemo, useState } from 'react'

import { listarDisputasAdmin, resolverDisputaAdmin } from '../../api/admin'
import { mensajeDeError } from '../../api/axios'
import Alerta from '../../components/Alerta'
import StatusBadge from '../../components/StatusBadge'
import { Cargando, Encabezado, Kpi, Vacio } from '../../components/admin/ui'
import {
  ESTADOS_DISPUTA,
  ESTADOS_PAGO,
  RESULTADOS_DISPUTA,
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
  const [aviso, setAviso] = useState('')
  const [expandido, setExpandido] = useState(null)
  const [form, setForm] = useState(null)
  const [enviando, setEnviando] = useState(false)

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

  function abrirCaso(disputa) {
    setError('')
    setAviso('')
    if (expandido === disputa.id) {
      setExpandido(null)
      setForm(null)
      return
    }
    setExpandido(disputa.id)
    setForm({
      resultado: 'a_favor_organizacion',
      porcentaje_reembolso: 50,
      resolucion: '',
    })
  }

  async function resolver(disputa) {
    setError('')
    setAviso('')
    setEnviando(true)
    try {
      const { data } = await resolverDisputaAdmin(disputa.id, form)
      setDisputas((actuales) =>
        actuales.map((item) => (item.id === data.id ? data : item)),
      )
      setAviso(`Disputa #${data.id} resuelta: ${RESULTADOS_DISPUTA[data.resultado]?.etiqueta}.`)
      setForm(null)
    } catch (err) {
      setError(mensajeDeError(err))
    } finally {
      setEnviando(false)
    }
  }

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
      {aviso && (
        <div className="mb-4">
          <Alerta tipo="exito">{aviso}</Alerta>
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
                    <td className="py-2.5 pr-3 text-right">
                      {formatearCLP(d.monto_retenido ?? d.monto)}
                    </td>
                    <td className="py-2.5 pr-3">
                      <StatusBadge estado={d.estado} mapa={ESTADOS_DISPUTA} />
                    </td>
                    <td className="py-2.5 text-right">
                      <button
                        type="button"
                        onClick={() => abrirCaso(d)}
                        className="border border-black px-2.5 py-1 text-[11px] font-bold"
                      >
                        {expandido === d.id ? 'Cerrar' : d.estado === 'resuelta' ? 'Ver' : 'Revisar'}
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
                          Abierta por {d.abierta_por || 'usuario'} el{' '}
                          {formatearFechaHora(d.creada_en)}
                          {` · Reserva #${d.reserva}`}
                        </p>
                        <p className="mt-1">
                          <b className="text-black">Pago:</b>{' '}
                          {ESTADOS_PAGO[d.pago_estado] || d.pago_estado || 'Sin pago'}
                          {d.monto_retenido != null &&
                            ` · Retenido: ${formatearCLP(d.monto_retenido)}`}
                        </p>

                        {d.evidencias?.length > 0 && (
                          <div className="mt-2">
                            <b className="text-black">Evidencia:</b>
                            <ul className="mt-1 space-y-0.5">
                              {d.evidencias.map((archivo) => (
                                <li key={archivo.id}>
                                  {archivo.archivo ? (
                                    <a
                                      href={archivo.archivo}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="underline"
                                    >
                                      {archivo.nombre || `Archivo ${archivo.id}`}
                                    </a>
                                  ) : (
                                    archivo.nombre || `Archivo ${archivo.id}`
                                  )}
                                  {archivo.subida_por && ` — ${archivo.subida_por}`}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {d.estado === 'resuelta' ? (
                          <div className="mt-3 border-t border-line pt-2">
                            <p>
                              <b className="text-black">Resultado:</b>{' '}
                              {RESULTADOS_DISPUTA[d.resultado]?.etiqueta || d.resultado}
                            </p>
                            {d.monto_reembolso && (
                              <p>
                                <b className="text-black">Reembolso:</b>{' '}
                                {formatearCLP(d.monto_reembolso)}
                              </p>
                            )}
                            {d.resolucion && <p>{d.resolucion}</p>}
                            <p>
                              Resuelta el {formatearFechaHora(d.resuelta_en)}
                            </p>
                          </div>
                        ) : (
                          form &&
                          form.resultado !== undefined && (
                            <form
                              className="mt-3 border-t border-line pt-3"
                              onSubmit={(e) => {
                                e.preventDefault()
                                resolver(d)
                              }}
                            >
                              <div className="flex flex-wrap items-end gap-3">
                                <label className="text-[11px] font-bold text-black">
                                  Resultado
                                  <select
                                    value={form.resultado}
                                    onChange={(e) =>
                                      setForm({ ...form, resultado: e.target.value })
                                    }
                                    className="mt-1 block border border-gray-400 px-2 py-1.5 text-[12px]"
                                  >
                                    <option value="a_favor_organizacion">
                                      A favor de la organización (reembolso total)
                                    </option>
                                    <option value="a_favor_profesional">
                                      A favor del profesional (liberar pago)
                                    </option>
                                    <option value="division">División</option>
                                  </select>
                                </label>
                                {form.resultado === 'division' && (
                                  <label className="text-[11px] font-bold text-black">
                                    % reembolso a la organización
                                    <input
                                      type="number"
                                      min="1"
                                      max="99"
                                      value={form.porcentaje_reembolso}
                                      onChange={(e) =>
                                        setForm({
                                          ...form,
                                          porcentaje_reembolso: e.target.value,
                                        })
                                      }
                                      className="mt-1 block w-28 border border-gray-400 px-2 py-1.5 text-[12px]"
                                    />
                                  </label>
                                )}
                              </div>
                              <label className="mt-3 block text-[11px] font-bold text-black">
                                Resolución
                                <textarea
                                  value={form.resolucion}
                                  onChange={(e) =>
                                    setForm({ ...form, resolucion: e.target.value })
                                  }
                                  rows={2}
                                  required
                                  placeholder="Explica la decisión; la ven ambas partes."
                                  className="mt-1 block w-full border border-gray-400 px-2 py-1.5 text-[12px]"
                                />
                              </label>
                              <button
                                type="submit"
                                disabled={enviando}
                                className="mt-3 border border-black bg-black px-4 py-1.5 text-[11.5px] font-bold text-white disabled:opacity-50"
                              >
                                {enviando ? 'Resolviendo…' : 'Resolver disputa'}
                              </button>
                            </form>
                          )
                        )}
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
