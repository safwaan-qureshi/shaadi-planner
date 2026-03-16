import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Sparkles, Send, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react'

const EVENT_EMOJIS = { 'Mayoon':'💛','Mehndi':'🌿','Barat':'🌹','Walima':'✨','Bachelor Trip':'🎉','Honeymoon':'🌴' }

// AI suggestions generator — uses built-in logic, no API key needed
// In production, swap generateSuggestion() for a real AI API call
function generateSuggestion({ eventName, guestCount, budgetPKR, side }) {
  const budget = Number(budgetPKR) || 500000
  const guests = Number(guestCount) || 100
  const perHead = Math.round(budget / guests)

  const venueRange    = Math.round(budget * 0.35)
  const cateringRange = Math.round(budget * 0.30)
  const decorRange    = Math.round(budget * 0.15)
  const photoRange    = Math.round(budget * 0.10)
  const miscRange     = Math.round(budget * 0.10)
  const fmt = n => `PKR ${(n/1000).toFixed(0)}k`

  const suggestions = {
    'Mayoon': {
      overview: `A traditional haldi ceremony for ${guests} guests. Keep it intimate and family-focused. Budget: ${fmt(budget)} (~${fmt(perHead)}/person).`,
      tasks: ['Book family home or intimate venue','Order haldi/mehndi supplies','Arrange yellow/golden decor','Coordinate dholak players','Prepare traditional food platters','Organise yellow dupatta for bride','Send informal invites to close family'],
      vendors: [
        { category:'Catering',   budget:fmt(cateringRange), notes:'Home-style food — biryani, desserts, chai station' },
        { category:'Decor',      budget:fmt(decorRange),    notes:'Marigold flowers, fairy lights, yellow theme' },
        { category:'Music',      budget:fmt(Math.round(budget*0.05)), notes:'Dholak players or live dhol' },
        { category:'Photography',budget:fmt(photoRange),    notes:'Candid photography package' },
      ],
      responsibilities: [
        { name:'Haldi ceremony coordination', side:'bride' },
        { name:'Food & catering',             side:'shared' },
        { name:'Decor setup',                 side:'bride' },
      ],
      tips: ['Keep guest list to close family only (50–120)','Yellow/golden dress code adds visual cohesion','Morning ceremonies feel more traditional','Outdoor setups look beautiful for Mayoon'],
    },
    'Mehndi': {
      overview: `A vibrant Mehndi night for ${guests} guests. Evening event with live music and mehndi artists. Budget: ${fmt(budget)}.`,
      tasks: ['Book marquee or garden venue','Hire mehndi artists (1 per 20 guests)','Arrange stage & floral decor','Book dhol players / live music','Organise mehndi outfits','Send invitations 4 weeks ahead','Plan dinner menu','Arrange seating layout'],
      vendors: [
        { category:'Venue',       budget:fmt(venueRange),    notes:'Garden, marquee, or outdoor lawn' },
        { category:'Catering',    budget:fmt(cateringRange), notes:'Dinner buffet for all guests' },
        { category:'Mehndi Artists',budget:fmt(Math.round(budget*0.08)), notes:'Book 1 artist per 20 guests minimum' },
        { category:'Decor',       budget:fmt(decorRange),    notes:'Floral stage, fairy lights, colourful theme' },
        { category:'Photography', budget:fmt(photoRange),    notes:'Photo + video, drone recommended' },
        { category:'Music',       budget:fmt(Math.round(budget*0.07)), notes:'Dhol players, sound system' },
      ],
      responsibilities: [
        { name:'Mehndi venue booking',    side:'groom' },
        { name:'Bride mehndi setup',      side:'bride' },
        { name:'Catering',                side:'groom' },
        { name:'Stage decor',             side:'bride' },
        { name:'Guest invitations',       side:'shared' },
      ],
      tips: [`With ${guests} guests, book ${Math.ceil(guests/20)} mehndi artists`,'Start mehndi for close family 2 hours before main event','Live dhol creates the best atmosphere','Seat elderly guests near stage with easy access'],
    },
    'Barat': {
      overview: `The main wedding day for ${guests} guests. Grand venue, formal ceremony, rukhsati. Budget: ${fmt(budget)}.`,
      tasks: ['Book grand venue (hall or hotel)','Confirm nikah arrangements','Book bridal makeup artist','Arrange baraat transport','Plan bride stage & seating','Confirm photography & videography','Finalise catering menu','Order wedding cake','Send formal invitations 6 weeks ahead','Arrange shaadi car decoration','Plan rukhsati timing'],
      vendors: [
        { category:'Venue',        budget:fmt(venueRange),    notes:'Grand hall — PC, Serena, or 5-star hotel' },
        { category:'Catering',     budget:fmt(cateringRange), notes:`Full dinner for ${guests} — biryani, BBQ, desserts` },
        { category:'Photography',  budget:fmt(photoRange),    notes:'Full day photo + cinematic video' },
        { category:'Makeup Artist',budget:fmt(Math.round(budget*0.05)), notes:'Top bridal artist, airbrush recommended' },
        { category:'Decor',        budget:fmt(decorRange),    notes:'Stage, floral arrangements, car decor' },
        { category:'Transport',    budget:fmt(Math.round(budget*0.03)), notes:'Decorated baraat cars' },
      ],
      responsibilities: [
        { name:'Venue booking',     side:'groom' },
        { name:'Catering',          side:'groom' },
        { name:'Bridal makeup',     side:'bride' },
        { name:'Bridal lehenga',    side:'bride' },
        { name:'Photography',       side:'shared' },
        { name:'Stage decor',       side:'shared' },
        { name:'Nikah arrangements',side:'shared' },
      ],
      tips:['Book venue 6+ months in advance for peak season','Nikah usually happens at start of event','Plan rukhsati 2 hours before venue close time','Have a backup plan for weather if outdoor'],
    },
    'Walima': {
      overview: `Walima reception for ${guests} guests, hosted by groom's family. Budget: ${fmt(budget)}.`,
      tasks: ['Book venue (can be same as Barat or different)','Plan walima menu','Arrange simpler decor (bride/groom may reuse some)','Send walima invitations','Arrange photography','Plan bridal walima outfit','Coordinate seating for elders'],
      vendors: [
        { category:'Venue',       budget:fmt(venueRange),    notes:'Reception hall or hotel' },
        { category:'Catering',    budget:fmt(cateringRange), notes:'Walima lunch or dinner buffet' },
        { category:'Photography', budget:fmt(photoRange),    notes:'Coverage of walima highlights' },
        { category:'Decor',       budget:fmt(decorRange),    notes:'Simpler than Barat — floral centrepieces' },
      ],
      responsibilities: [
        { name:'Walima venue & catering', side:'groom' },
        { name:'Bride walima outfit',     side:'bride' },
        { name:'Photography',             side:'shared' },
      ],
      tips:['Walima is traditionally hosted by groom\'s family','Simpler than Barat is perfectly acceptable','Lunch walimas are increasingly popular','Focus on quality food and warm hospitality'],
    },
    'Bachelor Trip': {
      overview: `Bachelor trip for ${guests} close friends. Budget: ${fmt(budget)} total.`,
      tasks: ['Choose destination (Murree, Nathia Gali, Skardu, Dubai)','Book accommodation','Arrange transport','Plan activities','Collect money from participants','Book restaurant reservations'],
      vendors: [
        { category:'Accommodation', budget:fmt(Math.round(budget*0.40)), notes:'Hotel or resort booking' },
        { category:'Transport',     budget:fmt(Math.round(budget*0.25)), notes:'Rental van or flight tickets' },
        { category:'Activities',    budget:fmt(Math.round(budget*0.20)), notes:'Outdoor activities, tours' },
        { category:'Food',          budget:fmt(Math.round(budget*0.15)), notes:'Restaurants and group meals' },
      ],
      responsibilities: [
        { name:'Booking & coordination', side:'groom' },
        { name:'Budget collection',      side:'groom' },
      ],
      tips:['Book 3+ months ahead for popular destinations','Collect full payment upfront','Have a group WhatsApp for coordination','Plan a mix of relaxation and activities'],
    },
    'Honeymoon': {
      overview: `Honeymoon trip for 2. Budget: ${fmt(budget)}.`,
      tasks: ['Choose destination (Maldives, Turkey, Europe, Bali)','Book flights','Book hotel/resort','Apply for visas if needed','Pack wedding documents','Plan honeymoon itinerary','Book special experiences'],
      vendors: [
        { category:'Flights',  budget:fmt(Math.round(budget*0.30)), notes:'Return flights for 2' },
        { category:'Hotel',    budget:fmt(Math.round(budget*0.45)), notes:'5-star resort recommended' },
        { category:'Visa/Travel Insurance', budget:fmt(Math.round(budget*0.10)), notes:'Essential for international travel' },
        { category:'Activities', budget:fmt(Math.round(budget*0.15)), notes:'Experiences, tours, spa' },
      ],
      responsibilities: [
        { name:'All planning', side:'groom' },
      ],
      tips:['Book 4–6 months in advance for best deals','Get travel insurance — especially post-wedding','Maldives is perfect for Pakistani couples (no visa)','Turkey, Bali, and Dubai are also popular choices'],
    },
  }

  return suggestions[eventName] || {
    overview: `Planning ${eventName} for ${guests} guests with budget ${fmt(budget)}.`,
    tasks: ['Book venue','Arrange catering','Confirm guest list','Plan decor','Book photography'],
    vendors: [{ category:'Venue', budget:fmt(venueRange), notes:'Main venue booking' }],
    responsibilities: [],
    tips: ['Plan at least 3 months in advance','Keep a detailed checklist','Assign clear responsibilities'],
  }
}

