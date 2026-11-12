import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { resumenComisionesAdmin } from '../../api/admin'
import { mensajeDeError } from '../../api/axios'
import Alerta from '../../components/Alerta'
import {
  Barras,
  Cargando,
  Kpi,
  Panel,
  Volver,
} from '../../components/admin/ui'
import { formatearCLP, formatearFechaCorta } from '../../lib/formato'

const MESES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
]

function mesActual() {
  const hoy = new Date()
  return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`
}

function moverMes(mes, delta) {
  const [anio, numero] = mes.split('-').map(Number)
  const fecha = new Date(anio, numero - 1 + delta, 1)
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`
}

function etiquetaMes(mes) {
  const [anio, numero] = mes.split('-').map(Number)
  return `${MESES[numero - 1]} ${anio}`
}

export default function GananciasMes() {
  const [params, setParams] = useSearchParams()
  const mes = params.get('mes') || mesActual()
  const [datos, setDatos] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setCargando(true)
    setError('')
    resumenComisionesAdmin({ mes })
      .then((res) => setDatos(res.data))
      .catch((err) => setError(mensajeDeError(err)))
      .finally(() => setCargando(false))
  }, [mes])

  function irA(nuevo) {
    setParams({ mes: nuevo })
  }

  return (
    <div>
      <Volver to="/admin/comisiones">Volver a Comisiones</Volver>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[19px] font-bold">Ganancias por mes</h1>
        <div className="flex items-center gap-3 text-[12px]">
          <button
            type="button"
            onClick={() => irA(moverMes(mes, -1))}
            className="border border-line px-2 py-0.5 text-[14px]"
            aria-label="Mes anterior"
          >
            ‹
          </button>
          <span className="font-bold">{etiquetaMes(mes)}</span>
          <button
            type="button"
            onClick={() => irA(moverMes(mes, 1))}
            className="border border-line px-2 py-0.5 text-[14px]"
            aria-label="Mes siguiente"
          >
            ›
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4">
          <Alerta>{error}</Alerta>
        </div>
      )}

      {cargando || !datos ? (
        <Cargando />
      ) : (
        <>
          <div className="mb-6 flex flex-wrap gap-3.5">
            <Kpi
              etiqueta={`Total generado en ${datos.mes_etiqueta}`}
              valor={formatearCLP(datos.comision_mes)}
              tono="ok"
            />
            <Kpi
              etiqueta={`vs. ${etiquetaMes(moverMes(mes, -1))} (${formatearCLP(
                datos.comision_mes_anterior,
              )})`}
              valor={
                datos.variacion_pct === null
                  ? '—'
                  : `${datos.variacion_pct >= 0 ? '+' : ''}${datos.variacion_pct.toFixed(1)}%`
              }
            />
            <Kpi etiqueta="Servicios facturados" valor={datos.servicios_facturados} />
            <Kpi
              etiqueta="Comisión promedio por servicio"
              valor={formatearCLP(datos.comision_promedio)}
            />
          </div>

          <Panel
            titulo={`Desglose por categoría — ${datos.mes_etiqueta}`}
            className="mb-5"
          >
            <Barras
              datos={datos.por_categoria.map((fila) => ({
                etiqueta: fila.categoria,
                valor: fila.monto,
              }))}
              vacio="Sin comisiones registradas en este mes."
            />
          </Panel>

          <Panel titulo="Servicios liberados este mes">
            {datos.detalle.length === 0 ? (
              <p className="text-[12px] text-gray-500">
                No hay pagos liberados en este mes.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-[12px]">
                  <thead>
                    <tr className="border-b border-black text-left">
                      <th className="py-2 pr-3 font-bold">Servicio</th>
                      <th className="py-2 pr-3 font-bold">Organización</th>
                      <th className="py-2 pr-3 text-right font-bold">Monto servicio</th>
                      <th className="py-2 pr-3 text-right font-bold">Comisión</th>
                      <th className="py-2 font-bold">Fecha liberación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {datos.detalle.map((fila) => (
                      <tr key={fila.id} className="border-b border-line">
                        <td className="py-2.5 pr-3 font-bold">{fila.servicio}</td>
                        <td className="py-2.5 pr-3">{fila.organizacion}</td>
                        <td className="py-2.5 pr-3 text-right">
                          {formatearCLP(fila.monto_servicio)}
                        </td>
                        <td className="py-2.5 pr-3 text-right">
                          {formatearCLP(fila.comision)}
                        </td>
                        <td className="py-2.5">
                          {formatearFechaCorta(fila.fecha_liberacion)}
                        </td>
                      </tr>
                    ))}
                    <tr className="border-t border-black font-bold">
                      <td className="py-2.5 pr-3" colSpan={3}>
                        Total del mes
                      </td>
                      <td className="py-2.5 pr-3 text-right">
                        {formatearCLP(datos.comision_mes)}
                      </td>
                      <td />
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </Panel>
        </>
      )}
    </div>
  )
}
