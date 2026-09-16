// Central React Query keys. Invalidate these after mutations.
export const qk = {
  campaigns: ['campaigns'] as const,
  campaign: (id: number) => ['campaigns', id] as const,
  hosterCampaigns: (hosterID: number) => ['campaigns', 'hoster', hosterID] as const,
  appointments: ['appointments'] as const,
  donorAppointments: (donorID: number) => ['appointments', 'donor', donorID] as const,
  venueAppointments: (venueID: number) => ['appointments', 'venue', venueID] as const,
  venues: ['venues'] as const,
  banks: ['banks'] as const,
  requests: ['requests'] as const,
  inventory: ['inventory'] as const,
  availableInventory: ['inventory', 'available'] as const,
  bankInventory: (bankID: number) => ['inventory', 'bank', bankID] as const,
  hospitals: ['hospitals'] as const,
  admins: ['admins'] as const,
};
