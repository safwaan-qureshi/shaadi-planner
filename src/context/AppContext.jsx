import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const AppContext = createContext(null)
const uid = () => Math.random().toString(36).slice(2, 10)

// ── helpers ───────────────────────────────────────────────────────────────────
const toast = (msg, type = 'success') => {
  const el = document.createElement('div')
  el.textContent = msg
  el.style.cssText = `
    position:fixed; bottom:24px; right:24px; z-index:9999;
    padding:12px 20px; border-radius:12px; font-size:14px; font-weight:500;
    background:${type === 'error' ? '#fee2e2' : '#d1fae5'};
    color:${type === 'error' ? '#991b1b' : '#065f46'};
    border:1px solid ${type === 'error' ? '#fca5a5' : '#6ee7b7'};
    box-shadow:0 4px 20px rgba(0,0,0,0.12);
    animation:fadeIn 0.3s ease;
  `
  document.body.appendChild(el)
  setTimeout(() => el.remove(), 3000)
}

// ── Provider ──────────────────────────────────────────────────────────────────
export function AppProvider({ children }) {
  const [events,           setEvents]          = useState([])
  const [vendors,          setVendors]         = useState([])
  const [guests,           setGuests]          = useState([])
  const [tasks,            setTasks]           = useState([])
  const [expenses,         setExpenses]        = useState([])
  const [familyMembers,    setFamilyMembers]   = useState([])
  const [responsibilities, setResponsibilities]= useState([])
  const [outfits,          setOutfits]         = useState([])
  const [gifts,            setGifts]           = useState([])
  const [moodboard,        setMoodboard]       = useState([])
  const [budget,           setBudgetState]     = useState(5000000)
  const [weddingDate,      setWeddingDateState]= useState('2025-09-14')
  const [weddingTitle,     setWeddingTitleState]=useState('Aisha & Hamza')
  const [userRole,         setUserRole]        = useState('admin')
  const [loading,          setLoading]         = useState(true)

  // ── Load all data from Supabase on mount ──────────────────────────────────
  useEffect(() => {
    loadAll()
  }, [])

  const loadAll = async () => {
    setLoading(true)
    try {
      const [
        { data: eventsData },
        { data: vendorsData },
        { data: guestsData },
        { data: tasksData },
        { data: expensesData },
        { data: familyData },
        { data: respData },
        { data: outfitsData },
        { data: giftsData },
        { data: moodboardData },
        { data: settingsData },
      ] = await Promise.all([
        supabase.from('events').select('*').order('date', { ascending: true }),
        supabase.from('vendors').select('*').order('created_at', { ascending: false }),
        supabase.from('guests').select('*').order('name', { ascending: true }),
        supabase.from('tasks').select('*').order('deadline', { ascending: true }),
        supabase.from('expenses').select('*').order('created_at', { ascending: false }),
        supabase.from('family_members').select('*').order('name', { ascending: true }),
        supabase.from('responsibilities').select('*').order('created_at', { ascending: true }),
        supabase.from('outfits').select('*').order('created_at', { ascending: false }),
        supabase.from('gifts').select('*').order('created_at', { ascending: false }),
        supabase.from('moodboard').select('*').order('created_at', { ascending: false }),
        supabase.from('settings').select('*'),
      ])

      if (eventsData)       setEvents(eventsData)
      if (vendorsData)      setVendors(vendorsData)
      if (guestsData)       setGuests(guestsData)
      if (tasksData)        setTasks(tasksData)
      if (expensesData)     setExpenses(expensesData)
      if (familyData)       setFamilyMembers(familyData)
      if (respData)         setResponsibilities(respData)
      if (outfitsData)      setOutfits(outfitsData)
      if (giftsData)        setGifts(giftsData)
      if (moodboardData)    setMoodboard(moodboardData)

      if (settingsData) {
        const get = (key) => settingsData.find(s => s.key === key)?.value
        if (get('wedding_budget')) setBudgetState(Number(get('wedding_budget')))
        if (get('wedding_date'))   setWeddingDateState(get('wedding_date'))
        if (get('wedding_title'))  setWeddingTitleState(get('wedding_title'))
      }
    } catch (err) {
      console.error('Failed to load data:', err)
      toast('Could not connect to database', 'error')
    }
    setLoading(false)
  }

  // ── Settings savers ───────────────────────────────────────────────────────
  const setBudget = async (val) => {
    setBudgetState(val)
    await supabase.from('settings').upsert({ key: 'wedding_budget', value: String(val) })
  }
  const setWeddingDate = async (val) => {
    setWeddingDateState(val)
    await supabase.from('settings').upsert({ key: 'wedding_date', value: val })
  }
  const setWeddingTitle = async (val) => {
    setWeddingTitleState(val)
    await supabase.from('settings').upsert({ key: 'wedding_title', value: val })
  }

  // ── Generic CRUD factory ──────────────────────────────────────────────────
  const makeCrud = (table, setter) => ({
    add: async (data) => {
      const { data: row, error } = await supabase.from(table).insert([data]).select().single()
      if (error) { toast(`Failed to add: ${error.message}`, 'error'); return null }
      setter(p => [...p, row])
      toast('Saved ✓')
      return row
    },
    update: async (id, data) => {
      const { data: row, error } = await supabase.from(table).update(data).eq('id', id).select().single()
      if (error) { toast(`Failed to update: ${error.message}`, 'error'); return null }
      setter(p => p.map(x => x.id === id ? row : x))
      toast('Updated ✓')
      return row
    },
    del: async (id) => {
      const { error } = await supabase.from(table).delete().eq('id', id)
      if (error) { toast(`Failed to delete: ${error.message}`, 'error'); return }
      setter(p => p.filter(x => x.id !== id))
      toast('Deleted ✓')
    },
  })

  const eventsCrud  = makeCrud('events',           setEvents)
  const vendorsCrud = makeCrud('vendors',          setVendors)
  const tasksCrud   = makeCrud('tasks',            setTasks)
  const expCrud     = makeCrud('expenses',         setExpenses)
  const famCrud     = makeCrud('family_members',   setFamilyMembers)
  const respCrud    = makeCrud('responsibilities', setResponsibilities)
  const outfitsCrud = makeCrud('outfits',          setOutfits)
  const giftsCrud   = makeCrud('gifts',            setGifts)
  const moodCrud    = makeCrud('moodboard',        setMoodboard)

  // Guests have a special add that auto-generates invite_token
  const guestsCrud = {
    add: async (data) => {
      const payload = { ...data, invite_token: 'tkn-' + uid() + uid() }
      const { data: row, error } = await supabase.from('guests').insert([payload]).select().single()
      if (error) { toast(`Failed to add guest: ${error.message}`, 'error'); return null }
      setGuests(p => [...p, row])
      toast('Guest added ✓')
      return row
    },
    update: async (id, data) => {
      const { data: row, error } = await supabase.from('guests').update(data).eq('id', id).select().single()
      if (error) { toast(`Failed to update: ${error.message}`, 'error'); return null }
      setGuests(p => p.map(x => x.id === id ? row : x))
      toast('Guest updated ✓')
      return row
    },
    del: async (id) => {
      const { error } = await supabase.from('guests').delete().eq('id', id)
      if (error) { toast(`Failed to delete: ${error.message}`, 'error'); return }
      setGuests(p => p.filter(x => x.id !== id))
      toast('Guest removed ✓')
    },
  }

  // ── Derived stats ─────────────────────────────────────────────────────────
  const totalSpent = expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0)
  const totalPaid  = expenses.filter(e => e.paid).reduce((s, e) => s + (Number(e.amount) || 0), 0)
  const remaining  = budget - totalSpent

  // ── Loading screen ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'var(--cream)', fontFamily: '"DM Sans", sans-serif'
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: 'var(--rose)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          marginBottom: 16, animation: 'pulseSoft 1.5s ease-in-out infinite'
        }}>
          <span style={{fontSize: 28}}>🌹</span>
        </div>
        <p style={{fontFamily: '"Playfair Display", serif', fontSize: '1.25rem',
          fontWeight: 600, color: 'var(--text-dark)', marginBottom: 6}}>
          Shaadi Planner
        </p>
        <p style={{fontSize: '0.875rem', color: 'var(--text-muted)'}}>
          Loading your wedding data…
        </p>
        <style>{`
          @keyframes pulseSoft { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.8;transform:scale(0.95)} }
        `}</style>
      </div>
    )
  }

  return (
    <AppContext.Provider value={{
      // Data
      events, vendors, guests, tasks, expenses,
      familyMembers, responsibilities, outfits, gifts, moodboard,
      // Events
      addEvent:    eventsCrud.add,
      updateEvent: eventsCrud.update,
      deleteEvent: eventsCrud.del,
      // Vendors
      addVendor:    vendorsCrud.add,
      updateVendor: vendorsCrud.update,
      deleteVendor: vendorsCrud.del,
      // Guests
      addGuest:    guestsCrud.add,
      updateGuest: guestsCrud.update,
      deleteGuest: guestsCrud.del,
      // Tasks
      addTask:    tasksCrud.add,
      updateTask: tasksCrud.update,
      deleteTask: tasksCrud.del,
      // Expenses
      addExpense:    expCrud.add,
      updateExpense: expCrud.update,
      deleteExpense: expCrud.del,
      // Family
      addFamilyMember:    famCrud.add,
      updateFamilyMember: famCrud.update,
      deleteFamilyMember: famCrud.del,
      // Responsibilities
      addResponsibility:    respCrud.add,
      updateResponsibility: respCrud.update,
      deleteResponsibility: respCrud.del,
      // Outfits
      addOutfit:    outfitsCrud.add,
      updateOutfit: outfitsCrud.update,
      deleteOutfit: outfitsCrud.del,
      // Gifts
      addGift:    giftsCrud.add,
      updateGift: giftsCrud.update,
      deleteGift: giftsCrud.del,
      // Moodboard
      addMoodboardImage:    moodCrud.add,
      deleteMoodboardImage: moodCrud.del,
      // Settings
      budget, setBudget,
      weddingDate, setWeddingDate,
      weddingTitle, setWeddingTitle,
      // UI
      userRole, setUserRole,
      loading, reload: loadAll,
      // Derived
      totalSpent, totalPaid, remaining,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be inside AppProvider')
  return ctx
}
