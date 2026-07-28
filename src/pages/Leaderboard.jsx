import { useEffect, useState } from 'react'
import axios from 'axios'
import { Trophy, MapPin, AlertTriangle, TrendingUp, Wrench, Award } from 'lucide-react'

const API = 'https://roadscan-backend.onrender.com'

const medals = ['🥇', '🥈', '🥉']

const getRiskLevel = score => {
  if (score >= 20) return { label: 'Critical',  color: '#7f1d1d', bg: '#fef2f2', border: '#fecaca' }
  if (score >= 12) return { label: 'High Risk', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' }
  if (score >= 6)  return { label: 'Medium',    color: '#d97706', bg: '#fffbeb', border: '#fde68a' }
  return              { label: 'Low',       color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' }
}

export default function Leaderboard() {
  const [data,    setData]    = useState([])
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)
  const [seeded,  setSeeded]  = useState(false)

  const load = () => {
    setLoading(true)
    axios.get(`${API}/api/leaderboard`).then(r => {
      setData(r.data)
      setLoading(false)
    })
  }

  useEffect(() => { load() }, [])

  const seedIndia = async () => {
    setSeeding(true)
    await axios.post(`${API}/api/seed/india`)
    setSeeded(true)
    setSeeding(false)
    load()
  }

  const top3    = data.slice(0, 3)
  const rest    = data.slice(3)
  const total   = data.reduce((a, b) => a + b.total, 0)
  const repaired = data.reduce((a, b) => a + b.repaired, 0)

  return (
    <div>
      {/* Top bar */}
      <div className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="topbar-title">Worst Roads Leaderboard</span>
          <span className="badge badge-blue">All India</span>
        </div>
        <div className="topbar-actions">
          {!seeded && (
            <button className="btn btn-ghost btn-sm" onClick={seedIndia} disabled={seeding}>
              {seeding ? <><div className="spinner" /> Adding India data...</> : '🇮🇳 Load All India Data'}
            </button>
          )}
          {seeded && <span className="badge badge-low">✅ All India loaded!</span>}
        </div>
      </div>

      <div className="page-inner">

        {/* ── Header stats ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '24px' }}>
          {[
            { label: 'Cities Tracked',  value: data.length,  color: '#0012b5', icon: MapPin      },
            { label: 'Total Potholes',  value: total,         color: '#dc2626', icon: AlertTriangle},
            { label: 'Repaired',        value: repaired,      color: '#16a34a', icon: Wrench      },
            { label: 'Worst City',      value: data[0]?.city || '—', color: '#d97706', icon: Trophy },
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label} className="stat-card">
              <div className="stat-icon blue" style={{ background: `${color}12` }}>
                <Icon size={15} color={color} strokeWidth={1.5} />
              </div>
              <div className="stat-value" style={{ color, fontSize: typeof value === 'string' ? '16px' : '28px' }}>{value}</div>
              <div className="stat-label">{label}</div>
            </div>
          ))}
        </div>

        {/* ── Top 3 podium ── */}
        {top3.length > 0 && (
          <div className="card" style={{ marginBottom: '16px' }}>
            <div className="card-header">
              <span className="card-title">🏆 Top 3 Worst Roads</span>
              <span className="badge badge-gray">Ranked by risk score</span>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px' }}>
                {top3.map((city, i) => {
                  const risk = getRiskLevel(city.score)
                  return (
                    <div key={city.city} style={{
                      background: risk.bg, border: `1px solid ${risk.border}`,
                      borderRadius: '12px', padding: '18px', textAlign: 'center',
                      position: 'relative', overflow: 'hidden'
                    }}>
                      <div style={{ fontSize: '32px', marginBottom: '8px' }}>{medals[i]}</div>
                      <div style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>{city.city}</div>
                      <div style={{ fontSize: '11px', color: risk.color, fontWeight: '600', marginBottom: '12px' }}>
                        Risk Score: {city.score}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                        {[
                          { label: 'Total',   value: city.total    },
                          { label: 'High',    value: city.high,    color: '#dc2626' },
                          { label: 'Medium',  value: city.medium,  color: '#d97706' },
                          { label: 'Locations', value: city.locations },
                        ].map(({ label, value, color }) => (
                          <div key={label} style={{
                            background: 'rgba(255,255,255,0.7)', borderRadius: '6px', padding: '6px',
                          }}>
                            <div style={{ fontSize: '14px', fontWeight: '700', color: color || '#111827' }}>{value}</div>
                            <div style={{ fontSize: '10px', color: '#9ca3af' }}>{label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── Full leaderboard table ── */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Full Rankings — All India</span>
            <span className="badge badge-gray">{data.length} cities</span>
          </div>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <div className="spinner" style={{ margin: '0 auto 10px', width: '20px', height: '20px' }} />
              <div style={{ color: '#9ca3af', fontSize: '12px' }}>Loading rankings...</div>
            </div>
          ) : (
            <div className="table-wrap" style={{ border: 'none', borderRadius: 0 }}>
              <table>
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>City</th>
                    <th>Risk Score</th>
                    <th>Total Potholes</th>
                    <th>High</th>
                    <th>Medium</th>
                    <th>Low</th>
                    <th>Repaired</th>
                    <th>Risk Level</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((city, i) => {
                    const risk = getRiskLevel(city.score)
                    return (
                      <tr key={city.city}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {i < 3
                              ? <span style={{ fontSize: '16px' }}>{medals[i]}</span>
                              : <span style={{
                                  width: '22px', height: '22px', borderRadius: '50%',
                                  background: '#f3f4f6', color: '#9ca3af',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontSize: '10px', fontWeight: '700'
                                }}>{i + 1}</span>}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <MapPin size={12} color="#9ca3af" />
                            <span style={{ fontWeight: '500', color: '#111827' }}>{city.city}</span>
                          </div>
                        </td>
                        <td>
                          <span style={{
                            fontSize: '13px', fontWeight: '700', color: risk.color,
                            background: risk.bg, padding: '2px 8px', borderRadius: '4px',
                            border: `1px solid ${risk.border}`
                          }}>{city.score}</span>
                        </td>
                        <td style={{ fontWeight: '600', color: '#374151' }}>{city.total}</td>
                        <td style={{ color: '#dc2626', fontWeight: '600' }}>{city.high}</td>
                        <td style={{ color: '#d97706', fontWeight: '600' }}>{city.medium}</td>
                        <td style={{ color: '#16a34a', fontWeight: '600' }}>{city.low}</td>
                        <td>
                          {city.repaired > 0
                            ? <span style={{ color: '#16a34a', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                <Wrench size={11} /> {city.repaired}
                              </span>
                            : <span style={{ color: '#d1d5db' }}>—</span>}
                        </td>
                        <td>
                          <span style={{
                            fontSize: '10px', fontWeight: '600', padding: '2px 8px',
                            borderRadius: '20px', background: risk.bg,
                            color: risk.color, border: `1px solid ${risk.border}`
                          }}>{risk.label}</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Score explanation */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">How Risk Score is Calculated</span>
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px' }}>
              {[
                { label: 'High Severity',   points: '×3 points', color: '#dc2626', bg: '#fef2f2', desc: 'Most dangerous' },
                { label: 'Medium Severity', points: '×2 points', color: '#d97706', bg: '#fffbeb', desc: 'Moderate risk'  },
                { label: 'Low Severity',    points: '×1 point',  color: '#16a34a', bg: '#f0fdf4', desc: 'Minor damage'   },
                { label: 'Repaired',        points: '×0 points', color: '#9ca3af', bg: '#f9fafb', desc: 'Fixed roads'    },
              ].map(({ label, points, color, bg, desc }) => (
                <div key={label} style={{
                  background: bg, borderRadius: '10px', padding: '14px', textAlign: 'center',
                  border: `1px solid ${color}22`
                }}>
                  <div style={{ fontSize: '18px', fontWeight: '800', color, marginBottom: '4px' }}>{points}</div>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#374151' }}>{label}</div>
                  <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}