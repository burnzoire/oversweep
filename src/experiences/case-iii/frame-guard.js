// The trainer is too busy to share a page, so it runs only in its own window.
// Inside any frame, app.js does not start and the page offers a link instead.
if (window.top !== window.self) {
  window.oversweepFramed = true;
  document.addEventListener('DOMContentLoaded', () => {
    const notice = document.createElement('p');
    const link = document.createElement('a');
    notice.className = 'frame-notice';
    link.href = location.href;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = 'Open the Case III trainer in a new window';
    notice.append('This trainer runs only in its own window. ', link, '.');
    document.body.replaceChildren(notice);
  });
}
