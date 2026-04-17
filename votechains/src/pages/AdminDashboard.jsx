import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import api from '../api/client'
import ResultsChart from '../components/ResultsChart'

function ManageTab({ campaigns, fetchCampaigns }) {
  const [form, setForm] = useState({ title: '', description: '', starts_at: '', ends_at: '' })
  const [candidateForm, setCandidateForm] = useState({ name: '', bio: '' })
  const [selectedCampaign, setSelectedCampaign] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const createCampaign = async (e) => {
    e.preventDefault()
    setError(''); setSuccess('')
    try {
      await api.post('/campaigns', form)
      setSuccess('Campaign created.')
      setForm({ title: '', description: '', starts_at: '', ends_at: '' })
      fetchCampaigns()
    } catch (err) {
      setError(err.response?.data?.detail || 'Error creating campaign')
    }
  }

  const addCandidate = async (e) => {
    e.preventDefault()
    setError(''); setSuccess('')
    try {
      await api.post(`/campaigns/${selectedCampaign}/candidates`, candidateForm)
      setSuccess('Candidate added.')
      setCandidateForm({ name: '', bio: '' })
    } catch (err) {
      setError(err.response?.data?.detail || 'Error adding candidate')
    }
  }

  return (
    <div>
      {error && <p className="text-red-400 mb-4">{error}</p>}
      {success && <p className="text-green-400 mb-4">{success}</p>}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-6 rounded-xl">
          <h2 className="text-lg font-semibold mb-4">Create Campaign</h2>
          <form onSubmit={createCampaign} className="flex flex-col gap-3">
            <input placeholder="Title" required value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="bg-gray-700 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500" />
            <textarea placeholder="Description (optional)" value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="bg-gray-700 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 resize-none" rows={2} />
            <label className="text-sm text-gray-400">Starts at</label>
            <input type="datetime-local" required value={form.starts_at}
              onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
              className="bg-gray-700 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500" />
            <label className="text-sm text-gray-400">Ends at</label>
            <input type="datetime-local" required value={form.ends_at}
              onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
              className="bg-gray-700 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500" />
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 py-2 rounded font-semibold transition">
              Create
            </button>
          </form>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl">
          <h2 className="text-lg font-semibold mb-4">Add Candidate</h2>
          <select className="bg-gray-700 rounded px-3 py-2 w-full mb-3 outline-none focus:ring-2 focus:ring-indigo-500"
            value={selectedCampaign} onChange={(e) => setSelectedCampaign(e.target.value)}>
            <option value="">Select a campaign</option>
            {campaigns.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
          <form onSubmit={addCandidate} className="flex flex-col gap-3">
            <input placeholder="Candidate name" required value={candidateForm.name}
              onChange={(e) => setCandidateForm({ ...candidateForm, name: e.target.value })}
              className="bg-gray-700 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500" />
            <textarea placeholder="Bio (optional)" value={candidateForm.bio}
              onChange={(e) => setCandidateForm({ ...candidateForm, bio: e.target.value })}
              className="bg-gray-700 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 resize-none" rows={2} />
            <button type="submit" disabled={!selectedCampaign}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 py-2 rounded font-semibold transition">
              Add Candidate
            </button>
          </form>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">All Campaigns</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.map((c) => {
            const now = new Date()
            const active = new Date(c.starts_at) <= now && now <= new Date(c.ends_at)
            return (
              <div key={c.id} className="bg-gray-800 p-4 rounded-xl">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold">{c.title}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${active ? 'bg-green-600' : 'bg-gray-600'}`}>
                    {active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-gray-400 text-sm">{c.description}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(c.starts_at).toLocaleString()} → {new Date(c.ends_at).toLocaleString()}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function LiveMonitorTab({ campaigns }) {
  const [selectedId, setSelectedId] = useState('')
  const [results, setResults] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)
  const socketRef = useRef(null)
  const prevIdRef = useRef(null)

  useEffect(() => {
    if (!socketRef.current) {
      const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:8000', { path: '/socket.io' })
      socketRef.current = socket
      socket.on('vote_update', (data) => {
        setResults(data)
        setLastUpdate(new Date())
      })
    }
    return () => {
      socketRef.current?.disconnect()
      socketRef.current = null
    }
  }, [])

  useEffect(() => {
    const socket = socketRef.current
    if (!socket) return

    // Leave previous room
    if (prevIdRef.current) {
      socket.emit('leave_campaign', { campaign_id: parseInt(prevIdRef.current) })
    }

    if (!selectedId) {
      setResults(null)
      prevIdRef.current = null
      return
    }

    // Fetch initial results
    api.get(`/campaigns/${selectedId}/results`).then(({ data }) => {
      setResults(data)
      setLastUpdate(new Date())
    })

    // Join new room
    socket.emit('join_campaign', { campaign_id: parseInt(selectedId) })
    prevIdRef.current = selectedId
  }, [selectedId])

  const selected = campaigns.find((c) => String(c.id) === String(selectedId))

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <select
          className="bg-gray-700 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 flex-1"
          value={selectedId} onChange={(e) => setSelectedId(e.target.value)}
        >
          <option value="">Select a campaign to monitor</option>
          {campaigns.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
        {lastUpdate && (
          <span className="text-xs text-green-400 flex items-center gap-1">
            <span className="w-2 h-2 bg-green-400 rounded-full inline-block animate-pulse" />
            Live · {lastUpdate.toLocaleTimeString()}
          </span>
        )}
      </div>

      {!selectedId && (
        <p className="text-gray-400 text-center py-12">Select a campaign to start monitoring.</p>
      )}

      {selected && results && (
        <div className="bg-gray-800 p-6 rounded-xl">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-semibold">{selected.title}</h2>
            <span className="text-2xl font-bold text-indigo-400">{results.total_votes} votes</span>
          </div>
          <p className="text-xs text-gray-500 mb-6">
            {new Date(selected.starts_at).toLocaleString()} → {new Date(selected.ends_at).toLocaleString()}
          </p>

          <ResultsChart results={results.results} />

          <div className="mt-6 flex flex-col gap-2">
            {results.results.map((r, i) => {
              const pct = results.total_votes > 0 ? Math.round((r.votes / results.total_votes) * 100) : 0
              return (
                <div key={r.candidate_id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{r.candidate_name}</span>
                    <span className="text-gray-400">{r.votes} votes · {pct}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminDashboard() {
  const [campaigns, setCampaigns] = useState([])
  const [tab, setTab] = useState('manage')

  const fetchCampaigns = async () => {
    const { data } = await api.get('/campaigns')
    setCampaigns(data)
  }

  useEffect(() => { fetchCampaigns() }, [])

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="flex gap-2 mb-6 border-b border-gray-700 pb-2">
        {['manage', 'monitor'].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-t text-sm font-semibold capitalize transition
              ${tab === t ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}>
            {t === 'manage' ? 'Manage' : 'Live Monitor'}
          </button>
        ))}
      </div>

      {tab === 'manage' && <ManageTab campaigns={campaigns} fetchCampaigns={fetchCampaigns} />}
      {tab === 'monitor' && <LiveMonitorTab campaigns={campaigns} />}
    </div>
  )
}
