import registry from './carriers.json';
import { validateCarriers } from './carrier-model.mjs';

export interface CarrierSource { title: string; publisher: string; url: string; accessed: string; note?: string }
export interface Carrier {
  slug: string;
  name: string;
  hull: string;
  class: string;
  origin: string;
  commissioned: string | null;
  completed?: string;
  classification?: string;
  operators: string[];
  aliases: string[];
  summary: string;
  sources: CarrierSource[];
}

export const carriers = registry as Carrier[];
const problems = validateCarriers(carriers);
if (problems.length) throw new Error(`Invalid carrier catalogue:\n${problems.join('\n')}`);
export const carrierRoute = (carrier: Carrier) => `encyclopedia/locations/carriers/${carrier.slug}/`;
