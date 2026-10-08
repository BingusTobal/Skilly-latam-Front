import axios from 'axios'

const TOKEN_KEY = 'skilly_access'
const REFRESH_KEY = 'skilly_refresh'

export const tokenStore = {
  get access() {
    return localStorage.getItem(TOKEN_KEY)
  },
  get refresh() {
    return localStorage.getItem(REFRESH_KEY)
  },
  set({ access, refresh }) {
    if (access) localStorage.setItem(TOKEN_KEY, access)
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh)
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_KEY)
  },
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = tokenStore.access
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let refreshing = null

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config } = error
    const esRefresh = config?.url?.includes('/auth/token/refresh/')
    if (response?.status === 401 && !config?._retry && !esRefresh) {
      const refresh = tokenStore.refresh
      if (refresh) {
        config._retry = true
        try {
          refreshing =
            refreshing ||
            axios.post(`${api.defaults.baseURL}/auth/token/refresh/`, { refresh })
          const { data } = await refreshing
          refreshing = null
          tokenStore.set({ access: data.access })
          config.headers.Authorization = `Bearer ${data.access}`
          return api(config)
        } catch (refreshError) {
          refreshing = null
          tokenStore.clear()
          window.dispatchEvent(new Event('skilly:logout'))
          return Promise.reject(refreshError)
        }
      }
    }
    return Promise.reject(error)
  },
)

export function mensajeDeError(error) {
  const data = error?.response?.data
  if (!data) return 'No pudimos conectar con el servidor.'
  if (typeof data === 'string') return data
  if (data.detail) return data.detail
  const primerCampo = Object.values(data)[0]
  if (Array.isArray(primerCampo)) return primerCampo[0]
  if (typeof primerCampo === 'string') return primerCampo
  return 'Ocurrió un error inesperado.'
}

export default api