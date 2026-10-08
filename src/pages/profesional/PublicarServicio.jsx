import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import {
  actualizarServicio,
  crearServicio,
  enviarARevision,
  listarCategorias,
  obtenerMiServicio,
} from '../../api/catalogo'
import { mensajeDeError } from '../../api/axios'
import Alerta from '../../components/Alerta'
import { FORMATOS, formatearCLP, montoNeto } from '../../lib/formato'

const CLASE_INPUT = 'w-full border border-gray-400 px-3 py-2 text-[13px] outline-none'
const CLASE_LABEL = 'mb-1 block text-[12px] text-gray-600'

const VACIO = {
  titulo: '',
  categoria: '',
  descripcion_corta: '',
  descripcion_larga: '',
  precio: '',
  formato: 'remoto',
  ubicacion: '',
  duracion_estimada: '',
  entregables: [],
}

export default function PublicarServicio() {
  const { id } = useParams()
  const navigate = useNavigate()
  const editando = Boolean(id)

  const [categorias, setCategorias] = useState([])
  const [form, setForm] = useState(VACIO)
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    listarCategorias().then(setCategorias).catch(() => setCategorias([]))
  }, [])

  useEffect(() => {
    if (!editando) return
    obtenerMiServicio(id)
      .then((data) =>
        setForm({
          titulo: data.titulo || '',
          categoria: data.categoria?.id || data.categoria || '',
          descripcion_corta: data.descripcion_corta || '',
          descripcion_larga: data.descripcion_larga || '',
          precio: data.precio || '',
          formato: data.formato || 'remoto',
          ubicacion: data.ubicacion || '',
          duracion_estimada: data.duracion_estimada || '',
          entregables: (data.entregables || []).map((e) => ({ nombre: e.nombre })),
        }),
      )
      .catch((err) => setError(mensajeDeError(err)))
  }, [editando, id])

  const requiereUbicacion = form.formato === 'presencial' || form.formato === 'semipresencial'
  const neto = useMemo(() => montoNeto(form.precio), [form.precio])

  function actualizar(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }))
  }

  function actualizarEntregable(indice, valor) {
    setForm((prev) => {
      const entregables = [...prev.entregables]
      entregables[indice] = { nombre: valor }
      return { ...prev, entregables }
    })
  }

  function agregarEntregable() {
    setForm((prev) => ({ ...prev, entregables: [...prev.entregables, { nombre: '' }] }))
  }

  function quitarEntregable(indice) {
    setForm((prev) => ({
      ...prev,
      entregables: prev.entregables.filter((_, i) => i !== indice),
    }))
  }

  function validar(paraRevision) {
    if (!form.titulo.trim()) return 'El nombre del servicio es obligatorio.'
    if (!form.categoria) return 'Selecciona una categoría.'
    if (form.precio === '' || Number(form.precio) < 0) return 'Ingresa un precio válido.'
    if (requiereUbicacion && !form.ubicacion.trim())
      return 'La ubicación es obligatoria para modalidad presencial o semipresencial.'
    if (paraRevision) {
      if (!form.descripcion_corta.trim()) return 'La descripción breve es obligatoria.'
      if (!form.descripcion_larga.trim()) return 'La descripción larga es obligatoria.'
    }
    return ''
  }

  function payload() {
    const entregables = form.entregables
      .filter((e) => e.nombre.trim())
      .map((e, i) => ({ nombre: e.nombre.trim(), orden: i }))
    return {
      titulo: form.titulo.trim(),
      categoria: Number(form.categoria),
      descripcion_corta: form.descripcion_corta.trim(),
      descripcion_larga: form.descripcion_larga.trim(),
      precio: String(form.precio),
      formato: form.formato,
      ubicacion: requiereUbicacion ? form.ubicacion.trim() : '',
      duracion_estimada: form.duracion_estimada.trim(),
      entregables,
    }
  }

  async function guardar(paraRevision) {
    const problema = validar(paraRevision)
    if (problema) {
      setError(problema)
      return
    }
    setError('')
    setEnviando(true)
    try {
      const guardado = editando
        ? (await actualizarServicio(id, payload())).data
        : (await crearServicio(payload())).data
      if (paraRevision) {
        await enviarARevision(guardado.id)
      }
      navigate('/profesional/servicios')
    } catch (err) {
      setError(mensajeDeError(err))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="pt-6">
      <Link to="/profesional/servicios" className="text-[13px] text-gray-600 no-underline">
        ← Volver a mis servicios
      </Link>
      <h1 className="mt-2 text-[21px] font-bold">
        {editando ? 'Editar servicio' : 'Publicar un nuevo servicio'}
      </h1>
      <p className="mb-6 text-[12.5px] text-gray-500">
        Al enviarlo, Skilly lo revisa antes de publicarlo en el catálogo.
      </p>

      {error && (
        <div className="mb-4">
          <Alerta>{error}</Alerta>
        </div>
      )}

      <div className="flex flex-col gap-8 md:flex-row">
        <div className="flex-1 space-y-6">
          <section>
            <h2 className="mb-3 border-b border-line pb-1.5 text-[14px] font-bold">
              Información general
            </h2>
            <div className="mb-4">
              <label className={CLASE_LABEL}>Nombre del servicio *</label>
              <input
                className={CLASE_INPUT}
                value={form.titulo}
                onChange={(e) => actualizar('titulo', e.target.value)}
                placeholder="Ej: Sitio web corporativo en 15 días"
              />
            </div>
            <div className="mb-4">
              <label className={CLASE_LABEL}>Categoría *</label>
              <select
                className={CLASE_INPUT}
                value={form.categoria}
                onChange={(e) => actualizar('categoria', e.target.value)}
              >
                <option value="">Selecciona una categoría</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className={CLASE_LABEL}>Descripción breve *</label>
              <input
                className={CLASE_INPUT}
                value={form.descripcion_corta}
                onChange={(e) => actualizar('descripcion_corta', e.target.value)}
              />
            </div>
            <div>
              <label className={CLASE_LABEL}>Descripción larga *</label>
              <textarea
                className={`${CLASE_INPUT} min-h-24`}
                value={form.descripcion_larga}
                onChange={(e) => actualizar('descripcion_larga', e.target.value)}
              />
            </div>
          </section>

          <section>
            <h2 className="mb-3 border-b border-line pb-1.5 text-[14px] font-bold">
              ¿Qué incluye el servicio?
            </h2>
            {form.entregables.map((entregable, indice) => (
              <div key={indice} className="mb-2 flex items-center gap-2">
                <span className="text-brand-green">✓</span>
                <input
                  className={CLASE_INPUT}
                  value={entregable.nombre}
                  placeholder="Entregable"
                  onChange={(e) => actualizarEntregable(indice, e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => quitarEntregable(indice)}
                  className="px-2 text-[12px] text-gray-400"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={agregarEntregable}
              className="w-full border border-dashed border-gray-400 px-3 py-2 text-left text-[12px] text-gray-600"
            >
              + Agregar otro entregable
            </button>
          </section>

          <section>
            <h2 className="mb-3 border-b border-line pb-1.5 text-[14px] font-bold">
              Condiciones de entrega
            </h2>
            <div className="mb-4">
              <label className={CLASE_LABEL}>Duración estimada</label>
              <input
                className={CLASE_INPUT}
                value={form.duracion_estimada}
                onChange={(e) => actualizar('duracion_estimada', e.target.value)}
                placeholder="Ej: 15 días"
              />
            </div>
            <div className="mb-4">
              <label className={CLASE_LABEL}>Modalidad *</label>
              <div className="flex flex-wrap gap-4">
                {Object.entries(FORMATOS).map(([clave, etiqueta]) => (
                  <label key={clave} className="flex items-center gap-2 text-[12.5px]">
                    <input
                      type="radio"
                      name="formato"
                      value={clave}
                      checked={form.formato === clave}
                      onChange={(e) => actualizar('formato', e.target.value)}
                    />
                    {etiqueta}
                  </label>
                ))}
              </div>
            </div>
            {requiereUbicacion && (
              <div>
                <label className={CLASE_LABEL}>Ubicación *</label>
                <input
                  className={CLASE_INPUT}
                  value={form.ubicacion}
                  onChange={(e) => actualizar('ubicacion', e.target.value)}
                />
              </div>
            )}
          </section>
        </div>

        <aside className="w-full shrink-0 md:w-64">
          <h2 className="mb-3 border-b border-line pb-1.5 text-[14px] font-bold">Precio</h2>
          <div className="mb-4">
            <label className={CLASE_LABEL}>Precio del servicio (CLP) *</label>
            <input
              type="number"
              min="0"
              className={CLASE_INPUT}
              value={form.precio}
              onChange={(e) => actualizar('precio', e.target.value)}
            />
          </div>

          <div className="border border-black bg-[#f5f5f5] p-4">
            <p className="text-[12px] text-gray-600">Recibirás</p>
            <p className="text-[20px] font-bold text-brand-green">{formatearCLP(neto)}</p>
            <p className="mt-1 text-[10.5px] text-gray-500">
              Monto neto tras la comisión de Skilly.
            </p>
          </div>

          <div className="mt-4 flex gap-2 text-[11.5px] text-gray-700">
            <span>⏳</span>
            <span>Quedará <strong>En revisión</strong> hasta que Skilly lo apruebe.</span>
          </div>

          <button
            type="button"
            disabled={enviando}
            onClick={() => guardar(true)}
            className="mt-4 w-full border border-black bg-black py-3 text-[13px] text-white disabled:opacity-60"
          >
            {enviando ? 'Guardando…' : 'Enviar a revisión'}
          </button>
          <button
            type="button"
            disabled={enviando}
            onClick={() => guardar(false)}
            className="mt-2.5 w-full border border-black bg-white py-3 text-[13px] disabled:opacity-60"
          >
            Guardar borrador
          </button>
        </aside>
      </div>
    </div>
  )
}