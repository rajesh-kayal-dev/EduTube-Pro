import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useState, useEffect } from 'react'
import Login from './pages/Login'
import DashboardEnhanced from './pages/DashboardEnhanced'
import PlaylistView from './pages/PlaylistView'
import VideoPlayerSimple from './pages/VideoPlayerSimple'
import PlaylistViewPage from './pages/PlaylistViewPage'
import CoursePage from './pages/CoursePage'
import ProgressDashboard from './pages/ProgressDashboard'
import Layout from './components/Layout'

function App() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  const handleLogin = (userData) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={
          user ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />
        } />
        
        <Route path="/" element={
          user ? <Layout user={user} onLogout={handleLogout} /> : <Navigate to="/login" />
        }>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<DashboardEnhanced user={user} />} />
          <Route path="playlist/:id" element={<PlaylistView user={user} />} />
          <Route path="playlist/:playlistId/video/:videoId" element={<PlaylistViewPage user={user} />} />
          <Route path="course/:playlistId/video/:videoId" element={<CoursePage user={user} />} />
          <Route path="video/:id" element={<VideoPlayerSimple user={user} />} />
          <Route path="progress" element={<ProgressDashboard user={user} />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  )
}

export default App
