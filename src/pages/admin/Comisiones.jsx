import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { resumenComisionesAdmin } from '../../api/admin'
import { mensajeDeError } from '../../api/axios'
import Alerta from '../../components/Alerta'
import {
  Barras,
  Cargando,
  Encabezado,
  Kpi,
  Panel,
  Vacio,
} from '../../components/admin/ui'
import { formatearCLP, formatearFechaCorta } from '../../lib/formato'

export function formatearPorcentaje(tasa) {
  const numero = Number(tasa) * 100
  return `${Number.isInteger(numero) ? numero : numero.toFixed(1)}%`
}

export default function Comisiones() {
  const [datos, setDatos] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    resumenComisionesAdmin()
      .then((res) => setDatos(res.data))
      .catch((err) => setError(mensajeDeError(err)))
      .finally(() => setCargando(false))
  }, [])

  if (cargando) return <Cargando />
  if (error) return <Alerta>{error}</Alerta>

  return (
    <div>
      <Encabezado titulo="Comisiones" />

      <div className="mb-6 flex gap-3.5">
        <Kpi
          etiqueta={`Comisión recaudada (${datos.mes_etiqueta})`}
          valor={formatearCLP(datos.comision_mes)}
          tono="ok"
        />
        <Kpi
          etiqueta="Comisión acumulada (histórico)"
          valor={formatearCLP(datos.comision_historica)}
        />
        <Kpi etiqueta="Tasa vigente" valor={formatearPorcentaje(datos.tasa_vigente)} />
        <Kpi etiqueta="Servicios facturados este mes" valor={datos.servicios_facturados} />
      </div>

      <div className="mb-5 flex flex-wrap gap-5">
        <Panel titulo="Configuración de tasa" className="min-w-[260px]">
          <div className="mb-3 flex items-center justify-between gap-3 border border-line bg-sky px-3 py-3">
            <div>
              <p className="text-[20px] font-bold text-navy">
                {formatearPorcentaje(datos.tasa_vigente)}
              </p>
              <p className="text-[10.5px] text-gray-600">
                Tasa global aplicada a los pagos liberados
              </p>
            </div>
            <span className="border border-line bg-white px-2 py-1 text-[10.5px] text-gray-500">
              Solo lectura
            </span>
          </div>

          {datos.por_categoria.length === 0 ? (
            <p className="text-[12px] text-gray-500">
              Aún no hay comisiones registradas este mes.
            </p>
          ) : (
            <table className="w-full border-collapse text-[12px]">
              <thead>
                <tr className="border-b border-line text-left">
                  <th className="py-1.5 font-bold">Categoría</th>
                  <th className="py-1.5 text-right font-bold">Servicios</th>
                  <th className="py-1.5 text-right font-bold">Comisión</th>
                </tr>
              </thead>
              <tbody>
                {datos.por_categoria.map((fila) => (
                  <tr key={fila.categoria} className="border-b border-[#f0f0f0]">
                    <td className="py-1.5 pr-2">{fila.categoria}</td>
                    <td className="py-1.5 pr-2 text-right">{fila.servicios}</td>
                    <td className="py-1.5 text-right">{formatearCLP(fila.monto)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <p className="mt-3 text-[10.5px] leading-relaxed text-gray-500">
            La edición versionada de la tasa por categoría se habilita en la fase de
            comisiones.
          </p>
        </Panel>

        <Panel
          titulo="Comisión recaudada — últimos 6 meses"
          className="min-w-[280px]"
          accion={
            <Link
              to={`/admin/comisiones/ganancias${datos.mes ? `?mes=${datos.mes}` : ''}`}
              className="text-[11px] font-normal text-navy no-underline hover:underline"
            >
              Ver detalle mensual →
            </Link>
          }
        >
          <Barras
            datos={datos.serie_mensual.map((fila) => ({
              etiqueta: fila.etiqueta,
              valor: fila.monto,
            }))}
            vacio="Sin pagos liberados en el período."
          />
        </Panel>
      </div>

      <h2 className="mb-2 text-[14px] font-bold">Detalle por servicio liberado</h2>
      {datos.detalle.length === 0 ? (
        <Vacio>No hay servicios liberados en {datos.mes_etiqueta}.</Vacio>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[12px]">
            <thead>
              <tr className="border-b border-black text-left">
                <th className="py-2 pr-3 font-bold">Servicio</th>
                <th className="py-2 pr-3 font-bold">Organización</th>
                <th className="py-2 pr-3 font-bold">Profesional</th>
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
                  <td className="py-2.5 pr-3">{fila.profesional}</td>
                  <td className="py-2.5 pr-3 text-right">
                    {formatearCLP(fila.monto_servicio)}
                  </td>
                  <td className="py-2.5 pr-3 text-right">
                    {formatearCLP(fila.comision)}
                  </td>
                  <td className="py-2.5">{formatearFechaCorta(fila.fecha_liberacion)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
