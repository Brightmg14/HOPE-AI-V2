import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import {
  Activity, Bell, Bot, CalendarDays, ChevronRight, ClipboardCheck, Download, HeartPulse,
  Home, Languages, LayoutDashboard, MapPin, Menu, MessageSquareText, Mic, Phone,
  Pill, Plus, Search, Settings, ShieldCheck, Stethoscope, Users, Volume2, X
} from 'lucide-react'
import {
  Bar, BarChart, CartesianGrid, Legend, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts'
import type { Appointment, Beneficiary, DemoData, Language, Role } from './types'
import { loadData, resetData, saveData } from './storage'
import { t } from './translations'
import './App.css'

const beneficiaryNav = [
  ['home', 'Home', Home], ['assistant', 'AI Assistant', Bot], ['appointments', 'My Appointments', CalendarDays],
  ['medication', 'Medication Reminders', Pill], ['information', 'Healthcare Information', HeartPulse], ['profile', 'My Profile', Users],
] as const

const staffNav = [
  ['dashboard', 'Dashboard', LayoutDashboard], ['beneficiaries', 'Beneficiaries', Users],
  ['appointments', 'Appointments', CalendarDays], ['reminders', 'Reminders', Bell],
  ['schedule', 'Clinic Schedule', Stethoscope], ['announcements', 'Announcements', MessageSquareText],
  ['reports', 'Reports', Activity], ['settings', 'Settings', Settings],
] as const

type SpeechRecognitionInstance = {
  lang: string
  continuous: boolean
  interimResults: boolean
  start: () => void
  stop: () => void
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onend: (() => void) | null
}
type SpeechRecognitionEventLike = { results: ArrayLike<ArrayLike<{ transcript: string }>> }
type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }
}

function formatDate(date: string, language: Language = 'en') {
  const value = new Date(`${date}T12:00:00`)
  if (language === 'xh') {
    const day = String(value.getDate()).padStart(2, '0')
    const month = String(value.getMonth() + 1).padStart(2, '0')
    return `${day}/${month}/${value.getFullYear()}`
  }
  const locale = language === 'af' ? 'af-ZA' : 'en-ZA'
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' }).format(value)
}

function formatMonth(date: string, language: Language) {
  const value = new Date(`${date}T12:00:00`)
  if (language === 'xh') return String(value.getMonth() + 1).padStart(2, '0')
  const locale = language === 'af' ? 'af-ZA' : 'en-ZA'
  return new Intl.DateTimeFormat(locale, { month: 'short' }).format(value)
}

