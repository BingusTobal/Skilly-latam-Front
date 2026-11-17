import { Fragment, useEffect, useMemo, useState } from 'react'

import { listarProfesionalesAdmin } from '../../api/admin'
import { mensajeDeError } from '../../api/axios'
import Alerta from '../../components/Alerta'
import Icon from '../../components/Icon'
import StatusBadge from '../../components/StatusBadge'
import { Cargando, Encabezado, Estado, Kpi, Vacio } from '../../components/admin/ui'
import {
  Avatar,
  Boton,
  Input,
  Tabla,
  Td,
  Th,
  Tr,
} from '../../components/ui'
import { ESTADOS_PROFESIONAL, formatearFechaCorta } from '../../lib/formato'

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
      <Encabezado
        titulo="Profesionales"
        descripcion="Consulta el estado, la especialidad y el historial de los profesionales de la plataforma."
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <Kpi
          etiqueta="Profesionales activos"
          valor={kpis.activos}
          tono="ok"
          icono="users"
        />
        <Kpi
          etiqueta="Categoría con más profesionales"
          valor={kpis.topCategoria}
          icono="chart"
        />
        <Kpi
          etiqueta="Con disputa abierta"
          valor={kpis.conDisputa}
          tono="alert"
          icono="alert-triangle"
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
      ) : profesionales.length === 0 ? (
        <Vacio>No se encontraron profesionales.</Vacio>
      ) : (
        <Tabla>
          <thead>
            <tr>
              <Th>Nombre</Th>
              <Th>Especialidad</Th>
              <Th>Aprobado</Th>
              <Th className="text-right">Completados</Th>
              <Th>Estado</Th>
              <Th className="text-right">Perfil</Th>
            </tr>
          </thead>
          <tbody>
            {profesionales.map((p) => (
              <Fragment key={p.id}>
                <Tr>
                  <Td>
                    <div className="flex items-center gap-3">
                      <Avatar nombre={p.nombre_completo} tamano="sm" />
                      <div className="min-w-0">
                        <p className="font-bold text-ink">{p.nombre_completo}</p>
                        <p className="text-[0.75rem] text-ink-3">{p.usuario_email}</p>
                      </div>
                    </div>
                  </Td>
                  <Td>{p.especialidad || '—'}</Td>
                  <Td className="whitespace-nowrap">
                    {p.estado === 'aprobado'
                      ? formatearFechaCorta(p.fecha_aprobacion || p.fecha_estado)
                      : '—'}
                  </Td>
                  <Td className="text-right font-semibold text-ink">
                    {p.servicios_completados}
                  </Td>
                  <Td>
                    {p.disputas_abiertas > 0 ? (
                      <Estado tono="alert">
                        {p.disputas_abiertas} disputa abierta
                      </Estado>
                    ) : (
                      <StatusBadge estado={p.estado} mapa={ESTADOS_PROFESIONAL} />
                    )}
                  </Td>
                  <Td className="text-right">
                    <Boton
                      tamano="sm"
                      variante={expandido === p.id ? 'fantasma' : 'secundario'}
                      onClick={() => setExpandido(expandido === p.id ? null : p.id)}
                    >
                      {expandido === p.id ? 'Ocultar' : 'Ver perfil'}
                    </Boton>
                  </Td>
                </Tr>
                {expandido === p.id && (
                  <Tr className="bg-canvas/60 hover:bg-canvas/60">
                    <Td colSpan={6} className="px-4 py-4">
                      <div className="space-y-1.5 text-[0.8125rem] text-ink-2">
                        <p className="flex flex-wrap gap-x-4 gap-y-1">
                          <span>
                            <b className="text-ink">Correo:</b>{' '}
                            {p.usuario_email || '—'}
                          </span>
                          <span>
                            <b className="text-ink">Ciudad:</b> {p.ciudad || '—'}
                          </span>
                          <span>
                            <b className="text-ink">Disponibilidad:</b>{' '}
                            {p.disponibilidad}
                          </span>
                        </p>
                        <p className="leading-relaxed">
                          {p.bio || 'Sin presentación registrada.'}
                        </p>
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
