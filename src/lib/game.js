export const WORD_LENGTH = 5;
export const MAX_GUESSES = 6;

const RANK = { absent: 1, present: 2, correct: 3 };

// Scores a guess the way Wordle does: exact matches first, then "present"
// only while the answer still has unmatched copies of that letter.
// e.g. guess "speed" vs answer "abide" marks just one "e", not both.
export function scoreGuess(guess, answer) {
  const result = Array(guess.length).fill('absent');
  const remaining = {};

  for (let i = 0; i < guess.length; i++) {
    if (guess[i] === answer[i]) result[i] = 'correct';
    else remaining[answer[i]] = (remaining[answer[i]] || 0) + 1;
  }
  for (let i = 0; i < guess.length; i++) {
    if (result[i] !== 'correct' && remaining[guess[i]] > 0) {
      result[i] = 'present';
      remaining[guess[i]]--;
    }
  }
  return result;
}

// Best known state per letter, for colouring the on-screen keyboard.
export function letterStates(guesses, answer) {
  const states = {};
  guesses.forEach((guess) => {
    scoreGuess(guess, answer).forEach((state, i) => {
      const letter = guess[i];
      if (!states[letter] || RANK[state] > RANK[states[letter]]) states[letter] = state;
    });
  });
  return states;
}

const ordinal = (n) => ['1st', '2nd', '3rd', '4th', '5th'][n] || `${n + 1}th`;

// Hard mode: every revealed clue must be reused. Returns a message, or null if the guess is allowed.
export function hardModeError(guess, guesses, answer) {
  for (const prev of guesses) {
    const score = scoreGuess(prev, answer);
    for (let i = 0; i < score.length; i++) {
      if (score[i] === 'correct' && guess[i] !== prev[i]) {
        return `${ordinal(i)} letter must be ${prev[i].toUpperCase()}`;
      }
    }
    for (let i = 0; i < score.length; i++) {
      if (score[i] === 'present' && !guess.includes(prev[i])) {
        return `Guess must contain ${prev[i].toUpperCase()}`;
      }
    }
  }
  return null;
}

const EMOJI = {
  normal: { correct: '🟩', present: '🟨', absent: '⬛' },
  contrast: { correct: '🟧', present: '🟦', absent: '⬛' },
};

export function shareText({ guesses, answer, won, hardMode, hintUsed, colorBlind }) {
  const emoji = colorBlind ? EMOJI.contrast : EMOJI.normal;
  const grid = guesses
    .map((guess) => scoreGuess(guess, answer).map((s) => emoji[s]).join(''))
    .join('\n');
  const score = `${won ? guesses.length : 'X'}/${MAX_GUESSES}${hardMode ? '*' : ''}`;
  return `Wordle 2023 ${score}${hintUsed ? ' 💡' : ''}\n\n${grid}\nhttps://wordle2023.vercel.app`;
}

export const WIN_MESSAGES = ['Genius!', 'Magnificent!', 'Impressive!', 'Splendid!', 'Great!', 'Phew!'];
