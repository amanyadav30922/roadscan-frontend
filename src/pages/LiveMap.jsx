import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet'
import axios from 'axios'
import { MapPin, AlertTriangle, Navigation, Layers, Map as MapIcon, Search, X } from 'lucide-react'
import 'leaflet/dist/leaflet.css'

const API    = 'https://roadscan-backend.onrender.com'
const COLORS = { High: '#dc2626', Medium: '#d97706', Low: '#16a34a' }
const BG     = { High: '#fef2f2', Medium: '#fffbeb', Low: '#f0fdf4' }

// ── Search box ──────────────────────────────────────────────
function SearchBox({ detections, onSelect }) {
  const [query,   setQuery]   = useState('')
  const [results, setResults] = useState([])
  const [open,    setOpen]    = useState(false)

  const handleSearch = val => {
    setQuery(val)
    if (!val.trim()) { setResults([]); setOpen(false); return }
    const matches = [...new globalThis.Map(
      detections
        .filter(d => d.city?.toLowerCase().includes(val.toLowerCase()))
        .map(d => [d.city, d])
    ).values()].slice(0, 6)
    setResults(matches)
    setOpen(true)
  }

  const select = d => {
    setQuery(d.city)
    setOpen(false)
    onSelect(d)
  }

  return (
    <div style={{ position: 'relative', width: '240px' }}>
      <div style={{ position: 'relative' }}>
        <Search size={13} style={{
          position: 'absolute', left: '10px', top: '50%',
          transform: 'translateY(-50%)', color: '#9ca3af'
        }} />
        <input
          value={query}
          onChange={e => handleSearch(e.target.value)}
          placeholder="Search city or location..."
          style={{
            paddingLeft: '32px', paddingRight: query ? '32px' : '12px',
            background: '#fff', border: '1px solid #e5e7eb',
            borderRadius: '8px', fontSize: '12px', color: '#374151',
            width: '100%', outline: 'none', height: '34px',
            fontFamily: 'Poppins, sans-serif',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
          }}
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setResults([]); setOpen(false) }}
            style={{
              position: 'absolute', right: '8px', top: '50%',
              transform: 'translateY(-50%)', background: 'none',
              border: 'none', cursor: 'pointer', padding: '2px'
            }}>
            <X size={12} color="#9ca3af" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && results.length > 0 && (
        <div style={{
          position: 'absolute', top: '38px', left: 0, right: 0,
          background: '#fff', border: '1px solid #e5e7eb',
          borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
          zIndex: 2000, overflow: 'hidden'
        }}>
          {results.map((d, i) => (
            <div key={i} onClick={() => select(d)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '9px 12px', cursor: 'pointer',
                borderBottom: i < results.length - 1 ? '1px solid #f3f4f6' : 'none',
                transition: 'background 0.1s', fontFamily: 'Poppins, sans-serif'
              }}
              onMouseOver={e => e.currentTarget.style.background = '#f9fafb'}
              onMouseOut={e  => e.currentTarget.style.background = '#fff'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={12} color="#0012b5" />
                <span style={{ fontSize: '12px', fontWeight: '500', color: '#111827' }}>{d.city}</span>
              </div>
              <span className={`badge badge-${d.severity?.toLowerCase()}`}>{d.severity}</span>
            </div>
          ))}

          {/* No results */}
          {results.length === 0 && query && (
            <div style={{ padding: '12px', fontSize: '12px', color: '#9ca3af', textAlign: 'center' }}>
              No cities found for "{query}"
            </div>
          )}
        </div>
      )}

      {/* No results when open but empty */}
      {open && results.length === 0 && query && (
        <div style={{
          position: 'absolute', top: '38px', left: 0, right: 0,
          background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)', zIndex: 2000, padding: '12px',
          fontSize: '12px', color: '#9ca3af', textAlign: 'center'
        }}>
          No cities found for "{query}"
        </div>
      )}
    </div>
  )
}

