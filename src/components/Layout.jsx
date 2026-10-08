import { Outlet } from 'react-router-dom'

import Navbar from './Navbar'

export default function Layout({ ancho = 'max-w-5xl' }) {
  return (
    <div className="flex justify-center px-3 py-6">
      <div className={`w-full ${ancho} border border-black bg-white px-6 pb-8 pt-5`}>
        <Navbar />
        <Outlet />
      </div>
    </div>
  )
}