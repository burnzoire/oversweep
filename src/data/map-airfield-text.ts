import type { MapAirfieldTable } from './encyclopedia';

// Text for one airfield's game data, shared by each map's airfield table and
// the index of every sim airfield.
type Field = MapAirfieldTable['airfields'][number];

const n = (value: number) => value.toLocaleString('en-GB');
// TACAN and DME channels carry an X or Y band; RSBN and PRMG channels do not.
const dmeTypes = ['TACAN', 'VORTAC', 'VOR-DME', 'DME'];
// A channel with its band; * marks a band assumed to be X (see the table notes).
export const channelText = (type: string, channel: number, band?: string) =>
  !dmeTypes.includes(type) ? `ch ${channel}` : band ? `${channel}${band}` : `${channel}X*`;
export const freq = (value: number | null | undefined) => value ? (Number.isInteger(value) ? value.toFixed(1) : String(+value.toFixed(3))) : '—';

export const runwayLines = (x: Field) =>
  x.runways.map((rw) => `${rw.ends.map((e) => `${e.name} (${String(e.heading).padStart(3, '0')}°)`).join(' / ')}${rw.lengthFt ? `, ${n(rw.lengthFt)} ft` : ''}`);
export const towerLines = (x: Field) =>
  [x.radio.vhf && `VHF ${freq(x.radio.vhf)}`, x.radio.uhf && `UHF ${freq(x.radio.uhf)}`].filter((t): t is string => !!t);
export const towerNote = (x: Field) =>
  [x.radio.vhfLow && `low VHF ${freq(x.radio.vhfLow)}`, x.radio.hf && `HF ${freq(x.radio.hf)}`].filter(Boolean).join(' · ');
export const navaidLines = (x: Field) =>
  x.navaids.map((v) => `${v.type} ${[v.channel !== undefined && channelText(v.type, v.channel, v.band), v.frequency !== undefined && `${v.unit === 'kHz' ? v.frequency : freq(v.frequency)} ${v.unit}`].filter(Boolean).join(', ')}${v.callsign ? ` (${v.callsign})` : ''}`);
export const ilsLines = (x: Field) =>
  x.approaches.map((v) => `${v.type === 'PRMG' ? 'PRMG ' : ''}${v.runway || 'runway not given'}: ${v.frequency !== undefined ? freq(v.frequency) : `ch ${v.channel}`}${v.callsign ? ` (${v.callsign})` : ''}`);
