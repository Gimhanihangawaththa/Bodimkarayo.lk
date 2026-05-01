import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AdminDataProvider } from './context/AdminDataContext'
import AnalyticsPage from './pages/AnalyticsPage'
import DashboardPage from './pages/DashboardPage'
import MapViewPage from './pages/MapViewPage'
import PropertiesPage from './pages/PropertiesPage'
import ReportsPage from './pages/ReportsPage'
import ReviewsPage from './pages/ReviewsPage'
import RoommatesPage from './pages/RoommatesPage'
import SettingsPage from './pages/SettingsPage'
import UsersPage from './pages/UsersPage'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AdminDataProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<DashboardPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="properties" element={<PropertiesPage />} />
            <Route path="roommates" element={<RoommatesPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="reviews" element={<ReviewsPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="map-view" element={<MapViewPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AdminDataProvider>
  </StrictMode>,
)
