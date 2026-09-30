import { api, toArray } from './client';
import type { Bloodrequest, requestCreate, requestUpdate } from '../types/api';

export const requestsApi = {
  getAll: () => api.get('/api/request/').then((r) => toArray<Bloodrequest>(r.data)),
  getMy: () => api.get('/api/request/me').then((r) => toArray<Bloodrequest>(r.data)),
  getById: (id: number) =>
    api.get<Bloodrequest>('/api/request/', { params: { ID: id } }).then((r) => r.data),
  create: (body: requestCreate) => api.post<string>('/api/request/', body).then((r) => r.data),
  update: (body: requestUpdate) => api.put<string>('/api/request/', body).then((r) => r.data),
  remove: (id: number) => api.delete<string>('/api/request/', { params: { ID: id } }).then((r) => r.data),
  /**
   * TODO: backend has no endpoint to approve/reject/complete a request
   * (requestUpdateDTO has no "status"). Expected: POST /api/request/{id}/status { status }.
   */
  setStatus: (id: number, status: Bloodrequest['status']) =>
    api.post<string>(`/api/request/${id}/status`, { status }).then((r) => r.data),
};
