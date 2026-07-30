import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { ArrowLeft, MapPin, AlertTriangle, Wrench, TrendingUp } from 'lucide-react'
import 'leaflet/dist/leaflet.css'

const API    = 'http://localhost:8000'
const COLORS = { High: '#dc2626', Medium: '#d97706', Low: '#16a34a' }

export default function CityDetail() {
  const { city }  = useParams()
  const nav       = useNavigate()
  const [data,    setData]    = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get(`${API}/api/detections`).then(r => {
      const cityData = r.data.filter(d =>
        d.city?.toLowerCase() === decodeURIComponent(city).toLowerCase()
      )
      setData(cityData)
      setLoading(false)
    })
  }, [city])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div className="spinner" style={{ width: '24px', height: '24px' }} />
    </div>
  )

  const cityName   = decodeURIComponent(city)
  const high       = data.filter(d => d.severity === 'High'   && !d.repaired).length
  const medium     = data.filter(d => d.severity === 'Medium' && !d.repaired).length
  const low        = data.filter(d => d.severity === 'Low'    && !d.repaired).length
  const repaired   = data.filter(d => d.repaired).length
  const total      = data.reduce((a, b) => a + b.potholes, 0)
  const mapCenter  = data.length > 0 ? [data[0].lat, data[0].lon] : [28.6, 77.2]

  const pieData = [
    { name: 'High',   value: high,   color: '#dc2626' },
    { name: 'Medium', value: medium, color: '#d97706' },
    { name: 'Low',    value: low,    color: '#16a34a' },
  ].filter(d => d.value > 0)

  const timelineData = (() => {
    const groups = {}
    data.forEach(d => {
      const date = d.timestamp?.split(' ')[0] || 'Unknown'
      groups[date] = (groups[date] || 0) + d.potholes
    })
    return Object.entries(groups)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date: date.slice(5), count }))
  })()

  const repairPct = data.length > 0 ? Math.round(repaired / data.length * 100) : 0

  return (
    <div>
      {/* Top bar */}
      <div className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={() => nav(-1)} className="btn btn-ghost btn-sm">
            <ArrowLeft size={13} /> Back
          </button>
          <div style={{ width: '1px', height: '16px', background: '#e5e7eb' }} />
          <MapPin size={14} color="#0012b5" />
          <span className="topbar-title">{cityName}</span>
          <span className="badge badge-blue">{data.length} locations</span>
        </div>
        <div className="topbar-actions">
          <button className="btn btn-primary btn-sm" onClick={() => nav('/leaderboard')}>
            View Leaderboard
          </button>
        </div>
      </div>

      <div className="page-inner">

        {/* ── Stat cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '12px', marginBottom: '20px' }}>
          {[
            { label: 'Total Locations', value: data.length,  color: '#0012b5' },
            { label: 'Total Potholes',  value: total,         color: '#374151' },
            { label: 'High Severity',   value: high,          color: '#dc2626' },
            { label: 'Medium',          value: medium,        color: '#d97706' },
            { label: 'Repaired',        value: repaired,      color: '#16a34a' },
          ].map(({ label, value, color }) => (
            <div key={label} className="stat-card">
              <div className="stat-value" style={{ color, fontSize: '24px' }}>{value}</div>
              <div className="stat-label">{label}</div>
            </div>
          ))}
        </div>

        {/* ── Repair progress ── */}
        <div className="card" style={{ marginBottom: '16px' }}>
          <div className="card-header">
            <span className="card-title">Repair Progress</span>
            <span style={{ fontSize: '13px', fontWeight: '700', color: repairPct > 50 ? '#16a34a' : '#d97706' }}>
              {repairPct}% repaired
            </span>
          </div>
          <div className="card-body">
            <div style={{ height: '8px', background: '#f3f4f6', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: '4px',
                width: `${repairPct}%`,
                background: repairPct > 50 ? '#16a34a' : repairPct > 25 ? '#d97706' : '#dc2626',
                transition: 'width 0.8s ease'
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
              <span style={{ fontSize: '11px', color: '#9ca3af' }}>{repaired} repaired</span>
              <span style={{ fontSize: '11px', color: '#9ca3af' }}>{data.length - repaired} remaining</span>
            </div>
          </div>
        </div>

        <div className="grid-2">
          {/* ── Map ── */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Pothole Map — {cityName}</span>
            </div>
            <div style={{ height: '300px', overflow: 'hidden' }}>
              <MapContainer center={mapCenter} zoom={13}
                style={{ height: '100%', width: '100%' }} zoomControl={false}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {data.map((d, i) => (
                  <CircleMarker key={i} center={[d.lat, d.lon]}
                    radius={d.repaired ? 6 : d.severity === 'High' ? 10 : 8}
                    fillColor={d.repaired ? '#9ca3af' : COLORS[d.severity]}
                    color="#fff" fillOpacity={0.9} weight={2}>
                    <Popup>
                      <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px' }}>
                        <strong>{d.potholes} pothole(s)</strong><br />
                        {d.severity} · {d.repaired ? '✅ Repaired' : '⚠️ Active'}<br />
                        <span style={{ color: '#9ca3af' }}>{d.timestamp}</span>
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}
              </MapContainer>
            </div>
          </div>

          {/* ── Severity breakdown ── */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Severity Breakdown</span>
            </div>
            <div className="card-body">
              {pieData.length > 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <PieChart width={130} height={130}>
                    <Pie data={pieData} cx={60} cy={60} innerRadius={35} outerRadius={60}
                      dataKey="value" strokeWidth={2} stroke="#fff">
                      {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                  </PieChart>
                  <div style={{ flex: 1 }}>
                    {pieData.map(d => (
                      <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                        <span style={{ fontSize: '12px', color: '#374151', flex: 1 }}>{d.name}</span>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: d.color }}>{d.value}</span>
                      </div>
                    ))}
                    <hr style={{ margin: '10px 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '12px', color: '#9ca3af' }}>Repaired</span>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: '#16a34a' }}>{repaired}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: '#9ca3af', padding: '20px' }}>No active potholes</div>
              )}
            </div>
          </div>
        </div>

        {/* ── Timeline ── */}
        {timelineData.length > 1 && (
          <div className="card">
            <div className="card-header">
              <span className="card-title">Detection Timeline</span>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={timelineData} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
                  <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 10, fontFamily: 'Poppins' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 10, fontFamily: 'Poppins' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontFamily: 'Poppins' }} />
                  <Bar dataKey="count" fill="#0012b5" radius={[4,4,0,0]} name="Potholes" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ── All detections table ── */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">All Detections in {cityName}</span>
            <span className="badge badge-gray">{data.length} records</span>
          </div>
          <div className="table-wrap" style={{ border: 'none', borderRadius: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Potholes</th>
                  <th>Severity</th>
                  <th>Latitude</th>
                  <th>Longitude</th>
                  <th>Detected</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.map((d, i) => (
                  <tr key={i} style={{ opacity: d.repaired ? 0.6 : 1 }}>
                    <td style={{ color: '#d1d5db' }}>{i + 1}</td>
                    <td style={{ fontWeight: '600', color: '#111827' }}>{d.potholes}</td>
                    <td>
                      {d.repaired
                        ? <span className="badge badge-low">✓ Repaired</span>
                        : <span className={`badge badge-${d.severity?.toLowerCase()}`}>{d.severity}</span>}
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '11px', color: '#9ca3af' }}>{d.lat?.toFixed(5)}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '11px', color: '#9ca3af' }}>{d.lon?.toFixed(5)}</td>
                    <td style={{ fontSize: '11px', color: '#9ca3af' }}>{d.timestamp?.split(' ')[0]}</td>
                    <td>
                      {d.repaired
                        ? <span style={{ fontSize: '11px', color: '#16a34a' }}>✅ Fixed</span>
                        : <span style={{ fontSize: '11px', color: '#d1d5db' }}>Active</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}