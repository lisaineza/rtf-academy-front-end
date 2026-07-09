import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useState } from 'react'
import logo from '../../assets/logo.png'

export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <button className="md:hidden" onClick={() => setMenuOpen((v) => !v)} aria-label="Menu">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
          </svg>
        </button>

        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Raise Them Foundation" className="h-8 w-auto" />
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-navy">
          {!user?.role || user?.role !== 'admin' ? (
            <>
              <Link to="/courses">Courses</Link>
              {user && <Link to="/dashboard">My Learning</Link>}
              {user && <Link to="/certificates">Certificates</Link>}
            </>
          ) : null}
          {user?.role === 'admin' && <Link to="/admin">Admin</Link>}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <button onClick={() => { logout(); navigate('/') }} className="text-sm text-navy font-medium">
              Log out
            </button>
          ) : (
            <Link to="/login" className="text-sm text-navy font-medium">Sign In</Link>
          )}
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
        </div>
      </div>

      {menuOpen && (
        <nav className="md:hidden border-t border-gray-100 px-4 py-3 flex flex-col gap-3 text-sm font-medium text-navy">
          {!user?.role || user?.role !== 'admin' ? (
            <>
              <Link to="/courses" onClick={() => setMenuOpen(false)}>Courses</Link>
              {user && <Link to="/dashboard" onClick={() => setMenuOpen(false)}>My Learning</Link>}
              {user && <Link to="/certificates" onClick={() => setMenuOpen(false)}>Certificates</Link>}
            </>
          ) : null}
          {user?.role === 'admin' && <Link to="/admin" onClick={() => setMenuOpen(false)}>Admin</Link>}
        </nav>
      )}
    </header>
  )
}
