// The encyclopedia list filter behind FilterBar.astro. Items carry
// data-filter-item, data-search and data-facet-<key> (space-separated values);
// the bar's selects each match one facet. A [data-filter-group] (a heading and
// its cards, or a table) hides when nothing in it is left. Items with
// data-filter-count are counted by kind, named by the form's data-nouns.
// The choices are kept in the URL query; without JavaScript the form stays
// hidden and everything is listed.
import { normalize } from "./site-search.mjs";

const fold = (text) => text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

for (const form of document.querySelectorAll('.record-filter')) {
  const scope = form.closest('.ency') ?? document;
  const items = [...scope.querySelectorAll('[data-filter-item]')];
  const groups = [...scope.querySelectorAll('[data-filter-group]')];
  const facets = [...form.querySelectorAll('[data-facet]')];
  const sort = form.querySelector('[data-sort]');
  const fields = [form.elements.q, ...facets, ...(sort ? [sort] : [])];
  const nouns = JSON.parse(form.dataset.nouns || '{}');
  const count = form.querySelector('.filter-count');
  const active = form.querySelector('[data-filter-active]');
  const queryInDisclosure = Boolean(form.elements.q.closest('.filter-disclosure'));
  const empty = form.querySelector('.filter-empty');
  const clear = form.querySelector('.filter-clear');
  // Counted kinds count distinct records, so a record listed twice counts once.
  const key = (item) => item.dataset.filterKey ?? item.dataset.recordId ?? item;
  const searchTexts = new Map(items.map((item) => {
    const text = item.dataset.search ?? '';
    return [item, { original: fold(text), normalized: normalize(text) }];
  }));
  const totals = Object.fromEntries(Object.keys(nouns).map((kind) => [kind, new Set(items.filter((i) => i.dataset.filterCount === kind).map(key)).size]));

  const apply = () => {
    const query = fold(form.elements.q.value.trim());
    const normalized = normalize(query);
    const joined = /^[a-z]+ \d+[a-z0-9]*$/.test(normalized) ? normalized.replaceAll(' ', '') : '';
    const chosen = facets.filter((s) => s.value).map((s) => [s.dataset.facet, s.value]);
    const shown = Object.fromEntries(Object.keys(nouns).map((kind) => [kind, new Set()]));
    for (const item of items) {
      const text = searchTexts.get(item);
      const matchesQuery = !query || text.original.includes(query)
        || (normalized && text.normalized.includes(normalized))
        || (joined && text.normalized.split(' ').some((word) => word.startsWith(joined)));
      const matches = matchesQuery
        && chosen.every(([facet, value]) => (item.getAttribute(`data-facet-${facet}`) ?? '').split(' ').includes(value));
      item.hidden = !matches;
      if (matches && item.dataset.filterCount in shown) shown[item.dataset.filterCount].add(key(item));
    }
    for (const group of groups) group.hidden = ![...group.querySelectorAll('[data-filter-item]')].some((i) => !i.hidden);
    if (sort) {
      const [, desc, field] = sort.value.match(/^(-?)(.+)$/);
      const by = (el, f) => el.getAttribute(`data-sort-${f}`) ?? '';
      const parent = items[0]?.parentElement;
      if (parent) for (const item of [...items].sort((a, b) => (desc ? -1 : 1) * by(a, field).localeCompare(by(b, field)) || by(a, 'name').localeCompare(by(b, 'name')))) parent.append(item);
    }
    const activeCount = Number(Boolean(query)) + chosen.length;
    const filtered = activeCount > 0;
    if (active) {
      const disclosureCount = chosen.length + Number(queryInDisclosure && Boolean(query));
      active.hidden = disclosureCount === 0;
      active.textContent = `${disclosureCount} active`;
    }
    const parts = Object.entries(nouns).map(([kind, noun]) => filtered ? `${shown[kind].size} of ${totals[kind]} ${noun}` : `${totals[kind]} ${noun}`);
    count.textContent = `${filtered ? 'Showing' : 'All'} ${parts.join(', and ')}.`;
    empty.hidden = !filtered || Object.values(shown).some((s) => s.size > 0);
    clear.hidden = !filtered && (!sort || sort.selectedIndex === 0);
    const url = new URL(location.href);
    for (const field of fields) {
      const value = field.value.trim();
      if (value && !(field === sort && sort.selectedIndex === 0)) url.searchParams.set(field.name, value);
      else url.searchParams.delete(field.name);
    }
    history.replaceState(null, '', url);
  };

  const params = new URL(location.href).searchParams;
  for (const field of fields) {
    const value = params.get(field.name);
    // A select only takes a value it offers.
    if (value !== null && (field.tagName !== 'SELECT' || [...field.options].some((o) => o.value === value))) field.value = value;
  }
  form.hidden = false;
  apply();
  form.addEventListener('input', apply);
  // Reset clears the controls after this event, so apply on the next tick.
  form.addEventListener('reset', () => setTimeout(apply));
  form.addEventListener('submit', (event) => event.preventDefault());
}
