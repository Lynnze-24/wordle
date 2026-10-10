import { useCallback, useEffect, useState } from 'react';
import { lookupWord, peekWord } from './dictionary';

// { status: 'loading' | 'ready' | 'missing' | 'error', info, retry } for a word's dictionary entry.
// 'missing' = the dictionaries answered but have no entry; 'error' = couldn't reach them.
export default function useWordInfo(word) {
  const [result, setResult] = useState(() => ({ word, info: peekWord(word), error: null }));
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    const cached = peekWord(word);
    setResult({ word, info: cached, error: null });
    if (!cached) {
      lookupWord(word).then(
        (info) => active && setResult({ word, info, error: null }),
        (error) => active && setResult({ word, info: null, error })
      );
    }
    return () => {
      active = false;
    };
  }, [word, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  const current = result.word === word ? result : { info: peekWord(word), error: null };
  const status = current.info
    ? 'ready'
    : current.error
      ? (current.error.notFound ? 'missing' : 'error')
      : 'loading';
  return { status, info: current.info, retry };
}
