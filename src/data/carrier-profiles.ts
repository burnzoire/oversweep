import data from './carrier-profiles.json';
import { carriers, type CarrierSource } from './carriers';
import { validateCarrierProfiles } from './carrier-profile-model.mjs';

export interface ProfileSource extends CarrierSource { id: string }
export interface ProfileClaim { text: string; cites: string[] }
export interface CarrierClassProfile {
  slug: string;
  name: string;
  registryClass: string;
  summary: string;
  summaryCites: string[];
  asOf: string;
  facts: { label: string; value: string; cites: string[] }[];
  sections: (ProfileClaim & { title: string })[];
  sources: ProfileSource[];
}
export interface CarrierShipProfile {
  carrier: string;
  overview: ProfileClaim;
  milestones: (ProfileClaim & { date: string })[];
  sources: ProfileSource[];
}
export const carrierProfiles = data as { classes: CarrierClassProfile[]; ships: CarrierShipProfile[] };
const problems = validateCarrierProfiles(carrierProfiles, carriers);
if (problems.length) throw new Error(`Invalid carrier profiles:\n${problems.join('\n')}`);
export const classProfileFor = (registryClass: string) => carrierProfiles.classes.find((profile) => profile.registryClass === registryClass);
export const shipProfileFor = (slug: string) => carrierProfiles.ships.find((profile) => profile.carrier === slug);
