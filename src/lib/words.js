import answerText from '../data/answers';

export const ANSWERS = answerText.split('\n');
const answerSet = new Set(ANSWERS);

// Picks an answer, skipping recently played ones so words don't repeat soon.
export function randomAnswer(avoid = [], random = Math.random()) {
  const skip = new Set(avoid);
  const pool = ANSWERS.filter((w) => !skip.has(w));
  const from = pool.length ? pool : ANSWERS;
  return from[Math.floor(random * from.length)];
}

// The full guess dictionary (~10k words) is code-split and loaded on first use.
let dictionary = null;

export function loadDictionary() {
  if (!dictionary) {
    dictionary = import('../data/guesses').then(({ default: text }) => new Set(text.split('\n')));
  }
  return dictionary;
}

export async function isValidWord(word) {
  if (answerSet.has(word)) return true;
  try {
    const words = await loadDictionary();
    return words.has(word);
  } catch {
    // Chunk failed to load (offline?): don't block play, retry next time.
    dictionary = null;
    return true;
  }
}
