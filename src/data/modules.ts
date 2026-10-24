import registry from './modules.json';
import { reviewTrainers } from './experiences';

// Reference modules without a trainer. Like experiences, `publication` decides
// whether a module ships in normal builds and is independent of `maturity`,
// which is always shown to readers. Modules attached to a trainer stay in
// experiences.json under `module`.
export type Module = (typeof registry)[number] & { publication: 'published' | 'excluded' };

export const modules = registry as Module[];
export const includedModules = modules.filter(m => m.publication === 'published' || reviewTrainers);
export const moduleRoute = (m: Module) => `manual/${m.subject}/${m.slug}/`;

export function getModule(slug: string): Module {
  const found = modules.find(m => m.slug === slug);
  if (!found) throw new Error(`Unregistered module: ${slug}`);
  return found;
}
