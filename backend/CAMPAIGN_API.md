# Campaign API

Base path: `/api/campaigns`

All endpoints except `GET /public` require a JWT: `Authorization: Bearer <token>`.
Roles: `DONOR`, `ADMIN`, `HOSTER`, `HOSPITAL`.

## Endpoints

| Method | Path | Roles | Description |
|---|---|---|---|
| POST | `/api/campaigns` | HOSTER | Create a campaign (status starts as `PENDING`). The hoster is taken from the token. |
| GET | `/api/campaigns` | ADMIN | List every campaign. |
| GET | `/api/campaigns/public` | none (no token) | List `APPROVED` campaigns only. |
| GET | `/api/campaigns/{id}` | any logged-in user | Get one campaign. Non-approved campaigns are visible only to ADMIN and the owning hoster, others get 404. |
| GET | `/api/campaigns/{id}/status` | any logged-in user | Get a campaign's status (same visibility rule as above). |
| POST | `/api/campaigns/{id}/status` | ADMIN | Approve/reject/reset a campaign. |
| PUT | `/api/campaigns/{id}` | ADMIN | Full update of a campaign. |
| PUT | `/api/campaigns/venue?campID=&venueID=` | ADMIN, HOSTER (owner only) | Add a venue to a campaign. |
| GET | `/api/campaigns/hoster/{hosterID}` | ADMIN, HOSTER (own ID only) | List campaigns of a hoster. |
| DELETE | `/api/campaigns/{id}` | ADMIN | Delete a campaign. |

## Payloads

### Create: `POST /api/campaigns`

```json
{
  "name": "City Blood Drive",
  "startDate": "2026-10-01",
  "endDate": "2026-10-03",
  "venueIDs": [1, 2]
}
```

| Field | Type | Rules |
|---|---|---|
| `name` | string | required, not blank, max 255 |
| `startDate` | `yyyy-MM-dd` | required, today or later |
| `endDate` | `yyyy-MM-dd` | required, not before `startDate` |
| `venueIDs` | int[] | required, at least one, each venue must exist |

`hosterID` is not accepted; it comes from the logged-in hoster.
Response: `"Success"` (plain text).

### Update: `PUT /api/campaigns/{id}` (ADMIN)

```json
{
  "name": "City Blood Drive",
  "startDate": "2026-10-01",
  "endDate": "2026-10-03",
  "hosterID": 4,
  "venueIDs": [1, 2],
  "status": "APPROVED"
}
```

All fields are required. `venueIDs` replaces the existing venue set. `hosterID` must be an existing hoster. Same date rules as create, except a past `startDate` is allowed.
Response: `"Updated"`.

### Update status: `POST /api/campaigns/{id}/status` (ADMIN)

```json
{ "status": "APPROVED" }
```

`status` is required, one of `PENDING`, `APPROVED`, `REJECTED`.
Response: `"Status Updated"`.

### Get status: `GET /api/campaigns/{id}/status`

```json
{ "status": "PENDING" }
```

### Assign venue: `PUT /api/campaigns/venue?campID=1&venueID=2`

Query params, no body. Response: `"Venue Assigned"`.

### Campaign object (returned by GET endpoints)

```json
{
  "campID": 1,
  "name": "City Blood Drive",
  "startDate": "2026-10-01",
  "endDate": "2026-10-03",
  "status": "APPROVED",
  "hoster": 4,
  "venueSet": [ { "venueID": 1, "name": "...", "address": "..." } ]
}
```

`hoster` is serialized as the hoster's ID only. Venue fields shown are illustrative; see `Models/Venue.java`.

## Errors

| Status | When |
|---|---|
| 400 | Validation failed (missing/blank field, bad date range, empty `venueIDs`) |
| 401 | Missing or invalid token |
| 403 | Wrong role, or a hoster acting on another hoster's campaign/list |
| 404 | Campaign, venue or hoster not found (also for non-approved campaigns you cannot see) |

## Notes

- Delete returns `"Deleted"`. Delete/update responses are plain text strings, not JSON.
- Status changes have no transition rules yet (e.g. `APPROVED` can be set back to `PENDING`).
