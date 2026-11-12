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
  ok: 'bg-brand-green',
  warn: 'bg-brand-amber',
  alert: 'bg-brand-red',
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
      <Encabezado titulo="Resumen general" sesion={usuario?.email} />

      <div className="mb-7 flex gap-3.5">
        <Kpi etiqueta="Postulaciones pendientes" valor={kpis.postulaciones_pendientes} tono="warn" />
        <Kpi etiqueta="Servicios activos" valor={kpis.servicios_activos} tono="ok" />
        <Kpi etiqueta="Disputas abiertas" valor={kpis.disputas_abiertas} tono="alert" />
        <Kpi etiqueta="Comisión este mes" valor={formatearCLP(kpis.comision_mes)} />
        <Kpi etiqueta="Organizaciones activas" valor={kpis.organizaciones_activas} />
      </div>

      <div className="flex flex-wrap gap-5">
        <Panel titulo="Servicios activos por categoría" className="min-w-[280px]">
          <Barras
            datos={datos.servicios_por_categoria.map((fila) => ({
              etiqueta: fila.categoria,
              valor: fila.total,
            }))}
            formatear={(valor) => String(valor)}
            vacio="Aún no hay servicios aprobados."
          />
        </Panel>

        <Panel titulo="Actividad reciente" className="min-w-[280px]">
          {datos.actividad.length === 0 ? (
            <p className="text-[12px] text-gray-500">Sin actividad reciente.</p>
          ) : (
            <ul className="m-0 list-none p-0">
              {datos.actividad.map((item, indice) => (
                <li
                  key={`${item.fecha}-${indice}`}
                  className="flex gap-2.5 border-b border-[#f0f0f0] py-2 text-[12px] last:border-b-0"
                >
                  <span
                    className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                      COLOR_DOT[item.tipo] || COLOR_DOT.warn
                    }`}
                  />
                  <div>
                    <b className="block">{item.texto}</b>
                    <span className="text-[10.5px] text-gray-500">
                      {item.detalle} · {hace(item.fecha)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      {kpis.solicitudes_vencidas > 0 && (
        <p className="mt-4 text-[11.5px] text-gray-500">
          {kpis.solicitudes_vencidas} reserva(s) vencida(s) por falta de respuesta del
          profesional.
        </p>
      )}
    </div>
  )
}
