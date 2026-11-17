export default function Card({
  as: Etiqueta = 'div',
  children,
  className = '',
  ...props
}) {
  return (
    <Etiqueta
      className={`rounded-[20px] border border-line bg-white shadow-card ${className}`}
      {...props}
    >
      {children}
    </Etiqueta>
  )
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={`flex items-start justify-between gap-4 px-5 pt-5 sm:px-6 sm:pt-6 ${className}`}>
      {children}
    </div>
  )
}

export function CardBody({ children, className = '' }) {
  return <div className={`px-5 py-4 sm:px-6 sm:py-5 ${className}`}>{children}</div>
}

export function CardFooter({ children, className = '' }) {
  return (
    <div
      className={`flex flex-wrap items-center justify-end gap-3 border-t border-line px-5 pb-5 pt-4 sm:px-6 ${className}`}
    >
      {children}
    </div>
  )
}
