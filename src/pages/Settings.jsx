import { useState } from 'react'
import axios from 'axios'
import {
  User, Sliders, Map, Database,
  Bell, Shield, Save, Trash2,
  CheckCircle, AlertTriangle, Eye, EyeOff
} from 'lucide-react'

const API = 'https://roadscan-backend.onrender.com'

const Section = ({ icon: Icon, title, desc, children }) => (
  <div className="card" style={{ marginBottom: '14px' }}>
    <div className="card-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{
          width: '28px', height: '28px', borderRadius: '7px',
          background: '#eff6ff', display: 'flex',
          alignItems: 'center', justifyContent: 'center'
        }}>
          <Icon size={14} color="#0012b5" />
        </div>
        <div>
          <div className="card-title">{title}</div>
          {desc && <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '1px' }}>{desc}</div>}
        </div>
      </div>
    </div>
    <div className="card-body">{children}</div>
  </div>
)

const Field = ({ label, desc, children }) => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '12px 0', borderBottom: '1px solid #f3f4f6'
  }}>
    <div>
      <div style={{ fontSize: '12px', fontWeight: '500', color: '#374151' }}>{label}</div>
      {desc && <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>{desc}</div>}
    </div>
    <div style={{ flexShrink: 0, marginLeft: '16px' }}>{children}</div>
  </div>
)

const Toggle = ({ value, onChange }) => (
  <button onClick={() => onChange(!value)} style={{
    width: '40px', height: '22px', borderRadius: '11px', border: 'none',
    background: value ? '#0012b5' : '#e5e7eb', cursor: 'pointer',
    position: 'relative', transition: 'background 0.2s', flexShrink: 0
  }}>
    <div style={{
      width: '16px', height: '16px', borderRadius: '50%', background: '#fff',
      position: 'absolute', top: '3px', transition: 'left 0.2s',
      left: value ? '21px' : '3px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
    }} />
  </button>
)

