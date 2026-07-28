import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Map, Camera, Table2, FileText, Settings, Trophy , Video} from 'lucide-react'
import { getUser, logout } from '../hooks/useAuth'

const nav = [
  { section: 'Overview' },
  { path: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/map',         icon: Map,             label: 'Live Map', badge: '133' },
  { section: 'Tools' },
  { path: '/detect',      icon: Camera,          label: 'Detect' },
  { path: '/video',       icon: Video,           label: 'Video Detect', badge: 'New' },
  { path: '/data',        icon: Table2,          label: 'Data' },
  { section: 'Reports' },
  { path: '/leaderboard', icon: Trophy,          label: 'Leaderboard' },
  { path: '/report',      icon: FileText,        label: 'Reports' },
  { section: 'System' },
  { path: '/settings',    icon: Settings,        label: 'Settings' },
]

export default function Sidebar() {
  const user = getUser()
  return (
    <div style={{
      width: '210px', background: '#ffffff',
      borderRight: '1px solid #e5e7eb',
      display: 'flex', flexDirection: 'column',
      height: '100vh', flexShrink: 0, position: 'sticky', top: 0,
      boxShadow: '1px 0 4px rgba(0,0,0,0.04)',
    }}>

      {/* Logo */}
      <div style={{ padding: '18px 16px', borderBottom: '1px solid #f3f4f6' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: '#0012b5',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '15px', flexShrink: 0,
            boxShadow: '0 2px 8px rgba(0,18,181,0.3)'
          }}>🕳️</div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#111827', lineHeight: 1 }}>Pothole AI</div>
            <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '3px' }}>Road Safety System</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto' }}>
        {nav.map((item, i) => {
          if (item.section) return (
            <div key={i} style={{
              fontSize: '10px', color: '#d1d5db', fontWeight: '700',
              letterSpacing: '0.08em', textTransform: 'uppercase',
              padding: '12px 8px 4px',
            }}>{item.section}</div>
          )
          return (
            <NavLink key={item.path} to={item.path} end={item.path === '/'}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '9px',
                padding: '7px 10px', borderRadius: '8px', fontSize: '12px',
                textDecoration: 'none', marginBottom: '2px', transition: 'all 0.12s',
                color: isActive ? '#0012b5' : '#6b7280',
                background: isActive ? 'rgba(0,18,181,0.06)' : 'transparent',
                fontWeight: isActive ? '600' : '400',
                border: isActive ? '1px solid rgba(0,18,181,0.12)' : '1px solid transparent',
              })}
            >
              {({ isActive }) => (<>
                <item.icon size={14} color={isActive ? '#0012b5' : '#9ca3af'} strokeWidth={isActive ? 2 : 1.5} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge && (
                  <span style={{
                    fontSize: '10px', background: '#0012b5',
                    color: '#fff', padding: '1px 6px',
                    borderRadius: '10px', fontWeight: '700'
                  }}>{item.badge}</span>
                )}
              </>)}
            </NavLink>
          )
        })}
      </nav>

      {/* Footer */}
    
<div style={{ padding: '12px 14px', borderTop: '1px solid #e5e7eb' }}>
  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
    <span className="status-dot status-online" />
    <span style={{ fontSize: '11px', color: '#9ca3af' }}>API Connected</span>
  </div>
  <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '8px' }}>
    <div style={{
      width: '28px', height: '28px', borderRadius: '50%',
      background: '#0012b5', display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontSize: '10px', fontWeight: '700',
      color: '#fff', flexShrink: 0
    }}>
      {user?.name?.split(' ').map(n => n[0]).join('').slice(0,2) || 'AY'}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: '11px', color: '#374151', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {user?.name || 'Aman Yadav'}
      </div>
      <div style={{ fontSize: '10px', color: '#9ca3af' }}>{user?.role || 'Admin'}</div>
    </div>
  </div>
  <button onClick={logout} style={{
    width: '100%', padding: '6px', background: '#fef2f2',
    border: '1px solid #fecaca', borderRadius: '6px',
    fontSize: '11px', fontWeight: '500', color: '#dc2626',
    cursor: 'pointer', fontFamily: 'Poppins, sans-serif'
  }}>
    Sign Out
  </button>
</div>
    </div>
  )
}