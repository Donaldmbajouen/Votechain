import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { io } from 'socket.io-client'
import api from '../api/client'
import ResultsChart from '../components/ResultsChart'

function CandidateCard({ candidate, selected, onSelect, disabled }) {
  return (
    <button
      onClick={() => !disabled && onSelect(candidate.id)}
      disabled={disabled}
      className={`w-full text-left p-4 rounded-xl border transition-all duration-200 group
        ${selected
          ? 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/10'
          : disabled
          ? 'border-gray-700/50 bg-gray-800/30 opacity-60 cursor-not-allowed'
          : 'border-gray-700 bg-gray-800/60 hover:border-indigo-400/50 hover:bg-gray-800 cursor-pointer'
        }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
          ${selected ? 'border-indigo-500 bg-indigo-500' : 'border-gray-600 group-hover:border-indigo-400'}`}>
          {selected && <div className="w-2 h-2 bg-white rounded-full" />}
        </div>
        <div>
          <p className="font-semibold text-white">{candidate.name}</p>
          {candidate.bio && <p className="text-gray-400 text-sm mt-0.5">{candidate.bio}</p>}
        </div>
      </div>
    </button>
  )
}

function ResultRow({ item, total, rank }) {
  const pct = total > 0 ? Math.round((item.votes / total) * 100) : 0
  const isLeading = rank === 0 && item.votes > 0
  return (
    <div className="mb-3">
      <div className="flex justify-between items-center text-sm mb-1">
        <span className="flex items-center gap-2">
          {isLeading && <span className="text-yellow-400 text-xs">👑</span>}
          <span className={isLeading ? 'text-white font-semibold' : 'text-gray-300'}>{item.candidate_name}</span>
        </span>
        <span className="text-gray-400 tabular-nums">{item.votes} · {pct}%</span>
      </div>
      <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
        <div
          className={`h-2 rounded-full transition-all duration-700 ease-out ${isLeading ? 'bg-indigo-400' : 'bg-indigo-600/60'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export default function VotePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [campaign, setCampaign] = useState(null)
  const [results, setResults] = useState(null)
  const [selected, setSelected] = useState(null)
  const [voted, setVoted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [liveAt, setLiveAt] = useState(null)
  const socketRef = useRef(null)

  useEffect(() => {
    api.get(`/campaigns/${id}`).then(({ data }) => setCampaign(data))
    api.get(`/campaigns/${id}/results`).then(({ data }) => setResults(data))

    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:8000', { path: '/socket.io' })
    socketRef.current = socket
    socket.on('connect', () => socket.emit('join_campaign', { campaign_id: parseInt(id) }))
    socket.on('vote_update', (data) => { setResults(data); setLiveAt(new Date()) })

    return () => {
      socket.emit('leave_campaign', { campaign_id: parseInt(id) })
      socket.disconnect()
    }
  }, [id])

  const castVote = async () => {
    if (!selected || submitting) return
    setSubmitting(true)
    setError('')
    try {
      await api.post(`/campaigns/${id}/vote`, { candidate_id: selected })
      setVoted(true)
    } catch (err) {
      setError(err.response?.data?.detail || 'Vote failed')
    } finally {
      setSubmitting(false)
    }
  }

  const isActive = campaign
    ? new Date(campaign.starts_at) <= new Date() && new Date() <= new Date(campaign.ends_at)
    : false

  if (!campaign) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-2xl mx-auto px-6 py-10">

        {/* Header */}
        <button onClick={() => navigate('/campaigns')} className="text-gray-400 hover:text-white text-sm mb-6 flex items-center gap-1 transition">
          ← Back
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold">{campaign.title}</h1>
            {isActive && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse inline-block" />Live
              </span>
            )}
          </div>
          {campaign.description && <p className="text-gray-400">{campaign.description}</p>}
          <p className="text-xs text-gray-500 mt-2">
            {new Date(campaign.starts_at).toLocaleString()} → {new Date(campaign.ends_at).toLocaleString()}
          </p>
        </div>

        {/* Vote section */}
        {isActive && !voted && (
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6 mb-6">
            <h2 className="font-semibold text-lg mb-4">Cast your vote</h2>
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl mb-4">
                {error}
              </div>
            )}
            <div className="flex flex-col gap-3 mb-5">
              {campaign.candidates.map(c => (
                <CandidateCard key={c.id} candidate={c} selected={selected === c.id} onSelect={setSelected} disabled={false} />
              ))}
            </div>
            <button
              onClick={castVote}
              disabled={!selected || submitting}
              className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200
                bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed
                flex items-center justify-center gap-2"
            >
              {submitting
                ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting...</>
                : 'Submit Vote'}
            </button>
          </div>
        )}

        {voted && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6 mb-6 text-center">
            <p className="text-3xl mb-2">✅</p>
            <p className="text-green-400 font-semibold">Your vote has been recorded.</p>
            <p className="text-gray-400 text-sm mt-1">Watch the live results below.</p>
          </div>
        )}

        {!isActive && (
          <div className="bg-gray-800/40 border border-gray-700/40 rounded-2xl p-5 mb-6 text-center text-gray-400 text-sm">
            {new Date() < new Date(campaign.starts_at) ? '⏳ This campaign hasn\'t started yet.' : '🏁 This campaign has ended.'}
          </div>
        )}

        {/* Live results */}
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">Results</h2>
            <div className="flex items-center gap-3">
              <span className="text-gray-400 text-sm">{results?.total_votes ?? 0} votes</span>
              {liveAt && (
                <span className="text-xs text-green-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse inline-block" />
                  Live
                </span>
              )}
            </div>
          </div>

          <ResultsChart results={results?.results} />

          <div className="mt-5">
            {results?.results.map((r, i) => (
              <ResultRow key={r.candidate_id} item={r} total={results.total_votes} rank={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
