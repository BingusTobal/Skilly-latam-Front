export function Tabla({ children, className = '', ...props }) {
  return (
    <div className="overflow-x-auto rounded-[20px] border border-line bg-white shadow-card">
      <table className={`w-full border-collapse text-left ${className}`} {...props}>
        {children}
      </table>
    </div>
  )
}

export function Th({ children, className = '', ...props }) {
  return (
    <th
      scope="col"
      className={`border-b border-line bg-canvas/70 px-4 py-3 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-ink-3 ${className}`}
      {...props}
    >
      {children}
    </th>
  )
}

export function Td({ children, className = '', ...props }) {
  return (
    <td
      className={`border-b border-line/70 px-4 py-3 text-[0.8125rem] text-ink-2 last:border-b-0 ${className}`}
      {...props}
    >
      {children}
    </td>
  )
}

export function Tr({ children, className = '', ...props }) {
  return (
    <tr className={`transition hover:bg-canvas/50 ${className}`} {...props}>
      {children}
    </tr>
  )
}
