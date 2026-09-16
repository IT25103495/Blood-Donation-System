// IMPORTANT: BloodRequest.quantities is an array with one number per blood type.
// This order MUST match the order the backend uses. Confirm with the backend team.
export const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;
export type BloodType = (typeof BLOOD_TYPES)[number];

// Eligibility rules (change here only)
export const MIN_DONOR_AGE = 18;
export const MAX_DONOR_AGE = 60;
export const DONATION_GAP_MONTHS = 4;

export const PAGE_SIZE = 50;
export const TOKEN_KEY = 'bd_token';
export const ROLE_KEY = 'bd_role';
export const ADMIN_TYPE_KEY = 'bd_admin_type';
