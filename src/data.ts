import type { DemoData } from './types'

export const seedData: DemoData = {
  beneficiaries: [
    { id: 'HC-1001', name: 'Anele Mokoena', language: 'xh', phone: '071 555 0101', notifications: true },
    { id: 'HC-1002', name: 'Johanna Botha', language: 'af', phone: '072 555 0102', notifications: true },
    { id: 'HC-1003', name: 'Thandiwe Ndlovu', language: 'en', phone: '073 555 0103', notifications: false },
    { id: 'HC-1004', name: 'Sipho Dlamini', language: 'xh', phone: '074 555 0104', notifications: true },
    { id: 'HC-1005', name: 'Emma van der Merwe', language: 'af', phone: '075 555 0105', notifications: true },
    { id: 'HC-1006', name: 'Lihle Jacobs', language: 'en', phone: '076 555 0106', notifications: false },
    { id: 'HC-1007', name: 'Bongani Khumalo', language: 'xh', phone: '077 555 0107', notifications: true },
    { id: 'HC-1008', name: 'Marlene Petersen', language: 'af', phone: '078 555 0108', notifications: true },
    { id: 'HC-1009', name: 'Zola April', language: 'xh', phone: '079 555 0109', notifications: true },
    { id: 'HC-1010', name: 'David Smith', language: 'en', phone: '071 555 0110', notifications: false },
  ],
  appointments: [
    { id: 'AP-001', beneficiaryId: 'HC-1001', date: '2026-12-01', time: '09:00', location: 'Hope Exchange Community Clinic', type: 'General consultation', status: 'Scheduled', acknowledged: false },
    { id: 'AP-002', beneficiaryId: 'HC-1002', date: '2026-12-02', time: '10:30', location: 'Hope Exchange Community Clinic', type: 'Medication collection', status: 'Scheduled', acknowledged: true },
    { id: 'AP-003', beneficiaryId: 'HC-1003', date: '2026-11-25', time: '08:30', location: 'Green Point Health Centre', type: 'Primary healthcare', status: 'Completed', acknowledged: true },
    { id: 'AP-004', beneficiaryId: 'HC-1004', date: '2026-11-24', time: '11:00', location: 'Hope Exchange Community Clinic', type: 'Health screening', status: 'Missed', acknowledged: false },
    { id: 'AP-005', beneficiaryId: 'HC-1005', date: '2026-12-04', time: '13:30', location: 'Hope Exchange Community Clinic', type: 'Follow-up consultation', status: 'Scheduled', acknowledged: false },
    { id: 'AP-006', beneficiaryId: 'HC-1006', date: '2026-11-20', time: '09:30', location: 'Green Point Health Centre', type: 'General consultation', status: 'Completed', acknowledged: true },
    { id: 'AP-007', beneficiaryId: 'HC-1007', date: '2026-12-07', time: '10:00', location: 'Hope Exchange Community Clinic', type: 'Medication collection', status: 'Scheduled', acknowledged: false },
    { id: 'AP-008', beneficiaryId: 'HC-1008', date: '2026-11-19', time: '14:00', location: 'Green Point Health Centre', type: 'Health screening', status: 'Completed', acknowledged: true },
    { id: 'AP-009', beneficiaryId: 'HC-1009', date: '2026-12-09', time: '08:45', location: 'Hope Exchange Community Clinic', type: 'Primary healthcare', status: 'Scheduled', acknowledged: true },
    { id: 'AP-010', beneficiaryId: 'HC-1010', date: '2026-11-18', time: '12:15', location: 'Green Point Health Centre', type: 'Follow-up consultation', status: 'Missed', acknowledged: false },
  ],
  reminders: [
    { id: 'RM-001', beneficiaryId: 'HC-1001', kind: 'Appointment', date: '2026-12-01', channel: 'SMS', status: 'Pending', message: 'Your clinic appointment is on 1 December at 09:00.' },
    { id: 'RM-002', beneficiaryId: 'HC-1002', kind: 'Medication', date: '2026-12-02', channel: 'WhatsApp', status: 'Acknowledged', message: 'Please collect your medication on 2 December.' },
    { id: 'RM-003', beneficiaryId: 'HC-1005', kind: 'Appointment', date: '2026-12-04', channel: 'SMS', status: 'Pending', message: 'Appointment reminder: 4 December at 13:30.' },
  ],
  announcements: [
    { id: 'AN-001', en: 'The clinic will be closed on Friday. Normal services resume on Monday.', af: 'Die kliniek is Vrydag gesluit. Normale dienste hervat Maandag.', xh: 'Iklinik izovalwa ngoLwesihlanu. Iinkonzo eziqhelekileyo ziqala ngoMvulo.', status: 'Approved', date: '2026-11-25' },
  ],
  clinicEvents: [
    { id: 'EV-001', name: 'Community Health Screening Day', date: '2026-12-05', hours: '08:00-14:00', location: 'Hope Exchange Community Clinic' },
    { id: 'EV-002', name: 'Medication Education Session', date: '2026-12-12', hours: '10:00-12:00', location: 'Green Point Health Centre' },
  ],
  chatbotInteractions: [
    { language: 'en', voice: false, question: 'Clinic hours' }, { language: 'xh', voice: true, question: 'Clinic location' },
    { language: 'af', voice: false, question: 'Medication collection' }, { language: 'en', voice: true, question: 'Appointment preparation' },
  ],
}
