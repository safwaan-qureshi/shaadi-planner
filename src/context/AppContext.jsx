import { createContext, useContext, useState } from 'react'
const AppContext = createContext(null)
const uid = () => Math.random().toString(36).slice(2,10)

const DEMO_EVENTS = [
  { id:'1', name:'Mayoon',        date:'2025-09-10', location:'Family Home, Lahore',      notes:'Traditional haldi ceremony',     guest_count:80,  status:'upcoming' },
  { id:'2', name:'Mehndi',        date:'2025-09-12', location:'Gulberg Marquee, Lahore',  notes:'Evening event with live dhol',   guest_count:250, status:'upcoming' },
  { id:'3', name:'Barat',         date:'2025-09-14', location:'Pearl Continental, Lahore',notes:'Main wedding ceremony',          guest_count:500, status:'upcoming' },
  { id:'4', name:'Walima',        date:'2025-09-16', location:'PC Hotel, Lahore',         notes:"Reception by groom's family",    guest_count:400, status:'upcoming' },
  { id:'5', name:'Bachelor Trip', date:'2025-08-20', location:'Nathia Gali',              notes:'Weekend trip with close friends',guest_count:15,  status:'upcoming' },
  { id:'6', name:'Honeymoon',     date:'2025-09-20', location:'Maldives',                 notes:'Two weeks beach getaway',        guest_count:2,   status:'upcoming' },
]
const DEMO_VENDORS = [
  { id:'1', name:'Nadia Hussain Salon',category:'makeup_artist', contact_name:'Nadia',       contact_phone:'+92 300 1234567',contact_email:'nadia@salon.pk',   cost:150000, deposit_amount:50000,  deposit_due_date:'2025-07-01',final_payment_due_date:'2025-09-13',status:'deposit_paid',   notes:'Full bridal package',event_id:'3'},
  { id:'2', name:'Rana Photography',   category:'photographer',  contact_name:'Rana Sajid',  contact_phone:'+92 321 9876543',contact_email:'rana@photo.pk',    cost:200000, deposit_amount:75000,  deposit_due_date:'2025-07-15',final_payment_due_date:'2025-09-14',status:'deposit_paid',   notes:'Photo + video package',event_id:'3'},
  { id:'3', name:'Pearl Continental',  category:'venue',         contact_name:'Events Team', contact_phone:'+92 42 111 5050',contact_email:'events@pc.pk',     cost:2500000,deposit_amount:500000, deposit_due_date:'2025-06-01',final_payment_due_date:'2025-09-10',status:'deposit_paid',   notes:'Barat hall booked',event_id:'3'},
  { id:'4', name:'Shiraz Caterers',    category:'caterer',       contact_name:'Shiraz Ahmed',contact_phone:'+92 300 5554443',contact_email:'shiraz@catering.pk',cost:600000,deposit_amount:150000, deposit_due_date:'2025-08-01',final_payment_due_date:'2025-09-12',status:'deposit_due',    notes:'500 pax, menu TBD',event_id:'3'},
  { id:'5', name:'Dream Decor',        category:'decorator',     contact_name:'Ali Raza',    contact_phone:'+92 333 8887776',contact_email:'ali@dreamdecor.pk', cost:350000, deposit_amount:100000, deposit_due_date:'2025-08-10',final_payment_due_date:'2025-09-11',status:'vendor_selected',notes:'Floral stage setup',event_id:'2'},
]
const DEMO_GUESTS = [
  { id:'1',name:'Farida Begum (Ammi)',  phone:'+92 300 1111111',email:'farida@family.pk',side:'bride',rsvp_status:'confirmed',events_invited:['1','2','3','4'],events_confirmed:['1','2','3','4'],transport_needed:false,accommodation_needed:false,notes:'Mother of bride',invite_token:'tkn-001'},
  { id:'2',name:'Muhammad Asif (Abbu)',  phone:'+92 300 2222222',email:'asif@family.pk',  side:'bride',rsvp_status:'confirmed',events_invited:['1','2','3','4'],events_confirmed:['1','2','3','4'],transport_needed:false,accommodation_needed:false,notes:'Father of bride',invite_token:'tkn-002'},
  { id:'3',name:'Zara Aunt (London)',    phone:'+44 7700 123456', email:'zara@uk.com',    side:'bride',rsvp_status:'confirmed',events_invited:['2','3','4'],    events_confirmed:['2','3','4'],    transport_needed:true, accommodation_needed:true, notes:'Flying from UK',invite_token:'tkn-003'},
  { id:'4',name:'Ahmed Uncle (Toronto)',phone:'+1 416 555 0123', email:'ahmed@canada.ca',side:'groom',rsvp_status:'pending',  events_invited:['3','4'],         events_confirmed:[],               transport_needed:true, accommodation_needed:true, notes:'Needs airport pickup',invite_token:'tkn-004'},
  { id:'5',name:'Sana (Best Friend)',   phone:'+92 321 3333333', email:'sana@gmail.com', side:'bride',rsvp_status:'confirmed',events_invited:['1','2','3','4'],events_confirmed:['1','2','3','4'],transport_needed:false,accommodation_needed:false,notes:'Bridesmaid',invite_token:'tkn-005'},
  { id:'6',name:"Bilal (Groom's cousin)",phone:'+92 333 4444444',email:'bilal@email.pk', side:'groom',rsvp_status:'pending',  events_invited:['3','4'],         events_confirmed:[],               transport_needed:false,accommodation_needed:false,notes:'',invite_token:'tkn-006'},
]
const DEMO_TASKS = [
  { id:'1',title:'Book bridal venue',      assigned_to:'Zara (Planner)',     deadline:'2025-05-15',status:'done',       priority:'high',  event_id:'3'},
  { id:'2',title:'Confirm photographer',   assigned_to:'Zara (Planner)',     deadline:'2025-05-20',status:'done',       priority:'high',  event_id:'3'},
  { id:'3',title:'Order bridal lehenga',   assigned_to:'Ammi',               deadline:'2025-07-01',status:'in_progress',priority:'high',  event_id:'3'},
  { id:'4',title:'Send Barat invitations', assigned_to:'Ahmed (Coordinator)',deadline:'2025-07-15',status:'in_progress',priority:'medium',event_id:'3'},
  { id:'5',title:'Finalise catering menu', assigned_to:'Tariq (Finance)',    deadline:'2025-08-01',status:'todo',       priority:'medium',event_id:'3'},
  { id:'6',title:'Order mehndi flowers',   assigned_to:'Sana',               deadline:'2025-09-05',status:'todo',       priority:'low',   event_id:'2'},
  { id:'7',title:'Arrange baraat dhol',    assigned_to:'Zara (Planner)',     deadline:'2025-08-20',status:'todo',       priority:'medium',event_id:'3'},
  { id:'8',title:'Book honeymoon flights', assigned_to:'Groom',              deadline:'2025-06-01',status:'done',       priority:'high',  event_id:'6'},
]
const DEMO_EXPENSES = [
  { id:'1',title:'Venue deposit – PC Hotel',amount:500000, category:'venue',      paid:true, event_id:'3'},
  { id:'2',title:'Photography deposit',     amount:75000,  category:'photography',paid:true, event_id:'3'},
  { id:'3',title:'Bridal lehenga',          amount:280000, category:'clothing',   paid:false,event_id:'3'},
  { id:'4',title:'Makeup artist deposit',   amount:50000,  category:'beauty',     paid:true, event_id:'3'},
  { id:'5',title:'Decorator deposit',       amount:100000, category:'decor',      paid:true, event_id:'2'},
  { id:'6',title:'Catering deposit',        amount:150000, category:'catering',   paid:false,event_id:'3'},
  { id:'7',title:'Invitation cards',        amount:45000,  category:'stationery', paid:true, event_id:'3'},
  { id:'8',title:'Honeymoon flights',       amount:320000, category:'travel',     paid:true, event_id:'6'},
]
const DEMO_FAMILY = [
  { id:'1',name:'Aisha',        role:'bride',             email:'aisha@email.pk', phone:'+92 300 9999999'},
  { id:'2',name:'Hamza',        role:'groom',             email:'hamza@email.pk', phone:'+92 300 8888888'},
  { id:'3',name:'Zara Hussain', role:'planner',           email:'zara@email.pk',  phone:'+44 7700 123456'},
  { id:'4',name:'Ahmed Khan',   role:'family_coordinator',email:'ahmed@email.pk', phone:'+1 416 555 0123'},
  { id:'5',name:'Tariq Mehmood',role:'finance_manager',   email:'tariq@email.pk', phone:'+92 321 7777777'},
]
const DEMO_RESPONSIBILITIES = [
  { id:'1',event_id:'2',name:'Mehndi Decor',      assigned_to:'Zara Hussain', payment_responsibility:'bride', notes:'Floral & fairy lights'},
  { id:'2',event_id:'2',name:'Mehndi Catering',   assigned_to:'Ahmed Khan',   payment_responsibility:'groom', notes:'Dinner for 250'},
  { id:'3',event_id:'2',name:'Mehndi Photography',assigned_to:'Zara Hussain', payment_responsibility:'shared',notes:'Photo + reel'},
  { id:'4',event_id:'3',name:'Barat Venue',        assigned_to:'Ahmed Khan',   payment_responsibility:'groom', notes:'PC Hotel Grand Hall'},
  { id:'5',event_id:'3',name:'Bridal Makeup',      assigned_to:'Ammi',         payment_responsibility:'bride', notes:'Nadia Hussain Salon'},
  { id:'6',event_id:'3',name:'Barat Catering',     assigned_to:'Tariq Mehmood',payment_responsibility:'groom', notes:'Shiraz Caterers'},
  { id:'7',event_id:'4',name:'Walima Venue',        assigned_to:'Ahmed Khan',   payment_responsibility:'groom', notes:''},
  { id:'8',event_id:'4',name:'Walima Decor',        assigned_to:'Zara Hussain', payment_responsibility:'groom', notes:''},
]
const DEMO_OUTFITS = [
  { id:'1',person_name:'Aisha',       person_role:'bride', event_id:'3',outfit_type:'Bridal Lehenga',designer:'Elan',       cost:280000,payment_responsibility:'bride',     status:'ordered',               notes:'Red & gold, heavily embroidered'},
  { id:'2',person_name:'Hamza',       person_role:'groom', event_id:'3',outfit_type:'Sherwani',      designer:'Amir Adnan', cost:95000, payment_responsibility:'groom',     status:'tailoring_in_progress', notes:'Ivory with gold embroidery'},
  { id:'3',person_name:'Aisha',       person_role:'bride', event_id:'2',outfit_type:'Mehndi Outfit', designer:'Sana Safinaz',cost:75000,payment_responsibility:'bride',     status:'ready_for_fitting',     notes:'Yellow & green'},
  { id:'4',person_name:'Farida Begum',person_role:'family',event_id:'3',outfit_type:'Saree',         designer:'Custom',     cost:45000, payment_responsibility:'individual', status:'completed',             notes:'Deep red silk'},
]
const DEMO_GIFTS = [
  { id:'1',guest_id:'3',gift_type:'cash_envelope',description:'Wedding cash gift', estimated_value:50000, notes:'From Zara Aunt'},
  { id:'2',guest_id:'1',gift_type:'jewelry',       description:'Gold necklace set', estimated_value:120000,notes:'From Ammi'},
  { id:'3',guest_id:'5',gift_type:'physical_gift', description:'Crystal dinner set',estimated_value:25000, notes:'From Sana'},
]

