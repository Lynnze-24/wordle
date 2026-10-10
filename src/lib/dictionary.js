// Looks up definitions for hints and the end-of-game "learn the word" card.
//
// The free Dictionary API (dictionaryapi.dev) has the nicest data but its
// origin often hangs for 20s+ or answers 5xx. Datamuse serves similar
// Wiktionary definitions quickly. Both are queried in parallel: the
// Dictionary API wins if it answers within PREFER_MS, otherwise whichever
// source succeeds first is used.

const DICTIONARY_API = 'https://api.dictionaryapi.dev/api/v2/entries/en/';
const DATAMUSE_API = 'https://api.datamuse.com/words';
const PREFER_MS = 2500;
const TIMEOUT_MS = 10000;
const MAX_DEFINITIONS = 6;

const POS = { n: 'noun', v: 'verb', adj: 'adjective', adv: 'adverb' };
const LOW_VALUE_TAG = /obsolete|archaic|rare|dialect|historical|slang|vulgar|derogatory|offensive|dated|nonstandard|informal/i;
const POINTER = /^(?:(?:alternative|obsolete|archaic|dated|nonstandard)\s+(?:form|spelling)|misspelling|abbreviation|initialism|acronym|ellipsis|only used in)\b/i;
// Encyclopedia-style entries ("A surname.", "A placename", "A town in Wales.") make useless hints.
const PROPER = /\b(?:surname|given name|family name|placename|place name|toponym)\b|^an? (?:[a-z-]+ )?(?:city|town|village|hamlet|river|county|municipality|suburb|parish|commune|place|community|locality)\b.*\bin\b/i;
const INFLECTION = /^(?:(?:the\s+)?plural|.*\b(?:past|present|participle|singular|comparative|superlative)\b).*?\bof\s+["“]?([a-z]+)["”]?\.?$/i;

const cache = new Map();
const resolved = new Map();

export function lookupWord(word) {
  if (!cache.has(word)) {
    const request = fetchWordInfo(word).then(
      (info) => {
        resolved.set(word, info);
        return info;
      },
      (err) => {
        cache.delete(word); // let a retry hit the network again
        throw err;
      }
    );
    cache.set(word, request);
  }
  return cache.get(word);
}

// Synchronous read of an already-fetched entry, to render without a loading flash.
export function peekWord(word) {
  return resolved.get(word) || null;
}

async function fetchWordInfo(word, depth = 0) {
  const primary = timed(fromDictionaryApi, word);
  const backup = timed(fromDatamuse, word);
  backup.catch(() => {}); // may never be awaited
  let info;
  try {
    info = await Promise.race([primary, delay(PREFER_MS).then(() => Promise.reject(new Error('slow')))]);
  } catch {
    info = await firstSuccess([primary, backup]);
  }

  // Plurals and past tenses often only say "plural of zone": borrow the base word's meaning.
  const inflection = info.definitions.every((d) => d.inflectionOf) && info.definitions[0];
  if (inflection && depth === 0) {
    try {
      const base = await fetchWordInfo(inflection.inflectionOf, 1);
      const label = inflectionLabel(inflection.text);
      info.definitions = base.definitions.map((d) => ({
        partOfSpeech: d.partOfSpeech,
        text: `${label} of a word meaning “${d.text.replace(/\.$/, '')}”.`,
      }));
    } catch {
      // keep the "plural of …" definitions
    }
  }
  return info;
}

async function fromDictionaryApi(word, signal) {
  const res = await fetch(DICTIONARY_API + encodeURIComponent(word), { signal });
  if (res.status === 404) throw notFound('Dictionary API: no entry');
  if (!res.ok) throw new Error(`Dictionary API ${res.status}`);
  const entries = await res.json();
  if (!Array.isArray(entries)) throw new Error('Dictionary API: unexpected response');

  const raw = entries.flatMap((entry) =>
    (entry.meanings || []).flatMap((m) =>
      (m.definitions || []).map((d) => ({ partOfSpeech: m.partOfSpeech || '', text: d.definition || '' }))
    )
  );
  const phonetic = entries
    .flatMap((e) => [e.phonetic, ...(e.phonetics || []).map((p) => p.text)])
    .find(Boolean);
  return { word, phonetic, definitions: rank(raw) };
}

// Datamuse sometimes only knows an inflected word as a name ("seals") or by a
// single odd sense ("edges", "for keeps"); then the base word gives a better hint.
async function fromDatamuse(word, signal) {
  let best = null;
  let bestScore = Infinity;
  for (const candidate of [word, ...baseForms(word)]) {
    try {
      const definitions = rank(await datamuseEntry(candidate, signal));
      const score = (definitions[0].penalty >= 3 ? 2 : 0) + (definitions.length < 2 ? 1 : 0);
      if (score < bestScore) {
        best = definitions;
        bestScore = score;
      }
    } catch (err) {
      if (!err.notFound) throw err;
    }
    if (bestScore === 0) break;
  }
  if (!best) throw notFound('Datamuse: no definitions');
  return { word, definitions: best };
}

