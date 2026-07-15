
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import logo from '../../assets/logo.png'

export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Define which pages get the original public layout
  const isAuthPage = ['/login', '/register', '/forgot-password'].includes(location.pathname)
  const isHomePage = location.pathname === '/'
  const isPublicLayout = isHomePage || isAuthPage

  // =========================================================
  // 1. PUBLIC HEADER (Restored exactly like your screenshot)
  // =========================================================
  if (isPublicLayout) {
    return (
      <header className="bg-white border-b border-gray-100 fixed top-0 w-full z-50 h-16 flex items-center">
        <div className="max-w-6xl mx-auto px-4 w-full flex items-center justify-between">

          {/* Original Logo (No white background pill) */}
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Raise Them Foundation" className="h-8 w-auto" />
          </Link>

          {/* Centered Courses Link (Only on the Home Page) */}
          {isHomePage && (
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-navy">
              <Link to="/courses">Courses</Link>
            </nav>
          )}

          {/* Right Side: Sign In + Original Gray Icon */}
          <div className="flex items-center gap-3">
            {user ? (
              <button onClick={() => { logout(); navigate('/') }} className="text-sm text-navy font-medium">
                Log out
              </button>
            ) : (
              <Link to="/login" className="text-sm text-navy font-medium">Sign In</Link>
            )}

            {/* The original gray circle profile icon */}
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-navy">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
          </div>

        </div>
      </header>
    )
  }

  // =========================================================
  // 2. DASHBOARD HEADER (The new dark theme you liked)
  // =========================================================
  return (
    <header className="bg-navy fixed top-0 w-full z-50 h-16 flex items-center">

      {/* DESKTOP LOGO CONTAINER (Aligns with the sidebar) */}
      {/* CHANGED: Swapped px-4 to justify-center to perfectly center it in the sidebar */}
      <div className="hidden md:flex items-center justify-center w-64 flex-shrink-0">
        {/* CHANGED: rounded-lg is now rounded-full for the circular look */}
        <Link to="/" className="flex items-center bg-white px-4 py-1.5 rounded-full shadow-sm">
          <img src={logo} alt="Raise Them Foundation" className="h-7 w-auto" />
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-between px-6 md:pl-10 md:pr-6">

        {/* MOBILE LOGO */}
        <div className="flex items-center">
          {/* CHANGED: rounded-lg is now rounded-full to match the desktop logo */}
          <Link to="/" className="flex items-center bg-white px-4 py-1.5 rounded-full shadow-sm mr-4 md:hidden">
            <img src={logo} alt="Raise Them Foundation" className="h-7 w-auto" />
          </Link>
        </div>

        {/* PROFILE & LOGOUT */}
        <div className="flex items-center gap-5">
          <button onClick={() => { logout(); navigate('/') }} className="text-sm text-white font-medium hover:text-gray-300 transition-colors">
            Log out
          </button>
          <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
        </div>

      </div>
    </header>
  )
}