// ── Fly to location ─────────────────────────────────────────
function FlyTo({ target }) {
  const map = useMap()
  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lon], 14, { duration: 1.5 })
  }, [target, map])
  return null
}

// ── Heatmap layer ───────────────────────────────────────────
function HeatmapLayer({ points }) {
  const map = useMap()

  useEffect(() => {
    if (!points.length) return
    let heatLayer = null

    import('leaflet.heat').then(() => {
      const L = window.L || require('leaflet')
      heatLayer = L.heatLayer(points, {
        radius:     35,
        blur:       20,
        maxZoom:    17,
        max:        0.3,
        minOpacity: 0.5,
        gradient: {
          0.0: '#22c55e',
          0.4: '#fbbf24',
          0.7: '#f97316',
          1.0: '#dc2626'
        }
      }).addTo(map)
    })

    return () => { if (heatLayer) map.removeLayer(heatLayer) }
  }, [points, map])

  return null
}

// ── Main component ──────────────────────────────────────────
export default function LiveMap() {
  const [detections,    setDetections]    = useState([])
  const [filter,        setFilter]        = useState('All')
  const [selected,      setSelected]      = useState(null)
  const [viewMode,      setViewMode]      = useState('dots')
  const [searchTarget,  setSearchTarget]  = useState(null)

  useEffect(() => {
    axios.get(`${API}/api/detections`).then(r => setDetections(r.data))
  }, [])

  const filtered = filter === 'All'
    ? detections
    : detections.filter(d => d.severity === filter)

  const counts = {
    All:    detections.length,
    High:   detections.filter(d => d.severity === 'High').length,
    Medium: detections.filter(d => d.severity === 'Medium').length,
    Low:    detections.filter(d => d.severity === 'Low').length,
  }

  const heatPoints = detections.map(d => [
    d.lat, d.lon,
    d.severity === 'High' ? 1.0 : d.severity === 'Medium' ? 0.6 : 0.3
  ])

  const pills = [
    { label: 'All',    cls: 'active-all'    },
    { label: 'High',   cls: 'active-red'    },
    { label: 'Medium', cls: 'active-medium' },
    { label: 'Low',    cls: 'active-low'    },
  ]

  return (
    <div>
      {/* ── Top bar ── */}
      <div className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="topbar-title">Live Map</span>
          <span className="badge badge-blue">{detections.length} locations</span>
        </div>
        <div className="topbar-actions" style={{ gap: '10px' }}>

          {/* Search box */}
          <SearchBox
            detections={detections}
            onSelect={d => { setSearchTarget(d); setSelected(d) }}
          />

          {/* Dots / Heatmap toggle */}
          <div style={{
            display: 'flex', background: '#f3f4f6',
            borderRadius: '8px', padding: '3px', gap: '2px'
          }}>
            {[
              { mode: 'dots',    label: 'Dots',    icon: MapIcon },
              { mode: 'heatmap', label: 'Heatmap', icon: Layers },
            ].map(({ mode, label, icon: Icon }) => (
              <button key={mode} onClick={() => setViewMode(mode)} style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                padding: '5px 12px', borderRadius: '6px', border: 'none',
                fontSize: '11px', fontWeight: '500', cursor: 'pointer',
                fontFamily: 'Poppins, sans-serif', transition: 'all 0.15s',
                background: viewMode === mode ? '#fff' : 'transparent',
                color: viewMode === mode
                  ? mode === 'heatmap' ? '#dc2626' : '#0012b5'
                  : '#9ca3af',
                boxShadow: viewMode === mode ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}>
                <Icon size={12} /> {label}
              </button>
            ))}
          </div>

          <span style={{ fontSize: '11px', color: '#9ca3af' }}>
            NCR Region · Updated just now
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', height: 'calc(100vh - 52px)', overflow: 'hidden' }}>

        {/* ── Left panel ── */}
        <div style={{
          width: '260px', background: '#ffffff',
          borderRight: '1px solid #e5e7eb',
          display: 'flex', flexDirection: 'column',
          flexShrink: 0, overflow: 'hidden'
        }}>

          {/* Heatmap info banner */}
          {viewMode === 'heatmap' && (
            <div style={{
              margin: '12px', background: '#fef2f2',
              border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 12px'
            }}>
              <div style={{ fontSize: '11px', fontWeight: '600', color: '#dc2626', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Layers size={11} /> Heatmap Mode
              </div>
              <div style={{ fontSize: '11px', color: '#ef4444', lineHeight: '1.5' }}>
                Red = High density · Yellow = Medium · Green = Low density
              </div>
            </div>
          )}

          {/* Filter */}
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #f3f4f6' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
              Filter by Severity
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {pills.map(({ label }) => (
                <button key={label} onClick={() => setFilter(label)} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 12px', borderRadius: '8px', cursor: 'pointer',
                  border: filter === label
                    ? `1px solid ${label === 'All' ? '#0012b5' : label === 'High' ? '#fecaca' : label === 'Medium' ? '#fde68a' : '#bbf7d0'}`
                    : '1px solid #f3f4f6',
                  background: filter === label
                    ? label === 'All' ? '#0012b5' : label === 'High' ? '#fef2f2' : label === 'Medium' ? '#fffbeb' : '#f0fdf4'
                    : '#f9fafb',
                  transition: 'all 0.15s', fontFamily: 'Poppins, sans-serif',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {label !== 'All' && (
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: COLORS[label], flexShrink: 0 }} />
                    )}
                    <span style={{
                      fontSize: '12px', fontWeight: '500',
                      color: filter === label
                        ? label === 'All' ? '#fff' : label === 'High' ? '#dc2626' : label === 'Medium' ? '#d97706' : '#16a34a'
                        : '#6b7280'
                    }}>{label}</span>
                  </div>
                  <span style={{
                    fontSize: '11px', fontWeight: '600', padding: '1px 7px', borderRadius: '10px',
                    background: filter === label && label === 'All' ? 'rgba(255,255,255,0.2)' : '#e5e7eb',
                    color: filter === label && label === 'All' ? '#fff' : '#6b7280',
                  }}>{counts[label]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #f3f4f6' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
              Summary
            </div>
            {[
              { label: 'Total Locations', value: counts.All,    color: '#0012b5' },
              { label: 'High Severity',   value: counts.High,   color: '#dc2626' },
              { label: 'Medium Severity', value: counts.Medium, color: '#d97706' },
              { label: 'Low Severity',    value: counts.Low,    color: '#16a34a' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '7px 0', borderBottom: '1px solid #f9fafb'
              }}>
                <span style={{ fontSize: '12px', color: '#9ca3af' }}>{label}</span>
                <span style={{ fontSize: '13px', fontWeight: '700', color }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Heatmap legend */}
          {viewMode === 'heatmap' && (
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #f3f4f6' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
                Heatmap Legend
              </div>
              <div style={{ height: '12px', borderRadius: '6px', background: 'linear-gradient(90deg, #22c55e, #fbbf24, #f97316, #dc2626)', marginBottom: '6px' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '10px', color: '#9ca3af' }}>Low density</span>
                <span style={{ fontSize: '10px', color: '#9ca3af' }}>High density</span>
              </div>
            </div>
          )}

          {/* Selected location */}
          <div style={{ flex: 1, padding: '14px 16px', overflowY: 'auto' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
              Selected Location
            </div>
            {selected ? (
              <div style={{ background: '#f9fafb', borderRadius: '10px', padding: '14px', border: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '8px',
                    background: BG[selected.severity],
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <AlertTriangle size={14} color={COLORS[selected.severity]} />
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#111827' }}>{selected.city}</div>
                    <span className={`badge badge-${selected.severity?.toLowerCase()}`}>{selected.severity}</span>
                  </div>
                </div>
                {[
                  { label: 'Potholes', value: selected.potholes },
                  { label: 'Latitude',  value: selected.lat?.toFixed(5) },
                  { label: 'Longitude', value: selected.lon?.toFixed(5) },
                  { label: 'Detected',  value: selected.timestamp?.split(' ')[0] },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11px', color: '#9ca3af' }}>{label}</span>
                    <span style={{ fontSize: '11px', fontWeight: '600', color: '#374151' }}>{value}</span>
                  </div>
                ))}

                {/* Google Maps link */}
                <a
                  href={`https://maps.google.com/?q=${selected.lat},${selected.lon}`}
                  target="_blank" rel="noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                    marginTop: '10px', padding: '7px', background: '#eff6ff',
                    border: '1px solid #bfdbfe', borderRadius: '7px',
                    fontSize: '11px', color: '#0012b5', fontWeight: '500',
                    textDecoration: 'none', fontFamily: 'Poppins, sans-serif'
                  }}>
                  <MapPin size={11} /> Open in Google Maps
                </a>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <Navigation size={24} color="#d1d5db" style={{ margin: '0 auto 8px' }} />
                <div style={{ fontSize: '12px', color: '#d1d5db' }}>
                  {viewMode === 'heatmap' ? 'Switch to Dots to select' : 'Click a dot on the map'}
                </div>
              </div>
            )}
          </div>

          {/* Dots legend */}
          {viewMode === 'dots' && (
            <div style={{ padding: '12px 16px', borderTop: '1px solid #f3f4f6', background: '#fafafa' }}>
              <div style={{ fontSize: '10px', color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Legend</div>
              {Object.entries(COLORS).map(([sev, color]) => (
                <div key={sev} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: color, flexShrink: 0, boxShadow: `0 0 4px ${color}` }} />
                  <span style={{ fontSize: '11px', color: '#6b7280' }}>{sev} severity</span>
                  <span style={{ fontSize: '11px', color: '#d1d5db', marginLeft: 'auto' }}>{counts[sev]}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Map ── */}
        <div style={{ flex: 1, position: 'relative' }}>
          <MapContainer
            center={[28.6, 77.2]} zoom={10}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap'
            />

            {/* Fly to searched location */}
            <FlyTo target={searchTarget} />

            {/* Dots mode */}
            {viewMode === 'dots' && filtered.map((d, i) => (
              <CircleMarker
                key={i}
                center={[d.lat, d.lon]}
                radius={d.severity === 'High' ? 10 : d.severity === 'Medium' ? 8 : 6}
                fillColor={COLORS[d.severity]}
                color={'#ffffff'}
                fillOpacity={0.9}
                weight={2}
                eventHandlers={{ click: () => setSelected(d) }}
              >
                <Popup>
                  <div style={{ fontFamily: 'Poppins, sans-serif', minWidth: '160px', padding: '4px' }}>
                    <div style={{ fontWeight: '600', fontSize: '13px', color: '#111827', marginBottom: '6px' }}>
                      📍 {d.city}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '3px' }}>
                      Potholes: <strong style={{ color: '#111827' }}>{d.potholes}</strong>
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '3px' }}>
                      Severity: <strong style={{ color: COLORS[d.severity] }}>{d.severity}</strong>
                    </div>
                    <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '6px' }}>{d.timestamp}</div>
                  </div>
                </Popup>
              </CircleMarker>
            ))}

            {/* Heatmap mode */}
            {viewMode === 'heatmap' && heatPoints.length > 0 && (
              <HeatmapLayer points={heatPoints} />
            )}
          </MapContainer>

          {/* Bottom hint */}
          <div style={{
            position: 'absolute', bottom: '16px', right: '16px', zIndex: 1000,
            background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px',
            padding: '8px 12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            fontSize: '11px', color: '#9ca3af', fontFamily: 'Poppins, sans-serif',
            display: 'flex', alignItems: 'center', gap: '5px'
          }}>
            {viewMode === 'dots'
              ? <><MapPin size={11} /> Click any dot for details</>
              : <><Layers size={11} /> Showing density heatmap</>}
          </div>
        </div>
      </div>
    </div>
  )
}