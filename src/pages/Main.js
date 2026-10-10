import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useGameContext } from '../components/context/GameProvider'
import { useSettingContext } from '../components/context/SettingProvider'
import KeyBoard from '../components/KeyBoard/KeyBoard'
import Blocks from '../components/displayBlocks/Blocks'
import HintBar from '../components/hint/HintBar'
import Footer from '../components/footer/Footer'
import { useToast } from '../components/toast/Toast'
import { MAX_GUESSES, WIN_MESSAGES, WORD_LENGTH, hardModeError, letterStates } from '../lib/game'
import { lookupWord } from '../lib/dictionary'
import { isValidWord, loadDictionary } from '../lib/words'

const FLIP_STEP = 300
const FLIP_MS = 500

const reducedMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

const toKey = (e) => {
    if (e.key === 'Enter' || e.key === 'Backspace') return e.key
    return /^[a-z]$/i.test(e.key) ? e.key.toLowerCase() : null
}

const Main = () => {
    const { game, typeLetter, deleteLetter, submitGuess, revealHint, newGame, statsOpen, openStats } = useGameContext()
    const { hardMode, wordCheck, showHint } = useSettingContext()
    const showToast = useToast()

    const [revealRow, setRevealRow] = useState(null)
    const [winRow, setWinRow] = useState(null)
    const [shake, setShake] = useState(false)
    const [checking, setChecking] = useState(false)
    const [pressedKey, setPressedKey] = useState(null)

    const timers = useRef(new Set())
    const later = useCallback((fn, ms) => {
        const id = setTimeout(() => {
            timers.current.delete(id)
            fn()
        }, ms)
        timers.current.add(id)
    }, [])
    useEffect(() => {
        const pending = timers.current
        return () => pending.forEach(clearTimeout)
    }, [])

    // Warm up the guess dictionary and the answer's definition before they're needed.
    useEffect(() => {
        if (wordCheck) loadDictionary().catch(() => {})
    }, [wordCheck])
    useEffect(() => {
        lookupWord(game.answer).catch(() => {})
        setWinRow(null)
    }, [game.answer])

    const reject = useCallback((message) => {
        showToast(message)
        setShake(true)
    }, [showToast])

    const submit = async () => {
        const { guesses, current: word, answer } = game
        if (word.length < WORD_LENGTH) return reject('Not enough letters')
        if (hardMode) {
            const error = hardModeError(word, guesses, answer)
            if (error) return reject(error)
        }
        if (wordCheck) {
            setChecking(true)
            const valid = await isValidWord(word)
            setChecking(false)
            if (!valid) return reject('Not in word list')
        }

        const row = guesses.length
        const won = word === answer
        const lost = !won && row + 1 >= MAX_GUESSES
        submitGuess(word)
        setRevealRow(row)
        later(() => {
            setRevealRow(null)
            if (won) {
                setWinRow(row)
                showToast(WIN_MESSAGES[row], 2000)
            }
            if (lost) showToast(answer.toUpperCase(), 2500)
            if (won || lost) later(openStats, 1600)
        }, reducedMotion() ? 0 : FLIP_STEP * (WORD_LENGTH - 1) + FLIP_MS)
    }

    const handleKey = (key) => {
        if (statsOpen || checking || revealRow !== null || game.status !== 'playing') return
        if (key === 'Enter') submit()
        else if (key === 'Backspace') deleteLetter()
        else typeLetter(key)
    }
    const handleKeyRef = useRef(handleKey)
    handleKeyRef.current = handleKey

    const flash = useCallback((key) => {
        setPressedKey(key)
        later(() => setPressedKey((k) => (k === key ? null : k)), 120)
    }, [later])

    const onScreenKey = useCallback((key) => {
        flash(key)
        handleKeyRef.current(key)
    }, [flash])

    useEffect(() => {
        // A control reached with Tab gets its own Enter; one that was merely clicked
        // must not swallow the Enter meant to submit the guess.
        let tabbed = false
        const onPointerDown = () => {
            tabbed = false
        }
        const onKeyDown = (e) => {
            if (e.key === 'Tab') tabbed = true
            if (e.ctrlKey || e.metaKey || e.altKey) return
            const target = e.target instanceof Element ? e.target : null
            if (target && target.closest('dialog')) return // the open modal handles its own keys
            const key = toKey(e)
            if (!key || (key === 'Enter' && e.repeat)) return
            if (key === 'Enter' && tabbed && target && target.closest('button, a, input, select, textarea')) return
            e.preventDefault()
            flash(key)
            handleKeyRef.current(key)
        }
        window.addEventListener('pointerdown', onPointerDown, true)
        window.addEventListener('keydown', onKeyDown)
        return () => {
            window.removeEventListener('pointerdown', onPointerDown, true)
            window.removeEventListener('keydown', onKeyDown)
        }
    }, [flash])

    // Keyboard colours catch up only after a row has finished flipping.
    const keyStates = useMemo(
        () => letterStates(revealRow === null ? game.guesses : game.guesses.slice(0, revealRow), game.answer),
        [game.guesses, game.answer, revealRow]
    )

    const finished = game.status !== 'playing'

    return (
        <main className='game'>
            <div className='boardWrap'>
                <Blocks
                    guesses={game.guesses}
                    current={game.current}
                    answer={game.answer}
                    revealRow={revealRow}
                    winRow={winRow}
                    shake={shake}
                    onShakeEnd={() => setShake(false)}
                />
            </div>
            <div className='gameBar'>
                {finished && revealRow === null ? (
                    <>
                        <button type='button' className='btn' onClick={openStats}>Results</button>
                        <button type='button' className='btn primary' onClick={newGame}>Play again</button>
                    </>
                ) : (!finished && showHint && (
                    <HintBar answer={game.answer} hintsShown={game.hintsShown} onReveal={revealHint} />
                ))}
            </div>
            <KeyBoard letterStates={keyStates} pressedKey={pressedKey} onKey={onScreenKey} />
            <Footer isMain={true} />
        </main>
    )
}

export default Main
