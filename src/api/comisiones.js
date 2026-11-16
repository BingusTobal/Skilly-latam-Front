import api from './axios'

export async function cotizarNeto({ precio, categoria }) {
  const { data } = await api.get('/tasa-neto/', {
    params: { precio, categoria: categoria || undefined },
  })
  return data
}
