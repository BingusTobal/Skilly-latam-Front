import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { detalleOrganizacionAdmin } from '../../api/admin'
import { mensajeDeError } from '../../api/axios'
import Alerta from '../../components/Alerta'
import StatusBadge from '../../components/StatusBadge'
import { Cargando, Estado, Kpi, Volver } from '../../components/admin/ui'
import {
  ESTADOS_RESERVA,
  formatearCLP,
  formatearFecha,
  formatearFechaCorta,
} from '../../lib/formato'

const FILTROS = [
  ['todas', 'Todas'],
  ['pendientes', 'Pendientes'],
  ['en_curso', 'En curso'],
  ['finalizadas', 'Finalizadas'],
  ['con_disputa', 'Con disputa'],
]

const GRUPOS = {
  pendientes: ['pendiente_pago', 'pendiente_aceptacion'],
  en_curso: ['en_curso', 'entregado_por_confirmar'],
  finalizadas: ['finalizada'],
  con_disputa: ['con_disputa'],
}

export default function HistorialOrganizacion() {
  const { id } = useParams()
  const [datos, setDatos] = useState(null)
  const [filtro, setFiltro] = useState('todas')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    detalleOrganizacionAdmin(id)
      .then((res) => setDatos(res.data))
      .catch((err) => setError(mensajeDeError(err)))
      .finally(() => setCargando(false))
  }, [id])

  if (cargando) return <Cargando />
  if (!datos) {
    return (
      <div>
        <Volver to="/admin/organizaciones">Volver a Organizaciones</Volver>
        <Alerta>{error || 'Organización no encontrada.'}</Alerta>
      </div>
    )
  }

  const { organizacion, kpis } = datos
  const reservas =
    filtro === 'todas'
      ? datos.reservas
      : datos.reservas.filter((r) => GRUPOS[filtro]?.includes(r.estado))

  return (
    <div>
      <Volver to="/admin/organizaciones">Volver a Organizaciones</Volver>

      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[19px] font-bold">{organizacion.nombre}</h1>
          <p className="text-[12px] text-gray-500">
            RUT {organizacion.rut || '—'} · Contacto: {organizacion.nombre_contacto} · Cliente
            desde {formatearFecha(organizacion.creada_en)}
          </p>
          <p className="text-[11.5px] text-gray-500">
            {organizacion.email_contacto}
            {organizacion.telefono && ` · ${organizacion.telefono}`}
            {organizacion.giro && ` · ${organizacion.giro}`}
          </p>
        </div>
        {organizacion.activa ? (
          <Estado clase="bg-green-100 text-green-700">Activa</Estado>
        ) : (
          <Estado clase="bg-gray-200 text-gray-600">Inactiva</Estado>
        )}
      </div>

      <div className="mb-6 flex gap-3.5">
        <Kpi etiqueta="Servicios contratados" valor={kpis.reservas} tono="ok" />
        <Kpi etiqueta="Gasto total acumulado" valor={formatearCLP(kpis.gasto_total)} />
        <Kpi etiqueta="Disputas históricas" valor={kpis.disputas} tono={kpis.disputas ? 'alert' : 'base'} />
        <Kpi
          etiqueta="Última reserva"
          valor={kpis.ultima_reserva ? formatearFechaCorta(kpis.ultima_reserva) : '—'}
        />
      </div>

      <h2 className="mb-2 text-[14px] font-bold">Historial de reservas</h2>

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTROS.map(([clave, etiqueta]) => (
          <button
            key={clave}
            type="button"
            onClick={() => setFiltro(clave)}
            className={`border px-3 py-1 text-[11.5px] ${
              filtro === clave ? 'border-black bg-black text-white' : 'border-line'
            }`}
          >
            {etiqueta}
          </button>
        ))}
      </div>

      {reservas.length === 0 ? (
        <p className="text-[13px] text-gray-500">No hay reservas en esta categoría.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[12px]">
            <thead>
              <tr className="border-b border-black text-left">
                <th className="py-2 pr-3 font-bold">Servicio</th>
                <th className="py-2 pr-3 font-bold">Profesional</th>
                <th className="py-2 pr-3 font-bold">Fecha reserva</th>
                <th className="py-2 pr-3 text-right font-bold">Monto</th>
                <th className="py-2 pr-3 font-bold">Estado</th>
              </tr>
            </thead>
            <tbody>
              {reservas.map((r) => (
                <tr key={r.id} className="border-b border-line">
                  <td className="py-2.5 pr-3 font-bold">{r.servicio}</td>
                  <td className="py-2.5 pr-3">{r.profesional}</td>
                  <td className="py-2.5 pr-3">{formatearFechaCorta(r.fecha)}</td>
                  <td className="py-2.5 pr-3 text-right">{formatearCLP(r.monto)}</td>
                  <td className="py-2.5 pr-3">
                    <StatusBadge estado={r.estado} mapa={ESTADOS_RESERVA} />
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
