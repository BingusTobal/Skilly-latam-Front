import { Fragment, useEffect, useMemo, useState } from 'react'

import { listarProfesionalesAdmin } from '../../api/admin'
import { mensajeDeError } from '../../api/axios'
import Alerta from '../../components/Alerta'
import StatusBadge from '../../components/StatusBadge'
import { Cargando, Encabezado, Kpi, Vacio } from '../../components/admin/ui'
import {
  ESTADOS_PROFESIONAL,
  formatearFechaCorta,
} from '../../lib/formato'

export default function Profesionales() {
  const [profesionales, setProfesionales] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [q, setQ] = useState('')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [expandido, setExpandido] = useState(null)

  useEffect(() => {
    setCargando(true)
    setError('')
    const params = {}
    if (q) params.q = q
    listarProfesionalesAdmin(params)
      .then((res) => setProfesionales(res.data.results || res.data))
      .catch((err) => setError(mensajeDeError(err)))
      .finally(() => setCargando(false))
  }, [q])

  const kpis = useMemo(() => {
    const activos = profesionales.filter((p) => p.estado === 'aprobado').length
    const conDisputa = profesionales.filter((p) => p.disputas_abiertas > 0).length
    const conteo = {}
    for (const p of profesionales) {
      if (!p.especialidad) continue
      conteo[p.especialidad] = (conteo[p.especialidad] || 0) + 1
    }
    const top = Object.entries(conteo).sort((a, b) => b[1] - a[1])[0]
    return {
      activos,
      conDisputa,
      topCategoria: top ? `${top[0]} (${top[1]})` : 'Sin datos',
    }
  }, [profesionales])

  return (
    <div>
      <Encabezado titulo="Profesionales" />

      <div className="mb-6 flex gap-3.5">
        <Kpi etiqueta="Profesionales activos" valor={kpis.activos} tono="ok" />
        <Kpi etiqueta="Categoría con más profesionales" valor={kpis.topCategoria} />
        <Kpi etiqueta="Con disputa abierta" valor={kpis.conDisputa} tono="alert" />
      </div>

      <form
        className="mb-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          setQ(busqueda.trim())
        }}
      >
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre, RUT o correo…"
          className="flex-1 border border-gray-400 px-3 py-2 text-[12.5px] outline-none"
        />
        <button
          type="submit"
          className="border border-black bg-black px-4 py-2 text-[12px] text-white"
        >
          Buscar
        </button>
      </form>

      {error && (
        <div className="mb-4">
          <Alerta>{error}</Alerta>
        </div>
      )}

      {cargando ? (
        <Cargando />
      ) : profesionales.length === 0 ? (
        <Vacio>No se encontraron profesionales.</Vacio>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[12px]">
            <thead>
              <tr className="border-b border-black text-left">
                <th className="py-2 pr-3 font-bold">Nombre</th>
                <th className="py-2 pr-3 font-bold">Especialidad</th>
                <th className="py-2 pr-3 font-bold">Aprobado</th>
                <th className="py-2 pr-3 text-right font-bold">Completados</th>
                <th className="py-2 pr-3 font-bold">Estado</th>
                <th className="py-2 font-bold" />
              </tr>
            </thead>
            <tbody>
              {profesionales.map((p) => (
                <Fragment key={p.id}>
                  <tr className="border-b border-line">
                    <td className="py-2.5 pr-3">
                      <span className="font-bold">{p.nombre_completo}</span>
                      <span className="block text-[10.5px] text-gray-500">
                        {p.usuario_email}
                      </span>
                    </td>
                    <td className="py-2.5 pr-3">{p.especialidad || '—'}</td>
                    <td className="py-2.5 pr-3">
                      {p.estado === 'aprobado'
                        ? formatearFechaCorta(p.fecha_aprobacion || p.fecha_estado)
                        : '—'}
                    </td>
                    <td className="py-2.5 pr-3 text-right">
                      {p.servicios_completados}
                    </td>
                    <td className="py-2.5 pr-3">
                      {p.disputas_abiertas > 0 ? (
                        <StatusBadge
                          estado="con_disputa"
                          mapa={{
                            con_disputa: {
                              etiqueta: `${p.disputas_abiertas} disputa abierta`,
                              clase: 'bg-red-100 text-red-700',
                            },
                          }}
                        />
                      ) : (
                        <StatusBadge estado={p.estado} mapa={ESTADOS_PROFESIONAL} />
                      )}
                    </td>
                    <td className="py-2.5 text-right">
                      <button
                        type="button"
                        onClick={() => setExpandido(expandido === p.id ? null : p.id)}
                        className="border border-black px-2.5 py-1 text-[11px] font-bold"
                      >
                        {expandido === p.id ? 'Ocultar' : 'Ver perfil'}
                      </button>
                    </td>
                  </tr>
                  {expandido === p.id && (
                    <tr className="border-b border-line bg-[#f7f7f7]">
                      <td colSpan={6} className="px-3 py-3 text-[11.5px] text-gray-600">
                        <p className="mb-1">
                          <b className="text-black">Correo:</b> {p.usuario_email || '—'} ·{' '}
                          <b className="text-black">Ciudad:</b> {p.ciudad || '—'} ·{' '}
                          <b className="text-black">Disponibilidad:</b> {p.disponibilidad}
                        </p>
                        <p>{p.bio || 'Sin presentación registrada.'}</p>
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
