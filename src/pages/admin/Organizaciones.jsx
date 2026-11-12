import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { listarOrganizacionesAdmin } from '../../api/admin'
import { mensajeDeError } from '../../api/axios'
import Alerta from '../../components/Alerta'
import { Cargando, Encabezado, Estado, Kpi, Vacio } from '../../components/admin/ui'
import { formatearCLP, formatearFechaCorta } from '../../lib/formato'

function esDelMes(fechaISO) {
  if (!fechaISO) return false
  const fecha = new Date(fechaISO)
  const hoy = new Date()
  return (
    fecha.getFullYear() === hoy.getFullYear() && fecha.getMonth() === hoy.getMonth()
  )
}

export default function Organizaciones() {
  const [organizaciones, setOrganizaciones] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [q, setQ] = useState('')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setCargando(true)
    setError('')
    const params = {}
    if (q) params.q = q
    listarOrganizacionesAdmin(params)
      .then((res) => setOrganizaciones(res.data.results || res.data))
      .catch((err) => setError(mensajeDeError(err)))
      .finally(() => setCargando(false))
  }, [q])

  const kpis = useMemo(() => {
    const activas = organizaciones.filter((o) => o.activa).length
    const nuevas = organizaciones.filter((o) => esDelMes(o.creada_en)).length
    const gasto = organizaciones.reduce(
      (total, o) => total + Number(o.gasto_total || 0),
      0,
    )
    const reservas = organizaciones.reduce(
      (total, o) => total + Number(o.reservas_count || 0),
      0,
    )
    return {
      activas,
      nuevas,
      gasto,
      promedio: organizaciones.length
        ? (reservas / organizaciones.length).toFixed(1)
        : '0',
    }
  }, [organizaciones])

  return (
    <div>
      <Encabezado titulo="Organizaciones" />

      <div className="mb-6 flex gap-3.5">
        <Kpi etiqueta="Organizaciones activas" valor={kpis.activas} tono="ok" />
        <Kpi etiqueta="Nuevas este mes" valor={kpis.nuevas} />
        <Kpi etiqueta="Gasto acumulado (histórico)" valor={formatearCLP(kpis.gasto)} />
        <Kpi etiqueta="Servicios promedio por organización" valor={kpis.promedio} />
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
      ) : organizaciones.length === 0 ? (
        <Vacio>No se encontraron organizaciones.</Vacio>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[12px]">
            <thead>
              <tr className="border-b border-black text-left">
                <th className="py-2 pr-3 font-bold">Organización</th>
                <th className="py-2 pr-3 font-bold">RUT</th>
                <th className="py-2 pr-3 font-bold">Contacto</th>
                <th className="py-2 pr-3 text-right font-bold">Servicios</th>
                <th className="py-2 pr-3 text-right font-bold">Gasto total</th>
                <th className="py-2 pr-3 font-bold">Estado</th>
                <th className="py-2 font-bold" />
              </tr>
            </thead>
            <tbody>
              {organizaciones.map((o) => (
                <tr key={o.id} className="border-b border-line">
                  <td className="py-2.5 pr-3">
                    <span className="font-bold">{o.nombre}</span>
                    <span className="block text-[10.5px] text-gray-500">
                      {o.modo_nombre}
                      {o.ultima_reserva &&
                        ` · última reserva ${formatearFechaCorta(o.ultima_reserva)}`}
                    </span>
                  </td>
                  <td className="py-2.5 pr-3">{o.rut || '—'}</td>
                  <td className="py-2.5 pr-3">
                    {o.nombre_contacto}
                    <span className="block text-[10.5px] text-gray-500">
                      {o.email_contacto}
                    </span>
                  </td>
                  <td className="py-2.5 pr-3 text-right">{o.reservas_count}</td>
                  <td className="py-2.5 pr-3 text-right">
                    {formatearCLP(o.gasto_total)}
                  </td>
                  <td className="py-2.5 pr-3">
                    {o.activa ? (
                      <Estado clase="bg-green-100 text-green-700">Activa</Estado>
                    ) : (
                      <Estado clase="bg-gray-200 text-gray-600">Inactiva</Estado>
                    )}
                  </td>
                  <td className="py-2.5 text-right">
                    <Link
                      to={`/admin/organizaciones/${o.id}`}
                      className="border border-black px-2.5 py-1 text-[11px] font-bold text-black no-underline"
                    >
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
