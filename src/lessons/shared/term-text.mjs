// Page markup that a lesson script copies somewhere else. A <Term> link carries
// its hover preview (.term-tip) as hidden text inside the paragraph, so reading
// a node's textContent pulls the preview's title, kind and definition into the
// copy. Use these instead of textContent on any markup that may hold a <Term>.

// A copy of the node with every preview removed. Links stay; they lose the
// aria-describedby that pointed at the removed preview.
export function withoutPreviews(node) {
  const copy = node.cloneNode(true);
  copy.querySelectorAll('.term-tip').forEach((tip) => tip.remove());
  copy.querySelectorAll('[aria-describedby]').forEach((n) => n.removeAttribute('aria-describedby'));
  return copy;
}

// The node's words as one line, without previews.
export function plainText(node) {
  return withoutPreviews(node).textContent.replace(/\s+/g, ' ').trim();
}
