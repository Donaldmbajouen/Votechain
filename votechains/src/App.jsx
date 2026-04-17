import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider, useAuth } from './context/AuthContext'
import AdminDashboard from './pages/AdminDashboard'
import CampaignList from './pages/CampaignList'
import Login from './pages/Login'
import Register from './pages/Register'
import VotePage from './pages/VotePage'

function HomeRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'admin') return <Navigate to="/admin" replace />
  return <Navigate to="/campaigns" replace />
}

function Layout({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Layout><ProtectedRoute><HomeRedirect /></ProtectedRoute></Layout>} />
          <Route path="/admin" element={<Layout><ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute></Layout>} />
          <Route path="/campaigns" element={<Layout><ProtectedRoute><CampaignList /></ProtectedRoute></Layout>} />
          <Route path="/campaigns/:id" element={<Layout><ProtectedRoute><VotePage /></ProtectedRoute></Layout>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
