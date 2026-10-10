import React from 'react'
import KeyBlocks from '../keyBlocks/KeyBlocks'
import './KeyBoard.css'

const list = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm']

const KeyBoard = ({ letterStates, pressedKey, onKey }) => {
    return (
        <div className='KeyBoard' role='group' aria-label='Keyboard'>
            {list.map((item, index) => (
                <KeyBlocks
                    key={item}
                    keyList={item}
                    isMiddle={index === 1}
                    isLast={index === list.length - 1}
                    letterStates={letterStates}
                    pressedKey={pressedKey}
                    onKey={onKey}
                />
            ))}
        </div>
    )
}

export default KeyBoard
