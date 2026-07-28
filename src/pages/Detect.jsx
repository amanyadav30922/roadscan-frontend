import { useState } from 'react'
import axios from 'axios'
import {
  Upload, MapPin, Save, CheckCircle, AlertTriangle,
  Zap, Image, Info, Camera, X
} from 'lucide-react'

const API = 'https://roadscan-backend.onrender.com'

export default function Detect() {
  const [file,    setFile]    = useState(null)
  const [preview, setPreview] = useState(null)
  const [result,  setResult]  = useState(null)
  const [loading, setLoading] = useState(false)
  const [city,    setCity]    = useState('')
  const [saved,   setSaved]   = useState(false)
  const [drag,    setDrag]    = useState(false)

  const handleFile = f => {
    if (!f) return
    setFile(f); setPreview(URL.createObjectURL(f))
    setResult(null); setSaved(false); setCity('')
  }

  const onDrop = e => {
    e.preventDefault(); setDrag(false)
    handleFile(e.dataTransfer.files[0])
  }

  const detect = async () => {
    if (!file) return
    setLoading(true)
    const form = new FormData()
    form.append('file', file)
    try {
      const res = await axios.post(`${API}/api/detect`, form)
      setResult(res.data)
    } catch(e) { console.error(e) }
    setLoading(false)
  }

  const save = async () => {
    if (!result?.gps_found) return
    await axios.post(`${API}/api/save`, {
      image: file.name, lat: result.lat, lon: result.lon,
      city: city || 'Unknown', potholes: result.num_potholes,
      severity: result.num_potholes >= 3 ? 'High' : result.num_potholes === 2 ? 'Medium' : 'Low',
    })
    setSaved(true)
  }

  const severity = result
    ? result.num_potholes >= 3 ? 'High' : result.num_potholes === 2 ? 'Medium' : 'Low'
    : null

  const sevColor = { High: '#dc2626', Medium: '#d97706', Low: '#16a34a' }

  return (
    <div>
      {/* Top bar */}
      <div className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="topbar-title">Detect Potholes</span>
          <span className="badge badge-blue">AI Powered</span>
        </div>
        <div className="topbar-actions">
          {file && (
            <button className="btn btn-ghost btn-sm" onClick={() => { setFile(null); setPreview(null); setResult(null); setSaved(false) }}>
              <X size={12} /> Clear
            </button>
          )}
          <button className="btn btn-primary btn-sm" onClick={detect}
            disabled={!file || loading}>
            {loading ? <><div className="spinner" /> Detecting...</> : <><Zap size={12} /> Detect</>}
          </button>
        </div>
      </div>

      <div className="page-inner">
        <div style={{ display: 'grid', gridTemplateColumns: result ? '1fr 1fr' : '1fr', gap: '16px', alignItems: 'start' }}>

          {/* Left — Upload */}
          <div>
            {/* Tips */}
            {!result && (
              <div style={{
                background: '#eff6ff', border: '1px solid #bfdbfe',
                borderRadius: '10px', padding: '12px 16px', marginBottom: '16px',
                display: 'flex', gap: '10px', alignItems: 'flex-start'
              }}>
                <Info size={14} color="#0012b5" style={{ marginTop: '1px', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#0012b5', marginBottom: '3px' }}>
                    For best results
                  </div>
                  <div style={{ fontSize: '11px', color: '#3b82f6', lineHeight: '1.6' }}>
                    Use photos taken with your phone (GPS auto-extracted) · Clear daylight photos work best · Road must be visible
                  </div>
                </div>
              </div>
            )}

            <div className="card">
              <div className="card-header">
                <span className="card-title">Upload Road Image</span>
                {file && <span className="badge badge-low">✓ Image Ready</span>}
              </div>
              <div className="card-body">

                {/* Upload zone */}
                <label
                  className={`upload-zone ${file ? 'has-file' : ''}`}
                  style={{ borderRadius: '10px' }}
                  onDragOver={e => { e.preventDefault(); setDrag(true) }}
                  onDragLeave={() => setDrag(false)}
                  onDrop={onDrop}
                >
                  {preview ? (
                    <div style={{ position: 'relative' }}>
                      <img src={preview} alt="preview" style={{
                        width: '100%', maxHeight: '260px', objectFit: 'cover',
                        borderRadius: '8px', display: 'block'
                      }} />
                      <div style={{
                        position: 'absolute', bottom: '8px', left: '8px',
                        background: 'rgba(0,0,0,0.6)', color: '#fff',
                        fontSize: '11px', padding: '3px 8px', borderRadius: '4px',
                        fontFamily: 'Poppins, sans-serif'
                      }}>
                        {file.name}
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: '16px 0' }}>
                      <div style={{ fontSize: '36px', marginBottom: '12px' }}>
                        {drag ? '📂' : '📸'}
                      </div>
                      <div style={{ fontSize: '14px', color: '#374151', fontWeight: '500', marginBottom: '4px' }}>
                        {drag ? 'Drop image here' : 'Click to upload or drag & drop'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                        JPG, PNG supported · GPS coordinates auto-extracted
                      </div>
                    </div>
                  )}
                  <input type="file" accept="image/*"
                    onChange={e => handleFile(e.target.files[0])}
                    style={{ display: 'none' }} />
                </label>

                {/* Detect button */}
                <button
                  className="btn btn-primary btn-full"
                  onClick={detect}
                  disabled={!file || loading}
                  style={{ marginTop: '14px', padding: '12px', fontSize: '13px' }}
                >
                  {loading
                    ? <><div className="spinner" /> Analyzing image...</>
                    : <><Zap size={15} /> Detect Potholes</>}
                </button>

                {!file && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '14px' }}>
                    {[
                      { icon: Camera,   label: 'Phone photo',    desc: 'GPS included' },
                      { icon: MapPin,   label: 'Auto GPS',       desc: 'No manual input' },
                      { icon: Zap,      label: 'Instant AI',     desc: '< 2 seconds' },
                    ].map(({ icon: Icon, label, desc }) => (
                      <div key={label} style={{
                        background: '#f9fafb', border: '1px solid #f3f4f6',
                        borderRadius: '8px', padding: '10px', textAlign: 'center'
                      }}>
                        <Icon size={16} color="#0012b5" style={{ margin: '0 auto 6px' }} />
                        <div style={{ fontSize: '11px', fontWeight: '600', color: '#374151' }}>{label}</div>
                        <div style={{ fontSize: '10px', color: '#9ca3af' }}>{desc}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right — Results */}
          {result && (
            <div>
              {/* Result image */}
              <div className="card" style={{ marginBottom: '14px' }}>
                <div className="card-header">
                  <span className="card-title">Detection Result</span>
                  {result.num_potholes > 0
                    ? <span className={`badge badge-${severity?.toLowerCase()}`}>{result.num_potholes} pothole(s)</span>
                    : <span className="badge badge-low">✓ Clean Road</span>}
                </div>
                <div style={{ padding: '14px' }}>
                  <img
                    src={`data:image/jpeg;base64,${result.result_image}`}
                    alt="result"
                    style={{ width: '100%', borderRadius: '8px', maxHeight: '260px', objectFit: 'cover', display: 'block' }}
                  />
                </div>
              </div>

              {/* Summary */}
              <div className="card">
                <div className="card-header">
                  <span className="card-title">Analysis Summary</span>
                  {result.gps_found && <span className="badge badge-low">📍 GPS Found</span>}
                </div>
                <div className="card-body">

                  {/* 3 metrics */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                    <div style={{ background: '#f9fafb', border: '1px solid #f3f4f6', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                      <div style={{ fontSize: '24px', fontWeight: '700', color: result.num_potholes > 0 ? '#dc2626' : '#16a34a' }}>
                        {result.num_potholes}
                      </div>
                      <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Potholes</div>
                    </div>
                    <div style={{ background: '#f9fafb', border: '1px solid #f3f4f6', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                      {result.num_potholes > 0
                        ? <span className={`badge badge-${severity?.toLowerCase()}`} style={{ fontSize: '12px', marginTop: '4px' }}>{severity}</span>
                        : <span className="badge badge-low" style={{ fontSize: '12px', marginTop: '4px' }}>None</span>}
                      <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Severity</div>
                    </div>
                    <div style={{ background: '#f9fafb', border: '1px solid #f3f4f6', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: result.gps_found ? '#16a34a' : '#d97706', marginTop: '2px' }}>
                        {result.gps_found ? '✓ Found' : '✗ Missing'}
                      </div>
                      <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>GPS</div>
                    </div>
                  </div>

                  {/* GPS coordinates */}
                  {result.gps_found && (
                    <div style={{
                      background: '#f0fdf4', border: '1px solid #bbf7d0',
                      borderRadius: '8px', padding: '10px 14px', marginBottom: '14px',
                      display: 'flex', alignItems: 'center', gap: '8px'
                    }}>
                      <MapPin size={14} color="#16a34a" />
                      <div>
                        <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: '600' }}>GPS Auto-Detected</div>
                        <div style={{ fontSize: '11px', color: '#374151', marginTop: '1px', fontFamily: 'monospace' }}>
                          {result.lat?.toFixed(6)}, {result.lon?.toFixed(6)}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Pothole list */}
                  {result.potholes.length > 0 && (
                    <div style={{ marginBottom: '14px' }}>
                      <div style={{ fontSize: '11px', fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                        Detected Potholes
                      </div>
                      {result.potholes.map(p => (
                        <div key={p.id} style={{
                          display: 'flex', alignItems: 'center', gap: '10px',
                          padding: '9px 12px', background: '#f9fafb',
                          borderRadius: '8px', border: '1px solid #f3f4f6', marginBottom: '6px'
                        }}>
                          <div style={{
                            width: '28px', height: '28px', borderRadius: '7px', flexShrink: 0,
                            background: p.severity==='High' ? '#fef2f2' : p.severity==='Medium' ? '#fffbeb' : '#f0fdf4',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}>
                            <AlertTriangle size={13} color={sevColor[p.severity]} strokeWidth={1.5} />
                          </div>
                          <span style={{ fontSize: '12px', color: '#374151', fontWeight: '500', flex: 1 }}>
                            Pothole #{p.id}
                          </span>
                          <span className={`badge badge-${p.severity.toLowerCase()}`}>{p.severity}</span>
                          <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                            {(p.confidence * 100).toFixed(0)}% conf
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Save */}
                  {result.num_potholes > 0 && result.gps_found && !saved && (
                    <>
                      <hr />
                      <div style={{ marginTop: '14px' }}>
                        <label style={{ fontSize: '11px', fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                          Area / City Name
                        </label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input placeholder="e.g. Connaught Place, New Delhi"
                            value={city} onChange={e => setCity(e.target.value)} />
                          <button className="btn btn-primary" onClick={save}
                            style={{ flexShrink: 0 }}>
                            <Save size={13} /> Save
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  {saved && (
                    <div className="alert alert-success" style={{ marginTop: '12px' }}>
                      <CheckCircle size={14} /> Saved to map successfully! Go to Live Map to see it.
                    </div>
                  )}

                  {result.num_potholes > 0 && !result.gps_found && (
                    <div className="alert alert-warning" style={{ marginTop: '12px' }}>
                      ⚠️ No GPS in this image. Use phone photos with Location ON for GPS auto-detection.
                    </div>
                  )}

                  {result.num_potholes === 0 && (
                    <div className="alert alert-success" style={{ marginTop: '12px' }}>
                      ✅ Road looks clean — no potholes detected!
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}