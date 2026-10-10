import { hardModeError, letterStates, scoreGuess, shareText } from './game';

describe('scoreGuess', () => {
  test('all correct', () => {
    expect(scoreGuess('crane', 'crane')).toEqual(['correct', 'correct', 'correct', 'correct', 'correct']);
  });

  test('a repeated guess letter is only marked as often as the answer has it', () => {
    // "abide" has a single E: only the first extra E is "present".
    expect(scoreGuess('speed', 'abide')).toEqual(['absent', 'absent', 'present', 'absent', 'present']);
  });

  test('exact matches use up letters before "present" does', () => {
    expect(scoreGuess('papal', 'apple')).toEqual(['present', 'present', 'correct', 'absent', 'present']);
    expect(scoreGuess('lllll', 'hello')).toEqual(['absent', 'absent', 'correct', 'correct', 'absent']);
  });
});

test('letterStates keeps the best state per letter', () => {
  const states = letterStates(['sweet', 'tease'], 'reset');
  expect(states.t).toBe('correct');
  expect(states.s).toBe('present');
  expect(states.w).toBe('absent');
});

describe('hardModeError', () => {
  test('green letters must stay in place', () => {
    expect(hardModeError('slate', ['cloth'], 'crane')).toBe('1st letter must be C');
  });

  test('yellow letters must be reused', () => {
    expect(hardModeError('brine', ['react'], 'cloth')).toBe('Guess must contain C');
  });

  test('a guess that uses every clue is allowed', () => {
    expect(hardModeError('trace', ['react'], 'crate')).toBeNull();
  });
});

test('shareText builds the emoji grid', () => {
  const text = shareText({ guesses: ['slate', 'crane'], answer: 'crane', won: true, hardMode: true, hintUsed: true });
  expect(text).toContain('Wordle 2023 2/6* 💡');
  expect(text).toContain('⬛⬛🟩⬛🟩\n🟩🟩🟩🟩🟩');
});
