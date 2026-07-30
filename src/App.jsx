import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import ProtectedRoute from './components/ProtectedRoute'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import LiveMap from './pages/LiveMap'
import Detect from './pages/Detect'
import VideoDetect from './pages/VideoDetect'
import Data from './pages/Data'
import Report from './pages/Report'
import Settings from './pages/Settings'
import Leaderboard from './pages/Leaderboard'
import CityDetail from './pages/CityDetail'
import './App.css'

function AppLayout() {
  return (
    <ProtectedRoute>
      <div className="layout">
        <Sidebar />
        <div className="main-content">
          <Routes>
            <Route path="/dashboard"   element={<Dashboard />} />
            <Route path="/map"         element={<LiveMap />} />
            <Route path="/detect"      element={<Detect />} />
            <Route path="/video"       element={<VideoDetect />} />
            <Route path="/data"        element={<Data />} />
            <Route path="/report"      element={<Report />} />
            <Route path="/settings"    element={<Settings />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/city/:city" element={<CityDetail />} />
          </Routes>
        </div>
      </div>
    </ProtectedRoute>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"    element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/*"   element={<AppLayout />} />
      </Routes>
    </BrowserRouter>
  )
}