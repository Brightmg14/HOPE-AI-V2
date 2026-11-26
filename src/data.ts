import type { Appointment, Beneficiary, ClinicEvent, Reminder } from "./types";

export const initialBeneficiaries: Beneficiary[] = [
  { id: "HC-1042", name: "Amara Ndlovu", phone: "071 555 0142", language: "en", area: "Khayelitsha", preferredClinic: "Hope Exchange Community Clinic", consent: true, joined: "2025-02-12" },
  { id: "HC-1043", name: "Lutho Mbeki", phone: "072 555 0183", language: "xh", area: "Gugulethu", preferredClinic: "Hope Exchange Community Clinic", consent: true, joined: "2025-03-05" },
  { id: "HC-1044", name: "Mieke van der Merwe", phone: "073 555 0128", language: "af", area: "Philippi", preferredClinic: "Hope Exchange Community Clinic", consent: true, joined: "2025-03-18" },
  { id: "HC-1045", name: "Zanele Dlamini", phone: "074 555 0169", language: "xh", area: "Khayelitsha", preferredClinic: "Hope Exchange Community Clinic", consent: true, joined: "2025-04-02" },
  { id: "HC-1046", name: "Sipho Khumalo", phone: "076 555 0134", language: "en", area: "Nyanga", preferredClinic: "Hope Exchange Community Clinic", consent: true, joined: "2025-04-14" },
  { id: "HC-1047", name: "Anika Jacobs", phone: "078 555 0191", language: "af", area: "Mitchells Plain", preferredClinic: "Hope Exchange Community Clinic", consent: true, joined: "2025-05-01" },
  { id: "HC-1048", name: "Ayanda Jali", phone: "079 555 0115", language: "xh", area: "Gugulethu", preferredClinic: "Hope Exchange Community Clinic", consent: true, joined: "2025-05-23" },
  { id: "HC-1049", name: "Thandi Maseko", phone: "081 555 0172", language: "en", area: "Philippi", preferredClinic: "Hope Exchange Community Clinic", consent: true, joined: "2025-06-07" },
  { id: "HC-1050", name: "Pieter Botha", phone: "082 555 0156", language: "af", area: "Khayelitsha", preferredClinic: "Hope Exchange Community Clinic", consent: true, joined: "2025-06-19" },
  { id: "HC-1051", name: "Nandi Faku", phone: "083 555 0199", language: "xh", area: "Nyanga", preferredClinic: "Hope Exchange Community Clinic", consent: true, joined: "2025-07-04" },
];

export const initialAppointments: Appointment[] = [
  { id: "AP-201", beneficiaryId: "HC-1042", date: "2026-11-26", time: "09:00", clinic: "Hope Exchange Community Clinic", type: "Wellness check", status: "Scheduled", reminderSent: true },
  { id: "AP-202", beneficiaryId: "HC-1043", date: "2026-11-26", time: "10:30", clinic: "Hope Exchange Community Clinic", type: "Routine visit", status: "Scheduled", reminderSent: true },
  { id: "AP-203", beneficiaryId: "HC-1044", date: "2026-11-27", time: "08:45", clinic: "Hope Exchange Community Clinic", type: "Medication collection", status: "Scheduled", reminderSent: false },
  { id: "AP-204", beneficiaryId: "HC-1045", date: "2026-11-27", time: "11:00", clinic: "Hope Exchange Community Clinic", type: "Family health", status: "Scheduled", reminderSent: true },
  { id: "AP-205", beneficiaryId: "HC-1046", date: "2026-11-28", time: "09:30", clinic: "Hope Exchange Community Clinic", type: "Wellness check", status: "Scheduled", reminderSent: false },
  { id: "AP-206", beneficiaryId: "HC-1047", date: "2026-11-24", time: "10:00", clinic: "Hope Exchange Community Clinic", type: "Routine visit", status: "Completed", reminderSent: true },
  { id: "AP-207", beneficiaryId: "HC-1048", date: "2026-11-23", time: "13:15", clinic: "Hope Exchange Community Clinic", type: "Wellness check", status: "Missed", reminderSent: true },
  { id: "AP-208", beneficiaryId: "HC-1049", date: "2026-11-21", time: "09:00", clinic: "Hope Exchange Community Clinic", type: "Routine visit", status: "Completed", reminderSent: true },
  { id: "AP-209", beneficiaryId: "HC-1050", date: "2026-11-20", time: "11:30", clinic: "Hope Exchange Community Clinic", type: "Medication collection", status: "Completed", reminderSent: true },
  { id: "AP-210", beneficiaryId: "HC-1051", date: "2026-11-19", time: "08:30", clinic: "Hope Exchange Community Clinic", type: "Family health", status: "Missed", reminderSent: false },
  { id: "AP-211", beneficiaryId: "HC-1042", date: "2026-12-03", time: "09:15", clinic: "Hope Exchange Community Clinic", type: "Medication collection", status: "Scheduled", reminderSent: false },
  { id: "AP-212", beneficiaryId: "HC-1045", date: "2026-12-04", time: "10:00", clinic: "Hope Exchange Community Clinic", type: "Routine visit", status: "Scheduled", reminderSent: false },
];

export const initialReminders: Reminder[] = [
  { id: "RM-301", beneficiaryId: "HC-1042", kind: "Appointment", date: "2026-11-25", message: "Your wellness check is tomorrow at 09:00.", status: "Acknowledged" },
  { id: "RM-302", beneficiaryId: "HC-1043", kind: "Appointment", date: "2026-11-25", message: "Your clinic visit is tomorrow at 10:30.", status: "Acknowledged" },
  { id: "RM-303", beneficiaryId: "HC-1044", kind: "Medication", date: "2026-11-26", message: "A medication collection is planned for tomorrow.", status: "Scheduled" },
  { id: "RM-304", beneficiaryId: "HC-1045", kind: "Appointment", date: "2026-11-26", message: "Your family health visit is tomorrow at 11:00.", status: "Acknowledged" },
  { id: "RM-305", beneficiaryId: "HC-1046", kind: "Medication", date: "2026-11-26", message: "Please check your clinic card for collection details.", status: "Scheduled" },
];

export const initialEvents: ClinicEvent[] = [
  { id: "EV-1", title: "Community wellness morning", date: "2026-12-02", time: "09:00", location: "Hope Exchange Community Clinic", description: "Drop in for general wellness information and a friendly conversation." },
  { id: "EV-2", title: "Family health information session", date: "2026-12-08", time: "10:00", location: "Hope Exchange Community Clinic", description: "A community session with clinic staff. No booking needed." },
  { id: "EV-3", title: "Holiday clinic schedule", date: "2026-12-15", time: "08:00", location: "Hope Exchange Community Clinic", description: "Ask staff about opening times during the holiday period." },
];

export const languageName = (language: string) => ({ en: "English", af: "Afrikaans", xh: "isiXhosa" }[language] ?? "English");