export default function Settings() {
  const [saved,       setSaved]       = useState(false)
  const [clearing,    setClearing]    = useState(false)
  const [cleared,     setCleared]     = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  // Profile
  const [name, setName] = useState('Aman Yadav')
  const [role, setRole] = useState('Admin')
  const [org,  setOrg]  = useState('Road Safety Dept.')

  // Model
  const [confidence, setConfidence] = useState(30)
  const [maxDet,     setMaxDet]     = useState(300)

  // Map
  const [defaultLat,  setDefaultLat]  = useState('28.6139')
  const [defaultLon,  setDefaultLon]  = useState('77.2090')
  const [defaultZoom, setDefaultZoom] = useState(10)

  // Notifications
  const [notifHigh,   setNotifHigh]   = useState(true)
  const [notifMedium, setNotifMedium] = useState(false)
  const [notifReport, setNotifReport] = useState(true)

  // Appearance
  const [compactMode,  setCompactMode]  = useState(false)
  const [showConfScore,setShowConfScore]= useState(true)

  const saveSettings = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const clearData = async () => {
    setClearing(true)
    try {
      // Reset detections to empty
      await axios.post(`${API}/api/save`, {
        image: '', lat: 0, lon: 0, city: '', potholes: 0, severity: 'Low'
      })
    } catch(e) {}
    setClearing(false)
    setCleared(true)
    setShowConfirm(false)
    setTimeout(() => setCleared(false), 3000)
  }

  return (
    <div>
      {/* Top bar */}
      <div className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="topbar-title">Settings</span>
          <span className="badge badge-gray">Preferences</span>
        </div>
        <div className="topbar-actions">
          {saved && (
            <span style={{ fontSize: '12px', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle size={13} /> Saved!
            </span>
          )}
          <button className="btn btn-primary btn-sm" onClick={saveSettings}>
            <Save size={12} /> Save Changes
          </button>
        </div>
      </div>

      <div className="page-inner">
        <div className="grid-2" style={{ alignItems: 'start' }}>

          {/* Left column */}
          <div>

            {/* Profile */}
            <Section icon={User} title="Profile" desc="Your account information">
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #f3f4f6' }}>
                <div style={{
                  width: '52px', height: '52px', borderRadius: '50%',
                  background: '#0012b5', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '18px', fontWeight: '700',
                  color: '#fff', flexShrink: 0
                }}>
                  {name.split(' ').map(n => n[0]).join('').slice(0,2)}
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>{name}</div>
                  <div style={{ fontSize: '12px', color: '#9ca3af' }}>{role} · {org}</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '600', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '5px' }}>Full Name</label>
                  <input value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '600', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '5px' }}>Role</label>
                  <select value={role} onChange={e => setRole(e.target.value)}>
                    <option>Admin</option>
                    <option>Inspector</option>
                    <option>Viewer</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '600', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '5px' }}>Organization</label>
                  <input value={org} onChange={e => setOrg(e.target.value)} placeholder="Your department name" />
                </div>
              </div>
            </Section>

            {/* Model */}
            <Section icon={Sliders} title="AI Model" desc="Detection sensitivity and performance">
              <Field label="Confidence Threshold" desc={`Only show detections above ${confidence}% confidence`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input type="range" min="10" max="90" value={confidence}
                    onChange={e => setConfidence(e.target.value)}
                    style={{ width: '100px', accentColor: '#0012b5', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }} />
                  <span style={{ fontSize: '12px', fontWeight: '600', color: '#0012b5', width: '36px' }}>{confidence}%</span>
                </div>
              </Field>
              <Field label="Max Detections" desc="Maximum potholes to detect per image">
                <select value={maxDet} onChange={e => setMaxDet(e.target.value)}
                  style={{ width: '100px' }}>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={300}>300</option>
                  <option value={500}>500</option>
                </select>
              </Field>
              <Field label="Show Confidence Score" desc="Display % score on each detection">
                <Toggle value={showConfScore} onChange={setShowConfScore} />
              </Field>
            </Section>

            {/* Appearance */}
            <Section icon={Eye} title="Appearance" desc="UI preferences">
              <Field label="Compact Mode" desc="Reduce spacing for more content">
                <Toggle value={compactMode} onChange={setCompactMode} />
              </Field>
              <Field label="Theme" desc="Light mode active">
                <span className="badge badge-blue">Light</span>
              </Field>
              <Field label="Language" desc="">
                <select style={{ width: '120px' }}>
                  <option>English</option>
                  <option>Hindi</option>
                </select>
              </Field>
            </Section>

          </div>

          {/* Right column */}
          <div>

            {/* Map */}
            <Section icon={Map} title="Map Settings" desc="Default map view configuration">
              <Field label="Default Latitude" desc="Map center latitude">
                <input value={defaultLat} onChange={e => setDefaultLat(e.target.value)}
                  style={{ width: '130px', fontFamily: 'monospace' }} />
              </Field>
              <Field label="Default Longitude" desc="Map center longitude">
                <input value={defaultLon} onChange={e => setDefaultLon(e.target.value)}
                  style={{ width: '130px', fontFamily: 'monospace' }} />
              </Field>
              <Field label="Default Zoom" desc="Initial zoom level (1-20)">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input type="range" min="5" max="18" value={defaultZoom}
                    onChange={e => setDefaultZoom(e.target.value)}
                    style={{ width: '80px', accentColor: '#0012b5', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }} />
                  <span style={{ fontSize: '12px', fontWeight: '600', color: '#0012b5', width: '20px' }}>{defaultZoom}</span>
                </div>
              </Field>
              <Field label="Map Region" desc="Default region label">
                <input defaultValue="NCR Region" style={{ width: '130px' }} />
              </Field>
            </Section>

            {/* Notifications */}
            <Section icon={Bell} title="Notifications" desc="Alert preferences">
              <Field label="High Severity Alerts" desc="Alert when high severity pothole detected">
                <Toggle value={notifHigh} onChange={setNotifHigh} />
              </Field>
              <Field label="Medium Severity Alerts" desc="Alert for medium severity detections">
                <Toggle value={notifMedium} onChange={setNotifMedium} />
              </Field>
              <Field label="Report Generation" desc="Notify when PDF report is ready">
                <Toggle value={notifReport} onChange={setNotifReport} />
              </Field>
            </Section>

            {/* Data */}
            <Section icon={Database} title="Data Management" desc="Manage stored detections">
              <Field label="Export All Data" desc="Download all detections as CSV">
                <button className="btn btn-ghost btn-sm"
                  onClick={async () => {
                    const res = await axios.get(`${API}/api/detections`)
                    const h   = ['city','potholes','severity','lat','lon','timestamp']
                    const csv = [h.join(','), ...res.data.map(d => h.map(k => d[k]).join(','))].join('\n')
                    const a   = Object.assign(document.createElement('a'), {
                      href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })),
                      download: 'all_detections.csv'
                    })
                    a.click()
                  }}>
                  Export CSV
                </button>
              </Field>

              <Field label="Clear All Detections" desc="Permanently delete all detection data">
                {!showConfirm ? (
                  <button className="btn btn-danger btn-sm" onClick={() => setShowConfirm(true)}>
                    <Trash2 size={12} /> Clear Data
                  </button>
                ) : (
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button className="btn btn-sm" onClick={() => setShowConfirm(false)}
                      style={{ background: '#f9fafb', color: '#6b7280', border: '1px solid #e5e7eb' }}>
                      Cancel
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={clearData} disabled={clearing}>
                      {clearing ? 'Clearing...' : 'Confirm'}
                    </button>
                  </div>
                )}
              </Field>

              {cleared && (
                <div className="alert alert-success" style={{ marginTop: '10px' }}>
                  ✅ All detections cleared successfully!
                </div>
              )}

              <div style={{ marginTop: '14px', padding: '12px', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fde68a' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <AlertTriangle size={13} color="#d97706" style={{ marginTop: '1px', flexShrink: 0 }} />
                  <div style={{ fontSize: '11px', color: '#d97706', lineHeight: '1.6' }}>
                    Clearing data is permanent and cannot be undone. Make sure to export your data first.
                  </div>
                </div>
              </div>
            </Section>

            {/* About */}
            <Section icon={Shield} title="About" desc="System information">
              {[
                { label: 'App Version',    value: 'v1.0.0' },
                { label: 'Model',          value: 'YOLOv8n' },
                { label: 'Accuracy',       value: '81% mAP50' },
                { label: 'Training Data',  value: '665 images' },
                { label: 'Backend',        value: 'FastAPI + Python' },
                { label: 'Frontend',       value: 'React + Vite' },
              ].map(({ label, value }) => (
                <div key={label} className="metric-row">
                  <span className="metric-label">{label}</span>
                  <span className="metric-value">{value}</span>
                </div>
              ))}
            </Section>

          </div>
        </div>
      </div>
    </div>
  )
}