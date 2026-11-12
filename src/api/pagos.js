import api from './axios'

// Inicia el pago de una reserva. El token solo se envía cuando la reserva se
// creó sin cuenta (enlace mágico); con sesión, el JWT viaja en el header.
export async function iniciarPago(reservaId, token) {
  const { data } = await api.post(
    `/reservas/${reservaId}/pago/iniciar/`,
    {},
    { params: token ? { token } : undefined },
  )
  return data
}

// Consulta pública del estado por la referencia UUID del pago.
export async function estadoPago(referencia) {
  const { data } = await api.get(`/pagos/${referencia}/estado/`)
  return data
}
