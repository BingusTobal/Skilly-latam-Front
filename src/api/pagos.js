import api from './axios'

// Iniciar pago: el token viaja solo en reservas sin cuenta (enlace mágico);
// con sesión, el JWT se envía en el header.
export async function iniciarPago(reservaId, token) {
  const { data } = await api.post(
    `/reservas/${reservaId}/pago/iniciar/`,
    {},
    { params: token ? { token } : undefined },
  )
  return data
}

// Resultado pago: consulta pública del estado por la referencia UUID.
export async function estadoPago(referencia) {
  const { data } = await api.get(`/pagos/${referencia}/estado/`)
  return data
}
