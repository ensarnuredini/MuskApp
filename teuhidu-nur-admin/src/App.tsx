import { Routes, Route, Navigate } from 'react-router-dom'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { PublicOrder } from './pages/PublicOrder'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/order/:orderNumber" element={<PublicOrder />} />
      <Route path="/" element={<Dashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
