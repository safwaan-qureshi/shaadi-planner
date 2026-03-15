import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Layout from './components/layout/Layout'
import Dashboard    from './pages/Dashboard'
import Events       from './pages/Events'
import EventDetail  from './pages/events/EventDetail'
import Vendors      from './pages/Vendors'
import Guests       from './pages/Guests'
import Budget       from './pages/Budget'
import Tasks        from './pages/Tasks'
import Family       from './pages/Family'
import Outfits      from './pages/Outfits'
import Gifts        from './pages/Gifts'
import Invitations  from './pages/Invitations'
import Invitation   from './pages/Invitation'

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Public invitation page – no sidebar/layout */}
          <Route path="/invite/:token" element={<Invitation />} />

          {/* Main app with sidebar */}
          <Route path="/" element={<Layout />}>
            <Route index             element={<Dashboard />} />
            <Route path="events"     element={<Events />} />
            <Route path="events/:id" element={<EventDetail />} />
            <Route path="invitations"element={<Invitations />} />
            <Route path="vendors"    element={<Vendors />} />
            <Route path="guests"     element={<Guests />} />
            <Route path="budget"     element={<Budget />} />
            <Route path="tasks"      element={<Tasks />} />
            <Route path="family"     element={<Family />} />
            <Route path="outfits"    element={<Outfits />} />
            <Route path="gifts"      element={<Gifts />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}
