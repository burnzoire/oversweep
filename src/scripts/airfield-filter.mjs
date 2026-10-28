// Airfield index search and filters: a name, former name or identifier, and
// a country, theatre, sim map and service. Cards and comparison rows carry the
// matching data-* attributes. Without JavaScript the form stays hidden and
// every airfield is listed. The choices are kept in the URL query.
const form = document.querySelector('.airfield-filter');

if (form) {
  const items = [...document.querySelectorAll('.ency [data-airfield]')];
  const cards = items.filter((item) => item.matches('.entry-card'));
  const count = form.querySelector('.filter-count');
  const empty = form.querySelector('.filter-empty');
  const fields = ['q', 'country', 'theatre', 'map', 'service'];
  // Each select matches one space-separated attribute.
  const lists = { country: 'country', theatre: 'theatres', map: 'maps', service: 'services' };

  const apply = () => {
    const query = form.elements.q.value.trim().toLowerCase();
    let shown = 0;
    for (const item of items) {
      const matches = (!query || item.dataset.search.includes(query))
        && Object.entries(lists).every(([field, attribute]) => {
          const value = form.elements[field].value;
          return !value || item.dataset[attribute].split(' ').includes(value);
        });
      item.hidden = !matches;
      if (matches && cards.includes(item)) shown += 1;
    }
    count.textContent = `Showing ${shown} of ${cards.length} airfields.`;
    empty.hidden = shown > 0;
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
