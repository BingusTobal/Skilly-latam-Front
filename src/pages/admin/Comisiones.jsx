import { useEffect, useState } from 'react'

import {
  actualizarTasaComisionAdmin,
  crearTasaComisionAdmin,
  listarTasasComisionAdmin,
  resumenComisionesAdmin,
} from '../../api/admin'
import { mensajeDeError } from '../../api/axios'
import Alerta from '../../components/Alerta'
import Icon from '../../components/Icon'
import {
  Barras,
  Cargando,
  Encabezado,
  Estado,
  Kpi,
  Panel,
  Vacio,
} from '../../components/admin/ui'
import {
  Boton,
  BotonEnlace,
  Campo,
  Input,
  Select,
  Tabla,
  Td,
  Th,
  Tr,
} from '../../components/ui'
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
      <Encabezado
        titulo="Comisiones"
        descripcion="Configura la tasa que cobra Skilly y revisa la comisión recaudada por período."
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          etiqueta={`Comisión recaudada (${datos.mes_etiqueta})`}
          valor={formatearCLP(datos.comision_mes)}
          tono="ok"
          icono="wallet"
        />
        <Kpi
          etiqueta="Comisión acumulada (histórico)"
          valor={formatearCLP(datos.comision_historica)}
          icono="chart"
        />
        <Kpi
          etiqueta="Tasa global vigente"
          valor={formatearPorcentaje(datos.tasa_vigente)}
          icono="percent"
        />
        <Kpi
          etiqueta="Servicios facturados este mes"
          valor={datos.servicios_facturados}
          icono="check-circle"
        />
      </div>

      <div className="mb-5 grid gap-5 xl:grid-cols-2">
        <Panel titulo="Configuración de tasa" icono="percent">
          <div className="mb-4 flex items-center justify-between gap-3 rounded-xl bg-brand-blue-soft px-4 py-3.5">
            <div>
              <p className="text-[1.6rem] font-extrabold leading-none tracking-[-0.03em] text-ink">
                {formatearPorcentaje(datos.tasa_vigente)}
              </p>
              <p className="mt-1 text-[0.75rem] text-ink-3">
                {datos.tasa_vigente_origen === 'defecto'
                  ? 'Valor por defecto del sistema'
                  : `Tasa global vigente desde ${
                      datos.tasa_vigente_desde
                        ? formatearFechaCorta(datos.tasa_vigente_desde)
                        : '—'
                    }`}
              </p>
            </div>
            <Boton
              variante="secundario"
              tamano="sm"
              onClick={() => {
                setMostrarForm((valor) => !valor)
                setErrorForm('')
                setExito('')
              }}
            >
              {mostrarForm ? 'Cancelar' : 'Nueva versión'}
            </Boton>
          </div>

          {exito && (
            <div className="mb-3">
              <Alerta tipo="exito">{exito}</Alerta>
            </div>
          )}
          {errorForm && (
            <div className="mb-3">
              <Alerta>{errorForm}</Alerta>
            </div>
          )}

          {mostrarForm && (
            <form
              onSubmit={guardarTasa}
              className="mb-4 rounded-xl border border-line bg-canvas/60 p-3.5"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <Campo etiqueta="Nueva tasa (%)" htmlFor="tasa" requerido>
                  <Input
                    id="tasa"
                    type="number"
                    min="0"
                    max="99.9"
                    step="0.1"
                    required
                    value={form.porcentaje}
                    onChange={(e) =>
                      setForm({ ...form, porcentaje: e.target.value })
                    }
                  />
                </Campo>
                <Campo etiqueta="Vigente desde" htmlFor="vigente_desde" requerido>
                  <Input
                    id="vigente_desde"
                    type="date"
                    required
                    value={form.vigente_desde}
                    onChange={(e) =>
                      setForm({ ...form, vigente_desde: e.target.value })
                    }
                  />
                </Campo>
              </div>
              <div className="mt-3">
                <Campo etiqueta="Alcance" htmlFor="alcance">
                  <Select
                    id="alcance"
                    value={form.categoria}
                    onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                  >
                    <option value="">Global (todas las categorías)</option>
                    {datos.tasas_por_categoria.map((fila) => (
                      <option key={fila.categoria_id} value={fila.categoria_id}>
                        {fila.categoria}
                      </option>
                    ))}
                  </Select>
                </Campo>
              </div>
              <Boton type="submit" tamano="sm" className="mt-3" cargando={guardando}>
                Registrar versión
              </Boton>
              <p className="mt-2 text-[0.75rem] leading-relaxed text-ink-3">
                Las tasas no se editan: cada cambio crea una versión. Los pagos ya
                liberados conservan la tasa con la que se calcularon.
              </p>
            </form>
          )}

          <h3 className="mb-2 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-ink-3">
            Tasa aplicable por categoría
          </h3>
          <table className="w-full border-collapse text-[0.8125rem]">
            <thead>
              <tr className="border-b border-line text-left">
                <th className="py-2 font-bold text-ink-3">Categoría</th>
                <th className="py-2 text-right font-bold text-ink-3">Tasa</th>
                <th className="py-2 text-right font-bold text-ink-3">Origen</th>
              </tr>
            </thead>
            <tbody>
              {datos.tasas_por_categoria.map((fila) => (
                <tr
                  key={fila.categoria_id}
                  className="border-b border-line/60 last:border-0"
                >
                  <td className="py-2 pr-2 text-ink-2">{fila.categoria}</td>
                  <td className="py-2 pr-2 text-right font-semibold text-ink">
                    {formatearPorcentaje(fila.tasa)}
                  </td>
                  <td className="py-2 text-right text-ink-3">
                    {fila.origen === 'categoria' ? 'Propia' : 'Global'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        <Panel
          titulo="Comisión recaudada — últimos 6 meses"
          icono="chart"
          accion={
            <BotonEnlace
              to={`/admin/comisiones/ganancias${
                datos.mes ? `?mes=${datos.mes}` : ''
              }`}
              variante="fantasma"
              tamano="sm"
            >
              Ver detalle mensual
              <Icon nombre="arrow-right" className="h-3.5 w-3.5" />
            </BotonEnlace>
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

      <Panel
        titulo="Historial de versiones de la tasa"
        icono="clock"
        className="mb-5"
      >
        {versiones.length === 0 ? (
          <Vacio>Aún no hay versiones configuradas; se usa el 10 % por defecto.</Vacio>
        ) : (
          <Tabla>
            <thead>
              <tr>
                <Th>Vigente desde</Th>
                <Th>Alcance</Th>
                <Th className="text-right">Tasa</Th>
                <Th>Estado</Th>
                <Th>Creada por</Th>
                <Th className="text-right">Acción</Th>
              </tr>
            </thead>
            <tbody>
              {versiones.map((version) => (
                <Tr key={version.id}>
                  <Td className="whitespace-nowrap">
                    {formatearFechaCorta(version.vigente_desde)}
                  </Td>
                  <Td>{version.categoria_nombre || 'Global'}</Td>
                  <Td className="text-right font-semibold text-ink">
                    {formatearPorcentaje(version.tasa)}
                  </Td>
                  <Td>
                    <Estado tono={version.activa ? 'ok' : 'neutro'}>
                      {version.activa ? 'Activa' : 'Inactiva'}
                    </Estado>
                  </Td>
                  <Td className="text-ink-3">{version.creada_por_email || '—'}</Td>
                  <Td className="text-right">
                    <Boton
                      tamano="sm"
                      variante="secundario"
                      onClick={() => alternarActiva(version)}
                    >
                      {version.activa ? 'Desactivar' : 'Reactivar'}
                    </Boton>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Tabla>
        )}
      </Panel>

      <Panel titulo="Detalle por servicio liberado" icono="wallet">
        {datos.detalle.length === 0 ? (
          <Vacio>No hay servicios liberados en {datos.mes_etiqueta}.</Vacio>
        ) : (
          <Tabla>
            <thead>
              <tr>
                <Th>Servicio</Th>
                <Th>Organización</Th>
                <Th>Profesional</Th>
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
                  <Td>{fila.profesional}</Td>
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
            </tbody>
          </Tabla>
        )}
      </Panel>
    </div>
  )
}
