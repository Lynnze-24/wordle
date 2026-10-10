import { ANSWERS, isValidWord, randomAnswer } from './words';

test('answers are unique five-letter words', () => {
  expect(ANSWERS.length).toBeGreaterThan(2000);
  expect(new Set(ANSWERS).size).toBe(ANSWERS.length);
  ANSWERS.forEach((w) => expect(w).toMatch(/^[a-z]{5}$/));
});

test('randomAnswer skips recently played words', () => {
  const avoid = ANSWERS.slice(1);
  expect(randomAnswer(avoid, 0.5)).toBe(ANSWERS[0]);
});

test('isValidWord accepts answers and extra dictionary words, rejects gibberish', async () => {
  expect(await isValidWord('crane')).toBe(true);
  expect(await isValidWord('zymic')).toBe(true);
  expect(await isValidWord('xqzzt')).toBe(false);
  expect(await isValidWord('aeiou')).toBe(false);
});
