import { api, toArray } from './client';
import type { BloodRequest, RequestCreate, RequestUpdate } from '../types/api';

export const requestsApi = {
  getAll: () => api.get('/api/Request/getAll').then((r) => toArray<BloodRequest>(r.data)),
  getById: (id: number) =>
    api.get<BloodRequest>('/api/Request/getById', { params: { ID: id } }).then((r) => r.data),
  create: (body: RequestCreate) => api.post<string>('/api/Request/add', body).then((r) => r.data),
  update: (body: RequestUpdate) => api.put<string>('/api/Request/update', body).then((r) => r.data),
  remove: (id: number) => api.delete<string>('/api/Request/delete', { params: { ID: id } }).then((r) => r.data),
  /**
   * TODO: backend has no endpoint to approve/reject/complete a request
   * (requestUpdateDTO has no "status"). Expected: POST /api/Request/{id}/status { status }.
   */
  setStatus: (id: number, status: BloodRequest['status']) =>
    api.post<string>(`/api/Request/${id}/status`, { status }).then((r) => r.data),
};
