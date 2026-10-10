import React from 'react'
import { MAX_GUESSES, WORD_LENGTH, scoreGuess } from '../../lib/game'
import './Blocks.css'

const STATE_LABEL = { correct: 'correct', present: 'in the word, wrong spot', absent: 'not in the word' }

export const Block = ({ letter = '', state, index = 0 }) => {
    const className = state ? `block ${state}` : letter ? 'block filled' : 'block'
    return (
        <div className={className} style={{ '--i': index }}>
            {letter}
            {state && <span className='srOnly'>{`, ${STATE_LABEL[state]}`}</span>}
        </div>
    )
}

const Row = ({ word = '', states, className = '', onAnimationEnd }) => {
    const letters = Array.from({ length: WORD_LENGTH }, (_, i) => word[i] || '')
    return (
        <div className={`blocksCon ${className}`} onAnimationEnd={onAnimationEnd}>
            {letters.map((letter, index) => (
                <Block key={index} index={index} letter={letter} state={states && states[index]} />
            ))}
        </div>
    )
}

const Blocks = ({ guesses, current, answer, revealRow, winRow, shake, onShakeEnd }) => {
    const rows = []
    for (let i = 0; i < MAX_GUESSES; i++) {
        if (i < guesses.length) {
            const className = i === revealRow ? 'reveal' : i === winRow ? 'win' : ''
            rows.push(<Row key={i} word={guesses[i]} states={scoreGuess(guesses[i], answer)} className={className} />)
        } else if (i === guesses.length) {
            rows.push(
                <Row
                    key={i}
                    word={current}
                    className={shake ? 'shake' : ''}
                    onAnimationEnd={(e) => e.animationName === 'shake' && onShakeEnd()}
                />
            )
        } else {
            rows.push(<Row key={i} />)
        }
    }

    return (
        <div className='board' role='group' aria-label='Guesses'>
            {rows}
        </div>
    )
}

export default Blocks
