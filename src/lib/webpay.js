// Webpay Plus espera que el navegador llegue a su formulario con `token_ws`.
// Se envía por POST en un formulario oculto para no exponer el token en la URL.
export function irAWebpay({ url, token }) {
  if (!url || !token) return false

  const form = document.createElement('form')
  form.method = 'POST'
  form.action = url
  form.style.display = 'none'

  const input = document.createElement('input')
  input.type = 'hidden'
  input.name = 'token_ws'
  input.value = token
  form.appendChild(input)

  document.body.appendChild(form)
  form.submit()
  return true
}
