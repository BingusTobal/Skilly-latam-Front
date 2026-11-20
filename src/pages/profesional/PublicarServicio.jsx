import { useEffect, useState } from 'react'
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
import Icon from '../../components/Icon'
import { cotizarNeto } from '../../api/comisiones'
import {
  Boton,
  Campo,
  Card,
  CardBody,
  CardHeader,
  Input,
  PageHeader,
  Select,
  Textarea,
} from '../../components/ui'
import { FORMATOS, formatearCLP, montoNeto } from '../../lib/formato'

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

// Publicar servicio: crea o edita un servicio y lo envía a revisión.
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

  const requiereUbicacion =
    form.formato === 'presencial' || form.formato === 'semipresencial'
  const [neto, setNeto] = useState(0)

  useEffect(() => {
    const precio = Number(form.precio) || 0
    if (!precio) {
      setNeto(0)
      return
    }
    let vigente = true
    cotizarNeto({ precio, categoria: form.categoria })
      .then((data) => {
        if (vigente) setNeto(data.monto_neto)
      })
      .catch(() => {
        if (vigente) setNeto(montoNeto(precio))
      })
    return () => {
      vigente = false
    }
  }, [form.precio, form.categoria])

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
        ? await actualizarServicio(id, payload())
        : await crearServicio(payload())
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
    <div>
      <PageHeader
        etiqueta="Panel profesional"
        titulo={editando ? 'Editar servicio' : 'Publicar un nuevo servicio'}
        descripcion="Completa la información del servicio. Al enviarlo, Skilly lo revisa antes de publicarlo en el catálogo."
        migas={[
          { texto: 'Mis servicios', to: '/profesional/servicios' },
          { texto: editando ? 'Editar servicio' : 'Nuevo servicio' },
        ]}
      />

      {error && (
        <div className="mb-4">
          <Alerta>{error}</Alerta>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <div>
                <h2 className="text-[0.9375rem] font-bold text-ink">
                  Información general
                </h2>
                <p className="mt-0.5 text-[0.8125rem] text-ink-3">
                  Lo primero que verán las organizaciones en el catálogo.
                </p>
              </div>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-blue-soft text-brand-blue-deep">
                <Icon nombre="file" className="h-5 w-5" />
              </span>
            </CardHeader>
            <CardBody className="space-y-4">
              <Campo etiqueta="Nombre del servicio" htmlFor="titulo" requerido>
                <Input
                  id="titulo"
                  value={form.titulo}
                  onChange={(e) => actualizar('titulo', e.target.value)}
                  placeholder="Ej: Sitio web corporativo en 15 días"
                />
              </Campo>

              <Campo etiqueta="Categoría" htmlFor="categoria" requerido>
                <Select
                  id="categoria"
                  value={form.categoria}
                  onChange={(e) => actualizar('categoria', e.target.value)}
                >
                  <option value="">Selecciona una categoría</option>
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </Select>
              </Campo>

              <Campo
                etiqueta="Descripción breve"
                htmlFor="descripcion_corta"
                requerido
                ayuda="Una línea que resuma el servicio."
              >
                <Input
                  id="descripcion_corta"
                  maxLength={160}
                  value={form.descripcion_corta}
                  onChange={(e) => actualizar('descripcion_corta', e.target.value)}
                />
              </Campo>

              <Campo
                etiqueta="Descripción larga"
                htmlFor="descripcion_larga"
                requerido
                ayuda="Detalla el alcance, la metodología y lo que puede esperar la organización."
              >
                <Textarea
                  id="descripcion_larga"
                  rows={6}
                  className="min-h-32"
                  value={form.descripcion_larga}
                  onChange={(e) => actualizar('descripcion_larga', e.target.value)}
                />
              </Campo>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <h2 className="text-[0.9375rem] font-bold text-ink">
                  ¿Qué incluye el servicio?
                </h2>
                <p className="mt-0.5 text-[0.8125rem] text-ink-3">
                  Lista los entregables concretos que recibirá la organización.
                </p>
              </div>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-mint-soft text-brand-mint-deep">
                <Icon nombre="check-circle" className="h-5 w-5" />
              </span>
            </CardHeader>
            <CardBody className="space-y-2.5">
              {form.entregables.map((entregable, indice) => (
                <div key={indice} className="flex items-center gap-2">
                  <Icon
                    nombre="check"
                    className="h-4 w-4 shrink-0 text-brand-mint-deep"
                    strokeWidth={2.4}
                  />
                  <Input
                    value={entregable.nombre}
                    placeholder="Entregable"
                    onChange={(e) => actualizarEntregable(indice, e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => quitarEntregable(indice)}
                    aria-label={`Quitar entregable ${indice + 1}`}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-ink-3 transition hover:bg-danger-soft hover:text-danger"
                  >
                    <Icon nombre="close" className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={agregarEntregable}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-line px-3 py-2.5 text-[0.8125rem] font-semibold text-ink-2 transition hover:border-brand-blue hover:text-brand-blue"
              >
                <Icon nombre="plus" className="h-4 w-4" />
                Agregar otro entregable
              </button>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <h2 className="text-[0.9375rem] font-bold text-ink">
                  Condiciones de entrega
                </h2>
                <p className="mt-0.5 text-[0.8125rem] text-ink-3">
                  Define cómo y dónde se ejecutará el servicio.
                </p>
              </div>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-violet-soft text-brand-violet">
                <Icon nombre="monitor" className="h-5 w-5" />
              </span>
            </CardHeader>
            <CardBody className="space-y-4">
              <Campo etiqueta="Duración estimada" htmlFor="duracion_estimada">
                <Input
                  id="duracion_estimada"
                  value={form.duracion_estimada}
                  onChange={(e) => actualizar('duracion_estimada', e.target.value)}
                  placeholder="Ej: 15 días"
                />
              </Campo>

              <div>
                <p className="mb-1.5 block text-[0.8125rem] font-semibold text-ink-2">
                  Modalidad <span className="ml-1 text-danger">*</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(FORMATOS).map(([clave, etiqueta]) => {
                    const activo = form.formato === clave
                    return (
                      <label
                        key={clave}
                        className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-1.5 text-[0.8125rem] font-semibold transition ${
                          activo
                            ? 'border-brand-blue bg-brand-blue text-white'
                            : 'border-line bg-white text-ink-2 hover:border-ink-3 hover:text-ink'
                        }`}
                      >
                        <input
                          type="radio"
                          name="formato"
                          value={clave}
                          checked={activo}
                          onChange={(e) => actualizar('formato', e.target.value)}
                          className="sr-only"
                        />
                        {etiqueta}
                      </label>
                    )
                  })}
                </div>
              </div>

              {requiereUbicacion && (
                <Campo etiqueta="Ubicación" htmlFor="ubicacion" requerido>
                  <Input
                    id="ubicacion"
                    value={form.ubicacion}
                    onChange={(e) => actualizar('ubicacion', e.target.value)}
                    placeholder="Ej: Providencia, Santiago"
                  />
                </Campo>
              )}
            </CardBody>
          </Card>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <Card>
            <CardHeader>
              <h2 className="text-[0.9375rem] font-bold text-ink">Precio</h2>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-coral-soft text-brand-coral-deep">
                <Icon nombre="wallet" className="h-5 w-5" />
              </span>
            </CardHeader>
            <CardBody className="space-y-4">
              <Campo
                etiqueta="Precio del servicio (CLP)"
                htmlFor="precio"
                requerido
              >
                <Input
                  id="precio"
                  type="number"
                  min="0"
                  value={form.precio}
                  onChange={(e) => actualizar('precio', e.target.value)}
                />
              </Campo>

              <div className="rounded-xl bg-brand-mint-soft px-4 py-3.5">
                <p className="text-[0.75rem] font-semibold text-brand-mint-deep">
                  Recibirás
                </p>
                <p className="mt-1 text-[1.5rem] font-extrabold leading-none tracking-[-0.03em] text-ink">
                  {formatearCLP(neto)}
                </p>
                <p className="mt-1.5 text-[0.6875rem] leading-relaxed text-ink-3">
                  Monto neto tras la comisión de Skilly.
                </p>
              </div>

              <div className="flex items-start gap-2 rounded-xl bg-info-soft px-3.5 py-3 text-[0.75rem] leading-relaxed text-info">
                <Icon
                  nombre="clock"
                  className="mt-0.5 h-4 w-4 shrink-0"
                  strokeWidth={2}
                />
                <span>
                  Quedará <strong>En revisión</strong> hasta que Skilly lo apruebe.
                </span>
              </div>

              <div className="space-y-2.5">
                <Boton
                  type="button"
                  className="w-full"
                  cargando={enviando}
                  onClick={() => guardar(true)}
                >
                  Enviar a revisión
                </Boton>
                <Boton
                  type="button"
                  variante="secundario"
                  className="w-full"
                  disabled={enviando}
                  onClick={() => guardar(false)}
                >
                  Guardar borrador
                </Boton>
              </div>

              <Link
                to="/profesional/servicios"
                className="block text-center text-[0.8125rem] font-semibold text-ink-3 no-underline transition hover:text-ink"
              >
                Volver a mis servicios
              </Link>
            </CardBody>
          </Card>
        </aside>
      </div>
    </div>
  )
}
