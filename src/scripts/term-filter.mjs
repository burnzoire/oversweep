// Terminology glossary filters: a search box and one button per term set.
// Without JavaScript the tools stay hidden and every word is listed.
const tools = document.querySelector('.glossary-tools');

if (tools) {
  const search = tools.querySelector('#term-search');
  const buttons = [...tools.querySelectorAll('[data-term-filter]')];
  const count = tools.querySelector('[data-term-count]');
  const empty = document.querySelector('[data-term-empty]');
  const terms = [...document.querySelectorAll('.ency .term[data-term-text]')];
  const groups = [...document.querySelectorAll('.ency .letter-group')];
  let set = 'all';

  const matches = (term, words) =>
    (set === 'all' || (set === 'differs' ? term.hasAttribute('data-term-differs') : term.dataset.termSets.split(' ').includes(set)))
    && words.every((w) => term.dataset.termText.includes(w));

  const update = () => {
    const words = search.value.toLowerCase().split(/\s+/).filter(Boolean);
    for (const button of buttons) button.setAttribute('aria-pressed', String(button.dataset.termFilter === set));
    let shown = 0;
    for (const term of terms) {
      term.hidden = !matches(term, words);
      if (!term.hidden) shown += 1;
    }
    // A letter with no words left in it hides its heading too.
    for (const group of groups) group.hidden = ![...group.querySelectorAll('.term')].some((t) => !t.hidden);
    count.textContent = shown === terms.length ? `${terms.length} terms` : `Showing ${shown} of ${terms.length} terms`;
    empty.hidden = shown > 0;
  };

  const url = new URL(location.href);
  const requested = url.searchParams.get('set');
  if (buttons.some((b) => b.dataset.termFilter === requested)) set = requested;
  search.value = url.searchParams.get('q') ?? '';
  update();
  tools.hidden = false;

  const remember = () => {
    if (set === 'all') url.searchParams.delete('set'); else url.searchParams.set('set', set);
    if (search.value) url.searchParams.set('q', search.value); else url.searchParams.delete('q');
    history.replaceState(null, '', url);
  };
  search.addEventListener('input', () => { update(); remember(); });
  tools.addEventListener('click', (event) => {
    const button = event.target.closest('[data-term-filter]');
    if (!button) return;
    set = button.dataset.termFilter;
    update();
    remember();
  });
}
