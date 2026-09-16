import { api, toArray } from './client';
import type {
  Appointment, AppointmentCreate, AppointmentResponseRaw, AppointmentStatus, AppointmentUpdate,
} from '../types/api';

export function mapAppointment(raw: AppointmentResponseRaw): Appointment {
  return {
    appID: raw.appID,
    date: raw.date,
    status: raw.status,
    campaign: raw.campaign,
    venue: raw.venue,
    donor: {
      donorID: raw.donor?.donorID,
      firstName: raw.donor?.getfName ?? raw.donor?.fName ?? '',
      lastName: raw.donor?.getlName ?? raw.donor?.lName ?? '',
      bloodType: raw.donor?.bloodType ?? '',
    },
  };
}

export const appointmentsApi = {
  getAll: () =>
    api.get('/api/appointment').then((r) => toArray<AppointmentResponseRaw>(r.data).map(mapAppointment)),
  getById: (id: number) =>
    api.get<AppointmentResponseRaw>(`/api/appointment/${id}`).then((r) => mapAppointment(r.data)),
  /**
   * TODO: backend has no "appointments by donor" endpoint yet.
   * Filtering the full list on the client works for the demo but exposes every
   * donor's appointments to the browser. Replace with GET /api/appointment/donor/{id}.
   */
  getForDonor: async (donorID: number) =>
    (await appointmentsApi.getAll()).filter((a) => a.donor.donorID === donorID),
  getForVenue: async (venueID: number) =>
    (await appointmentsApi.getAll()).filter((a) => a.venue.venueID === venueID),
  create: (body: AppointmentCreate) => api.post<string>('/api/appointment', body).then((r) => r.data),
  update: (id: number, body: AppointmentUpdate) =>
    api.put<string>(`/api/appointment/${id}`, body).then((r) => r.data),
  remove: (id: number) => api.delete<string>(`/api/appointment/${id}`).then((r) => r.data),
  setStatus: (id: number, status: AppointmentStatus) =>
    api.post<string>(`/api/appointment/${id}/status`, { status }).then((r) => r.data),
};
