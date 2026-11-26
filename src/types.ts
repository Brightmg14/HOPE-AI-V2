export type Language = "en" | "af" | "xh";
export type AppointmentStatus = "Scheduled" | "Completed" | "Missed";
export type ReminderStatus = "Scheduled" | "Acknowledged";
export interface Beneficiary {
  id: string; name: string; phone: string; language: Language; area: string;
  preferredClinic: string; consent: boolean; joined: string;
}
export interface Appointment {
  id: string; beneficiaryId: string; date: string; time: string; clinic: string;
  type: string; status: AppointmentStatus; reminderSent: boolean;
}
export interface Reminder {
  id: string; beneficiaryId: string; kind: "Appointment" | "Medication";
  date: string; message: string; status: ReminderStatus;
}
export interface ClinicEvent {
  id: string; title: string; date: string; time: string; location: string; description: string;
}
export interface Announcement {
  id: string; en: string; af: string; xh: string; approved: boolean; date: string;
}