async function datamuseEntry(word, signal) {
  const res = await fetch(`${DATAMUSE_API}?sp=${encodeURIComponent(word)}&md=d&max=1`, { signal });
  if (!res.ok) throw new Error(`Datamuse ${res.status}`);
  const [hit] = await res.json();
  if (!hit || hit.word.toLowerCase() !== word || !hit.defs) throw notFound('Datamuse: no entry');
  return hit.defs
    .map((d) => d.split('\t'))
    .filter(([pos]) => pos !== 'N') // capital N = proper noun (films, bands…)
    .map(([pos, text]) => ({ partOfSpeech: POS[pos] || '', text: text || '' }));
}

// "seals" -> seal; "aches" -> ache, ach; "acted" -> act, acte
function baseForms(word) {
  const forms = [];
  if (word.endsWith('s') && !word.endsWith('ss')) forms.push(word.slice(0, -1));
  if (word.endsWith('es')) forms.push(word.slice(0, -2));
  if (word.endsWith('ed')) forms.push(word.slice(0, -2), word.slice(0, -1));
  return forms.filter((w) => w.length >= 3);
}

// Cleans definitions and moves weak ones (obsolete, slang, cross-references) to the back.
// Otherwise the source's order is kept: it lists the most common sense first.
function rank(raw) {
  const seen = new Set();
  const scored = [];
  raw.forEach(({ partOfSpeech, text }, order) => {
    let rest = text.trim();
    // "Alternative spelling of briar. [Any of many plants…]": the bracket holds the meaning.
    const referenced = rest.match(/\[([^\]]+)\]\s*$/);
    if (referenced) rest = referenced[1].trim();
    let tags = '';
    let tag;
    while ((tag = rest.match(/^\(([^)]*)\)\s*/))) {
      tags += ` ${tag[1]}`;
      rest = rest.slice(tag[0].length);
    }
    rest = rest.replace(/\s+/g, ' ').trim();
    // "Certain insects:" style headers introduce a sub-list we don't get.
    if (rest.length < 3 || rest.endsWith(':') || PROPER.test(rest) || seen.has(rest.toLowerCase())) return;
    seen.add(rest.toLowerCase());

    const inflection = rest.length < 90 && rest.match(INFLECTION);
    let penalty = 0;
    if (LOW_VALUE_TAG.test(tags)) penalty += 2;
    if (POINTER.test(rest) || inflection) penalty += 3;
    if (/\b[A-Z]{2,}\b/.test(rest)) penalty += 3; // acronyms, e.g. "ACT New Zealand"
    if (rest.length < 15) penalty += 1;

    const cleaned = rest.charAt(0).toUpperCase() + rest.slice(1);
    scored.push({ partOfSpeech, text: cleaned, inflectionOf: inflection ? inflection[1].toLowerCase() : null, penalty, order });
  });
  if (!scored.length) throw notFound('No usable definitions');
  return scored
    .sort((a, b) => a.penalty - b.penalty || a.order - b.order)
    .slice(0, MAX_DEFINITIONS)
    .map(({ order, ...d }) => d);
}

function inflectionLabel(text) {
  if (/plural/i.test(text)) return 'Plural';
  if (/past/i.test(text)) return 'Past tense';
  if (/present participle/i.test(text)) return 'The -ing form';
  if (/singular|present/i.test(text)) return 'Present tense';
  return 'A form';
}

const SUFFIXES = ['es', 'ed', 'er', 's', 'd', 'r', 'y', 'e'];

// Roots a related word would start with: "tiger" -> tige, tig ("tigress").
function roots(word) {
  const list = [word.slice(0, 4)];
  SUFFIXES.forEach((suffix) => {
    if (word.endsWith(suffix) && word.length - suffix.length >= 3) list.push(word.slice(0, -suffix.length));
  });
  return list;
}

// Hides the answer (and words built on it) inside a hint.
export function maskWord(text, word) {
  const stems = roots(word);
  return text.replace(/[A-Za-z]+/g, (token) => {
    const t = token.toLowerCase();
    const giveaway = t.includes(word) ||
      (t.length >= 3 && stems.some((stem) => t.startsWith(stem))) ||
      (t.length >= 4 && word.startsWith(t));
    return giveaway ? '_'.repeat(token.length) : token;
  });
}

export function canSpeak() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function speak(word) {
  if (!canSpeak()) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = 'en-US';
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
}

function timed(source, word) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  return source(word, controller.signal).finally(() => clearTimeout(timer));
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Errors flagged notFound mean "the dictionary answered, but has nothing";
// anything else is a network/server problem worth retrying.
function notFound(message) {
  const err = new Error(message);
  err.notFound = true;
  return err;
}

function firstSuccess(promises) {
  return new Promise((resolve, reject) => {
    const errors = [];
    promises.forEach((p) =>
      p.then(resolve, (err) => {
        errors.push(err);
        if (errors.length === promises.length) {
          reject(errors.find((e) => !e.notFound) || notFound('No dictionary entry'));
        }
      })
    );
  });
}
