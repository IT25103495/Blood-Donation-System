import type { Appointment } from '../types/api';
import { DONATION_GAP_MONTHS, MAX_DONOR_AGE, MIN_DONOR_AGE } from './constants';

export function ageOn(dob: string, on = new Date()): number {
  const d = new Date(dob);
  let age = on.getFullYear() - d.getFullYear();
  const hadBirthday =
    on.getMonth() > d.getMonth() || (on.getMonth() === d.getMonth() && on.getDate() >= d.getDate());
  if (!hadBirthday) age -= 1;
  return age;
}

export const isAgeEligible = (dob: string) => {
  const age = ageOn(dob);
  return age >= MIN_DONOR_AGE && age <= MAX_DONOR_AGE;
};

/**
 * The backend has no "lastDonationDate", so eligibility is derived from the
 * donor's own appointments. Any COMPLETE or still-BOOKED appointment counts.
 */
export function nextEligibleDate(appointments: Appointment[]): Date | null {
  const relevant = appointments.filter((a) => a.status !== 'CANCELLED');
  if (relevant.length === 0) return null;
  const latest = relevant.map((a) => new Date(a.date)).sort((a, b) => b.getTime() - a.getTime())[0];
  const next = new Date(latest);
  next.setMonth(next.getMonth() + DONATION_GAP_MONTHS);
  return next;
}

export function canBook(appointments: Appointment[], today = new Date()) {
  const next = nextEligibleDate(appointments);
  return { eligible: !next || next <= today, nextDate: next };
}
