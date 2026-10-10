# Wordle 2023

A responsive Wordle clone built with React. Guess the five-letter word in six tries, on a phone or a desktop.

**Live:** https://wordle2023.vercel.app

## Features

- On-screen keyboard that colours keys as you learn letters, plus full physical keyboard support
- Dictionary hints: tap **Show hint** for a definition of the answer (the answer itself is masked out), and cycle through more definitions
- Learn the word: when a game ends you see its meaning and can hear it pronounced
- Statistics: games played, win rate, streaks and guess distribution
- Share your result as an emoji grid
- Hard mode, word check and a high-contrast colour mode
- Your game and stats are saved, so reloading or visiting Settings doesn't lose progress
- Tile flip, shake and bounce animations (reduced when the OS asks for less motion)

## How hints work

Definitions come from the free [Dictionary API](https://dictionaryapi.dev/), with [Datamuse](https://www.datamuse.com/api/) as a fast fallback. Both are queried in parallel: the Dictionary API is preferred when it answers quickly, otherwise Datamuse is used. Every answer in the word list has a Datamuse definition.

## Word lists

- `src/data/answers.js`: possible answers (common words, offensive ones removed)
- `src/data/guesses.js`: extra words accepted as guesses, from the MIT-licensed [word-list](https://github.com/sindresorhus/word-list) package. It is code-split and loaded on first use.

## Development

```bash
npm install
npm start      # dev server on http://localhost:3000
npm test       # unit and UI tests
npm run build  # production build in build/
```

Developed by Lynnze.
