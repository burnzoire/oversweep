// Terminology glossary filters: a search box and a term set selector.
// Without JavaScript the tools stay hidden and every word is listed.
const tools = document.querySelector('.glossary-tools');

if (tools) {
  const search = tools.querySelector('#term-search');
  const sets = tools.querySelector('#term-set');
  const count = tools.querySelector('[data-term-count]');
  const empty = document.querySelector('[data-term-empty]');
  const terms = [...document.querySelectorAll('.ency .term[data-term-text]')];
  const groups = [...document.querySelectorAll('.ency .letter-group')];
  const links = new Map([...document.querySelectorAll('[data-term-letter]')].map((item) => [item.dataset.termLetter, item]));

  const matches = (term, words, set) =>
    (set === 'all' || (set === 'differs' ? term.hasAttribute('data-term-differs') : term.dataset.termSets.split(' ').includes(set)))
    && words.every((w) => term.dataset.termText.includes(w));

  const update = () => {
    const words = search.value.toLowerCase().split(/\s+/).filter(Boolean);
    let shown = 0;
    for (const term of terms) {
      term.hidden = !matches(term, words, sets.value);
      if (!term.hidden) shown += 1;
    }
    // A letter with no words left in it hides its heading too.
    for (const group of groups) {
      group.hidden = !group.querySelector('.term:not([hidden])');
      links.get(group.getAttribute('aria-labelledby')).hidden = group.hidden;
    }
    count.textContent = shown === terms.length ? `${terms.length} terms` : `Showing ${shown} of ${terms.length} terms`;
    empty.hidden = shown > 0;
  };

  const params = new URLSearchParams(location.search);
  const requested = params.get('set');
  if ([...sets.options].some((option) => option.value === requested)) sets.value = requested;
  search.value = params.get('q') ?? '';
  update();
  tools.hidden = false;

  const apply = () => {
    update();
    const url = new URL(location.href);
    if (sets.value === 'all') url.searchParams.delete('set'); else url.searchParams.set('set', sets.value);
    if (search.value) url.searchParams.set('q', search.value); else url.searchParams.delete('q');
    history.replaceState(null, '', url);
  };
  tools.addEventListener('input', apply);
}
