// Aircraft list era filter: the buttons show one era's cards and table rows.
// Without JavaScript the buttons stay hidden and every aircraft is listed.
const filter = document.querySelector('.era-filter');

if (filter) {
  const buttons = [...filter.querySelectorAll('[data-era-filter]')];
  const items = [...document.querySelectorAll('.ency [data-era]')];
  const groups = [...document.querySelectorAll('.ency .aircraft-group')];

  const show = (era) => {
    for (const button of buttons) button.setAttribute('aria-pressed', String(button.dataset.eraFilter === era));
    for (const item of items) item.hidden = era !== 'all' && item.dataset.era !== era;
    // A group with no aircraft left in it hides its heading too.
    for (const group of groups) group.hidden = ![...group.querySelectorAll('[data-era]')].some((item) => !item.hidden);
  };

  const url = new URL(location.href);
  const requested = url.searchParams.get('era');
  show(buttons.some((b) => b.dataset.eraFilter === requested) ? requested : 'all');
  filter.hidden = false;

  filter.addEventListener('click', (event) => {
    const button = event.target.closest('[data-era-filter]');
    if (!button) return;
    const era = button.dataset.eraFilter;
    show(era);
    if (era === 'all') url.searchParams.delete('era');
    else url.searchParams.set('era', era);
    history.replaceState(null, '', url);
  });
}