export function AppProvider({ children }) {
  const [events,            setEvents]           = useState(DEMO_EVENTS)
  const [vendors,           setVendors]          = useState(DEMO_VENDORS)
  const [guests,            setGuests]           = useState(DEMO_GUESTS)
  const [tasks,             setTasks]            = useState(DEMO_TASKS)
  const [expenses,          setExpenses]         = useState(DEMO_EXPENSES)
  const [familyMembers,     setFamilyMembers]    = useState(DEMO_FAMILY)
  const [responsibilities,  setResponsibilities] = useState(DEMO_RESPONSIBILITIES)
  const [outfits,           setOutfits]          = useState(DEMO_OUTFITS)
  const [gifts,             setGifts]            = useState(DEMO_GIFTS)
  const [moodboard,         setMoodboard]        = useState([])
  const [budget,            setBudget]           = useState(5000000)
  const [weddingDate,       setWeddingDate]      = useState('2025-09-14')
  const [weddingTitle,      setWeddingTitle]     = useState('Aisha & Hamza')
  const [userRole,          setUserRole]         = useState('admin')

  const mk = (setter) => ({
    add:    (d)    => setter(p => [...p, {...d, id:uid()}]),
    update: (id,d) => setter(p => p.map(x => x.id===id ? {...x,...d} : x)),
    del:    (id)   => setter(p => p.filter(x => x.id!==id)),
  })
  const e  = mk(setEvents);         const v  = mk(setVendors)
  const g  = mk(setGuests);         const t  = mk(setTasks)
  const ex = mk(setExpenses);       const fm = mk(setFamilyMembers)
  const r  = mk(setResponsibilities); const o = mk(setOutfits)
  const gi = mk(setGifts)

  const addGuest = (d) => setGuests(p => [...p, {...d, id:uid(), invite_token:'tkn-'+uid()}])

  const totalSpent = expenses.reduce((s,e)=>s+(e.amount||0),0)
  const totalPaid  = expenses.filter(e=>e.paid).reduce((s,e)=>s+(e.amount||0),0)
  const remaining  = budget - totalSpent

  return (
    <AppContext.Provider value={{
      events, addEvent:e.add, updateEvent:e.update, deleteEvent:e.del,
      vendors, addVendor:v.add, updateVendor:v.update, deleteVendor:v.del,
      guests, addGuest, updateGuest:g.update, deleteGuest:g.del,
      tasks, addTask:t.add, updateTask:t.update, deleteTask:t.del,
      expenses, addExpense:ex.add, updateExpense:ex.update, deleteExpense:ex.del,
      familyMembers, addFamilyMember:fm.add, updateFamilyMember:fm.update, deleteFamilyMember:fm.del,
      responsibilities, addResponsibility:r.add, updateResponsibility:r.update, deleteResponsibility:r.del,
      outfits, addOutfit:o.add, updateOutfit:o.update, deleteOutfit:o.del,
      gifts, addGift:gi.add, updateGift:gi.update, deleteGift:gi.del,
      moodboard,
      addMoodboardImage: (d) => setMoodboard(p=>[...p,{...d,id:uid()}]),
      deleteMoodboardImage: (id) => setMoodboard(p=>p.filter(m=>m.id!==id)),
      budget, setBudget, weddingDate, setWeddingDate, weddingTitle, setWeddingTitle,
      userRole, setUserRole, totalSpent, totalPaid, remaining,
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
