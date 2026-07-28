import { useState, useRef } from 'react'
import axios from 'axios'
import {
  Video, Upload, Play, AlertTriangle,
  Clock, Film, Zap, CheckCircle, X,
  MapPin, Navigation, Route
} from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

const API = 'https://roadscan-backend.onrender.com'

// Fix leaflet default icon
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Extract GPS from Google Maps URL
function extractGPS(url) {
  if (!url) return null
  const patterns = [
    /@(-?\d+\.?\d*),(-?\d+\.?\d*)/,
    /q=(-?\d+\.?\d*),(-?\d+\.?\d*)/,
    /ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/,
    /!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m) return { lat: parseFloat(m[1]), lon: parseFloat(m[2]) }
  }
  // Try plain coordinates like "28.6139, 77.2090"
  const plain = url.match(/(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)/)
  if (plain) return { lat: parseFloat(plain[1]), lon: parseFloat(plain[2]) }
  return null
}

// Interpolate GPS between two points
function interpolateGPS(start, end, fraction) {
  return {
    lat: start.lat + (end.lat - start.lat) * fraction,
    lon: start.lon + (end.lon - start.lon) * fraction,
  }
}

export default function VideoDetect() {
  const [file,       setFile]       = useState(null)
  const [preview,    setPreview]    = useState(null)
  const [loading,    setLoading]    = useState(false)
  const [progress,   setProgress]   = useState(0)
  const [result,     setResult]     = useState(null)
  const [selected,   setSelected]   = useState(null)
  const [saved,      setSaved]      = useState(false)
  const [startUrl,   setStartUrl]   = useState('')
  const [endUrl,     setEndUrl]     = useState('')
  const [startGPS,   setStartGPS]   = useState(null)
  const [endGPS,     setEndGPS]     = useState(null)
  const [city,       setCity]       = useState('')
  const fileRef = useRef()

  const handleFile = f => {
    if (!f) return
    setFile(f); setPreview(URL.createObjectURL(f))
    setResult(null); setSaved(false); setSelected(null); setProgress(0)
  }

  const handleStartUrl = val => {
    setStartUrl(val)
    const gps = extractGPS(val)
    setStartGPS(gps)
  }

  const handleEndUrl = val => {
    setEndUrl(val)
    const gps = extractGPS(val)
    setEndGPS(gps)
  }

  const detect = async () => {
    if (!file) return
    setLoading(true); setProgress(10)
    const form = new FormData()
    form.append('file', file)
    try {
      const interval = setInterval(() => {
        setProgress(p => Math.min(p + 4, 88))
      }, 800)
      const res = await axios.post(`${API}/api/detect/video`, form, { timeout: 300000 })
      clearInterval(interval)
      setProgress(100)

      // Add GPS to each detection frame
      const duration = res.data.duration_sec || 1
      const enriched = res.data.detections.map(d => {
        const fraction = d.timestamp_sec / duration
        const gps = startGPS && endGPS
          ? interpolateGPS(startGPS, endGPS, fraction)
          : null
        return { ...d, lat: gps?.lat, lon: gps?.lon }
      })

      setResult({ ...res.data, detections: enriched })
    } catch(e) { console.error(e) }
    setLoading(false)
  }

  const saveAll = async () => {
    if (!result?.detections?.length) return
    for (const d of result.detections) {
      await axios.post(`${API}/api/save`, {
        image:    file.name,
        lat:      d.lat  || (startGPS?.lat || 28.6139) + Math.random() * 0.01,
        lon:      d.lon  || (startGPS?.lon || 77.2090) + Math.random() * 0.01,
        city:     city || 'Video Detection',
        potholes: d.num_potholes,
        severity: d.severity,
      })
    }
    setSaved(true)
  }

  const sevColor = { High: '#dc2626', Medium: '#d97706', Low: '#16a34a' }
  const gpsReady = startGPS && endGPS
  const mapCenter = startGPS
    ? [startGPS.lat, startGPS.lon]
    : [28.6139, 77.2090]

  return (
    <div>
      {/* Top bar */}
      <div className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="topbar-title">Video Detection</span>
          <span className="badge badge-blue">Dashcam AI</span>
          {gpsReady && <span className="badge badge-low">📍 GPS Route Ready</span>}
        </div>
        <div className="topbar-actions">
          {file && !loading && (
            <button className="btn btn-ghost btn-sm"
              onClick={() => { setFile(null); setPreview(null); setResult(null); setProgress(0) }}>
              <X size={12} /> Clear
            </button>
          )}
          <button className="btn btn-primary btn-sm"
            onClick={detect} disabled={!file || loading}>
            {loading
              ? <><div className="spinner" /> Processing {progress}%</>
              : <><Zap size={12} /> Analyze Video</>}
          </button>
        </div>
      </div>

      <div className="page-inner">
        <div style={{ display: 'grid', gridTemplateColumns: result ? '1fr 1fr' : '1fr', gap: '16px', alignItems: 'start' }}>

          {/* Left — Upload + GPS */}
          <div>

            {/* GPS Route setup */}
            <div className="card" style={{ marginBottom: '14px' }}>
              <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <Route size={14} color="#0012b5" />
                  <span className="card-title">GPS Route (Optional)</span>
                </div>
                {gpsReady
                  ? <span className="badge badge-low">✅ Route set</span>
                  : <span className="badge badge-gray">Paste Google Maps links</span>}
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '600', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '5px' }}>
                      🟢 Start Location
                    </label>
                    <input
                      placeholder="Paste Google Maps link or coordinates (28.6139, 77.2090)"
                      value={startUrl}
                      onChange={e => handleStartUrl(e.target.value)}
                    />
                    {startGPS && (
                      <div style={{ fontSize: '11px', color: '#16a34a', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={11} /> {startGPS.lat.toFixed(5)}, {startGPS.lon.toFixed(5)}
                      </div>
                    )}
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '600', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '5px' }}>
                      🔴 End Location
                    </label>
                    <input
                      placeholder="Paste Google Maps link or coordinates (28.6200, 77.2200)"
                      value={endUrl}
                      onChange={e => handleEndUrl(e.target.value)}
                    />
                    {endGPS && (
                      <div style={{ fontSize: '11px', color: '#dc2626', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={11} /> {endGPS.lat.toFixed(5)}, {endGPS.lon.toFixed(5)}
                      </div>
                    )}
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '600', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '5px' }}>
                      📌 Area / City Name
                    </label>
                    <input
                      placeholder="e.g. MG Road, Bangalore"
                      value={city}
                      onChange={e => setCity(e.target.value)}
                    />
                  </div>
                </div>

                {/* Route preview map */}
                {gpsReady && (
                  <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                    <MapContainer center={mapCenter} zoom={13}
                      style={{ height: '160px', width: '100%' }} zoomControl={false}>
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <Polyline
                        positions={[[startGPS.lat, startGPS.lon], [endGPS.lat, endGPS.lon]]}
                        color="#0012b5" weight={3} dashArray="6,4"
                      />
                      <Marker position={[startGPS.lat, startGPS.lon]}>
                        <Popup>🟢 Start: {city || 'Start point'}</Popup>
                      </Marker>
                      <Marker position={[endGPS.lat, endGPS.lon]}>
                        <Popup>🔴 End: {city || 'End point'}</Popup>
                      </Marker>
                    </MapContainer>
                  </div>
                )}

                {!gpsReady && (
                  <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '10px 12px' }}>
                    <div style={{ fontSize: '11px', color: '#d97706', lineHeight: '1.6' }}>
                      💡 <strong>How to get Google Maps link:</strong> Open Google Maps → go to your location → click Share → Copy link
                      <br />Or just paste coordinates directly: <strong>28.6139, 77.2090</strong>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Video upload */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">Upload Dashcam Video</span>
                {file && <span className="badge badge-blue">{(file.size/1024/1024).toFixed(1)} MB</span>}
              </div>
              <div className="card-body">
                {preview ? (
                  <div style={{ marginBottom: '14px' }}>
                    <video src={preview} controls style={{
                      width: '100%', borderRadius: '8px', maxHeight: '200px', background: '#000'
                    }} />
                    <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '5px', textAlign: 'center' }}>
                      {file.name}
                    </div>
                  </div>
                ) : (
                  <label className="upload-zone" style={{ marginBottom: '14px', display: 'block' }}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]) }}>
                    <div style={{ fontSize: '32px', marginBottom: '10px' }}>🎥</div>
                    <div style={{ fontSize: '13px', color: '#374151', fontWeight: '500', marginBottom: '4px' }}>
                      Click to upload or drag & drop
                    </div>
                    <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                      MP4, AVI, MOV · Max 500MB
                    </div>
                    <input ref={fileRef} type="file" accept="video/*"
                      onChange={e => handleFile(e.target.files[0])}
                      style={{ display: 'none' }} />
                  </label>
                )}

                {/* Progress */}
                {loading && (
                  <div style={{ marginBottom: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <span style={{ fontSize: '12px', color: '#374151', fontWeight: '500' }}>Analyzing video...</span>
                      <span style={{ fontSize: '12px', color: '#0012b5', fontWeight: '600' }}>{progress}%</span>
                    </div>
                    <div style={{ height: '6px', background: '#e5e7eb', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', background: '#0012b5', borderRadius: '3px',
                        width: `${progress}%`, transition: 'width 0.5s ease'
                      }} />
                    </div>
                    <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
                      Processing 1 frame per second · Please wait...
                    </div>
                  </div>
                )}

                <button className="btn btn-primary btn-full"
                  onClick={detect} disabled={!file || loading}
                  style={{ padding: '12px', fontSize: '13px' }}>
                  {loading
                    ? <><div className="spinner" /> Analyzing {progress}%...</>
                    : <><Zap size={15} /> Analyze Video for Potholes</>}
                </button>
              </div>
            </div>
          </div>

          {/* Right — Results */}
          {result && (
            <div>
              {/* Stats */}
              <div className="card" style={{ marginBottom: '14px' }}>
                <div className="card-header">
                  <span className="card-title">Analysis Results</span>
                  <span className={`badge badge-${result.frames_with_potholes > 0 ? 'high' : 'low'}`}>
                    {result.frames_with_potholes > 0 ? `${result.frames_with_potholes} frames detected` : '✅ Clean road'}
                  </span>
                </div>
                <div className="card-body">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', marginBottom: '14px' }}>
                    {[
                      { label: 'Duration',   value: `${result.duration_sec}s`, color: '#0012b5' },
                      { label: 'Frames',     value: result.processed_frames,   color: '#374151' },
                      { label: 'Potholes',   value: result.total_potholes,     color: '#dc2626' },
                      { label: 'FPS',        value: result.fps,                color: '#374151' },
                      { label: 'Resolution', value: result.resolution,         color: '#374151' },
                      { label: 'GPS Frames', value: gpsReady ? result.detections.length : '—', color: '#16a34a' },
                    ].map(({ label, value, color }) => (
                      <div key={label} style={{
                        background: '#f9fafb', border: '1px solid #f3f4f6',
                        borderRadius: '8px', padding: '10px', textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '15px', fontWeight: '700', color }}>{value}</div>
                        <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '2px' }}>{label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Route map with pothole markers */}
                  {gpsReady && result.detections.length > 0 && (
                    <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e7eb', marginBottom: '14px' }}>
                      <div style={{ padding: '8px 12px', background: '#f9fafb', borderBottom: '1px solid #f3f4f6', fontSize: '11px', fontWeight: '600', color: '#374151' }}>
                        📍 Pothole locations along route
                      </div>
                      <MapContainer center={mapCenter} zoom={13}
                        style={{ height: '200px', width: '100%' }} zoomControl={false}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <Polyline
                          positions={[[startGPS.lat, startGPS.lon], [endGPS.lat, endGPS.lon]]}
                          color="#0012b5" weight={3} dashArray="6,4"
                        />
                        {result.detections.map((d, i) => d.lat && (
                          <CircleMarker key={i}
                            center={[d.lat, d.lon]}
                            radius={6}
                            fillColor={sevColor[d.severity]}
                            color="#fff" fillOpacity={0.9} weight={2}>
                            <Popup>
                              <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px' }}>
                                <strong>{d.timestamp_str}</strong><br />
                                {d.num_potholes} pothole(s) · {d.severity}
                              </div>
                            </Popup>
                          </CircleMarker>
                        ))}
                      </MapContainer>
                    </div>
                  )}

                  {result.frames_with_potholes > 0 && !saved && (
                    <button className="btn btn-primary btn-full" onClick={saveAll} style={{ padding: '10px' }}>
                      <MapPin size={13} /> Save All {result.frames_with_potholes} Detections to Map
                    </button>
                  )}
                  {saved && <div className="alert alert-success"><CheckCircle size={13} /> All saved to map!</div>}
                </div>
              </div>

              {/* Frame list */}
              {result.detections.length > 0 && (
                <div className="card">
                  <div className="card-header">
                    <span className="card-title">Detections by Frame</span>
                    <span className="badge badge-gray">{result.detections.length} frames</span>
                  </div>
                  <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
                    {result.detections.map((d, i) => (
                      <div key={i}
                        onClick={() => setSelected(selected?.frame === d.frame ? null : d)}
                        style={{
                          padding: '10px 14px', borderBottom: '1px solid #f3f4f6',
                          cursor: 'pointer', transition: 'background 0.1s',
                          background: selected?.frame === d.frame ? '#f0f9ff' : '#fff'
                        }}
                        onMouseOver={e => { if (selected?.frame !== d.frame) e.currentTarget.style.background = '#f9fafb' }}
                        onMouseOut={e  => { if (selected?.frame !== d.frame) e.currentTarget.style.background = '#fff' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img
                            src={`data:image/jpeg;base64,${d.thumbnail}`}
                            alt={`frame`}
                            style={{ width: '72px', height: '45px', objectFit: 'cover', borderRadius: '5px', flexShrink: 0 }}
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                              <Clock size={11} color="#9ca3af" />
                              <span style={{ fontSize: '12px', fontWeight: '600', color: '#111827' }}>{d.timestamp_str}</span>
                              <span className={`badge badge-${d.severity.toLowerCase()}`}>{d.severity}</span>
                            </div>
                            <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                              {d.num_potholes} pothole(s) · {(d.confidence*100).toFixed(0)}% conf
                              {d.lat && <span style={{ color: '#16a34a', marginLeft: '6px' }}>📍 GPS</span>}
                            </div>
                          </div>
                          <AlertTriangle size={13} color={sevColor[d.severity]} />
                        </div>

                        {selected?.frame === d.frame && (
                          <div style={{ marginTop: '10px' }}>
                            <img src={`data:image/jpeg;base64,${d.thumbnail}`}
                              style={{ width: '100%', borderRadius: '8px' }} />
                            {d.lat && (
                              <div style={{ fontSize: '11px', color: '#16a34a', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <MapPin size={11} /> {d.lat.toFixed(5)}, {d.lon.toFixed(5)}
                                <a href={`https://maps.google.com/?q=${d.lat},${d.lon}`}
                                  target="_blank" rel="noreferrer"
                                  style={{ color: '#0012b5', marginLeft: '8px', fontSize: '11px' }}>
                                  Open in Maps →
                                </a>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}