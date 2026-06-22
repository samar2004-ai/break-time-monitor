import { Navigate, Route, Routes } from 'react-router-dom'
import Header from './components/Header'
import Dashboard from './pages/Dashboard'
import ScanPage from './pages/ScanPage'

function App() {
  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-950">
      <Header />
      <main className="px-4 py-6 sm:px-6 lg:py-8">
        <Routes>
          <Route path="/" element={<ScanPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
