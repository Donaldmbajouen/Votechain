import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-gray-900/80 backdrop-blur border-b border-gray-800 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
      <Link to="/" className="font-bold text-white flex items-center gap-2 text-sm tracking-wide">
        <span className="text-lg">🗳️</span> VoteChain
      </Link>
      <div className="flex items-center gap-3 text-sm">
        {user ? (
          <>
            <span className="text-gray-500 hidden sm:block text-xs">{user.email}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide
              ${user.role === 'admin' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-gray-700 text-gray-400'}`}>
              {user.role}
            </span>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-white text-xs transition px-3 py-1.5 rounded-lg hover:bg-gray-800"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-gray-400 hover:text-white text-xs transition">Login</Link>
            <Link to="/register" className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
