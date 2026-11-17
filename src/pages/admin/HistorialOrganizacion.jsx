import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { detalleOrganizacionAdmin } from '../../api/admin'
import { mensajeDeError } from '../../api/axios'
import Alerta from '../../components/Alerta'
import StatusBadge from '../../components/StatusBadge'
import {
  Cargando,
  Encabezado,
  Estado,
  Kpi,
  Volver,
} from '../../components/admin/ui'
import { Chip, Tabla, Td, Th, Tr } from '../../components/ui'
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

      <Encabezado
        titulo={organizacion.nombre}
        descripcion={`RUT ${organizacion.rut || '—'} · Contacto: ${
          organizacion.nombre_contacto
        } · Cliente desde ${formatearFecha(
          organizacion.creada_en,
        )} · ${organizacion.email_contacto}${
          organizacion.telefono ? ` · ${organizacion.telefono}` : ''
        }${organizacion.giro ? ` · ${organizacion.giro}` : ''}`}
        acciones={
          <Estado tono={organizacion.activa ? 'ok' : 'neutro'}>
            {organizacion.activa ? 'Activa' : 'Inactiva'}
          </Estado>
        }
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          etiqueta="Servicios contratados"
          valor={kpis.reservas}
          tono="ok"
          icono="calendar"
        />
        <Kpi
          etiqueta="Gasto total acumulado"
          valor={formatearCLP(kpis.gasto_total)}
          icono="wallet"
        />
        <Kpi
          etiqueta="Disputas históricas"
          valor={kpis.disputas}
          tono={kpis.disputas ? 'alert' : 'base'}
          icono="alert-triangle"
        />
        <Kpi
          etiqueta="Última reserva"
          valor={kpis.ultima_reserva ? formatearFechaCorta(kpis.ultima_reserva) : '—'}
          icono="clock"
        />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <h2 className="mr-2 text-[0.9375rem] font-bold text-ink">
          Historial de reservas
        </h2>
        {FILTROS.map(([clave, etiqueta]) => (
          <Chip
            key={clave}
            activo={filtro === clave}
            onClick={() => setFiltro(clave)}
          >
            {etiqueta}
          </Chip>
        ))}
      </div>

      {reservas.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line bg-canvas/50 px-4 py-8 text-center text-[0.8125rem] text-ink-3">
          No hay reservas en esta categoría.
        </div>
      ) : (
        <Tabla>
          <thead>
            <tr>
              <Th>Servicio</Th>
              <Th>Profesional</Th>
              <Th>Fecha reserva</Th>
              <Th className="text-right">Monto</Th>
              <Th>Estado</Th>
            </tr>
          </thead>
          <tbody>
            {reservas.map((r) => (
              <Tr key={r.id}>
                <Td className="font-bold text-ink">{r.servicio}</Td>
                <Td>{r.profesional}</Td>
                <Td className="whitespace-nowrap">{formatearFechaCorta(r.fecha)}</Td>
                <Td className="whitespace-nowrap text-right font-semibold text-ink">
                  {formatearCLP(r.monto)}
                </Td>
                <Td>
                  <StatusBadge estado={r.estado} mapa={ESTADOS_RESERVA} />
                </Td>
              </Tr>
            ))}
          </tbody>
        </Tabla>
      )}
    </div>
  )
}
