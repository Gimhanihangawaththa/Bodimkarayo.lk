import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'

export default function Layout() {
  const location = useLocation()
  const isAuthPage = location.pathname === '/signin' || location.pathname === '/signup'

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-slate-900">
      {!isAuthPage && <Header />}
      <main className="flex-1">
        <Outlet />
      </main>
      {!isAuthPage && <Footer />}
    </div>
  )
}
