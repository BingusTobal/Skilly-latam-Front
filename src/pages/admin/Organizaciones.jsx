import { useEffect, useMemo, useState } from 'react'

import { listarOrganizacionesAdmin } from '../../api/admin'
import { mensajeDeError } from '../../api/axios'
import Alerta from '../../components/Alerta'
import Icon from '../../components/Icon'
import { Cargando, Encabezado, Estado, Kpi, Vacio } from '../../components/admin/ui'
import {
  Avatar,
  Boton,
  BotonEnlace,
  Input,
  Tabla,
  Td,
  Th,
  Tr,
} from '../../components/ui'
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
      <Encabezado
        titulo="Organizaciones"
        descripcion="Consulta las cuentas activas, su gasto acumulado y el historial de servicios contratados."
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi etiqueta="Organizaciones activas" valor={kpis.activas} tono="ok" icono="building" />
        <Kpi etiqueta="Nuevas este mes" valor={kpis.nuevas} icono="plus" />
        <Kpi
          etiqueta="Gasto acumulado (histórico)"
          valor={formatearCLP(kpis.gasto)}
          icono="wallet"
        />
        <Kpi
          etiqueta="Servicios promedio por organización"
          valor={kpis.promedio}
          icono="chart"
        />
      </div>

      <form
        className="mb-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          setQ(busqueda.trim())
        }}
      >
        <Input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre, RUT o correo…"
          className="flex-1 text-[0.8125rem]"
        />
        <Boton type="submit" variante="secundario" tamano="sm">
          <Icon nombre="search" className="h-4 w-4" />
          Buscar
        </Boton>
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
        <Tabla>
          <thead>
            <tr>
              <Th>Organización</Th>
              <Th>RUT</Th>
              <Th>Contacto</Th>
              <Th className="text-right">Servicios</Th>
              <Th className="text-right">Gasto total</Th>
              <Th>Estado</Th>
              <Th className="text-right">Acción</Th>
            </tr>
          </thead>
          <tbody>
            {organizaciones.map((o) => (
              <Tr key={o.id}>
                <Td>
                  <div className="flex items-center gap-3">
                    <Avatar nombre={o.nombre} tamano="sm" />
                    <div className="min-w-0">
                      <p className="font-bold text-ink">{o.nombre}</p>
                      <p className="text-[0.75rem] text-ink-3">
                        {o.modo_nombre}
                        {o.ultima_reserva &&
                          ` · última reserva ${formatearFechaCorta(
                            o.ultima_reserva,
                          )}`}
                      </p>
                    </div>
                  </div>
                </Td>
                <Td>{o.rut || '—'}</Td>
                <Td>
                  <p className="font-semibold text-ink">{o.nombre_contacto}</p>
                  <p className="text-[0.75rem] text-ink-3">{o.email_contacto}</p>
                </Td>
                <Td className="text-right font-semibold text-ink">
                  {o.reservas_count}
                </Td>
                <Td className="whitespace-nowrap text-right font-semibold text-ink">
                  {formatearCLP(o.gasto_total)}
                </Td>
                <Td>
                  <Estado tono={o.activa ? 'ok' : 'neutro'}>
                    {o.activa ? 'Activa' : 'Inactiva'}
                  </Estado>
                </Td>
                <Td className="text-right">
                  <BotonEnlace
                    to={`/admin/organizaciones/${o.id}`}
                    tamano="sm"
                    variante="secundario"
                  >
                    Ver
                  </BotonEnlace>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Tabla>
      )}
    </div>
  )
}
