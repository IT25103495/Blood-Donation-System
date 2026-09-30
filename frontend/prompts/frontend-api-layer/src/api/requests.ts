import { api, toArray } from './client';
import type { Bloodrequest, requestCreate, requestUpdate } from '../types/api';

// Note: base path is lowercase "/api/request" (singular), unlike Venue/Inventory.
export const requestsApi = {
  /** ADMIN only. */
  getAll: () => api.get('/api/request').then((r) => toArray<BloodRequest>(r.data)),
  /** ADMIN only. */
  getById: (id: number) => api.get<BloodRequest>(`/api/request/${id}`).then((r) => r.data),
  /** ADMIN only. */
  getByHospital: (hospitalID: number) =>
    api.get(`/api/request/hospital/${hospitalID}`).then((r) => toArray<BloodRequest>(r.data)),
  /** HOSPITAL only: the caller's own requests (hospital comes from the token). */
  getMine: () => api.get('/api/request/me').then((r) => toArray<BloodRequest>(r.data)),
  /** HOSPITAL only. */
  getMineById: (reqID: number) => api.get<BloodRequest>(`/api/request/me/${reqID}`).then((r) => r.data),
  /** HOSPITAL only: create a request for the caller's own hospital. */
  create: (body: RequestCreate) => api.post<string>('/api/request', body).then((r) => r.data),
  /** ADMIN only: full update, including reassigning the hospital. */
  update: (body: RequestUpdate) => api.put<string>('/api/request', body).then((r) => r.data),
  /** HOSPITAL only: cancel one of the caller's own requests while it's still PENDING. */
  cancelMine: (reqID: number) => api.delete<string>(`/api/request/me/${reqID}`).then((r) => r.data),
  /** ADMIN only. */
  remove: (id: number) => api.delete<string>('/api/request', { params: { ID: id } }).then((r) => r.data),
  /** ADMIN only. */
  approve: (reqID: number) => api.post<string>(`/api/request/${reqID}/approve`).then((r) => r.data),
  /** ADMIN only. */
  reject: (reqID: number) => api.post<string>(`/api/request/${reqID}/reject`).then((r) => r.data),
  /** ADMIN only. */
  complete: (reqID: number) => api.post<string>(`/api/request/${reqID}/complete`).then((r) => r.data),
};
