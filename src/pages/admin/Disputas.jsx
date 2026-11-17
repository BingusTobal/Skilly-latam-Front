import { Fragment, useEffect, useMemo, useState } from 'react'

import { listarDisputasAdmin, resolverDisputaAdmin } from '../../api/admin'
import { mensajeDeError } from '../../api/axios'
import Alerta from '../../components/Alerta'
import Icon from '../../components/Icon'
import StatusBadge from '../../components/StatusBadge'
import { Cargando, Encabezado, Kpi, Vacio } from '../../components/admin/ui'
import {
  Boton,
  Campo,
  Chip,
  Input,
  Select,
  Tabla,
  Td,
  Textarea,
  Th,
  Tr,
} from '../../components/ui'
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
      setAviso(
        `Disputa #${data.id} resuelta: ${RESULTADOS_DISPUTA[data.resultado]?.etiqueta}.`,
      )
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
      <Encabezado
        titulo="Disputas"
        descripcion="Revisa los casos reportados por organizaciones y profesionales, y resuélvelos con el pago en custodia."
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi etiqueta="Disputas abiertas" valor={kpis.abiertas} tono="alert" />
        <Kpi etiqueta="En revisión" valor={kpis.revision} tono="warn" />
        <Kpi etiqueta="Resueltas" valor={kpis.resueltas} tono="ok" />
        <Kpi
          etiqueta="Monto retenido en disputa"
          valor={formatearCLP(kpis.retenido)}
          icono="wallet"
        />
      </div>

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex flex-wrap gap-2">
          {FILTROS.map(([clave, etiqueta]) => (
            <Chip
              key={clave}
              activo={estado === clave}
              onClick={() => setEstado(clave)}
            >
              {etiqueta}
            </Chip>
          ))}
        </div>
        <form
          className="flex gap-2 lg:ml-auto"
          onSubmit={(e) => {
            e.preventDefault()
            setQ(busqueda.trim())
          }}
        >
          <Input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar servicio, organización o profesional…"
            className="w-full text-[0.8125rem] lg:w-72"
          />
          <Boton type="submit" variante="secundario" tamano="sm">
            <Icon nombre="search" className="h-4 w-4" />
            Buscar
          </Boton>
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
        <Tabla>
          <thead>
            <tr>
              <Th>Servicio</Th>
              <Th>Organización</Th>
              <Th>Profesional</Th>
              <Th>Motivo</Th>
              <Th className="text-right">Monto retenido</Th>
              <Th>Estado</Th>
              <Th className="text-right">Acción</Th>
            </tr>
          </thead>
          <tbody>
            {disputas.map((d) => (
              <Fragment key={d.id}>
                <Tr>
                  <Td className="font-bold text-ink">{d.servicio}</Td>
                  <Td>{d.organizacion}</Td>
                  <Td>{d.profesional}</Td>
                  <Td>{d.motivo}</Td>
                  <Td className="whitespace-nowrap text-right font-semibold text-ink">
                    {formatearCLP(d.monto_retenido ?? d.monto)}
                  </Td>
                  <Td>
                    <StatusBadge estado={d.estado} mapa={ESTADOS_DISPUTA} />
                  </Td>
                  <Td className="text-right">
                    <Boton
                      tamano="sm"
                      variante={expandido === d.id ? 'fantasma' : 'secundario'}
                      onClick={() => abrirCaso(d)}
                    >
                      {expandido === d.id
                        ? 'Cerrar'
                        : d.estado === 'resuelta'
                          ? 'Ver'
                          : 'Revisar'}
                    </Boton>
                  </Td>
                </Tr>
                {expandido === d.id && (
                  <Tr className="bg-canvas/60 hover:bg-canvas/60">
                    <Td colSpan={7} className="px-4 py-4">
                      <div className="space-y-1.5 text-[0.8125rem] text-ink-2">
                        <p>
                          <b className="text-ink">Descripción:</b>{' '}
                          {d.descripcion || 'Sin descripción adicional.'}
                        </p>
                        <p>
                          Abierta por {d.abierta_por || 'usuario'} el{' '}
                          {formatearFechaHora(d.creada_en)}
                          {` · Reserva #${d.reserva}`}
                        </p>
                        <p>
                          <b className="text-ink">Pago:</b>{' '}
                          {ESTADOS_PAGO[d.pago_estado] || d.pago_estado || 'Sin pago'}
                          {d.monto_retenido != null &&
                            ` · Retenido: ${formatearCLP(d.monto_retenido)}`}
                        </p>

                        {d.evidencias?.length > 0 && (
                          <div className="pt-1.5">
                            <b className="text-ink">Evidencia:</b>
                            <ul className="mt-1 space-y-1">
                              {d.evidencias.map((archivo) => (
                                <li key={archivo.id} className="flex items-center gap-1.5">
                                  <Icon nombre="file" className="h-3.5 w-3.5 text-ink-3" />
                                  {archivo.archivo ? (
                                    <a
                                      href={archivo.archivo}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="font-semibold text-brand-blue no-underline hover:underline"
                                    >
                                      {archivo.nombre || `Archivo ${archivo.id}`}
                                    </a>
                                  ) : (
                                    archivo.nombre || `Archivo ${archivo.id}`
                                  )}
                                  {archivo.subida_por && (
                                    <span className="text-ink-3">
                                      — {archivo.subida_por}
                                    </span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {d.estado === 'resuelta' ? (
                          <div className="mt-3 space-y-1 rounded-xl border border-line bg-white px-4 py-3">
                            <p>
                              <b className="text-ink">Resultado:</b>{' '}
                              {RESULTADOS_DISPUTA[d.resultado]?.etiqueta || d.resultado}
                            </p>
                            {d.monto_reembolso && (
                              <p>
                                <b className="text-ink">Reembolso:</b>{' '}
                                {formatearCLP(d.monto_reembolso)}
                              </p>
                            )}
                            {d.resolucion && <p>{d.resolucion}</p>}
                            <p className="text-ink-3">
                              Resuelta el {formatearFechaHora(d.resuelta_en)}
                            </p>
                          </div>
                        ) : (
                          form &&
                          form.resultado !== undefined && (
                            <form
                              className="mt-3 rounded-xl border border-line bg-white p-4"
                              onSubmit={(e) => {
                                e.preventDefault()
                                resolver(d)
                              }}
                            >
                              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                                <Campo
                                  etiqueta="Resultado"
                                  htmlFor={`resultado-${d.id}`}
                                  className="sm:min-w-64"
                                >
                                  <Select
                                    id={`resultado-${d.id}`}
                                    value={form.resultado}
                                    onChange={(e) =>
                                      setForm({
                                        ...form,
                                        resultado: e.target.value,
                                      })
                                    }
                                  >
                                    <option value="a_favor_organizacion">
                                      A favor de la organización (reembolso total)
                                    </option>
                                    <option value="a_favor_profesional">
                                      A favor del profesional (liberar pago)
                                    </option>
                                    <option value="division">División</option>
                                  </Select>
                                </Campo>
                                {form.resultado === 'division' && (
                                  <Campo
                                    etiqueta="% reembolso a la organización"
                                    htmlFor={`porcentaje-${d.id}`}
                                    className="sm:w-40"
                                  >
                                    <Input
                                      id={`porcentaje-${d.id}`}
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
                                    />
                                  </Campo>
                                )}
                              </div>
                              <div className="mt-3">
                                <Campo
                                  etiqueta="Resolución"
                                  htmlFor={`resolucion-${d.id}`}
                                  ayuda="La ven ambas partes."
                                >
                                  <Textarea
                                    id={`resolucion-${d.id}`}
                                    value={form.resolucion}
                                    onChange={(e) =>
                                      setForm({ ...form, resolucion: e.target.value })
                                    }
                                    rows={2}
                                    required
                                    placeholder="Explica la decisión…"
                                  />
                                </Campo>
                              </div>
                              <Boton
                                type="submit"
                                className="mt-3"
                                cargando={enviando}
                              >
                                Resolver disputa
                              </Boton>
                            </form>
                          )
                        )}
                      </div>
                    </Td>
                  </Tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </Tabla>
      )}
    </div>
  )
}
