import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import {
  Activity, ArrowRight, Bell, CalendarDays, Check, CheckCheck, ChevronDown, CircleHelp,
  Clock3, Download, FileText, Heart, HeartHandshake, Home, Languages, LogOut, MapPin, Menu,
  MessageCircle, Mic, MicOff, Plus, Search, Send, Settings, ShieldCheck, Siren, Sparkles,
  Stethoscope, Users, Volume2, VolumeX, X,
} from "lucide-react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from "recharts";
import { initialAppointments, initialBeneficiaries, initialEvents, initialReminders, languageName } from "./data";
import type { Announcement, Appointment, AppointmentStatus, Beneficiary, ClinicEvent, Language, Reminder, ReminderStatus } from "./types";

type Role = "beneficiary" | "staff";
type Page = "home" | "assistant" | "appointments" | "reminders" | "information" | "profile" | "dashboard" | "beneficiaries" | "schedule" | "announcements" | "reports" | "settings";
type ChatMessage = { id: string; from: "assistant" | "user"; text: string; time: string };
const STORE = "hopecare-demo-v1";
const HOPE_EXCHANGE_CLINIC = "Hope Exchange Community Clinic";

const copy = {
  en: {
    welcome: "Healthcare information made accessible to everyone.",
    intro: "A little support can make a big difference. Find clinic information, keep track of appointments and get clear answers in your language.",
    beneficiary: "Continue as a beneficiary", staff: "Continue as staff", safe: "A safe, welcoming place to find your next step.",
    home: "Home", assistant: "AI Assistant", appointments: "Appointments", reminders: "Medication reminders",
    information: "Health information", profile: "My profile", dashboard: "Dashboard", beneficiaries: "Beneficiaries",
    schedule: "Clinic schedule", announcements: "Announcements", reports: "Reports & insights", settings: "Settings",
    hello: "Good day", next: "Your next appointment", talk: "Ask HopeCare", talkDesc: "Friendly, simple healthcare and clinic information — whenever you need it.",
    ask: "Type a question…", send: "Send", quick: "Try asking", nextStep: "Your next step", available: "Useful information",
    noAppt: "No upcoming appointments. Ask clinic staff if you need to book one.", openChat: "Open assistant",
    appointmentsTitle: "Your appointments", remindersTitle: "Your reminders", informationTitle: "Health information",
    profileTitle: "Your profile", upcoming: "Upcoming", past: "Previous", clinic: "Clinic", date: "Date", time: "Time",
    status: "Status", type: "Visit type", acknowledge: "Acknowledge", acknowledged: "Acknowledged", noData: "Nothing to show yet.",
    search: "Search people or clinic…", add: "Add new", total: "Registered beneficiaries", scheduled: "Appointments this week",
    completed: "Completed visits", missed: "Missed visits", sent: "Reminders sent", interactions: "Assistant interactions",
    today: "A friendly overview of community care.", people: "people", viewAll: "View all", actions: "Actions",
    name: "Name", language: "Language", area: "Area", phone: "Phone", appointment: "Appointment", medication: "Medication",
    save: "Save changes", cancel: "Cancel", close: "Close", all: "All statuses", approve: "Approve & publish",
    draft: "Create an announcement", draftHelp: "Write in English. Curated language versions are available for the sample clinic closure; other drafts need a human translation before approval.",
    english: "English", afrikaans: "Afrikaans", xhosa: "isiXhosa", published: "Published", needsReview: "Needs translation review",
    clinicHours: "Clinic hours", services: "Services", events: "Community events", safety: "Your wellbeing matters",
    emergency: "If you may be in immediate danger, call 112 from a mobile phone in South Africa or go to your nearest emergency service.",
    disclaimer: "HopeCare shares general information only. It cannot diagnose, prescribe, or replace a healthcare worker. For personal medical advice, please speak with a clinic professional.",
    simulation: "Demo simulation · no messages are sent", privacy: "Fictional demo records only. Your choices stay in this browser.",
    listen: "Listen to answer", stop: "Stop speaking", voiceUnsupported: "Voice features are not supported in this browser. You can still type or read replies.",
    recording: "Listening… tap to stop", record: "Speak your question", chatClear: "Start a new conversation", consent: "By entering the demo, you agree to use fictional information only. This is not a real healthcare record.",
  },
  af: {
    welcome: "Gesondheidsinligting, toeganklik vir almal.",
    intro: "Klein ondersteuning kan 'n groot verskil maak. Vind kliniekinligting, hou afsprake dop en kry duidelike antwoorde in jou taal.",
    beneficiary: "Gaan voort as 'n pasiënt", staff: "Gaan voort as personeel", safe: "’n Veilige, verwelkomende plek om jou volgende stap te vind.",
    home: "Tuis", assistant: "KI-assistent", appointments: "Afsprake", reminders: "Medikasieherinneringe",
    information: "Gesondheidsinligting", profile: "My profiel", dashboard: "Oorsig", beneficiaries: "Begunstigdes",
    schedule: "Kliniekskedule", announcements: "Aankondigings", reports: "Verslae en insigte", settings: "Instellings",
    hello: "Goeiedag", next: "Jou volgende afspraak", talk: "Vra HopeCare", talkDesc: "Vriendelike, eenvoudige gesondheids- en kliniekinligting wanneer jy dit nodig het.",
    ask: "Tik 'n vraag…", send: "Stuur", quick: "Probeer vra", nextStep: "Jou volgende stap", available: "Nuttige inligting",
    noAppt: "Geen komende afsprake nie. Vra kliniekpersoneel as jy een moet bespreek.", openChat: "Maak assistent oop",
    appointmentsTitle: "Jou afsprake", remindersTitle: "Jou herinneringe", informationTitle: "Gesondheidsinligting",
    profileTitle: "Jou profiel", upcoming: "Komende", past: "Vorige", clinic: "Kliniek", date: "Datum", time: "Tyd",
    status: "Status", type: "Besoeksoort", acknowledge: "Bevestig", acknowledged: "Bevestig", noData: "Nog niks om te wys nie.",
    search: "Soek mense of kliniek…", add: "Voeg by", total: "Geregistreerde begunstigdes", scheduled: "Afsprake hierdie week",
    completed: "Voltooide besoeke", missed: "Gemiste besoeke", sent: "Herinneringe gestuur", interactions: "Assistentgesprekke",
    today: "’n Vriendelike oorsig van gemeenskapsorg.", people: "mense", viewAll: "Sien alles", actions: "Aksies",
    name: "Naam", language: "Taal", area: "Gebied", phone: "Telefoon", appointment: "Afspraak", medication: "Medikasie",
    save: "Stoor veranderinge", cancel: "Kanselleer", close: "Sluit", all: "Alle statusse", approve: "Keur goed en publiseer",
    draft: "Skep 'n aankondiging", draftHelp: "Skryf in Engels. Gekeurde taalweergawes is beskikbaar vir die voorbeeldklinieksluiting; ander konsepte benodig menslike vertaling.",
    english: "Engels", afrikaans: "Afrikaans", xhosa: "isiXhosa", published: "Gepubliseer", needsReview: "Vertaling moet nagegaan word",
    clinicHours: "Kliniekure", services: "Dienste", events: "Gemeenskapsgeleenthede", safety: "Jou welstand is belangrik",
    emergency: "As jy onmiddellik in gevaar is, skakel 112 vanaf 'n selfoon in Suid-Afrika of gaan na jou naaste nooddiens.",
    disclaimer: "HopeCare deel slegs algemene inligting. Dit kan nie diagnoseer of medisyne voorskryf nie. Praat met 'n kliniekwerker vir persoonlike advies.",
    simulation: "Demo-simulasie · geen boodskappe word gestuur nie", privacy: "Slegs fiktiewe demorekords. Jou keuses bly in hierdie blaaier.",
    listen: "Luister na antwoord", stop: "Hou op praat", voiceUnsupported: "Stemfunksies word nie deur hierdie blaaier ondersteun nie. Jy kan steeds tik of lees.",
    recording: "Luister… tik om te stop", record: "Spreek jou vraag", chatClear: "Begin 'n nuwe gesprek", consent: "Gebruik slegs fiktiewe inligting. Dit is nie 'n werklike gesondheidsrekord nie.",
  },
  xh: {
    welcome: "Ulwazi lwezempilo olufikeleleka kuye wonke umntu.",
    intro: "Uncedo oluncinci lunokwenza umahluko omkhulu. Fumana iinkcukacha zekliniki, ulandele amadinga, uze ufumane iimpendulo ngolwimi lwakho.",
    beneficiary: "Qhubeka njengomntu ofumana uncedo", staff: "Qhubeka njengomsebenzi", safe: "Indawo ekhuselekileyo yokufumana inyathelo lakho elilandelayo.",
    home: "Ekhaya", assistant: "Umncedisi we-AI", appointments: "Amadinga", reminders: "Izikhumbuzo zamayeza",
    information: "Ulwazi lwezempilo", profile: "Iprofayile yam", dashboard: "Ideshibhodi", beneficiaries: "Abaxhamli",
    schedule: "Ishedyuli yekliniki", announcements: "Izaziso", reports: "Iingxelo nokuqonda", settings: "Iisetingi",
    hello: "Molo", next: "Idinga lakho elilandelayo", talk: "Buza iHopeCare", talkDesc: "Ulwazi olulula nolunobubele lwezempilo nekliniki — xa ulufuna.",
    ask: "Chwetheza umbuzo…", send: "Thumela", quick: "Zama ukubuza", nextStep: "Inyathelo lakho elilandelayo", available: "Ulwazi oluluncedo",
    noAppt: "Akukho madinga azayo. Buza abasebenzi basekliniki ukuba ufuna ukubhukisha.", openChat: "Vula umncedisi",
    appointmentsTitle: "Amadinga akho", remindersTitle: "Izikhumbuzo zakho", informationTitle: "Ulwazi lwezempilo",
    profileTitle: "Iprofayile yakho", upcoming: "Azayo", past: "Adlulileyo", clinic: "Ikliniki", date: "Umhla", time: "Ixesha",
    status: "Imeko", type: "Uhlobo lotyelelo", acknowledge: "Qinisekisa", acknowledged: "Kuqinisekisiwe", noData: "Akukho nto apha okwangoku.",
    search: "Khangela abantu okanye ikliniki…", add: "Yongeza", total: "Abaxhamli ababhalisiweyo", scheduled: "Amadinga ale veki",
    completed: "Utyelelo olugqityiweyo", missed: "Utyelelo olungaphumelelanga", sent: "Izikhumbuzo ezithunyelweyo", interactions: "Iincoko nomncedisi",
    today: "Isishwankathelo sobubele sokhathalelo loluntu.", people: "abantu", viewAll: "Jonga zonke", actions: "Izenzo",
    name: "Igama", language: "Ulwimi", area: "Indawo", phone: "Ifowuni", appointment: "Idinga", medication: "Iyeza",
    save: "Gcina utshintsho", cancel: "Rhoxisa", close: "Vala", all: "Zonke iimeko", approve: "Vuma uze upapashe",
    draft: "Yila isaziso", draftHelp: "Bhala ngesiNgesi. Iinguqulelo eziqinisekisiweyo zikhona kwisaziso sokuvalwa kwekliniki somzekelo; ezinye zifuna uguqulelo olujongwe ngumntu.",
    english: "IsiNgesi", afrikaans: "IsiBhulu", xhosa: "isiXhosa", published: "Sipapashiwe", needsReview: "Kufuneka kuhlolwe inguqulelo",
    clinicHours: "Iiyure zekliniki", services: "Iinkonzo", events: "Imisitho yoluntu", safety: "Impilo yakho ibalulekile",
    emergency: "Ukuba usengozini ekhawulezileyo, fowunela u-112 ngeselula eMzantsi Afrika okanye uye kwinkonzo yongxamiseko ekufutshane.",
    disclaimer: "IHopeCare inika ulwazi ngokubanzi kuphela. Ayikwazi ukuxilonga okanye ukumisela amayeza. Thetha nomsebenzi wezempilo ngeengcebiso zakho.",
    simulation: "Umboniso wokulinganisa · akukho miyalezo ithunyelwayo", privacy: "Iirekhodi zomzekelo ezingezizo ezokwenyani kuphela. Iinkcukacha zigcinwa kule bhrawuza.",
    listen: "Mamela impendulo", stop: "Yeka ukuthetha", voiceUnsupported: "Esi sikhangeli asixhasi ilizwi. Usenokuchwetheza okanye ufunde iimpendulo.",
    recording: "Kumameliwe… cofa ukuze uyeke", record: "Thetha umbuzo wakho", chatClear: "Qalisa incoko entsha", consent: "Sebenzisa iinkcukacha zomzekelo kuphela. Le asiyorekhodi yokwenyani yezempilo.",
  },
} as const;

