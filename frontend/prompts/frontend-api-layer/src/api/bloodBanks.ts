import { api, toArray } from './client';
import type { Bank, BankCreate } from '../types/api';

// Note: lowercase "id" query param here, unlike the other controllers.
export const bloodBanksApi = {
  getAll: () => api.get('/api/bloodBank/getAll').then((r) => toArray<Bank>(r.data)),
  getById: (id: number) => api.get<Bank>('/api/bloodBank/getById', { params: { id } }).then((r) => r.data),
  create: (body: BankCreate) => api.post<string>('/api/bloodBank/add', body).then((r) => r.data),
  /** Backend expects the full Bank object (including manager). */
  update: (id: number, body: Bank) => api.put<Bank>(`/api/bloodBank/update/${id}`, body).then((r) => r.data),
  remove: (id: number) => api.delete<string>(`/api/bloodBank/delete/${id}`).then((r) => r.data),
};
