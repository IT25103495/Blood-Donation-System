import { api, toArray } from './client';
import type { Venue, VenueCreate, VenueUpdate } from '../types/api';

// Note: paths use capital "Venue" and the query param is capital "ID".
export const venuesApi = {
  getAll: () => api.get('/api/Venue/getAll').then((r) => toArray<Venue>(r.data)),
  getById: (id: number) => api.get<Venue>('/api/Venue/getById', { params: { ID: id } }).then((r) => r.data),
  create: (body: VenueCreate) => api.post<string>('/api/Venue/add', body).then((r) => r.data),
  update: (body: VenueUpdate) => api.put<string>('/api/Venue/update', body).then((r) => r.data),
  remove: (id: number) => api.delete<string>('/api/Venue/delete', { params: { ID: id } }).then((r) => r.data),
};