const questions = {
  en: ["When is the next clinic day?", "When must I collect my medication?", "What time does the clinic open?", "What services are available?", "How do I prepare for an appointment?", "Can you explain this in isiXhosa?", "Can you speak Afrikaans?"],
  af: ["Wanneer is die volgende kliniekdag?", "Wanneer moet ek my medikasie afhaal?", "Hoe laat maak die kliniek oop?", "Watter dienste is beskikbaar?", "Hoe berei ek voor vir 'n afspraak?", "Kan jy dit in isiXhosa verduidelik?", "Kan jy Afrikaans praat?"],
  xh: ["Lunini usuku olulandelayo lwekliniki?", "Ndilithatha nini iyeza lam?", "Ivula nini ikliniki?", "Zeziphi iinkonzo ezikhoyo?", "Ndilungiselela njani idinga?", "Ungandicacisela ngesiBhulu?", "Ungathetha isiBhulu?"],
};
const answerText: Record<Language, Record<string, string>> = {
  en: {
    emergency: "If you may be in immediate danger, call 112 from a mobile phone in South Africa or go to your nearest emergency service now. I can’t assess emergencies here.",
    schedule: "The next listed clinic days are Thursday 26 November and Friday 27 November 2026. Please check with Hope Exchange Community Clinic before travelling.",
    hours: "Hope Exchange Community Clinic is listed as open Monday to Friday, 08:00–16:00. Please confirm directly before travelling.",
    medication: "Your demo profile shows the next collection date on 3 December 2026. Please follow the instructions from your healthcare worker and contact your clinic if you are unsure.",
    services: "Hope Exchange Community Clinic offers wellness checks, family health information, routine visits and medication collection support. Ask clinic staff which services are available on a specific day.",
    prepare: "Bring your clinic card and any documents your clinic asked you to bring. Arrive a little early if you can. If you have questions about your care, write them down to discuss with a healthcare worker.",
    language: "Of course. Use the language selector at the top to choose English, Afrikaans or isiXhosa. The common answers in this demo are curated for each language.",
    general: "I can help with clinic hours, appointments, collection reminders and general health information. I can’t diagnose, prescribe or advise you to change medicine. For personal concerns, please speak with a healthcare worker.",
  },
  af: {
    emergency: "As jy onmiddellik in gevaar is, skakel 112 vanaf 'n selfoon in Suid-Afrika of gaan nou na jou naaste nooddiens. Ek kan nie noodgevalle hier beoordeel nie.",
    schedule: "Die volgende gelyste kliniekdae is Donderdag 26 November en Vrydag 27 November 2026. Ure verskil per plek; bevestig asseblief met jou kliniek voordat jy reis.",
    hours: "Hope Exchange Community Clinic is gelys as oop Maandag tot Vrydag, 08:00–16:00. Bevestig asseblief direk voordat jy reis.",
    medication: "Jou demoprofiel wys die volgende afhaaldatum as 3 Desember 2026. Volg asseblief jou gesondheidswerker se instruksies en kontak die kliniek as jy onseker is.",
    services: "Demo-klinieke bied welstandsondersoeke, gesondheidsinligting vir gesinne, roetinebesoeke en ondersteuning met medikasie-afhaal. Vra plaaslike personeel oor 'n spesifieke dag.",
    prepare: "Bring jou kliniekkaart en enige dokumente wat die kliniek gevra het. Kom indien moontlik 'n bietjie vroeg. Skryf vrae neer om met 'n gesondheidswerker te bespreek.",
    language: "Natuurlik. Gebruik die taalkeuse bo om Engels, Afrikaans of isiXhosa te kies. Algemene antwoorde in hierdie demo is vir elke taal nagegaan.",
    general: "Ek kan help met kliniekure, afsprake, afhaalherinneringe en algemene gesondheidsinligting. Ek kan nie diagnoseer, medisyne voorskryf of voorstel dat jy medikasie verander nie. Praat met 'n gesondheidswerker oor persoonlike kommer.",
  },
  xh: {
    emergency: "Ukuba usengozini ekhawulezileyo, fowunela u-112 ngeselula eMzantsi Afrika okanye uye kwinkonzo yongxamiseko ekufutshane ngoku. Andikwazi ukuvavanya iimeko ezingxamisekileyo apha.",
    schedule: "Iintsuku zekliniki ezilandelayo ezidwelisiweyo nguLwesine umhla wama-26 noLwesihlanu umhla wama-27 kuNovemba 2026. Amaxesha ayahluka; qinisekisa nekliniki yakho ngaphambi kohambo.",
    hours: "Hope Exchange Community Clinic idweliswe njengevulwa ngoMvulo ukuya ngoLwesihlanu, 08:00–16:00. Qinisekisa ngaphambi kohambo.",
    medication: "Iprofayile yakho yomzekelo ibonisa umhla wokuqokelela olandelayo njengowesi-3 kuDisemba 2026. Landela imiyalelo yomsebenzi wezempilo, uze uqhagamshelane nekliniki xa ungaqinisekanga.",
    services: "Iikliniki zomzekelo zinolwazi lwempilo, utyelelo lwesiqhelo, uhlolo lwempilo nenkxaso yokuqokelela amayeza. Buza abasebenzi basekuhlaleni ngeenkonzo zosuku oluthile.",
    prepare: "Yiza nekhadi lekliniki namaxwebhu ekucelwe ukuba uze nawo. Fika kwangethuba ukuba unako. Bhala imibuzo ofuna ukuyibuza umsebenzi wezempilo.",
    language: "Ewe. Sebenzisa isikhethi solwimi esingasentla ukukhetha isiNgesi, isiBhulu okanye isiXhosa. Iimpendulo eziqhelekileyo apha ziqokelelwe ngolwimi ngalunye.",
    general: "Ndinganceda ngeeyure zekliniki, amadinga, izikhumbuzo zokuqokelela amayeza nolwazi lwezempilo ngokubanzi. Andikwazi ukuxilonga, ukumisela amayeza okanye ukucebisa utshintsho lwamayeza. Nceda uthethe nomsebenzi wezempilo ngemeko yakho.",
  },
};

function answerQuestion(text: string, language: Language) {
  const q = text.toLowerCase();
  const urgent = /emergency|urgent|can't breathe|cannot breathe|chest pain|overdose|bleeding heavily|unconscious|suicid|ungxamis|andikwazi ukuphefumla|intlungu esifubeni|noodgeval|kan nie asemhaal/i.test(q);
  if (urgent) return answerText[language].emergency;
  if (/next clinic|clinic day|schedule|when.*visit|linini|usuku.*klin|kliniekdag/i.test(q)) return answerText[language].schedule;
  if (/open|hours|time.*clinic|when.*clinic|ivula|ure|oopmaak|opening/i.test(q)) return answerText[language].hours;
  if (/medication|medicine|collect|collection|amayeza|ukuqokelela|medikasie|haal/i.test(q)) return answerText[language].medication;
  if (/service|available|inkonzo|dienste|gesondheidsdiens/i.test(q)) return answerText[language].services;
  if (/prepare|bring|appointment|afspraak|lungiselel|id inga|idinga/i.test(q)) return answerText[language].prepare;
  if (/xhosa|afrikaans|language|ulwimi|taal/i.test(q)) return answerText[language].language;
  return answerText[language].general;
}

function normalizeClinicData<T>(key: string, value: T): T {
  if (key === "beneficiaries" && Array.isArray(value)) return value.map((item) => ({ ...item, preferredClinic: HOPE_EXCHANGE_CLINIC })) as T;
  if (key === "appointments" && Array.isArray(value)) return value.map((item) => ({ ...item, clinic: HOPE_EXCHANGE_CLINIC })) as T;
  if (key === "events" && Array.isArray(value)) return value.map((item) => ({ ...item, location: HOPE_EXCHANGE_CLINIC })) as T;
  return value;
}

