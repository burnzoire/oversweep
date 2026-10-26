// Quick quizzes shared by the lesson pages: one question at a time, a row of
// answer buttons and a running score. A question answered correctly leaves the
// round; a missed or skipped one stays and comes back later. Once every
// question has been answered correctly the round ends and the next click
// starts a new one.

// The question order, without the DOM. `random` returns [0, 1) like Math.random.
export function questionPool(items, random = Math.random) {
  let left = [...items], last;
  return {
    get size() { return items.length; },
    get remaining() { return left.length; },
    // A random question still in the round, never the one just asked while
    // another remains. Undefined once the round is done.
    next() {
      if (!left.length) return (last = undefined);
      const from = left.length > 1 ? left.filter((q) => q !== last) : left;
      return (last = from[Math.floor(random() * from.length)]);
    },
    answer(item, right) {
      if (right) left = left.filter((q) => q !== item);
    },
    reset() {
      left = [...items];
      last = undefined;
    },
  };
}

export const shuffle = (xs, random = Math.random) =>
  [...xs].map((x) => [random(), x]).sort((p, q) => p[0] - q[0]).map((p) => p[1]);

// The answer plus `count - 1` other options, in random order.
export function withDistractors(answer, options, count = 4, random = Math.random) {
  const others = shuffle(options.filter((o) => o !== answer), random).slice(0, count - 1);
  return shuffle([answer, ...others], random);
}

export function scoreLine(score, asked, remaining) {
  return `${score} of ${asked}. ${remaining ? `${remaining} left.` : 'All answered correctly.'}`;
}

// Wires a quiz to its elements.
//   ui: { prompt, choices, result, next } elements
//   spec.items: the questions, or a function returning them when they depend
//     on a page setting; call the returned restart() when that setting changes
//   spec.show(item, prompt): draws the question
//   spec.options(item): the answer options to offer
//   spec.isRight(item, option)
//   spec.feedback(item, option, right): the sentence before the score
//   spec.label(option): button text (default String(option))
export function quickQuiz(ui, spec) {
  const { prompt, choices, result, next } = ui;
  const label = spec.label ?? String;
  const nextLabel = next.textContent;
  const items = () => (typeof spec.items === 'function' ? spec.items() : spec.items);
  let pool, score, asked;
  function ask() {
    result.textContent = '';
    next.textContent = nextLabel;
    const item = pool.next();
    if (!item) return choices.replaceChildren();
    spec.show(item, prompt);
    choices.replaceChildren(...spec.options(item).map((option) => {
      const b = Object.assign(document.createElement('button'), { type: 'button', textContent: label(option) });
      b.addEventListener('click', () => {
        const right = spec.isRight(item, option);
        asked++;
        if (right) score++;
        pool.answer(item, right);
        result.textContent = `${spec.feedback(item, option, right)} ${scoreLine(score, asked, pool.remaining)}`;
        for (const c of choices.children) c.disabled = true;
        // The last one right: the round is done and the button starts another.
        if (!pool.remaining) next.textContent = 'Start again';
      });
      return b;
    }));
  }
  // A new round: every question back in, score cleared.
  function restart() {
    pool = questionPool(items());
    score = asked = 0;
    ask();
  }
  next.addEventListener('click', () => (pool.remaining ? ask() : restart()));
  restart();
  return { restart };
}

// The "name the term" quiz over a page's glossary list (dl.jargon).
export function termQuiz(root, { hideTerm = false } = {}) {
  const terms = [...document.querySelectorAll('dl.jargon > div')].map((d) => ({
    // A <Term> link's hidden preview is not part of the word.
    term: (d.querySelector('dt .term-link') ?? d.querySelector('dt')).textContent.trim(), meaning: d.querySelector('dd').textContent.trim(),
  }));
  quickQuiz({
    prompt: root.querySelector('[data-prompt]'), choices: root.querySelector('[data-choices]'),
    result: root.querySelector('[data-result]'), next: root.querySelector('[data-new]'),
  }, {
    items: terms,
    // Optionally hide the term itself where its definition repeats it.
    show: (t, prompt) => {
      prompt.textContent = hideTerm
        ? t.meaning.replace(new RegExp(t.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), '—')
        : t.meaning;
    },
    options: (t) => withDistractors(t, terms),
    label: (t) => t.term,
    isRight: (t, option) => option === t,
    feedback: (t, option, right) => (right ? 'Correct.' : `Not quite: that was ${t.term}.`),
  });
}