function App() {
  const [data, setData] = useState<DemoData>(() => loadData())
  const [role, setRole] = useState<Role | null>(null)
  const [language, setLanguage] = useState<Language>('en')
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [page, setPage] = useState('home')
  const [mobileNav, setMobileNav] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    document.documentElement.lang = language
    document.title = t(language, 'HopeCare AI — Community Healthcare Support')
  }, [language])

  const updateData = (next: DemoData) => {
    setData(next)
    saveData(next)
  }

  const notify = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2600)
  }

  const enterPortal = (selectedRole: Role) => {
    setRole(selectedRole)
    setPage(selectedRole === 'beneficiary' ? 'home' : 'dashboard')
  }

  if (!role) {
    return (
      <Landing language={language} setLanguage={setLanguage} voiceEnabled={voiceEnabled} toggleVoice={() => setVoiceEnabled(current => !current)} enterPortal={enterPortal} toast={toast} />
    )
  }

  const nav = role === 'beneficiary' ? beneficiaryNav : staffNav
  const title = nav.find(item => item[0] === page)?.[1] ?? 'HopeCare AI'
  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? 'open' : ''}`}>
        <button className="close-nav" aria-label={t(language, 'Close navigation')} onClick={() => setMobileNav(false)}><X /></button>
        <div className="brand" onClick={() => setPage(role === 'beneficiary' ? 'home' : 'dashboard')}>
          <div className="brand-mark"><HeartPulse /></div>
          <div><strong>HopeCare</strong><span>AI</span></div>
        </div>
        <nav aria-label={t(language, 'Main navigation')}>
          {nav.map(([id, label, Icon]) => (
            <button key={id} className={page === id ? 'active' : ''} onClick={() => { setPage(id); setMobileNav(false) }}>
              <Icon size={19} /><span>{t(language, label)}</span>
            </button>
          ))}
        </nav>
        <button className="exit-button" onClick={() => setRole(null)}>{t(language, 'Exit to welcome')}</button>
      </aside>
      {mobileNav && <button className="nav-backdrop" aria-label={t(language, 'Close navigation')} onClick={() => setMobileNav(false)} />}
      <main className="main-area">
        <header className="topbar">
          <button className="menu-button" aria-label={t(language, 'Open navigation')} onClick={() => setMobileNav(true)}><Menu /></button>
          <div><span className="eyebrow">{t(language, role === 'beneficiary' ? 'Beneficiary Portal' : 'Staff Administration')}</span><h1>{t(language, title)}</h1></div>
          <label className="language-picker"><Languages size={17} />
            <select value={language} onChange={event => setLanguage(event.target.value as Language)} aria-label={t(language, 'Language')}>
              <option value="en">{t(language, 'English')}</option><option value="af">{t(language, 'Afrikaans')}</option><option value="xh">{t(language, 'isiXhosa')}</option>
            </select>
          </label>
        </header>
        <div className="page-content">
          {role === 'beneficiary'
            ? <BeneficiaryPages page={page} data={data} language={language} voiceEnabled={voiceEnabled} updateData={updateData} notify={notify} />
            : <StaffPages page={page} data={data} language={language} updateData={updateData} notify={notify} />}
        </div>
      </main>
      {toast && <div className="toast" role="status"><ShieldCheck size={18} />{toast}</div>}
    </div>
  )
}

function Landing({ language, setLanguage, voiceEnabled, toggleVoice, enterPortal, toast }: {
  language: Language
  setLanguage: (language: Language) => void
  voiceEnabled: boolean
  toggleVoice: () => void
  enterPortal: (role: Role) => void
  toast: string
}) {
  const [loginRole, setLoginRole] = useState<Role | null>(null)

  return (
    <div className="landing">
      <header className="landing-header">
        <div className="brand"><div className="brand-mark"><HeartPulse /></div><div><strong>HopeCare</strong><span>AI</span></div></div>
        <div className="landing-header-actions">
          <button type="button" className={`landing-mic-button ${voiceEnabled ? 'enabled' : ''}`} aria-label={t(language, voiceEnabled ? 'Disable voice features' : 'Enable voice features')} aria-pressed={voiceEnabled} title={t(language, voiceEnabled ? 'Voice features enabled' : 'Voice features disabled')} onClick={toggleVoice}><Mic size={18} /></button>
          <label className="language-picker"><Languages size={17} /><select value={language} onChange={e => setLanguage(e.target.value as Language)} aria-label={t(language, 'Language')}><option value="en">{t(language, 'English')}</option><option value="af">{t(language, 'Afrikaans')}</option><option value="xh">{t(language, 'isiXhosa')}</option></select></label>
        </div>
      </header>
      <main className="hero">
        <section className="hero-copy">
          <h2 className="hello-greeting">{t(language, 'welcome')}</h2>
          <div className="portal-actions">
            <button className="primary-action" onClick={() => setLoginRole('beneficiary')}><Users /><span><small>{t(language, 'For community members')}</small>{t(language, 'beneficiary')}</span><ChevronRight /></button>
            <button className="secondary-action" onClick={() => setLoginRole('staff')}><Stethoscope /><span><small>{t(language, 'For clinic teams')}</small>{t(language, 'staff')}</span><ChevronRight /></button>
          </div>
        </section>
      </main>
      {toast && <div className="toast">{toast}</div>}
      {loginRole && (
        <div className="login-backdrop" onClick={() => setLoginRole(null)}>
          <section className="login-dialog" role="dialog" aria-modal="true" aria-labelledby="login-title" onClick={event => event.stopPropagation()}>
            <div className="login-heading">
              <div>
                <span className="eyebrow">{t(language, 'demoLogin')}</span>
                <h2 id="login-title">{t(language, loginRole === 'beneficiary' ? 'beneficiaryLoginTitle' : 'staffLoginTitle')}</h2>
              </div>
              <button className="icon-btn" type="button" aria-label={t(language, 'close')} onClick={() => setLoginRole(null)}><X size={18} /></button>
            </div>
            <form className="login-fields" onSubmit={event => {
              event.preventDefault()
              enterPortal(loginRole)
            }}>
              <label className="field-label">
                {t(language, 'email')}
                <input type="email" autoComplete="email" required />
              </label>
              <label className="field-label">
                {t(language, 'password')}
                <input type="password" autoComplete="current-password" required />
              </label>
              <p className="login-note">{t(language, 'demoLoginNote')}</p>
              <button className="button button-primary login-submit" type="submit">{t(language, 'login')}</button>
            </form>
          </section>
        </div>
      )}
    </div>
  )
}

function BeneficiaryPages({ page, data, language, voiceEnabled, updateData, notify }: {
  page: string
  data: DemoData
  language: Language
  voiceEnabled: boolean
  updateData: (data: DemoData) => void
  notify: (message: string) => void
}) {
  const beneficiary = data.beneficiaries.find(person => person.id === 'HC-1001') ?? data.beneficiaries[0]
  const appointments = data.appointments.filter(item => item.beneficiaryId === beneficiary.id)
  const reminders = data.reminders.filter(item => item.beneficiaryId === beneficiary.id)
  const upcoming = appointments.find(item => item.status === 'Scheduled')

  if (page === 'assistant') return <Assistant language={language} voiceEnabled={voiceEnabled} updateData={updateData} data={data} />
  if (page === 'appointments') return (
    <section>
      <div className="section-heading"><div><span className="eyebrow">{t(language, 'Appointment history')}</span><h2>{t(language, 'Your appointments')}</h2></div></div>
      <div className="list-stack">
        {appointments.map(item => (
          <article className="info-card appointment-row" key={item.id}>
            <div className="date-tile"><strong>{new Date(`${item.date}T12:00:00`).getDate()}</strong><span>{formatMonth(item.date, language)}</span></div>
            <div className="row-main"><span className={`status ${item.status.toLowerCase()}`}>{t(language, item.status)}</span><h3>{t(language, item.type)}</h3><p><CalendarDays size={15} /> {formatDate(item.date, language)} {t(language, 'at')} {item.time}</p><p><MapPin size={15} /> {t(language, item.location)}</p></div>
            {item.status === 'Scheduled' && <button className={item.acknowledged ? 'button muted' : 'button'} onClick={() => {
              updateData({ ...data, appointments: data.appointments.map(appt => appt.id === item.id ? { ...appt, acknowledged: true } : appt) })
              notify(t(language, 'Appointment reminder acknowledged'))
            }}>{item.acknowledged ? t(language, 'Acknowledged') : t(language, 'Acknowledge reminder')}</button>}
          </article>
        ))}
      </div>
    </section>
  )
  if (page === 'medication') return (
    <section>
      <div className="section-heading"><div><span className="eyebrow">{t(language, 'Collection support')}</span><h2>{t(language, 'Medication Reminders')}</h2></div></div>
      {reminders.length ? reminders.map(item => (
        <article className="info-card reminder-card" key={item.id}>
          <div className="icon-bubble"><Pill /></div><div className="row-main"><span className={`status ${item.status.toLowerCase()}`}>{t(language, item.status)}</span><h3>{t(language, item.kind === 'Medication' ? 'Medication collection' : 'Appointment reminder')}</h3><p>{formatDate(item.date, language)} · {t(language, 'Hope Exchange Community Clinic')}</p><small>{t(language, item.message)}</small></div>
          {item.status === 'Pending' && <button className="button" onClick={() => {
            updateData({ ...data, reminders: data.reminders.map(reminder => reminder.id === item.id ? { ...reminder, status: 'Acknowledged' } : reminder) })
            notify(t(language, 'Reminder acknowledged'))
          }}>{t(language, 'Acknowledge')}</button>}
        </article>
      )) : <div className="empty-state"><Pill /><h3>{t(language, 'No medication reminders')}</h3><p>{t(language, 'You have no fictional medication collections scheduled.')}</p></div>}
      <div className="notice"><ShieldCheck /><span><strong>{t(language, 'Medication safety')}</strong><br />{t(language, 'This demonstration never recommends changing prescribed medication instructions. Follow the advice of your healthcare professional.')}</span></div>
    </section>
  )
  if (page === 'information') return <HealthcareInformation data={data} language={language} />
  if (page === 'profile') return (
    <section>
      <div className="profile-card">
        <div className="profile-avatar">{beneficiary.name.split(' ').map(name => name[0]).join('')}</div>
        <div><span className="eyebrow">{t(language, 'Fictional demo profile')}</span><h2>{beneficiary.name}</h2><p>{t(language, 'Beneficiary ID')} · {beneficiary.id}</p></div>
      </div>
      <div className="detail-grid">
        <article className="info-card"><Languages /><h3>{t(language, 'Preferred language')}</h3><p>{{ en: t(language, 'English'), af: t(language, 'Afrikaans'), xh: t(language, 'isiXhosa') }[beneficiary.language]}</p></article>
        <article className="info-card"><Bell /><h3>{t(language, 'Notifications')}</h3><p>{t(language, beneficiary.notifications ? 'Enabled' : 'Disabled')} {t(language, '(demo preference)')}</p></article>
        <article className="info-card"><CalendarDays /><h3>{t(language, 'Upcoming appointments')}</h3><p>{appointments.filter(item => item.status === 'Scheduled').length}</p></article>
      </div>
    </section>
  )

  return (
    <section className="beneficiary-home">
      <div className="welcome-banner">
        <div><span className="eyebrow">{t(language, 'Good day')}</span><h2>{t(language, 'welcome')}, {beneficiary.name.split(' ')[0]} <span aria-hidden="true">👋</span></h2><p>{t(language, 'How can we support you today?')}</p></div>
        <div className="welcome-art"><HeartPulse /></div>
      </div>
      <div className="dashboard-grid two-column">
        <article className="info-card next-card">
          <div className="card-heading"><span className="icon-bubble soft-blue"><CalendarDays /></span><h3>{t(language, 'Next appointment')}</h3></div>
          {upcoming ? <><strong className="large-date">{formatDate(upcoming.date, language)}</strong><p>{upcoming.time} · {t(language, upcoming.location)}</p><p className="muted-text">{t(language, upcoming.type)}</p><button className="text-button" onClick={() => { notify(t(language, 'Appointment details opened')) }}>{t(language, 'View appointment')} <ChevronRight size={16} /></button></> : <p>{t(language, 'No upcoming appointment.')}</p>}
        </article>
        <article className="info-card next-card">
          <div className="card-heading"><span className="icon-bubble soft-green"><Pill /></span><h3>{t(language, 'Medication collection')}</h3></div>
          {reminders.find(item => item.kind === 'Medication') ? <><strong className="large-date">{formatDate(reminders.find(item => item.kind === 'Medication')!.date, language)}</strong><p>{t(language, 'Hope Exchange Community Clinic')}</p><p className="muted-text">{t(language, 'Collection reminder')}</p></> : <p>{t(language, 'No medication collection reminder.')}</p>}
        </article>
      </div>
      <article className="announcement-strip"><Bell /><div><span className="eyebrow">{t(language, 'Clinic announcement')}</span><p>{data.announcements.find(item => item.status === 'Approved')?.[language] ?? data.announcements.find(item => item.status === 'Approved')?.en ?? t(language, 'No approved announcements.')}</p></div></article>
      <div className="quick-grid">
        <button className="quick-card" onClick={() => notify(t(language, 'Open AI Assistant from the navigation'))}><span className="icon-bubble"><Bot /></span><div><strong>{t(language, 'Ask the AI Assistant')}</strong><small>{t(language, 'Get help in English, Afrikaans or isiXhosa')}</small></div><ChevronRight /></button>
        <button className="quick-card" onClick={() => notify(t(language, 'Clinic information is available below'))}><span className="icon-bubble soft-blue"><HeartPulse /></span><div><strong>{t(language, 'Healthcare Information')}</strong><small>{t(language, 'Hours, services and common questions')}</small></div><ChevronRight /></button>
      </div>
    </section>
  )
}

function Assistant({ language, voiceEnabled, data, updateData }: { language: Language; voiceEnabled: boolean; data: DemoData; updateData: (data: DemoData) => void }) {
  const [messages, setMessages] = useState<{ role: 'assistant' | 'user'; text: string; time: string }[]>([
    { role: 'assistant', text: 'assistantGreeting', time: 'Now' },
  ])
  const [input, setInput] = useState('')
  const [listening, setListening] = useState(false)

  const respond = (question: string, voice = false) => {
    if (!question.trim()) return
    const locale = language === 'af' ? 'af-ZA' : language === 'xh' ? 'xh-ZA' : 'en-ZA'
    const time = new Date().toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
    let answer: string
    const lower = question.toLocaleLowerCase()
    if (/emergency|bleeding|chest pain|breathe|accident|suicide|noodgeval|bloei|borspyn|asemhaal|ongxamisekileyo|ukopha|intlungu yesifuba|ukuphefumla/.test(lower)) {
      answer = 'This may be an emergency. Seek immediate help from a South African healthcare professional. Call 112 from a mobile phone or go to the nearest emergency centre. Do not wait for this demonstration assistant.'
    } else if (/clinic day|next.*clinic|appointment|kliniekdag|afspraak|kliniki|indibano/.test(lower)) {
      answer = 'The fictional next clinic day is 1 December 2026. This demonstration does not invent or access real appointments; please confirm all appointment details with clinic staff.'
    } else if (/open|hours|opening|ure|oop|amaxesha okuvula/.test(lower)) {
      answer = 'The fictional Hope Exchange Community Clinic is open Monday to Friday from 09:00 to 16:00. It is closed on weekends and public holidays.'
    } else if (/medication|collect|medicine|medikasie|afhaal|amayeza|landa/.test(lower)) {
      answer = 'The next fictional medication collection is 2 December 2026 at the Hope Exchange Community Clinic. I cannot change or recommend medication doses; follow your prescription and ask a healthcare professional about it.'
    } else if (/location|where|ligging|waar|indawo|iphi/.test(lower)) {
      answer = 'The fictional clinic location is the Hope Exchange Community Clinic, Cape Town, South Africa. Please confirm directions with the clinic before travelling.'
    } else if (/prepare|bring|voorberei|saambring|lungiselela|yiza/.test(lower)) {
      answer = 'For an appointment, bring your clinic card or ID if required, arrive a little early, write down questions, and tell staff about any concerns. These are general fictional-demo suggestions.'
    } else if (/service|dienste|inkonzo|iinkonzo/.test(lower)) {
      answer = 'Fictional available services include primary healthcare consultations, medication collection, health screenings, follow-up consultations and health education.'
    } else {
      answer = 'I can explain fictional clinic hours, locations, appointments, medication collection and available services. For personal medical advice, please consult a healthcare professional.'
    }
    setMessages(current => [...current, { role: 'user', text: question, time }, { role: 'assistant', text: answer, time }])
    updateData({ ...data, chatbotInteractions: [...data.chatbotInteractions, { language, voice, question }] })
  }

  const startListening = () => {
    const Constructor = window.SpeechRecognition ?? window.webkitSpeechRecognition
    if (!Constructor) {
      setMessages(current => [...current, { role: 'assistant', text: 'Voice input is not supported in this browser. You can still type your question.', time: 'Now' }])
      return
    }
    const recognition = new Constructor()
    recognition.lang = language === 'af' ? 'af-ZA' : language === 'xh' ? 'xh-ZA' : 'en-ZA'
    recognition.continuous = false
    recognition.interimResults = false
    recognition.onresult = event => {
      const transcript = event.results[0]?.[0]?.transcript
      if (transcript) respond(transcript, true)
    }
    recognition.onend = () => setListening(false)
    setListening(true)
    recognition.start()
  }

  const speakLast = () => {
    const last = [...messages].reverse().find(message => message.role === 'assistant')
    if (!voiceEnabled || !last || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(t(language, last.text))
    utterance.lang = language === 'af' ? 'af-ZA' : language === 'xh' ? 'xh-ZA' : 'en-ZA'
    window.speechSynthesis.speak(utterance)
  }

  const suggested = [
    'When is the next clinic day?',
    'When do I need to collect my medication?',
    'What healthcare services are available this week?',
  ]

  return (
    <section className="chat-layout">
      <div className="chat-main">
        <div className="chat-header"><span className="icon-bubble"><Bot /></span><div><strong>{t(language, 'HopeCare AI')}</strong></div><button className="icon-button" aria-label={t(language, 'Clear conversation')} onClick={() => setMessages([{ role: 'assistant', text: 'Conversation cleared. How can I help?', time: 'Now' }])}><X /></button></div>
        <div className="chat-messages" aria-live="polite">
          {messages.map((message, index) => <div className={`message ${message.role}`} key={index}><div>{message.role === 'assistant' || suggested.includes(message.text) ? t(language, message.text) : message.text}</div><small>{message.time}</small></div>)}
        </div>
        <div className="chat-input">
          <button className={`mic-button ${listening ? 'listening' : ''}`} aria-label={t(language, !voiceEnabled ? 'Voice input disabled' : listening ? 'Listening for microphone input' : 'Use voice input')} disabled={!voiceEnabled} onClick={startListening}><Mic /></button>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { respond(input); setInput('') } }} placeholder={t(language, listening ? 'Listening… microphone permission may be required' : 'Type your question')} />
          <button className="send-button" aria-label={t(language, 'Send message')} onClick={() => { respond(input); setInput('') }}>{t(language, 'Send')}</button>
        </div>
        <div className="voice-actions"><button disabled={!voiceEnabled} onClick={speakLast}><Volume2 size={16} /> {t(language, 'Read last response')}</button><button onClick={() => window.speechSynthesis?.cancel()}><X size={16} /> {t(language, 'Stop speaking')}</button></div>
        <div className="suggested-prompts">
          <span>{t(language, 'Suggested questions')}</span>
          <div>{suggested.map(question => <button key={question} onClick={() => respond(question)}>{t(language, question)}<ChevronRight /></button>)}</div>
        </div>
      </div>
    </section>
  )
}

function HealthcareInformation({ data, language }: { data: DemoData; language: Language }) {
  return (
    <section>
      <div className="section-heading"><div><span className="eyebrow">{t(language, 'Fictional clinic information')}</span><h2>{t(language, 'Healthcare information')}</h2></div></div>
      <div className="detail-grid">
        <article className="info-card"><Activity /><h3>{t(language, 'Operating hours')}</h3><p>{t(language, 'Monday–Friday: 09:00–16:00')}</p></article>
        <article className="info-card"><Stethoscope /><h3>{t(language, 'Available services')}</h3><p>{t(language, 'Consultations, medication collection, screening and health education')}</p></article>
        <article className="info-card"><Phone /><h3>{t(language, 'Clinic contact')}</h3><p>021 555 0100 · {t(language, 'Fictional demo number')}</p></article>
      </div>
      <div className="dashboard-grid two-column">
        <article className="info-card"><h3>{t(language, 'Upcoming health events')}</h3><div className="list-stack compact">{data.clinicEvents.map(event => <div className="mini-row" key={event.id}><CalendarDays /><div><strong>{t(language, event.name)}</strong><p>{formatDate(event.date, language)} · {event.hours}</p></div></div>)}</div></article>
        <article className="info-card"><h3>{t(language, 'Frequently asked questions')}</h3><details><summary>{t(language, 'What should I bring?')}</summary><p>{t(language, 'Bring your clinic card or ID if requested, plus your questions.')}</p></details><details><summary>{t(language, 'Can I walk in?')}</summary><p>{t(language, 'Appointments are recommended; urgent care may differ.')}</p></details><details><summary>{t(language, 'Where is the clinic?')}</summary><p>{t(language, 'The fictional clinic is in Cape Town, South Africa.')}</p></details></article>
      </div>
    </section>
  )
}

function StaffPages({ page, data, language, updateData, notify }: {
  page: string
  data: DemoData
  language: Language
  updateData: (data: DemoData) => void
  notify: (message: string) => void
}) {
  if (page === 'dashboard') {
    const scheduled = data.appointments.filter(item => item.status === 'Scheduled').length
    const completed = data.appointments.filter(item => item.status === 'Completed').length
    const missed = data.appointments.filter(item => item.status === 'Missed').length
    const attendance = [
      { name: t(language, 'Mon'), attended: 18, missed: 3 }, { name: t(language, 'Tue'), attended: 22, missed: 2 },
      { name: t(language, 'Wed'), attended: 20, missed: 4 }, { name: t(language, 'Thu'), attended: 25, missed: 2 }, { name: t(language, 'Fri'), attended: 21, missed: 3 },
    ]
    const languages = [
      { name: t(language, 'English'), value: data.beneficiaries.filter(item => item.language === 'en').length },
      { name: t(language, 'Afrikaans'), value: data.beneficiaries.filter(item => item.language === 'af').length },
      { name: t(language, 'isiXhosa'), value: data.beneficiaries.filter(item => item.language === 'xh').length },
    ]
    return (
      <section>
        <div className="kpi-grid">
          <Kpi icon={<Users />} label={t(language, 'Total beneficiaries')} value={data.beneficiaries.length} />
          <Kpi icon={<CalendarDays />} label={t(language, 'Appointments scheduled')} value={scheduled} />
          <Kpi icon={<ClipboardCheck />} label={t(language, 'Completed')} value={completed} />
          <Kpi icon={<X />} label={t(language, 'Missed')} value={missed} />
          <Kpi icon={<Bell />} label={t(language, 'Reminders sent')} value={data.reminders.length * 3} />
          <Kpi icon={<Bot />} label={t(language, 'Chatbot interactions')} value={data.chatbotInteractions.length} />
        </div>
        <div className="dashboard-grid chart-grid">
          <article className="info-card"><h3>{t(language, 'Clinic attendance this week')}</h3><div className="chart-box"><ResponsiveContainer width="100%" height="100%"><LineChart data={attendance}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Legend /><Line type="monotone" dataKey="attended" name={t(language, 'Attended')} stroke="var(--color-primary)" /><Line type="monotone" dataKey="missed" name={t(language, 'Missed')} stroke="#df8a73" /></LineChart></ResponsiveContainer></div></article>
          <article className="info-card"><h3>{t(language, 'Beneficiary languages')}</h3><div className="chart-box"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={languages} dataKey="value" nameKey="name" outerRadius={85} fill="var(--color-primary)" label /> <Tooltip /></PieChart></ResponsiveContainer></div></article>
          <article className="info-card"><h3>{t(language, 'Completed versus missed')}</h3><div className="chart-box"><ResponsiveContainer width="100%" height="100%"><BarChart data={[{ name: t(language, 'Appointments'), completed, missed }]}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="completed" name={t(language, 'Completed')} fill="var(--color-primary)" /><Bar dataKey="missed" name={t(language, 'Missed')} fill="#df8a73" /></BarChart></ResponsiveContainer></div></article>
          <article className="info-card"><h3>{t(language, 'Chatbot interactions')}</h3><div className="chart-box"><ResponsiveContainer width="100%" height="100%"><BarChart data={[
            { name: t(language, 'English'), value: data.chatbotInteractions.filter(item => item.language === 'en').length },
            { name: t(language, 'Afrikaans'), value: data.chatbotInteractions.filter(item => item.language === 'af').length },
            { name: t(language, 'isiXhosa'), value: data.chatbotInteractions.filter(item => item.language === 'xh').length },
          ]}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="value" fill="var(--color-primary)" /></BarChart></ResponsiveContainer></div></article>
        </div>
      </section>
    )
  }

  if (page === 'beneficiaries') return <BeneficiaryManager data={data} language={language} updateData={updateData} notify={notify} />
  if (page === 'appointments') return <AppointmentManager data={data} language={language} updateData={updateData} notify={notify} />
  if (page === 'reminders') return <ReminderManager data={data} language={language} updateData={updateData} notify={notify} />
  if (page === 'schedule') return <ScheduleManager data={data} language={language} updateData={updateData} notify={notify} />
  if (page === 'announcements') return <AnnouncementManager data={data} language={language} updateData={updateData} notify={notify} />
  if (page === 'reports') return <Reports data={data} language={language} notify={notify} />
  if (page === 'settings') return (
    <section>
      <div className="section-heading"><div><span className="eyebrow">{t(language, 'Demonstration controls')}</span><h2>{t(language, 'Settings')}</h2></div></div>
      <article className="info-card settings-card"><div><h3>{t(language, 'Reset all demo data')}</h3><p>{t(language, 'Restore fictional beneficiaries, appointments, reminders and announcements.')}</p></div><button className="danger-button" onClick={() => { updateData(resetData()); notify(t(language, 'Demo data reset')) }}>{t(language, 'Reset demo data')}</button></article>
      <article className="notice"><ShieldCheck /><span><strong>{t(language, 'Privacy notice')}</strong><br />{t(language, 'LocalStorage is not secure shared storage. This demo is not production authentication or POPIA-compliant healthcare software.')}</span></article>
    </section>
  )
  return null
}

function Kpi({ icon, label, value }: { icon: ReactNode; label: string; value: number }) {
  return <article className="kpi-card"><span>{icon}</span><div><strong>{value}</strong><small>{label}</small></div></article>
}

function BeneficiaryManager({ data, language, updateData, notify }: { data: DemoData; language: Language; updateData: (data: DemoData) => void; notify: (message: string) => void }) {
  const [search, setSearch] = useState('')
  const [form, setForm] = useState(false)
  const [editing, setEditing] = useState<Beneficiary | null>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [preferredLanguage, setPreferredLanguage] = useState<Language>('en')
  const visible = data.beneficiaries.filter(person => `${person.name} ${person.id} ${person.phone}`.toLowerCase().includes(search.toLowerCase()))

  const openForm = (person?: Beneficiary) => {
    setEditing(person ?? null)
    setName(person?.name ?? '')
    setPhone(person?.phone ?? '')
    setPreferredLanguage(person?.language ?? 'en')
    setForm(true)
  }
  const save = () => {
    if (!name.trim()) return notify(t(language, 'Beneficiary name is required'))
    if (editing) {
      updateData({ ...data, beneficiaries: data.beneficiaries.map(person => person.id === editing.id ? { ...person, name: name.trim(), phone, language: preferredLanguage } : person) })
      notify(t(language, 'Beneficiary updated'))
    } else {
      const id = `HC-${String(1100 + data.beneficiaries.length).padStart(4, '0')}`
      updateData({ ...data, beneficiaries: [...data.beneficiaries, { id, name: name.trim(), phone, language: preferredLanguage, notifications: true }] })
      notify(t(language, 'Fictional beneficiary registered'))
    }
    setForm(false)
  }

  return (
    <section>
      <div className="section-heading"><div><span className="eyebrow">{t(language, 'Fictional records')}</span><h2>{t(language, 'Beneficiary management')}</h2></div><button className="button" onClick={() => openForm()}><Plus size={17} /> {t(language, 'Register beneficiary')}</button></div>
      {form && <div className="form-card"><h3>{t(language, editing ? 'Edit beneficiary' : 'Register beneficiary')}</h3><div className="form-grid"><label>{t(language, 'Name')}<input value={name} onChange={e => setName(e.target.value)} placeholder={t(language, 'Fictional full name')} /></label><label>{t(language, 'Phone')}<input value={phone} onChange={e => setPhone(e.target.value)} placeholder="071 000 0000" /></label><label>{t(language, 'Preferred language')}<select value={preferredLanguage} onChange={e => setPreferredLanguage(e.target.value as Language)}><option value="en">{t(language, 'English')}</option><option value="af">{t(language, 'Afrikaans')}</option><option value="xh">{t(language, 'isiXhosa')}</option></select></label></div><div className="form-actions"><button className="button muted" onClick={() => setForm(false)}>{t(language, 'Cancel')}</button><button className="button" onClick={save}>{t(language, 'Save beneficiary')}</button></div></div>}
      <div className="toolbar"><label><Search size={17} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder={t(language, 'Search name, ID or phone')} /></label></div>
      <div className="table-wrap"><table><thead><tr><th>{t(language, 'Beneficiary')}</th><th>{t(language, 'ID')}</th><th>{t(language, 'Language')}</th><th>{t(language, 'Phone')}</th><th>{t(language, 'Notifications')}</th><th></th></tr></thead><tbody>{visible.map(person => <tr key={person.id}><td><strong>{person.name}</strong></td><td>{person.id}</td><td>{t(language, person.language === 'en' ? 'English' : person.language === 'af' ? 'Afrikaans' : 'isiXhosa')}</td><td>{person.phone}</td><td>{t(language, person.notifications ? 'Enabled' : 'Disabled')}</td><td><button className="text-button" onClick={() => openForm(person)}>{t(language, 'Edit')}</button></td></tr>)}</tbody></table></div>
    </section>
  )
}

function AppointmentManager({ data, language, updateData, notify }: { data: DemoData; language: Language; updateData: (data: DemoData) => void; notify: (message: string) => void }) {
  const [filter, setFilter] = useState('All')
  const [form, setForm] = useState(false)
  const [editing, setEditing] = useState<Appointment | null>(null)
  const [beneficiaryId, setBeneficiaryId] = useState(data.beneficiaries[0]?.id ?? '')
  const [date, setDate] = useState('2026-12-15')
  const [time, setTime] = useState('09:00')
  const [location, setLocation] = useState('Hope Exchange Community Clinic')
  const [type, setType] = useState('General consultation')
  const [status, setStatus] = useState<Appointment['status']>('Scheduled')
  const visible = filter === 'All' ? data.appointments : data.appointments.filter(item => item.status === filter)

  const openForm = (appointment?: Appointment) => {
    setEditing(appointment ?? null)
    setBeneficiaryId(appointment?.beneficiaryId ?? data.beneficiaries[0]?.id ?? '')
    setDate(appointment?.date ?? '2026-12-15')
    setTime(appointment?.time ?? '09:00')
    setLocation(appointment?.location ?? 'Hope Exchange Community Clinic')
    setType(appointment?.type ?? 'General consultation')
    setStatus(appointment?.status ?? 'Scheduled')
    setForm(true)
  }
  const save = () => {
    const record: Appointment = { id: editing?.id ?? `AP-${String(data.appointments.length + 1).padStart(3, '0')}`, beneficiaryId, date, time, location, type, status, acknowledged: editing?.acknowledged ?? false }
    updateData({ ...data, appointments: editing ? data.appointments.map(item => item.id === editing.id ? record : item) : [...data.appointments, record] })
    setForm(false)
    notify(t(language, editing ? 'Appointment updated' : 'Appointment created'))
  }
  return (
    <section>
      <div className="section-heading"><div><span className="eyebrow">{t(language, 'Scheduling')}</span><h2>{t(language, 'Appointment management')}</h2></div><button className="button" onClick={() => openForm()}><Plus size={17} /> {t(language, 'Create appointment')}</button></div>
      {form && <div className="form-card"><h3>{t(language, editing ? 'Edit appointment' : 'Create appointment')}</h3><div className="form-grid">
        <label>{t(language, 'Beneficiary')}<select value={beneficiaryId} onChange={e => setBeneficiaryId(e.target.value)}>{data.beneficiaries.map(person => <option value={person.id} key={person.id}>{person.name}</option>)}</select></label>
        <label>{t(language, 'Date')}<input type="date" value={date} onChange={e => setDate(e.target.value)} /></label><label>{t(language, 'Time')}<input type="time" value={time} onChange={e => setTime(e.target.value)} /></label>
        <label>{t(language, 'Location')}<input value={t(language, location)} onChange={e => setLocation(e.target.value)} /></label><label>{t(language, 'Type')}<input value={t(language, type)} onChange={e => setType(e.target.value)} /></label>
        <label>{t(language, 'Status')}<select value={status} onChange={e => setStatus(e.target.value as Appointment['status'])}><option value="Scheduled">{t(language, 'Scheduled')}</option><option value="Completed">{t(language, 'Completed')}</option><option value="Missed">{t(language, 'Missed')}</option></select></label>
      </div><div className="form-actions"><button className="button muted" onClick={() => setForm(false)}>{t(language, 'Cancel')}</button><button className="button" onClick={save}>{t(language, 'Save appointment')}</button></div></div>}
      <div className="filter-row"><label>{t(language, 'Filter')}<select value={filter} onChange={e => setFilter(e.target.value)}><option value="All">{t(language, 'All')}</option><option value="Scheduled">{t(language, 'Scheduled')}</option><option value="Completed">{t(language, 'Completed')}</option><option value="Missed">{t(language, 'Missed')}</option></select></label></div>
      <div className="table-wrap"><table><thead><tr><th>{t(language, 'Beneficiary')}</th><th>{t(language, 'Date')}</th><th>{t(language, 'Time')}</th><th>{t(language, 'Type')}</th><th>{t(language, 'Location')}</th><th>{t(language, 'Status')}</th><th></th></tr></thead><tbody>{visible.map(item => {
        const person = data.beneficiaries.find(person => person.id === item.beneficiaryId)
        return <tr key={item.id}><td><strong>{person?.name}</strong></td><td>{formatDate(item.date, language)}</td><td>{item.time}</td><td>{t(language, item.type)}</td><td>{t(language, item.location)}</td><td><span className={`status ${item.status.toLowerCase()}`}>{t(language, item.status)}</span></td><td><button className="text-button" onClick={() => openForm(item)}>{t(language, 'Edit')}</button></td></tr>
      })}</tbody></table></div>
    </section>
  )
}

function ReminderManager({ data, language, updateData, notify }: { data: DemoData; language: Language; updateData: (data: DemoData) => void; notify: (message: string) => void }) {
  const [filter, setFilter] = useState('All')
  const [kind, setKind] = useState<'Appointment' | 'Medication'>('Appointment')
  const [beneficiaryId, setBeneficiaryId] = useState(data.beneficiaries[0]?.id ?? '')
  const [channel, setChannel] = useState<'SMS' | 'WhatsApp'>('SMS')
  const [date, setDate] = useState('2026-12-15')
  const visible = filter === 'All' ? data.reminders : data.reminders.filter(item => item.status === filter)
  const create = () => {
    const person = data.beneficiaries.find(item => item.id === beneficiaryId)
    updateData({ ...data, reminders: [...data.reminders, { id: `RM-${String(data.reminders.length + 1).padStart(3, '0')}`, beneficiaryId, kind, date, channel, status: 'Pending', message: `${t(language, kind)} ${t(language, 'reminder for')} ${person?.name ?? t(language, 'fictional beneficiary')} ${t(language, 'on')} ${formatDate(date, language)}.` }] })
    notify(t(language, 'Reminder queued — delivery is simulated'))
  }
  return (
    <section>
      <div className="section-heading"><div><span className="eyebrow">{t(language, 'Simulated delivery')}</span><h2>{t(language, 'Reminder management')}</h2></div></div>
      <div className="form-card"><h3>{t(language, 'Create reminder')}</h3><div className="form-grid"><label>{t(language, 'Beneficiary')}<select value={beneficiaryId} onChange={e => setBeneficiaryId(e.target.value)}>{data.beneficiaries.map(person => <option key={person.id} value={person.id}>{person.name}</option>)}</select></label><label>{t(language, 'Type')}<select value={kind} onChange={e => setKind(e.target.value as 'Appointment' | 'Medication')}><option value="Appointment">{t(language, 'Appointment')}</option><option value="Medication">{t(language, 'Medication')}</option></select></label><label>{t(language, 'Delivery date')}<input type="date" value={date} onChange={e => setDate(e.target.value)} /></label><label>{t(language, 'Channel')}<select value={channel} onChange={e => setChannel(e.target.value as 'SMS' | 'WhatsApp')}><option>SMS</option><option>WhatsApp</option></select></label></div><div className="form-actions"><button className="button" onClick={create}>{t(language, 'Simulate sending reminder')}</button></div></div>
      <div className="filter-row"><label>{t(language, 'Filter')}<select value={filter} onChange={e => setFilter(e.target.value)}><option value="All">{t(language, 'All')}</option><option value="Pending">{t(language, 'Pending')}</option><option value="Acknowledged">{t(language, 'Acknowledged')}</option></select></label></div>
      <div className="table-wrap"><table><thead><tr><th>{t(language, 'Beneficiary')}</th><th>{t(language, 'Type')}</th><th>{t(language, 'Date')}</th><th>{t(language, 'Channel')}</th><th>{t(language, 'Status')}</th><th></th></tr></thead><tbody>{visible.map(item => <tr key={item.id}><td><strong>{data.beneficiaries.find(person => person.id === item.beneficiaryId)?.name}</strong></td><td>{t(language, item.kind)}</td><td>{formatDate(item.date, language)}</td><td>{item.channel}</td><td><span className={`status ${item.status.toLowerCase()}`}>{t(language, item.status)}</span></td><td><button className="text-button" onClick={() => { updateData({ ...data, reminders: data.reminders.map(reminder => reminder.id === item.id ? { ...reminder, status: item.status === 'Pending' ? 'Acknowledged' : 'Pending' } : reminder) }); notify(t(language, 'Reminder status updated')) }}>{t(language, item.status === 'Pending' ? 'Mark acknowledged' : 'Mark pending')}</button></td></tr>)}</tbody></table></div>
    </section>
  )
}

function ScheduleManager({ data, language, updateData, notify }: { data: DemoData; language: Language; updateData: (data: DemoData) => void; notify: (message: string) => void }) {
  const [name, setName] = useState('')
  const [date, setDate] = useState('2026-12-15')
  const [hours, setHours] = useState('09:00-16:00')
  const [location, setLocation] = useState('Hope Exchange Community Clinic')
  const add = () => {
    if (!name.trim()) return notify(t(language, 'Event name is required'))
    updateData({ ...data, clinicEvents: [...data.clinicEvents, { id: `EV-${String(data.clinicEvents.length + 1).padStart(3, '0')}`, name: name.trim(), date, hours, location }] })
    setName('')
    notify(t(language, 'Clinic event published to beneficiary information'))
  }
  return (
    <section>
      <div className="section-heading"><div><span className="eyebrow">{t(language, 'Operating information')}</span><h2>{t(language, 'Clinic Schedule')}</h2></div></div>
      <div className="form-card"><h3>{t(language, 'Add clinic date or event')}</h3><div className="form-grid"><label>{t(language, 'Event name')}<input value={name} onChange={e => setName(e.target.value)} placeholder={t(language, 'Health screening day')} /></label><label>{t(language, 'Date')}<input type="date" value={date} onChange={e => setDate(e.target.value)} /></label><label>{t(language, 'Operating hours')}<input value={hours} onChange={e => setHours(e.target.value)} /></label><label>{t(language, 'Location')}<input value={t(language, location)} onChange={e => setLocation(e.target.value)} /></label></div><div className="form-actions"><button className="button" onClick={add}>{t(language, 'Publish event')}</button></div></div>
      <div className="list-stack">{data.clinicEvents.map(event => <article className="info-card appointment-row" key={event.id}><div className="date-tile"><strong>{new Date(`${event.date}T12:00:00`).getDate()}</strong><span>{formatMonth(event.date, language)}</span></div><div className="row-main"><h3>{t(language, event.name)}</h3><p>{event.hours} · {t(language, event.location)}</p></div></article>)}</div>
    </section>
  )
}

function AnnouncementManager({ data, language, updateData, notify }: { data: DemoData; language: Language; updateData: (data: DemoData) => void; notify: (message: string) => void }) {
  const [en, setEn] = useState('')
  const [af, setAf] = useState('')
  const [xh, setXh] = useState('')
  const create = () => {
    if (!en.trim()) return notify(t(language, 'English announcement text is required'))
    if (!af.trim() || !xh.trim()) return notify(t(language, 'Provide announcement translations in Afrikaans and isiXhosa'))
    updateData({ ...data, announcements: [...data.announcements, { id: `AN-${String(data.announcements.length + 1).padStart(3, '0')}`, en: en.trim(), af: af.trim(), xh: xh.trim(), status: 'Draft', date: new Date().toISOString().slice(0, 10) }] })
    setEn(''); setAf(''); setXh('')
    notify(t(language, 'Announcement saved as draft'))
  }
  return (
    <section>
      <div className="section-heading"><div><span className="eyebrow">{t(language, 'Beneficiary updates')}</span><h2>{t(language, 'Announcement management')}</h2></div></div>
      <div className="form-card"><h3>{t(language, 'Create announcement')}</h3><div className="form-grid"><label>{t(language, 'English')}<textarea value={en} onChange={e => setEn(e.target.value)} /></label><label>{t(language, 'Afrikaans')}<textarea value={af} onChange={e => setAf(e.target.value)} /></label><label>{t(language, 'isiXhosa')}<textarea value={xh} onChange={e => setXh(e.target.value)} /></label></div><div className="form-actions"><button className="button" onClick={create}>{t(language, 'Save draft')}</button></div></div>
      <div className="list-stack">{data.announcements.map(item => <article className="info-card announcement-row" key={item.id}><div className="row-main"><span className={`status ${item.status.toLowerCase()}`}>{t(language, item.status)}</span><h3>{item[language] || item.en}</h3><p>{formatDate(item.date, language)}</p></div>{item.status === 'Draft' ? <button className="button" onClick={() => { updateData({ ...data, announcements: data.announcements.map(announcement => announcement.id === item.id ? { ...announcement, status: 'Approved' } : announcement) }); notify(t(language, 'Announcement approved and published')) }}>{t(language, 'Review and approve')}</button> : <span className="published-label"><ShieldCheck size={16} /> {t(language, 'Published')}</span>}</article>)}</div>
    </section>
  )
}

function Reports({ data, language, notify }: { data: DemoData; language: Language; notify: (message: string) => void }) {
  const exportCsv = () => {
    const rows = [
      [t(language, 'Beneficiary ID'), t(language, 'Name'), t(language, 'Language'), t(language, 'Appointment ID'), t(language, 'Date'), t(language, 'Status')],
      ...data.appointments.map(item => {
        const person = data.beneficiaries.find(person => person.id === item.beneficiaryId)
        return [item.beneficiaryId, person?.name ?? '', person ? t(language, person.language === 'en' ? 'English' : person.language === 'af' ? 'Afrikaans' : 'isiXhosa') : '', item.id, formatDate(item.date, language), t(language, item.status)]
      }),
    ]
    const csv = rows.map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'hopecare-demo-report.csv'
    link.click()
    URL.revokeObjectURL(url)
    notify(t(language, 'CSV report exported'))
  }
  const voice = data.chatbotInteractions.filter(item => item.voice).length
  const text = data.chatbotInteractions.length - voice
  const usage = [
    { name: t(language, 'Voice'), value: voice },
    { name: t(language, 'Text'), value: text },
  ]
  const reminderAcknowledged = data.reminders.filter(item => item.status === 'Acknowledged').length
  return (
    <section>
      <div className="section-heading"><div><span className="eyebrow">{t(language, 'Fictional analytics')}</span><h2>{t(language, 'Reports and analytics')}</h2></div><button className="button" onClick={exportCsv}><Download size={17} /> {t(language, 'Export CSV')}</button></div>
      <div className="dashboard-grid chart-grid">
        <article className="info-card"><h3>{t(language, 'Voice versus text usage')}</h3><div className="chart-box"><ResponsiveContainer width="100%" height="100%"><BarChart data={usage}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="value" fill="var(--color-primary)" /></BarChart></ResponsiveContainer></div></article>
        <article className="info-card"><h3>{t(language, 'Reminder engagement')}</h3><div className="stat-feature"><strong>{data.reminders.length ? Math.round(reminderAcknowledged / data.reminders.length * 100) : 0}%</strong><p>{t(language, 'acknowledged in the fictional dataset')}</p></div></article>
        <article className="info-card"><h3>{t(language, 'Frequently asked questions')}</h3><ol className="faq-list"><li>{t(language, 'Clinic hours')} <span>32</span></li><li>{t(language, 'Medication collection')} <span>27</span></li><li>{t(language, 'Clinic location')} <span>21</span></li><li>{t(language, 'Appointment preparation')} <span>18</span></li></ol></article>
        <article className="info-card"><h3>{t(language, 'Medical information boundary')}</h3><p><strong>{t(language, 'Self-reported symptoms:')}</strong>{t(language, ' any beneficiary-entered concerns are not clinical diagnoses.')}</p><p><strong>{t(language, 'Confirmed diagnoses:')}</strong>{t(language, ' none are recorded or verified in this demonstration.')}</p></article>
      </div>
    </section>
  )
}

export default App
