// Same-origin parent only. Standalone controls retain their original layout.
if (window.parent !== window) {
  document.body.classList.add('embedded');
  let lastHeight = 0;
  const report = () => {
    const height = Math.max(800, Math.ceil(document.body.getBoundingClientRect().height));
    if (height === lastHeight) return;
    lastHeight = height;
    window.parent.postMessage({ type: 'oversweep:case-iii:size', height }, window.location.origin);
  };
  new ResizeObserver(report).observe(document.body);
  report();
}