function useStored<T>(key: string, initial: T): [T, (next: T | ((old: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    try { const saved = localStorage.getItem(`${STORE}:${key}`); return saved ? normalizeClinicData(key, JSON.parse(saved) as T) : normalizeClinicData(key, initial); } catch { return normalizeClinicData(key, initial); }
  });
  useEffect(() => { try { localStorage.setItem(`${STORE}:${key}`, JSON.stringify(value)); } catch { /* private browsing can disable storage */ } }, [key, value]);
  return [value, setValue];
}

function Logo({ small = false }: { small?: boolean }) {
  return <div className={`brand ${small ? "brand-small" : ""}`}><span className="brand-mark"><HeartHandshake size={small ? 20 : 24} /></span><span>HopeCare <b>AI</b><small>The Hope Exchange</small></span></div>;
}

function SelectLanguage({ value, onChange }: { value: Language; onChange: (v: Language) => void }) {
  return <label className="language-picker"><Languages size={17} /><select aria-label="Select language" value={value} onChange={(e) => onChange(e.target.value as Language)}><option value="en">English</option><option value="af">Afrikaans</option><option value="xh">isiXhosa</option></select><ChevronDown size={14} /></label>;
}

function StatusBadge({ children }: { children: string }) {
  const style = children === "Completed" || children === "Acknowledged" ? "green" : children === "Missed" ? "red" : children === "Sent" ? "blue" : "gold";
  return <span className={`badge ${style}`}><i />{children}</span>;
}

function App() {
  const [beneficiaries, setBeneficiaries] = useStored<Beneficiary[]>("beneficiaries", initialBeneficiaries);
  const [appointments, setAppointments] = useStored<Appointment[]>("appointments", initialAppointments);
  const [reminders, setReminders] = useStored<Reminder[]>("reminders", initialReminders);
  const [events, setEvents] = useStored<ClinicEvent[]>("events", initialEvents);
  const [clinicHours, setClinicHours] = useStored<{ weekdays: string; weekend: string }>("clinicHours", { weekdays: "08:00–16:00", weekend: "Closed" });
  const [announcements, setAnnouncements] = useStored<Announcement[]>("announcements", [
    { id: "AN-1", en: "The clinic will be closed on Friday. Normal services will resume on Monday.", af: "Die kliniek sal Vrydag gesluit wees. Normale dienste hervat Maandag.", xh: "Ikliniki iza kuvalwa ngoLwesihlanu. Iinkonzo zesiqhelo ziya kuqhubeka ngoMvulo.", approved: true, date: "2026-11-24" },
  ]);
  const [role, setRole] = useState<Role | null>(null);
  const [page, setPage] = useState<Page>("home");
  const [language, setLanguage] = useStored<Language>("language", "en");
  const [activeBeneficiary, setActiveBeneficiary] = useStored<string>("activeBeneficiary", "HC-1042");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [historyBeneficiary, setHistoryBeneficiary] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [modal, setModal] = useState<"beneficiary" | "appointment" | "reminder" | "event" | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [announcementDraft, setAnnouncementDraft] = useState("");
  const [draftTranslations, setDraftTranslations] = useState<{ af: string; xh: string } | null>(null);
  const [toast, setToast] = useState("");
  const [chat, setChat] = useStored<ChatMessage[]>("chat", []);
  const [question, setQuestion] = useState("");
  const [thinking, setThinking] = useState(false);
  const [recording, setRecording] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const recognitionRef = useRef<RecognitionLike | null>(null);
  const chatEnd = useRef<HTMLDivElement>(null);
  const t = copy[language] as typeof copy.en;
  const currentUser = beneficiaries.find((b) => b.id === activeBeneficiary) ?? beneficiaries[0];
  const myAppointments = appointments.filter((a) => a.beneficiaryId === currentUser?.id).sort((a, b) => a.date.localeCompare(b.date));
  const nextAppointment = myAppointments.find((a) => a.status === "Scheduled" && a.date >= "2026-11-25");

  useEffect(() => { if (toast) { const timer = window.setTimeout(() => setToast(""), 3000); return () => window.clearTimeout(timer); } }, [toast]);
  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [chat, thinking]);
  useEffect(() => {
    if (page !== "assistant" && recognitionRef.current) {
      recognitionRef.current.onresult = null;
      recognitionRef.current.stop();
      recognitionRef.current = null;
      setRecording(false);
    }
  }, [page]);

  const showToast = (message: string) => setToast(message);
  const openModal = (kind: typeof modal, id: string | null = null) => { setEditing(id); setModal(kind); };
  const nav = role === "staff"
    ? (["dashboard", "beneficiaries", "appointments", "reminders", "schedule", "announcements", "reports", "settings"] as Page[])
    : (["home", "assistant", "appointments", "reminders", "information", "profile"] as Page[]);
  const labels: Record<Page, string> = {
    home: t.home, assistant: t.assistant, appointments: t.appointments, reminders: t.reminders,
    information: t.information, profile: t.profile, dashboard: t.dashboard, beneficiaries: t.beneficiaries,
    schedule: t.schedule, announcements: t.announcements, reports: t.reports, settings: t.settings,
  };
  const icons: Record<Page, ReactNode> = {
    home: <Home size={18} />, assistant: <MessageCircle size={18} />, appointments: <CalendarDays size={18} />,
    reminders: <Bell size={18} />, information: <Heart size={18} />, profile: <Users size={18} />,
    dashboard: <Activity size={18} />, beneficiaries: <Users size={18} />, schedule: <Clock3 size={18} />,
    announcements: <MessageCircle size={18} />, reports: <FileText size={18} />, settings: <Settings size={18} />,
  };
  const navigate = (next: Page) => { setPage(next); setMobileOpen(false); };
  const enter = (nextRole: Role) => {
    if (!beneficiaries.length) setBeneficiaries(initialBeneficiaries);
    setRole(nextRole); setPage(nextRole === "staff" ? "dashboard" : "home");
  };
  const signOut = () => { setRole(null); setPage("home"); setMobileOpen(false); };

  function sendMessage(message = question) {
    const text = message.trim();
    if (!text || thinking) return;
    const now = new Date().toLocaleTimeString(language === "en" ? "en-ZA" : language === "af" ? "af-ZA" : "xh-ZA", { hour: "2-digit", minute: "2-digit" });
    const userMessage: ChatMessage = { id: crypto.randomUUID(), from: "user", text, time: now };
    setChat((old) => [...old, userMessage]);
    setQuestion("");
    setThinking(true);
    window.setTimeout(() => {
      const reply: ChatMessage = { id: crypto.randomUUID(), from: "assistant", text: answerQuestion(text, language), time: new Date().toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" }) };
      setChat((old) => [...old, reply]);
      setThinking(false);
    }, 750);
  }
  function toggleVoice() {
    const speechWindow = window as Window & {
      SpeechRecognition?: new () => RecognitionLike;
      webkitSpeechRecognition?: new () => RecognitionLike;
    };
    const Speech = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    if (!Speech) { showToast(t.voiceUnsupported); return; }
    if (recording) {
      recognitionRef.current?.stop();
      setRecording(false);
      return;
    }
    const recognition = new Speech();
    recognitionRef.current = recognition;
    recognition.lang = language === "af" ? "af-ZA" : language === "xh" ? "xh-ZA" : "en-ZA";
    recognition.interimResults = false;
    recognition.onresult = (event) => { const transcript = event.results?.[0]?.[0]?.transcript; if (transcript) sendMessage(transcript); };
    recognition.onerror = () => { setRecording(false); showToast(t.voiceUnsupported); };
    recognition.onend = () => { setRecording(false); recognitionRef.current = null; };
    try {
      recognition.start();
      setRecording(true);
    } catch {
      recognitionRef.current = null;
      setRecording(false);
      showToast(t.voiceUnsupported);
    }
  }
  function speak(text: string) {
    if (!("speechSynthesis" in window)) { showToast(t.voiceUnsupported); return; }
    if (speaking) { window.speechSynthesis.cancel(); setSpeaking(false); return; }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === "af" ? "af-ZA" : language === "xh" ? "xh-ZA" : "en-ZA";
    utterance.onend = () => setSpeaking(false);
    setSpeaking(true); window.speechSynthesis.speak(utterance);
  }

  function saveModal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!modal) return;
    const data = new FormData(event.currentTarget);
    const get = (key: string) => String(data.get(key) ?? "").trim();
    if (modal === "beneficiary") {
      const value: Beneficiary = {
        id: editing ?? `HC-${Math.max(1051, ...beneficiaries.map((b) => Number(b.id.slice(3)) || 0)) + 1}`,
        name: get("name"), phone: get("phone"), language: get("language") as Language, area: get("area"),
        preferredClinic: HOPE_EXCHANGE_CLINIC, consent: true, joined: editing ? (beneficiaries.find((b) => b.id === editing)?.joined ?? "2026-11-25") : "2026-11-25",
      };
      setBeneficiaries((old) => editing ? old.map((b) => b.id === editing ? value : b) : [...old, value]);
    } else if (modal === "appointment") {
      const value: Appointment = {
        id: editing ?? `AP-${Math.max(212, ...appointments.map((a) => Number(a.id.slice(3)) || 0)) + 1}`,
        beneficiaryId: get("beneficiaryId"), date: get("date"), time: get("time"), clinic: HOPE_EXCHANGE_CLINIC,
        type: get("type"), status: get("status") as AppointmentStatus, reminderSent: editing ? (appointments.find((a) => a.id === editing)?.reminderSent ?? false) : false,
      };
      setAppointments((old) => editing ? old.map((a) => a.id === editing ? value : a) : [...old, value]);
    } else if (modal === "reminder") {
      const value: Reminder = { id: editing ?? `RM-${Math.max(305, ...reminders.map((r) => Number(r.id.slice(3)) || 0)) + 1}`, beneficiaryId: get("beneficiaryId"), kind: get("kind") as Reminder["kind"], date: get("date"), message: get("message"), status: get("status") as ReminderStatus };
      setReminders((old) => editing ? old.map((r) => r.id === editing ? value : r) : [...old, value]);
    } else {
      const value: ClinicEvent = { id: editing ?? `EV-${Date.now()}`, title: get("title"), date: get("date"), time: get("time"), location: HOPE_EXCHANGE_CLINIC, description: get("description") };
      setEvents((old) => editing ? old.map((e) => e.id === editing ? value : e) : [...old, value]);
    }
    setModal(null); setEditing(null); showToast(editing ? "Changes saved." : "Added to this demo.");
  }
  function removeBeneficiary(id: string) {
    if (!window.confirm("Remove this fictional beneficiary and their demo appointments/reminders?")) return;
    setBeneficiaries((old) => old.filter((b) => b.id !== id));
    setAppointments((old) => old.filter((a) => a.beneficiaryId !== id));
    setReminders((old) => old.filter((r) => r.beneficiaryId !== id));
    if (activeBeneficiary === id) setActiveBeneficiary(beneficiaries.find((b) => b.id !== id)?.id ?? "");
    showToast("Fictional demo record removed.");
  }

  function draftAnnouncement() {
    const normalized = announcementDraft.toLowerCase().replace(/[.!]/g, "").trim();
    const isClosure = /clinic will be closed on friday.*normal services will resume on monday/.test(normalized);
    setDraftTranslations(isClosure ? {
      af: "Die kliniek sal Vrydag gesluit wees. Normale dienste hervat Maandag.",
      xh: "Ikliniki iza kuvalwa ngoLwesihlanu. Iinkonzo zesiqhelo ziya kuqhubeka ngoMvulo.",
    } : { af: "", xh: "" });
  }
  function publishAnnouncement() {
    if (!announcementDraft.trim() || !draftTranslations?.af.trim() || !draftTranslations.xh.trim()) return;
    setAnnouncements((old) => [{ id: `AN-${Date.now()}`, en: announcementDraft.trim(), af: draftTranslations.af.trim(), xh: draftTranslations.xh.trim(), approved: true, date: new Date().toISOString().slice(0, 10) }, ...old]);
    setAnnouncementDraft(""); setDraftTranslations(null); showToast("Announcement published to the beneficiary portal.");
  }
  function exportCsv() {
    const rows = [["ID", "Beneficiary", "Language", "Date", "Time", "Clinic", "Visit type", "Status"]];
    appointments.forEach((a) => rows.push([a.id, beneficiaries.find((b) => b.id === a.beneficiaryId)?.name ?? "Unknown", languageName(beneficiaries.find((b) => b.id === a.beneficiaryId)?.language ?? "en"), a.date, a.time, a.clinic, a.type, a.status]));
    const csv = rows.map((row) => row.map((field) => `"${field.replace(/"/g, '""')}"`).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = "hopecare-demo-report.csv"; anchor.click(); URL.revokeObjectURL(url);
    showToast("Fictional demo report downloaded.");
  }

  if (!role) return <Landing language={language} setLanguage={setLanguage} enter={enter} />;

  const staffPage = role === "staff";
  const pageTitle = labels[page];
  return (
    <div className="app-shell">
      {mobileOpen && <button className="mobile-backdrop" aria-label="Close menu" onClick={() => setMobileOpen(false)} />}
      <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand"><Logo /></div>
        <div className="role-tag">{staffPage ? <><ShieldCheck size={14} /> STAFF DEMO</> : <><Heart size={14} /> BENEFICIARY PORTAL</>}</div>
        <nav className="side-nav" aria-label="Main navigation">
          <span className="nav-caption">{staffPage ? "WORKSPACE" : "YOUR SPACE"}</span>
          {nav.map((item) => <button key={item} className={`nav-item ${page === item ? "active" : ""}`} aria-label={labels[item]} aria-current={page === item ? "page" : undefined} onClick={() => navigate(item)}>{icons[item]}<span>{labels[item]}</span>{item === "reminders" && reminders.some((r) => r.beneficiaryId === currentUser?.id && r.status === "Scheduled") && !staffPage && <i className="nav-dot" />}</button>)}
        </nav>
        <div className="sidebar-bottom">
          <div className="privacy-mini"><ShieldCheck size={18} /><div><b>Private demo</b><span>Fictional records only</span></div></div>
          <button className="nav-item logout" onClick={signOut}><LogOut size={18} /><span>Back to login</span></button>
        </div>
      </aside>
      <div className="app-main">
        <header className="topbar">
          <button className="icon-btn mobile-menu" aria-label="Open navigation" onClick={() => setMobileOpen(true)}><Menu size={21} /></button>
          <div className="crumb"><span>{staffPage ? "Staff workspace" : "Beneficiary portal"}</span><b>/</b><strong>{pageTitle}</strong></div>
          <div className="top-actions">{staffPage && <button className="button button-quiet topbar-logout" onClick={signOut}><LogOut size={16} />Back to login</button>}<SelectLanguage value={language} onChange={setLanguage} /><span className="top-divider" /><button className="avatar" title={staffPage ? "Community care team" : currentUser?.name}>{staffPage ? "HC" : currentUser?.name.split(" ").map((n) => n[0]).join("")}</button><div className="user-label"><b>{staffPage ? "Care team" : currentUser?.name}</b><span>{staffPage ? "Community staff" : currentUser?.area}</span></div></div>
        </header>
        <main className="page-content">
          {page === "dashboard" && <StaffDashboard t={t} beneficiaries={beneficiaries} appointments={appointments} reminders={reminders} onNavigate={navigate} />}
          {page === "home" && <BeneficiaryHome t={t} user={currentUser} next={nextAppointment} announcements={announcements} onNavigate={navigate} />}
          {page === "assistant" && <AssistantPage t={t} language={language} chat={chat} setChat={setChat} question={question} setQuestion={setQuestion} sendMessage={sendMessage} thinking={thinking} chatEnd={chatEnd} toggleVoice={toggleVoice} recording={recording} speaking={speaking} speak={speak} />}
          {page === "appointments" && <AppointmentsPage t={t} appointments={staffPage ? (historyBeneficiary ? appointments.filter((a) => a.beneficiaryId === historyBeneficiary) : appointments) : myAppointments} beneficiaries={beneficiaries} staff={staffPage} historyBeneficiary={historyBeneficiary} onClearHistory={() => setHistoryBeneficiary(null)} onAdd={() => openModal("appointment")} onEdit={(id) => openModal("appointment", id)} onDelete={(id) => { if (window.confirm("Delete this fictional appointment?")) setAppointments((old) => old.filter((a) => a.id !== id)); }} onStatus={(id, status) => setAppointments((old) => old.map((a) => a.id === id ? { ...a, status } : a))} filter={filter} setFilter={setFilter} />}
          {page === "reminders" && <RemindersPage t={t} reminders={staffPage ? reminders : reminders.filter((r) => r.beneficiaryId === currentUser?.id)} beneficiaries={beneficiaries} staff={staffPage} onAdd={() => openModal("reminder")} onAcknowledge={(id) => setReminders((old) => old.map((r) => r.id === id ? { ...r, status: "Acknowledged" } : r))} onEdit={(id) => openModal("reminder", id)} onDelete={(id) => { if (window.confirm("Delete this fictional reminder?")) setReminders((old) => old.filter((r) => r.id !== id)); }} filter={filter} setFilter={setFilter} />}
          {page === "beneficiaries" && <BeneficiariesPage t={t} beneficiaries={beneficiaries} appointments={appointments} search={search} setSearch={setSearch} onAdd={() => openModal("beneficiary")} onEdit={(id) => openModal("beneficiary", id)} onDelete={removeBeneficiary} onView={(id) => { setHistoryBeneficiary(id); setFilter("All"); navigate("appointments"); }} />}
          {page === "information" && <InformationPage t={t} events={events} announcements={announcements.filter((a) => a.approved)} language={language} clinicHours={clinicHours} />}
          {page === "profile" && <ProfilePage t={t} user={currentUser} appointments={myAppointments} reminders={reminders.filter((r) => r.beneficiaryId === currentUser?.id)} onLanguage={(v) => { setLanguage(v); setBeneficiaries((old) => old.map((b) => b.id === currentUser?.id ? { ...b, language: v } : b)); }} />}
          {page === "schedule" && <SchedulePage t={t} events={events} clinicHours={clinicHours} onHoursChange={(value) => { const result = window.prompt("Weekday clinic hours (fictional demo)", value); if (result?.trim()) setClinicHours({ ...clinicHours, weekdays: result.trim() }); }} onAdd={() => openModal("event")} onEdit={(id) => openModal("event", id)} onDelete={(id) => { if (window.confirm("Delete this fictional clinic event?")) setEvents((old) => old.filter((e) => e.id !== id)); }} />}
          {page === "announcements" && <AnnouncementsPage t={t} announcements={announcements} draft={announcementDraft} setDraft={setAnnouncementDraft} translations={draftTranslations} setTranslations={setDraftTranslations} onGenerate={draftAnnouncement} onPublish={publishAnnouncement} />}
          {page === "reports" && <ReportsPage t={t} beneficiaries={beneficiaries} appointments={appointments} reminders={reminders} onExport={exportCsv} />}
          {page === "settings" && <SettingsPage t={t} onReset={() => { if (window.confirm("Reset this browser's demo data to the original fictional sample?")) { setBeneficiaries(initialBeneficiaries); setAppointments(initialAppointments); setReminders(initialReminders); setEvents(initialEvents); setClinicHours({ weekdays: "08:00–16:00", weekend: "Closed" }); setAnnouncements([{ id: "AN-1", en: "The clinic will be closed on Friday. Normal services will resume on Monday.", af: "Die kliniek sal Vrydag gesluit wees. Normale dienste hervat Maandag.", xh: "Ikliniki iza kuvalwa ngoLwesihlanu. Iinkonzo zesiqhelo ziya kuqhubeka ngoMvulo.", approved: true, date: "2026-11-24" }]); setChat([]); showToast("Demo data reset."); } }} />}
        </main>
      </div>
      {modal && <DataModal kind={modal} editing={editing} beneficiaries={beneficiaries} appointments={appointments} reminders={reminders} events={events} onClose={() => { setModal(null); setEditing(null); }} onSubmit={saveModal} />}
      {toast && <div className="toast"><Check size={17} />{toast}</div>}
    </div>
  );
}

