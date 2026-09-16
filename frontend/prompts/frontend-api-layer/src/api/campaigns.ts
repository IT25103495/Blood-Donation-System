import { api, toArray } from './client';
import type { Campaign, CampaignCreate, CampaignStatus, CampaignUpdate } from '../types/api';

export const campaignsApi = {
  getAll: () => api.get('/api/campaigns').then((r) => toArray<Campaign>(r.data)),
  getPublic: () => api.get('/api/campaigns/public').then((r) => toArray<Campaign>(r.data)),
  getById: (id: number) => api.get<Campaign>(`/api/campaigns/${id}`).then((r) => r.data),
  getByHoster: (hosterID: number) =>
    api.get(`/api/campaigns/hoster/${hosterID}`).then((r) => toArray<Campaign>(r.data)),
  create: (body: CampaignCreate) => api.post<string>('/api/campaigns', body).then((r) => r.data),
  update: (id: number, body: CampaignUpdate) => api.put<string>(`/api/campaigns/${id}`, body).then((r) => r.data),
  remove: (id: number) => api.delete<string>(`/api/campaigns/${id}`).then((r) => r.data),
  setStatus: (id: number, status: CampaignStatus) =>
    api.post<string>(`/api/campaigns/${id}/status`, { status }).then((r) => r.data),
  assignVenue: (campID: number, venueID: number) =>
    api.put<string>('/api/campaigns/assignVenue', null, { params: { campID, venueID } }).then((r) => r.data),
};

/** Campaigns a donor may book: APPROVED and not yet ended. */
export function bookableCampaigns(list: Campaign[], today = new Date().toISOString().slice(0, 10)) {
  return list.filter((c) => c.status === 'APPROVED' && c.endDate >= today);
}
