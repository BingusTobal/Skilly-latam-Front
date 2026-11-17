import { useEffect } from 'react'

export default function useReveal(dependencias = [], selector = '[data-reveal]') {
  useEffect(() => {
    const raiz = document.querySelector('.sk-home') || document.body
    if (!raiz) return undefined

    const nodos = raiz.querySelectorAll(selector)

    if (!('IntersectionObserver' in window)) {
      nodos.forEach((nodo) => nodo.classList.add('is-visible'))
      return undefined
    }

    const observador = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((entrada) => {
          if (!entrada.isIntersecting) return
          entrada.target.classList.add('is-visible')
          observador.unobserve(entrada.target)
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    )

    nodos.forEach((nodo) => observador.observe(nodo))
    return () => observador.disconnect()
  }, dependencias)
}