function Landing({ language, setLanguage, enter }: { language: Language; setLanguage: (v: Language) => void; enter: (r: Role) => void }) {
  const t = copy[language];
  return <div className="landing">
    <header className="landing-header"><Logo /><SelectLanguage value={language} onChange={setLanguage} /></header>
    <main className="landing-content">
      <section className="hero-copy"><div className="eyebrow"><span className="eyebrow-dot" /> COMMUNITY CARE, CLOSER</div><h1>{t.welcome}</h1><p>{t.intro}</p><div className="trust-line"><ShieldCheck size={17} />{t.safe}</div>
        <div className="entry-cards">
          <button className="entry-card beneficiary-entry" onClick={() => enter("beneficiary")}><span className="entry-icon"><HeartHandshake size={23} /></span><span className="entry-text"><b>{t.beneficiary}</b><small>Explore your appointments, reminders and health information.</small></span><ArrowRight size={20} /></button>
          <button className="entry-card staff-entry" onClick={() => enter("staff")}><span className="entry-icon"><Stethoscope size={22} /></span><span className="entry-text"><b>{t.staff}</b><small>Open the community care team's workspace and reports.</small></span><ArrowRight size={20} /></button>
        </div>
        <p className="demo-hint"><Sparkles size={16} /> No sign-in needed · choose a demo experience to explore</p>
      </section>
      <section className="hero-art" aria-label="HopeCare community care illustration">
        <div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" />
        <div className="hero-circle"><div className="sun-shape" /><div className="hill hill-back" /><div className="hill hill-front" /><div className="art-person person-one"><span className="head" /><span className="body" /></div><div className="art-person person-two"><span className="head" /><span className="body" /></div><div className="art-person person-three"><span className="head" /><span className="body" /></div><div className="art-heart"><Heart size={19} fill="currentColor" /></div></div>
        <div className="floating-note note-top"><span><CalendarDays size={17} /></span><div><b>A little more support</b><small>One step at a time</small></div></div>
        <div className="floating-note note-bottom"><span className="note-green"><MessageCircle size={17} /></span><div><b>Here in your language</b><small>English · Afrikaans · isiXhosa</small></div></div>
      </section>
    </main>
    <footer className="landing-footer"><span>© The Hope Exchange · HopeCare AI Demo</span><span><ShieldCheck size={14} /> {t.consent}</span></footer>
  </div>;
}

