import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, Mail, Zap } from 'lucide-react'

const USERS = [
  { email: 'admin@roadscan.ai',    password: 'admin123',    name: 'Aman Yadav',   role: 'Admin'     },
  { email: 'inspector@roadscan.ai',password: 'inspect123',  name: 'Road Inspector', role: 'Inspector' },
  { email: 'demo@roadscan.ai',     password: 'demo123',     name: 'Demo User',    role: 'Viewer'    },
]

export default function Login() {
  const nav = useNavigate()
  const [email,     setEmail]     = useState('')
  const [password,  setPassword]  = useState('')
  const [showPass,  setShowPass]  = useState(false)
  const [remember,  setRemember]  = useState(false)
  const [error,     setError]     = useState('')
  const [loading,   setLoading]   = useState(false)

  const login = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)

    await new Promise(r => setTimeout(r, 800))

    const user = USERS.find(u => u.email === email && u.password === password)

    if (user) {
      const storage = remember ? localStorage : sessionStorage
      storage.setItem('user', JSON.stringify(user))
      nav('/dashboard')
    } else {
      setError('Invalid email or password. Try demo@roadscan.ai / demo123')
    }
    setLoading(false)
  }

  const loginAsDemo = () => {
    setEmail('demo@roadscan.ai')
    setPassword('demo123')
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(135deg, #f0f4ff 0%, #fff 60%)',
      display: 'flex', fontFamily: 'Poppins, sans-serif'
    }}>

      {/* ── Left panel ── */}
      <div style={{
        flex: 1, background: 'linear-gradient(135deg, #0012b5 0%, #1e40af 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '60px', color: '#fff'
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '10px',
            background: 'rgba(255,255,255,0.15)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', fontSize: '20px'
          }}>🕳️</div>
          <span style={{ fontSize: '20px', fontWeight: '700' }}>Pothole AI</span>
        </div>

        <h1 style={{ fontSize: '36px', fontWeight: '700', lineHeight: 1.2, marginBottom: '16px', letterSpacing: '-0.5px' }}>
          AI-Powered<br />Road Safety System
        </h1>
        <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.7', marginBottom: '48px', maxWidth: '360px' }}>
          Detect potholes, map locations, track repairs and generate reports — all powered by YOLOv8 AI.
        </p>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', maxWidth: '360px' }}>
          {[
            { value: '81%',  label: 'Detection Accuracy' },
            { value: '42+',  label: 'Indian Cities'       },
            { value: '665',  label: 'Training Images'     },
            { value: '100%', label: 'Free to Use'         },
          ].map(({ value, label }) => (
            <div key={label} style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '10px', padding: '14px'
            }}>
              <div style={{ fontSize: '22px', fontWeight: '700', marginBottom: '3px' }}>{value}</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel ── */}
      <div style={{
        width: '480px', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '60px 48px', background: '#fff',
        boxShadow: '-20px 0 60px rgba(0,0,0,0.06)'
      }}>

        <div style={{ marginBottom: '36px' }}>
          <h2 style={{ fontSize: '26px', fontWeight: '700', color: '#111827', marginBottom: '6px', letterSpacing: '-0.3px' }}>
            Welcome back 👋
          </h2>
          <p style={{ fontSize: '13px', color: '#9ca3af' }}>
            Sign in to access the dashboard
          </p>
        </div>

        {/* Demo credentials hint */}
        <div style={{
          background: '#eff6ff', border: '1px solid #bfdbfe',
          borderRadius: '8px', padding: '10px 14px', marginBottom: '24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: '600', color: '#0012b5', marginBottom: '2px' }}>
              🚀 Try Demo Account
            </div>
            <div style={{ fontSize: '11px', color: '#3b82f6' }}>demo@roadscan.ai / demo123</div>
          </div>
          <button onClick={loginAsDemo} style={{
            padding: '5px 12px', background: '#0012b5', border: 'none',
            borderRadius: '6px', fontSize: '11px', fontWeight: '600',
            color: '#fff', cursor: 'pointer', fontFamily: 'Poppins, sans-serif'
          }}>
            Auto Fill
          </button>
        </div>

        {/* Form */}
        <form onSubmit={login}>
          {/* Email */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input
                type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                style={{ paddingLeft: '36px', height: '44px' }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                style={{ paddingLeft: '36px', paddingRight: '40px', height: '44px' }}
              />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{
                position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', padding: '2px'
              }}>
                {showPass ? <EyeOff size={14} color="#9ca3af" /> : <Eye size={14} color="#9ca3af" />}
              </button>
            </div>
          </div>

          {/* Remember me */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}
                style={{ width: 'auto', accentColor: '#0012b5', cursor: 'pointer' }} />
              <span style={{ fontSize: '12px', color: '#6b7280' }}>Remember me</span>
            </label>
            <button type="button" style={{
              background: 'none', border: 'none', fontSize: '12px',
              color: '#0012b5', cursor: 'pointer', fontFamily: 'Poppins, sans-serif', fontWeight: '500'
            }}>
              Forgot password?
            </button>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca',
              borderRadius: '8px', padding: '10px 14px', marginBottom: '16px',
              fontSize: '12px', color: '#dc2626'
            }}>
              ❌ {error}
            </div>
          )}

          {/* Submit */}
          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '13px', background: '#0012b5',
            border: 'none', borderRadius: '10px', fontSize: '14px',
            fontWeight: '600', color: '#fff', cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'Poppins, sans-serif', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '8px', opacity: loading ? 0.7 : 1,
            boxShadow: '0 4px 14px rgba(0,18,181,0.3)', transition: 'all 0.15s'
          }}>
            {loading
              ? <><div className="spinner" /> Signing in...</>
              : <><Zap size={15} /> Sign In to Dashboard</>}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '24px 0' }}>
          <div style={{ flex: 1, height: '1px', background: '#f3f4f6' }} />
          <span style={{ fontSize: '12px', color: '#d1d5db' }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: '#f3f4f6' }} />
        </div>

        {/* Quick access accounts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {USERS.map(u => (
            <button key={u.email} onClick={() => {
              sessionStorage.setItem('user', JSON.stringify(u))
              nav('/dashboard')
            }} style={{
              padding: '10px 14px', background: '#f9fafb',
              border: '1px solid #e5e7eb', borderRadius: '8px',
              display: 'flex', alignItems: 'center', gap: '10px',
              cursor: 'pointer', fontFamily: 'Poppins, sans-serif',
              transition: 'all 0.15s', textAlign: 'left'
            }}
              onMouseOver={e => { e.currentTarget.style.borderColor = '#0012b5'; e.currentTarget.style.background = '#eff6ff' }}
              onMouseOut={e  => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = '#f9fafb' }}
            >
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: '#0012b5', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '11px', fontWeight: '700',
                color: '#fff', flexShrink: 0
              }}>
                {u.name.split(' ').map(n => n[0]).join('').slice(0,2)}
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#111827' }}>{u.name}</div>
                <div style={{ fontSize: '11px', color: '#9ca3af' }}>{u.role} · {u.email}</div>
              </div>
              <div style={{ marginLeft: 'auto', fontSize: '11px', color: '#0012b5', fontWeight: '500' }}>
                Quick Login →
              </div>
            </button>
          ))}
        </div>

        {/* Back to landing */}
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <button onClick={() => nav('/')} style={{
            background: 'none', border: 'none', fontSize: '12px',
            color: '#9ca3af', cursor: 'pointer', fontFamily: 'Poppins, sans-serif'
          }}>
            ← Back to home
          </button>
        </div>
      </div>
    </div>
  )
}