import { createContext, useContext, useEffect, useMemo, useState } from 'react'

import { login as loginApi, miPerfil, registrarse as registrarseApi } from '../api/auth'
import { tokenStore } from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    let activo = true
    async function cargar() {
      if (!tokenStore.access) {
        setCargando(false)
        return
      }
      try {
        const perfil = await miPerfil()
        if (activo) setUsuario(perfil)
      } catch {
        tokenStore.clear()
      } finally {
        if (activo) setCargando(false)
      }
    }
    cargar()
    return () => {
      activo = false
    }
  }, [])

  useEffect(() => {
    const cerrar = () => setUsuario(null)
    window.addEventListener('skilly:logout', cerrar)
    return () => window.removeEventListener('skilly:logout', cerrar)
  }, [])

  async function iniciarSesion(email, password) {
    const data = await loginApi(email, password)
    tokenStore.set({ access: data.access, refresh: data.refresh })
    setUsuario(data.usuario)
    return data.usuario
  }

  async function registrarse(datos) {
    await registrarseApi(datos)
    return iniciarSesion(datos.email_contacto, datos.password)
  }

  function cerrarSesion() {
    tokenStore.clear()
    setUsuario(null)
  }

  const valor = useMemo(
    () => ({ usuario, cargando, iniciarSesion, registrarse, cerrarSesion }),
    [usuario, cargando],
  )

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}