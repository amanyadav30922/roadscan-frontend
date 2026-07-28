import { useNavigate } from 'react-router-dom'
import {
  MapPin, Camera, FileText, Shield,
  TrendingUp, Globe, ChevronRight,
  Video, BarChart2, Map, Zap
} from 'lucide-react'

export default function Landing() {
  const nav = useNavigate()

  const features = [
    { icon: Camera,   title: 'AI Image Detection',    desc: 'Upload any road photo — YOLOv8 detects potholes instantly with 81% accuracy',         color: '#0012b5' },
    { icon: Video,    title: 'Video Analysis',         desc: 'Process dashcam footage frame by frame — detect potholes across entire routes',          color: '#7c3aed' },
    { icon: MapPin,   title: 'GPS Auto-Tagging',       desc: 'GPS coordinates extracted automatically from photos — no manual input needed',            color: '#dc2626' },
    { icon: Map,      title: 'Live Heatmap',           desc: 'Interactive map shows pothole hotspots across all of India in real time',                 color: '#d97706' },
    { icon: BarChart2,title: 'Smart Analytics',        desc: 'Dashboard with charts, severity breakdown, city rankings and repair tracking',             color: '#16a34a' },
    { icon: FileText, title: 'PDF Reports',            desc: 'Auto-generate professional reports for municipal authorities with one click',              color: '#0891b2' },
  ]

  const stats = [
    { value: '81%',   label: 'Detection Accuracy' },
    { value: '42+',   label: 'Indian Cities' },
    { value: '665',   label: 'Training Images' },
    { value: '1fps',  label: 'Video Processing' },
  ]

  const steps = [
    { step: '01', title: 'Upload',   desc: 'Take a photo or upload dashcam video of any road',              icon: Camera   },
    { step: '02', title: 'Detect',   desc: 'AI analyzes and detects potholes with bounding boxes',           icon: Zap      },
    { step: '03', title: 'Map',      desc: 'GPS coordinates auto-extracted and plotted on live map',          icon: MapPin   },
    { step: '04', title: 'Report',   desc: 'Generate PDF report and submit to municipal authorities',         icon: FileText },
  ]

  return (
    <div style={{ background: '#fff', minHeight: '100vh', fontFamily: 'Poppins, sans-serif', overflowY: 'auto' }}>

      {/* ── Navbar ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #e5e7eb', padding: '0 40px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: '60px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: '#0012b5', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '16px'
          }}>🕳️</div>
          <span style={{ fontSize: '16px', fontWeight: '700', color: '#111827' }}>Pothole AI</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={() => nav('/login')}
            style={{ padding: '7px 16px', background: 'transparent', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', fontWeight: '500', color: '#374151', cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}>
            Sign In
          </button>
          <button onClick={() => nav('/dashboard')}
            style={{ padding: '7px 16px', background: '#0012b5', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', color: '#fff', cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}>
            Get Started →
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <div style={{
        padding: '80px 40px 60px', textAlign: 'center',
        background: 'linear-gradient(180deg, #f0f4ff 0%, #fff 100%)',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          background: '#eff6ff', border: '1px solid #bfdbfe',
          borderRadius: '20px', padding: '4px 14px', marginBottom: '24px'
        }}>
          <Zap size={12} color="#0012b5" />
          <span style={{ fontSize: '12px', fontWeight: '600', color: '#0012b5' }}>
            Powered by YOLOv8 AI · 81% Accuracy
          </span>
        </div>

        <h1 style={{
          fontSize: '52px', fontWeight: '700', color: '#111827',
          letterSpacing: '-1px', lineHeight: 1.1, marginBottom: '20px',
          maxWidth: '700px', margin: '0 auto 20px'
        }}>
          AI-Powered<br />
          <span style={{ color: '#0012b5' }}>Pothole Detection</span><br />
          for India's Roads
        </h1>

        <p style={{
          fontSize: '16px', color: '#6b7280', maxWidth: '520px',
          margin: '0 auto 36px', lineHeight: '1.7'
        }}>
          Upload road photos or dashcam videos. Our AI detects potholes instantly,
          maps them with GPS, and generates reports for municipal authorities.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => nav('/detect')} style={{
            padding: '13px 28px', background: '#0012b5', border: 'none',
            borderRadius: '10px', fontSize: '14px', fontWeight: '600',
            color: '#fff', cursor: 'pointer', fontFamily: 'Poppins, sans-serif',
            display: 'flex', alignItems: 'center', gap: '7px',
            boxShadow: '0 4px 14px rgba(0,18,181,0.3)'
          }}>
            <Camera size={16} /> Try Detection Free
          </button>
          <button onClick={() => nav('/map')} style={{
            padding: '13px 28px', background: '#fff', border: '1px solid #e5e7eb',
            borderRadius: '10px', fontSize: '14px', fontWeight: '600',
            color: '#374151', cursor: 'pointer', fontFamily: 'Poppins, sans-serif',
            display: 'flex', alignItems: 'center', gap: '7px'
          }}>
            <Map size={16} /> View Live Map
          </button>
        </div>

        {/* Hero image placeholder */}
        <div style={{
          maxWidth: '800px', margin: '48px auto 0',
          background: '#f8faff', border: '1px solid #e5e7eb',
          borderRadius: '16px', padding: '32px',
          boxShadow: '0 20px 60px rgba(0,18,181,0.08)'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px' }}>
            {stats.map(({ value, label }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#0012b5' }}>{value}</div>
                <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── How it works ── */}
      <div style={{ padding: '72px 40px', background: '#fff' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#0012b5', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>
            HOW IT WORKS
          </div>
          <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', letterSpacing: '-0.5px' }}>
            From photo to report in 4 steps
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '24px', maxWidth: '900px', margin: '0 auto' }}>
          {steps.map(({ step, title, desc, icon: Icon }, i) => (
            <div key={step} style={{ textAlign: 'center', position: 'relative' }}>
              {i < steps.length - 1 && (
                <div style={{
                  position: 'absolute', top: '20px', right: '-12px',
                  color: '#d1d5db', fontSize: '18px', fontWeight: '300'
                }}>→</div>
              )}
              <div style={{
                width: '44px', height: '44px', borderRadius: '12px',
                background: '#eff6ff', display: 'flex', alignItems: 'center',
                justifyContent: 'center', margin: '0 auto 14px'
              }}>
                <Icon size={20} color="#0012b5" />
              </div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#0012b5', marginBottom: '6px' }}>
                STEP {step}
              </div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '6px' }}>{title}</div>
              <div style={{ fontSize: '12px', color: '#9ca3af', lineHeight: '1.6' }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Features ── */}
      <div style={{ padding: '72px 40px', background: '#f9fafb' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#0012b5', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>
            FEATURES
          </div>
          <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', letterSpacing: '-0.5px' }}>
            Everything you need to fix roads
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px', maxWidth: '900px', margin: '0 auto' }}>
          {features.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} style={{
              background: '#fff', border: '1px solid #e5e7eb',
              borderRadius: '12px', padding: '22px',
              transition: 'all 0.2s', cursor: 'default'
            }}
              onMouseOver={e => {
                e.currentTarget.style.borderColor = color
                e.currentTarget.style.boxShadow = `0 4px 20px ${color}18`
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseOut={e => {
                e.currentTarget.style.borderColor = '#e5e7eb'
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.transform = 'none'
              }}
            >
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px',
                background: `${color}12`, display: 'flex',
                alignItems: 'center', justifyContent: 'center', marginBottom: '14px'
              }}>
                <Icon size={18} color={color} />
              </div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '6px' }}>{title}</div>
              <div style={{ fontSize: '12px', color: '#9ca3af', lineHeight: '1.7' }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── India coverage ── */}
      <div style={{ padding: '72px 40px', background: '#fff', textAlign: 'center' }}>
        <div style={{ fontSize: '12px', fontWeight: '700', color: '#0012b5', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>
          COVERAGE
        </div>
        <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', letterSpacing: '-0.5px', marginBottom: '14px' }}>
          Built for India 🇮🇳
        </h2>
        <p style={{ fontSize: '14px', color: '#9ca3af', maxWidth: '480px', margin: '0 auto 40px', lineHeight: '1.7' }}>
          Covering 42+ cities across North, South, East, West and Central India.
          From Delhi to Mumbai, Bangalore to Kolkata.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', maxWidth: '600px', margin: '0 auto' }}>
          {['New Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad',
            'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Meerut', 'Noida',
            'Gurgaon', 'Faridabad', 'Agra', 'Varanasi', 'Patna', 'Bhopal'].map(city => (
            <span key={city} style={{
              padding: '5px 12px', background: '#eff6ff', border: '1px solid #bfdbfe',
              borderRadius: '20px', fontSize: '12px', color: '#0012b5', fontWeight: '500'
            }}>{city}</span>
          ))}
          <span style={{
            padding: '5px 12px', background: '#f3f4f6', border: '1px solid #e5e7eb',
            borderRadius: '20px', fontSize: '12px', color: '#9ca3af', fontWeight: '500'
          }}>+24 more cities</span>
        </div>
      </div>

      {/* ── CTA ── */}
      <div style={{
        padding: '72px 40px', textAlign: 'center',
        background: 'linear-gradient(135deg, #0012b5 0%, #1e40af 100%)',
      }}>
        <h2 style={{ fontSize: '36px', fontWeight: '700', color: '#fff', letterSpacing: '-0.5px', marginBottom: '14px' }}>
          Ready to fix India's roads?
        </h2>
        <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', marginBottom: '36px' }}>
          Start detecting potholes for free. No signup required.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button onClick={() => nav('/detect')} style={{
            padding: '13px 28px', background: '#fff', border: 'none',
            borderRadius: '10px', fontSize: '14px', fontWeight: '600',
            color: '#0012b5', cursor: 'pointer', fontFamily: 'Poppins, sans-serif',
            display: 'flex', alignItems: 'center', gap: '7px'
          }}>
            <Camera size={16} /> Start Detecting
          </button>
          <button onClick={() => nav('/dashboard')} style={{
            padding: '13px 28px', background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '10px', fontSize: '14px', fontWeight: '600',
            color: '#fff', cursor: 'pointer', fontFamily: 'Poppins, sans-serif',
            display: 'flex', alignItems: 'center', gap: '7px'
          }}>
            <BarChart2 size={16} /> View Dashboard
          </button>
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{
        padding: '24px 40px', background: '#111827',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '24px', height: '24px', borderRadius: '6px',
            background: '#0012b5', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '12px'
          }}>🕳️</div>
          <span style={{ fontSize: '13px', fontWeight: '600', color: '#fff' }}>Pothole AI</span>
        </div>
        <div style={{ fontSize: '12px', color: '#6b7280' }}>
          Built with YOLOv8 · FastAPI · React · Made in India 🇮🇳
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
         {[
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Live Map',  path: '/map'       },
  { label: 'Detect',    path: '/detect'    },
  { label: 'Reports',   path: '/report'    },
].map(({ label, path }) => (
  <button key={label} onClick={() => nav(path)}
    style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: '12px', cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}>
    {label}
  </button>
))}
        </div>
      </div>

    </div>
  )
}