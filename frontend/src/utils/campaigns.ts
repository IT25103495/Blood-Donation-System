import type { Campaign, Hoster, Venue } from '../types/api'

// The backend writes a related entity in full the first time it appears in a response and as a bare
// id every time after (Jackson object ids). So the same field can be an object or a number depending
// on what else is in the payload - always resolve it instead of trusting the shape.

export function hostName(campaign: Campaign, hosters: Hoster[]) {
  const raw = campaign.hoster as Hoster | number | null
  if (raw && typeof raw === 'object') return raw.orgName
  return hosters.find((hoster) => hoster.id === raw)?.orgName ?? 'Unknown host'
}

/** The ids of the venues on a campaign, for sending back a replacement venue set. */
export function venueIdsOf(campaign: Campaign | null) {
  return (campaign?.venueSet ?? []).map((entry) => (typeof entry === 'object' ? entry.venueID : (entry as number)))
}

/** The venues on a campaign, with details read from `venues` so an edited venue shows its new name. */
export function venuesOf(campaign: Campaign | null, venues: Venue[]) {
  return venueIdsOf(campaign)
    .map((venueID) => venues.find((venue) => venue.venueID === venueID))
    .filter((venue): venue is Venue => Boolean(venue))
}
