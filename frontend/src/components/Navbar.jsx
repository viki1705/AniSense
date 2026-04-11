import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Home, MessageSquare, Compass, Bookmark, LogOut, LayoutDashboard, Settings } from 'lucide-react'
import { useUser } from '../contexts/UserContext'

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useUser()

  const publicLinks = [
    { path: '/', label: 'Home', icon: Home },
  ]

  const protectedLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/chat', label: 'Chat', icon: MessageSquare },
    { path: '/explore', label: 'Explore', icon: Compass },
    { path: '/watchlist', label: 'Watchlist', icon: Bookmark },
  ]

  const links = user ? protectedLinks : publicLinks

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="bg-primary-800 border-b border-accent-purple/20 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition">
          <span className="text-2xl">🎌</span>
          <span className="text-xl font-bold gradient-text">AniSense</span>
        </Link>

        <div className="flex items-center gap-1">
          {links.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${
                location.pathname === path
                  ? 'bg-accent-purple/20 text-accent-cyan'
                  : 'text-secondary hover:bg-primary-700'
              }`}
            >
              <Icon size={18} />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          ))}

          {user && (
            <div className="flex items-center gap-2 ml-4 pl-4 border-l border-primary-700">
              <Link
                to="/settings"
                className={`px-3 py-2 rounded-lg flex items-center gap-2 transition ${
                  location.pathname === '/settings'
                    ? 'bg-accent-purple/20 text-accent-cyan'
                    : 'text-secondary hover:bg-primary-700'
                }`}
                title="Settings"
              >
                <Settings size={18} />
                <span className="hidden sm:inline text-sm">Settings</span>
              </Link>

              <span className="text-sm text-gray-400">👤 {user.username}</span>
              <button
                onClick={handleLogout}
                className="px-3 py-2 rounded-lg flex items-center gap-2 text-secondary hover:bg-primary-700 transition"
                title="Logout"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline text-xs">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}


