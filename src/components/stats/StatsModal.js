import React, { useEffect, useState } from 'react'
import { FaShareAlt, FaVolumeUp } from 'react-icons/fa'
import { useLocation, useNavigate } from 'react-router-dom'
import { useGameContext } from '../context/GameProvider'
import { useSettingContext } from '../context/SettingProvider'
import Modal from '../modal/Modal'
import { Block } from '../displayBlocks/Blocks'
import { WIN_MESSAGES, shareText } from '../../lib/game'
import { canSpeak, speak } from '../../lib/dictionary'
import useWordInfo from '../../lib/useWordInfo'
import './StatsModal.css'

const WordCard = ({ word }) => {
    const { status, info, retry } = useWordInfo(word)

    return (
        <section className='wordCard' aria-label='What the word means'>
            <div className='wordTiles' aria-label={word}>
                {word.split('').map((letter, i) => <Block key={i} index={i} letter={letter} state='correct' />)}
            </div>
            <div className='wordMeta'>
                {info && info.phonetic && <span className='phonetic'>{info.phonetic}</span>}
                {canSpeak() && (
                    <button type='button' className='speakButton' onClick={() => speak(word)} aria-label={`Pronounce ${word}`}>
                        <FaVolumeUp aria-hidden /> Listen
                    </button>
                )}
            </div>
            {status === 'loading' && <p className='wordNote'>Looking up the meaning…</p>}
            {status === 'missing' && <p className='wordNote'>No dictionary entry for this word.</p>}
            {status === 'error' && (
                <p className='wordNote'>
                    Couldn't reach the dictionary.{' '}
                    <button type='button' className='linkButton' onClick={retry}>Try again</button>
                </p>
            )}
            {status === 'ready' && (
                <ol className='definitions'>
                    {info.definitions.slice(0, 3).map((d, i) => (
                        <li key={i}>
                            {d.partOfSpeech && <span className='pos'>{d.partOfSpeech}</span>}
                            {d.text}
                        </li>
                    ))}
                </ol>
            )}
            <a className='moreLink' href={`https://en.wiktionary.org/wiki/${word}`} target='_blank' rel='noreferrer'>
                More on Wiktionary ↗
            </a>
        </section>
    )
}

// The async Clipboard API can be blocked (embedded frames, older Safari); fall back
// to a hidden textarea inside the dialog, since everything outside a modal is inert.
const copyText = async (text, container) => {
    try {
        await navigator.clipboard.writeText(text)
        return true
    } catch {
        const area = document.createElement('textarea')
        area.value = text
        area.setAttribute('readonly', '')
        area.style.position = 'fixed'
        area.style.opacity = '0'
        container.appendChild(area)
        area.select()
        const copied = document.execCommand('copy')
        area.remove()
        return copied
    }
}

const StatsModal = () => {
    const { game, stats, statsOpen, closeStats, newGame } = useGameContext()
    const { hardMode, colorBlind } = useSettingContext()
    const navigate = useNavigate()
    const { pathname } = useLocation()
    const [shareNote, setShareNote] = useState('')

    useEffect(() => {
        if (!shareNote) return
        const t = setTimeout(() => setShareNote(''), 2000)
        return () => clearTimeout(t)
    }, [shareNote])

    const finished = game.status !== 'playing'
    const won = game.status === 'won'
    const winRate = stats.played ? Math.round((stats.wins / stats.played) * 100) : 0
    const most = Math.max(1, ...stats.distribution)
    const currentRow = won ? game.guesses.length - 1 : -1

    const playAgain = () => {
        newGame()
        if (pathname !== '/') navigate('/')
    }

    const share = async (e) => {
        const container = e.currentTarget.closest('dialog') || document.body
        const text = shareText({
            guesses: game.guesses,
            answer: game.answer,
            won,
            hardMode,
            hintUsed: game.hintsShown > 0,
            colorBlind,
        })
        try {
            const touch = window.matchMedia && window.matchMedia('(pointer: coarse)').matches
            if (touch && navigator.share) {
                await navigator.share({ text })
                return
            }
        } catch (err) {
            if (err && err.name === 'AbortError') return // user closed the share sheet
        }
        setShareNote((await copyText(text, container)) ? 'Copied to clipboard' : "Couldn't copy")
    }

    return (
        <Modal open={statsOpen} onClose={closeStats} labelledBy='stats-title'>
            {finished && (
                <div className='result'>
                    <p className='resultTitle'>{won ? WIN_MESSAGES[game.guesses.length - 1] : 'Out of guesses'}</p>
                    <p className='resultSub'>
                        {won ? `Solved in ${game.guesses.length}/6${game.hintsShown ? ' with a hint' : ''}` : 'The word was'}
                    </p>
                    <WordCard word={game.answer} />
                </div>
            )}

            <h2 id='stats-title' className='modalTitle'>Statistics</h2>
            <dl className='statsGrid'>
                <div><dt>Played</dt><dd>{stats.played}</dd></div>
                <div><dt>Win %</dt><dd>{winRate}</dd></div>
                <div><dt>Current streak</dt><dd>{stats.streak}</dd></div>
                <div><dt>Max streak</dt><dd>{stats.maxStreak}</dd></div>
            </dl>

            <h3 className='modalSubtitle'>Guess distribution</h3>
            {stats.wins === 0 ? (
                <p className='wordNote'>Win a game to see your distribution.</p>
            ) : (
                <div className='distribution'>
                    {stats.distribution.map((count, i) => (
                        <div className='distRow' key={i}>
                            <span className='distLabel'>{i + 1}</span>
                            <div className='distTrack'>
                                <div
                                    className={`distBar${i === currentRow ? ' current' : ''}`}
                                    style={{ width: `${Math.max(7, (count / most) * 100)}%` }}
                                >
                                    {count}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {finished ? (
                <div className='modalActions'>
                    <button type='button' className='btn' onClick={share}>
                        <FaShareAlt aria-hidden /> {shareNote || 'Share'}
                    </button>
                    <button type='button' className='btn primary' onClick={playAgain} data-autofocus>
                        Play again
                    </button>
                </div>
            ) : (
                <div className='modalActions'>
                    <button type='button' className='btn primary' onClick={closeStats} data-autofocus>
                        Back to game
                    </button>
                </div>
            )}
        </Modal>
    )
}

export default StatsModal
