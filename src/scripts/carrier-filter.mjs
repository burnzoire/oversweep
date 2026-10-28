import { normalizeCarrierSearch } from '../data/carrier-model.mjs';
const form = document.querySelector('.carrier-filter');
if (form) {
  const body = document.querySelector('.carrier-table tbody');
  const rows = [...body.querySelectorAll('[data-carrier]')];
  const controls = ['q', 'origin', 'class', 'operator', 'sort'];
  const params = new URL(location.href).searchParams;
  for (const field of controls) {
    const control = form.elements[field];
    const value = params.get(field);
    if (value !== null && (control.tagName !== 'SELECT' || [...control.options].some((option) => option.value === value))) control.value = value;
  }
  const apply = () => {
    const q = normalizeCarrierSearch(form.elements.q.value.trim());
    const origin = form.elements.origin.value;
    const shipClass = form.elements.class.value;
    const operator = form.elements.operator.value;
    const order = form.elements.sort.value;
    let count = 0;
    for (const row of rows) {
      row.hidden = !!((q && !row.dataset.search.includes(q)) || (origin && row.dataset.origin !== origin) || (shipClass && row.dataset.class !== shipClass) || (operator && !JSON.parse(row.dataset.operators).includes(operator)));
      if (!row.hidden) count++;
    }
    for (const row of [...rows].sort((a, b) => order === 'name' ? a.dataset.name.localeCompare(b.dataset.name) : (order === 'newest' ? -1 : 1) * (a.dataset.date.localeCompare(b.dataset.date) || a.dataset.name.localeCompare(b.dataset.name)))) body.append(row);
    form.querySelector('.carrier-count').textContent = `Showing ${count} of ${rows.length} carriers.`;
    form.querySelector('.carrier-empty').hidden = count > 0;
    const url = new URL(location.href);
    for (const field of controls) {
      const value = form.elements[field].value.trim();
      if (value && !(field === 'sort' && value === 'date')) url.searchParams.set(field, value);
      else url.searchParams.delete(field);
    }
    history.replaceState(null, '', url);
  };
  form.hidden = false;
  form.addEventListener('input', apply);
  form.addEventListener('submit', (event) => event.preventDefault());
  apply();
}
