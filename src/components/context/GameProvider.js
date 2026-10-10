import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react'
import { MAX_GUESSES, WORD_LENGTH } from '../../lib/game'
import { loadJSON, saveJSON } from '../../lib/storage'
import { randomAnswer } from '../../lib/words'

// Game and stats live above the router, so visiting Settings or How to Play
// no longer throws away the game in progress; both survive reloads too.
const GAME_KEY = 'wordle-game'
const STATS_KEY = 'wordle-stats'
const RECENT_LIMIT = 300

const GameContext = createContext()

export const useGameContext = () => {
    return useContext(GameContext)
}

const EMPTY_STATS = { played: 0, wins: 0, streak: 0, maxStreak: 0, distribution: Array(MAX_GUESSES).fill(0) }

const freshGame = (answer, recent = []) => ({
    answer,
    guesses: [],
    current: '',
    status: 'playing',
    hintsShown: 0,
    recent: [answer, ...recent.filter((w) => w !== answer)].slice(0, RECENT_LIMIT),
})

const isSavedGame = (g) =>
    g && typeof g.answer === 'string' && g.answer.length === WORD_LENGTH &&
    Array.isArray(g.guesses) && ['playing', 'won', 'lost'].includes(g.status)

const init = () => {
    const saved = loadJSON(GAME_KEY, null)
    const game = isSavedGame(saved)
        ? {
            ...freshGame(saved.answer, saved.recent),
            guesses: saved.guesses,
            current: typeof saved.current === 'string' ? saved.current : '',
            status: saved.status,
            hintsShown: saved.hintsShown || 0,
        }
        : freshGame(randomAnswer())
    return { game, stats: { ...EMPTY_STATS, ...loadJSON(STATS_KEY, {}) } }
}

function reducer(state, action) {
    const { game, stats } = state
    switch (action.type) {
        case 'type':
            if (game.status !== 'playing' || game.current.length >= WORD_LENGTH) return state
            return { ...state, game: { ...game, current: game.current + action.letter } }
        case 'delete':
            if (game.status !== 'playing' || !game.current) return state
            return { ...state, game: { ...game, current: game.current.slice(0, -1) } }
        case 'submit': {
            if (game.status !== 'playing' || game.current !== action.word) return state
            const guesses = [...game.guesses, action.word]
            const won = action.word === game.answer
            const status = won ? 'won' : guesses.length >= MAX_GUESSES ? 'lost' : 'playing'
            if (status === 'playing') return { ...state, game: { ...game, guesses, current: '' } }

            const distribution = [...stats.distribution]
            if (won) distribution[guesses.length - 1]++
            const streak = won ? stats.streak + 1 : 0
            return {
                game: { ...game, guesses, current: '', status },
                stats: {
                    played: stats.played + 1,
                    wins: stats.wins + (won ? 1 : 0),
                    streak,
                    maxStreak: Math.max(stats.maxStreak, streak),
                    distribution,
                },
            }
        }
        case 'hint':
            return { ...state, game: { ...game, hintsShown: game.hintsShown + 1 } }
        case 'new':
            // The random value comes in on the action to keep the reducer pure.
            return { ...state, game: freshGame(randomAnswer(game.recent, action.random), game.recent) }
        default:
            return state
    }
}

const GameProvider = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, undefined, init)
    const [statsOpen, setStatsOpen] = useState(false)

    useEffect(() => {
        saveJSON(GAME_KEY, state.game)
        saveJSON(STATS_KEY, state.stats)
    }, [state])

    const typeLetter = useCallback((letter) => dispatch({ type: 'type', letter }), [])
    const deleteLetter = useCallback(() => dispatch({ type: 'delete' }), [])
    const submitGuess = useCallback((word) => dispatch({ type: 'submit', word }), [])
    const revealHint = useCallback(() => dispatch({ type: 'hint' }), [])
    const newGame = useCallback(() => {
        setStatsOpen(false)
        dispatch({ type: 'new', random: Math.random() })
    }, [])
    const openStats = useCallback(() => setStatsOpen(true), [])
    const closeStats = useCallback(() => setStatsOpen(false), [])

    const value = useMemo(() => ({
        game: state.game,
        stats: state.stats,
        typeLetter,
        deleteLetter,
        submitGuess,
        revealHint,
        newGame,
        statsOpen,
        openStats,
        closeStats,
    }), [state, typeLetter, deleteLetter, submitGuess, revealHint, newGame, statsOpen, openStats, closeStats])

    return (
        <GameContext.Provider value={value}>
            {children}
        </GameContext.Provider>
    )
}

export default GameProvider
