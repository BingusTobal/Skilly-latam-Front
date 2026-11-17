import { useEffect, useState } from 'react'

import { mensajeDeError } from '../../api/axios'
import {
  actualizarHorario,
  crearHorario,
  eliminarHorario,
  listarHorarios,
} from '../../api/horarios'
import Alerta from '../../components/Alerta'
import Icon from '../../components/Icon'
import {
  Boton,
  Campo,
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  Input,
  PageHeader,
  Select,
  Skeleton,
  Estado,
} from '../../components/ui'

const DIAS = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
]

export default function MisHorarios() {
  const [horarios, setHorarios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [nuevo, setNuevo] = useState({
    dia_semana: 0,
    hora_inicio: '09:00',
    hora_fin: '18:00',
  })
  const [guardando, setGuardando] = useState(false)
  const [ocupado, setOcupado] = useState(null)

  function cargar() {
    setCargando(true)
    listarHorarios()
      .then((data) => setHorarios(data))
      .catch((err) => setError(mensajeDeError(err)))
      .finally(() => setCargando(false))
  }

  useEffect(cargar, [])

  async function agregar(evento) {
    evento.preventDefault()
    setError('')
    setGuardando(true)
    try {
      await crearHorario({
        dia_semana: Number(nuevo.dia_semana),
        hora_inicio: nuevo.hora_inicio,
        hora_fin: nuevo.hora_fin,
        activo: true,
      })
      cargar()
    } catch (err) {
      setError(mensajeDeError(err))
    } finally {
      setGuardando(false)
    }
  }

  async function alternar(horario) {
    setError('')
    setOcupado(horario.id)
    try {
      await actualizarHorario(horario.id, { activo: !horario.activo })
      cargar()
    } catch (err) {
      setError(mensajeDeError(err))
    } finally {
      setOcupado(null)
    }
  }

  async function eliminar(horario) {
    setError('')
    setOcupado(horario.id)
    try {
      await eliminarHorario(horario.id)
      cargar()
    } catch (err) {
      setError(mensajeDeError(err))
    } finally {
      setOcupado(null)
    }
  }

  return (
    <div>
      <PageHeader
        etiqueta="Panel profesional"
        titulo="Mis horarios"
        descripcion="Define tu disponibilidad semanal. Las organizaciones solo podrán reservar dentro de estos bloques."
      />

      {error && (
        <div className="mb-4">
          <Alerta>{error}</Alerta>
        </div>
      )}

      <Card className="mb-6">
        <CardHeader>
          <div>
            <h2 className="text-[0.9375rem] font-bold text-ink">Agregar bloque</h2>
            <p className="mt-0.5 text-[0.8125rem] text-ink-3">
              Elige el día y la franja horaria en que estarás disponible.
            </p>
          </div>
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-blue-soft text-brand-blue-deep">
            <Icon nombre="clock" className="h-5 w-5" />
          </span>
        </CardHeader>
        <CardBody>
          <form
            onSubmit={agregar}
            className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end"
          >
            <Campo etiqueta="Día" htmlFor="dia_semana" className="sm:w-44">
              <Select
                id="dia_semana"
                value={nuevo.dia_semana}
                onChange={(e) => setNuevo({ ...nuevo, dia_semana: e.target.value })}
              >
                {DIAS.map((dia, indice) => (
                  <option key={dia} value={indice}>
                    {dia}
                  </option>
                ))}
              </Select>
            </Campo>
            <Campo etiqueta="Desde" htmlFor="hora_inicio" className="sm:w-36">
              <Input
                id="hora_inicio"
                type="time"
                required
                value={nuevo.hora_inicio}
                onChange={(e) => setNuevo({ ...nuevo, hora_inicio: e.target.value })}
              />
            </Campo>
            <Campo etiqueta="Hasta" htmlFor="hora_fin" className="sm:w-36">
              <Input
                id="hora_fin"
                type="time"
                required
                value={nuevo.hora_fin}
                onChange={(e) => setNuevo({ ...nuevo, hora_fin: e.target.value })}
              />
            </Campo>
            <Boton type="submit" cargando={guardando} className="sm:mb-0.5">
              <Icon nombre="plus" className="h-4 w-4" />
              Agregar bloque
            </Boton>
          </form>
        </CardBody>
      </Card>

      {cargando ? (
        <div className="space-y-2.5">
          {[0, 1, 2].map((indice) => (
            <div
              key={indice}
              className="flex items-center justify-between rounded-2xl border border-line bg-white p-4 shadow-card"
            >
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-8 w-40" />
            </div>
          ))}
        </div>
      ) : horarios.length === 0 ? (
        <EmptyState icono="clock" titulo="Aún no has definido horarios">
          Sin horarios, tus servicios no aparecerán con cupos disponibles para reservar.
        </EmptyState>
      ) : (
        <ul className="space-y-2.5">
          {horarios.map((horario) => (
            <li key={horario.id}>
              <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
                      horario.activo
                        ? 'bg-brand-mint-soft text-brand-mint-deep'
                        : 'bg-canvas text-ink-3'
                    }`}
                  >
                    <Icon nombre="calendar" className="h-5 w-5" />
                  </span>
                  <div>
                    <p
                      className={`text-[0.9375rem] font-bold ${
                        horario.activo ? 'text-ink' : 'text-ink-3 line-through'
                      }`}
                    >
                      {DIAS[horario.dia_semana]}
                    </p>
                    <p className="text-[0.8125rem] text-ink-3">
                      {horario.hora_inicio.slice(0, 5)}–{horario.hora_fin.slice(0, 5)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  <Estado tono={horario.activo ? 'ok' : 'neutro'}>
                    {horario.activo ? 'Disponible' : 'Inactivo'}
                  </Estado>
                  <Boton
                    tamano="sm"
                    variante="secundario"
                    disabled={ocupado === horario.id}
                    onClick={() => alternar(horario)}
                  >
                    {horario.activo ? 'Desactivar' : 'Activar'}
                  </Boton>
                  <Boton
                    tamano="sm"
                    variante="fantasma"
                    className="text-danger hover:bg-danger-soft"
                    disabled={ocupado === horario.id}
                    onClick={() => eliminar(horario)}
                  >
                    <Icon nombre="trash" className="h-4 w-4" />
                    Eliminar
                  </Boton>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
