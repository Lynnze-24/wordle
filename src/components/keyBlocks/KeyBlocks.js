import React from 'react'
import { FaBackspace } from 'react-icons/fa'
import './KeyBlocks.css'

const STATE_LABEL = { correct: 'correct', present: 'in the word', absent: 'not in the word' }

// Keep focus where it is on mouse clicks, so a later physical Enter submits
// the guess instead of re-clicking the last on-screen key.
const keepFocus = (e) => e.preventDefault()

const KeyBlock = ({ keyItem, state, pressed, onKey }) => {
    const isWide = keyItem === 'Enter' || keyItem === 'Backspace'
    const label = keyItem === 'Backspace'
        ? 'Delete letter'
        : keyItem === 'Enter'
            ? 'Submit guess'
            : `${keyItem.toUpperCase()}${state ? `, ${STATE_LABEL[state]}` : ''}`

    return (
        <button
            type='button'
            className={`KeyBlock${isWide ? ' wide' : ''}${state ? ` ${state}` : ''}${pressed ? ' pressed' : ''}`}
            aria-label={label}
            onMouseDown={keepFocus}
            onClick={() => onKey(keyItem)}
        >
            {keyItem === 'Backspace' ? <FaBackspace aria-hidden /> : keyItem}
        </button>
    )
}

const KeyBlocks = ({ keyList, isMiddle, isLast, letterStates, pressedKey, onKey }) => {
    const keyListArr = isLast ? ['Enter', ...keyList.split(''), 'Backspace'] : keyList.split('')

    return (
        <div className='KeyBlocks'>
            {isMiddle && <span className='keySpacer' />}
            {keyListArr.map((keyItem) => (
                <KeyBlock
                    key={keyItem}
                    keyItem={keyItem}
                    state={letterStates[keyItem]}
                    pressed={pressedKey === keyItem}
                    onKey={onKey}
                />
            ))}
            {isMiddle && <span className='keySpacer' />}
        </div>
    )
}

export default KeyBlocks
