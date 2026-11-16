// Centro de ayuda (RF-18 y RF-31). El contenido vive acá, separado de la
// página, para poder corregirlo sin tocar el componente ni el comportamiento
// del buscador.

export const CONTACTO = {
  email: 'hola@skillylatam.com',
  horario: 'Nuestro equipo responde de lunes a viernes, 9:00–18:00',
  asunto: 'Hola, necesito ayuda con Skilly',
}

export const CATEGORIAS_AYUDA = [
  {
    id: 'reservas',
    titulo: 'Reservas y pagos',
    descripcion: 'Autorizaciones, plazos y cancelaciones',
    color: 'bg-sky',
  },
  {
    id: 'profesionales',
    titulo: 'Profesionales',
    descripcion: 'Postulación, certificados y publicación',
    color: 'bg-mint',
  },
  {
    id: 'disputas',
    titulo: 'Disputas',
    descripcion: 'Problemas con una entrega y reembolsos',
    color: 'bg-sand',
  },
]

export const PREGUNTAS = [
  {
    categoria: 'reservas',
    pregunta: '¿Cuándo se me cobra el servicio?',
    respuesta:
      'Al reservar solo se autoriza el monto en tu método de pago: todavía no se cobra. El cargo efectivo ocurre cuando el profesional acepta la solicitud dentro del plazo de 6 horas.',
  },
  {
    categoria: 'reservas',
    pregunta: '¿Qué pasa si el profesional rechaza mi solicitud?',
    respuesta:
      'La autorización de pago se libera sin costo para ti. Puedes volver al catálogo y elegir otro servicio de la misma categoría; no hay reasignación automática ni profesional de respaldo.',
  },
  {
    categoria: 'reservas',
    pregunta: '¿Y si el profesional no responde?',
    respuesta:
      'Si el profesional no responde en 6 horas, la solicitud se cancela y la autorización de pago se libera sin costo. El horario vuelve a quedar disponible.',
  },
  {
    categoria: 'reservas',
    pregunta: '¿Puedo hacer una reserva sin tener cuenta?',
    respuesta:
      'Sí. Al reservar te pedimos solo tus datos de contacto y los de tu organización en el formulario, sin necesidad de crear una contraseña. Si ya tienes cuenta, puedes iniciar sesión para no volver a ingresarlos.',
  },
  {
    categoria: 'reservas',
    pregunta: '¿Cuál es la política de cancelación?',
    respuesta:
      'Antes de que el profesional acepte, se devuelve el 100 %. Con 24 horas o más de anticipación al kickoff, también se devuelve el 100 %. Con menos de 24 horas, se devuelve el 90 % del monto. Pasado el horario de inicio no hay cancelación: puedes reportar un problema o esperar la entrega. El no-show se escala a disputa.',
  },
  {
    categoria: 'reservas',
    pregunta: '¿Cómo se calcula la comisión de gestión de Skilly?',
    respuesta:
      'La comisión es un porcentaje del valor del servicio y se descuenta cuando se libera el pago. El profesional siempre ve el monto neto que recibirá, ya con la comisión descontada.',
  },
  {
    categoria: 'profesionales',
    pregunta: '¿Cómo valida Skilly a los profesionales?',
    respuesta:
      'El perfil de LinkedIn se valida automáticamente por el formato de la URL. Cualquier otro documento queda sin revisar hasta que un administrador lo apruebe manualmente. Aprobar un certificado es independiente de aprobar la postulación.',
  },
  {
    categoria: 'profesionales',
    pregunta: '¿Los servicios se publican de inmediato?',
    respuesta:
      'No. Al publicar, el servicio queda en revisión. Un administrador puede aprobarlo o devolverlo con comentarios para que el profesional corrija los campos necesarios antes de que aparezca en el catálogo.',
  },
  {
    categoria: 'disputas',
    pregunta: 'El servicio entregado no cumple lo acordado, ¿qué hago?',
    respuesta:
      'Antes de confirmar la entrega, usa la opción "Reportar un problema". El pago queda retenido mientras Skilly revisa el caso, en vez de liberarse automáticamente. También se bloquea la liberación automática a los 5 días mientras la disputa siga abierta.',
  },
  {
    categoria: 'disputas',
    pregunta: '¿Qué pasa si no confirmo la entrega?',
    respuesta:
      'Pasados 5 días desde la entrega, el pago se libera automáticamente, salvo que exista una disputa abierta. Si detectaste un problema, repórtalo antes de ese plazo.',
  },
]
