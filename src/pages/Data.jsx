import { useEffect, useState } from 'react'
import axios from 'axios'
import { Trash2, Download, Search, CheckCircle, RotateCcw, Wrench } from 'lucide-react'

const API = 'https://roadscan-backend.onrender.com'

export default function Data() {
  const [detections, setDetections] = useState([])
  const [search,     setSearch]     = useState('')
  const [filter,     setFilter]     = useState('All')
  const [repairFilter, setRepairFilter] = useState('All') // All, Active, Repaired

  const load = () => axios.get(`${API}/api/detections`).then(r => setDetections(r.data))
  useEffect(() => { load() }, [])

  const del = async i => { await axios.delete(`${API}/api/detections/${i}`); load() }

  const repair = async (i, isRepaired) => {
    await axios.put(`${API}/api/detections/${i}/${isRepaired ? 'unrepair' : 'repair'}`)
    load()
  }

  const filtered = detections.filter(d => {
    const s = d.city?.toLowerCase().includes(search.toLowerCase())
    const f = filter === 'All' || d.severity === filter
    const r = repairFilter === 'All'
      ? true
      : repairFilter === 'Repaired' ? d.repaired : !d.repaired
    return s && f && r
  })

  const repairedCount = detections.filter(d => d.repaired).length
  const activeCount   = detections.filter(d => !d.repaired).length

  const downloadCSV = () => {
    const h    = ['city','potholes','severity','lat','lon','timestamp','repaired','repaired_at']
    const rows = filtered.map(d => h.map(k => d[k] ?? '').join(','))
    const csv  = [h.join(','), ...rows].join('\n')
    const a    = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })),
      download: 'pothole_detections.csv'
    })
    a.click()
  }

  return (
    <div>
      {/* Top bar */}
      <div className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="topbar-title">All Detections</span>
          <span className="badge badge-blue">{detections.length} total</span>
        </div>
        <div className="topbar-actions">
          <button className="btn btn-ghost btn-sm" onClick={downloadCSV}
            style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Download size={12} /> Export CSV
          </button>
        </div>
      </div>

      <div className="page-inner">

        {/* ── Summary cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '20px' }}>
          {[
            { label: 'Total Locations', value: detections.length, color: '#0012b5', bg: '#eff6ff', border: '#bfdbfe' },
            { label: 'Active Potholes', value: activeCount,        color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
            { label: 'Repaired',        value: repairedCount,      color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
          ].map(({ label, value, color, bg, border }) => (
            <div key={label} style={{
              background: bg, border: `1px solid ${border}`,
              borderRadius: '10px', padding: '14px 18px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <div style={{ fontSize: '12px', color, fontWeight: '500' }}>{label}</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color }}>{value}</div>
            </div>
          ))}
        </div>

        {/* ── Controls ── */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="input-wrap" style={{ width: '200px' }}>
            <Search size={13} className="input-icon" />
            <input placeholder="Search by city..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          {/* Severity filter */}
          <div className="filter-pills" style={{ margin: 0 }}>
            {['All','High','Medium','Low'].map(f => (
              <div key={f}
                className={`pill ${filter === f ? `active-${f === 'All' ? 'all' : f === 'High' ? 'red' : f === 'Medium' ? 'medium' : 'low'}` : ''}`}
                onClick={() => setFilter(f)}>{f}</div>
            ))}
          </div>

          {/* Repair filter */}
          <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: '8px', padding: '3px', gap: '2px', marginLeft: 'auto' }}>
            {['All', 'Active', 'Repaired'].map(r => (
              <button key={r} onClick={() => setRepairFilter(r)} style={{
                padding: '5px 12px', borderRadius: '6px', border: 'none',
                fontSize: '11px', fontWeight: '500', cursor: 'pointer',
                fontFamily: 'Poppins, sans-serif', transition: 'all 0.15s',
                background: repairFilter === r ? '#fff' : 'transparent',
                color: repairFilter === r
                  ? r === 'Repaired' ? '#16a34a' : r === 'Active' ? '#dc2626' : '#0012b5'
                  : '#9ca3af',
                boxShadow: repairFilter === r ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}>{r}</button>
            ))}
          </div>
        </div>

        {/* ── Table ── */}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>City</th>
                <th>Potholes</th>
                <th>Severity</th>
                <th>Latitude</th>
                <th>Longitude</th>
                <th>Detected</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d, i) => (
                <tr key={i} style={{ opacity: d.repaired ? 0.6 : 1 }}>
                  <td style={{ color: '#d1d5db' }}>{i + 1}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {d.repaired && <CheckCircle size={12} color="#16a34a" />}
                      <span style={{ fontSize: '12px', color: '#111827', fontWeight: '500', textDecoration: d.repaired ? 'line-through' : 'none' }}>
                        {d.city}
                      </span>
                    </div>
                  </td>
                  <td style={{ color: '#374151' }}>{d.potholes}</td>
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
                      ? <span style={{ fontSize: '11px', color: '#16a34a' }}>{d.repaired_at?.split(' ')[0]}</span>
                      : <span style={{ fontSize: '11px', color: '#d1d5db' }}>Active</span>}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        onClick={() => repair(detections.indexOf(d), d.repaired)}
                        title={d.repaired ? 'Mark as Active' : 'Mark as Repaired'}
                        style={{
                          background: d.repaired ? '#f0fdf4' : '#f9fafb',
                          border: `1px solid ${d.repaired ? '#bbf7d0' : '#e5e7eb'}`,
                          borderRadius: '6px', padding: '4px 6px',
                          cursor: 'pointer', display: 'flex', alignItems: 'center'
                        }}>
                        {d.repaired
                          ? <RotateCcw size={12} color="#16a34a" />
                          : <Wrench size={12} color="#6b7280" />}
                      </button>
                      <button onClick={() => del(detections.indexOf(d))}
                        style={{
                          background: '#fef2f2', border: '1px solid #fecaca',
                          borderRadius: '6px', padding: '4px 6px',
                          cursor: 'pointer', display: 'flex', alignItems: 'center'
                        }}>
                        <Trash2 size={12} color="#dc2626" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#d1d5db' }}>
              No detections found
            </div>
          )}
        </div>

        {/* Repaired progress */}
        {repairedCount > 0 && (
          <div style={{
            marginTop: '14px', background: '#f0fdf4', border: '1px solid #bbf7d0',
            borderRadius: '10px', padding: '14px 18px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#16a34a' }}>
                🔧 Repair Progress
              </span>
              <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: '700' }}>
                {repairedCount}/{detections.length} ({Math.round(repairedCount/detections.length*100)}%)
              </span>
            </div>
            <div style={{ height: '6px', background: '#bbf7d0', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: '3px', background: '#16a34a',
                width: `${Math.round(repairedCount/detections.length*100)}%`,
                transition: 'width 0.5s ease'
              }} />
            </div>
          </div>
        )}

      </div>
    </div>
  )
}