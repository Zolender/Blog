import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router'
import { Menu, Rss, PenLine, Shield, LogOut, LogIn, UserPlus, Settings, Search } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { logout } from '../features/auth/authSlice'
import { ROUTES } from '../utils/routes'

const panelVariants = {
  hidden:  { x: '100%' },
  visible: { x: 0,      transition: { type: 'tween' as const, duration: 0.25 } },
  exit:    { x: '100%', transition: { type: 'tween' as const, duration: 0.2  } },
}

const overlayVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit:    { opacity: 0, transition: { duration: 0.2 } },
}

const Navbar = () => {
  const { user }  = useAppSelector((state) => state.auth)
  const dispatch  = useAppDispatch()
  const navigate  = useNavigate()
  const location  = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleLogout = () => {
    dispatch(logout())
    setMobileOpen(false)
    navigate(ROUTES.login)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = searchQuery.trim()
    if (!trimmed) return
    navigate(`${ROUTES.search}?q=${encodeURIComponent(trimmed)}`)
    setSearchQuery('')
    setMobileOpen(false)
  }

  const linkClass = (path: string) =>
    location.pathname === path ? 'nav-link-active' : 'nav-link'

  const panelLinks = [
    {
      to: '/',
      label: 'Feed',
      icon: <Rss size={15} />,
      disabled: false,
    },
    {
      to: '/search',
      label: 'Search',
      icon: <Search size={15} />,
      disabled: false,
    },
    {
      to: '/posts/new',
      label: 'Write',
      icon: <PenLine size={15} />,
      disabled: !user,
    },
  ]

  return (
    <>
      <nav className="bg-white border-b border-border h-16 sticky top-0 z-40">
        <div className="page-wrapper h-full flex items-center justify-between">

          <Link to="/" className="brand-name">Z-Tales</Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/"          className={linkClass('/')}>Feed</Link>
            {user && (
              <Link to="/posts/new" className={linkClass('/posts/new')}>Write</Link>
            )}
            {user?.role === 'admin' && (
              <Link to="/admin" className={linkClass('/admin')}>Admin</Link>
            )}
          </div>

          <div className="hidden md:flex items-center gap-5">
            <form onSubmit={handleSearch} className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search..."
                aria-label="Search tales"
                className="w-40 bg-surface border border-border pl-8 pr-3 py-1.5 font-sans text-sm text-primary outline-none focus:border-accent focus:w-52 transition-all duration-200"
              />
            </form>
            {user ? (
              <>
                <Link to={`/users/${user.username}`} className="meta-text hover:text-accent transition-colors">
                  {user.username}
                </Link>
                <Link to="/settings" className={linkClass('/settings')}>Settings</Link>
                <button onClick={handleLogout} className="nav-link cursor-pointer">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to={ROUTES.login}    className="nav-link">Sign in</Link>
                <Link to={ROUTES.register} className="btn-primary">Register</Link>
              </>
            )}
          </div>

          <button
            className="md:hidden nav-link cursor-pointer"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="overlay"
              variants={overlayVariants}
              initial="hidden" animate="visible" exit="exit"
              className="fixed inset-0 z-50 bg-black/20"
              onClick={() => setMobileOpen(false)}
            />

            <motion.div
              key="panel"
              variants={panelVariants}
              initial="hidden" animate="visible" exit="exit"
              className="fixed top-16 right-4 z-50 w-64 bg-white shadow-xl border border-border flex flex-col"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <span className="font-sans text-xs uppercase tracking-widest text-muted">
                  Navigation
                </span>
              </div>

              <div className="flex flex-col px-3 py-3 border-b border-border">
                {panelLinks.map(({ to, label, icon, disabled }) =>
                  disabled ? (
                    <span
                      key={label}
                      className="flex items-center gap-3 px-3 py-3 font-sans text-sm text-muted/50 cursor-not-allowed select-none"
                    >
                      <span className="opacity-40">{icon}</span>
                      {label}
                    </span>
                  ) : (
                    <Link
                      key={label}
                      to={to}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-3 font-sans text-sm rounded-sm transition-colors duration-200
                        ${location.pathname === to
                          ? 'text-accent bg-surface'
                          : 'text-primary hover:text-accent hover:bg-surface'
                        }`}
                    >
                      {icon}
                      {label}
                    </Link>
                  )
                )}

                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 font-sans text-sm rounded-sm transition-colors duration-200
                      ${location.pathname === '/admin'
                        ? 'text-accent bg-surface'
                        : 'text-primary hover:text-accent hover:bg-surface'
                      }`}
                  >
                    <Shield size={15} />
                    Admin
                  </Link>
                )}
              </div>

              <div className="flex flex-col px-3 py-3">
                {user ? (
                  <>
                    <div className="px-3 py-2 mb-1">
                      <p className="font-sans text-xs text-muted">Signed in as</p>
                      <Link
                        to={`/users/${user.username}`}
                        onClick={() => setMobileOpen(false)}
                        className="font-sans text-sm font-medium text-primary hover:text-accent transition-colors"
                      >
                        {user.username}
                      </Link>
                    </div>
                    <Link
                      to="/settings"
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-3 font-sans text-sm rounded-sm transition-colors duration-200
                        ${location.pathname === '/settings'
                          ? 'text-accent bg-surface'
                          : 'text-primary hover:text-accent hover:bg-surface'
                        }`}
                    >
                      <Settings size={15} />
                      Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-3 py-3 font-sans text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-sm transition-colors duration-200 cursor-pointer text-left"
                    >
                      <LogOut size={15} />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to={ROUTES.login}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-3 py-3 font-sans text-sm text-primary hover:text-accent hover:bg-surface rounded-sm transition-colors duration-200"
                    >
                      <LogIn size={15} />
                      Sign in
                    </Link>
                    <Link
                      to={ROUTES.register}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-3 py-3 font-sans text-sm text-accent font-medium hover:bg-surface rounded-sm transition-colors duration-200"
                    >
                      <UserPlus size={15} />
                      Register
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default Navbar