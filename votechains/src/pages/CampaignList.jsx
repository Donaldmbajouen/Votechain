import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'

function StatusBadge({ campaign }) {
  const now = new Date()
  const start = new Date(campaign.starts_at)
  const end = new Date(campaign.ends_at)
  if (now < start) return <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">Upcoming</span>
  if (now > end) return <span className="text-xs px-2 py-0.5 rounded-full bg-gray-500/20 text-gray-400 border border-gray-500/30">Ended</span>
  return (
    <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 flex items-center gap-1">
      <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse inline-block" />
      Live
    </span>
  )
}

function CampaignCard({ campaign, onClick }) {
  const now = new Date()
  const isActive = new Date(campaign.starts_at) <= now && now <= new Date(campaign.ends_at)
  const isEnded = now > new Date(campaign.ends_at)

  return (
    <div
      onClick={onClick}
      className="group relative bg-gray-800/60 hover:bg-gray-800 border border-gray-700/50 hover:border-indigo-500/50 rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-white text-base leading-tight pr-2">{campaign.title}</h3>
        <StatusBadge campaign={campaign} />
      </div>

      {campaign.description && (
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{campaign.description}</p>
      )}

      <div className="text-xs text-gray-500 space-y-0.5 mb-4">
        <p>Start: {new Date(campaign.starts_at).toLocaleString()}</p>
        <p>End: {new Date(campaign.ends_at).toLocaleString()}</p>
      </div>

      <div className={`w-full py-2 rounded-xl text-sm font-semibold text-center transition-all duration-200
        ${isActive
          ? 'bg-indigo-600 group-hover:bg-indigo-500 text-white'
          : isEnded
          ? 'bg-gray-700 text-gray-300 group-hover:bg-gray-600'
          : 'bg-yellow-600/30 text-yellow-300 border border-yellow-600/30'
        }`}>
        {isActive ? 'Vote Now →' : isEnded ? 'View Results' : 'Coming Soon'}
      </div>
    </div>
  )
}

export default function CampaignList() {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/campaigns')
      .then(({ data }) => setCampaigns(data))
      .finally(() => setLoading(false))
  }, [])

  const active = campaigns.filter(c => {
    const now = new Date()
    return new Date(c.starts_at) <= now && now <= new Date(c.ends_at)
  })
  const upcoming = campaigns.filter(c => new Date() < new Date(c.starts_at))
  const ended = campaigns.filter(c => new Date() > new Date(c.ends_at))

  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1">Campaigns</h1>
          <p className="text-gray-400 text-sm">{campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''} available</p>
        </div>

        {campaigns.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <p className="text-4xl mb-3">🗳️</p>
            <p>No campaigns available yet.</p>
          </div>
        )}

        {active.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-green-400 mb-3">Live Now</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {active.map(c => <CampaignCard key={c.id} campaign={c} onClick={() => navigate(`/campaigns/${c.id}`)} />)}
            </div>
          </section>
        )}

        {upcoming.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-yellow-400 mb-3">Upcoming</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcoming.map(c => <CampaignCard key={c.id} campaign={c} onClick={() => navigate(`/campaigns/${c.id}`)} />)}
            </div>
          </section>
        )}

        {ended.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">Ended</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {ended.map(c => <CampaignCard key={c.id} campaign={c} onClick={() => navigate(`/campaigns/${c.id}`)} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
