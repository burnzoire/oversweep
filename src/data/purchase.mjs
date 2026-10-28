// Where to buy the sim add-ons behind an aircraft or sim map record. Each
// entry names one product in one sim and either links to the stores that sell
// it, says it is free, or says it is not on sale. A developer's own store
// comes before a platform store such as the DCS Store.
export const purchaseSims = {
  dcs: 'DCS World',
  bms: 'Falcon BMS',
  falcon4: 'Falcon 4.0',
  msfs: 'Microsoft Flight Simulator',
};

// When the store pages were last opened to check the links still sell the product.
export const purchaseChecked = '2026-10-28';

const isText = (v) => typeof v === 'string' && v.trim().length > 0;
const platformStores = ['DCS Store', 'DCS World'];

export function validatePurchases(entries, where) {
  if (entries === undefined) return [];
  if (!Array.isArray(entries)) return [`${where}: purchase must be a list.`];
  const problems = [];
  entries.forEach((e, i) => {
    const at = `${where} purchase[${i}]`;
    if (!purchaseSims[e.sim]) problems.push(`${at}: sim "${e.sim}" is unknown.`);
    if (!isText(e.product)) problems.push(`${at}: product is missing.`);
    if (!isText(e.by)) problems.push(`${at}: by is missing.`);
    const links = e.links ?? [];
    if (e.free !== undefined && !isText(e.free)) problems.push(`${at}: free must be text.`);
    if (e.unavailable !== undefined && !isText(e.unavailable)) problems.push(`${at}: unavailable must be text.`);
    if (e.unavailable && (links.length || e.free)) problems.push(`${at}: a product not on sale has no links and is not free.`);
    if (!e.unavailable && !links.length) problems.push(`${at}: needs links, or unavailable text.`);
    links.forEach((l, j) => {
      if (!isText(l.store)) problems.push(`${at} links[${j}]: store is missing.`);
      if (!/^https:\/\/[^\s]+$/.test(l.url ?? '')) problems.push(`${at} links[${j}]: url must be https.`);
    });
    // The developer's store leads; the platform store follows it.
    const firstPlatform = links.findIndex((l) => platformStores.includes(l.store));
    if (firstPlatform >= 0 && links.slice(firstPlatform).some((l) => !platformStores.includes(l.store)))
      problems.push(`${at}: the developer's store must come before the ${links[firstPlatform].store} link.`);
  });
  return problems;
}