function SuggestionCard({ title, items, emoji, open, onToggle }) {
  return (
    <div className="card overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between text-left">
        <div className="flex items-center gap-2">
          <span className="text-xl">{emoji}</span>
          <h3 className="font-display font-semibold" style={{color:'var(--text-dark)'}}>{title}</h3>
          <span className="badge text-xs" style={{background:'var(--champagne)',color:'var(--text-mid)'}}>{items.length} items</span>
        </div>
        {open ? <ChevronUp size={16} style={{color:'var(--text-muted)'}}/> : <ChevronDown size={16} style={{color:'var(--text-muted)'}}/>}
      </button>
      {open && (
        <div className="mt-3 pt-3 space-y-1.5" style={{borderTop:'1px solid var(--champagne-border)'}}>
          {items.map((item, i) => (
            <div key={i} className="flex items-start gap-2.5 p-2 rounded-xl" style={{background:'var(--cream-dark)'}}>
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5"
                style={{background:'var(--rose)'}}>{i+1}</span>
              <p className="text-sm" style={{color:'var(--text-mid)'}}>{item}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function AIPlanner() {
  const { events, budget } = useApp()
  const [form, setForm] = useState({
    eventName: events[0]?.name || 'Barat',
    guestCount: '300',
    budgetPKR: String(Math.round(budget * 0.35)),
    side: 'both',
    notes: '',
  })
  const [result, setResult]     = useState(null)
  const [loading, setLoading]   = useState(false)
  const [open, setOpen]         = useState({ tasks:true, vendors:false, responsibilities:false, tips:false })
  const [copied, setCopied]     = useState(false)

  const set = (k,v) => setForm(p=>({...p,[k]:v}))

  const generate = () => {
    setLoading(true)
    setTimeout(() => {
      setResult(generateSuggestion(form))
      setLoading(false)
    }, 1200) // simulate thinking
  }

  const copyAll = () => {
    if (!result) return
    const text = `${form.eventName} Planning — ${form.guestCount} guests — PKR ${form.budgetPKR}\n\n`
      + `OVERVIEW:\n${result.overview}\n\n`
      + `TASKS:\n${result.tasks.map((t,i)=>`${i+1}. ${t}`).join('\n')}\n\n`
      + `VENDORS:\n${result.vendors.map(v=>`• ${v.category}: ${v.budget} — ${v.notes}`).join('\n')}\n\n`
      + `TIPS:\n${result.tips.map(t=>`• ${t}`).join('\n')}`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(()=>setCopied(false), 2000)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="section-title flex items-center gap-2">
          AI Planning Assistant <span>✨</span>
        </h1>
        <p className="text-sm mt-1" style={{color:'var(--text-soft)'}}>
          Get smart planning suggestions tailored to your wedding events, guest count, and budget
        </p>
      </div>

      {/* Input form */}
      <div className="card" style={{background:'linear-gradient(135deg,var(--champagne),var(--cream))'}}>
        <div className="flex items-center gap-2 mb-5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background:'var(--rose)'}}>
            <Sparkles size={18} className="text-white"/>
          </div>
          <div>
            <p className="font-display font-semibold" style={{color:'var(--text-dark)'}}>Plan an Event</p>
            <p className="text-xs" style={{color:'var(--text-soft)'}}>Fill in details and get a complete planning guide</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Event *</label>
            <select className="input-field" value={form.eventName} onChange={e=>set('eventName',e.target.value)}>
              {['Mayoon','Mehndi','Barat','Walima','Bachelor Trip','Honeymoon'].map(e=>(
                <option key={e} value={e}>{EVENT_EMOJIS[e]} {e}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Expected Guests</label>
            <input type="number" className="input-field" placeholder="e.g. 300"
              value={form.guestCount} onChange={e=>set('guestCount',e.target.value)}/>
          </div>
          <div>
            <label className="label">Budget (PKR)</label>
            <input type="number" className="input-field" placeholder="e.g. 1500000"
              value={form.budgetPKR} onChange={e=>set('budgetPKR',e.target.value)}/>
            {form.budgetPKR && (
              <p className="text-xs mt-1" style={{color:'var(--text-muted)'}}>
                = PKR {Number(form.budgetPKR).toLocaleString()} (~PKR {Math.round(Number(form.budgetPKR)/Number(form.guestCount||1)).toLocaleString()}/person)
              </p>
            )}
          </div>
          <div>
            <label className="label">Focus</label>
            <select className="input-field" value={form.side} onChange={e=>set('side',e.target.value)}>
              <option value="both">Both Sides</option>
              <option value="bride">Bride Side Focused</option>
              <option value="groom">Groom Side Focused</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className="label">Special Requirements (optional)</label>
          <input className="input-field" placeholder="e.g. outdoor venue, vegetarian options, overseas guests..."
            value={form.notes} onChange={e=>set('notes',e.target.value)}/>
        </div>

        <button onClick={generate} disabled={loading}
          className="btn-primary mt-5 w-full justify-center py-3 text-base disabled:opacity-60">
          {loading
            ? <><span className="animate-spin mr-2">⏳</span>Generating your plan…</>
            : <><Sparkles size={18}/>Generate Planning Guide</>
          }
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-4 animate-slide-up">
          {/* Overview */}
          <div className="card" style={{border:'2px solid var(--gold)'}}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{EVENT_EMOJIS[form.eventName]||'💍'}</span>
                <div>
                  <p className="font-display text-lg font-semibold" style={{color:'var(--text-dark)'}}>
                    {form.eventName} Planning Guide
                  </p>
                  <p className="text-xs" style={{color:'var(--text-muted)'}}>
                    {form.guestCount} guests · PKR {Number(form.budgetPKR).toLocaleString()}
                  </p>
                </div>
              </div>
              <button onClick={copyAll} className="btn-secondary py-1.5 px-3 text-sm">
                {copied ? <><Check size={13} className="text-green-600"/>Copied!</> : <><Copy size={13}/>Copy All</>}
              </button>
            </div>
            <p className="mt-3 text-sm" style={{color:'var(--text-mid)'}}>{result.overview}</p>
          </div>

          {/* Tasks */}
          <SuggestionCard title="Recommended Tasks" emoji="✅" items={result.tasks}
            open={open.tasks} onToggle={()=>setOpen(p=>({...p,tasks:!p.tasks}))}/>

          {/* Vendors */}
          <div className="card overflow-hidden">
            <button onClick={()=>setOpen(p=>({...p,vendors:!p.vendors}))}
              className="w-full flex items-center justify-between text-left">
              <div className="flex items-center gap-2">
                <span className="text-xl">🛍️</span>
                <h3 className="font-display font-semibold" style={{color:'var(--text-dark)'}}>Suggested Vendors & Budget</h3>
                <span className="badge text-xs" style={{background:'var(--champagne)',color:'var(--text-mid)'}}>{result.vendors.length} categories</span>
              </div>
              {open.vendors ? <ChevronUp size={16} style={{color:'var(--text-muted)'}}/> : <ChevronDown size={16} style={{color:'var(--text-muted)'}}/>}
            </button>
            {open.vendors && (
              <div className="mt-3 pt-3 space-y-2" style={{borderTop:'1px solid var(--champagne-border)'}}>
                {result.vendors.map((v,i)=>(
                  <div key={i} className="flex items-start justify-between p-3 rounded-xl" style={{background:'var(--cream-dark)'}}>
                    <div>
                      <p className="text-sm font-semibold" style={{color:'var(--text-dark)'}}>{v.category}</p>
                      <p className="text-xs mt-0.5" style={{color:'var(--text-soft)'}}>{v.notes}</p>
                    </div>
                    <span className="font-display font-bold text-sm flex-shrink-0 ml-3" style={{color:'var(--gold)'}}>{v.budget}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Responsibilities */}
          {result.responsibilities.length > 0 && (
            <div className="card overflow-hidden">
              <button onClick={()=>setOpen(p=>({...p,responsibilities:!p.responsibilities}))}
                className="w-full flex items-center justify-between text-left">
                <div className="flex items-center gap-2">
                  <span className="text-xl">👥</span>
                  <h3 className="font-display font-semibold" style={{color:'var(--text-dark)'}}>Responsibilities</h3>
                </div>
                {open.responsibilities ? <ChevronUp size={16} style={{color:'var(--text-muted)'}}/> : <ChevronDown size={16} style={{color:'var(--text-muted)'}}/>}
              </button>
              {open.responsibilities && (
                <div className="mt-3 pt-3 space-y-2" style={{borderTop:'1px solid var(--champagne-border)'}}>
                  {result.responsibilities.map((r,i)=>(
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-xl"
                      style={{background:r.side==='bride'?'#fce7f3':r.side==='groom'?'#dbeafe':'#d1fae5'}}>
                      <p className="text-sm" style={{color:'var(--text-dark)'}}>{r.name}</p>
                      <span className={`badge text-xs ${r.side==='bride'?'resp-bride':r.side==='groom'?'resp-groom':'resp-shared'}`}>
                        {r.side==='bride'?'Bride Side':r.side==='groom'?'Groom Side':'Shared'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tips */}
          <SuggestionCard title="Expert Tips for Pakistani Weddings" emoji="💡" items={result.tips}
            open={open.tips} onToggle={()=>setOpen(p=>({...p,tips:!p.tips}))}/>

          {/* Add to planner CTA */}
          <div className="card text-center" style={{background:'var(--champagne)'}}>
            <p className="font-display font-semibold mb-1" style={{color:'var(--text-dark)'}}>Ready to add this to your planner?</p>
            <p className="text-sm mb-3" style={{color:'var(--text-soft)'}}>Copy the tasks and add them manually, or use the links below</p>
            <div className="flex flex-wrap justify-center gap-3">
              <a href="/tasks"   className="btn-primary">➕ Go to Tasks</a>
              <a href="/vendors" className="btn-secondary">🛍️ Go to Vendors</a>
              <a href="/budget"  className="btn-secondary">💰 Go to Budget</a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
