import { lookupWord, maskWord } from './dictionary';

test('maskWord hides the answer and words built from it', () => {
  expect(maskWord('A male tiger; as opposed to a tigress.', 'tiger')).toBe('A male _____; as opposed to a _______.');
  expect(maskWord('Plural of zone.', 'zones')).toBe('Plural of ____.');
  expect(maskWord('Any bird of the family Gruidae.', 'crane')).toBe('Any bird of the family Gruidae.');
  expect(maskWord('To do something; the act of acting.', 'acted')).toBe('To do something; the ___ of ______.');
  expect(maskWord('Located in or near the place.', 'there')).toBe('Located in or near the place.');
});

const json = (body, ok = true, status = 200) => Promise.resolve({ ok, status, json: () => Promise.resolve(body) });

describe('lookupWord', () => {
  test('uses the Dictionary API when it answers', async () => {
    global.fetch = jest.fn((url) =>
      url.includes('dictionaryapi')
        ? json([{ phonetic: '/kɹeɪn/', meanings: [{ partOfSpeech: 'noun', definitions: [{ definition: 'A large wading bird.' }] }] }])
        : json([{ word: 'crane', defs: ['n\tA lifting machine.'] }])
    );
    const info = await lookupWord('crane');
    expect(info.phonetic).toBe('/kɹeɪn/');
    expect(info.definitions[0]).toMatchObject({ partOfSpeech: 'noun', text: 'A large wading bird.' });
  });

  test('skips names and places, and falls back to the base word', async () => {
    global.fetch = jest.fn((url) => {
      if (url.includes('dictionaryapi')) return json({}, false, 404);
      if (url.includes('sp=seals')) {
        return json([{ word: 'seals', defs: ['n\tAn unincorporated community in Georgia, United States.', 'n\tA Cornish habitational surname.'] }]);
      }
      if (url.includes('sp=seal&')) return json([{ word: 'seal', defs: ['n\tA pinniped, a marine mammal with flippers.'] }]);
      return json([]);
    });
    const info = await lookupWord('seals');
    expect(info.definitions.map((d) => d.text)).toEqual(['A pinniped, a marine mammal with flippers.']);
  });

  test('uses the meaning in brackets for spelling cross-references', async () => {
    global.fetch = jest.fn((url) =>
      url.includes('dictionaryapi')
        ? json({}, false, 404)
        : json([{ word: 'brier', defs: ['n\tA surname.', 'n\tAlternative spelling of briar. [Any of many plants with thorny stems.]'] }])
    );
    const info = await lookupWord('brier');
    expect(info.definitions[0].text).toBe('Any of many plants with thorny stems.');
  });

  test('falls back to Datamuse when the Dictionary API fails, and keeps the answer', async () => {
    global.fetch = jest.fn((url) =>
      url.includes('dictionaryapi')
        ? json({ title: 'error' }, false, 522)
        : json([{ word: 'ghost', defs: ['N\tGhost is a 1990 film.', 'n\t(obsolete) The soul.', 'n\tA disembodied soul.'] }])
    );
    const info = await lookupWord('ghost');
    expect(info.definitions.map((d) => d.text)).toEqual(['A disembodied soul.', 'The soul.']);
  });

  test('borrows the base word meaning for plain inflections', async () => {
    global.fetch = jest.fn((url) => {
      if (url.includes('dictionaryapi') && url.endsWith('/aches')) {
        return json([{ meanings: [{ partOfSpeech: 'verb', definitions: [{ definition: 'Third-person singular simple present indicative form of ache.' }] }] }]);
      }
      if (url.includes('dictionaryapi') && url.endsWith('/ache')) {
        return json([{ meanings: [{ partOfSpeech: 'noun', definitions: [{ definition: 'Continued dull pain.' }] }] }]);
      }
      return json([]);
    });
    const info = await lookupWord('aches');
    expect(info.definitions[0].text).toBe('Present tense of a word meaning “Continued dull pain”.');
  });

  test('rejects (and can be retried) when every source fails', async () => {
    global.fetch = jest.fn(() => Promise.reject(new TypeError('Failed to fetch')));
    await expect(lookupWord('brick')).rejects.toThrow();

    global.fetch = jest.fn((url) =>
      url.includes('dictionaryapi')
        ? json([{ meanings: [{ partOfSpeech: 'noun', definitions: [{ definition: 'A hardened block of clay.' }] }] }])
        : json([])
    );
    const info = await lookupWord('brick');
    expect(info.definitions[0].text).toBe('A hardened block of clay.');
  });
});
