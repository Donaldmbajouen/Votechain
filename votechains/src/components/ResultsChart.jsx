import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981']

export default function ResultsChart({ results }) {
  if (!results || results.length === 0) return (
    <p className="text-gray-400 text-sm text-center py-4">No votes yet.</p>
  )

  const data = results.map((r) => ({ name: r.candidate_name, votes: r.votes }))

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
        <XAxis dataKey="name" tick={{ fill: '#e5e7eb', fontSize: 12 }} />
        <YAxis allowDecimals={false} tick={{ fill: '#e5e7eb', fontSize: 12 }} />
        <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', color: '#fff' }} />
        <Bar dataKey="votes" radius={[4, 4, 0, 0]}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
