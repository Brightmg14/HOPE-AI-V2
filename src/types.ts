export type Language = 'en' | 'af' | 'xh'
export type Role = 'beneficiary' | 'staff'
export type AppointmentStatus = 'Scheduled' | 'Completed' | 'Missed'
export type ReminderStatus = 'Pending' | 'Acknowledged'

export interface Beneficiary {
  id: string
  name: string
  language: Language
  phone: string
  notifications: boolean
}

export interface Appointment {
  id: string
  beneficiaryId: string
  date: string
  time: string
  location: string
  type: string
  status: AppointmentStatus
  acknowledged: boolean
}

export interface Reminder {
  id: string
  beneficiaryId: string
  kind: 'Appointment' | 'Medication'
  date: string
  channel: 'SMS' | 'WhatsApp'
  status: ReminderStatus
  message: string
}

export interface Announcement {
  id: string
  en: string
  af: string
  xh: string
  status: 'Draft' | 'Approved'
  date: string
}

export interface ClinicEvent {
  id: string
  name: string
  date: string
  hours: string
  location: string
}

export interface DemoData {
  beneficiaries: Beneficiary[]
  appointments: Appointment[]
  reminders: Reminder[]
  announcements: Announcement[]
  clinicEvents: ClinicEvent[]
  chatbotInteractions: { language: Language; voice: boolean; question: string }[]
}