function PageHeading({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return <div className="page-heading"><div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h1>{title}</h1>{description && <p>{description}</p>}</div>{action}</div>;
}

function BeneficiaryHome({ t, user, next, announcements, onNavigate }: { t: typeof copy.en; user?: Beneficiary; next?: Appointment; announcements: Announcement[]; onNavigate: (p: Page) => void }) {
  return <>
    <div className="welcome-strip"><div><span className="eyebrow">YOUR COMMUNITY CARE SPACE</span><h1>{t.hello}, {user?.name.split(" ")[0] ?? "friend"} <span className="wave">✦</span></h1><p>{t.safe}</p></div><div className="welcome-illustration"><HeartHandshake size={45} /></div></div>
    <div className="quick-stats"><div className="stat-card"><span className="stat-icon mint"><CalendarDays size={19} /></span><div><small>{t.next}</small><b>{next ? formatDate(next.date) : "—"}</b><span>{next ? `${next.time} · ${next.clinic}` : t.noAppt}</span></div></div><div className="stat-card"><span className="stat-icon lilac"><Bell size={19} /></span><div><small>{t.reminders}</small><b>Stay in the loop</b><span>Demo reminders are stored in this browser.</span></div></div></div>
    {announcements.length > 0 && <section className="announcement-banner"><span><Bell size={19} /></span><div><small>CLINIC UPDATE</small><p>{announcements[0][user?.language ?? "en"]}</p></div><button className="text-button" onClick={() => onNavigate("information")}>Details <ArrowRight size={15} /></button></section>}
    <div className="section-title"><div><h2>{t.available}</h2><p>Simple help for the things that matter today.</p></div></div>
    <div className="action-grid">
      <button className="action-card action-chat" onClick={() => onNavigate("assistant")}><span className="action-icon"><MessageCircle size={21} /></span><div><b>{t.talk}</b><small>{t.talkDesc}</small></div><ArrowRight size={17} /></button>
      <button className="action-card" onClick={() => onNavigate("appointments")}><span className="action-icon warm"><CalendarDays size={21} /></span><div><b>{t.appointments}</b><small>See your upcoming visits and clinic details.</small></div><ArrowRight size={17} /></button>
      <button className="action-card" onClick={() => onNavigate("information")}><span className="action-icon blue"><Heart size={21} /></span><div><b>{t.information}</b><small>Clinic hours, services and local events.</small></div><ArrowRight size={17} /></button>
    </div>
    <div className="privacy-note"><ShieldCheck size={17} /><span>{t.privacy} {t.disclaimer}</span></div>
  </>;
}

function AssistantPage({ t, language, chat, setChat, question, setQuestion, sendMessage, thinking, chatEnd, toggleVoice, recording, speaking, speak }: {
  t: typeof copy.en; language: Language; chat: ChatMessage[]; setChat: (f: ChatMessage[] | ((old: ChatMessage[]) => ChatMessage[])) => void;
  question: string; setQuestion: (s: string) => void; sendMessage: (s?: string) => void; thinking: boolean;
  chatEnd: React.RefObject<HTMLDivElement | null>; toggleVoice: () => void; recording: boolean; speaking: boolean; speak: (s: string) => void;
}) {
  const prompts = questions[language];
  return <><PageHeading eyebrow="HERE TO HELP" title={t.talk} description={t.talkDesc} action={<button className="button button-quiet" onClick={() => setChat([])}><Plus size={16} />{t.chatClear}</button>} />
    <div className="assistant-layout">
      <section className="chat-card">
        <div className="chat-top"><div className="assistant-avatar"><Sparkles size={19} /></div><div><b>HopeCare assistant</b><span><i className="online-dot" />Demo guide · general information</span></div><span className="sim-chip">SIMULATED</span></div>
        <div className="chat-transcript" aria-live="polite">
          <div className="chat-date">TODAY · PRIVATE DEMO</div>
          <div className="message-row"><span className="message-avatar"><HeartHandshake size={15} /></span><div className="bubble-wrap"><div className="message-bubble assistant-bubble">{language === "en" ? "Hello! I can help with clinic information, appointments and general health topics. What would you like to know?" : language === "af" ? "Hallo! Ek kan help met kliniekinligting, afsprake en algemene gesondheidsonderwerpe. Wat wil jy graag weet?" : "Molo! Ndinganceda ngolwazi lwekliniki, amadinga nezihloko zempilo ngokubanzi. Ungathanda ukwazi ntoni?"}</div><small>HopeCare · now</small></div></div>
          {chat.map((m) => <div key={m.id} className={`message-row ${m.from === "user" ? "message-user" : ""}`}>{m.from === "assistant" && <span className="message-avatar"><HeartHandshake size={15} /></span>}<div className="bubble-wrap"><div className={`message-bubble ${m.from === "assistant" ? "assistant-bubble" : "user-bubble"}`}>{m.text}</div><small>{m.from === "user" ? "You" : "HopeCare"} · {m.time}</small>{m.from === "assistant" && <button className="speak-inline" title={speaking ? t.stop : t.listen} onClick={() => speak(m.text)}>{speaking ? <VolumeX size={14} /> : <Volume2 size={14} />}</button>}</div></div>)}
          {thinking && <div className="message-row"><span className="message-avatar"><HeartHandshake size={15} /></span><div className="typing-bubble"><i /><i /><i /></div></div>}
          <div ref={chatEnd} />
        </div>
        <div className="suggested"><small>{t.quick}</small><div>{prompts.slice(0, 4).map((prompt) => <button key={prompt} onClick={() => sendMessage(prompt)}>{prompt}</button>)}</div></div>
        <form className="chat-compose" onSubmit={(e) => { e.preventDefault(); sendMessage(); }}>
          <button type="button" className={`mic-button ${recording ? "recording" : ""}`} aria-label={recording ? t.recording : t.record} title={recording ? t.recording : t.record} onClick={toggleVoice}>{recording ? <MicOff size={20} /> : <Mic size={20} />}</button>
          <input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder={t.ask} aria-label={t.ask} />
          <button className="send-button" type="submit" disabled={!question.trim() || thinking} aria-label={t.send}><Send size={18} /></button>
        </form>
        <div className="chat-footer"><span><ShieldCheck size={14} /> {t.disclaimer}</span><span>{t.simulation}</span></div>
      </section>
      <aside className="assistant-side">
        <div className="side-info-card"><span className="side-card-icon"><Volume2 size={18} /></span><h3>Voice support</h3><p>Speak a question or listen to a reply. Available browser voices and recognition can vary by device and language.</p><button className="small-link" onClick={() => speak(language === "en" ? "Voice support is ready when your browser supports it." : language === "af" ? "Stemondersteuning is gereed indien jou blaaier dit ondersteun." : "Ilizwi lilungile xa isikhangeli sakho silixhasa.")}>{speaking ? t.stop : t.listen} <ArrowRight size={14} /></button></div>
        <div className="safety-card"><span><ShieldCheck size={20} /></span><h3>{t.safety}</h3><p>{t.disclaimer}</p><div className="emergency-line"><Siren size={17} /><span>{t.emergency}</span></div></div>
        <div className="language-note"><Languages size={16} /><span>Answer language: <b>{languageName(language)}</b>. Common replies are curated, not machine translated.</span></div>
      </aside>
    </div>
  </>;
}

function AppointmentsPage({ t, appointments, beneficiaries, staff, historyBeneficiary, onClearHistory, onAdd, onEdit, onDelete, onStatus, filter, setFilter }: {
  t: typeof copy.en; appointments: Appointment[]; beneficiaries: Beneficiary[]; staff: boolean; onAdd: () => void;
  historyBeneficiary: string | null; onClearHistory: () => void; onEdit: (id: string) => void; onDelete: (id: string) => void;
  onStatus: (id: string, status: AppointmentStatus) => void; filter: string; setFilter: (s: string) => void;
}) {
  const shown = appointments.filter((a) => filter === "All" || a.status === filter).sort((a, b) => a.date.localeCompare(b.date));
  const selectedBeneficiary = beneficiaries.find((b) => b.id === historyBeneficiary);
  return <>
    <PageHeading eyebrow={staff ? "CARE COORDINATION" : "YOUR VISITS"} title={staff ? (historyBeneficiary ? `${selectedBeneficiary?.name ?? "Beneficiary"} · appointment history` : t.appointments) : t.appointmentsTitle} description={staff ? (historyBeneficiary ? "Review this beneficiary's fictional appointment history." : "Plan visits, update attendance and keep the schedule clear.") : "Your clinic visits in one place. Contact your clinic if a detail needs to change."} action={staff && <div className="heading-actions">{historyBeneficiary && <button className="button button-quiet" onClick={onClearHistory}>All appointments</button>}<button className="button button-primary" onClick={onAdd}><Plus size={17} />{t.add} appointment</button></div>} />
    <div className="toolbar"><div className="filter-tabs"><button className={filter === "All" ? "selected" : ""} onClick={() => setFilter("All")}>{t.all}</button><button className={filter === "Scheduled" ? "selected" : ""} onClick={() => setFilter("Scheduled")}>{t.upcoming}</button><button className={filter === "Completed" ? "selected" : ""} onClick={() => setFilter("Completed")}>{t.past}</button><button className={filter === "Missed" ? "selected" : ""} onClick={() => setFilter("Missed")}>Missed</button></div><span className="result-count">{shown.length} appointments</span></div>
    <div className="table-card"><table><thead><tr>{staff && <th>{t.name}</th>}<th>{t.date}</th><th>{t.time}</th><th>{t.clinic}</th><th>{t.type}</th><th>{t.status}</th>{staff && <th>{t.actions}</th>}</tr></thead><tbody>
      {shown.map((a) => <tr key={a.id}>{staff && <td><div className="person-cell"><span className="mini-avatar">{beneficiaries.find((b) => b.id === a.beneficiaryId)?.name.split(" ").map((x) => x[0]).join("")}</span><div><b>{beneficiaries.find((b) => b.id === a.beneficiaryId)?.name ?? "Unknown"}</b><small>{a.beneficiaryId}</small></div></div></td>}<td><b>{formatDate(a.date)}</b></td><td>{a.time}</td><td><span className="clinic-cell"><MapPin size={14} />{a.clinic}</span></td><td>{a.type}</td><td>{staff ? <select className="table-select" aria-label="Appointment status" value={a.status} onChange={(e) => onStatus(a.id, e.target.value as AppointmentStatus)}><option>Scheduled</option><option>Completed</option><option>Missed</option></select> : <StatusBadge>{a.status}</StatusBadge>}</td>{staff && <td><button className="row-action" onClick={() => onEdit(a.id)}>Edit</button><button className="row-action delete-action" onClick={() => onDelete(a.id)}>Delete</button></td>}</tr>)}
      {!shown.length && <tr><td colSpan={staff ? 7 : 5} className="empty-cell">{t.noData}</td></tr>}
    </tbody></table></div>
    <p className="under-note"><ShieldCheck size={15} /> Clinic times in this demo are fictional. Please confirm details directly with clinic staff.</p>
  </>;
}

function RemindersPage({ t, reminders, beneficiaries, staff, onAdd, onAcknowledge, onEdit, onDelete, filter, setFilter }: {
  t: typeof copy.en; reminders: Reminder[]; beneficiaries: Beneficiary[]; staff: boolean; onAdd: () => void;
  onAcknowledge: (id: string) => void; onEdit: (id: string) => void; onDelete: (id: string) => void; filter: string; setFilter: (s: string) => void;
}) {
  const filtered = reminders.filter((r) => filter === "All" || r.status === filter).sort((a, b) => a.date.localeCompare(b.date));
  return <>
    <PageHeading eyebrow="A LITTLE NUDGE, WHEN IT HELPS" title={staff ? t.reminders : t.remindersTitle} description={staff ? "Create and track demo reminders. Nothing is sent outside this browser." : "A gentle reminder can help you plan ahead. These are demo notifications only."} action={staff && <button className="button button-primary" onClick={onAdd}><Plus size={17} />Create reminder</button>} />
    <div className="reminder-summary"><div><Bell size={20} /><b>{reminders.filter((r) => r.status === "Scheduled").length}</b><span>Scheduled</span></div><div><Send size={20} /><b>{reminders.filter((r) => r.status === "Sent").length}</b><span>Sent in demo</span></div><div><CheckCheck size={20} /><b>{reminders.filter((r) => r.status === "Acknowledged").length}</b><span>Acknowledged</span></div><p><ShieldCheck size={16} /> {t.simulation}</p></div>
    <div className="toolbar"><div className="filter-tabs"><button className={filter === "All" ? "selected" : ""} onClick={() => setFilter("All")}>{t.all}</button>{(["Scheduled", "Sent", "Acknowledged"] as const).map((s) => <button key={s} className={filter === s ? "selected" : ""} onClick={() => setFilter(s)}>{s}</button>)}</div><span className="result-count">{filtered.length} reminders</span></div>
    <div className="reminder-list">{filtered.map((r) => <article className="reminder-row" key={r.id}><span className={`reminder-symbol ${r.kind === "Medication" ? "medicine" : ""}`}>{r.kind === "Medication" ? <Heart size={20} /> : <CalendarDays size={20} />}</span><div className="reminder-content"><div className="row-heading"><b>{r.kind === "Medication" ? t.medication : t.appointment} reminder</b><span>{formatDate(r.date)}</span></div><p>{r.message}</p><small>{staff ? beneficiaries.find((b) => b.id === r.beneficiaryId)?.name ?? "Unknown beneficiary" : "Saved for your demo profile"} · {r.beneficiaryId}</small></div><div className="reminder-actions"><StatusBadge>{r.status}</StatusBadge>{staff ? <><button className="row-action" onClick={() => onEdit(r.id)}>Edit</button><button className="row-action delete-action" onClick={() => onDelete(r.id)}>Delete</button></> : r.status !== "Acknowledged" && <button className="button button-small" onClick={() => onAcknowledge(r.id)}>{t.acknowledge}</button>}</div></article>)}{!filtered.length && <div className="empty-state"><Bell size={24} /><b>{t.noData}</b></div>}</div>
  </>;
}

function BeneficiariesPage({ t, beneficiaries, appointments, search, setSearch, onAdd, onEdit, onDelete, onView }: {
  t: typeof copy.en; beneficiaries: Beneficiary[]; appointments: Appointment[]; search: string; setSearch: (s: string) => void;
  onAdd: () => void; onEdit: (id: string) => void; onDelete: (id: string) => void; onView: (id: string) => void;
}) {
  const filtered = beneficiaries.filter((b) => `${b.name} ${b.id} ${b.area} ${b.preferredClinic}`.toLowerCase().includes(search.toLowerCase()));
  return <>
    <PageHeading eyebrow="COMMUNITY DIRECTORY" title={t.beneficiaries} description="Fictional demo records. Use the directory to coordinate supportive follow-up." action={<button className="button button-primary" onClick={onAdd}><Plus size={17} />Add beneficiary</button>} />
    <div className="directory-metrics"><span><Users size={19} /><b>{beneficiaries.length}</b> demo records</span><span><Languages size={18} /><b>{beneficiaries.filter((b) => b.language === "xh").length}</b> isiXhosa preference</span><span><ShieldCheck size={18} />Consent recorded for demo</span></div>
    <div className="table-card"><div className="table-toolbar"><label className="search-box"><Search size={17} /><input placeholder={t.search} value={search} onChange={(e) => setSearch(e.target.value)} /></label><span className="result-count">{filtered.length} {t.people}</span></div><table><thead><tr><th>{t.name}</th><th>{t.language}</th><th>{t.area}</th><th>Appointments</th><th>{t.actions}</th></tr></thead><tbody>{filtered.map((b) => <tr key={b.id}><td><div className="person-cell"><span className="mini-avatar">{b.name.split(" ").map((x) => x[0]).join("")}</span><div><b>{b.name}</b><small>{b.id} · {b.phone}</small></div></div></td><td><span className="language-pill">{languageName(b.language)}</span></td><td>{b.area}</td><td>{appointments.filter((a) => a.beneficiaryId === b.id).length} visits</td><td><button className="row-action" onClick={() => onView(b.id)}>History</button><button className="row-action" onClick={() => onEdit(b.id)}>Edit</button><button className="row-action delete-action" onClick={() => onDelete(b.id)}>Delete</button></td></tr>)}{!filtered.length && <tr><td colSpan={5} className="empty-cell">No matching beneficiary found.</td></tr>}</tbody></table></div>
    <p className="under-note"><ShieldCheck size={15} />Demo access is simulated; this directory contains fictional information and is not a real patient record.</p>
  </>;
}

function InformationPage({ t, events, announcements, language, clinicHours }: { t: typeof copy.en; events: ClinicEvent[]; announcements: Announcement[]; language: Language; clinicHours: { weekdays: string; weekend: string } }) {
  const serviceItems = language === "en" ? ["General wellness information", "Family health support", "Routine clinic visits", "Medication collection support"] : language === "af" ? ["Algemene welstandsinligting", "Gesondheidsondersteuning vir gesinne", "Roetine-kliniekbesoeke", "Ondersteuning met medikasie-afhaal"] : ["Ulwazi lwezempilo ngokubanzi", "Inkxaso yezempilo yosapho", "Utyelelo oluqhelekileyo ekliniki", "Inkxaso yokuqokelela amayeza"];
  const weekdayLabel = language === "en" ? "Monday – Friday" : language === "af" ? "Maandag – Vrydag" : "NgoMvulo – ngoLwesihlanu";
  const weekendLabel = language === "en" ? "Saturday – Sunday" : language === "af" ? "Saterdag – Sondag" : "NgoMgqibelo – ngeCawa";
  return <>
    <PageHeading eyebrow="INFORMATION YOU CAN USE" title={t.informationTitle} description="Local demo details to help you plan. Confirm clinic information with staff before travelling." />
    {announcements.length > 0 && <div className="info-announcements"><span><Bell size={19} /></span><div><small>APPROVED CLINIC UPDATE</small>{announcements.map((a) => <p key={a.id}>{a[language]}</p>)}</div></div>}
    <div className="info-grid">
      <article className="info-card"><span className="info-card-icon"><Clock3 size={20} /></span><h2>{t.clinicHours}</h2><p>Hope Exchange Community Clinic</p><div className="hours-row"><span>{weekdayLabel}</span><b>{clinicHours.weekdays}</b></div><div className="hours-row"><span>{weekendLabel}</span><b>{clinicHours.weekend}</b></div><small>Times are fictional demo information.</small></article>
      <article className="info-card"><span className="info-card-icon peach"><Heart size={20} /></span><h2>{t.services}</h2><p>Ask clinic staff which services are offered on your visit day.</p><ul className="check-list">{serviceItems.map((s) => <li key={s}><Check size={16} />{s}</li>)}</ul></article>
    </div>
    <section className="section-title"><div><h2>{t.events}</h2><p>Community activities listed in this demo.</p></div><span className="demo-label">FICTIONAL DEMO EVENTS</span></section>
    <div className="event-grid">    {[...events].sort((a, b) => a.date.localeCompare(b.date)).map((e) => <article className="event-card" key={e.id}><div className="event-date"><b>{new Date(`${e.date}T12:00:00`).toLocaleDateString("en-ZA", { day: "2-digit" })}</b><span>{new Date(`${e.date}T12:00:00`).toLocaleDateString("en-ZA", { month: "short" })}</span></div><div><b>{e.title}</b><p>{e.description}</p><small><CalendarDays size={13} />{formatDate(e.date)} · {e.time}</small><small><MapPin size={13} />{e.location}</small></div></article>)}{!events.length && <div className="empty-state">{t.noData}</div>}</div>
    <div className="education-card"><span><CircleHelp size={20} /></span><div><h3>General health information</h3><p>For medicine directions, new symptoms or concerns about your care, contact a healthcare worker. Do not change how you take prescribed medicine based on this demo.</p></div></div>
  </>;
}

function ProfilePage({ t, user, appointments, reminders, onLanguage }: { t: typeof copy.en; user?: Beneficiary; appointments: Appointment[]; reminders: Reminder[]; onLanguage: (v: Language) => void }) {
  if (!user) return <div className="empty-state">{t.noData}</div>;
  return <>
    <PageHeading eyebrow="YOUR INFORMATION" title={t.profileTitle} description="This sample profile is fictional and stored only in your browser." />
    <div className="profile-layout"><section className="profile-card"><div className="profile-hero"><span className="profile-avatar">{user.name.split(" ").map((x) => x[0]).join("")}</span><div><h2>{user.name}</h2><span>Beneficiary demo ID · {user.id}</span></div><span className="consent-badge"><ShieldCheck size={15} /> Demo consent</span></div><div className="profile-fields"><div><small>{t.name}</small><b>{user.name}</b></div><div><small>{t.phone}</small><b>{user.phone}</b></div><div><small>{t.area}</small><b>{user.area}</b></div><div><small>Clinic</small><b>{user.preferredClinic}</b></div><div><small>{t.language}</small><select value={user.language} onChange={(e) => onLanguage(e.target.value as Language)}><option value="en">English</option><option value="af">Afrikaans</option><option value="xh">isiXhosa</option></select></div><div><small>Notifications</small><b>In-app demo only</b></div></div><div className="profile-notice"><ShieldCheck size={18} /><span>Your preferences are saved in this browser. No SMS, WhatsApp or external notification is sent.</span></div></section><aside className="profile-aside"><div className="profile-count"><CalendarDays size={19} /><b>{appointments.filter((a) => a.status === "Scheduled").length}</b><span>Upcoming appointments</span></div><div className="profile-count"><Bell size={19} /><b>{reminders.length}</b><span>In-app reminders</span></div><div className="safety-card compact"><h3>{t.safety}</h3><p>{t.disclaimer}</p></div></aside></div>
  </>;
}

function SchedulePage({ t, events, clinicHours, onHoursChange, onAdd, onEdit, onDelete }: { t: typeof copy.en; events: ClinicEvent[]; clinicHours: { weekdays: string; weekend: string }; onHoursChange: (value: string) => void; onAdd: () => void; onEdit: (id: string) => void; onDelete: (id: string) => void }) {
  return <>
    <PageHeading eyebrow="COMMUNITY CALENDAR" title={t.schedule} description="Manage local demo events and help beneficiaries plan ahead." action={<button className="button button-primary" onClick={onAdd}><Plus size={17} />Add clinic event</button>} />
    <div className="schedule-banner"><Clock3 size={20} /><div><b>Hope Exchange Community Clinic</b><span>Monday–Friday · {clinicHours.weekdays} · Saturday–Sunday · {clinicHours.weekend} · Fictional demo hours</span></div><button className="button button-quiet" onClick={() => onHoursChange(clinicHours.weekdays)}>Edit hours</button></div>
    <div className="section-title"><div><h2>Upcoming clinic events</h2><p>Updates here are reflected in the beneficiary information page.</p></div></div>
    <div className="schedule-list">{[...events].sort((a, b) => a.date.localeCompare(b.date)).map((e) => <article key={e.id} className="schedule-event"><div className="schedule-calendar"><b>{new Date(`${e.date}T12:00:00`).toLocaleDateString("en-ZA", { day: "2-digit" })}</b><span>{new Date(`${e.date}T12:00:00`).toLocaleDateString("en-ZA", { month: "short" })}</span></div><div className="schedule-detail"><b>{e.title}</b><p>{e.description}</p><small><Clock3 size={14} />{e.time} <MapPin size={14} />{e.location}</small></div><button className="row-action" onClick={() => onEdit(e.id)}>Edit details</button><button className="row-action delete-action" onClick={() => onDelete(e.id)}>Delete</button></article>)}{!events.length && <div className="empty-state">{t.noData}</div>}</div>
    <div className="privacy-note"><ShieldCheck size={17} /><span>Published schedule details are demo information. Confirm real dates and hours with your clinic.</span></div>
  </>;
}

function AnnouncementsPage({ t, announcements, draft, setDraft, translations, setTranslations, onGenerate, onPublish }: {
  t: typeof copy.en; announcements: Announcement[]; draft: string; setDraft: (v: string) => void; translations: { af: string; xh: string } | null;
  setTranslations: (v: { af: string; xh: string } | null) => void; onGenerate: () => void; onPublish: () => void;
}) {
  return <>
    <PageHeading eyebrow="CLEAR, REVIEWED UPDATES" title={t.announcements} description="Prepare a message in English, review every language version and publish it to the beneficiary portal." />
    <div className="translation-note"><Languages size={19} /><span><b>Human review is part of the process.</b> Only the sample closure message has curated language versions built in. Other text must be translated and checked by a qualified person before publishing.</span></div>
    <section className="announcement-editor"><div className="editor-heading"><span className="stat-icon mint"><Sparkles size={19} /></span><div><h2>{t.draft}</h2><p>{t.draftHelp}</p></div></div><label className="field-label">{t.english}<textarea rows={3} value={draft} onChange={(e) => { setDraft(e.target.value); setTranslations(null); }} placeholder="e.g. The clinic will be closed on Friday. Normal services will resume on Monday." /></label><div className="editor-actions"><button className="button button-secondary" disabled={!draft.trim()} onClick={onGenerate}><Languages size={16} />Generate curated demo versions</button>{translations && <span className="translation-status">{translations.af ? <><Check size={15} />Curated versions ready for staff review</> : <><CircleHelp size={15} />Human translations required before approval</>}</span>}</div>
      {translations && <div className="translation-fields"><label className="field-label">{t.afrikaans}<textarea rows={2} value={translations.af} onChange={(e) => setTranslations({ ...translations, af: e.target.value })} placeholder="Enter reviewed Afrikaans translation" /></label><label className="field-label">{t.xhosa}<textarea rows={2} value={translations.xh} onChange={(e) => setTranslations({ ...translations, xh: e.target.value })} placeholder="Enter reviewed isiXhosa translation" /></label><div className="editor-actions"><button className="button button-primary" disabled={!translations.af.trim() || !translations.xh.trim()} onClick={onPublish}><Check size={16} />{t.approve}</button><span className="microcopy">Approval publishes the three reviewed versions in the beneficiary portal.</span></div></div>}
    </section>
    <div className="section-title"><div><h2>Published announcements</h2><p>Only approved messages are visible to beneficiaries.</p></div><span className="demo-label">{announcements.length} APPROVED</span></div>
    <div className="published-list">{announcements.map((a) => <article className="published-card" key={a.id}><div className="published-meta"><span className="published-icon"><CheckCheck size={17} /></span><div><b>{a.approved ? t.published : t.needsReview}</b><small>{formatDate(a.date)} · Approved for all three languages</small></div><StatusBadge>{a.approved ? "Completed" : "Scheduled"}</StatusBadge></div><div className="published-langs"><div><small>ENGLISH</small><p>{a.en}</p></div><div><small>AFRIKAANS</small><p>{a.af}</p></div><div><small>ISIXHOSA</small><p>{a.xh}</p></div></div></article>)}{!announcements.length && <div className="empty-state">{t.noData}</div>}</div>
  </>;
}

const visitsChart = [
  { week: "Oct 19", visits: 18, missed: 3 }, { week: "Oct 26", visits: 22, missed: 2 },
  { week: "Nov 2", visits: 19, missed: 4 }, { week: "Nov 9", visits: 25, missed: 3 },
  { week: "Nov 16", visits: 23, missed: 2 }, { week: "Nov 23", visits: 28, missed: 3 },
];
const COLORS = ["#168878", "#e7a767", "#7d8fba"];

function StaffDashboard({ t, beneficiaries, appointments, reminders, onNavigate }: { t: typeof copy.en; beneficiaries: Beneficiary[]; appointments: Appointment[]; reminders: Reminder[]; onNavigate: (p: Page) => void }) {
  const completed = appointments.filter((a) => a.status === "Completed").length;
  const missed = appointments.filter((a) => a.status === "Missed").length;
  const scheduled = appointments.filter((a) => a.status === "Scheduled" && a.date >= "2026-11-25" && a.date <= "2026-12-01").length;
  const kpis = [
    { label: t.total, value: beneficiaries.length, icon: <Users size={19} />, color: "mint", trend: "Fictional records" },
    { label: t.scheduled, value: scheduled, icon: <CalendarDays size={19} />, color: "blue", trend: "Next 7 days" },
    { label: t.completed, value: completed, icon: <CheckCheck size={19} />, color: "lilac", trend: "In sample data" },
    { label: t.missed, value: missed, icon: <Clock3 size={19} />, color: "peach", trend: "Follow-up may help" },
    { label: t.sent, value: reminders.filter((r) => r.status !== "Scheduled").length, icon: <Bell size={19} />, color: "blue", trend: "Simulated only" },
    { label: t.interactions, value: 128, icon: <MessageCircle size={19} />, color: "mint", trend: "Sample analytics" },
  ];
  const languageData = [
    { name: "English", count: 58 }, { name: "Afrikaans", count: 31 }, { name: "isiXhosa", count: 39 },
  ];
  const upcoming = appointments.filter((a) => a.status === "Scheduled").sort((a, b) => a.date.localeCompare(b.date)).slice(0, 4);
  return <>
    <PageHeading eyebrow="STAFF WORKSPACE" title={t.dashboard} description={t.today} action={<span className="dashboard-date"><CalendarDays size={16} /> Wednesday, 25 November 2026</span>} />
    <div className="kpi-grid">{kpis.map((k) => <article className="kpi-card" key={k.label}><span className={`kpi-icon ${k.color}`}>{k.icon}</span><small>{k.label}</small><b>{k.value}</b><span>{k.trend}</span></article>)}</div>
    <div className="dashboard-charts">
      <article className="chart-card visits-chart"><div className="chart-heading"><div><h2>Clinic visits over time</h2><p>Weekly attendance · fictional aggregate</p></div><span className="chart-legend"><i /> Visits <i className="legend-missed" /> Missed</span></div><div className="chart-area"><ResponsiveContainer width="100%" height="100%"><AreaChart data={visitsChart} margin={{ top: 10, right: 12, bottom: 0, left: -18 }}><defs><linearGradient id="visitFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#168878" stopOpacity={0.19} /><stop offset="100%" stopColor="#168878" stopOpacity={0.01} /></linearGradient></defs><CartesianGrid stroke="#edf2ef" vertical={false} /><XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#82918d" }} /><YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#82918d" }} /><Tooltip /><Area type="monotone" dataKey="visits" stroke="#168878" strokeWidth={2.5} fill="url(#visitFill)" /><Area type="monotone" dataKey="missed" stroke="#e7a767" strokeWidth={2} fill="transparent" /></AreaChart></ResponsiveContainer></div></article>
      <article className="chart-card language-chart"><div className="chart-heading"><div><h2>Assistant usage by language</h2><p>Sample interactions · fictional aggregate</p></div></div><div className="donut-wrap"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={languageData} dataKey="count" nameKey="name" innerRadius={55} outerRadius={78} paddingAngle={4} stroke="none">{languageData.map((item, i) => <Cell key={item.name} fill={COLORS[i]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer><div className="donut-center"><b>128</b><span>interactions</span></div></div><div className="language-legend">{languageData.map((item, i) => <div key={item.name}><i style={{ background: COLORS[i] }} />{item.name}<b>{item.count}</b></div>)}</div></article>
    </div>
    <div className="dashboard-bottom">
      <article className="panel-card"><div className="panel-heading"><div><h2>Upcoming clinic visits</h2><p>Visits scheduled in this sample</p></div><button className="text-button" onClick={() => onNavigate("appointments")}>{t.viewAll}<ArrowRight size={14} /></button></div><div className="upcoming-list">{upcoming.map((a) => { const user = beneficiaries.find((b) => b.id === a.beneficiaryId); return <div className="upcoming-row" key={a.id}><span className="mini-avatar">{user?.name.split(" ").map((x) => x[0]).join("")}</span><div><b>{user?.name}</b><small>{a.type} · {a.clinic}</small></div><time>{formatDate(a.date)}<small>{a.time}</small></time></div>; })}</div></article>
      <article className="panel-card engagement-card"><div className="panel-heading"><div><h2>Assistant engagement</h2><p>Aggregate prototype interaction</p></div><span className="stat-icon mint"><MessageCircle size={18} /></span></div><div className="engagement-number">128 <small>sample interactions</small></div><div className="progress-line"><span style={{ width: "72%" }} /></div><div className="engagement-row"><span>Text questions</span><b>72%</b></div><div className="progress-line blue-line"><span style={{ width: "28%" }} /></div><div className="engagement-row"><span>Voice questions</span><b>28%</b></div><p className="microcopy">Simulated aggregate data — no real conversations are collected.</p></article>
    </div>
  </>;
}

function ReportsPage({ t, beneficiaries, appointments, reminders, onExport }: { t: typeof copy.en; beneficiaries: Beneficiary[]; appointments: Appointment[]; reminders: Reminder[]; onExport: () => void }) {
  const completed = appointments.filter((a) => a.status === "Completed").length;
  const missed = appointments.filter((a) => a.status === "Missed").length;
  const attendance = [{ name: "Completed", value: completed }, { name: "Missed", value: missed }, { name: "Scheduled", value: appointments.length - completed - missed }];
  const languages = [{ language: "English", count: beneficiaries.filter((b) => b.language === "en").length }, { language: "Afrikaans", count: beneficiaries.filter((b) => b.language === "af").length }, { language: "isiXhosa", count: beneficiaries.filter((b) => b.language === "xh").length }];
  return <>
    <PageHeading eyebrow={t.reports.toUpperCase()} title={t.reports} description="Understand service activity in the demo. These example metrics are not clinical outcomes." action={<button className="button button-primary" onClick={onExport}><Download size={17} />Download CSV</button>} />
    <div className="report-stats"><div><span>Appointments</span><b>{appointments.length}</b><small>All statuses</small></div><div><span>Reminder engagement</span><b>{reminders.length ? Math.round(reminders.filter((r) => r.status === "Acknowledged").length / reminders.length * 100) : 0}%</b><small>Acknowledged in demo</small></div><div><span>Language coverage</span><b>3</b><small>Curated languages</small></div><div><span>Assistant questions</span><b>128</b><small>Fictional aggregate</small></div></div>
    <div className="report-grid">
      <article className="chart-card"><div className="chart-heading"><div><h2>Appointment attendance</h2><p>Records by current status</p></div></div><div className="chart-area report-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={attendance} margin={{ top: 10, right: 18, bottom: 0, left: -15 }}><CartesianGrid stroke="#edf2ef" vertical={false} /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#82918d" }} /><YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#82918d" }} /><Tooltip /><Bar dataKey="value" radius={[7, 7, 0, 0]}>{attendance.map((a, i) => <Cell key={a.name} fill={COLORS[i]} />)}</Bar></BarChart></ResponsiveContainer></div></article>
      <article className="chart-card"><div className="chart-heading"><div><h2>Beneficiary language preferences</h2><p>Count by selected language</p></div></div><div className="chart-area report-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={languages} layout="vertical" margin={{ top: 3, right: 18, bottom: 0, left: 18 }}><CartesianGrid stroke="#edf2ef" horizontal={false} /><XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#82918d" }} /><YAxis dataKey="language" type="category" width={80} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#82918d" }} /><Tooltip /><Bar dataKey="count" fill="#168878" radius={[0, 6, 6, 0]} barSize={20} /></BarChart></ResponsiveContainer></div></article>
    </div>
    <div className="report-grid lower-report"><article className="panel-card"><h2>Common information topics</h2><p>Illustrative, not diagnostic</p>{[["Clinic hours & schedule", 84], ["Appointments", 73], ["Medication collection", 59], ["Getting ready for a visit", 42]].map(([label, percent]) => <div className="topic-row" key={label as string}><div><span>{label}</span><b>{percent}%</b></div><div className="progress-line"><span style={{ width: `${percent}%` }} /></div></div>)}</article><article className="panel-card"><h2>Commonly shared concerns</h2><p>Self-reported conversation topics only — not confirmed conditions or diagnoses.</p><div className="concern-tags"><span>Appointment planning</span><span>General wellness questions</span><span>Collection dates</span><span>Access to clinic hours</span></div><div className="privacy-note"><ShieldCheck size={16} /><span>No real symptoms, diagnoses or medical records are collected by this prototype.</span></div></article></div>
  </>;
}

function SettingsPage({ t, onReset }: { t: typeof copy.en; onReset: () => void }) {
  const [consent, setConsent] = useState(true);
  const [pref, setPref] = useState("In-app only");
  return <>
    <PageHeading eyebrow="DEMO PREFERENCES" title={t.settings} description="Configuration and privacy boundaries for this local prototype." />
    <div className="settings-grid"><section className="settings-card"><div className="settings-title"><ShieldCheck size={20} /><div><h2>Privacy & consent</h2><p>This is a local demonstration, not a patient-record system.</p></div></div><div className="setting-row"><div><b>Fictional sample data</b><small>No real people or health records are included.</small></div><span className="setting-on">Always on</span></div><div className="setting-row"><div><b>Consent reminder</b><small>Show a privacy notice before collecting demo details.</small></div><button className={`toggle ${consent ? "on" : ""}`} onClick={() => setConsent((x) => !x)} aria-label="Toggle consent reminder"><i /></button></div><div className="setting-row"><div><b>Notification channel</b><small>All notifications stay inside this browser.</small></div><select value={pref} onChange={(e) => setPref(e.target.value)}><option>In-app only</option><option>Disabled</option></select></div><div className="info-callout"><ShieldCheck size={17} /><span>This app has no user authentication, external services, server or database. Do not enter real beneficiary information.</span></div></section><section className="settings-card danger-card"><div className="settings-title"><Activity size={20} /><div><h2>Reset demo data</h2><p>Restore the original fictional sample records in this browser.</p></div></div><button className="button button-danger" onClick={onReset}>Reset sample data</button><small>Your current browser demo changes will be replaced. This cannot be undone.</small></section></div>
  </>;
}

function DataModal({ kind, editing, beneficiaries, appointments, reminders, events, onClose, onSubmit }: {
  kind: "beneficiary" | "appointment" | "reminder" | "event"; editing: string | null;
  beneficiaries: Beneficiary[]; appointments: Appointment[]; reminders: Reminder[]; events: ClinicEvent[];
  onClose: () => void; onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}) {
  const record = kind === "beneficiary" ? beneficiaries.find((x) => x.id === editing) : kind === "appointment" ? appointments.find((x) => x.id === editing) : kind === "reminder" ? reminders.find((x) => x.id === editing) : events.find((x) => x.id === editing);
  const title = `${editing ? "Edit" : "Add"} ${kind === "beneficiary" ? "beneficiary" : kind === "appointment" ? "appointment" : kind === "reminder" ? "reminder" : "clinic event"}`;
  const field = (label: string, name: string, value = "", type = "text", required = true) => <label className="field-label">{label}<input name={name} type={type} defaultValue={value} required={required} /></label>;
  return <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}><section className="data-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="modal-heading"><div><span className="eyebrow">LOCAL DEMO DATA</span><h2 id="modal-title">{title}</h2></div><button className="icon-btn" onClick={onClose} aria-label="Close"><X size={20} /></button></div><form onSubmit={onSubmit}>
    {kind === "beneficiary" && <><div className="form-grid">{field("Full name", "name", (record as Beneficiary | undefined)?.name)}{field("Phone (fictional)", "phone", (record as Beneficiary | undefined)?.phone)}{field("Area", "area", (record as Beneficiary | undefined)?.area)}<label className="field-label">Clinic<input name="clinic" value={HOPE_EXCHANGE_CLINIC} readOnly /></label><label className="field-label">Preferred language<select name="language" defaultValue={(record as Beneficiary | undefined)?.language ?? "en"}><option value="en">English</option><option value="af">Afrikaans</option><option value="xh">isiXhosa</option></select></label></div><label className="consent-check"><input name="consent" type="checkbox" required defaultChecked={Boolean((record as Beneficiary | undefined)?.consent)} /><span>I have consent to use fictional demo information only. No real personal or health details.</span></label><p className="modal-footnote"><ShieldCheck size={15} />This local demo has no real identity system or external data storage.</p></>}
    {kind === "appointment" && <><div className="form-grid"><label className="field-label">Beneficiary<select name="beneficiaryId" defaultValue={(record as Appointment | undefined)?.beneficiaryId ?? beneficiaries[0]?.id}>{beneficiaries.map((b) => <option key={b.id} value={b.id}>{b.name} · {b.id}</option>)}</select></label>{field("Date", "date", (record as Appointment | undefined)?.date ?? "2026-11-26", "date")}{field("Time", "time", (record as Appointment | undefined)?.time ?? "09:00", "time")}<label className="field-label">Clinic<input name="clinic" value={HOPE_EXCHANGE_CLINIC} readOnly /></label>{field("Visit type", "type", (record as Appointment | undefined)?.type ?? "Routine visit")}<label className="field-label">Status<select name="status" defaultValue={(record as Appointment | undefined)?.status ?? "Scheduled"}><option>Scheduled</option><option>Completed</option><option>Missed</option></select></label></div><p className="modal-footnote"><CalendarDays size={15} />Use fictional schedules only. Check real clinic dates with clinic staff.</p></>}
    {kind === "reminder" && <><div className="form-grid"><label className="field-label">Beneficiary<select name="beneficiaryId" defaultValue={(record as Reminder | undefined)?.beneficiaryId ?? beneficiaries[0]?.id}>{beneficiaries.map((b) => <option key={b.id} value={b.id}>{b.name} · {b.id}</option>)}</select></label><label className="field-label">Reminder type<select name="kind" defaultValue={(record as Reminder | undefined)?.kind ?? "Appointment"}><option>Appointment</option><option>Medication</option></select></label>{field("Reminder date", "date", (record as Reminder | undefined)?.date ?? "2026-11-26", "date")}<label className="field-label full-field">Message<textarea name="message" rows={3} defaultValue={(record as Reminder | undefined)?.message ?? ""} required /></label><label className="field-label">Status<select name="status" defaultValue={(record as Reminder | undefined)?.status ?? "Scheduled"}><option>Scheduled</option><option>Sent</option><option>Acknowledged</option></select></label></div><p className="modal-footnote"><Bell size={15} />Simulated reminder only — no SMS, WhatsApp or external notification is sent.</p></>}
    {kind === "event" && <><div className="form-grid">{field("Event title", "title", (record as ClinicEvent | undefined)?.title)}{field("Date", "date", (record as ClinicEvent | undefined)?.date ?? "2026-12-02", "date")}{field("Start time", "time", (record as ClinicEvent | undefined)?.time ?? "09:00", "time")}<label className="field-label">Clinic<input name="location" value={HOPE_EXCHANGE_CLINIC} readOnly /></label><label className="field-label full-field">Description<textarea name="description" rows={3} defaultValue={(record as ClinicEvent | undefined)?.description ?? ""} required /></label></div></>}
    <div className="modal-actions"><button type="button" className="button button-quiet" onClick={onClose}>{copy.en.cancel}</button><button type="submit" className="button button-primary"><Check size={16} />Save</button></div>
  </form></section></div>;
}

function formatDate(value: string) {
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" });
}

type RecognitionLike = {
  lang: string;
  interimResults: boolean;
  onresult: ((event: { results?: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

export default App;


