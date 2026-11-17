import { useEffect, useState } from 'react'

import { resumenAdmin } from '../../api/admin'
import { mensajeDeError } from '../../api/axios'
import Alerta from '../../components/Alerta'
import {
  Barras,
  Cargando,
  Encabezado,
  Kpi,
  Panel,
} from '../../components/admin/ui'
import { useAuth } from '../../context/AuthContext'
import { formatearCLP, hace } from '../../lib/formato'

const COLOR_DOT = {
  ok: 'bg-ok',
  warn: 'bg-warn',
  alert: 'bg-danger',
}

export default function Resumen() {
  const { usuario } = useAuth()
  const [datos, setDatos] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    resumenAdmin()
      .then((res) => setDatos(res.data))
      .catch((err) => setError(mensajeDeError(err)))
      .finally(() => setCargando(false))
  }, [])

  if (cargando) return <Cargando />
  if (error) return <Alerta>{error}</Alerta>

  const kpis = datos.kpis

  return (
    <div>
      <Encabezado
        titulo="Resumen general"
        descripcion="Estado de la operación, ingresos y actividad reciente de Skilly Latam."
        sesion={usuario?.email}
      />

      <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        <Kpi
          etiqueta="Postulaciones pendientes"
          valor={kpis.postulaciones_pendientes}
          tono="warn"
          icono="user-check"
        />
        <Kpi
          etiqueta="Servicios activos"
          valor={kpis.servicios_activos}
          tono="ok"
          icono="layout"
        />
        <Kpi etiqueta="Reservas activas" valor={kpis.reservas_activas} icono="calendar" />
        <Kpi
          etiqueta="Solicitudes vencidas"
          valor={kpis.solicitudes_vencidas}
          tono="warn"
          icono="clock"
        />
        <Kpi
          etiqueta="Disputas abiertas"
          valor={kpis.disputas_abiertas}
          tono="alert"
          icono="alert-triangle"
        />
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        <Kpi
          etiqueta="Ingresos del mes"
          valor={formatearCLP(kpis.ingresos_mes)}
          icono="wallet"
        />
        <Kpi
          etiqueta="Comisión este mes"
          valor={formatearCLP(kpis.comision_mes)}
          tono="ok"
          icono="chart"
        />
        <Kpi
          etiqueta="Tasa de disputas"
          valor={`${kpis.tasa_disputas}%`}
          tono="alert"
          icono="alert-triangle"
        />
        <Kpi
          etiqueta="Organizaciones activas"
          valor={kpis.organizaciones_activas}
          icono="building"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel titulo="Servicios activos por categoría" icono="chart">
          <Barras
            datos={datos.servicios_por_categoria.map((fila) => ({
              etiqueta: fila.categoria,
              valor: fila.total,
            }))}
            formatear={(valor) => String(valor)}
            vacio="Aún no hay servicios aprobados."
          />
        </Panel>

        <Panel titulo="Actividad reciente" icono="bell">
          {datos.actividad.length === 0 ? (
            <p className="rounded-xl border border-dashed border-line px-4 py-6 text-center text-[0.8125rem] text-ink-3">
              Sin actividad reciente.
            </p>
          ) : (
            <ul className="space-y-3">
              {datos.actividad.map((item, indice) => (
                <li
                  key={`${item.fecha}-${indice}`}
                  className="flex gap-2.5 border-b border-line pb-3 text-[0.8125rem] last:border-0 last:pb-0"
                >
                  <span
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                      COLOR_DOT[item.tipo] || COLOR_DOT.warn
                    }`}
                  />
                  <div className="min-w-0">
                    <p className="font-semibold text-ink">{item.texto}</p>
                    <p className="mt-0.5 text-[0.75rem] text-ink-3">
                      {item.detalle} · {hace(item.fecha)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      {kpis.solicitudes_vencidas > 0 && (
        <p className="mt-4 text-[0.75rem] text-ink-3">
          {kpis.solicitudes_vencidas} reserva(s) vencida(s) por falta de respuesta del
          profesional.
        </p>
      )}
    </div>
  )
}
