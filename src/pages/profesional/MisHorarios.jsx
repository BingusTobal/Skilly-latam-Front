import { useEffect, useState } from 'react'

import { mensajeDeError } from '../../api/axios'
import {
  actualizarHorario,
  crearHorario,
  eliminarHorario,
  listarHorarios,
} from '../../api/horarios'
import Alerta from '../../components/Alerta'

const DIAS = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
]

const claseCampo =
  'border border-gray-300 px-2.5 py-2 text-[13px] focus:border-black focus:outline-none'

export default function MisHorarios() {
  const [horarios, setHorarios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [nuevo, setNuevo] = useState({ dia_semana: 0, hora_inicio: '09:00', hora_fin: '18:00' })
  const [guardando, setGuardando] = useState(false)

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
    try {
      await actualizarHorario(horario.id, { activo: !horario.activo })
      cargar()
    } catch (err) {
      setError(mensajeDeError(err))
    }
  }

  async function eliminar(horario) {
    setError('')
    try {
      await eliminarHorario(horario.id)
      cargar()
    } catch (err) {
      setError(mensajeDeError(err))
    }
  }

  return (
    <div className="pt-6">
      <h1 className="text-[20px] font-bold">Mis horarios</h1>
      <p className="mb-5 text-[12.5px] text-gray-500">
        Define tu disponibilidad semanal. Los clientes solo podrán reservar dentro
        de estos bloques.
      </p>

      {error && (
        <div className="mb-4">
          <Alerta>{error}</Alerta>
        </div>
      )}

      <form
        onSubmit={agregar}
        className="mb-6 flex flex-wrap items-end gap-3 border border-line px-4 py-3.5"
      >
        <div>
          <label className="mb-1 block text-[12px] font-bold">Día</label>
          <select
            className={claseCampo}
            value={nuevo.dia_semana}
            onChange={(e) => setNuevo({ ...nuevo, dia_semana: e.target.value })}
          >
            {DIAS.map((dia, indice) => (
              <option key={dia} value={indice}>
                {dia}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-[12px] font-bold">Desde</label>
          <input
            type="time"
            required
            className={claseCampo}
            value={nuevo.hora_inicio}
            onChange={(e) => setNuevo({ ...nuevo, hora_inicio: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1 block text-[12px] font-bold">Hasta</label>
          <input
            type="time"
            required
            className={claseCampo}
            value={nuevo.hora_fin}
            onChange={(e) => setNuevo({ ...nuevo, hora_fin: e.target.value })}
          />
        </div>
        <button
          type="submit"
          disabled={guardando}
          className="border border-black bg-black px-4 py-2 text-[13px] text-white disabled:opacity-50"
        >
          {guardando ? 'Guardando…' : '+ Agregar bloque'}
        </button>
      </form>

      {cargando ? (
        <p className="text-[13px] text-gray-500">Cargando…</p>
      ) : horarios.length === 0 ? (
        <p className="text-[13px] text-gray-500">
          Aún no has definido horarios. Sin horarios, tus servicios no aparecerán con
          cupos disponibles.
        </p>
      ) : (
        <ul className="space-y-2.5">
          {horarios.map((horario) => (
            <li
              key={horario.id}
              className="flex items-center justify-between border border-line px-4 py-3"
            >
              <span
                className={`text-[13px] ${horario.activo ? '' : 'text-gray-400 line-through'}`}
              >
                <strong>{DIAS[horario.dia_semana]}</strong> ·{' '}
                {horario.hora_inicio.slice(0, 5)}–{horario.hora_fin.slice(0, 5)}
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => alternar(horario)}
                  className="text-[12.5px] underline"
                >
                  {horario.activo ? 'Desactivar' : 'Activar'}
                </button>
                <button
                  type="button"
                  onClick={() => eliminar(horario)}
                  className="text-[12.5px] text-red-600 underline"
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
