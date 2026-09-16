import { api, toArray } from './client';
import type { InventoryCreate, InventoryItem, InventoryStatus } from '../types/api';

export const inventoryApi = {
  getAll: () => api.get('/api/Inventory/getAll').then((r) => toArray<InventoryItem>(r.data)),
  getAvailable: () => api.get('/api/Inventory/getAvailable').then((r) => toArray<InventoryItem>(r.data)),
  getByBank: (bankID: number) =>
    api.get('/api/Inventory/getByBankId', { params: { ID: bankID } }).then((r) => toArray<InventoryItem>(r.data)),
  getAvailableByBank: (bankID: number) =>
    api
      .get('/api/Inventory/getAvailableByBankId', { params: { ID: bankID } })
      .then((r) => toArray<InventoryItem>(r.data)),
  getById: (id: number) =>
    api.get<InventoryItem>('/api/Inventory/getById', { params: { ID: id } }).then((r) => r.data),
  create: (body: InventoryCreate) => api.post<string>('/api/Inventory/add', body).then((r) => r.data),
  setStatus: (itemID: number, status: InventoryStatus) =>
    api.put<string>('/api/Inventory/updateStatus', { itemID, status }).then((r) => r.data),
  remove: (id: number) =>
    api.delete<string>('/api/Inventory/delete', { params: { ID: id } }).then((r) => r.data),
};
