import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Layout      from './components/layout/Layout'
import Dashboard   from './pages/Dashboard'
import Events      from './pages/Events'
import EventDetail from './pages/events/EventDetail'
import Vendors     from './pages/Vendors'
import Guests      from './pages/Guests'
import Budget      from './pages/Budget'
import Tasks       from './pages/Tasks'
import Family      from './pages/Family'
import Outfits     from './pages/Outfits'
import Gifts       from './pages/Gifts'
import Invitations from './pages/Invitations'
import Invitation  from './pages/Invitation'
import Settings    from './pages/Settings'
import Travel      from './pages/Travel'
import Updates     from './pages/Updates'
import Analytics   from './pages/Analytics'
import QRCheckin   from './pages/QRCheckin'
import AIPlanner   from './pages/AIPlanner'
import PhotoAlbum  from './pages/PhotoAlbum'
import Portal      from './pages/Portal'

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/invite/:token" element={<Invitation />} />
          <Route path="/" element={<Layout />}>
            <Route index              element={<Dashboard />}   />
            <Route path="events"      element={<Events />}      />
            <Route path="events/:id"  element={<EventDetail />} />
            <Route path="invitations" element={<Invitations />} />
            <Route path="vendors"     element={<Vendors />}     />
            <Route path="guests"      element={<Guests />}      />
            <Route path="budget"      element={<Budget />}      />
            <Route path="tasks"       element={<Tasks />}       />
            <Route path="family"      element={<Family />}      />
            <Route path="outfits"     element={<Outfits />}     />
            <Route path="gifts"       element={<Gifts />}       />
            <Route path="settings"    element={<Settings />}    />
            <Route path="travel"      element={<Travel />}      />
            <Route path="updates"     element={<Updates />}     />
            <Route path="analytics"   element={<Analytics />}   />
            <Route path="checkin"     element={<QRCheckin />}   />
            <Route path="ai-planner"  element={<AIPlanner />}   />
            <Route path="photos"      element={<PhotoAlbum />}  />
            <Route path="portal"      element={<Portal />}      />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}
