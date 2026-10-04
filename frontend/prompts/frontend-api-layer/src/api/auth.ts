import { api, toArray } from './client';
import type {
  AdminCreate, Donor, DonorCreate, DonorUpdate, Hospital, HospitalCreate, HospitalUpdate, Hoster, HosterCreate,
  HosterUpdate, LoginRequest, Me, TokenResponse, Admin, UserType, UserUpdate,
} from '../types/api';

/** User subclasses serialize their key as "ID"; the UI works with `id` everywhere. */
function withId<T extends { id?: number; ID?: number }>(rows: T[]) {
  return rows.map((row) => ({ ...row, id: row.id ?? row.ID ?? 0 }));
}

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
  getHospitals: () => api.get('/auth/get/hospitalList').then((r) => withId(toArray<Hospital & { ID?: number }>(r.data))),
  getHosters: () => api.get('/auth/get/hosterList').then((r) => withId(toArray<Hoster & { ID?: number }>(r.data))),
  getAdmins: () => api.get('/auth/get/adminList').then((r) => withId(toArray<Admin & { ID?: number }>(r.data))),
  getDonors: () => api.get('/auth/get/donorList').then((r) => withId(toArray<Donor & { ID?: number }>(r.data))),

  // Partial edits: leave a field out (or empty) and the backend keeps its current value.
  editDonor: (body: DonorUpdate) => api.put<string>('/auth/edit/donor', body).then((r) => r.data),
  editHoster: (body: HosterUpdate) => api.put<string>('/auth/edit/hoster', body).then((r) => r.data),
  editHospital: (body: HospitalUpdate) => api.put<string>('/auth/edit/hospital', body).then((r) => r.data),
  editAdmin: (body: UserUpdate) => api.put<string>('/auth/edit/admin', body).then((r) => r.data),

  /** The signed-in account, whatever role the token belongs to. */
  getMe: () => api.get<Me & { ID?: number }>('/auth/get/me').then((r) => ({ ...r.data, id: r.data.id ?? r.data.ID ?? 0 })),

  deleteUser: (type: UserType, id: number) =>
    api.delete<string>('/auth/delete/user', { params: { type, ID: id } }).then((r) => r.data),
};

