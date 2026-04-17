import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', form)
      login(data.access_token)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🗳️</div>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-gray-400 text-sm mt-1">Sign in to VoteChain</p>
        </div>

        <div className="bg-gray-800/60 border border-gray-700/50 rounded-2xl p-6 shadow-xl">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Email</label>
              <input
                type="email" required placeholder="you@example.com"
                className="w-full bg-gray-700/60 border border-gray-600/50 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition placeholder-gray-500"
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Password</label>
              <input
                type="password" required placeholder="••••••••"
                className="w-full bg-gray-700/60 border border-gray-600/50 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition placeholder-gray-500"
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 mt-1"
            >
              {loading
                ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Signing in...</>
                : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="text-gray-500 text-sm text-center mt-4">
          No account?{' '}
          <Link to="/register" className="text-indigo-400 hover:text-indigo-300 transition">Create one</Link>
        </p>
      </div>
    </div>
  )
}
