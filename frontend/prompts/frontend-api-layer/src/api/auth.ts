import { api, toArray } from './client';
import type {
  AdminCreate, DonorCreate, Hospital, HospitalCreate, Hoster, HosterCreate, LoginRequest, TokenResponse, Admin,
} from '../types/api';

export const authApi = {
  async login(body: LoginRequest): Promise<TokenResponse> {
    const { data } = await api.post<TokenResponse>('/auth/login', body);
    if (!data.success || !data.token) throw new Error(data.error || 'Invalid username or password.');
    return data;
  },
  registerDonor: (body: DonorCreate) => api.post<string>('/auth/register/donor', body).then((r) => r.data),
  registerHoster: (body: HosterCreate) => api.post<string>('/auth/register/hoster', body).then((r) => r.data),
  registerHospital: (body: HospitalCreate) => api.post<string>('/auth/register/hospital', body).then((r) => r.data),
  registerAdmin: (body: AdminCreate) => api.post<string>('/auth/register/admin', body).then((r) => r.data),
  // Backend serializes the id as "ID" (capital), same as admins; normalize to `id`.
  getHospitals: () => api.get('/auth/get/hospitalList').then((r) =>
    toArray<Hospital & { ID?: number }>(r.data).map((hospital) => ({
      ...hospital,
      id: hospital.id ?? hospital.ID ?? 0,
    })),
  ),
  getHosters: () => api.get('/auth/get/hosterList').then((r) =>
    toArray<Hoster & { ID?: number }>(r.data).map((hoster) => ({
      ...hoster,
      id: hoster.id ?? hoster.ID ?? 0,
    })),
  ),
  getAdmins: () => api.get('/auth/get/adminList').then((r) =>
    toArray<Admin & { ID?: number }>(r.data).map((admin) => ({
      ...admin,
      id: admin.id ?? admin.ID ?? 0,
    })),
  ),
};
