// Airfield index search and filters: a name, former name or identifier, and
// a country, theatre, sim map and service. Cards, comparison rows and the
// rows of every sim airfield carry the matching data-* attributes. Without JavaScript the form stays hidden and
// every airfield is listed. The choices are kept in the URL query.
const form = document.querySelector('.airfield-filter');

if (form) {
  const items = [...document.querySelectorAll('.ency [data-airfield]')];
  const cards = items.filter((item) => item.matches('.entry-card'));
  const rows = items.filter((item) => item.matches('.sim-airfield'));
  // A table the filters leave empty is hidden rather than shown as a bare header.
  const tables = [...document.querySelectorAll('.ency .table-scroll')].filter((t) => t.querySelector('[data-airfield]'));
  const count = form.querySelector('.filter-count');
  const empty = form.querySelector('.filter-empty');
  const fields = ['q', 'country', 'theatre', 'map', 'service'];
  // Each select matches one space-separated attribute.
  const lists = { country: 'country', theatre: 'theatres', map: 'maps', service: 'services' };

  const apply = () => {
    const query = form.elements.q.value.trim().toLowerCase();
    let shown = 0;
    let shownRows = 0;
    for (const item of items) {
      const matches = (!query || item.dataset.search.includes(query))
        && Object.entries(lists).every(([field, attribute]) => {
          const value = form.elements[field].value;
          return !value || item.dataset[attribute].split(' ').includes(value);
        });
      item.hidden = !matches;
      if (matches && cards.includes(item)) shown += 1;
      if (matches && rows.includes(item)) shownRows += 1;
    }
    for (const table of tables) table.hidden = ![...table.querySelectorAll('[data-airfield]')].some((row) => !row.hidden);
    // Two lists: the airfields with a full record (the cards) and every airfield
    // on the sim maps (the table below them), which includes recorded ones.
    const filtered = query || Object.keys(lists).some((field) => form.elements[field].value);
    const sims = rows.length ? `the sim maps hold ${rows.length} airfields in all` : '';
    count.textContent = !filtered
      ? `${cards.length} airfields have a full record so far${sims && `; ${sims}`}.`
      : `Matching: ${shown} of the ${cards.length} full records${rows.length ? `, and ${shownRows} of the ${rows.length} airfields on the sim maps` : ''}.`;
    empty.hidden = shown + shownRows > 0;
    const url = new URL(location.href);
    for (const field of fields) {
      const value = form.elements[field].value.trim();
      if (value) url.searchParams.set(field, value);
      else url.searchParams.delete(field);
    }
    history.replaceState(null, '', url);
  };

  const params = new URL(location.href).searchParams;
  for (const field of fields) {
    const value = params.get(field);
    const control = form.elements[field];
    if (value === null) continue;
    // A select only takes a value it offers.
    if (control.tagName !== 'SELECT' || [...control.options].some((o) => o.value === value)) control.value = value;
  }
  form.hidden = false;
  apply();
  form.addEventListener('input', apply);
  form.addEventListener('submit', (event) => event.preventDefault());
}
