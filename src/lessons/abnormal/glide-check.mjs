// Dead-engine glide check for the Emergency Procedures module, Figure 2.
// Two published rules of thumb, each for one aircraft only:
//  - 't6': the CNATRA VT-10 FAM Stan Notes (June 2026) rule for the T-6:
//    altitude needed (thousands of feet AGL) = half the distance (NM) + the key
//    altitude (3 for high key, 1.5 for low key); distance reachable =
//    (altitude - key) x 2. Valid only with no wind, 125 KIAS, clean, prop feathered.
//  - 'f16bms': the Falcon BMS 4.38.1 Training Manual's simplified F-16 rule,
//    1,000 ft of height for each nautical mile, with high key at 7,000 ft
//    (its minimum, for an aircraft with no fuel or stores).
// Units: distance in nautical miles, height in feet above the field.
export const RULES = {
  t6: { label: 'T-6 trainer (CNATRA rule)', ftPerNm: 500, highKey: 3000, lowKey: 1500 },
  f16bms: { label: 'F-16 in Falcon BMS (sim rule)', ftPerNm: 1000, highKey: 7000, lowKey: 3000 },
};

export function glideCheck({ rule, distanceNm, heightFt }) {
  const r = RULES[rule];
  if (!r) throw new Error(`unknown rule ${rule}`);
  if (!(distanceNm >= 0) || !(heightFt >= 0)) throw new Error('distance and height must be non-negative numbers');
  const neededHighKey = distanceNm * r.ftPerNm + r.highKey;
  const neededLowKey = distanceNm * r.ftPerNm + r.lowKey;
  const reachHighKeyNm = Math.max(0, (heightFt - r.highKey) / r.ftPerNm);
  const target = heightFt >= neededHighKey ? 'high' : heightFt >= neededLowKey ? 'low' : 'none';
  return { neededHighKey, neededLowKey, reachHighKeyNm, marginFt: heightFt - neededHighKey, target };
}
