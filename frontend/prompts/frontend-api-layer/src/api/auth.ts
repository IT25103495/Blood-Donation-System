import { api, toArray } from './client';
import type {
  AdminCreate, DonorCreate, Hospital, HospitalCreate, HosterCreate, LoginRequest, TokenResponse, Admin,
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
  getHospitals: () => api.get('/auth/get/hospitalList').then((r) => toArray<Hospital>(r.data)),
  getAdmins: () => api.get('/auth/get/adminList').then((r) =>
    toArray<Admin & { ID?: number }>(r.data).map((admin) => ({
      ...admin,
      id: admin.id ?? admin.ID ?? 0,
    })),
  ),
};
