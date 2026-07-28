import { useEffect, useState } from 'react'
import axios from 'axios'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid,
  RadialBarChart, RadialBar, Legend, AreaChart, Area
} from 'recharts'
import { MapPin, AlertTriangle, Layers, Target, ArrowUpRight, TrendingUp, TrendingDown,CheckCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const API = 'https://roadscan-backend.onrender.com'

const Tip = ({ active, payload, label }) => active && payload?.length ? (
  <div style={{
    background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px',
    padding: '8px 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    fontFamily: 'Poppins, sans-serif'
  }}>
    <div style={{ color: '#9ca3af', fontSize: '11px', marginBottom: '2px' }}>{label}</div>
    {payload.map((p, i) => (
      <div key={i} style={{ color: p.color || '#0012b5', fontSize: '13px', fontWeight: '600' }}>
        {p.value} {p.name}
      </div>
    ))}
  </div>
) : null

const COLORS = {
  High: '#dc2626', Medium: '#d97706', Low: '#16a34a'
}

export default function Dashboard() {
  const [stats, setStats]         = useState(null)
  const [detections, setDetections] = useState([])
  const nav = useNavigate()

  useEffect(() => {
    axios.get(`${API}/api/stats`).then(r => setStats(r.data))
    axios.get(`${API}/api/detections`).then(r => setDetections(r.data))
  }, [])

  if (!stats) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto 10px', width: '24px', height: '24px' }} />
        <div style={{ color: '#9ca3af', fontSize: '12px' }}>Loading dashboard...</div>
      </div>
    </div>
  )

  // Pie data
  const pieData = [
    { name: 'High',   value: stats.high,   color: '#dc2626' },
    { name: 'Medium', value: stats.medium, color: '#d97706' },
    { name: 'Low',    value: stats.low,    color: '#16a34a' },
  ]

  // Detections over time (group by date)
  const timeData = (() => {
    const groups = {}
    detections.forEach(d => {
      const date = d.timestamp?.split(' ')[0] || 'Unknown'
      groups[date] = (groups[date] || 0) + 1
    })
    return Object.entries(groups)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-7)
      .map(([date, count]) => ({ date: date.slice(5), count }))
  })()

  // Potholes by city (horizontal bar)
  const cityData = stats.top_cities.map(c => ({
    city: c.city, potholes: c.count,
    percent: Math.round(c.count / stats.total_potholes * 100)
  }))

  // Severity over cities
  const severityByCityData = (() => {
    const groups = {}
    detections.forEach(d => {
      if (!groups[d.city]) groups[d.city] = { city: d.city, High: 0, Medium: 0, Low: 0 }
      groups[d.city][d.severity] = (groups[d.city][d.severity] || 0) + 1
    })
    return Object.values(groups)
      .sort((a, b) => (b.High + b.Medium + b.Low) - (a.High + a.Medium + a.Low))
      .slice(0, 5)
  })()

  // Custom donut label
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)
    return percent > 0.05 ? (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"
        style={{ fontSize: '11px', fontWeight: '600', fontFamily: 'Poppins' }}>
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null
  }

  return (
    <div>
      {/* Top bar */}
      <div className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="topbar-title">Dashboard</span>
          <span className="badge badge-gray">NCR Region</span>
        </div>
        <div className="topbar-actions">
          <button className="btn btn-ghost btn-sm" onClick={() => nav('/detect')}>
            + New Detection
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => nav('/report')}>
            Export Report
          </button>
        </div>
      </div>

      <div className="page-inner">

        {/* ── Stat Cards ── */}
        <div className="stats-grid">
          {[
            { label: 'Locations',     value: stats.total_locations, icon: MapPin,        color: '#0012b5', iconCls: 'blue',  sub: 'Total mapped',                        trend: '+12' },
            { label: 'High Severity', value: stats.high,            icon: AlertTriangle, color: '#dc2626', iconCls: 'red',   sub: `${Math.round(stats.high/stats.total_locations*100)}% of total`, trend: null },
            { label: 'Potholes',      value: stats.total_potholes,  icon: Layers,        color: '#d97706', iconCls: 'amber', sub: `Avg ${(stats.total_potholes/stats.total_locations).toFixed(1)}/location`, trend: null },
            { label: 'Accuracy',      value: '81%',                 icon: Target,        color: '#16a34a', iconCls: 'green', sub: 'mAP50 score',                         trend: null },
            { label: 'Repaired',  value: stats.repaired || 0, icon: CheckCircle, color: '#16a34a', iconCls: 'green', sub: `${Math.round((stats.repaired||0)/stats.total_locations*100)}% fixed`, trend: null },
          ].map(({ label, value, icon: Icon, color, iconCls, sub, trend }) => (
            <div key={label} className="stat-card">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div className={`stat-icon ${iconCls}`}>
                  <Icon size={16} color={color} strokeWidth={1.5} />
                </div>
                {trend && (
                  <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <TrendingUp size={11} /> {trend}
                  </span>
                )}
              </div>
              <div className="stat-value" style={{ color }}>{value}</div>
              <div className="stat-label">{label}</div>
              <div className="stat-change">{sub}</div>
            </div>
          ))}
        </div>

        {/* ── Row 1: Area chart + Donut ── */}
        <div className="grid-2">
          <div className="card">
            <div className="card-header">
              <span className="card-title">Detections Over Time</span>
              <span className="badge badge-blue">Last 7 days</span>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={timeData} margin={{ top: 5, right: 0, left: -28, bottom: 0 }}>
                  <defs>
                    <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#0012b5" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#0012b5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 10, fontFamily: 'Poppins' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 10, fontFamily: 'Poppins' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<Tip />} />
                  <Area type="monotone" dataKey="count" name="detections"
                    stroke="#0012b5" strokeWidth={2}
                    fill="url(#blueGrad)" dot={{ fill: '#0012b5', r: 3 }}
                    activeDot={{ r: 5, fill: '#0012b5' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title">Severity Distribution</span>
            </div>
            <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <PieChart width={150} height={150}>
                <Pie data={pieData} cx={70} cy={70} innerRadius={42} outerRadius={70}
                  dataKey="value" strokeWidth={2} stroke="#fff"
                  labelLine={false} label={renderCustomLabel}>
                  {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
              </PieChart>
              <div style={{ flex: 1 }}>
                {pieData.map(d => (
                  <div key={d.name} style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '12px', color: d.color, fontWeight: '600' }}>{d.name}</span>
                      <span style={{ fontSize: '12px', color: '#374151', fontWeight: '700' }}>{d.value}</span>
                    </div>
                    <div className="sev-bar-bg">
                      <div className="sev-bar" style={{
                        width: `${Math.round(d.value/stats.total_locations*100)}%`,
                        background: d.color
                      }} />
                    </div>
                    <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '2px' }}>
                      {Math.round(d.value/stats.total_locations*100)}% of total
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Row 2: Stacked bar + Horizontal bar ── */}
        <div className="grid-2">
          <div className="card">
            <div className="card-header">
              <span className="card-title">Severity by City</span>
              <span className="badge badge-gray">Top 5</span>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={severityByCityData} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="city" tick={{ fill: '#9ca3af', fontSize: 10, fontFamily: 'Poppins' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 10, fontFamily: 'Poppins' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<Tip />} cursor={{ fill: 'rgba(0,18,181,0.03)' }} />
                  <Bar dataKey="High"   stackId="a" fill="#dc2626" radius={[0,0,0,0]} name="High" />
                  <Bar dataKey="Medium" stackId="a" fill="#d97706" name="Medium" />
                  <Bar dataKey="Low"    stackId="a" fill="#16a34a" radius={[4,4,0,0]} name="Low" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title">Top Cities by Potholes</span>
              <button className="btn btn-ghost btn-sm" onClick={() => nav('/map')}>
                View Map <ArrowUpRight size={11} />
              </button>
            </div>
            <div className="card-body">
              {cityData.map((c, i) => (
                <div key={c.city} style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                      <span style={{
                        width: '18px', height: '18px', borderRadius: '5px',
                        background: '#eff6ff', color: '#0012b5',
                        fontSize: '10px', fontWeight: '700',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>{i + 1}</span>
                      <span style={{ fontSize: '12px', color: '#374151', fontWeight: '500' }}>{c.city}</span>
                    </div>
                    <span style={{ fontSize: '12px', color: '#0012b5', fontWeight: '700' }}>{c.potholes}</span>
                  </div>
                  <div className="sev-bar-bg">
                    <div className="sev-bar" style={{ width: `${c.percent}%`, background: '#0012b5' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Recent Detections ── */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Detections</span>
            <button className="btn btn-ghost btn-sm" onClick={() => nav('/data')}>
              View All <ArrowUpRight size={11} />
            </button>
          </div>
          <div className="card-body">
            {stats.recent.map((d, i) => (
              <div key={i} className="recent-item">
                <div className="recent-icon" style={{
                  background: d.severity==='High' ? '#fef2f2' : d.severity==='Medium' ? '#fffbeb' : '#f0fdf4'
                }}>
                  <AlertTriangle size={13} color={COLORS[d.severity]} strokeWidth={1.5} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '12px', color: '#111827', fontWeight: '600' }}>{d.city}</div>
                  <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {d.potholes} pothole(s) · {d.lat?.toFixed(4)}, {d.lon?.toFixed(4)}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  <span style={{ fontSize: '11px', color: '#d1d5db' }}>{d.timestamp?.split(' ')[0]}</span>
                  <span className={`badge badge-${d.severity.toLowerCase()}`}>{d.severity}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}