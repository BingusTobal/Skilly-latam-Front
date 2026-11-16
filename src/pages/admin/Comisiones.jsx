import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import {
  actualizarTasaComisionAdmin,
  crearTasaComisionAdmin,
  listarTasasComisionAdmin,
  resumenComisionesAdmin,
} from '../../api/admin'
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

function hoyISO() {
  return new Date().toISOString().slice(0, 10)
}

export default function Comisiones() {
  const [datos, setDatos] = useState(null)
  const [versiones, setVersiones] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [mostrarForm, setMostrarForm] = useState(false)
  const [form, setForm] = useState({
    porcentaje: '',
    vigente_desde: hoyISO(),
    categoria: '',
  })
  const [guardando, setGuardando] = useState(false)
  const [errorForm, setErrorForm] = useState('')
  const [exito, setExito] = useState('')

  function cargar() {
    return Promise.all([resumenComisionesAdmin(), listarTasasComisionAdmin()])
      .then(([resumen, tasas]) => {
        setDatos(resumen.data)
        setVersiones(tasas.data.results || tasas.data)
      })
      .catch((err) => setError(mensajeDeError(err)))
  }

  useEffect(() => {
    cargar().finally(() => setCargando(false))
  }, [])

  async function guardarTasa(evento) {
    evento.preventDefault()
    setErrorForm('')
    setExito('')

    const porcentaje = Number(form.porcentaje.replace(',', '.'))
    if (!Number.isFinite(porcentaje) || porcentaje < 0 || porcentaje >= 100) {
      setErrorForm('Ingresa un porcentaje entre 0 y 99,9.')
      return
    }

    setGuardando(true)
    try {
      await crearTasaComisionAdmin({
        tasa: (porcentaje / 100).toFixed(4),
        vigente_desde: form.vigente_desde,
        categoria: form.categoria ? Number(form.categoria) : null,
      })
      setExito('Nueva versión de tasa registrada.')
      setMostrarForm(false)
      setForm({ porcentaje: '', vigente_desde: hoyISO(), categoria: '' })
      await cargar()
    } catch (err) {
      setErrorForm(mensajeDeError(err))
    } finally {
      setGuardando(false)
    }
  }

  async function alternarActiva(version) {
    setErrorForm('')
    setExito('')
    try {
      await actualizarTasaComisionAdmin(version.id, { activa: !version.activa })
      setExito(version.activa ? 'Versión desactivada.' : 'Versión reactivada.')
      await cargar()
    } catch (err) {
      setErrorForm(mensajeDeError(err))
    }
  }

  if (cargando) return <Cargando />
  if (error) return <Alerta>{error}</Alerta>

  return (
    <div>
      <Encabezado titulo="Comisiones" />

      <div className="mb-6 flex flex-wrap gap-3.5">
        <Kpi
          etiqueta={`Comisión recaudada (${datos.mes_etiqueta})`}
          valor={formatearCLP(datos.comision_mes)}
          tono="ok"
        />
        <Kpi
          etiqueta="Comisión acumulada (histórico)"
          valor={formatearCLP(datos.comision_historica)}
        />
        <Kpi etiqueta="Tasa global vigente" valor={formatearPorcentaje(datos.tasa_vigente)} />
        <Kpi etiqueta="Servicios facturados este mes" valor={datos.servicios_facturados} />
      </div>

      <div className="mb-5 flex flex-wrap gap-5">
        <Panel titulo="Configuración de tasa" className="min-w-[300px]">
          <div className="mb-3 flex items-center justify-between gap-3 border border-line bg-sky px-3 py-3">
            <div>
              <p className="text-[20px] font-bold text-navy">
                {formatearPorcentaje(datos.tasa_vigente)}
              </p>
              <p className="text-[10.5px] text-gray-600">
                {datos.tasa_vigente_origen === 'defecto'
                  ? 'Valor por defecto del sistema'
                  : `Tasa global vigente desde ${
                      datos.tasa_vigente_desde
                        ? formatearFechaCorta(datos.tasa_vigente_desde)
                        : '—'
                    }`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setMostrarForm((valor) => !valor)
                setErrorForm('')
                setExito('')
              }}
              className="border border-black bg-white px-3 py-1.5 text-[11.5px]"
            >
              {mostrarForm ? 'Cancelar' : 'Nueva versión'}
            </button>
          </div>

          {exito && <p className="mb-2 text-[11.5px] text-brand-green">{exito}</p>}
          {errorForm && (
            <p className="mb-2 text-[11.5px] text-brand-red">{errorForm}</p>
          )}

          {mostrarForm && (
            <form
              onSubmit={guardarTasa}
              className="mb-4 border border-line bg-[#fafafa] p-3"
            >
              <div className="mb-2 flex gap-2">
                <label className="flex-1 text-[11px] text-gray-600">
                  Nueva tasa (%)
                  <input
                    type="number"
                    min="0"
                    max="99.9"
                    step="0.1"
                    required
                    value={form.porcentaje}
                    onChange={(e) =>
                      setForm({ ...form, porcentaje: e.target.value })
                    }
                    className="mt-1 w-full border border-line bg-white px-2 py-1.5 text-[12.5px]"
                  />
                </label>
                <label className="flex-1 text-[11px] text-gray-600">
                  Vigente desde
                  <input
                    type="date"
                    required
                    value={form.vigente_desde}
                    onChange={(e) =>
                      setForm({ ...form, vigente_desde: e.target.value })
                    }
                    className="mt-1 w-full border border-line bg-white px-2 py-1.5 text-[12.5px]"
                  />
                </label>
              </div>
              <label className="mb-3 block text-[11px] text-gray-600">
                Alcance
                <select
                  value={form.categoria}
                  onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                  className="mt-1 w-full border border-line bg-white px-2 py-1.5 text-[12.5px]"
                >
                  <option value="">Global (todas las categorías)</option>
                  {datos.tasas_por_categoria.map((fila) => (
                    <option key={fila.categoria_id} value={fila.categoria_id}>
                      {fila.categoria}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="submit"
                disabled={guardando}
                className="border border-black bg-black px-4 py-1.5 text-[11.5px] text-white disabled:opacity-50"
              >
                {guardando ? 'Guardando…' : 'Registrar versión'}
              </button>
              <p className="mt-2 text-[10.5px] leading-relaxed text-gray-500">
                Las tasas no se editan: cada cambio crea una versión. Los pagos ya
                liberados conservan la tasa con la que se calcularon.
              </p>
            </form>
          )}

          <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wide text-gray-500">
            Tasa aplicable por categoría
          </h3>
          <table className="w-full border-collapse text-[12px]">
            <thead>
              <tr className="border-b border-line text-left">
                <th className="py-1.5 font-bold">Categoría</th>
                <th className="py-1.5 text-right font-bold">Tasa</th>
                <th className="py-1.5 text-right font-bold">Origen</th>
              </tr>
            </thead>
            <tbody>
              {datos.tasas_por_categoria.map((fila) => (
                <tr key={fila.categoria_id} className="border-b border-[#f0f0f0]">
                  <td className="py-1.5 pr-2">{fila.categoria}</td>
                  <td className="py-1.5 pr-2 text-right">{formatearPorcentaje(fila.tasa)}</td>
                  <td className="py-1.5 text-right text-gray-500">
                    {fila.origen === 'categoria' ? 'Propia' : 'Global'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

      <Panel titulo="Historial de versiones de la tasa" className="mb-5">
        {versiones.length === 0 ? (
          <Vacio>Aún no hay versiones configuradas; se usa el 10 % por defecto.</Vacio>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[12px]">
              <thead>
                <tr className="border-b border-line text-left">
                  <th className="py-2 pr-3 font-bold">Vigente desde</th>
                  <th className="py-2 pr-3 font-bold">Alcance</th>
                  <th className="py-2 pr-3 text-right font-bold">Tasa</th>
                  <th className="py-2 pr-3 font-bold">Estado</th>
                  <th className="py-2 pr-3 font-bold">Creada por</th>
                  <th className="py-2 font-bold">Acción</th>
                </tr>
              </thead>
              <tbody>
                {versiones.map((version) => (
                  <tr key={version.id} className="border-b border-line">
                    <td className="py-2 pr-3">
                      {formatearFechaCorta(version.vigente_desde)}
                    </td>
                    <td className="py-2 pr-3">
                      {version.categoria_nombre || 'Global'}
                    </td>
                    <td className="py-2 pr-3 text-right">
                      {formatearPorcentaje(version.tasa)}
                    </td>
                    <td className="py-2 pr-3">
                      {version.activa ? 'Activa' : 'Inactiva'}
                    </td>
                    <td className="py-2 pr-3 text-gray-500">
                      {version.creada_por_email || '—'}
                    </td>
                    <td className="py-2">
                      <button
                        type="button"
                        onClick={() => alternarActiva(version)}
                        className="border border-line px-2 py-1 text-[10.5px] hover:bg-gray-50"
                      >
                        {version.activa ? 'Desactivar' : 'Reactivar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

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
