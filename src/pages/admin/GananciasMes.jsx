import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { resumenComisionesAdmin } from '../../api/admin'
import { mensajeDeError } from '../../api/axios'
import Alerta from '../../components/Alerta'
import Icon from '../../components/Icon'
import {
  Barras,
  Cargando,
  Encabezado,
  Kpi,
  Panel,
  Volver,
} from '../../components/admin/ui'
import { Boton, Tabla, Td, Th, Tr } from '../../components/ui'
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

      <Encabezado
        titulo="Ganancias por mes"
        descripcion="Revisa la comisión recaudada, su variación y el detalle de servicios liberados."
        acciones={
          <div className="flex items-center gap-2">
            <Boton
              variante="secundario"
              tamano="sm"
              className="px-2.5"
              onClick={() => irA(moverMes(mes, -1))}
              aria-label="Mes anterior"
            >
              <Icon nombre="chevron" className="h-4 w-4 rotate-90" />
            </Boton>
            <span className="min-w-28 text-center text-[0.875rem] font-bold capitalize text-ink">
              {etiquetaMes(mes)}
            </span>
            <Boton
              variante="secundario"
              tamano="sm"
              className="px-2.5"
              onClick={() => irA(moverMes(mes, 1))}
              aria-label="Mes siguiente"
            >
              <Icon nombre="chevron" className="h-4 w-4 -rotate-90" />
            </Boton>
          </div>
        }
      />

      {error && (
        <div className="mb-4">
          <Alerta>{error}</Alerta>
        </div>
      )}

      {cargando || !datos ? (
        <Cargando />
      ) : (
        <>
          <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Kpi
              etiqueta={`Total generado en ${datos.mes_etiqueta}`}
              valor={formatearCLP(datos.comision_mes)}
              tono="ok"
              icono="wallet"
            />
            <Kpi
              etiqueta={`vs. ${etiquetaMes(
                moverMes(mes, -1),
              )} (${formatearCLP(datos.comision_mes_anterior)})`}
              valor={
                datos.variacion_pct === null
                  ? '—'
                  : `${datos.variacion_pct >= 0 ? '+' : ''}${datos.variacion_pct.toFixed(
                      1,
                    )}%`
              }
              tono={datos.variacion_pct < 0 ? 'alert' : 'base'}
              icono="chart"
            />
            <Kpi
              etiqueta="Servicios facturados"
              valor={datos.servicios_facturados}
              icono="check-circle"
            />
            <Kpi
              etiqueta="Comisión promedio por servicio"
              valor={formatearCLP(datos.comision_promedio)}
              icono="percent"
            />
          </div>

          <Panel
            titulo={`Desglose por categoría — ${datos.mes_etiqueta}`}
            icono="chart"
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

          <Panel titulo="Servicios liberados este mes" icono="wallet">
            {datos.detalle.length === 0 ? (
              <p className="rounded-xl border border-dashed border-line px-4 py-6 text-center text-[0.8125rem] text-ink-3">
                No hay pagos liberados en este mes.
              </p>
            ) : (
              <Tabla>
                <thead>
                  <tr>
                    <Th>Servicio</Th>
                    <Th>Organización</Th>
                    <Th className="text-right">Monto servicio</Th>
                    <Th className="text-right">Comisión</Th>
                    <Th>Fecha liberación</Th>
                  </tr>
                </thead>
                <tbody>
                  {datos.detalle.map((fila) => (
                    <Tr key={fila.id}>
                      <Td className="font-bold text-ink">{fila.servicio}</Td>
                      <Td>{fila.organizacion}</Td>
                      <Td className="whitespace-nowrap text-right">
                        {formatearCLP(fila.monto_servicio)}
                      </Td>
                      <Td className="whitespace-nowrap text-right font-semibold text-ink">
                        {formatearCLP(fila.comision)}
                      </Td>
                      <Td className="whitespace-nowrap">
                        {formatearFechaCorta(fila.fecha_liberacion)}
                      </Td>
                    </Tr>
                  ))}
                  <Tr className="bg-canvas/70 hover:bg-canvas/70">
                    <Td colSpan={3} className="font-bold text-ink">
                      Total del mes
                    </Td>
                    <Td className="whitespace-nowrap text-right font-extrabold text-ink">
                      {formatearCLP(datos.comision_mes)}
                    </Td>
                    <Td />
                  </Tr>
                </tbody>
              </Tabla>
            )}
          </Panel>
        </>
      )}
    </div>
  )
}
