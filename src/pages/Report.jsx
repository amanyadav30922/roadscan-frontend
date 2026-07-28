import { useState, useEffect } from 'react'
import axios from 'axios'
import {
  FileText, Download, Mail, Send, CheckCircle,
  Shield, MapPin, BarChart2, List, Cpu,
  AlertTriangle, Layers, Target, Clock
} from 'lucide-react'

const API = 'https://roadscan-backend.onrender.com'

export default function Report() {
  const [loading,  setLoading]  = useState(false)
  const [email,    setEmail]    = useState('')
  const [sent,     setSent]     = useState(false)
  const [stats,    setStats]    = useState(null)

  useEffect(() => {
    axios.get(`${API}/api/stats`).then(r => setStats(r.data))
  }, [])

  const downloadPDF = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${API}/api/report/pdf`, { responseType: 'blob' })
      const a   = Object.assign(document.createElement('a'), {
        href:     URL.createObjectURL(new Blob([res.data])),
        download: `pothole_report_${new Date().toISOString().slice(0,10)}.pdf`
      })
      a.click()
    } catch(e) { console.error(e) }
    setLoading(false)
  }

  const features = [
    { icon: BarChart2, label: 'Summary Statistics',     desc: 'Total locations, potholes, severity breakdown',    color: '#0012b5' },
    { icon: MapPin,    label: 'GPS Coordinates',         desc: 'Exact lat/lon for every single detection',         color: '#dc2626' },
    { icon: Shield,    label: 'Top 10 Worst Locations',  desc: 'Ranked by number of potholes detected',            color: '#d97706' },
    { icon: List,      label: 'Full Detection Table',    desc: 'All locations with timestamps and coordinates',    color: '#16a34a' },
    { icon: Cpu,       label: 'AI Confidence Scores',    desc: 'Model confidence percentage for each detection',   color: '#7c3aed' },
    { icon: Clock,     label: 'Detection Timeline',      desc: 'When each pothole was detected and reported',      color: '#0891b2' },
  ]

  return (
    <div>
      {/* Top bar */}
      <div className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="topbar-title">Reports</span>
          <span className="badge badge-blue">PDF + Email</span>
        </div>
        <div className="topbar-actions">
          <button className="btn btn-primary btn-sm" onClick={downloadPDF} disabled={loading}>
            {loading ? <><div className="spinner" /> Generating...</> : <><Download size={12} /> Quick Download</>}
          </button>
        </div>
      </div>

      <div className="page-inner">

        {/* ── Stats preview ── */}
        {stats && (
          <div style={{
            background: '#eff6ff', border: '1px solid #bfdbfe',
            borderRadius: '12px', padding: '16px 20px',
            marginBottom: '20px', display: 'flex',
            alignItems: 'center', gap: '32px', flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={16} color="#0012b5" />
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#0012b5' }}>
                Report Preview
              </span>
            </div>
            {[
              { label: 'Locations',  value: stats.total_locations, color: '#0012b5' },
              { label: 'Potholes',   value: stats.total_potholes,  color: '#dc2626' },
              { label: 'High Risk',  value: stats.high,            color: '#d97706' },
              { label: 'Accuracy',   value: '81%',                 color: '#16a34a' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: '700', color }}>{value}</div>
                <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>{label}</div>
              </div>
            ))}
            <div style={{ marginLeft: 'auto', fontSize: '11px', color: '#9ca3af' }}>
              Generated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
        )}

        {/* ── Main cards ── */}
        <div className="grid-2">

          {/* PDF Card */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">PDF Report</span>
              <span className="badge badge-gray">Instant Download</span>
            </div>
            <div className="card-body">
              <div style={{
                display: 'flex', alignItems: 'center', gap: '16px',
                padding: '16px', background: '#f9fafb', borderRadius: '10px',
                border: '1px solid #f3f4f6', marginBottom: '16px'
              }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '12px',
                  background: '#eff6ff', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  <FileText size={22} color="#0012b5" />
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '3px' }}>
                    Pothole Detection Report
                  </div>
                  <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                    Professional PDF · Auto-generated · Ready to submit
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                {[
                  '✅ All GPS coordinates included',
                  '✅ Severity color coded',
                  '✅ Top 10 worst locations highlighted',
                  '✅ Ready to submit to authorities',
                ].map(t => (
                  <div key={t} style={{ fontSize: '12px', color: '#6b7280' }}>{t}</div>
                ))}
              </div>

              <button className="btn btn-primary btn-full" onClick={downloadPDF}
                disabled={loading} style={{ padding: '12px', fontSize: '13px' }}>
                {loading
                  ? <><div className="spinner" /> Generating PDF...</>
                  : <><Download size={15} /> Download PDF Report</>}
              </button>
            </div>
          </div>

          {/* Email Card */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Email to Municipality</span>
              <span className="badge badge-gray">Coming Soon</span>
            </div>
            <div className="card-body">
              <div style={{
                display: 'flex', alignItems: 'center', gap: '16px',
                padding: '16px', background: '#f9fafb', borderRadius: '10px',
                border: '1px solid #f3f4f6', marginBottom: '16px'
              }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '12px',
                  background: '#f0fdf4', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  <Mail size={22} color="#16a34a" />
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '3px' }}>
                    Auto Email Report
                  </div>
                  <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                    Send PDF directly to municipal authority
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '11px', fontWeight: '600', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                  Municipality Email
                </label>
                <input
                  placeholder="municipality@gov.in"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setSent(false) }}
                  type="email"
                />
              </div>

              <button
                className="btn btn-full"
                disabled={!email || sent}
                style={{
                  padding: '12px', fontSize: '13px',
                  background: sent ? '#f0fdf4' : email ? '#16a34a' : '#f9fafb',
                  color: sent ? '#16a34a' : email ? '#fff' : '#d1d5db',
                  border: sent ? '1px solid #bbf7d0' : 'none',
                  justifyContent: 'center',
                }}>
                {sent
                  ? <><CheckCircle size={15} /> Report Sent!</>
                  : <><Send size={15} /> Send Report</>}
              </button>

              {sent && (
                <div className="alert alert-success" style={{ marginTop: '10px' }}>
                  ✅ Report successfully sent to {email}
                </div>
              )}

              <div className="alert alert-info" style={{ marginTop: '12px', fontSize: '11px' }}>
                ℹ️ Email feature requires Gmail setup. Download PDF and attach manually for now.
              </div>
            </div>
          </div>
        </div>

        {/* ── Report includes ── */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">What's Included in the Report</span>
            <span className="badge badge-blue">Professional Grade</span>
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {features.map(({ icon: Icon, label, desc, color }) => (
                <div key={label} style={{
                  display: 'flex', alignItems: 'flex-start', gap: '12px',
                  padding: '14px', background: '#f9fafb', borderRadius: '10px',
                  border: '1px solid #f3f4f6', transition: 'border-color 0.15s'
                }}
                  onMouseOver={e => e.currentTarget.style.borderColor = '#e5e7eb'}
                  onMouseOut={e => e.currentTarget.style.borderColor = '#f3f4f6'}
                >
                  <div style={{
                    width: '34px', height: '34px', borderRadius: '8px', flexShrink: 0,
                    background: `${color}12`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Icon size={15} color={color} />
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#111827', marginBottom: '3px' }}>
                      {label}
                    </div>
                    <div style={{ fontSize: '11px', color: '#9ca3af', lineHeight: '1.5' }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── How to submit ── */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">How to Submit to Authorities</span>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', gap: '0', position: 'relative' }}>
              {[
                { step: '1', title: 'Download PDF',      desc: 'Click the download button above to get the report', color: '#0012b5' },
                { step: '2', title: 'Review Report',     desc: 'Check all detected potholes and their GPS locations', color: '#d97706' },
                { step: '3', title: 'Submit to PWD',     desc: 'Send to Public Works Department or local municipality', color: '#16a34a' },
                { step: '4', title: 'Track Repairs',     desc: 'Follow up using the GPS coordinates in the report', color: '#7c3aed' },
              ].map(({ step, title, desc, color }, i, arr) => (
                <div key={step} style={{ flex: 1, textAlign: 'center', padding: '0 12px', position: 'relative' }}>
                  {i < arr.length - 1 && (
                    <div style={{
                      position: 'absolute', top: '17px', right: '-1px',
                      width: '50%', height: '2px', background: '#f3f4f6', zIndex: 0
                    }} />
                  )}
                  {i > 0 && (
                    <div style={{
                      position: 'absolute', top: '17px', left: '-1px',
                      width: '50%', height: '2px', background: '#f3f4f6', zIndex: 0
                    }} />
                  )}
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: color, color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '14px', fontWeight: '700', margin: '0 auto 10px',
                    position: 'relative', zIndex: 1
                  }}>{step}</div>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>{title}</div>
                  <div style={{ fontSize: '11px', color: '#9ca3af', lineHeight: '1.5' }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}